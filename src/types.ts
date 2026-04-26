export type RiskLevel = 'low' | 'medium' | 'high';
export type UserRole = 'pcn' | 'dmo' | 'specialist' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  clinic?: string;
  createdAt?: string;
  clinicId?: string;
  districtId?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gestationalAge: number; // in weeks
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  status: 'active' | 'referred' | 'delivered';
  lastVisit: string;
  nextVisit: string;
  lnmp?: string;
  edd?: string;
  location: string;
  phone: string;
  history: {
    hivStatus: 'positive' | 'negative' | 'unknown';
    previousCSection: boolean;
    hypertension: boolean;
    diabetes: boolean;
    gravidity: number;
    parity: number;
    multiplePregnancy: boolean;
    weight?: number;
    height?: number;
    bmi?: number;
    race?: string;
    socioeconomicStatus?: string;
    smokingStatus?: boolean;
    substanceAbuse?: boolean;
    pphHistory?: boolean;
    stillbirthHistory?: boolean;
    prematureBirthHistory?: boolean;
    congenitalMalformationHistory?: boolean;
    conceptionMethod?: 'natural' | 'ivf' | 'other';
    interpregnancyInterval?: number;
    chronicRenalDisease?: boolean;
    cardiovascularDisease?: boolean;
    asthma?: boolean;
    sickleCell?: boolean;
    autoimmuneDiseases?: boolean;
    psychiatricHistory?: boolean;
    bloodTypeRhNegative?: boolean;
    placentaPrevia?: boolean;
    placentaAbruptio?: boolean;
    polyhydramnios?: boolean;
    intraamnioticInfection?: boolean;
    cardiacDisease?: boolean;
    bloodSugar?: number;
    placentaAccreta?: boolean;
  };
  vitals: ANCVisit[];
  delivery?: DeliveryRecord;
  neonates?: string[]; // IDs of neonates
  createdBy: string;
}

export interface ANCVisit {
  id: string;
  timestamp: string;
  gestationalAge: number;
  bp: string;
  systolicBP?: number;
  diastolicBP?: number;
  heartRate?: number;
  respRate?: number;
  spo2?: number;
  temperature?: number;
  avpu?: 'Alert' | 'Voice' | 'Pain' | 'Unresponsive';
  painScore?: number;
  hb: number;
  weight: number;
  muac?: number;
  fetalHeartRate: number;
  riskScore: number;
  notes?: string;
  dangerSigns: string[];
  clinicalRecommendations?: string[];
  headache?: boolean;
  blurringVision?: boolean;
  chestPain?: boolean;
  dyspnea?: boolean;
  abdominalPain?: boolean;
  swelling?: boolean;
  vaginalBleeding?: boolean;
  proteinuria?: 'none' | '1+' | '2+' | '3+' | '4+';
  reflexes?: 'normal' | 'brisk';
  activeConvulsions?: boolean;
  epigastricPain?: boolean;
  bloodLoss?: number;
  cervicalDilatation?: number;
  moulding?: number;
  secondaryArrest?: boolean;
  foulSmellingLiquor?: boolean;
  // Haemorrhage Details
  softAbdomen?: boolean;
  woodyHardAbdomen?: boolean;
  uterineAtony?: boolean;
  retainedPlacenta?: boolean;
  genitalTears?: boolean;
  clottingDysfunction?: boolean;
  bloodSugar?: number;
}

export interface Referral {
  id: string;
  patientId: string;
  patientName: string;
  fromClinic: string;
  toHospital: string;
  reason: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  status: 'pending' | 'accepted' | 'dispatched' | 'arrived' | 'completed' | 'escalated' | 'rejected';
  timestamp: string;
  eta?: string;
  dangerSigns?: string[];
  clinicalRecommendations?: string[];
  riskLevel?: RiskLevel;
  riskScore?: number;
  timeline: {
    status: string;
    timestamp: string;
    note?: string;
  }[];
  createdBy: string;
  acceptedBy?: string;
  acceptedAt?: string;
}

export type NeonatalRiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface DeliveryRecord {
  id: string;
  patientId: string; // Mother
  timestamp: string;
  modeOfDelivery: 'vaginal' | 'c-section' | 'assisted';
  durationOfLabour: number; // hours
  ruptureOfMembranes: number; // hours before delivery
  maternalFever: boolean;
  meconiumStaining: boolean;
  resuscitationRequired: boolean;
  apgar1: number;
  apgar5: number;
  apgar10?: number;
  birthWeight: number; // grams
  gestationalAgeAtBirth: number;
  complications: string[];
  notes?: string;
}

export interface NeonatalVisit {
  id: string;
  neonateId: string;
  timestamp: string;
  temperature: number;
  heartRate: number;
  respRate: number;
  weight: number;
  feedingStatus: 'good' | 'poor' | 'not-feeding';
  activityLevel: 'active' | 'lethargic' | 'irritable';
  breathingEffort: 'normal' | 'distress' | 'grunting';
  color: 'normal' | 'pale' | 'jaundiced' | 'cyanosed';
  dangerSigns: string[];
  sepsisRiskScore: number;
  recommendations: string[];
}

export interface Neonate {
  id: string;
  motherId: string;
  deliveryId: string;
  name: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  birthWeight: number;
  gestationalAge: number; // at birth
  riskScore: number;
  riskLevel: NeonatalRiskLevel;
  currentStatus: 'stable' | 'monitoring' | 'referred' | 'critical' | 'deceased';
  visits: NeonatalVisit[];
  lastScreening: string;
}
