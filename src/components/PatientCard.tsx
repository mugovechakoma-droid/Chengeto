import { Patient } from '../types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowUpRight, 
  Clock, 
  MapPin, 
  AlertCircle,
  Activity,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

interface PatientCardProps {
  patient: Patient;
  onClick?: () => void;
}

export default function PatientCard({ patient, onClick }: PatientCardProps) {
  const isOverdue = new Date(patient.nextVisit).getTime() < Date.now();
  
  const getRiskBg = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
      case 'low': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <Card 
      onClick={onClick}
      className="group cursor-pointer overflow-hidden flex flex-col bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-[32px]"
    >
      <div className="p-6 flex-1 space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
              {patient.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{patient.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-1.5 h-4 border-slate-200 dark:border-slate-700">ID: {patient.id}</Badge>
                {patient.status === 'delivered' && (
                  <Badge className="bg-emerald-100 text-emerald-600 border-none text-[8px] font-black h-4 uppercase">Delivered</Badge>
                )}
              </div>
            </div>
          </div>
          <div className={cn(
             "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
             getRiskBg(patient.riskLevel)
          )}>
            {patient.riskLevel}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-transparent hover:border-blue-500/10 transition-colors">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Gestation</p>
            <p className="text-xl font-black text-slate-900 dark:text-white leading-none">{patient.gestationalAge} <span className="text-[10px] uppercase text-slate-400">Weeks</span></p>
            <div className="w-full bg-slate-200/50 dark:bg-white/10 h-1 rounded-full mt-3 overflow-hidden">
               <div className="bg-blue-600 h-full rounded-full" style={{ width: `${(patient.gestationalAge/40)*100}%` }} />
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-transparent hover:border-blue-500/10 transition-colors">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Risk Score</p>
            <p className="text-xl font-black text-slate-900 dark:text-white leading-none">{patient.riskScore}<span className="text-sm font-bold opacity-30">%</span></p>
            {patient.riskLevel === 'high' && <div className="flex items-center gap-1 mt-3">
               <AlertCircle className="w-2.5 h-2.5 text-red-500 animate-pulse" />
               <span className="text-[8px] font-black uppercase text-red-500">Urgent Review</span>
            </div>}
          </div>
        </div>

        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <MapPin className="w-3.5 h-3.5" />
              {patient.location}
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              Next visit: {new Date(patient.nextVisit).toLocaleDateString()}
            </div>
            {isOverdue && (
              <span className="text-[9px] font-black text-amber-600 uppercase bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-md">Overdue</span>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-50/50 dark:bg-white/5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex -space-x-2">
           {[...Array(3)].map((_, i) => (
             <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Activity className="w-3 h-3 text-slate-400" />
             </div>
           ))}
        </div>
        <Button variant="ghost" size="sm" className="h-8 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
          View Profile <ChevronRight className="w-3 h-3 ml-1" />
        </Button>
      </div>
    </Card>
  );
}
