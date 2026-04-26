import { calculateMaternalRisk } from './src/services/riskEngine';

const patientHistory = {
  hivStatus: 'negative',
  previousCSection: false,
  hypertension: false,
  diabetes: false,
  gravidity: 1,
  parity: 0,
  multiplePregnancy: false
} as any;

const testVitals = {
  age: 42,
  systolicBP: 145,
  diastolicBP: 95,
  bloodSugar: 13.5, // High
  temperature: 37,
  heartRate: 80,
  hb: 12,
  gestationalAge: 24,
  dangerSigns: []
} as any;

const result = calculateMaternalRisk(patientHistory, testVitals);

console.log('--- Risk Assessment Result ---');
console.log('Score:', result.riskScore);
console.log('Level:', result.riskLevel);
console.log('Danger Signs:', result.dangerSigns);
console.log('Recommendations:', result.clinicalRecommendations);
