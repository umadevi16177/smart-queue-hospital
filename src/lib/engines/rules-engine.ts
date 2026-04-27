import { DiagnosticTest, Patient } from '../types';

export const RulesEngine = {
  getInstructions(test: DiagnosticTest): string[] {
    switch (test) {
      case 'BLOOD_TEST':
        return ['Fast for 8-12 hours before the test.', 'Only drink water.', 'Avoid smoking and vigorous exercise.'];
      case 'MRI':
        return ['Remove all metallic objects (jewelry, watches).', 'Inform the technician if you have implants.', 'Wear comfortable, loose clothing.'];
      case 'X-RAY':
        return ['Wear a hospital gown if provided.', 'Remove jewelry from the area being scanned.'];
      case 'CT_SCAN':
        return ['Avoid eating 3 hours before the scan if contrast is used.', 'Drink plenty of water before and after.'];
      case 'ULTRASOUND':
        return ['Drink plenty of water for abdominal scans.', 'Do not urinate before the test if required.'];
      default:
        return [];
    }
  },

  getEstimatedDuration(test: DiagnosticTest): number {
    const durations: Record<DiagnosticTest, number> = {
      'X-RAY': 15,
      'MRI': 45,
      'BLOOD_TEST': 10,
      'CT_SCAN': 30,
      'ULTRASOUND': 20,
    };
    return durations[test];
  }
};
