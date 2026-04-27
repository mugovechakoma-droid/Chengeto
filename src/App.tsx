import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import PatientProfile from './components/PatientProfile';
import RiskAssessment from './components/RiskAssessment';
import { Patient, UserRole, ANCVisit, Referral } from './types';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { useFirebase } from './contexts/FirebaseContext';
import { db, handleFirestoreError, OperationType } from './lib/firebase';
import { collection, onSnapshot, query, orderBy, addDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';

import LoginPage from './components/auth/LoginPage';
import ANCVisitForm from './components/ANCVisitForm';
import ReferralForm from './components/ReferralForm';
import ClinicalChatbot from './components/ClinicalChatbot';
import PatientsPage from './components/PatientsPage';
import ReferralsPage from './components/ReferralsPage';
import SurveillancePage from './components/SurveillancePage';
import DistrictAdminPage from './components/DistrictAdminPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import { calculateMaternalRisk } from './services/riskEngine';
import { Notification } from './components/NotificationCenter';
import ReloadPrompt from './components/pwa/ReloadPrompt';
import { 
  getLocalData, 
  addLocalItem, 
  updateLocalItem, 
  STORAGE_KEYS 
} from './lib/mockStorage';
import { MOCK_PATIENTS, MOCK_REFERRALS } from './constants';
import { RiskLevel } from './types';

export default function App() {
  const { user, loading, isMock, loginWithEmail, loginWithGoogle, logout } = useFirebase();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);
  const [isANCFormOpen, setIsANCFormOpen] = useState(false);
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const location = useLocation();

  useEffect(() => {
    const routeTitles: Record<string, string> = {
      '/login': 'Login | Chengeto',
      '/dashboard': 'Dashboard | Chengeto',
      '/patients': 'Patients | Chengeto',
      '/referrals': 'Referrals | Chengeto',
      '/surveillance': 'Surveillance | Chengeto',
    };

    const title = routeTitles[location.pathname] || 'Chengeto';
    document.title = title;
  }, [location]);

  useEffect(() => {
    if (!user) {
      setPatients([]);
      setReferrals([]);
      setNotifications([]);
      return;
    }

    if (isMock) {
      setPatients(getLocalData(STORAGE_KEYS.PATIENTS, MOCK_PATIENTS));
      setReferrals(getLocalData(STORAGE_KEYS.REFERRALS, MOCK_REFERRALS));
      setNotifications(getLocalData(STORAGE_KEYS.NOTIFICATIONS, []));
      return;
    }

    const patientsQuery = query(collection(db, 'patients'), orderBy('riskScore', 'desc'));
    const unsubPatients = onSnapshot(patientsQuery, (snapshot) => {
      const patientData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Patient[];
      setPatients(patientData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'patients');
    });

    const referralsQuery = query(collection(db, 'referrals'), orderBy('timestamp', 'desc'));
    const unsubReferrals = onSnapshot(referralsQuery, (snapshot) => {
      const referralData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Referral[];
      setReferrals(referralData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'referrals');
    });

    const notificationsQuery = query(collection(db, 'notifications'), orderBy('timestamp', 'desc'));
    const unsubNotifications = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      
      if (notificationData.length === 0) {
        setNotifications([
          { id: '1', title: 'High Risk Alert', message: 'Tendai Moyo (Kuwirirana Clinic) has a risk score of 78%. Immediate review recommended.', type: 'warning', category: 'risk', timestamp: new Date().toISOString(), read: false },
          { id: '2', title: 'New Referral', message: 'Incoming referral from Zumba Clinic. ETA: 15 mins.', type: 'info', category: 'referral', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), read: false },
        ]);
      } else {
        setNotifications(notificationData);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'notifications');
    });

    return () => {
      unsubPatients();
      unsubReferrals();
      unsubNotifications();
    };
  }, [user, isMock]);

  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsProfileOpen(true);
  };

  const handleNewAssessment = () => {
    setIsAssessmentOpen(true);
  };

  const handleAssessmentSubmit = async (data: any) => {
    if (!user) return;
    try {
      const { riskScore, riskLevel, clinicalRecommendations, dangerSigns } = calculateMaternalRisk(
        {
          hivStatus: data.hivStatus,
          previousCSection: data.previousCSection,
          hypertension: data.hypertension,
          diabetes: data.diabetes,
          gravidity: parseInt(data.gravidity || '1'),
          parity: parseInt(data.parity || '0'),
          multiplePregnancy: data.multiplePregnancy || false,
          weight: parseFloat(data.weight),
          height: parseFloat(data.height),
          bmi: data.bmi,
          race: data.race,
          pphHistory: data.pphHistory,
          stillbirthHistory: data.stillbirthHistory,
          prematureBirthHistory: data.prematureBirthHistory,
          congenitalMalformationHistory: data.congenitalMalformationHistory,
          conceptionMethod: data.conceptionMethod,
          chronicRenalDisease: data.chronicRenalDisease,
          cardiovascularDisease: data.cardiovascularDisease,
          sickleCell: data.sickleCell,
          psychiatricHistory: data.psychiatricHistory,
          bloodTypeRhNegative: data.bloodTypeRhNegative,
        },
        { 
          age: parseInt(data.age), 
          heartRate: parseInt(data.heartRate),
          systolicBP: parseInt(data.systolicBP),
          diastolicBP: parseInt(data.diastolicBP),
          respRate: parseInt(data.respRate),
          spo2: parseInt(data.spo2),
          temperature: parseFloat(data.temperature),
          avpu: data.avpu,
          painScore: parseInt(data.painScore),
          hb: parseFloat(data.hb), 
          fetalHeartRate: parseInt(data.fetalHeartRate),
          headache: data.headache,
          blurringVision: data.blurringVision,
          chestPain: data.chestPain,
          dyspnea: data.dyspnea,
          abdominalPain: data.abdominalPain,
          swelling: data.swelling,
          vaginalBleeding: data.vaginalBleeding,
          proteinuria: data.proteinuria,
          reflexes: data.reflexes,
          activeConvulsions: data.activeConvulsions,
          epigastricPain: data.epigastricPain,
          bloodLoss: parseFloat(data.bloodLoss || '0'),
          cervicalDilatation: parseFloat(data.cervicalDilatation || '0'),
          moulding: parseInt(data.moulding || '0'),
          secondaryArrest: data.secondaryArrest,
          foulSmellingLiquor: data.foulSmellingLiquor,
          dangerSigns: [] 
        }
      );
      
      const initialVisit: ANCVisit = {
        id: 'init-' + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        gestationalAge: parseInt(data.gestationalAge || '0'),
        bp: `${data.systolicBP}/${data.diastolicBP}`,
        systolicBP: parseInt(data.systolicBP),
        diastolicBP: parseInt(data.diastolicBP),
        heartRate: parseInt(data.heartRate),
        respRate: parseInt(data.respRate),
        spo2: parseInt(data.spo2),
        temperature: parseFloat(data.temperature),
        avpu: data.avpu,
        painScore: parseInt(data.painScore),
        hb: parseFloat(data.hb),
        weight: parseFloat(data.weight),
        fetalHeartRate: parseInt(data.fetalHeartRate),
        riskScore,
        notes: 'Initial Assessment',
        dangerSigns: dangerSigns,
        clinicalRecommendations: clinicalRecommendations
      };
      
      const newPatientData: Omit<Patient, 'id'> = {
        name: data.name,
        age: parseInt(data.age),
        gestationalAge: parseInt(data.gestationalAge || '0'),
        riskScore,
        riskLevel,
        status: 'active',
        lastVisit: new Date().toISOString(),
        nextVisit: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        lnmp: data.lnmp,
        edd: data.edd,
        location: 'Gokwe North District',
        phone: '+263 77 000 0000',
        history: {
          hivStatus: data.hivStatus,
          previousCSection: data.previousCSection,
          hypertension: data.hypertension,
          diabetes: data.diabetes,
          gravidity: parseInt(data.gravidity || '1'),
          parity: parseInt(data.parity || '0'),
          multiplePregnancy: data.multiplePregnancy || false,
          weight: parseFloat(data.weight),
          height: parseFloat(data.height),
          bmi: data.bmi,
          race: data.race,
          pphHistory: data.pphHistory,
          stillbirthHistory: data.stillbirthHistory,
          prematureBirthHistory: data.prematureBirthHistory,
          congenitalMalformationHistory: data.congenitalMalformationHistory,
          conceptionMethod: data.conceptionMethod,
          chronicRenalDisease: data.chronicRenalDisease,
          cardiovascularDisease: data.cardiovascularDisease,
          sickleCell: data.sickleCell,
          psychiatricHistory: data.psychiatricHistory,
          bloodTypeRhNegative: data.bloodTypeRhNegative,
        },
        vitals: [initialVisit],
        createdBy: user.uid
      };

      let patientWithId: Patient;
      if (isMock) {
        const id = 'mock-' + Math.random().toString(36).substr(2, 9);
        patientWithId = { id, ...newPatientData } as Patient;
        const updatedPatients = addLocalItem(STORAGE_KEYS.PATIENTS, patientWithId, MOCK_PATIENTS);
        setPatients(updatedPatients);
      } else {
        const docRef = await addDoc(collection(db, 'patients'), newPatientData);
        patientWithId = { id: docRef.id, ...newPatientData } as Patient;
      }
      
      setSelectedPatient(patientWithId);
      setIsProfileOpen(true);
      
      if (riskLevel === 'high') {
        const notification = {
          title: 'High Risk Alert',
          message: `Patient ${data.name} identified as HIGH RISK (${riskScore}%). Immediate referral recommended.`,
          type: 'warning' as const,
          category: 'risk',
          timestamp: new Date().toISOString(),
          read: false
        };

        if (isMock) {
          const id = 'notif-' + Math.random().toString(36).substr(2, 9);
          const updatedNotifications = addLocalItem(STORAGE_KEYS.NOTIFICATIONS, { id, ...notification });
          setNotifications(updatedNotifications);
        } else {
          await addDoc(collection(db, 'notifications'), notification);
        }
      }

      setIsAssessmentOpen(false);
      toast.success('Assessment completed successfully' + (isMock ? ' (Simulation Mode)' : ''));
    } catch (error) {
      if (!isMock) handleFirestoreError(error, OperationType.CREATE, 'patients');
      else {
        console.error('Mock Save Error:', error);
        toast.error('Local save failed');
      }
    }
  };

  const handleANCSubmit = async (data: Partial<ANCVisit>) => {
    if (!user || !selectedPatient) return;
    try {
      const { riskScore, riskLevel } = calculateMaternalRisk(
        selectedPatient.history,
        { ...data as any, age: selectedPatient.age }
      );
      const visit: ANCVisit = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        gestationalAge: selectedPatient.gestationalAge,
        bp: data.bp || '',
        hb: data.hb || 0,
        weight: data.weight || 0,
        fetalHeartRate: data.fetalHeartRate || 0,
        riskScore,
        notes: data.notes,
        dangerSigns: data.dangerSigns || [],
        proteinuria: data.proteinuria,
        reflexes: data.reflexes,
        activeConvulsions: data.activeConvulsions,
        epigastricPain: data.epigastricPain,
        bloodLoss: data.bloodLoss,
        cervicalDilatation: data.cervicalDilatation,
        moulding: data.moulding,
        secondaryArrest: data.secondaryArrest,
        foulSmellingLiquor: data.foulSmellingLiquor,
      };

      const updates = {
        vitals: [...(selectedPatient.vitals || []), visit],
        riskScore,
        riskLevel: riskLevel as RiskLevel,
        lastVisit: visit.timestamp
      };

      if (isMock) {
        const updatedPatients = updateLocalItem<Patient>(STORAGE_KEYS.PATIENTS, selectedPatient.id, updates);
        setPatients(updatedPatients);
        setSelectedPatient({ ...selectedPatient, ...updates });
      } else {
        const patientRef = doc(db, 'patients', selectedPatient.id);
        await updateDoc(patientRef, {
          vitals: arrayUnion(visit),
          riskScore,
          riskLevel,
          lastVisit: visit.timestamp
        });
      }
      toast.success('ANC Visit recorded');
    } catch (error) {
      if (!isMock) handleFirestoreError(error, OperationType.UPDATE, `patients/${selectedPatient.id}`);
      else toast.error('Error recording visit locally');
    }
  };

  const handleReferralSubmit = async (data: Partial<Referral>) => {
    if (!user || !selectedPatient) return;
    try {
      const referralData = {
        ...data,
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        createdBy: user.uid,
        status: 'pending' as const,
        timestamp: new Date().toISOString()
      };

      if (isMock) {
        const id = 'ref-' + Math.random().toString(36).substr(2, 9);
        const updatedReferrals = addLocalItem(STORAGE_KEYS.REFERRALS, { id, ...referralData });
        setReferrals(updatedReferrals);
        
        const updatedPatients = updateLocalItem<Patient>(STORAGE_KEYS.PATIENTS, selectedPatient.id, { status: 'referred' });
        setPatients(updatedPatients);
      } else {
        await addDoc(collection(db, 'referrals'), referralData);
        const patientRef = doc(db, 'patients', selectedPatient.id);
        await updateDoc(patientRef, { status: 'referred' });
      }
      
      setIsReferralOpen(false);
      setIsProfileOpen(false);
      toast.success('Referral initiated');
    } catch (error) {
      if (!isMock) handleFirestoreError(error, OperationType.CREATE, 'referrals');
      else toast.error('Error initiating referral locally');
    }
  };

  const handleUpdateReferralStatus = async (referralId: string, status: Referral['status']) => {
    try {
      if (isMock) {
        const updatedReferrals = updateLocalItem<Referral>(STORAGE_KEYS.REFERRALS, referralId, { status });
        setReferrals(updatedReferrals);
      } else {
        const referralRef = doc(db, 'referrals', referralId);
        await updateDoc(referralRef, { status });
      }
      toast.success(`Referral ${status}`);
    } catch (error) {
      toast.error('Error updating status');
    }
  };

  const handleViewPatient = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setSelectedPatient(patient);
      setIsProfileOpen(true);
    } else {
      toast.error('Patient not found');
    }
  };

  const handleEmailLogin = async (email: string, pass: string, role: UserRole) => {
    setIsAuthLoading(true);
    try {
      await loginWithEmail(email, pass, role);
      toast.success('Welcome back');
    } catch (error: any) {
      toast.error('Authentication failed', { description: error.message });
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleGoogleLogin = async (role: UserRole) => {
    setIsAuthLoading(true);
    try {
      await login(role);
      toast.success('Welcome back');
    } catch (error: any) {
      toast.error('Google login failed', { description: error.message });
    } finally {
      setIsAuthLoading(false);
    }
  };


  const handleMarkAsRead = async (id: string) => {
    try {
      if (isMock) {
        const updatedNotifications = updateLocalItem<Notification>(STORAGE_KEYS.NOTIFICATIONS, id, { read: true });
        setNotifications(updatedNotifications);
      } else {
        const notificationRef = doc(db, 'notifications', id);
        await updateDoc(notificationRef, { read: true });
      }
    } catch (error) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }
  };

  const handleClearAllNotifications = async () => {
    if (isMock) {
      setNotifications([]);
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
    } else {
      setNotifications([]);
    }
  };

  return (
    <>
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage 
              onLogin={handleEmailLogin} 
              onGoogleLogin={handleGoogleLogin}
              isLoading={isAuthLoading} 
            />
          </PublicRoute>
        } />
        
        <Route path="/*" element={
          <ProtectedRoute>
            <Layout 
              onNewAssessment={handleNewAssessment}
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onClearAll={handleClearAllNotifications}
            >
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={
                  <Dashboard 
                    onPatientClick={handlePatientClick} 
                    patients={patients} 
                    referrals={referrals}
                    onNewPatient={handleNewAssessment}
                    onNewANC={() => {
                      if (patients.length > 0) {
                        setSelectedPatient(patients[0]);
                        setIsANCFormOpen(true);
                      } else {
                        toast.error('No patients registered');
                      }
                    }}
                    onReferral={() => {
                      if (patients.length > 0) {
                        setSelectedPatient(patients[0]);
                        setIsReferralOpen(true);
                      } else {
                        toast.error('No patients registered');
                      }
                    }}
                  />
                } />
                <Route path="/patients" element={
                  <PatientsPage 
                    patients={patients} 
                    onPatientClick={handlePatientClick} 
                    onNewPatient={handleNewAssessment}
                  />
                } />
                <Route path="/referrals" element={
                  <ReferralsPage 
                    referrals={referrals} 
                    onUpdateStatus={handleUpdateReferralStatus} 
                    onViewPatient={handleViewPatient}
                  />
                } />
                <Route path="/surveillance" element={<SurveillancePage />} />
                <Route path="/admin" element={<DistrictAdminPage />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>

      <PatientProfile 
        patient={selectedPatient} 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        onNewANC={() => { setIsProfileOpen(false); setIsANCFormOpen(true); }}
        onReferral={() => { setIsProfileOpen(false); setIsReferralOpen(true); }}
      />

      <RiskAssessment 
        isOpen={isAssessmentOpen} 
        onClose={() => setIsAssessmentOpen(false)}
        onSubmit={handleAssessmentSubmit}
      />

      <ANCVisitForm 
        isOpen={isANCFormOpen}
        onClose={() => setIsANCFormOpen(false)}
        patient={selectedPatient}
        onSubmit={handleANCSubmit}
      />

      <ReferralForm 
        isOpen={isReferralOpen}
        onClose={() => setIsReferralOpen(false)}
        patient={selectedPatient}
        onSubmit={handleReferralSubmit}
      />

      <ClinicalChatbot patient={selectedPatient} />
      <ReloadPrompt />
      <Toaster position="top-right" />
      <button 
        onClick={handleNewAssessment}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl shadow-blue-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 z-50 md:hidden"
      >
        <Plus className="w-6 h-6" />
      </button>
    </>
  );
}
