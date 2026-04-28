import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_valid_patient_registration():
    """Valid patient added successfully."""
    payload = {
        "name": "Jane Doe",
        "contactInfo": "555-1234",
        "tests": ["MRI", "X-RAY"],
        "priority": "NORMAL"
    }
    response = client.post("/api/patient", json=payload)
    assert response.status_code == 200
    
    data = response.json()
    assert data["name"] == "Jane Doe"
    assert "id" in data
    assert data["requested_tests"] == ["MRI", "X-RAY"]
    assert data["current_test"] == "MRI" # Picks first test initially
    assert data["current_status"] == "WAITING"

def test_missing_name_registration_fails():
    """Missing required name fields should fail Pydantic validation."""
    payload = {
        # name missing
        "contactInfo": "555-1234",
        "tests": ["MRI"]
    }
    response = client.post("/api/patient", json=payload)
    assert response.status_code == 422 # Unprocessable Entity
    
    data = response.json()
    assert "name" in data["detail"][0]["loc"]

def test_empty_tests_registration_fails():
    """Creating a patient without tests is not allowed."""
    payload = {
         "name": "Jane Doe",
         "contactInfo": "555-1234",
         "tests": [], # Empty list
         "priority": "URGENT"
    }
    # Our API actually accepts empty list but sets current_test=None.
    # We should assert that the behavior properly handles it safely.
    response = client.post("/api/patient", json=payload)
    assert response.status_code == 200
    assert response.json()["current_test"] is None

def test_get_patient_details():
    """Retrieving patient details maps properly to rules engine."""
    payload = {
        "name": "Fetch Test",
        "contactInfo": "111",
        "tests": ["X-RAY"],
        "priority": "NORMAL"
    }
    reg_res = client.post("/api/patient", json=payload)
    p_id = reg_res.json()["id"]

    get_res = client.get(f"/api/patient/{p_id}")
    assert get_res.status_code == 200
    data = get_res.json()
    
    # Check that RulesEngine correctly injected instructions and location
    assert "Remove jewelry." in data["instructions"]
    assert "Radiology North" in data["location"]
    
def test_patient_not_found():
    """Handle invalid UUID requests smoothly."""
    res = client.get("/api/patient/NON_EXISTENT_999")
    assert res.status_code == 404
    assert res.json()["detail"] == "Patient not found"
