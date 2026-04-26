import React from 'react';
import { 
  Baby, 
  Thermometer, 
  Activity, 
  Wind, 
  AlertTriangle,
  History,
  Stethoscope,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Neonate, NeonatalVisit, Patient } from '../types';
import { cn } from '@/lib/utils';
import { calculateNeonatalSepsisRisk } from '../services/neonatalRiskEngine';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const MOCK_VITALS = [
  { time: '12h', temp: 36.5, hr: 140 },
  { time: '24h', temp: 36.8, hr: 145 },
  { time: '36h', temp: 37.1, hr: 138 },
  { time: '48h', temp: 36.9, hr: 142 },
  { time: '60h', temp: 37.0, hr: 148 },
  { time: '72h', temp: 37.2, hr: 155 },
];

interface NeonatalDashboardProps {
  mother: Patient;
  neonate: Neonate;
  onNewVisit: () => void;
}

export default function NeonatalDashboard({ mother, neonate, onNewVisit }: NeonatalDashboardProps) {
  const latestVisit = neonate.visits[neonate.visits.length - 1];
  
  // Calculate dual risk score
  const riskAssessment = calculateNeonatalSepsisRisk(mother, mother.delivery!, latestVisit || {});

  return (
    <div className="space-y-6">
      {/* Risk Continuum Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none rounded-3xl overflow-hidden shadow-2xl">
          <CardContent className="p-6 relative">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Maternal Continuum</p>
                <h3 className="text-xl font-bold">Maternal Risk Score</h3>
              </div>
              <Badge className="bg-white/10 backdrop-blur-md border-white/20 text-white font-bold px-3 py-1 uppercase tracking-wider text-[10px]">
                {mother.riskLevel}
              </Badge>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/10" />
                  <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                    strokeDasharray={251} strokeDashoffset={251 - (mother.riskScore / 100) * 251}
                    className={cn(
                      "transition-all duration-1000",
                      mother.riskLevel === 'high' ? 'text-red-500' : mother.riskLevel === 'medium' ? 'text-amber-500' : 'text-emerald-500'
                    )}
                  />
                </svg>
                <span className="absolute text-2xl font-black">{mother.riskScore}%</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-white/80">Intrapartum events reflected in neonatal risk.</p>
                <div className="flex gap-2">
                   {mother.delivery?.maternalFever && <Badge variant="destructive" className="text-[8px]">Maternal Fever</Badge>}
                   {mother.delivery?.ruptureOfMembranes! > 18 && <Badge variant="destructive" className="text-[8px]">PROM</Badge>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1 text-primary">Sepsis Prediction Engine</p>
                <h3 className="text-xl font-bold">Neonatal Sepsis Prob.</h3>
              </div>
              <ShieldAlert className={cn(
                "w-6 h-6",
                riskAssessment.sepsisProbability > 50 ? "text-red-600 animate-pulse" : "text-slate-200"
              )} />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className={cn(
                  "text-4xl font-black tracking-tight",
                  riskAssessment.sepsisProbability > 50 ? "text-red-600" : "text-blue-600 dark:text-blue-400"
                )}>
                  {riskAssessment.sepsisProbability}%
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest pb-1">Risk Probability</span>
              </div>
              <Progress 
                value={riskAssessment.sepsisProbability} 
                className="h-2 rounded-full" 
                //@ts-ignore - custom color classes if needed
                indicatorClassName={cn(riskAssessment.sepsisProbability > 50 ? "bg-red-600" : "bg-blue-600")}
              />
              <p className="text-[10px] font-medium text-slate-500 leading-relaxed italic">
                *Prediction based on combined maternal risk factors and early danger signs (0-72h).
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vitals Trend & Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 rounded-3xl border-none shadow-xl bg-white dark:bg-slate-900">
           <CardHeader className="p-6 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-slate-400">
                <Activity className="w-4 h-4 text-blue-500" />
                Vitals Stability (72h)
              </CardTitle>
           </CardHeader>
           <CardContent className="p-6">
              <div className="h-[200px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={MOCK_VITALS}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                       <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                       <Tooltip 
                         contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                       />
                       <Line type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} name="Temp (°C)" />
                       <Line type="monotone" dataKey="hr" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} name="HR (bpm)" />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
           </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white">
           <CardHeader className="p-6 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest opacity-70">
                <Wind className="w-4 h-4" />
                Growth Tracking
              </CardTitle>
           </CardHeader>
           <CardContent className="p-6 space-y-6">
              <div className="flex justify-between items-end">
                 <div>
                    <p className="text-[10px] font-bold uppercase opacity-60">Birth Weight</p>
                    <p className="text-2xl font-black">3.2 <span className="text-xs font-medium opacity-60">kg</span></p>
                 </div>
                 <Badge className="bg-white/20 text-white border-none uppercase text-[8px]">CENTILE: 50th</Badge>
              </div>
              <div className="space-y-2">
                 <div className="flex justify-between text-xs">
                    <span className="opacity-70">Weight Gain (Daily)</span>
                    <span className="font-bold">+25g</span>
                 </div>
                 <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white w-[75%]" />
                 </div>
              </div>
              <div className="pt-2">
                 <p className="text-[10px] font-bold uppercase opacity-60 mb-2">Length-for-Age</p>
                 <p className="text-lg font-bold">49.5 <span className="text-xs font-medium opacity-60">cm</span></p>
              </div>
           </CardContent>
        </Card>
      </div>

      {/* Structured Checklists / Screening */}
      <Card className="rounded-3xl border-none shadow-xl bg-slate-50 dark:bg-slate-950">
        <CardHeader className="p-6 border-b border-black/[0.03] dark:border-white/[0.03] flex flex-row items-center justify-between">
           <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-blue-600" />
                Early Neonatal Surveillance (Checklist)
              </CardTitle>
           </div>
           <Button variant="outline" size="sm" className="rounded-full h-8 px-4 font-bold text-[10px] uppercase tracking-widest" onClick={onNewVisit}>
             New Screening
           </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-black/[0.03] dark:divide-white/[0.03]">
            {riskAssessment.recommendations.map((rec, idx) => (
              <div key={idx} className="p-4 flex gap-4 hover:bg-white dark:hover:bg-slate-900 transition-colors group">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-current" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">{rec}</p>
                  {rec.includes('EDLIZ') && <Badge className="mt-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none font-bold text-[8px] uppercase">Clinical Protocol</Badge>}
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 transition-transform group-hover:translate-x-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Danger Signs Alert */}
      {riskAssessment.dangerSigns.length > 0 && (
        <div className="p-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 rounded-3xl flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div className="space-y-1">
            <h4 className="text-red-900 dark:text-red-100 font-bold uppercase tracking-widest text-xs">Danger Signs Identified</h4>
            <div className="flex flex-wrap gap-2 pt-1">
               {riskAssessment.dangerSigns.map(sign => (
                 <Badge key={sign} variant="destructive" className="rounded-md font-bold text-[10px]">{sign}</Badge>
               ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
