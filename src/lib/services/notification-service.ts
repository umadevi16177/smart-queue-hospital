export const NotificationService = {
  async sendWhatsApp(phoneNumber: string, message: string): Promise<boolean> {
    console.log(`[WHATSAPP MOCK] To: ${phoneNumber} | Message: ${message}`);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  },

  async notifyPatient(patientName: string, phoneNumber: string, testType: string, position: number) {
    const message = `Hello ${patientName}, your ${testType} is coming up soon. You are currently at position ${position} in the queue. Please head to the diagnostic wing.`;
    return this.sendWhatsApp(phoneNumber, message);
  }
};
