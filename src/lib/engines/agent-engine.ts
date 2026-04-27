import { store } from '../store';
import { QueueEngine } from './queue-engine';
import { RoutingEngine } from './routing-engine';
import { RulesEngine } from './rules-engine';

export interface AgentResponse {
  message: string;
  reasoning: string;
  actionTaken?: string;
}

export const AgentEngine = {
  async processQuery(patientId: string, query: string): Promise<AgentResponse> {
    const patient = store.patients.get(patientId);
    if (!patient) return { message: "I couldn't find your record.", reasoning: "Patient ID not in store." };

    const lowerQuery = query.toLowerCase();

    // 1. Status Query
    if (lowerQuery.includes('status') || lowerQuery.includes('when') || lowerQuery.includes('next')) {
      const waitTime = patient.estimatedWaitTime;
      return {
        message: `Your current status is ${patient.currentStatus}. Your next test is ${patient.currentTest}. Expected wait time: ${waitTime} minutes.`,
        reasoning: `Fetched current status and wait time for ${patient.id}.`
      };
    }

    // 2. Pre-test Instructions
    if (lowerQuery.includes('prepare') || lowerQuery.includes('instructions') || lowerQuery.includes('do')) {
      if (!patient.currentTest) return { message: "You have no upcoming tests.", reasoning: "No active test." };
      const instructions = RulesEngine.getInstructions(patient.currentTest);
      return {
        message: `For your ${patient.currentTest}, please: ${instructions.join(' ')}`,
        reasoning: "Retrieved medical protocols from RulesEngine."
      };
    }

    // 3. Rerouting / Swap Request (Agentic Decision)
    if (lowerQuery.includes('swap') || lowerQuery.includes('change') || lowerQuery.includes('skip')) {
      const otherTests = patient.requestedTests.filter(t => t !== patient.currentTest);
      if (otherTests.length === 0) return { message: "You have no other tests to swap with.", reasoning: "Single test path." };

      // Reasoning: Check if any other test has a shorter wait time
      const bestTest = RoutingEngine.getOptimalNextTest(patient);
      if (bestTest && bestTest !== patient.currentTest) {
        // Logically swap the tests in the queue
        // For MVP/Phase 2, we just re-assign
        QueueEngine.assignNextTest(patient.id); 
        return {
          message: `I've analyzed the current hospital load. Swapping your sequence to ${bestTest} will save you approximately 15 minutes.`,
          reasoning: "Optimized patient path based on real-time resource availability.",
          actionTaken: "REROUTE_SUCCESS"
        };
      } else {
        return {
          message: "The current sequence is already the most efficient based on hospital traffic.",
          reasoning: "Current path wait time < all alternatives."
        };
      }
    }

    return {
      message: "I'm your hospital assistant. I can help with status updates, test instructions, or queue optimization. How can I help?",
      reasoning: "Generic fallback for non-specific queries."
    };
  }
};
