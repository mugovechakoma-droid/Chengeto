import { GoogleGenAI } from '@google/genai';
import { Patient } from '../types';

// Initialize the Google Gen AI SDK
const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '',
});

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

    const prompt = `
      You are an expert obstetrician AI assistant. Review the following patient's clinical context and determine the primary reason for referral, the urgency level, and draft a concise, professional clinical handover note.
      
      Patient Context:
      ${JSON.stringify(patientContext, null, 2)}
      
      Available Reasons for Referral:
      ${availableReasons.map(r => `- ${r}`).join('\n')}
      
      Requirements:
      1. Choose the single most appropriate "reason" from the exact "Available Reasons" list.
      2. Determine the "urgency" as exactly one of: "routine", "urgent", or "emergency".
      3. Draft a "clinicalSummary" (max 3 sentences) that highlights the key red flags and reason for transfer.
      
      Respond ONLY with a valid JSON object matching this schema:
      {
        "reason": "exact string from list",
        "urgency": "routine | urgent | emergency",
        "clinicalSummary": "string"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const resultText = response.text;
    if (!resultText) return null;

    const result = JSON.parse(resultText) as ReferralAnalysis;
    return result;

  } catch (error) {
    console.error('Error analyzing referral reason with Gemini:', error);
    return null; // Fallback to heuristic or manual if AI fails
  }
};
