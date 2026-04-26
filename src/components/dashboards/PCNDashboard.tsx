import { Patient } from '../../types';
import PatientCard from '../PatientCard';
import { 
  Users, 
  AlertTriangle, 
  ArrowUpRight, 
  CheckCircle2,
  Plus,
  ClipboardList,
  Ambulance,
  Search,
  Filter,
  LayoutGrid,
  List as ListIcon,
  Database,
  Zap,
  Sparkles,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { seedPatients, auth } from '../../lib/firebase';
import { toast } from 'sonner';
import { useState } from 'react';

const MOCK_UTILIZATION = [
  { name: 'Mon', anc: 12, deliveries: 2 },
  { name: 'Tue', anc: 15, deliveries: 1 },
  { name: 'Wed', anc: 8, deliveries: 4 },
  { name: 'Thu', anc: 18, deliveries: 3 },
  { name: 'Fri', anc: 14, deliveries: 2 },
  { name: 'Sat', anc: 5, deliveries: 1 },
  { name: 'Sun', anc: 3, deliveries: 0 },
];

interface PCNDashboardProps {
  patients: Patient[];
  onPatientClick: (patient: Patient) => void;
  onNewPatient: () => void;
  onNewANC: () => void;
  onReferral: () => void;
}

export default function PCNDashboard({ 
  patients, 
  onPatientClick, 
  onNewPatient, 
  onNewANC, 
  onReferral 
}: PCNDashboardProps) {
  const [isSeeding, setIsSeeding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  
  const highRiskCount = patients.filter(p => p.riskLevel === 'high').length;
  const referredCount = patients.filter(p => p.status === 'referred').length;

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === 'all' || p.riskLevel === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const handleSeedData = async () => {
    if (!auth.currentUser) return;
    setIsSeeding(true);
    try {
      await seedPatients(auth.currentUser.uid);
      toast.success('Demo data seeded successfully');
    } catch (error) {
      toast.error('Failed to seed demo data');
    } finally {
      setIsSeeding(false);
    }
  };

  const stats = [
    { label: 'Total Patients', value: patients.length.toLocaleString(), icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'High Risk', value: highRiskCount.toString(), icon: AlertTriangle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
    { label: 'Active Referrals', value: referredCount.toString(), icon: ArrowUpRight, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Deliveries (MTD)', value: '86', icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  ];

  const quickActions = [
    { label: 'Register New Patient', icon: Plus, color: 'bg-blue-600', onClick: onNewPatient },
    { label: 'New ANC Visit', icon: ClipboardList, color: 'bg-emerald-600', onClick: onNewANC },
    { label: 'View High-Risk', icon: AlertTriangle, color: 'bg-red-600', onClick: () => setRiskFilter('high') },
    { label: 'Initiate Referral', icon: Ambulance, color: 'bg-amber-600', onClick: onReferral },
  ];

  return (
    <div className="space-y-8">
      {/* Quick Actions - PCN Specific */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            onClick={action.onClick}
            className="flex flex-col items-center justify-center p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all active:scale-[0.98] group"
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg mb-4 group-hover:scale-110 transition-transform", action.color)}>
              <action.icon className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white text-center">{action.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="mac-card p-6 flex items-center gap-4 bg-card text-card-foreground border-border shadow-sm"
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 space-y-8">
          {/* Service Utilization Chart */}
          <div className="mac-card p-8 bg-white dark:bg-slate-900 border-border">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-foreground">Clinic Utilization</h3>
                <p className="text-xs text-muted-foreground">ANC Visits vs. Deliveries this week</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">ANC</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Deliveries</span>
                </div>
              </div>
            </div>
            <div className="h-[280px] w-full min-h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_UTILIZATION} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAnc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#94a3b8'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="anc" stroke="#2563eb" fillOpacity={1} fill="url(#colorAnc)" strokeWidth={3} />
                  <Area type="monotone" dataKey="deliveries" stroke="#10b981" fillOpacity={1} fill="url(#colorDel)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50 dark:bg-slate-900/50 p-4 rounded-[32px] border border-slate-100 dark:border-slate-800 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-bold text-foreground">Clinic Monitoring</h3>
              <div className="hidden sm:flex bg-muted p-1 rounded-full">
                <Button variant="ghost" size="sm" className="h-7 px-3 bg-background shadow-xs rounded-full text-foreground text-[10px] font-bold uppercase tracking-wider">
                  Grid
                </Button>
                <Button variant="ghost" size="sm" className="h-7 px-3 text-muted-foreground hover:text-foreground text-[10px] font-bold uppercase tracking-wider">
                  List
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search name or ID..." 
                  className="pl-9 h-9 rounded-full border-none bg-muted/50 text-xs focus:bg-muted"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex bg-muted/50 p-1 rounded-full border border-border">
                {['all', 'high', 'low'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setRiskFilter(level as any)}
                    className={cn(
                      "px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all",
                      riskFilter === level 
                        ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient, i) => (
                  <motion.div
                    key={patient.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <PatientCard 
                      patient={patient} 
                      onClick={() => onPatientClick(patient)} 
                    />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center opacity-30">
                   <Users className="w-12 h-12 mx-auto mb-4" />
                   <p className="font-bold">No clinical profiles found</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

        {/* Intelligence Sidebar */}
        <div className="xl:col-span-4 space-y-6">
           <div className="mac-card p-6 bg-blue-600 text-white rounded-[32px] shadow-2xl shadow-blue-600/30 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                 <Sparkles className="w-24 h-24" />
              </div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                 <Zap className="w-3 h-3 text-white" />
                 Clinical Intelligence
              </h4>
              <div className="space-y-4 relative z-10">
                 <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                    <p className="text-[10px] font-bold uppercase opacity-60">High Risk Saturation</p>
                    <div className="flex items-end justify-between mt-1">
                       <p className="text-2xl font-black">{Math.round((highRiskCount/patients.length)*100 || 0)}%</p>
                       <Badge className="bg-red-500/20 text-red-200 border-none text-[8px]">CRITICAL CLUSTER</Badge>
                    </div>
                    <div className="w-full bg-white/10 h-1 mt-3 rounded-full overflow-hidden">
                       <div className="bg-white h-full" style={{ width: `${(highRiskCount/patients.length)*100}%` }} />
                    </div>
                 </div>
                 <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                    <p className="text-[10px] font-bold uppercase opacity-60">Expected Deliveries (7D)</p>
                    <p className="text-2xl font-black mt-1">14 <span className="text-xs font-medium opacity-60">Patients</span></p>
                    <div className="mt-3 flex -space-x-2">
                       {[...Array(5)].map((_, i) => (
                         <div key={i} className="w-6 h-6 rounded-full border-2 border-blue-600 bg-white/20" />
                       ))}
                       <div className="w-6 h-6 rounded-full border-2 border-blue-600 bg-white/40 flex items-center justify-center text-[8px] font-bold">+9</div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Upcoming Tasks */}
           <div className="mac-card p-6 border-none bg-emerald-50 dark:bg-emerald-900/10 rounded-[32px] space-y-4">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                Priority Tasks
              </h4>
              <div className="space-y-3">
                 {[
                   { label: 'Sarah Moyo (ANC)', time: 'Overdue', urgency: 'high' },
                   { label: 'Update Stock Levels', time: 'Today', urgency: 'medium' },
                   { label: 'Referral Follow-up', time: 'Tomorrow', urgency: 'low' }
                 ].map(task => (
                   <div key={task.label} className="p-3 rounded-2xl bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between group cursor-pointer hover:border-emerald-200 border border-transparent transition-all">
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{task.label}</p>
                        <p className={cn(
                          "text-[9px] font-bold uppercase",
                          task.urgency === 'high' ? 'text-red-500' : 'text-slate-400'
                        )}>{task.time}</p>
                      </div>
                      <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                   </div>
                 ))}
              </div>
           </div>

           <div className="mac-card p-6 border-none bg-slate-50 dark:bg-white/5 rounded-[32px] space-y-4">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Resource Status</h4>
              <div className="space-y-4">
                 {[
                   { label: 'Magnesium Sulfate', level: 85, status: 'Optimal', color: 'bg-emerald-500' },
                   { label: 'Blood O- (Local)', level: 12, status: 'Low Stock', color: 'bg-red-500' },
                   { label: 'Ambulance Fuel', level: 65, status: '65%', color: 'bg-blue-500' }
                 ].map(r => (
                   <div key={r.label} className="space-y-2">
                      <div className="flex items-center justify-between">
                         <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{r.label}</span>
                         <span className="text-[10px] font-black uppercase text-slate-400">{r.status}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${r.level}%` }}
                           className={cn("h-full rounded-full", r.color)}
                         />
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
