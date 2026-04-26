import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Activity, 
  ClipboardList, 
  AlertTriangle,
  CheckCircle2,
  Save,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Patient, ANCVisit } from '../types';
import { cn } from '@/lib/utils';

interface ANCVisitFormProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onSubmit: (data: Partial<ANCVisit>) => Promise<void>;
}

const STEPS = [
  { id: 'vitals', title: 'Vital Signs', icon: Activity },
  { id: 'clinical', title: 'Clinical Assessment', icon: ClipboardList },
  { id: 'risk', title: 'Risk Review', icon: AlertTriangle }
];

const DANGER_SIGNS = [
  'Severe headache',
  'Blurred vision',
  'Swelling of face/hands',
  'Vaginal bleeding',
  'Reduced fetal movement',
  'Abdominal pain'
];

export default function ANCVisitForm({ isOpen, onClose, patient, onSubmit }: ANCVisitFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    bp: '',
    hb: '',
    weight: '',
    fetalHeartRate: '',
    notes: '',
    dangerSigns: [] as string[],
    proteinuria: 'none' as 'none' | '1+' | '2+' | '3+' | '4+',
    activeConvulsions: false,
    epigastricPain: false,
    bloodLoss: '',
    foulSmellingLiquor: false,
    softAbdomen: false,
    woodyHardAbdomen: false,
    uterineAtony: false,
    retainedPlacenta: false,
    genitalTears: false,
    clottingDysfunction: false,
    bloodSugar: '',
  });

  // Auto-save simulation
  useEffect(() => {
    if (isOpen && formData.bp) {
      const timer = setTimeout(() => {
        console.log('Auto-saving draft...', formData);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [formData, isOpen]);

  if (!isOpen || !patient) return null;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        hb: parseFloat(formData.hb),
        weight: parseFloat(formData.weight),
        fetalHeartRate: parseInt(formData.fetalHeartRate),
        proteinuria: formData.proteinuria,
        activeConvulsions: formData.activeConvulsions,
        epigastricPain: formData.epigastricPain,
        bloodLoss: parseFloat(formData.bloodLoss || '0'),
        foulSmellingLiquor: formData.foulSmellingLiquor,
        softAbdomen: formData.softAbdomen,
        woodyHardAbdomen: formData.woodyHardAbdomen,
        uterineAtony: formData.uterineAtony,
        retainedPlacenta: formData.retainedPlacenta,
        genitalTears: formData.genitalTears,
        clottingDysfunction: formData.clottingDysfunction,
        bloodSugar: parseFloat(formData.bloodSugar || '0'),
        timestamp: new Date().toISOString(),
        gestationalAge: patient.gestationalAge // Simplified for demo
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDangerSign = (sign: string) => {
    setFormData(prev => ({
      ...prev,
      dangerSigns: prev.dangerSigns.includes(sign)
        ? prev.dangerSigns.filter(s => s !== sign)
        : [...prev.dangerSigns, sign]
    }));
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
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">New ANC Visit</h2>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{patient.name} • {patient.gestationalAge} Weeks</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-6 flex gap-2">
          {STEPS.map((step, idx) => (
            <div 
              key={step.id}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-500",
                idx <= currentStep ? "bg-blue-600" : "bg-slate-100 dark:bg-slate-800"
              )}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              {currentStep === 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Blood Pressure (mmHg)</Label>
                    <Input 
                      placeholder="e.g. 120/80"
                      value={formData.bp}
                      onChange={e => setFormData({...formData, bp: e.target.value})}
                      className="h-12 rounded-xl border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Hemoglobin (g/dL)</Label>
                    <Input 
                      type="number"
                      placeholder="e.g. 11.5"
                      value={formData.hb}
                      onChange={e => setFormData({...formData, hb: e.target.value})}
                      className="h-12 rounded-xl border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Weight (kg)</Label>
                    <Input 
                      type="number"
                      placeholder="e.g. 65.0"
                      value={formData.weight}
                      onChange={e => setFormData({...formData, weight: e.target.value})}
                      className="h-12 rounded-xl border-slate-200 dark:border-slate-700"
                    />
                  </div>
                    <Input 
                      type="number"
                      placeholder="e.g. 140"
                      value={formData.fetalHeartRate}
                      onChange={e => setFormData({...formData, fetalHeartRate: e.target.value})}
                      className="h-12 rounded-xl border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Blood Sugar (mmol/L)</Label>
                    <Input 
                      type="number"
                      placeholder="e.g. 6.5"
                      value={formData.bloodSugar}
                      onChange={e => setFormData({...formData, bloodSugar: e.target.value})}
                      className="h-12 rounded-xl border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Danger Signs (Select all that apply)</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {DANGER_SIGNS.map(sign => (
                        <button
                          key={sign}
                          onClick={() => toggleDangerSign(sign)}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                            formData.dangerSigns.includes(sign)
                              ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
                              : "bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                          )}
                        >
                          <div className={cn(
                            "w-5 h-5 rounded-md border flex items-center justify-center",
                            formData.dangerSigns.includes(sign) ? "bg-red-600 border-red-600 text-white" : "border-slate-300 dark:border-slate-600"
                          )}>
                            {formData.dangerSigns.includes(sign) && <CheckCircle2 className="w-3 h-3" />}
                          </div>
                          <span className="text-sm font-medium">{sign}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'epigastricPain', label: 'Epigastric Pain' },
                        { id: 'activeConvulsions', label: 'Active Convulsions' },
                        { id: 'foulSmellingLiquor', label: 'Foul Liquor' },
                        { id: 'softAbdomen', label: 'Soft Abdomen' },
                        { id: 'woodyHardAbdomen', label: 'Woody Hard Abdomen' },
                        { id: 'uterineAtony', label: 'Uterine Atony' },
                        { id: 'retainedPlacenta', label: 'Retained Placenta' },
                        { id: 'genitalTears', label: 'Genital Tears' },
                        { id: 'clottingDysfunction', label: 'Clotting Dysfunction' },
                      ].map(item => (
                        <div key={item.id} className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                          <Checkbox 
                            id={item.id} 
                            checked={(formData as any)[item.id]} 
                            onCheckedChange={v => setFormData({...formData, [item.id]: !!v})}
                          />
                          <Label htmlFor={item.id} className="text-xs font-medium cursor-pointer flex-1">{item.label}</Label>
                        </div>
                      ))}
                    </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Clinical Notes</Label>
                    <textarea 
                      className="w-full min-h-[100px] p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                      placeholder="Enter any additional observations..."
                      value={formData.notes}
                      onChange={e => setFormData({...formData, notes: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="p-6 rounded-[24px] bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 space-y-4">
                    <div className="flex items-center gap-3 text-blue-700 dark:text-blue-400">
                      <AlertTriangle className="w-6 h-6" />
                      <h3 className="font-bold">System Risk Prediction</h3>
                    </div>
                    <div className="flex items-end gap-4">
                      <div className="text-4xl font-bold text-blue-900 dark:text-white">
                        {formData.dangerSigns.length > 0 ? '85%' : '12%'}
                      </div>
                      <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                        formData.dangerSigns.length > 0 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                      )}>
                        {formData.dangerSigns.length > 0 ? 'High Risk' : 'Low Risk'}
                      </div>
                    </div>
                    <p className="text-sm text-blue-700/70 dark:text-blue-400/70">
                      {formData.dangerSigns.length > 0 
                        ? 'Immediate referral to District Hospital is recommended due to danger signs.'
                        : 'Patient is stable. Continue routine ANC at clinic level.'}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">BP</span>
                        <span className="font-bold">{formData.bp || 'N/A'}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Hb</span>
                        <span className="font-bold">{formData.hb || 'N/A'} g/dL</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Blood Sugar</span>
                        <span className="font-bold">{formData.bloodSugar || 'N/A'} mmol/L</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2 text-slate-400">
            <Save className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Draft Saved</span>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleBack}
              disabled={currentStep === 0}
              className="rounded-xl border-slate-200 dark:border-slate-700"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button 
              onClick={handleNext}
              disabled={isSubmitting}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-8"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : currentStep === STEPS.length - 1 ? (
                'Complete Visit'
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
