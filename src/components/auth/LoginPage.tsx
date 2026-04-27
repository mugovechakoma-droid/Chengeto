import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Stethoscope, 
  UserCog, 
  ShieldCheck, 
  Hospital, 
  Eye, 
  EyeOff, 
  ChevronRight, 
  ArrowLeft,
  Globe,
  Lock,
  Mail,
  Loader2,
  WifiOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { UserRole } from '../../types';
import { isOnline } from '../../lib/firebase';

interface LoginPageProps {
  onLogin: (email: string, pass: string, role: UserRole) => Promise<void>;
  isLoading: boolean;
}

const ROLES = [
// ... (rest of the file)
  {
    id: 'pcn' as UserRole,
    title: 'Primary Care Nurse',
    description: 'Manages ANC data and initial risk assessments at local clinics.',
    icon: Stethoscope,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100'
  },
  {
    id: 'dmo' as UserRole,
    title: 'District Medical Officer',
    description: 'Oversees district-level escalations and ambulance dispatches.',
    icon: Hospital,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100'
  },
  {
    id: 'specialist' as UserRole,
    title: 'Provincial Specialist',
    description: 'High-level clinical oversight and specialist consultation.',
    icon: ShieldCheck,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-100'
  },
  {
    id: 'admin' as UserRole,
    title: 'System Administrator',
    description: 'Manages users, roles, and system-wide configurations.',
    icon: UserCog,
    color: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'border-slate-100'
  }
];

export default function LoginPage({ onLogin, onGoogleLogin, isLoading }: LoginPageProps) {
  const [language, setLanguage] = useState<'EN' | 'SN' | 'ND'>('EN');
  const [online, setOnline] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole>('pcn');
  
  const [email, setEmail] = useState('pcn@chengeto.gov.zw');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setOnline(isOnline());
    const handleStatus = () => setOnline(isOnline());
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(`${role}@chengeto.gov.zw`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin(email, password, selectedRole);
  };

  const currentRoleData = ROLES.find(r => r.id === selectedRole);

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-slate-950 overflow-hidden">
      {/* Left Pane: Branding & Illustration (Unchanged) */}
      <div className="hidden lg:flex w-1/2 bg-[#0047AB] dark:bg-blue-950 relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-white blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-400 blur-[120px]" />
        </div>
        
        <div className="relative z-10 max-w-lg text-white space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <span className="text-white font-bold text-3xl">C</span>
            </div>
            <h1 className="text-5xl font-bold tracking-tight">Chengeto</h1>
            <p className="text-xl text-white/80 font-medium leading-relaxed">Protection Through Intelligent Maternal Care.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="space-y-6 pt-8 border-t border-white/10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Rural Connectivity</h3>
                <p className="text-sm text-white/60">Optimized for Zimbabwe's rural district clinics.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Secure Data</h3>
                <p className="text-sm text-white/60">Role-based access ensuring patient confidentiality.</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-12 left-12 right-12 text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold">
          Ministry of Health and Child Care • Zimbabwe 
        </div>
      </div>

      {/* Right Pane: Unified Login Flow */}
      <div className="w-full lg:w-1/2 flex flex-col bg-slate-50/50 dark:bg-slate-900/50">
        <header className="p-6 flex justify-between items-center shrink-0">
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0047AB] flex items-center justify-center text-white font-bold">C</div>
            <span className="font-bold text-lg dark:text-white">Chengeto</span>
          </div>
          <div className="flex bg-black/[0.05] dark:bg-white/[0.05] p-1 rounded-full ml-auto">
            {['EN', 'SN', 'ND'].map((lang) => (
              <button key={lang} onClick={() => setLanguage(lang as any)} className={cn(
                "px-3 py-1 text-[10px] font-bold rounded-full transition-all",
                language === lang ? "bg-white dark:bg-slate-800 shadow-sm text-blue-600" : "text-black/40 hover:text-black"
              )}>{lang}</button>
            ))}
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 space-y-8 overflow-y-auto">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome Back</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Select your portal and enter credentials to continue.</p>
            </div>

            {/* Compact Role Selection */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ROLES.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleRoleSelect(role.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-300",
                    selectedRole === role.id 
                      ? "bg-white dark:bg-slate-800 border-blue-500 shadow-lg shadow-blue-500/10 scale-[1.02]" 
                      : "bg-white/50 dark:bg-white/5 border-transparent opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0 hover:border-slate-200"
                  )}
                >
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", role.bg, "dark:bg-opacity-20")}>
                    <role.icon className={cn("w-5 h-5", role.color)} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tight text-slate-900 dark:text-white text-center">
                    {role.id === 'pcn' ? 'Nurse' : role.id === 'dmo' ? 'DMO' : role.id === 'specialist' ? 'Provincial' : 'Admin'}
                  </span>
                </button>
              ))}
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="p-8 rounded-[32px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-700">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", currentRoleData?.bg)}>
                    <currentRoleData.icon className={cn("w-4 h-4", currentRoleData?.color)} />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    {currentRoleData?.title} Portal
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Work Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        type="email" 
                        className="h-12 pl-12 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-none focus:ring-blue-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        type={showPassword ? "text" : "password"}
                        className="h-12 pl-12 pr-12 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-none focus:ring-blue-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit"
                    disabled={isLoading} 
                    className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Access Secure Dashboard"}
                  </Button>

                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-100 dark:border-slate-700"></div>
                    </div>
                    <span className="relative px-4 bg-white dark:bg-slate-800 text-[8px] font-black uppercase tracking-widest text-slate-400">OR</span>
                  </div>

                  <Button 
                    type="button"
                    variant="outline"
                    disabled={isLoading}
                    onClick={() => onGoogleLogin(selectedRole)}
                    className="w-full h-12 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </main>

        <footer className="p-8 text-center shrink-0">
          <p className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-[0.2em]">Chengeto System v2.5.0 • Clinical Gateway • 2026</p>
        </footer>
      </div>
    </div>
  );
}
