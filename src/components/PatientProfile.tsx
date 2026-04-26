import React, { useState } from 'react';
import { Patient, ANCVisit } from '../types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  MapPin, 
  Calendar, 
  History, 
  Activity,
  ChevronRight,
  FileText,
  AlertCircle,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Heart,
  Droplets,
  Thermometer,
  Baby,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import DeliveryForm from './DeliveryForm';
import NeonatalDashboard from './NeonatalDashboard';
import { Neonate, DeliveryRecord, NeonatalVisit } from '../types';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface PatientProfileProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onNewANC?: () => void;
  onReferral?: () => void;
}

function VitalsChart({ vitals }: { vitals: ANCVisit[] }) {
  const data = vitals.map(v => ({
    date: new Date(v.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    bp_sys: v.systolicBP || parseInt(v.bp?.split('/')[0] || '0'),
    bp_dia: v.diastolicBP || parseInt(v.bp?.split('/')[1] || '0'),
    hr: v.heartRate,
    hb: v.hb,
  }));

  return (
    <div className="h-64 w-full mt-4 bg-slate-50/50 dark:bg-white/5 rounded-3xl p-4 border border-black/[0.03] dark:border-white/[0.03]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorSys" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888888" strokeOpacity={0.1} />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fontWeight: 600, fill: '#888888' }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fontWeight: 600, fill: '#888888' }}
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '16px', 
              border: 'none', 
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
              fontSize: '11px',
              fontWeight: 700
            }}
          />
          <Area 
            type="monotone" 
            dataKey="bp_sys" 
            stroke="#3b82f6" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorSys)" 
            name="Systolic BP"
          />
          <Area 
            type="monotone" 
            dataKey="bp_dia" 
            stroke="#60a5fa" 
            strokeWidth={2}
            fillOpacity={0} 
            name="Diastolic BP"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function PatientProfile({ patient, isOpen, onClose, onNewANC, onReferral }: PatientProfileProps) {
  const navigate = useNavigate();
  const [isDeliveryOpen, setIsDeliveryOpen] = React.useState(false);
  const [isNeonatalScreeningOpen, setIsNeonatalScreeningOpen] = React.useState(false);
  
  if (!patient) return null;

  const handleDeliverySave = (record: Partial<DeliveryRecord>) => {
    console.log('Saving Delivery Record:', record);
    setIsDeliveryOpen(false);
  };

  const latestVisit = patient.vitals && patient.vitals.length > 0 ? patient.vitals[patient.vitals.length - 1] : null;

  const mockNeonate: Neonate | null = patient.status === 'delivered' ? {
    id: 'baby-' + patient.id,
    motherId: patient.id,
    deliveryId: 'del-123',
    name: "Baby " + patient.name.split(' ')[1],
    dateOfBirth: new Date().toISOString(),
    gender: 'female',
    birthWeight: 3100,
    gestationalAge: 39,
    riskScore: 45,
    riskLevel: 'moderate',
    currentStatus: 'monitoring',
    visits: [],
    lastScreening: new Date().toISOString()
  } : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] lg:!max-w-[1240px] h-[92vh] p-0 border-none bg-white/95 dark:bg-slate-950/95 backdrop-blur-3xl overflow-hidden rounded-[40px] shadow-[0_64px_128px_-32px_rgba(0,0,0,0.3)] flex flex-col">
        <ScrollArea className="flex-1 w-full">
          <div className="p-10 space-y-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-[28px] bg-blue-600 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-blue-500/20">
                  {patient.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <DialogTitle className="text-4xl font-black tracking-tight dark:text-white">{patient.name}</DialogTitle>
                    {patient.riskLevel === 'high' && (
                      <Badge className="bg-red-500 text-white border-none px-3 py-1 rounded-lg font-black uppercase tracking-widest text-[10px] animate-pulse">
                        High Risk
                      </Badge>
                    )}
                  </div>
                  <DialogDescription className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="rounded-xl bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white/60 border-none font-bold text-xs px-3">
                      ID: {patient.id}
                    </Badge>
                    <span className="text-slate-300 dark:text-slate-700 font-bold">•</span>
                    <span className="text-base font-bold text-slate-500">{patient.age} years old</span>
                    <span className="text-slate-300 dark:text-slate-700 font-bold">•</span>
                    <span className="text-base font-bold text-slate-500">{patient.location}</span>
                  </DialogDescription>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {patient.status !== 'delivered' ? (
                  <>
                    <Button variant="outline" onClick={() => setIsDeliveryOpen(true)} className="rounded-full h-12 px-6 text-sm font-bold border-blue-200 text-blue-600 dark:border-blue-900/40">
                       <Baby className="w-5 h-5 mr-2" /> Record Delivery
                    </Button>
                    <Button variant="outline" onClick={onNewANC} className="rounded-full h-12 px-6 text-sm font-bold border-black/[0.1] dark:border-white/[0.1]">New ANC Visit</Button>
                    <Button onClick={onReferral} className="rounded-full h-12 px-6 text-sm font-bold bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20 text-white">Refer Patient</Button>
                  </>
                ) : (
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-none px-8 py-4 rounded-3xl font-black uppercase tracking-[0.1em] text-[14px] shadow-sm">
                     <Sparkles className="w-5 h-5 mr-2" /> Delivered Successfully
                  </Badge>
                )}
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Left Column (8/12) */}
              <div className="lg:col-span-8 space-y-12">
                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: 'Risk Score', value: `${patient.riskScore}%`, color: patient.riskLevel === 'high' ? 'text-red-500' : 'text-blue-600' },
                    { label: 'Gestation', value: `${patient.gestationalAge} wks`, color: 'text-slate-900 dark:text-white' },
                    { label: 'Hb Level', value: `${latestVisit?.hb || '--'} g/dL`, color: 'text-slate-900 dark:text-white' },
                    { label: 'Blood Sugar', value: `${latestVisit?.bloodSugar || '--'} mmol/L`, color: 'text-slate-900 dark:text-white' },
                    { label: 'EDD', value: patient.edd ? new Date(patient.edd).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'N/A', color: 'text-slate-900 dark:text-white' }
                  ].map((m, i) => (
                    <div key={i} className="mac-card p-6 bg-slate-50 dark:bg-white/5 border-none rounded-[32px]">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{m.label}</p>
                      <p className={cn("text-3xl font-black tracking-tight", m.color)}>{m.value}</p>
                    </div>
                  ))}
                </div>

                {/* Vitals & Trends */}
                <div className="space-y-6">
                   <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                     <TrendingUp className="w-4 h-4 text-blue-500" />
                     Vitals & Trending
                   </h4>
                   <VitalsChart vitals={patient.vitals || []} />
                </div>

                {/* Visit History */}
                <div className="space-y-8">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    Visit Timeline
                  </h4>
                  <div className="relative pl-10 space-y-10 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-800">
                    {patient.vitals && patient.vitals.length > 0 ? patient.vitals.slice().reverse().map((visit, i) => (
                      <div key={visit.id} className="relative">
                        <div className={cn(
                          "absolute -left-10 top-1 w-8 h-8 rounded-full border-4 border-white dark:border-slate-950 flex items-center justify-center z-10",
                          visit.riskScore > 60 ? "bg-red-600" : visit.riskScore > 30 ? "bg-amber-500" : "bg-emerald-500"
                        )}>
                          <span className="text-[10px] font-bold text-white">{patient.vitals.length - i}</span>
                        </div>
                        <div className="mac-card p-8 bg-white dark:bg-white/5 rounded-[40px] border border-black/[0.03] dark:border-white/[0.03] shadow-sm hover:shadow-xl transition-all">
                          <div className="flex items-center justify-between mb-8">
                             <div>
                                <p className="text-lg font-black dark:text-white">Visit #{patient.vitals.length - i}</p>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date(visit.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                             </div>
                             <Badge variant="outline" className="rounded-full px-4 py-1 border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase">{visit.gestationalAge} Weeks</Badge>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-8">
                             <div className="space-y-1">
                               <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">BP / HR</p>
                               <p className="text-xl font-bold dark:text-white">{visit.systolicBP}/{visit.diastolicBP} <span className="text-xs font-normal opacity-50 ml-1">/ {visit.heartRate}</span></p>
                             </div>
                             <div className="space-y-1">
                               <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Temperature</p>
                               <p className="text-xl font-bold dark:text-white">{visit.temperature}°C</p>
                             </div>
                             <div className="space-y-1">
                               <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Hb / Sugar</p>
                               <p className="text-xl font-bold dark:text-white">{visit.hb} <span className="text-xs font-normal opacity-50 ml-1">/ {visit.bloodSugar || '--'}</span></p>
                             </div>
                             <div className="space-y-1">
                               <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">FHR</p>
                               <p className="text-xl font-bold dark:text-white">{visit.fetalHeartRate} bpm</p>
                             </div>
                          </div>

                          {visit.clinicalRecommendations && (
                             <div className="mt-8 p-6 rounded-3xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30">
                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4" />
                                  EDLIZ Recommendation
                                </p>
                                <div className="space-y-2">
                                  {visit.clinicalRecommendations.map((rec, rIdx) => (
                                    <div key={rIdx} className="flex gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                                      {rec}
                                    </div>
                                  ))}
                                </div>
                             </div>
                          )}
                        </div>
                      </div>
                    )) : (
                      <div className="p-20 text-center opacity-20 italic">No historical visits recorded.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column (4/12) */}
              <div className="lg:col-span-4 space-y-10">
                {/* Obstetric Profile */}
                <div className="mac-card p-10 bg-slate-900 text-white rounded-[48px] border-none shadow-2xl relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 opacity-10 group-hover:scale-125 transition-transform duration-700">
                     <History className="w-40 h-40" />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] opacity-40 mb-8">Obstetric Profile</h4>
                  <div className="space-y-6 relative z-10">
                    <div className="flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/10">
                      <span className="text-sm font-bold opacity-60">Gravidity</span>
                      <span className="text-3xl font-black">{patient.history.gravidity}</span>
                    </div>
                    <div className="flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/10">
                      <span className="text-sm font-bold opacity-60">Parity</span>
                      <span className="text-3xl font-black">{patient.history.parity}</span>
                    </div>
                    <div className="pt-4 space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Identified Enablers</p>
                      <div className="flex flex-wrap gap-2">
                        {patient.history.previousCSection && <Badge className="bg-blue-500 text-white border-none rounded-xl">Prev C-Section</Badge>}
                        {patient.history.pphHistory && <Badge className="bg-red-500 text-white border-none rounded-xl">Prior PPH</Badge>}
                        {patient.history.hypertension && <Badge className="bg-amber-500 text-white border-none rounded-xl">Chronic HTN</Badge>}
                        {patient.history.hivStatus === 'positive' && <Badge className="bg-purple-500 text-white border-none rounded-xl">HIV+</Badge>}
                        {patient.history.multiplePregnancy && <Badge className="bg-emerald-500 text-white border-none rounded-xl">Multiple</Badge>}
                        {patient.history.cardiacDisease && <Badge className="bg-pink-500 text-white border-none rounded-xl">Cardiac</Badge>}
                        {patient.history.placentaPrevia && <Badge className="bg-orange-500 text-white border-none rounded-xl">Placenta Praevia</Badge>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Safety Warnings */}
                {(patient.history.cardiacDisease || patient.history.placentaPrevia || (latestVisit && (latestVisit.systolicBP >= 140 || latestVisit.diastolicBP >= 90 || latestVisit.bloodLoss > 500))) && (
                  <div className="mac-card p-8 bg-red-500 text-white rounded-[40px] border-none shadow-xl space-y-6">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-6 h-6 animate-pulse" />
                      <h4 className="text-sm font-black uppercase tracking-widest">Clinical Safety Alerts</h4>
                    </div>
                    <div className="space-y-4">
                      {patient.history.cardiacDisease && (
                        <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
                          <p className="text-xs font-black uppercase mb-1">Cardiac Protocol</p>
                          <p className="text-[11px] leading-relaxed opacity-90">DO NOT give Ergometrine. Use Oxytocin 10 units for 3rd stage. Avoid fluid overload.</p>
                        </div>
                      )}
                      {patient.history.placentaPrevia && (
                        <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
                          <p className="text-xs font-black uppercase mb-1">Vaginal Bleeding Protocol</p>
                          <p className="text-[11px] leading-relaxed opacity-90">DO NOT perform digital Vaginal Examination (VE). Diagnose via Ultrasound.</p>
                        </div>
                      )}
                      {latestVisit && (latestVisit.systolicBP >= 140 || latestVisit.diastolicBP >= 90) && (
                        <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
                          <p className="text-xs font-black uppercase mb-1">PE/E Fluid Protocol</p>
                          <p className="text-[11px] leading-relaxed opacity-90">RESTRICT IV fluids (~1L/12h). Do not use standard shock boluses unless massive haemorrhage occurs.</p>
                        </div>
                      )}
                      {latestVisit && latestVisit.bloodLoss > 500 && (
                        <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
                          <p className="text-xs font-black uppercase mb-1">TXA Precautions</p>
                          <p className="text-[11px] leading-relaxed opacity-90">DO NOT mix TXA with blood or penicillin. Administer slowly over 10 minutes.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Registry Details */}
                <div className="mac-card p-10 bg-slate-50 dark:bg-white/5 rounded-[48px] border-none space-y-8">
                   <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Registry Meta</h4>
                   <div className="space-y-8">
                     <div className="flex items-center gap-5">
                       <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-400">
                         <Phone className="w-5 h-5" />
                       </div>
                       <div>
                         <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Emergency Line</p>
                         <p className="text-base font-bold text-slate-900 dark:text-white">{patient.phone || '+263 77 000 0000'}</p>
                       </div>
                     </div>
                     <div className="flex items-center gap-5">
                       <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-400">
                         <MapPin className="w-5 h-5" />
                       </div>
                       <div>
                         <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Residential Node</p>
                         <p className="text-base font-bold text-slate-900 dark:text-white">{patient.location}</p>
                       </div>
                     </div>
                     <div className="flex items-center gap-5">
                       <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-400">
                         <Clock className="w-5 h-5" />
                       </div>
                       <div>
                         <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Last Assessment</p>
                         <p className="text-base font-bold text-slate-900 dark:text-white">{new Date(patient.lastVisit).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                       </div>
                     </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Neonatal Dashboard Overlay */}
            {patient.status === 'delivered' && mockNeonate && (
              <div className="pt-20 border-t border-black/[0.05] dark:border-white/[0.05]">
                <h4 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-10">
                  <Baby className="w-6 h-6" />
                  Neonatal Continuum of Care
                </h4>
                <NeonatalDashboard 
                  mother={patient} 
                  neonate={mockNeonate} 
                  onNewVisit={() => setIsNeonatalScreeningOpen(true)} 
                />
              </div>
            )}
          </div>
        </ScrollArea>
        
        {isDeliveryOpen && (
          <DeliveryForm 
            mother={patient} 
            onSave={handleDeliverySave} 
            onClose={() => setIsDeliveryOpen(false)} 
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
