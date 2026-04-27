from app.engines import RulesEngine, RoutingEngine
from app.agent import AgentEngine
import pytest

def test_routing_logic():
    # TEST: Ensure shortest queue is picked
    remaining = ['MRI', 'X-RAY']
    loads = {'MRI': 40, 'X-RAY': 10}
    best = RoutingEngine.get_optimal_next_test(remaining, loads)
    assert best == 'X-RAY'

def test_rules_engine():
    # TEST: Ensure medical protocols are correct
    inst = RulesEngine.get_instructions('BLOOD_TEST')
    assert "Fast" in inst[0]

@pytest.mark.asyncio
async def test_agent_reasoning():
    # TEST: Ensure agent can answer status queries
    patient = {"current_test": "MRI", "estimated_wait_time": 30}
    response = await AgentEngine.process_query(patient, "When is my test?")
    assert "30 mins" in response['message']
    assert "Fetched" in response['reasoning']
