import pytest

# Mock Data / Helpers
def mock_patient(id, priority="NORMAL", age=30):
    return {
        "id": id,
        "priority": priority,
        "age": age,
        "tests": ["MRI"],
        "status": "WAITING"
    }

# This simulates an internal queue sorting logic that would exist in the system
def sort_queue(patients):
    # Order: EMERGENCY > URGENT > ELDERLY (age >= 65 and NORMAL) > NORMAL
    def get_sort_weight(p):
        if p["priority"] == "EMERGENCY": return 0
        if p["priority"] == "URGENT": return 1
        if p["priority"] == "NORMAL" and p.get("age", 0) >= 65: return 2
        return 3

    return sorted(patients, key=get_sort_weight)


def test_priority_hierarchy_ordering():
    """Ensure EMERGENCY > URGENT > ELDERLY > NORMAL."""
    p_normal = mock_patient("1", "NORMAL", 30)
    p_elderly = mock_patient("2", "NORMAL", 70)
    p_urgent = mock_patient("3", "URGENT", 40)
    p_emergency = mock_patient("4", "EMERGENCY", 25)

    queue = [p_normal, p_emergency, p_elderly, p_urgent]
    sorted_q = sort_queue(queue)

    assert sorted_q[0]["id"] == "4" # Emergency
    assert sorted_q[1]["id"] == "3" # Urgent
    assert sorted_q[2]["id"] == "2" # Elderly
    assert sorted_q[3]["id"] == "1" # Normal


def test_priority_elderly_handling():
    """Ensure age >= 65 boosts priority within NORMAL tier."""
    p_young = mock_patient("1", "NORMAL", 20)
    p_old = mock_patient("2", "NORMAL", 65)

    queue = [p_young, p_old]
    sorted_q = sort_queue(queue)

    assert sorted_q[0]["id"] == "2"
    assert sorted_q[1]["id"] == "1"

def test_priority_same_tier_stable_ordering():
    """Ensure patients of same priority are sorted strictly by arrival (stable sort)."""
    # Using python's built in sorted() which is stable
    p1 = mock_patient("1", "URGENT")
    p2 = mock_patient("2", "URGENT")
    p3 = mock_patient("3", "URGENT")
    queue = [p1, p2, p3]
    
    sorted_q = sort_queue(queue)
    
    assert sorted_q[0]["id"] == "1"
    assert sorted_q[1]["id"] == "2"
    assert sorted_q[2]["id"] == "3"
