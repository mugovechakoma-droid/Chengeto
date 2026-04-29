import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Ambulance, 
  Send, 
  Loader2, 
  AlertCircle,
  Clock,
  MapPin,
  Stethoscope
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Patient, Referral } from '../types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { analyzeReferralReason } from '../services/aiService';

interface ReferralFormProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onSubmit: (data: Partial<Referral>) => Promise<void>;
}

const HOSPITALS = [
  'Gokwe North District Hospital',
  'Gokwe South (St Agnes)',
  'Kwekwe General Hospital',
  'Gweru Provincial Hospital',
  'Parirenyatwa (Provincial/Tertiary)'
];

const REASONS = [
  'Hypertensive Crisis / Preeclampsia',
  'Severe Anemia (Hb < 7)',
  'Obstructed Labor / Malpresentation',
  'Previous C-Section with Complications',
  'Antepartum Hemorrhage (APH)',
  'Post-Partum Haemorrhage (PPH)',
  'Obstetric Sepsis',
  'Sickle Cell Crisis',
  'Fetal Distress / Abnormal Heart Rate',
  'Eclampsia (Imminent/Active)'
];

export default function ReferralForm({ isOpen, onClose, patient, onSubmit }: ReferralFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    toHospital: '',
    reason: '',
    urgency: 'routine' as 'routine' | 'urgent' | 'emergency',
    notes: ''
  });

  useEffect(() => {
    let isMounted = true;
    
    const analyzeData = async () => {
      if (isOpen && patient) {
        setIsAnalyzing(true);
        const latestVisit = patient.vitals && patient.vitals.length > 0 
          ? patient.vitals[patient.vitals.length - 1] 
          : null;

        // Fallback summary
        let fallbackSummary = `CLINICAL SUMMARY for ${patient.name}:\n`;
        fallbackSummary += `• Gestational Age: ${patient.gestationalAge} Weeks\n`;
        if (latestVisit) {
          fallbackSummary += `• Vitals: BP ${latestVisit.bp || `${latestVisit.systolicBP}/${latestVisit.diastolicBP}`}, HR ${latestVisit.heartRate || '--'} bpm, Hb ${latestVisit.hb || '--'} g/dL\n`;
          if (latestVisit.dangerSigns && latestVisit.dangerSigns.length > 0) {
            fallbackSummary += `• Danger Signs: ${latestVisit.dangerSigns.join(', ')}\n`;
          }
          if (latestVisit.clinicalRecommendations && latestVisit.clinicalRecommendations.length > 0) {
            fallbackSummary += `• Recommendations Initiated: ${latestVisit.clinicalRecommendations.join('; ')}\n`;
          }
        }

        // Call Gemini AI
        const aiResult = await analyzeReferralReason(patient, REASONS);
        
        if (!isMounted) return;

        if (aiResult) {
          setFormData(prev => ({
            ...prev,
            toHospital: 'Gokwe North District Hospital',
            reason: aiResult.reason,
            urgency: aiResult.urgency,
            notes: aiResult.clinicalSummary
          }));
        } else {
          // Fallback heuristic if AI fails
          let autoselectedReason = '';
          const dangerSigns = latestVisit?.dangerSigns || [];
          const hasRedFlag = (text: string) => dangerSigns.some(ds => ds.toLowerCase().includes(text.toLowerCase()));

          if (hasRedFlag('eclampsia') || hasRedFlag('active convulsions')) {
            autoselectedReason = 'Eclampsia (Imminent/Active)';
          } else if (hasRedFlag('preeclampsia') || hasRedFlag('headache') || hasRedFlag('vision') || 
              (latestVisit?.systolicBP && latestVisit.systolicBP > 160) || 
              (latestVisit?.diastolicBP && latestVisit.diastolicBP > 110)) {
            autoselectedReason = 'Hypertensive Crisis / Preeclampsia';
          } else if (hasRedFlag('bleeding') || hasRedFlag('hemorrhage') || (latestVisit?.bloodLoss && latestVisit.bloodLoss > 500)) {
            autoselectedReason = latestVisit?.bloodLoss && latestVisit.bloodLoss > 500 ? 'Post-Partum Haemorrhage (PPH)' : 'Antepartum Hemorrhage (APH)';
          } else if (hasRedFlag('sepsis') || (latestVisit?.temperature && latestVisit.temperature > 37.5)) {
            autoselectedReason = 'Obstetric Sepsis';
          } else if (latestVisit?.hb && latestVisit.hb < 7) {
            autoselectedReason = 'Severe Anemia (Hb < 7)';
          } else if (patient.history?.previousCSection) {
            autoselectedReason = 'Previous C-Section with Complications';
          } else if (patient.history?.sickleCell) {
            autoselectedReason = 'Sickle Cell Crisis';
          } else if (hasRedFlag('heart rate') || hasRedFlag('fetal')) {
            autoselectedReason = 'Fetal Distress / Abnormal Heart Rate';
          } else if (hasRedFlag('obstructed') || hasRedFlag('cpd')) {
            autoselectedReason = 'Obstructed Labor / Malpresentation';
          }

          setFormData(prev => ({
            ...prev,
            toHospital: 'Gokwe North District Hospital',
            reason: autoselectedReason || prev.reason,
            urgency: patient.riskLevel === 'high' ? 'emergency' : 'urgent',
            notes: fallbackSummary
          }));
        }
        setIsAnalyzing(false);
      }
    };
    
    analyzeData();
    
    return () => {
      isMounted = false;
    };
  }, [isOpen, patient]);

  if (!isOpen || !patient) return null;
  const latestVisit = patient.vitals && patient.vitals.length > 0 ? patient.vitals[patient.vitals.length - 1] : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        patientId: patient.id,
        patientName: patient.name,
        fromClinic: patient.location || 'Unknown Clinic',
        toHospital: formData.toHospital,
        reason: formData.reason,
        urgency: formData.urgency,
        status: 'pending',
        riskLevel: patient.riskLevel,
        riskScore: patient.riskScore,
        dangerSigns: latestVisit?.dangerSigns || [],
        clinicalRecommendations: latestVisit?.clinicalRecommendations || [],
        timestamp: new Date().toISOString(),
        timeline: [{
          status: 'Referral Initiated',
          timestamp: new Date().toISOString(),
          note: formData.notes
        }]
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <ScrollArea className="flex-1">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-red-50/50 dark:bg-red-900/10 sticky top-0 z-20 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
                <Ambulance className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Initiate Referral</h2>
                <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest">Escalation Bridge • {patient.name}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Clinical Summary Snapshot */}
            {latestVisit && (
              <div className="p-5 rounded-[24px] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Clinical Snapshot</p>
                  <Badge variant="outline" className="text-[9px] border-slate-200">{latestVisit.gestationalAge} Weeks</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider text-left">Vitals</p>
                    <p className="text-xs font-bold dark:text-white text-left">BP {latestVisit.bp || `${latestVisit.systolicBP}/${latestVisit.diastolicBP}`} • {latestVisit.heartRate || '--'} bpm</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Risk Level</p>
                    <p className={cn("text-xs font-black uppercase", patient.riskLevel === 'high' ? 'text-red-600' : 'text-blue-600')}>
                      {patient.riskLevel} Risk
                    </p>
                  </div>
                </div>

                {latestVisit.clinicalRecommendations && latestVisit.clinicalRecommendations.length > 0 && (
                  <div className="pt-3 border-t border-slate-200/50 dark:border-white/5 space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-blue-600 text-left">Actions Initiated (EDLIZ)</p>
                    <div className="space-y-1.5">
                      {latestVisit.clinicalRecommendations.map((rec, i) => (
                        <div key={i} className="flex gap-2 items-start text-[10px] leading-tight text-slate-600 dark:text-slate-300 text-left">
                          <div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                          <p>{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {isAnalyzing && (
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 flex items-center justify-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <span className="text-sm font-bold text-blue-600">Gemini AI is analyzing clinical data...</span>
              </div>
            )}

            <div className={cn("space-y-4", isAnalyzing && "opacity-50 pointer-events-none")}>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Receiving Facility</Label>
              <Select 
                value={formData.toHospital} 
                onValueChange={val => setFormData({...formData, toHospital: val})}
              >
                <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="Select hospital..." />
                </SelectTrigger>
                <SelectContent>
                  {HOSPITALS.map(h => (
                    <SelectItem key={h} value={h}>{h}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Primary Reason for Referral</Label>
              <Select 
                value={formData.reason} 
                onValueChange={val => setFormData({...formData, reason: val})}
              >
                <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="Select reason..." />
                </SelectTrigger>
                <SelectContent>
                  {REASONS.map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Urgency Level</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['routine', 'urgent', 'emergency'] as const).map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData({...formData, urgency: level})}
                    className={cn(
                      "py-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all",
                      formData.urgency === level
                        ? level === 'emergency' ? "bg-red-600 border-red-600 text-white" : "bg-blue-600 border-blue-600 text-white"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400"
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Clinical Handover Notes</Label>
              <textarea 
                className="w-full min-h-[80px] p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-red-500/20 outline-none"
                placeholder="Enter critical clinical details for the receiving team..."
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-[10px] font-medium text-amber-700 dark:text-amber-400 leading-relaxed">
              Initiating this referral will notify the District Medical Officer and the receiving hospital's triage team immediately.
            </p>
          </div>

          <Button 
            type="submit"
            disabled={isSubmitting || !formData.toHospital || !formData.reason}
            className="w-full h-14 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-500/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send Referral Request
              </>
            )}
          </Button>
        </form>
        </ScrollArea>
      </motion.div>
    </div>
  );
}
