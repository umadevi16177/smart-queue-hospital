import { nanoid } from 'nanoid';
import { prisma } from '../db';
import { DiagnosticTest } from '../types';
import { RoutingEngine } from './routing-engine';
import { NotificationService } from '../services/notification-service';

export const QueueEngine = {
  async registerPatient(name: string, phoneNumber: string, tests: DiagnosticTest[], priority: string = 'NORMAL') {
    const patient = await prisma.patient.create({
      data: {
        id: nanoid(6),
        name,
        phoneNumber,
        priority,
        requestedTests: JSON.stringify(tests),
        currentStatus: 'WAITING',
      }
    });

    await this.assignNextTest(patient.id);
    return this.getPatient(patient.id);
  },

  async getPatient(id: string) {
    const p = await prisma.patient.findUnique({ where: { id } });
    if (!p) return null;
    return {
      ...p,
      requestedTests: JSON.parse(p.requestedTests) as DiagnosticTest[]
    };
  },

  async assignNextTest(patientId: string) {
    const patient = await this.getPatient(patientId);
    if (!patient) return;

    // Use current store logic but adapted for Prisma if needed
    // For Phase 3, we'll keep RoutingEngine logic but it might need DB access
    const nextTest = RoutingEngine.getOptimalNextTest(patient as any); 
    
    if (nextTest) {
      await prisma.patient.update({
        where: { id: patientId },
        data: {
          currentTest: nextTest,
          estimatedWaitTime: RoutingEngine.calculateWaitTime(nextTest)
        }
      });
      
      // Notify via WhatsApp Mock
      await NotificationService.notifyPatient(patient.name, patient.phoneNumber, nextTest, 1);
    } else {
      await prisma.patient.update({
        where: { id: patientId },
        data: {
          currentStatus: 'COMPLETED',
          currentTest: null,
          estimatedWaitTime: 0
        }
      });
    }
  },

  async completeTest(patientId: string, test: DiagnosticTest) {
    // In a real system, we'd log the completion of this specific test
    // For this implementation, we move to the next one
    await this.assignNextTest(patientId);
    console.log(`[LOG] Test ${test} completed for patient ${patientId}`);
  }
};
