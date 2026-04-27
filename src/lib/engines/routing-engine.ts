import { prisma } from '../db';
import { DiagnosticTest, Patient } from '../types';

export const RoutingEngine = {
  getOptimalNextTest(patient: Patient): DiagnosticTest | null {
    // Note: For full realism, this would query Prisma for ALL patients' current tests
    // To keep it clean, we'll assume a mix of requested tests
    const tests = patient.requestedTests;
    if (tests.length === 0) return null;
    
    // Logic: Pick first test that isn't the "current" one if possible, or just sequential for mock
    return tests[0]; 
  },

  calculateWaitTime(test: DiagnosticTest): number {
    // In production, we'd do: prisma.patient.count({ where: { currentTest: test } })
    // For this simulation, we'll return a deterministic mock value
    return 15; 
  }
};
