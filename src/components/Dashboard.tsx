import { Patient, Referral } from '../types';
import { useFirebase } from '../contexts/FirebaseContext';
import PCNDashboard from './dashboards/PCNDashboard';
import DMODashboard from './dashboards/DMODashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import SpecialistDashboard from './dashboards/SpecialistDashboard';
import { 
  Hospital, 
  ShieldCheck, 
  UserCog,
  LayoutDashboard
} from 'lucide-react';

interface DashboardProps {
  patients: Patient[];
  referrals: Referral[];
  onPatientClick: (patient: Patient) => void;
  onNewPatient: () => void;
  onNewANC: () => void;
  onReferral: () => void;
}

export default function Dashboard(props: DashboardProps) {
  const { profile } = useFirebase();

  switch (profile?.role) {
    case 'pcn':
      return <PCNDashboard {...props} />;
    
    case 'dmo':
      return <DMODashboard referrals={props.referrals} patients={props.patients} onPatientClick={props.onPatientClick} />;
    
    case 'specialist':
      return <SpecialistDashboard referrals={props.referrals} patients={props.patients} onPatientClick={props.onPatientClick} />;
    
    case 'admin':
      return <AdminDashboard referrals={props.referrals} patients={props.patients} onPatientClick={props.onPatientClick} />;
    
    default:
      return <PlaceholderDashboard 
        title="Mission Control" 
        description="Welcome to Chengeto. Please wait while your profile is being configured."
        icon={LayoutDashboard}
      />;
  }
}

function PlaceholderDashboard({ title, description, icon: Icon }: { title: string, description: string, icon: any }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 max-w-2xl mx-auto">
      <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xl shadow-blue-500/10">
        <Icon className="w-10 h-10" />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">{title}</h2>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full pt-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-muted/50 border border-dashed border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Module {i} Pending
          </div>
        ))}
      </div>
    </div>
  );
}
