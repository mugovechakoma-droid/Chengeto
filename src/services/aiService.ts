import { Patient } from '../types';

export interface ReferralAnalysis {
  reason: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  clinicalSummary: string;
}

export const analyzeReferralReason = async (
  patient: Patient,
  availableReasons: string[]
): Promise<ReferralAnalysis | null> => {
  try {
    const latestVisit = patient.vitals && patient.vitals.length > 0 
      ? patient.vitals[patient.vitals.length - 1] 
      : null;

    const patientContext = {
      age: patient.age,
      gestationalAge: patient.gestationalAge,
      history: patient.history,
      latestVitals: latestVisit ? {
        bp: latestVisit.bp || `${latestVisit.systolicBP}/${latestVisit.diastolicBP}`,
        heartRate: latestVisit.heartRate,
        temperature: latestVisit.temperature,
        hb: latestVisit.hb,
        dangerSigns: latestVisit.dangerSigns,
      } : null,
      currentRiskLevel: patient.riskLevel,
    };

    const response = await fetch('/api/analyze-referral', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            patientContext,
            availableReasons
        })
    });

    if (!response.ok) {
        throw new Error('Failed to analyze referral reason');
    }

    const data = await response.json();
    return data as ReferralAnalysis;

  } catch (error) {
    console.error('Error analyzing referral reason:', error);
    return null; // Fallback to heuristic or manual if AI fails
  }
};
