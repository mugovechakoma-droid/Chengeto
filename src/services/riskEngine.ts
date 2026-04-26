import { Patient, ANCVisit } from '../types';

export const calculateEDD = (lnmp: string): string => {
  if (!lnmp) return '';
  const date = new Date(lnmp);
  date.setDate(date.getDate() + 280);
  return date.toISOString().split('T')[0];
};

export const calculateGA = (lnmp: string): number => {
  if (!lnmp) return 0;
  const start = new Date(lnmp);
  const today = new Date();
  const diffInMs = today.getTime() - start.getTime();
  const diffInWeeks = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 7));
  return Math.max(0, diffInWeeks);
};

export interface RiskAssessmentResult {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendation: string;
  dangerSigns: string[];
  clinicalRecommendations: string[];
}

export const predictMaternalRiskML = (vitals: {
  age: number;
  systolicBP: number;
  diastolicBP: number;
  bloodSugar: number;
  bodyTemp: number;
  heartRate: number;
}): RiskLevel => {
  const { age, systolicBP, diastolicBP, bloodSugar, bodyTemp, heartRate } = vitals;
  
  // High Risk Triggers based on notebook data distribution
  if (bloodSugar >= 12 || systolicBP >= 160 || diastolicBP >= 110) return 'high';
  if (age > 40 && (systolicBP >= 140 || bloodSugar >= 10)) return 'high';
  
  // Medium Risk Triggers
  if (bloodSugar >= 7.8 || systolicBP >= 130 || diastolicBP >= 85 || age > 35) return 'medium';
  
  return 'low';
};

