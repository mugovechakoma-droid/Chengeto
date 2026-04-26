import { useState } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Users, 
  ArrowUpRight, 
  MessageSquare, 
  FileText, 
  Search,
  Filter,
  ChevronRight,
  AlertCircle,
  Stethoscope,
  History,
  TrendingUp,
  Map,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { Patient, Referral } from '../../types';

interface SpecialistDashboardProps {
  referrals: Referral[];
  patients: Patient[];
  onPatientClick: (patient: Patient) => void;
}

const MOCK_TRENDS = [
  { time: '08:00', risk: 45 },
  { time: '10:00', risk: 52 },
  { time: '12:00', risk: 78 },
  { time: '14:00', risk: 65 },
  { time: '16:00', risk: 82 },
  { time: '18:00', risk: 75 },
];

const MOCK_OUTCOMES = [
  { name: 'Stable', value: 65, color: '#10b981' },
  { name: 'Critical', value: 20, color: '#f59e0b' },
  { name: 'Surgery', value: 15, color: '#ef4444' },
];

export default function SpecialistDashboard({ referrals, patients, onPatientClick }: SpecialistDashboardProps) {
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const escalatedReferrals = referrals.filter(r => r.status === 'escalated' || r.urgency === 'emergency');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-120px)]">
      {/* Left Panel: Critical Escalations */}
      <div className="lg:col-span-4 flex flex-col gap-6 overflow-hidden">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-600" />
            Provincial Escalations
            {escalatedReferrals.length > 0 && (
              <Badge className="bg-purple-600 text-white">{escalatedReferrals.length}</Badge>
            )}
          </h2>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search critical cases..." 
            className="pl-10 rounded-xl bg-white dark:bg-slate-900 border-border"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {escalatedReferrals.length === 0 ? (
              <div className="mac-card p-12 text-center opacity-40">
                <ShieldCheck className="w-12 h-12 mx-auto mb-4" />
                <p className="text-sm font-bold">No active escalations</p>
              </div>
            ) : (
              escalatedReferrals.map(referral => (
                <motion.button
                  layoutId={referral.id}
                  key={referral.id}
                  onClick={() => setSelectedReferral(referral)}
                  className={cn(
                    "w-full text-left mac-card p-4 transition-all hover:scale-[1.02] active:scale-[0.98]",
                    selectedReferral?.id === referral.id ? "ring-2 ring-purple-600 border-transparent bg-purple-50/50 dark:bg-purple-900/20" : "bg-card border-border",
                    referral.urgency === 'emergency' && "border-l-4 border-l-red-600"
                  )}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{referral.patientName}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{referral.fromClinic}</p>
                    </div>
                    <Badge className={cn(
                      "text-[9px] font-bold uppercase tracking-widest",
                      referral.urgency === 'emergency' ? "bg-red-100 text-red-700" : "bg-purple-100 text-purple-700"
                    )}>
                      {referral.status === 'escalated' ? 'Escalated' : referral.urgency}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(referral.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center gap-1 text-red-600">
                      <Activity className="w-3 h-3" />
                      Risk: {referral.riskScore}%
                    </div>
                  </div>
                </motion.button>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Provincial Capacity Mini-Dashboard */}
        <div className="mac-card p-6 bg-purple-900 text-white space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-purple-300 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Tertiary Capacity
            </h3>
            <Badge className="bg-white/10 text-white border-none text-[8px]">OPTIMAL</Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <p className="text-[10px] font-bold text-purple-300 uppercase mb-1">ICU Beds</p>
              <div className="flex justify-between items-end">
                <p className="text-xl font-bold">2 <span className="text-[10px] font-medium opacity-50">Free</span></p>
              </div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <p className="text-[10px] font-bold text-purple-300 uppercase mb-1">Neonatal</p>
              <p className="text-xl font-bold">Ready</p>
            </div>
          </div>

          <div className="space-y-3">
             <p className="text-[10px] font-bold text-purple-300 uppercase tracking-widest">Specialists On-Call</p>
             <div className="flex -space-x-2">
                {[
                  { name: 'Dr. Z' }, { name: 'Dr. K' }, { name: 'Dr. L' }
                ].map((s, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-purple-900 bg-purple-700 flex items-center justify-center text-[10px] font-bold">
                    {s.name[4]}
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-purple-900 bg-purple-500/20 flex items-center justify-center text-[10px] font-bold">+2</div>
             </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Specialist Review & Consultation */}
      <div className="lg:col-span-8 flex flex-col gap-6 overflow-hidden">
        <AnimatePresence mode="wait">
          {selectedReferral ? (
            <motion.div
              key={selectedReferral.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col gap-6"
            >
              <div className="mac-card flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900 border-border">
                {/* Header */}
                <div className="p-6 border-b border-border bg-purple-50/30 dark:bg-purple-900/10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-purple-500/20">
                      {selectedReferral.patientName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedReferral.patientName}</h2>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Escalated from {selectedReferral.fromClinic}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-xl"
                      onClick={() => {
                        const patient = patients.find(p => p.id === selectedReferral.patientId);
                        if (patient) onPatientClick(patient);
                      }}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Full History
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-xl">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Impilo EHR
                    </Button>
                  </div>
                </div>

                <ScrollArea className="flex-1">
                  <div className="p-8 space-y-8">
                    {/* Clinical Performance & Trend */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <TrendingUp className="w-3 h-3" />
                          Risk Progression
                        </h4>
                        <div className="h-[200px] w-full mac-card p-4 bg-slate-50 dark:bg-slate-800/50">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={MOCK_TRENDS}>
                              <defs>
                                <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#9333ea" stopOpacity={0.1}/>
                                  <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                              <Tooltip />
                              <Area type="monotone" dataKey="risk" stroke="#9333ea" fillOpacity={1} fill="url(#colorRisk)" strokeWidth={3} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Activity className="w-3 h-3" />
                          Intervention Success
                        </h4>
                        <div className="h-[200px] w-full mac-card p-4 bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center">
                          <div className="h-full w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={MOCK_OUTCOMES}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={40}
                                  outerRadius={60}
                                  paddingAngle={8}
                                  dataKey="value"
                                >
                                  {MOCK_OUTCOMES.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="flex gap-4">
                             {MOCK_OUTCOMES.map(o => (
                               <div key={o.name} className="flex items-center gap-1.5">
                                 <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: o.color }} />
                                 <span className="text-[9px] font-bold text-slate-400 uppercase">{o.name}</span>
                               </div>
                             ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Clinical Findings */}
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Stethoscope className="w-3 h-3" />
                          Critical Findings
                        </h4>
                        <div className="space-y-3">
                          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                            <p className="text-xs font-bold text-red-600 uppercase mb-1">Primary Concern</p>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedReferral.reason}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-border">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">BP</p>
                              <p className="text-sm font-bold text-red-600">170/115</p>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-border">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Proteinuria</p>
                              <p className="text-sm font-bold text-amber-600">3+</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Specialist Consultation */}
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <MessageSquare className="w-3 h-3" />
                          Consultation Log
                        </h4>
                        <div className="space-y-3">
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                              <span className="text-[10px] font-bold text-blue-600">DM</span>
                            </div>
                            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-border">
                              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Dr. Moyo (District)</p>
                              <p className="text-xs">Patient unresponsive to MgSO4. Escalating for specialist intervention.</p>
                            </div>
                          </div>
                          <div className="flex gap-3 flex-row-reverse">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                              <span className="text-[10px] font-bold text-purple-600">SC</span>
                            </div>
                            <div className="p-3 rounded-2xl bg-purple-600 text-white">
                              <p className="text-[10px] font-bold text-purple-200 uppercase mb-1">You (Specialist)</p>
                              <p className="text-xs">Prepare for emergency C-section. ICU team notified.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                {/* Specialist Actions */}
                <div className="p-6 border-t border-border bg-slate-50/50 dark:bg-slate-800/50">
                  <div className="flex gap-3">
                    <Button className="flex-1 h-12 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Approve Transfer
                    </Button>
                    <Button variant="outline" className="flex-1 h-12 rounded-xl border-purple-200 text-purple-600 hover:bg-purple-50">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Direct Consultation
                    </Button>
                    <Button variant="outline" className="flex-1 h-12 rounded-xl border-red-200 text-red-600 hover:bg-red-50">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Emergency Protocol
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
              <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <ShieldCheck className="w-12 h-12 text-slate-300" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Specialist Oversight</h3>
                <p className="text-sm max-w-[300px]">Select an escalated case to provide provincial-level clinical guidance.</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
