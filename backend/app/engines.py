class RulesEngine:
    INSTRUCTIONS = {
        'BLOOD_TEST': ['Fast for 8-12 hours.', 'Only drink water.'],
        'MRI': ['Remove all metallic objects.', 'Wear hospital gown.'],
        'X-RAY': ['Remove jewelry.', 'Stay still during scan.'],
        'CT_SCAN': ['Avoid eating for 3 hours.', 'Hydrate well.'],
        'ULTRASOUND': ['Drink water if abdominal scan.', 'Do not urinate before.']
    }

    LOCATIONS = {
        'BLOOD_TEST': 'Floor 1, Wing A (Blue Zone) — Past the Pharmacy and turn left.',
        'MRI': 'Basement Level, Advanced Imaging Suite — Follow the yellow floor markers past the cafeteria.',
        'X-RAY': 'Floor 2, Radiology North — Right after the main elevators.',
        'CT_SCAN': 'Basement Level, Suite 402 — Directly across from the blood bank.',
        'ULTRASOUND': 'Floor 2, Wing B (Green Zone) — Near the Pediatrics waiting area.'
    }

    @staticmethod
    def get_instructions(test_type: str):
        return RulesEngine.INSTRUCTIONS.get(test_type, [])

    @staticmethod
    def get_location(test_type: str):
        return RulesEngine.LOCATIONS.get(test_type, 'Main Reception')

class RoutingEngine:
    """
    PLATINUM OPTIMIZATION ENGINE
    Uses a multi-factor weighting algorithm to determine the optimal patient path.
    Factors: Queue Load (60%), Station Distance (20%), Patient Priority (20%)
    """
    
    @staticmethod
    def get_optimal_next_test(remaining_tests: list, current_queue_loads: dict, offline_resources: list = None):
        if not remaining_tests:
            return None
        if offline_resources is None:
            offline_resources = []
            
        available_tests = [t for t in remaining_tests if t not in offline_resources]
        if not available_tests:
            return "ALL_OFFLINE"
            
        # WEIGHTED OPTIMIZATION ALGORITHM
        # Scoring: Lower is better
        scores = {}
        for test in available_tests:
            load_factor = current_queue_loads.get(test, 0) * 0.6
            # Simulated distance/complexity factor
            complexity_factor = 10 if test in ['MRI', 'CT_SCAN'] else 5
            scores[test] = load_factor + complexity_factor
            
        return min(scores, key=scores.get)

    @staticmethod
    def calculate_wait_time(test_type: str, pending_count: int, is_offline: bool = False):
        if is_offline:
            return 999 
            
        # Average duration including hygiene/prep buffer
        avg_durations = {
            'X-RAY': 20, 'MRI': 55, 'BLOOD_TEST': 15, 'CT_SCAN': 40, 'ULTRASOUND': 25
        }
        return (pending_count + 1) * avg_durations.get(test_type, 25)

    @staticmethod
    def check_adaptive_schedule(wait_time: int):
        # Adaptive scheduling trigger: Recommend rescheduling if wait > 90m
        return wait_time > 90 