export const calculateMaternalRisk = (
  patientHistory: Patient['history'],
  currentVitals: Partial<ANCVisit> & { age: number; racialBackground?: string }
): RiskAssessmentResult => {
  let score = 0;
  const dangerSigns: string[] = currentVitals.dangerSigns || [];
  const clinicalRecommendations: string[] = [];
  let triggerAlert = false;

  // 1. ABSOLUTE TRIGGER ALERTS & EMERGENCY ACTIONS
  if (currentVitals.heartRate !== undefined && (currentVitals.heartRate < 50 || currentVitals.heartRate > 120)) {
    triggerAlert = true;
    dangerSigns.push(`Abnormal Heart Rate: ${currentVitals.heartRate} bpm`);
    clinicalRecommendations.push('Stabilize patient: Ensure airway is clear, provide O2 if available.');
  }

  if (currentVitals.systolicBP !== undefined && (currentVitals.systolicBP < 90 || currentVitals.systolicBP > 160)) {
    triggerAlert = true;
    dangerSigns.push(`Critical Systolic BP: ${currentVitals.systolicBP} mmHg`);
    if (currentVitals.systolicBP > 160) {
      clinicalRecommendations.push('CRITICAL HTN: Initiate Hydralazine (5mg IV/IM) or Nifedipine (10mg PO) per EDLIZ protocols.');
    }
  }

  if (currentVitals.diastolicBP !== undefined && currentVitals.diastolicBP > 110) {
    triggerAlert = true;
    dangerSigns.push(`Critical Diastolic BP: ${currentVitals.diastolicBP} mmHg`);
    clinicalRecommendations.push('ECLAMPSIA PROPHYLAXIS: Consider Magnesium Sulphate loading dose per EDLIZ guidelines.');
  }

  // General Hypertension (non-critical)
  if (!triggerAlert && currentVitals.systolicBP !== undefined && currentVitals.diastolicBP !== undefined) {
    if (currentVitals.systolicBP >= 140 || currentVitals.diastolicBP >= 90) {
      clinicalRecommendations.push('Start Methyldopa (250mg TDS) as per EDLIZ. Monitor BP 4-hourly.');
      clinicalRecommendations.push('Test for Proteinuria/Dipstick to screen for Preeclampsia.');
    }
  }

  // Blood Sugar (BS) - Integrated from Maternal Risk ML Notebook
  if (currentVitals.bloodSugar !== undefined) {
    if (currentVitals.bloodSugar >= 11.1) { // Random/Post-prandial threshold
      triggerAlert = true;
      dangerSigns.push(`Hyperglycemia: ${currentVitals.bloodSugar} mmol/L`);
      clinicalRecommendations.push('Suspected Gestational Diabetes (GDM). Refer for OGTT and specialist review.');
      score += 40;
    } else if (currentVitals.bloodSugar >= 7.8) {
      score += 20;
      clinicalRecommendations.push('Elevated Blood Sugar. Monitor glucose levels and advise on low-glycemic diet.');
    }
  }

  if (currentVitals.respRate !== undefined && (currentVitals.respRate < 12 || currentVitals.respRate > 30)) {
    triggerAlert = true;
    dangerSigns.push(`Abnormal Resp Rate: ${currentVitals.respRate} bpm`);
  }

  if (currentVitals.spo2 !== undefined && currentVitals.spo2 < 95) {
    triggerAlert = true;
    dangerSigns.push(`Low Oxygen Saturation: ${currentVitals.spo2}%`);
    clinicalRecommendations.push('Provide Supplemental Oxygen (2-4L/min) if available.');
  }

  if (currentVitals.temperature !== undefined && (currentVitals.temperature < 35 || currentVitals.temperature >= 38)) {
    triggerAlert = true;
    dangerSigns.push(`Abnormal Temperature: ${currentVitals.temperature}°C`);
    if (currentVitals.temperature >= 38) {
      clinicalRecommendations.push('Suspected Infection: Initiate empirical antibiotics after taking blood cultures/WCC.');
    }
  }

  if (currentVitals.avpu && currentVitals.avpu !== 'Alert') {
    triggerAlert = true;
    dangerSigns.push(`Altered Mental Status: ${currentVitals.avpu}`);
    clinicalRecommendations.push('Emergency stabilization required. Protect airway and position in left lateral tilt.');
  }

  // 2. WEIGHTED SCORING - Demographics
  if (currentVitals.age > 44) score += 30;
  else if (currentVitals.age > 35 || currentVitals.age < 20) score += 15;

  if (patientHistory.bmi && patientHistory.bmi > 35) {
    score += 15;
    clinicalRecommendations.push('Counsel on healthy weight gain and preeclampsia risks associated with high BMI.');
  }

  // 3. WEIGHTED SCORING - Obstetric History
  if (patientHistory.hivStatus === 'positive') {
    score += 20;
    clinicalRecommendations.push('PMTCT: Confirm patient is on TLD and has a suppressed Viral Load (< 50 copies).');
  }
  if (patientHistory.previousCSection) score += 25;
  if (patientHistory.hypertension) score += 20;
  if (patientHistory.diabetes) score += 20;
  if (patientHistory.parity > 4) {
    score += 15;
    clinicalRecommendations.push('High Parity: Increased risk of Postpartum Hemorrhage (PPH). Prepare for active management of 3rd stage.');
  }
  
  if (patientHistory.pphHistory) {
    score += 25;
    clinicalRecommendations.push('History of PPH: Ensure availability of Oxytocin/Misoprostol for third stage of labor.');
  }

  // Anemia (Hb)
  if (currentVitals.hb !== undefined && currentVitals.hb < 11) {
    score += currentVitals.hb < 7 ? 40 : 20;
    clinicalRecommendations.push(currentVitals.hb < 7 ? 
      'SEVERE ANEMIA: Urgent blood transfusion may be required. Refer for inpatient management.' : 
      'MODERATE ANEMIA: Start/Increase Iron and Folic Acid (e.g., HDIF) and dietary counseling.');
  } else {
    clinicalRecommendations.push('Routine Care: Maintain daily Iron (60mg) and Folic Acid (400mcg) supplementation.');
  }

  // 4. WEIGHTED SCORING - Current Complications/Comorbidities
  if (patientHistory.multiplePregnancy) score += 25;
  if (patientHistory.placentaPrevia || patientHistory.placentaAccreta) score += 30;
  if (patientHistory.sickleCell) score += 25;

  // 5. Presenting Symptoms
  const symptoms = [
    { key: 'headache', label: 'Severe Headache' },
    { key: 'blurringVision', label: 'Blurring Vision' },
    { key: 'chestPain', label: 'Chest Pain' },
    { key: 'dyspnea', label: 'Shortness of Breath' },
    { key: 'abdominalPain', label: 'Abdominal Pain' },
    { key: 'swelling', label: 'Severe Swelling' },
    { key: 'vaginalBleeding', label: 'Vaginal Bleeding' }
  ];

  // --- ALGORITHM A: Hypertensive Disorders (PE/E) ---
  if (currentVitals.gestationalAge !== undefined && currentVitals.gestationalAge > 20) {
    const sys = currentVitals.systolicBP || 0;
    const dia = currentVitals.diastolicBP || 0;
    const hasSevereSymptoms = currentVitals.headache || currentVitals.epigastricPain || currentVitals.blurringVision;
    const proteinuria = currentVitals.proteinuria || 'none';
    const isProteinuriaHigh = ['2+', '3+', '4+'].includes(proteinuria);

    if (currentVitals.activeConvulsions || currentVitals.reflexes === 'brisk') {
      triggerAlert = true;
      dangerSigns.push('ECLAMPSIA (Imminent/Active)');
      clinicalRecommendations.push('MAGNESIUM SULPHATE LOADING DOSE: 14g stat (4g IV over 20 mins + 10g IM [5g each buttock] with 1ml 2% lignocaine).');
      clinicalRecommendations.push('EMERGENCY: Deliver within 6 hours.');
    } else if (sys >= 160 || dia >= 110 || (isProteinuriaHigh && hasSevereSymptoms)) {
      triggerAlert = true;
      dangerSigns.push('Severe Pre-eclampsia');
      clinicalRecommendations.push('ADMIT IMMEDIATELY. RESTRICT IV FLUIDS (~1L over 12 hours) to prevent pulmonary/cerebral oedema.');
      clinicalRecommendations.push('Give Hydralazine 10mg IM every 4 hours. Prepare for delivery.');
    } else if (sys >= 140 || dia >= 90) {
      clinicalRecommendations.push('Mild/Moderate Pre-eclampsia: Admit, monitor BP 4-hourly.');
      clinicalRecommendations.push('Prescribe Methyldopa (250-500mg 3-4x/day) and/or Nifedipine (20mg BD).');
      clinicalRecommendations.push('Plan delivery at >37 weeks.');
    }
  }

  // --- ALGORITHM B: Obstetric Haemorrhage (APH/PPH) & Shock ---
  if (currentVitals.vaginalBleeding || (currentVitals.bloodLoss !== undefined && currentVitals.bloodLoss > 0)) {
    const sys = currentVitals.systolicBP || 0;
    const hr = currentVitals.heartRate || 0;
    const rr = currentVitals.respRate || 0;

    // Antepartum Haemorrhage (APH)
    if (currentVitals.gestationalAge > 20 && currentVitals.vaginalBleeding) {
      if (currentVitals.softAbdomen && !currentVitals.abdominalPain) {
        dangerSigns.push('Possible Placenta Praevia');
        clinicalRecommendations.push('SAFETY ALERT: Painless bleeding + soft abdomen. DO NOT perform digital VE. Diagnose via Ultrasound.');
      } else if (currentVitals.woodyHardAbdomen || currentVitals.abdominalPain) {
        dangerSigns.push('Possible Placenta Abruptio');
        clinicalRecommendations.push('ABRUPTIO PLACENTAE: Abdominal pain + woody hard abdomen + possible fetal distress. Urgent delivery required.');
      }
    }

    // Post-Partum Haemorrhage (PPH) & Shock
    if (currentVitals.bloodLoss > 500 || (sys < 90 && sys > 0)) {
      dangerSigns.push('Post-Partum Haemorrhage / Shock');
      clinicalRecommendations.push('E-MOTIVE Management Bundle: Massage Uterus, Oxytocic drugs (10 IU IM/IV), TXA 1g IV slowly over 10m.');
      clinicalRecommendations.push('IV Fluids: Replace at 3:1 ratio using 14G/16G cannulae.');
      
      // The 4 Ts Management
      if (currentVitals.uterineAtony) clinicalRecommendations.push('TONE: Uterine atony detected. Continue massage and oxytocics.');
      if (currentVitals.retainedPlacenta) clinicalRecommendations.push('TISSUE: Retained placenta/remnants. Prepare for manual removal.');
      if (currentVitals.genitalTears) clinicalRecommendations.push('TRAUMA: Perineal/Vaginal tears detected. Suture as required.');
      if (currentVitals.clottingDysfunction) clinicalRecommendations.push('THROMBIN: Coagulopathy suspected. Check clotting factors/Transfuse blood products.');

      if (hr > 100 && rr > 22) clinicalRecommendations.push('Estimated Blood Loss: ~1500ml.');
      else if (hr > 100) clinicalRecommendations.push('Estimated Blood Loss: ~700ml. Give crystalloid IV.');
      if (sys < 90 && sys > 0) clinicalRecommendations.push('Estimated Blood Loss: ~2000ml. Give IV fluids and blood products.');
    }
  }

  // --- ALGORITHM C: Obstructed & Prolonged Labour ---
  if (currentVitals.cervicalDilatation !== undefined) {
    if (currentVitals.moulding && currentVitals.moulding >= 3 || currentVitals.secondaryArrest) {
      triggerAlert = true;
      dangerSigns.push('Signs of Obstructed Labour / CPD');
      clinicalRecommendations.push('CONTRAINDICATION: DO NOT augment with Oxytocin (risk of uterine rupture).');
      clinicalRecommendations.push('Urgent Caesarean Section required.');
    } else if (currentVitals.cervicalDilatation < (currentVitals.gestationalAge > 0 ? 1 : 1)) { // Placeholder for partograph alert
      clinicalRecommendations.push('Partograph Alert: If at basic facility, refer to CEmONC facility immediately.');
    }
  }

  // --- ALGORITHM D: Preterm Labour & PROM ---
  if (currentVitals.gestationalAge !== undefined && currentVitals.gestationalAge < 34) {
    if (currentVitals.gestationalAge >= 24) {
      clinicalRecommendations.push('Preterm Labour: Administer Antenatal Corticosteroids (Dexamethasone 6mg IM 12-hourly for 2 days).');
    }
    if (currentVitals.foulSmellingLiquor) {
      dangerSigns.push('Infection / Chorioamnionitis');
      clinicalRecommendations.push('PROM/Infection: Start Erythromycin 250mg PO 6-hourly. WARNING: Avoid co-amoxiclav (NEC risk).');
    }
  }

  // --- ALGORITHM E: Obstetric Sepsis ---
  if (currentVitals.temperature !== undefined && currentVitals.temperature > 37.5) {
    clinicalRecommendations.push('Obstetric Sepsis: Amoxicillin 500mg TDS + Metronidazole 400mg TDS + Doxycycline 100mg BD for 10 days.');
    clinicalRecommendations.push('Evaluate for retained products requiring manual vacuum aspiration.');
  }

  // --- SAFETY CONSTRAINTS & CRITICAL WARNINGS ---
  if (patientHistory.cardiacDisease) {
    clinicalRecommendations.push('CRITICAL: Cardiac Disease - DO NOT give Ergometrine. Use Oxytocin 10 units. Avoid fluid overload.');
  }

  if (patientHistory.placentaPrevia && currentVitals.vaginalBleeding) {
    dangerSigns.push('Placenta Praevia Bleeding');
    clinicalRecommendations.push('SAFETY ALERT: DO NOT perform digital Vaginal Examination (VE). Diagnose via Ultrasound.');
  }

  // Final scoring and risk level determination remains consistent with original logic, 
  // but now benefits from more specific clinical triggers.
  
  if (triggerAlert) score = Math.max(score, 85);
  
  // Apply ML Prediction as a secondary validation
  const mlRisk = predictMaternalRiskML({
    age: currentVitals.age,
    systolicBP: currentVitals.systolicBP || 0,
    diastolicBP: currentVitals.diastolicBP || 0,
    bloodSugar: currentVitals.bloodSugar || 0,
    bodyTemp: currentVitals.temperature || 37,
    heartRate: currentVitals.heartRate || 80
  });

  if (mlRisk === 'high') score = Math.max(score, 70);
  if (mlRisk === 'medium') score = Math.max(score, 40);

  const finalScore = Math.min(score, 100);

  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  let recommendation = 'Continue routine ANC follow-up.';

  if (finalScore >= 60 || triggerAlert || dangerSigns.length >= 2) {
    riskLevel = 'high';
    recommendation = triggerAlert 
      ? 'CRITICAL ALERT: Immediate emergency stabilization and referral required.' 
      : 'HIGH RISK: Urgent referral recommended. Consult EDLIZ specific algorithms for management.';
  } else if (finalScore >= 30) {
    riskLevel = 'medium';
    recommendation = 'MEDIUM RISK: Increase monitoring frequency.';
  }

  clinicalRecommendations.push('Provide counseling on Danger Signs in pregnancy and immediate action.');

  return {
    riskScore: finalScore,
    riskLevel,
    recommendation,
    dangerSigns: Array.from(new Set(dangerSigns)),
    clinicalRecommendations: Array.from(new Set(clinicalRecommendations))
  };
};

