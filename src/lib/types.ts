export type DiagnosticTest = 'X-RAY' | 'MRI' | 'BLOOD_TEST' | 'CT_SCAN' | 'ULTRASOUND';

export interface Patient {
  id: string;
  name: string;
  phoneNumber: string;
  priority: 'NORMAL' | 'URGENT' | 'EMERGENCY';
  requestedTests: DiagnosticTest[];
  currentStatus: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  currentTest?: DiagnosticTest;
  queuePosition?: number;
  estimatedWaitTime: number; // in minutes (Read-only, derived from API)
  createdAt: Date;
}

export interface QueueEntry {
  patientId: string;
  testType: DiagnosticTest;
  joinedAt: Date;
  status: 'PENDING' | 'ACTIVE' | 'DONE';
}

export interface TestResource {
  type: DiagnosticTest;
  id: string; // Room number or machine ID
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
