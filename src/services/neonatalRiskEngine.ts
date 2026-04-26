import { Neonate, NeonatalVisit, DeliveryRecord, Patient } from '../types';

export interface NeonatalRiskAssessment {
  riskScore: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  sepsisProbability: number;
  dangerSigns: string[];
  recommendations: string[];
  dischargeReadiness: {
    isReady: boolean;
    score: number; // 0-100
    missingCriteria: string[];
  };
}

export const calculateNeonatalSepsisRisk = (
  mother: Patient,
  delivery: DeliveryRecord,
  visit: Partial<NeonatalVisit>
): NeonatalRiskAssessment => {
  let score = 0;
  let sepsisProb = 0;
  const dangerSigns: string[] = [];
  const recommendations: string[] = [];

  // 1. Maternal Continuum Factors (Maternal-to-Neonatal Risk)
  if (mother.history.hivStatus === 'positive') {
    score += 15;
    sepsisProb += 10;
    recommendations.push('Initiate PMTCT neonatal prophylaxis as per EDLIZ guidelines.');
  }

  if (delivery.maternalFever) {
    score += 30;
    sepsisProb += 25;
    dangerSigns.push('Maternal Intrapartum Fever');
    recommendations.push('Closely monitor for Early-Onset Sepsis (EOS).');
  }

  if (delivery.ruptureOfMembranes > 18) {
    score += 25;
    sepsisProb += 20;
    dangerSigns.push('Prolonged ROM (>18h)');
    recommendations.push('Observe for signs of infection every 4 hours for the first 48 hours.');
  }

  // 2. Intrapartum Events
  if (delivery.meconiumStaining) {
    score += 20;
    recommendations.push('Monitor for Meconium Aspiration Syndrome (MAS).');
  }

  if (delivery.apgar5 < 7) {
    score += 25;
    recommendations.push('History of Perinatal Asphyxia. Monitor neurological activity.');
  }

  // 3. Current Neonatal Vitals (The Sepsis Engine)
  if (visit.temperature !== undefined) {
    if (visit.temperature > 37.5 || visit.temperature < 36.5) {
       score += 30;
       sepsisProb += 20;
       dangerSigns.push(visit.temperature > 37.5 ? 'Hyperthermia/Fever' : 'Hypothermia');
       recommendations.push(visit.temperature < 36.5 ? 'Ensure skin-to-skin (KMC) and warm environment.' : 'Investigate for focus of infection.');
    }
  }

  if (visit.feedingStatus === 'poor' || visit.feedingStatus === 'not-feeding') {
    score += 25;
    sepsisProb += 15;
    dangerSigns.push('Poor Feeding');
    recommendations.push('Assess attachment and positioning; rule out sepsis/hypoglycemia.');
  }

  if (visit.activityLevel === 'lethargic') {
    score += 35;
    sepsisProb += 30;
    dangerSigns.push('Lethargy');
    recommendations.push('URGENT: High suspicion of sepsis or meningitis.');
  }

  if (visit.breathingEffort === 'distress' || visit.breathingEffort === 'grunting') {
    score += 30;
    sepsisProb += 20;
    dangerSigns.push('Respiratory Distress/Grunting');
    recommendations.push('Ensure clear airway; refer for O2 and potential antibiotics.');
  }

  // 4. Final Scoring Logic
  const finalScore = Math.min(score, 100);
  const finalSepsisProb = Math.min(sepsisProb, 100);

  let riskLevel: 'low' | 'moderate' | 'high' | 'critical' = 'low';
  if (finalScore >= 80 || finalSepsisProb >= 50) {
    riskLevel = 'critical';
    recommendations.push('INITIATE SEPSIS PROTOCOL: Start empirical antibiotics (Benzylpenicillin & Gentamicin) immediately.');
    recommendations.push('URGENT EMERGENCY REFERRAL to Neonatal Unit.');
  } else if (finalScore >= 50) {
    riskLevel = 'high';
    recommendations.push('HIGH RISK: Urgent medical review required within 2 hours.');
  } else if (finalScore >= 25) {
    riskLevel = 'moderate';
    recommendations.push('MODERATE RISK: Review within 12-24 hours. Educate mother on danger signs.');
  }

  // 5. Discharge Readiness Criteria
  const missingCriteria: string[] = [];
  if (visit.feedingStatus !== 'good') missingCriteria.push('Adequate Feeding');
  if (visit.activityLevel !== 'active') missingCriteria.push('Stable Activity');
  if (visit.temperature && (visit.temperature > 37.2 || visit.temperature < 36.5)) missingCriteria.push('Temperature Stability');
  if (delivery.birthWeight < 2000) missingCriteria.push('Weight Threshold (2kg)');
  if (finalScore > 20) missingCriteria.push('Risk Score < 20%');

  const readinessScore = Math.max(0, 100 - (missingCriteria.length * 20) - (finalScore / 2));
  const isReady = readinessScore >= 80 && missingCriteria.length === 0;

  return {
    riskScore: finalScore,
    riskLevel,
    sepsisProbability: finalSepsisProb,
    dangerSigns: Array.from(new Set(dangerSigns)),
    recommendations: Array.from(new Set(recommendations)),
    dischargeReadiness: {
      isReady,
      score: Math.round(readinessScore),
      missingCriteria
    }
  };
};

export const generateClinicalHandover = (
  mother: Patient,
  neonate: Neonate,
  assessment: NeonatalRiskAssessment
): string => {
  const latestVisit = neonate.visits[neonate.visits.length - 1];
  return `
CLINICAL HANDOVER - ${neonate.name} (Mother: ${mother.name})
-----------------------------------------------------------
BIRTH DETAILS:
- GA: ${neonate.gestationalAge} wks | BW: ${neonate.birthWeight}g
- Mode: ${mother.delivery?.modeOfDelivery || 'N/A'}
- Apgar: ${mother.delivery?.apgar1}/${mother.delivery?.apgar5}

MATERNAL RISK FACTORS:
- Risk Level: ${mother.riskLevel.toUpperCase()} (${mother.riskScore}%)
- ROM: ${mother.delivery?.ruptureOfMembranes} hrs
- Fever: ${mother.delivery?.maternalFever ? 'YES' : 'NO'}

NEONATAL ASSESSMENT:
- Sepsis Prob: ${assessment.sepsisProbability}%
- Danger Signs: ${assessment.dangerSigns.join(', ') || 'NONE'}
- Feeding: ${latestVisit?.feedingStatus || 'N/A'}
- Activity: ${latestVisit?.activityLevel || 'N/A'}

RECOMMENDATIONS:
${assessment.recommendations.map(r => `- ${r}`).join('\n')}

DISCHARGE STATUS: ${assessment.dischargeReadiness.isReady ? 'READY' : 'NOT READY'} (${assessment.dischargeReadiness.score}%)
  `.trim();
};
