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

export default function LoginPage({ onLogin, isLoading }: LoginPageProps) {
  const [language, setLanguage] = useState<'EN' | 'SN' | 'ND'>('EN');
  const [online, setOnline] = useState(true);
  const [step, setStep] = useState<'role' | 'credentials'>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    setStep('credentials');
    // Pre-fill email for demo convenience
    setEmail(`${role}@chengeto.gov.zw`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole) {
      await onLogin(email, password, selectedRole);
    }
  };

  const currentRoleData = ROLES.find(r => r.id === selectedRole);

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-slate-950 overflow-hidden">
      {/* Left Pane: Branding & Illustration */}
      <div className="hidden lg:flex w-1/2 bg-[#0047AB] dark:bg-blue-950 relative items-center justify-center p-12 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-white blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-400 blur-[120px]" />
        </div>
        
        <div className="relative z-10 max-w-lg text-white space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <span className="text-white font-bold text-3xl">C</span>
            </div>
            <h1 className="text-5xl font-bold tracking-tight">Chengeto</h1>
            <p className="text-xl text-white/80 font-medium leading-relaxed">
              Protection Through Intelligent Maternal Care.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-6 pt-8 border-t border-white/10"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Rural Connectivity</h3>
                <p className="text-sm text-white/60">Optimized for low-bandwidth environments in Zimbabwe's rural districts.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Secure Data</h3>
                <p className="text-sm text-white/60">Role-based access control ensuring patient confidentiality at every level.</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Decorative Quote */}
        <div className="absolute bottom-12 left-12 right-12 text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold">
          Ministry of Health and Child Care • Zimbabwe 
        </div>
      </div>

      {/* Right Pane: Auth Flow */}
      <div className="w-full lg:w-1/2 flex flex-col bg-slate-50/50 dark:bg-slate-900/50">
        {/* Header with Language Toggle */}
        <header className="p-6 flex justify-between items-center">
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0047AB] flex items-center justify-center">
              <span className="text-white font-bold">C</span>
            </div>
            <span className="font-bold text-lg dark:text-white">Chengeto</span>
          </div>
          {!online && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-bold animate-pulse">
              <WifiOff className="w-3 h-3" />
              OFFLINE MODE
            </div>
          )}
          <div className="flex bg-black/[0.05] dark:bg-white/[0.05] p-1 rounded-full ml-auto">
            {['EN', 'SN', 'ND'].map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang as any)}
                className={cn(
                  "px-3 py-1 text-[10px] font-bold rounded-full transition-all",
                  language === lang ? "bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400" : "text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
                )}
              >
                {lang}
              </button>
            ))}
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            <AnimatePresence mode="wait">
              {step === 'role' ? (
                <motion.div
                  key="role-selection"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest">
                       Clinical Gateway
                    </div>
                    <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Select Portal</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Choose your clinical role to enter the secure dashboard.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {ROLES.map((role) => (
                      <button
                        key={role.id}
                        disabled={isLoading}
                        onClick={() => handleRoleSelect(role.id)}
                        className={cn(
                          "flex items-center gap-5 p-5 rounded-3xl border bg-white dark:bg-slate-800 text-left transition-all duration-300 group relative overflow-hidden",
                          "border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10",
                          "active:scale-[0.98]",
                          isLoading && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <div className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110",
                          role.bg, 
                          "dark:bg-opacity-20"
                        )}>
                          <role.icon className={cn("w-7 h-7", role.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-900 dark:text-white text-base">{role.title}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{role.description}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors" />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="credential-entry"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <button 
                    onClick={() => setStep('role')}
                    className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors text-xs font-bold uppercase tracking-widest"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Portals
                  </button>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", currentRoleData?.bg)}>
                        <currentRoleData.icon className={cn("w-5 h-5", currentRoleData?.color)} />
                      </div>
                      <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {currentRoleData?.title} Login
                      </h2>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Enter your credentials to access the secure portal.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Work Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input 
                            id="email"
                            type="email"
                            placeholder="name@chengeto.gov.zw"
                            className="h-14 pl-12 rounded-2xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-blue-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input 
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="h-14 pl-12 pr-12 rounded-2xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="remember" className="rounded-md border-slate-300" />
                        <label htmlFor="remember" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer">Remember Me</label>
                      </div>
                      <button type="button" className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline">Forgot Password?</button>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98]"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Authenticating...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          Sign In to Dashboard <ChevronRight className="w-4 h-4" />
                        </div>
                      )}
                    </Button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        <footer className="p-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-[1px] w-8 bg-slate-200 dark:bg-slate-800" />
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Secured by Ministry of Health
            </p>
            <div className="h-[1px] w-8 bg-slate-200 dark:bg-slate-800" />
          </div>
          <p className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-[0.2em]">
            Chengeto System v2.5.0 • Clinical Gateway • 2026
          </p>
        </footer>
      </div>
    </div>
  );
}
