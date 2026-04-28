export type DiagnosticTest = 'X-RAY' | 'MRI' | 'BLOOD_TEST' | 'CT_SCAN' | 'ULTRASOUND';

export interface Patient {
  id: string;
  name: string;
  contactInfo?: string;
  priority: 'NORMAL' | 'URGENT' | 'EMERGENCY';
  requested_tests: DiagnosticTest[];
  status: 'WAITING' | 'TESTING' | 'COMPLETED' | 'CANCELLED';
  current_test?: DiagnosticTest;
  location?: string;
  instructions?: string;
  completed_tests?: string[];
  queue_position?: number;
  estimated_wait_time: number;
  createdAt: string;
}

export interface QueueEntry {
  patientId: string;
  testType: DiagnosticTest;
  joinedAt: Date;
  status: 'PENDING' | 'ACTIVE' | 'DONE';
}

export interface TestResource {
  type: DiagnosticTest;
  id: string;
  isAvailable: boolean;
  activePatientId?: string;
  avgDurationMinutes: number;
}

export interface Feedback {
  patientId: string;
  rating: number;
  comments: string;
  timestamp: Date;
}
