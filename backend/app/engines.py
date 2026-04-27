class RulesEngine:
    INSTRUCTIONS = {
        'BLOOD_TEST': ['Fast for 8-12 hours.', 'Only drink water.'],
        'MRI': ['Remove all metallic objects.', 'Wear hospital gown.'],
        'X-RAY': ['Remove jewelry.', 'Stay still during scan.'],
        'CT_SCAN': ['Avoid eating for 3 hours.', 'Hydrate well.'],
        'ULTRASOUND': ['Drink water if abdominal scan.', 'Do not urinate before.']
    }

    LOCATIONS = {
        'BLOOD_TEST': 'Floor 1, Lab 1A',
        'MRI': 'Basement Level, Radiology',
        'X-RAY': 'Floor 2, Imaging Wing',
        'CT_SCAN': 'Basement Level, Radiology Next Door',
        'ULTRASOUND': 'Floor 2, Room 2B'
    }

    @staticmethod
    def get_instructions(test_type: str):
        return RulesEngine.INSTRUCTIONS.get(test_type, [])

    @staticmethod
    def get_location(test_type: str):
        return RulesEngine.LOCATIONS.get(test_type, 'Main Reception')

class RoutingEngine:
    @staticmethod
    def get_optimal_next_test(remaining_tests: list, current_queue_loads: dict, offline_resources: list = None):
        if not remaining_tests:
            return None
        if offline_resources is None:
            offline_resources = []
            
        # Filter out offline resources (Issue Resolution)
        available_tests = [t for t in remaining_tests if t not in offline_resources]
        if not available_tests:
            return "ALL_OFFLINE" # Special flag for adaptive scheduling
            
        # Time-optimized logic: Pick test with strictly shortest wait
        return min(available_tests, key=lambda t: current_queue_loads.get(t, 0))

    @staticmethod
    def calculate_wait_time(test_type: str, pending_count: int, is_offline: bool = False):
        if is_offline:
            return 999 # Acts as infinity for routing
            
        avg_durations = {
            'X-RAY': 15, 'MRI': 45, 'BLOOD_TEST': 10, 'CT_SCAN': 30, 'ULTRASOUND': 20
        }
        return pending_count * avg_durations.get(test_type, 20)

    @staticmethod
    def check_adaptive_schedule(wait_time: int):
        # Adaptive scheduling recommendation trigger
        return wait_time > 120 # If wait is over 2 hours, flag for later booking
