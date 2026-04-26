import { Patient, Referral } from './types';

export const MOCK_PATIENTS: Patient[] = [
  {
    id: '1',
    name: 'Tendai Moyo',
    age: 24,
    gestationalAge: 32,
    riskScore: 75,
    riskLevel: 'high',
    status: 'active',
    lastVisit: '2024-03-10',
    nextVisit: '2024-03-24',
    location: 'Kuwirirana Clinic',
    phone: '+263 77 123 4567',
    history: {
      hivStatus: 'negative',
      previousCSection: true,
      hypertension: true,
      diabetes: false,
      gravidity: 3,
      parity: 2,
      multiplePregnancy: false
    },
    vitals: [
      { 
        id: 'v1', 
        timestamp: '2024-02-10T10:00:00Z', 
        gestationalAge: 28, 
        bp: '140/90', 
        hb: 11.2, 
        weight: 68, 
        fetalHeartRate: 145, 
        riskScore: 65, 
        dangerSigns: [] 
      },
      { 
        id: 'v2', 
        timestamp: '2024-03-10T11:00:00Z', 
        gestationalAge: 32, 
        bp: '145/95', 
        hb: 10.8, 
        weight: 70, 
        fetalHeartRate: 142, 
        riskScore: 75, 
        dangerSigns: ['Severe Headache'] 
      },
    ],
    createdBy: 'mock-user-1',
  },
  {
    id: '2',
    name: 'Sarah Dube',
    age: 19,
    gestationalAge: 24,
    riskScore: 15,
    riskLevel: 'low',
    status: 'active',
    lastVisit: '2024-03-12',
    nextVisit: '2024-04-12',
    location: 'Zumba Clinic',
    phone: '+263 78 987 6543',
    history: {
      hivStatus: 'negative',
      previousCSection: false,
      hypertension: false,
      diabetes: false,
      gravidity: 1,
      parity: 0,
      multiplePregnancy: false
    },
    vitals: [
      { 
        id: 'v3', 
        timestamp: '2024-03-12T09:00:00Z', 
        gestationalAge: 24, 
        bp: '110/70', 
        hb: 12.5, 
        weight: 55, 
        fetalHeartRate: 150, 
        riskScore: 15, 
        dangerSigns: [] 
      },
    ],
    createdBy: 'mock-user-1',
  },
  {
    id: '3',
    name: 'Chipo Gumbo',
    age: 38,
    gestationalAge: 36,
    riskScore: 45,
    riskLevel: 'medium',
    status: 'referred',
    lastVisit: '2024-03-15',
    nextVisit: '2024-03-22',
    location: 'Chireya Mission',
    phone: '+263 71 555 0199',
    history: {
      hivStatus: 'positive',
      previousCSection: false,
      hypertension: false,
      diabetes: true,
      gravidity: 5,
      parity: 4,
      multiplePregnancy: true
    },
    vitals: [
      { 
        id: 'v4', 
        timestamp: '2024-03-15T14:00:00Z', 
        gestationalAge: 36, 
        bp: '130/85', 
        hb: 11.0, 
        weight: 75, 
        fetalHeartRate: 140, 
        riskScore: 45, 
        dangerSigns: [] 
      },
    ],
    createdBy: 'mock-user-1',
  },
  {
    id: '4',
    name: 'Memory Ndlovu',
    age: 29,
    gestationalAge: 28,
    riskScore: 85,
    riskLevel: 'high',
    status: 'active',
    lastVisit: '2024-03-18',
    nextVisit: '2024-04-01',
    location: 'Nembudziya Clinic',
    phone: '+263 77 999 0000',
    history: {
      hivStatus: 'negative',
      previousCSection: false,
      hypertension: false,
      diabetes: false,
      gravidity: 2,
      parity: 1,
      multiplePregnancy: false,
      sickleCell: true
    },
    vitals: [
      { 
        id: 'v5', 
        timestamp: '2024-03-18T10:00:00Z', 
        gestationalAge: 28, 
        bp: '120/80', 
        hb: 9.5, 
        weight: 62, 
        fetalHeartRate: 148, 
        riskScore: 85, 
        dangerSigns: ['Vaginal Bleeding'] 
      },
    ],
    createdBy: 'mock-user-1',
  },
];

export const MOCK_REFERRALS: Referral[] = [
  {
    id: 'ref-1',
    patientId: '1',
    patientName: 'Tendai Moyo',
    fromClinic: 'Kuwirirana Clinic',
    toHospital: 'Gokwe North District Hospital',
    reason: 'Hypertensive Crisis / Preeclampsia',
    urgency: 'emergency',
    status: 'dispatched',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    riskLevel: 'high',
    riskScore: 78,
    dangerSigns: ['Severe Headache', 'BP 170/115'],
    timeline: [
      { status: 'Referral Initiated', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), note: 'Patient presenting with severe headache and blurred vision.' },
      { status: 'Ambulance Dispatched', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), note: 'ZPS Ambulance 04 en route.' }
    ],
    createdBy: 'mock-user-1'
  },
  {
    id: 'ref-2',
    patientId: '2',
    patientName: 'Sarah Dube',
    fromClinic: 'Zumba Clinic',
    toHospital: 'Gokwe South (St Agnes)',
    reason: 'Severe Anemia (Hb < 7)',
    urgency: 'urgent',
    status: 'arrived',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    riskLevel: 'medium',
    riskScore: 45,
    dangerSigns: ['Pallor', 'Tachycardia'],
    timeline: [
      { status: 'Referral Initiated', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), note: 'Hb 6.4. Requires transfusion.' },
      { status: 'Arrived at Facility', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), note: 'Patient admitted to maternity ward.' }
    ],
    createdBy: 'mock-user-1'
  }
];
