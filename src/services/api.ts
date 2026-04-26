import { Patient, Referral } from '../types';

/**
 * Mock Service for FHIR/HL7 Interoperability
 * In a production environment, these would be real API calls to iPMD Impilo
 */
export const FHIRService = {
  async syncPatient(patient: Patient): Promise<boolean> {
    console.log('Syncing patient to FHIR standard...', patient);
    return new Promise((resolve) => setTimeout(resolve, 800, true));
  },

  async getReferrals(): Promise<Referral[]> {
    return [
      {
        id: 'REF-001',
        patientId: '1',
        patientName: 'Tendai Moyo',
        fromClinic: 'Murehwa Clinic',
        toHospital: 'Harare Central',
        reason: 'High Risk - Previous C-Section + Hypertension',
        urgency: 'emergency',
        status: 'dispatched',
        timestamp: new Date().toISOString(),
        timeline: [
          { status: 'Decision to transfer', timestamp: '2024-03-15T10:00:00Z' },
          { status: 'Ambulance dispatched', timestamp: '2024-03-15T10:15:00Z' },
        ],
        createdBy: 'mock-user-1'
      }
    ];
  }
};

export const HL7Service = {
  async sendAlert(alert: { type: string; message: string; patientId: string }) {
    console.log('Sending HL7 ADT Alert...', alert);
    // Mock SMS/Push notification trigger
  }
};
