import { useState, useEffect } from 'react';
import { 
  Referral, 
  Patient, 
  RiskLevel 
} from '../../types';
import { 
  AlertCircle, 
  Clock, 
  MapPin, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Ambulance, 
  Stethoscope,
  Activity,
  ArrowUpRight,
  ShieldAlert,
  Users,
  Timer,
  MessageSquare,
  Hospital,
  Droplets,
  Bed,
  UserCheck,
  History,
  TrendingUp,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { db, auth, handleFirestoreError, OperationType } from '../../lib/firebase';
import { doc, updateDoc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { toast } from 'sonner';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const MOCK_REFERRAL_TRENDS = [
  { day: 'Mon', count: 12 },
  { day: 'Tue', count: 18 },
  { day: 'Wed', count: 15 },
  { day: 'Thu', count: 24 },
  { day: 'Fri', count: 32 },
  { day: 'Sat', count: 28 },
  { day: 'Sun', count: 14 },
];

const MOCK_HEATMAP = [
  { clinic: 'Murehwa North', emergencies: 12, urgent: 45, color: 'bg-red-500' },
  { clinic: 'Gokwe South', emergencies: 4, urgent: 28, color: 'bg-amber-500' },
  { clinic: 'Mutare Central', emergencies: 1, urgent: 12, color: 'bg-blue-500' },
];

interface DMODashboardProps {
  referrals: Referral[];
  patients: Patient[];
  onPatientClick: (patient: Patient) => void;
}

export default function DMODashboard({ referrals, patients, onPatientClick }: DMODashboardProps) {
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const activeReferrals = referrals.filter(r => r.status !== 'completed' && r.status !== 'rejected');
  const pendingReferrals = activeReferrals.filter(r => r.status === 'pending');
  const enRouteReferrals = activeReferrals.filter(r => r.status === 'dispatched');

  const handleAction = async (referralId: string, newStatus: Referral['status'], note?: string) => {
    setIsProcessing(true);
    try {
      const ref = doc(db, 'referrals', referralId);
      const timelineEntry = {
        status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1),
        timestamp: new Date().toISOString(),
        note
      };
      
      await updateDoc(ref, {
        status: newStatus,
        acceptedBy: newStatus === 'accepted' ? auth.currentUser?.uid : undefined,
        acceptedAt: newStatus === 'accepted' ? new Date().toISOString() : undefined,
        timeline: [...(selectedReferral?.timeline || []), timelineEntry]
      });
      
      toast.success(`Referral ${newStatus} successfully`);
      if (selectedReferral?.id === referralId) {
        setSelectedReferral(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `referrals/${referralId}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getPatientData = (patientId: string) => patients.find(p => p.id === patientId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-120px)]">
      {/* Left Panel: Referral Feed */}
      <div className="lg:col-span-4 flex flex-col gap-6 overflow-hidden">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-600" />
            Incoming Referrals
            {pendingReferrals.length > 0 && (
              <Badge className="bg-red-600 text-white animate-pulse">{pendingReferrals.length} NEW</Badge>
            )}
          </h2>
        </div>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {activeReferrals.length === 0 ? (
              <div className="mac-card p-12 text-center opacity-40">
                <Ambulance className="w-12 h-12 mx-auto mb-4" />
                <p className="text-sm font-bold">No active referrals</p>
              </div>
            ) : (
              activeReferrals.sort((a, b) => {
                if (a.urgency === 'emergency' && b.urgency !== 'emergency') return -1;
                if (a.urgency !== 'emergency' && b.urgency === 'emergency') return 1;
                return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
              }).map(referral => (
                <motion.button
                  layoutId={referral.id}
                  key={referral.id}
                  onClick={() => setSelectedReferral(referral)}
                  className={cn(
                    "w-full text-left mac-card p-4 transition-all hover:scale-[1.02] active:scale-[0.98]",
                    selectedReferral?.id === referral.id ? "ring-2 ring-blue-600 border-transparent bg-blue-50/50 dark:bg-blue-900/20" : "bg-card border-border",
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
                      referral.urgency === 'emergency' ? "bg-red-100 text-red-700" : 
                      referral.urgency === 'urgent' ? "bg-amber-100 text-amber-700" : 
                      "bg-blue-100 text-blue-700"
                    )}>
                      {referral.urgency}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      <span className="truncate">{referral.reason}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                        <Clock className="w-3 h-3" />
                        {new Date(referral.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 uppercase">
                        <Timer className="w-3 h-3" />
                        ETA: 25m
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Emergency Readiness Mini-Dashboard */}
        <div className="mac-card p-6 bg-slate-900 text-white space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Hospital className="w-4 h-4 text-blue-400" />
              District Readiness
            </h3>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[8px]">LEVEL 1 ALPHA</Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <Bed className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] font-bold text-emerald-400">4 FREE</span>
              </div>
              <p className="text-sm font-bold">Maternity</p>
              <div className="w-full h-1 bg-white/10 mt-3 rounded-full overflow-hidden">
                <div className="bg-blue-400 h-full w-[80%]" />
              </div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <Droplets className="w-4 h-4 text-red-400" />
                <span className="text-[10px] font-bold text-red-400">LOW</span>
              </div>
              <p className="text-sm font-bold">Blood Stock</p>
              <div className="w-full h-1 bg-white/10 mt-3 rounded-full overflow-hidden">
                <div className="bg-red-400 h-full w-[25%]" />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Regional Heatmap</p>
            {MOCK_HEATMAP.map(item => (
              <div key={item.clinic} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={cn("w-2 h-2 rounded-full", item.color)} />
                  <span className="text-xs font-medium text-slate-300 group-hover:text-white">{item.clinic}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500">{item.emergencies} EM</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    <div className="lg:col-span-8 flex flex-col gap-6 overflow-hidden">
        {/* Referral Trends Chart */}
        <div className="mac-card p-6 bg-white dark:bg-slate-900 border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold">District Referral Volume</h3>
              <p className="text-xs text-muted-foreground">Emergency vs. Urgent trends (7D)</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">AVG Response</p>
                <p className="text-xl font-black text-blue-600">12m 45s</p>
              </div>
              <div className="text-right border-l pl-6 border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Outcome Pos.</p>
                <p className="text-xl font-black text-emerald-600">98.2%</p>
              </div>
            </div>
          </div>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_REFERRAL_TRENDS}>
                <defs>
                  <linearGradient id="colorRef" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRef)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

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
                {/* Detail Header */}
                <div className="p-6 border-b border-border bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/20">
                      {selectedReferral.patientName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h2 
                        className="text-xl font-bold text-slate-900 dark:text-white cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => {
                          const patient = getPatientData(selectedReferral.patientId);
                          if (patient) onPatientClick(patient);
                        }}
                      >
                        {selectedReferral.patientName}
                      </h2>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest">ID: {selectedReferral.patientId}</Badge>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">From: {selectedReferral.fromClinic}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                      <p className="text-sm font-bold text-blue-600 uppercase tracking-tight">{selectedReferral.status}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedReferral(null)} className="rounded-full">
                      <XCircle className="w-5 h-5 text-slate-400" />
                    </Button>
                  </div>
                </div>

                <ScrollArea className="flex-1">
                  <div className="p-8 space-y-8">
                    {/* Clinical Summary Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Stethoscope className="w-3 h-3" />
                          Patient Profile
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Age</span>
                            <span className="font-bold dark:text-white">28 Years</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Gestation</span>
                            <span className="font-bold dark:text-white">34 Weeks</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Parity</span>
                            <span className="font-bold dark:text-white">G3 P2</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Activity className="w-3 h-3" />
                          Latest Vitals
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">BP</span>
                            <span className="font-bold text-red-600">165/110</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Hb</span>
                            <span className="font-bold dark:text-white">10.2 g/dL</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Risk Score</span>
                            <span className="font-bold text-red-600">{selectedReferral.riskScore}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <AlertCircle className="w-3 h-3" />
                          Danger Signs
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedReferral.dangerSigns?.map(sign => (
                            <Badge key={sign} className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-none text-[10px]">
                              {sign}
                            </Badge>
                          )) || <span className="text-xs text-slate-400 italic">None reported</span>}
                        </div>
                      </div>
                    </div>

                    {/* Referral Reason & Notes */}
                    <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-border space-y-3">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Referral Reason & Clinical Notes</h4>
                      <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                        {selectedReferral.reason}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
                        "{selectedReferral.timeline[0]?.note || 'No additional notes provided.'}"
                      </p>
                    </div>

                    {/* Tracking Timeline */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Timer className="w-3 h-3" />
                        Referral Tracking
                      </h4>
                      <div className="relative pl-8 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-800">
                        {selectedReferral.timeline.slice().reverse().map((event, i) => (
                          <div key={i} className="relative">
                            <div className={cn(
                              "absolute -left-8 top-1 w-6 h-6 rounded-full border-4 border-white dark:border-slate-950 flex items-center justify-center z-10",
                              i === 0 ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
                            )}>
                              {i === 0 && <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />}
                            </div>
                            <div>
                              <p className="text-xs font-bold dark:text-white">{event.status}</p>
                              <p className="text-[10px] text-slate-400 font-medium">
                                {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {event.note && ` • ${event.note}`}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                {/* Decision Panel */}
                <div className="p-6 border-t border-border bg-slate-50/50 dark:bg-slate-800/50">
                  <div className="flex flex-wrap gap-3">
                    {selectedReferral.status === 'pending' && (
                      <>
                        <Button 
                          onClick={() => handleAction(selectedReferral.id, 'accepted')}
                          disabled={isProcessing}
                          className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Accept Referral
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => handleAction(selectedReferral.id, 'rejected', 'Capacity full')}
                          disabled={isProcessing}
                          className="flex-1 h-12 rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Decline / Redirect
                        </Button>
                      </>
                    )}
                    
                    {selectedReferral.status === 'accepted' && (
                      <>
                        <Button 
                          className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2"
                        >
                          <Ambulance className="w-4 h-4" />
                          Prepare Emergency Team
                        </Button>
                        <Button 
                          variant="outline"
                          className="flex-1 h-12 rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <Droplets className="w-4 h-4 mr-2" />
                          Request Blood
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => handleAction(selectedReferral.id, 'escalated', 'Requires tertiary care')}
                          className="flex-1 h-12 rounded-xl border-purple-200 text-purple-600 hover:bg-purple-50"
                        >
                          <ArrowUpRight className="w-4 h-4 mr-2" />
                          Escalate to Provincial
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Communication Panel */}
              <div className="mac-card p-4 flex items-center justify-between bg-blue-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Direct Channel: {selectedReferral.fromClinic}</h4>
                    <p className="text-[10px] font-medium opacity-70 tracking-tight">Nurse on duty: Sr. Sibanda</p>
                  </div>
                </div>
                <Button variant="secondary" size="sm" className="rounded-full bg-white text-blue-600 hover:bg-blue-50">
                  Open Consultation
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
              <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <ShieldAlert className="w-12 h-12 text-slate-300" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">No Referral Selected</h3>
                <p className="text-sm max-w-[300px]">Select a referral from the feed to review clinical data and make a decision.</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
