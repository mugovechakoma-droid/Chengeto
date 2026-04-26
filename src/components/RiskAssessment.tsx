import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
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
import { Checkbox } from '@/components/ui/checkbox';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, AlertTriangle, CheckCircle2, Thermometer, Activity, Heart, Wind, Droplets, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateMaternalRisk, calculateEDD, calculateGA } from '../services/riskEngine';

interface RiskAssessmentProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function RiskAssessment({ isOpen, onClose, onSubmit }: RiskAssessmentProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    age: '',
    race: 'Other',
    gestationalAge: '',
    lnmp: '',
    edd: '',
    weight: '',
    height: '',
    bmi: 0,
    
    // Vitals
    heartRate: '',
    systolicBP: '',
    diastolicBP: '',
    respRate: '',
    spo2: '',
    temperature: '',
    avpu: 'Alert',
    painScore: '0',
    hb: '',
    fetalHeartRate: '',

    // History
    hivStatus: 'negative',
    previousCSection: false,
    hypertension: false,
    diabetes: false,
    gravidity: '1',
    parity: '0',
    pphHistory: false,
    stillbirthHistory: false,
    prematureBirthHistory: false,
    congenitalMalformationHistory: false,
    conceptionMethod: 'natural',
    chronicRenalDisease: false,
    cardiovascularDisease: false,
    sickleCell: false,
    psychiatricHistory: false,
    bloodTypeRhNegative: false,

    // Symptoms
    headache: false,
    blurringVision: false,
    chestPain: false,
    dyspnea: false,
    abdominalPain: false,
    swelling: false,
    vaginalBleeding: false,
    multiplePregnancy: false,
    
    // New Algorithm Fields
    proteinuria: 'none',
    reflexes: 'normal',
    activeConvulsions: false,
    epigastricPain: false,
    bloodLoss: '',
    cervicalDilatation: '',
    moulding: '',
    secondaryArrest: false,
    foulSmellingLiquor: false,
    softAbdomen: false,
    woodyHardAbdomen: false,
    uterineAtony: false,
    retainedPlacenta: false,
    genitalTears: false,
    clottingDysfunction: false,
  });

  // Auto-calculate BMI
  useEffect(() => {
    const w = parseFloat(formData.weight);
    const h = parseFloat(formData.height) / 100; // cm to m
    if (w > 0 && h > 0) {
      const calculatedBmi = parseFloat((w / (h * h)).toFixed(1));
      setFormData(prev => ({ ...prev, bmi: calculatedBmi }));
    }
  }, [formData.weight, formData.height]);

  // Auto-calculate GA and EDD from LNMP
  useEffect(() => {
    if (formData.lnmp) {
      const ga = calculateGA(formData.lnmp);
      const edd = calculateEDD(formData.lnmp);
      setFormData(prev => ({ 
        ...prev, 
        gestationalAge: ga.toString(),
        edd: edd 
      }));
    }
  }, [formData.lnmp]);

  const steps = [
    { title: 'Core Info', description: 'Patient identification' },
    { title: 'Clinical Vitals', description: 'Primary triage markers' },
    { title: 'Obstetric History', description: 'Past pregnancy outcomes' },
    { title: 'Comorbidities', description: 'Chronic medical status' },
    { title: 'Symptoms', description: 'Presenting danger signs' },
    { title: 'Analysis', description: 'Risk categorization' },
  ];

  const assessment = calculateMaternalRisk(
    {
      hivStatus: formData.hivStatus as any,
      previousCSection: formData.previousCSection,
      hypertension: formData.hypertension,
      diabetes: formData.diabetes,
      gravidity: parseInt(formData.gravidity),
      parity: parseInt(formData.parity),
      multiplePregnancy: formData.multiplePregnancy,
      weight: parseFloat(formData.weight),
      height: parseFloat(formData.height),
      bmi: formData.bmi,
      race: formData.race,
      pphHistory: formData.pphHistory,
      stillbirthHistory: formData.stillbirthHistory,
      prematureBirthHistory: formData.prematureBirthHistory,
      congenitalMalformationHistory: formData.congenitalMalformationHistory,
      conceptionMethod: formData.conceptionMethod as any,
      chronicRenalDisease: formData.chronicRenalDisease,
      cardiovascularDisease: formData.cardiovascularDisease,
      sickleCell: formData.sickleCell,
      psychiatricHistory: formData.psychiatricHistory,
      bloodTypeRhNegative: formData.bloodTypeRhNegative,
      cardiacDisease: formData.cardiovascularDisease, // Mapping for safety check
    },
    {
      age: parseInt(formData.age || '0'),
      systolicBP: parseInt(formData.systolicBP),
      diastolicBP: parseInt(formData.diastolicBP),
      heartRate: parseInt(formData.heartRate),
      respRate: parseInt(formData.respRate),
      spo2: parseInt(formData.spo2),
      temperature: parseFloat(formData.temperature),
      avpu: formData.avpu as any,
      painScore: parseInt(formData.painScore),
      hb: parseFloat(formData.hb),
      fetalHeartRate: parseInt(formData.fetalHeartRate),
      headache: formData.headache,
      blurringVision: formData.blurringVision,
      chestPain: formData.chestPain,
      dyspnea: formData.dyspnea,
      abdominalPain: formData.abdominalPain,
      swelling: formData.swelling,
      vaginalBleeding: formData.vaginalBleeding,
      proteinuria: formData.proteinuria as any,
      reflexes: formData.reflexes as any,
      activeConvulsions: formData.activeConvulsions,
      epigastricPain: formData.epigastricPain,
      bloodLoss: parseFloat(formData.bloodLoss || '0'),
      cervicalDilatation: parseFloat(formData.cervicalDilatation || '0'),
      moulding: parseInt(formData.moulding || '0'),
      secondaryArrest: formData.secondaryArrest,
      foulSmellingLiquor: formData.foulSmellingLiquor,
    }
  );

  const nextStep = () => setStep(s => Math.min(s + 1, 6));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden border-none bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl rounded-[32px] shadow-2xl">
        <div className="flex h-[640px]">
          {/* Sidebar Steps */}
          <div className="w-56 bg-black/[0.02] dark:bg-white/[0.02] border-r border-black/[0.05] dark:border-white/[0.05] p-8 space-y-8">
            <div className="space-y-1 mb-8">
              <h3 className="text-lg font-bold tracking-tight dark:text-white">Chengeto</h3>
              <p className="text-[10px] text-black/40 dark:text-white/40 font-bold uppercase tracking-widest">Clinical Wizard</p>
            </div>
            {steps.map((s, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300",
                    step > i + 1 ? "bg-emerald-500 text-white" : step === i + 1 ? "bg-blue-600 text-white scale-110 shadow-lg shadow-blue-500/20" : "bg-black/10 dark:bg-white/10 text-black/40 dark:text-white/40"
                  )}>
                    {step > i + 1 ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider transition-colors",
                    step === i + 1 ? "text-slate-900 dark:text-white" : "text-black/30 dark:text-white/30"
                  )}>{s.title}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Form Content */}
          <div className="flex-1 flex flex-col min-w-0">
            <DialogHeader className="p-10 pb-4">
              <DialogTitle className="text-2xl font-bold tracking-tight dark:text-white">{steps[step-1].title}</DialogTitle>
              <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">{steps[step-1].description}</DialogDescription>
            </DialogHeader>

            <div className="flex-1 px-10 py-6 overflow-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  {step === 1 && (
                    <div className="grid grid-cols-2 gap-6">
                      <div className="col-span-2 space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Full Name</Label>
                        <Input 
                          placeholder="Patient name" 
                          className="rounded-2xl bg-slate-50 dark:bg-white/5 border-none h-12 focus:ring-2 focus:ring-blue-500/20 transition-all"
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Age</Label>
                        <Input 
                          type="number" 
                          className="rounded-2xl bg-slate-50 dark:bg-white/5 border-none h-12"
                          value={formData.age}
                          onChange={e => setFormData({...formData, age: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Race/Ethnicity</Label>
                        <Select value={formData.race} onValueChange={v => setFormData({...formData, race: v})}>
                          <SelectTrigger className="rounded-2xl bg-slate-50 dark:bg-white/5 border-none h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="African">African</SelectItem>
                            <SelectItem value="African American">African American</SelectItem>
                            <SelectItem value="White">White</SelectItem>
                            <SelectItem value="Asian">Asian</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Clinic / Location</Label>
                        <Input 
                          placeholder="e.g. Kuwirirana Clinic" 
                          className="rounded-2xl bg-slate-50 dark:bg-white/5 border-none h-12"
                          value={formData.location || 'Kuwirirana Clinic'}
                          onChange={e => setFormData({...formData, location: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">LNMP Date</Label>
                        <Input 
                          type="date" 
                          className="rounded-2xl bg-slate-50 dark:bg-white/5 border-none h-12"
                          value={formData.lnmp}
                          onChange={e => setFormData({...formData, lnmp: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Gestation (Weeks)</Label>
                        <Input 
                          type="number" 
                          className="rounded-2xl bg-slate-50 dark:bg-white/5 border-none h-12"
                          value={formData.gestationalAge}
                          onChange={e => setFormData({...formData, gestationalAge: e.target.value})}
                        />
                      </div>
                      {formData.edd && (
                        <div className="col-span-2 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Estimated Due Date (EDD)</span>
                          <span className="text-lg font-bold tracking-tighter text-emerald-600 dark:text-emerald-400">
                            {new Date(formData.edd).toLocaleDateString('en-ZW', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Height (cm)</Label>
                        <Input 
                          type="number" 
                          className="rounded-2xl bg-slate-50 dark:bg-white/5 border-none h-12"
                          value={formData.height}
                          onChange={e => setFormData({...formData, height: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Weight (kg)</Label>
                        <Input 
                          type="number" 
                          className="rounded-2xl bg-slate-50 dark:bg-white/5 border-none h-12"
                          value={formData.weight}
                          onChange={e => setFormData({...formData, weight: e.target.value})}
                        />
                      </div>
                      {formData.bmi > 0 && (
                        <div className="col-span-2 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl flex items-center justify-between">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Auto-Calculated BMI</span>
                          <span className={cn(
                            "text-lg font-bold tracking-tighter",
                            formData.bmi > 35 ? "text-red-600" : "text-blue-600 dark:text-blue-400"
                          )}>{formData.bmi}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {step === 2 && (
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                          <Heart className="w-3 h-3 text-red-500" /> Heart Rate (bpm)
                        </Label>
                        <Input 
                          type="number" 
                          className={cn(
                            "rounded-2xl bg-slate-50 dark:bg-white/5 border-none h-12",
                            (parseInt(formData.heartRate) < 50 || parseInt(formData.heartRate) > 120) && "ring-2 ring-red-500/50 bg-red-50"
                          )}
                          value={formData.heartRate}
                          onChange={e => setFormData({...formData, heartRate: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                          <Droplets className="w-3 h-3 text-blue-500" /> Systolic BP
                        </Label>
                        <Input 
                          type="number" 
                          className={cn(
                            "rounded-2xl bg-slate-50 dark:bg-white/5 border-none h-12",
                            (parseInt(formData.systolicBP) < 90 || parseInt(formData.systolicBP) > 160) && "ring-2 ring-red-500/50 bg-red-50"
                          )}
                          value={formData.systolicBP}
                          onChange={e => setFormData({...formData, systolicBP: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                          <Droplets className="w-3 h-3 text-blue-500" /> Diastolic BP
                        </Label>
                        <Input 
                          type="number" 
                          className={cn(
                            "rounded-2xl bg-slate-50 dark:bg-white/5 border-none h-12",
                            (parseInt(formData.diastolicBP) > 100) && "ring-2 ring-red-500/50 bg-red-50"
                          )}
                          value={formData.diastolicBP}
                          onChange={e => setFormData({...formData, diastolicBP: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                          <Wind className="w-3 h-3 text-slate-500" /> Resp Rate
                        </Label>
                        <Input 
                          type="number" 
                          className={cn(
                            "rounded-2xl bg-slate-50 dark:bg-white/5 border-none h-12",
                            (parseInt(formData.respRate) < 12 || parseInt(formData.respRate) > 30) && "ring-2 ring-red-500/50 bg-red-50"
                          )}
                          value={formData.respRate}
                          onChange={e => setFormData({...formData, respRate: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">SpO2 (%)</Label>
                        <Input 
                          type="number" 
                          className={cn(
                            "rounded-2xl bg-slate-50 dark:bg-white/5 border-none h-12",
                            (parseInt(formData.spo2) < 95) && "ring-2 ring-red-500/50 bg-red-50"
                          )}
                          value={formData.spo2}
                          onChange={e => setFormData({...formData, spo2: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                          <Thermometer className="w-3 h-3 text-amber-500" /> Temp (°C)
                        </Label>
                        <Input 
                          type="number" 
                          step="0.1" 
                          className={cn(
                            "rounded-2xl bg-slate-50 dark:bg-white/5 border-none h-12",
                            (parseFloat(formData.temperature) < 35 || parseFloat(formData.temperature) >= 38) && "ring-2 ring-red-500/50 bg-red-50"
                          )}
                          value={formData.temperature}
                          onChange={e => setFormData({...formData, temperature: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                          <Brain className="w-3 h-3 text-purple-500" /> AVPU Scale
                        </Label>
                        <Select value={formData.avpu} onValueChange={v => setFormData({...formData, avpu: v})}>
                          <SelectTrigger className="rounded-2xl bg-slate-50 dark:bg-white/5 border-none h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Alert">Alert</SelectItem>
                            <SelectItem value="Voice">Voice</SelectItem>
                            <SelectItem value="Pain">Pain</SelectItem>
                            <SelectItem value="Unresponsive">Unresponsive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pain Score (0-10)</Label>
                        <Select value={formData.painScore} onValueChange={v => setFormData({...formData, painScore: v})}>
                          <SelectTrigger className="rounded-2xl bg-slate-50 dark:bg-white/5 border-none h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[...Array(11)].map((_, i) => (
                              <SelectItem key={i} value={i.toString()}>{i}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Proteinuria</Label>
                        <Select value={formData.proteinuria} onValueChange={v => setFormData({...formData, proteinuria: v as any})}>
                          <SelectTrigger className="rounded-2xl bg-slate-50 dark:bg-white/5 border-none h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="1+">1+</SelectItem>
                            <SelectItem value="2+">2+</SelectItem>
                            <SelectItem value="3+">3+</SelectItem>
                            <SelectItem value="4+">4+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-3 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border-none">
                        <Checkbox 
                          id="activeConvulsions" 
                          checked={formData.activeConvulsions} 
                          onCheckedChange={v => setFormData({...formData, activeConvulsions: !!v})}
                        />
                        <Label htmlFor="activeConvulsions" className="text-sm font-medium cursor-pointer flex-1">Active Convulsions</Label>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Gravidity</Label>
                          <Input type="number" className="rounded-2xl bg-slate-50 border-none h-12" value={formData.gravidity} onChange={e => setFormData({...formData, gravidity: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Parity</Label>
                          <Input type="number" className="rounded-2xl bg-slate-50 border-none h-12" value={formData.parity} onChange={e => setFormData({...formData, parity: e.target.value})} />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Obstetric Complications History</Label>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { id: 'previousCSection', label: 'Prev C-Section' },
                            { id: 'pphHistory', label: 'Prior PPH' },
                            { id: 'stillbirthHistory', label: 'Stillbirth/Loss' },
                            { id: 'prematureBirthHistory', label: 'Premature Birth' },
                          ].map(item => (
                            <div key={item.id} className="flex items-center space-x-3 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border-none">
                              <Checkbox 
                                id={item.id} 
                                checked={(formData as any)[item.id]} 
                                onCheckedChange={v => setFormData({...formData, [item.id]: !!v})}
                              />
                              <Label htmlFor={item.id} className="text-sm font-medium cursor-pointer flex-1">{item.label}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 4 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: 'multiplePregnancy', label: 'Multiple Pregnancy' },
                          { id: 'hypertension', label: 'Chronic HTN' },
                          { id: 'diabetes', label: 'Diabetes' },
                          { id: 'sickleCell', label: 'Sickle Cell' },
                          { id: 'cardiovascularDisease', label: 'Cardio Disease' },
                          { id: 'chronicRenalDisease', label: 'Renal Disease' },
                          { id: 'psychiatricHistory', label: 'Psych History' },
                          { id: 'bloodTypeRhNegative', label: 'Rh Negative' },
                          { id: 'cardiovascularDisease', label: 'Cardiac Disease' },
                        ].map(item => (
                          <div key={item.id} className="flex items-center space-x-3 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border-none">
                            <Checkbox 
                              id={item.id} 
                              checked={(formData as any)[item.id]} 
                              onCheckedChange={v => setFormData({...formData, [item.id]: !!v})}
                            />
                            <Label htmlFor={item.id} className="text-sm font-medium cursor-pointer flex-1">{item.label}</Label>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">HIV Status</Label>
                        <Select value={formData.hivStatus} onValueChange={v => setFormData({...formData, hivStatus: v})}>
                          <SelectTrigger className="rounded-2xl bg-slate-50 dark:bg-white/5 border-none h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="negative">HIV Negative</SelectItem>
                            <SelectItem value="positive">HIV Positive</SelectItem>
                            <SelectItem value="unknown">Unknown / Not Tested</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {step === 5 && (
                    <div className="space-y-6">
                      <p className="text-xs text-red-500 font-bold uppercase tracking-widest bg-red-50 p-3 rounded-xl border border-red-100">Immediate Clinical Flags</p>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: 'headache', label: 'Severe Headache' },
                          { id: 'blurringVision', label: 'Blurred Vision' },
                          { id: 'chestPain', label: 'Chest Pain' },
                          { id: 'dyspnea', label: 'Shortness of Breath' },
                          { id: 'abdominalPain', label: 'Abdominal Pain' },
                          { id: 'vaginalBleeding', label: 'Vaginal Bleeding' },
                          { id: 'epigastricPain', label: 'Epigastric Pain' },
                        ].map(item => (
                          <div key={item.id} className="flex items-center space-x-3 bg-slate-50 p-4 rounded-2xl border-none group hover:bg-red-50 transition-colors">
                            <Checkbox 
                              id={item.id} 
                              checked={(formData as any)[item.id]} 
                              onCheckedChange={v => setFormData({...formData, [item.id]: !!v})}
                              className="data-[state=checked]:bg-red-500 border-red-200"
                            />
                            <Label htmlFor={item.id} className="text-sm font-medium cursor-pointer flex-1 group-hover:text-red-700">{item.label}</Label>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Estimated Blood Loss (ml)</Label>
                          <Input type="number" className="rounded-2xl bg-slate-50 border-none h-12" value={formData.bloodLoss} onChange={e => setFormData({...formData, bloodLoss: e.target.value})} />
                        </div>
                        <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-2xl border-none mt-6">
                          <Checkbox 
                            id="foulSmellingLiquor" 
                            checked={formData.foulSmellingLiquor} 
                            onCheckedChange={v => setFormData({...formData, foulSmellingLiquor: !!v})}
                          />
                          <Label htmlFor="foulSmellingLiquor" className="text-sm font-medium cursor-pointer flex-1">Foul-smelling Liquor</Label>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-slate-100">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Haemorrhage Assessment (APH/PPH)</p>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { id: 'softAbdomen', label: 'Soft Abdomen' },
                            { id: 'woodyHardAbdomen', label: 'Woody Hard Abdomen' },
                            { id: 'uterineAtony', label: 'Uterine Atony' },
                            { id: 'retainedPlacenta', label: 'Retained Placenta' },
                            { id: 'genitalTears', label: 'Genital Tears' },
                            { id: 'clottingDysfunction', label: 'Clotting Dysfunction' },
                          ].map(item => (
                            <div key={item.id} className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl border-none">
                              <Checkbox 
                                id={item.id} 
                                checked={(formData as any)[item.id]} 
                                onCheckedChange={v => setFormData({...formData, [item.id]: !!v})}
                              />
                              <Label htmlFor={item.id} className="text-xs font-medium cursor-pointer flex-1">{item.label}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 6 && (
                    <div className="space-y-8 flex flex-col items-center justify-center h-full text-center">
                      <div className={cn(
                        "w-32 h-32 rounded-[40px] flex items-center justify-center border-4 shadow-2xl transition-all duration-500",
                        assessment.riskLevel === 'high' ? 'border-red-500 bg-red-50 text-red-600 shadow-red-500/20 scale-110' : 
                        assessment.riskLevel === 'medium' ? 'border-amber-500 bg-amber-50 text-amber-600 shadow-amber-500/20' : 
                        'border-emerald-500 bg-emerald-50 text-emerald-600 shadow-emerald-500/20'
                      )}>
                        <div className="text-center">
                          <span className="text-4xl font-black tracking-tighter block">{assessment.riskScore}%</span>
                          <span className="text-[10px] uppercase font-black opacity-40">Score</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="text-3xl font-black tracking-tighter uppercase dark:text-white">{assessment.riskLevel} RISK</h4>
                        <div className="max-w-[400px] bg-slate-50 dark:bg-white/5 p-6 rounded-[24px]">
                          <p className="text-sm font-bold text-slate-900 dark:text-white mb-4">{assessment.recommendation}</p>
                          
                          {assessment.clinicalRecommendations.length > 0 && (
                            <div className="space-y-2 text-left bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-black/[0.05] dark:border-white/[0.05]">
                              <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2">Clinical Actions (EDLIZ) • Gokwe North Team</p>
                              <div className="mb-2 p-2 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg text-[10px] text-blue-700 dark:text-blue-400 font-medium">
                                Contact: {assessment.riskLevel === 'high' ? 'Dr Rurinda / Dr Chiguvare (Specialists)' : 'Dr L Mariseni (DMO)'}
                              </div>
                              {assessment.clinicalRecommendations.map((rec, i) => (
                                <div key={i} className="flex gap-2 items-start text-[11px] leading-tight dark:text-slate-300">
                                  <div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                  <p>{rec}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {(formData.cardiovascularDisease || formData.placentaPrevia || (parseFloat(formData.systolicBP) >= 140 || parseFloat(formData.diastolicBP) >= 90)) && (
                            <div className="mt-4 p-4 rounded-xl bg-red-600 text-white text-left space-y-3 animate-pulse">
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                CRITICAL SAFETY ALERTS
                              </p>
                              <div className="space-y-2 text-[10px] font-bold leading-relaxed">
                                {formData.cardiovascularDisease && <p>• CARDIAC: NO ERGOMETRINE. Use Oxytocin 10 units. Avoid fluid overload.</p>}
                                {formData.placentaPrevia && <p>• BLEEDING: NO DIGITAL VE. Diagnose via Ultrasound.</p>}
                                {(parseFloat(formData.systolicBP) >= 140 || parseFloat(formData.diastolicBP) >= 90) && <p>• PE/E: RESTRICT IV FLUIDS (~1L/12h). No standard shock boluses.</p>}
                              </div>
                            </div>
                          )}

                          {assessment.dangerSigns.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-2 mt-4">
                              {assessment.dangerSigns.map((sig, i) => (
                                <Badge key={i} variant="outline" className="bg-red-100 border-red-200 text-red-700 text-[9px] font-black uppercase">
                                  {sig}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <DialogFooter className="p-10 pt-4 flex items-center justify-between sm:justify-between bg-slate-50/50 dark:bg-white/5 border-t border-black/[0.05] dark:border-white/[0.05]">
              <Button 
                variant="ghost" 
                onClick={prevStep} 
                disabled={step === 1}
                className="rounded-full h-12 px-8 gap-2 font-bold uppercase text-[10px] tracking-widest transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
              {step < 6 ? (
                <Button 
                  onClick={nextStep}
                  className="rounded-full h-12 px-10 bg-black dark:bg-white dark:text-black text-white hover:opacity-80 gap-2 font-bold uppercase text-[10px] tracking-widest shadow-xl shadow-black/10 transition-all"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button 
                  onClick={() => onSubmit(formData)}
                  className={cn(
                    "rounded-full h-12 px-10 text-white gap-2 font-black uppercase text-[10px] tracking-widest shadow-2xl transition-all",
                    assessment.riskLevel === 'high' ? 'bg-red-600 hover:bg-red-700 shadow-red-500/30' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
                  )}
                >
                  Validate & Complete
                </Button>
              )}
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Badge({ children, variant = 'default', className }: { children: React.ReactNode, variant?: 'default' | 'outline', className?: string, key?: any }) {
  return (
    <span className={cn(
      "px-2 py-0.5 rounded-full font-medium",
      variant === 'outline' ? "border" : "bg-primary text-primary-foreground",
      className
    )}>
      {children}
    </span>
  );
}
