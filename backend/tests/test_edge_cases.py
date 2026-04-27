import pytest
from app.engines import RoutingEngine
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_empty_queue_routing():
    """RoutingEngine safely handles an empty queue of required tests."""
    remaining_tests = []
    current_loads = {"MRI": 1, "X-RAY": 1}
    
    # Should safely return None
    assert RoutingEngine.get_optimal_next_test(remaining_tests, current_loads) is None

def test_all_offline_routing():
    """RoutingEngine correctly flags if absolutely all remaining tests are offline."""
    remaining_tests = ["MRI", "X-RAY"]
    current_loads = {"MRI": 0, "X-RAY": 0}
    offline = ["MRI", "X-RAY"]
    
    assert RoutingEngine.get_optimal_next_test(remaining_tests, current_loads, offline) == "ALL_OFFLINE"

def test_large_queue_stress():
    """Stress test routing logic over a large realistic mapping."""
    import random
    
    # Simulate a massive list of remaining tests (though unrealistic for one patient, 
    # it tests the min() calculation robustness)
    tests = ["MRI", "X-RAY", "BLOOD_TEST", "CT_SCAN", "ULTRASOUND"]
    remaining_tests = []
    
    # 10,000 requests in remaining queue
    for _ in range(10000):
        remaining_tests.append(random.choice(tests))
        
    # Put MRI securely at the lowest load (0), everything else at 1000
    mock_loads = {t: 1000 for t in tests}
    mock_loads["MRI"] = 0
    
    optimal = RoutingEngine.get_optimal_next_test(remaining_tests, mock_loads)
    # The absolute lowest load should mathematically be chosen perfectly even in O(N) array
    assert optimal == "MRI"

def test_all_urgent_patients():
    """When all patients are urgent, it operates successfully. (System doesn't crash)."""
    # Create 3 Urgent patients
    ids = []
    for _ in range(3):
        res = client.post("/api/patient", json={
            "name": "Urgent Patient", "contactInfo": "911", 
            "tests": ["MRI"], "priority": "URGENT"
        })
        ids.append(res.json()["id"])
        
    # Fetch all to ensure system generated wait states completely un-failing
    for pid in ids:
        r = client.get(f"/api/patient/{pid}")
        assert r.status_code == 200

def test_invalid_test_completion():
    """Ensure the system doesn't crash if an unknown test is submitted for completion."""
    res = client.post("/api/patient", json={
        "name": "Invalid Test", "contactInfo": "111", 
        "tests": ["MRI"], "priority": "NORMAL"
    })
    pid = res.json()["id"]
    
    res_comp = client.post(f"/api/queue/complete?patient_id={pid}&test_type=UNKNOWNSCAN")
    
    # Our API ignores test types that don't match, or simply processes it safely.
    # We assert it 200 handles it, and next_test is still MRI since UNKNOWNSCAN didn't pop "MRI".
    assert res_comp.status_code == 200
    assert "MRI" in res_comp.json()["next_test"]
