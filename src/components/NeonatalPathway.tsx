import React from 'react';
import { 
  X, 
  Stethoscope, 
  Droplets, 
  Thermometer, 
  Zap,
  AlertCircle,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NeonatalPathwayProps {
  isOpen: boolean;
  onClose: () => void;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
}

const PATHWAY_STEPS = [
  {
    id: 'stabilize',
    title: 'Immediate Stabilization',
    icon: Zap,
    actions: [
      'Maintain Neutral Thermal Environment (NTE) / KMC',
      'Ensure airway patency; provide O2 if SPO2 < 90%',
      'Secure IV access (10% Dextrose bolus if hypoglycemic)'
    ]
  },
  {
    id: 'antibiotics',
    title: 'Empirical Antibiotics',
    icon: Droplets,
    actions: [
      'Benzylpenicillin: 50,000 U/kg IV/IM every 12h',
      'Gentamicin: 5mg/kg IV/IM every 24h',
      'Dose according to weight and GA per EDLIZ charts'
    ]
  },
  {
    id: 'investigate',
    title: 'Clinical Investigations',
    icon: Stethoscope,
    actions: [
      'FBC + Differential Count (Look for I:T ratio > 0.2)',
      'Blood Culture (Before 1st dose of antibiotics)',
      'Lumbar Puncture if meningitis suspected (and stable)'
    ]
  },
  {
    id: 'monitor',
    title: 'Intensive Monitoring',
    icon: Thermometer,
    actions: [
      '4-hourly vitals (Temp, HR, RR, Grunting)',
      'Monitor blood glucose and urine output',
      'Daily weight tracking'
    ]
  }
];

export default function NeonatalPathway({ isOpen, onClose, riskLevel }: NeonatalPathwayProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-blue-600 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 blur-3xl" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">Neonatal Sepsis Pathway</h2>
                <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mt-1">EDLIZ Clinical Guidelines</p>
              </div>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 flex items-center justify-between">
             <div>
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Assessment Context</p>
                <h3 className="text-lg font-bold">Risk Level: <span className={riskLevel === 'critical' ? 'text-red-600' : 'text-amber-600'}>{riskLevel.toUpperCase()}</span></h3>
             </div>
             <Badge className={riskLevel === 'critical' ? 'bg-red-500' : 'bg-amber-500'}>
                {riskLevel === 'critical' ? 'High Urgency' : 'Medium Urgency'}
             </Badge>
          </div>

          <div className="space-y-4">
            {PATHWAY_STEPS.map((step, idx) => (
              <div key={step.id} className="relative pl-12 pb-8 last:pb-0">
                {idx !== PATHWAY_STEPS.length - 1 && (
                  <div className="absolute left-[23px] top-10 bottom-0 w-[2px] bg-slate-100 dark:bg-slate-800" />
                )}
                <div className="absolute left-0 top-0 w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center z-10">
                  <step.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {step.title}
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 opacity-20" />
                  </h4>
                  <div className="grid gap-2">
                    {step.actions.map((action, aIdx) => (
                      <div key={aIdx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 text-sm font-medium text-slate-600 dark:text-slate-400 flex items-start gap-3 border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30 transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        {action}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <Button variant="outline" onClick={onClose} className="rounded-xl">Dismiss</Button>
          <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 gap-2">
            Record Intervention <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
