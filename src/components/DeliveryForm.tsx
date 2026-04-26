import React, { useState } from 'react';
import { 
  Baby, 
  Clock, 
  Thermometer, 
  Scale, 
  AlertCircle,
  FileText,
  Activity
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Patient, DeliveryRecord } from '../types';

interface DeliveryFormProps {
  mother: Patient;
  onSave: (record: Partial<DeliveryRecord>) => void;
  onClose: () => void;
}

export default function DeliveryForm({ mother, onSave, onClose }: DeliveryFormProps) {
  const [formData, setFormData] = useState<Partial<DeliveryRecord>>({
    modeOfDelivery: 'vaginal',
    durationOfLabour: 0,
    ruptureOfMembranes: 0,
    maternalFever: false,
    meconiumStaining: false,
    resuscitationRequired: false,
    apgar1: 9,
    apgar5: 10,
    birthWeight: 3200,
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white dark:bg-slate-900 shadow-2xl rounded-3xl overflow-hidden border-none animate-in fade-in zoom-in duration-300">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <Baby className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Perinatal Transition Layer</CardTitle>
              <CardDescription className="text-white/70">Recording delivery events for {mother.name}</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-8 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Intrapartum Events */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-4 h-4" /> Labour & Birth
              </h3>
              
              <div className="space-y-2">
                <Label>Mode of Delivery</Label>
                <Select 
                  onValueChange={(v) => setFormData({...formData, modeOfDelivery: v as any})} 
                  defaultValue="vaginal"
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select outcome" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vaginal">Spontaneous Vaginal (SVD)</SelectItem>
                    <SelectItem value="c-section">C-Section</SelectItem>
                    <SelectItem value="assisted">Assisted (Vacuum/Forceps)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Labour Duration (h)</Label>
                  <Input 
                    type="number" 
                    className="rounded-xl"
                    placeholder="e.g. 8"
                    onChange={(e) => setFormData({...formData, durationOfLabour: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>ROM (h before birth)</Label>
                  <Input 
                    type="number" 
                    className="rounded-xl"
                    placeholder="e.g. 2"
                    onChange={(e) => setFormData({...formData, ruptureOfMembranes: Number(e.target.value)})}
                  />
                </div>
              </div>
            </div>

            {/* Neonatal Condition */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-4 h-4" /> Initial Neonatal Status
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>APGAR (1 min)</Label>
                  <Input 
                    type="number" 
                    max="10" 
                    className="rounded-xl"
                    onChange={(e) => setFormData({...formData, apgar1: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>APGAR (5 min)</Label>
                  <Input 
                    type="number" 
                    max="10" 
                    className="rounded-xl"
                    onChange={(e) => setFormData({...formData, apgar5: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Birth Weight (g)</Label>
                <div className="relative">
                  <Input 
                    type="number" 
                    className="rounded-xl pl-10"
                    placeholder="3200"
                    onChange={(e) => setFormData({...formData, birthWeight: Number(e.target.value)})}
                  />
                  <Scale className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Risk Flags */}
            <div className="col-span-1 md:col-span-2 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl space-y-4 border border-dashed border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-xs text-slate-500 uppercase tracking-widest">Sepsis & Risk Triggers</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="maternalFever" 
                    onCheckedChange={(checked) => setFormData({...formData, maternalFever: !!checked})}
                  />
                  <Label htmlFor="maternalFever" className="text-sm font-medium leading-none">Maternal Fever</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="meconium" 
                    onCheckedChange={(checked) => setFormData({...formData, meconiumStaining: !!checked})}
                  />
                  <Label htmlFor="meconium" className="text-sm font-medium leading-none">Meconium Stained</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="resuscitation" 
                    onCheckedChange={(checked) => setFormData({...formData, resuscitationRequired: !!checked})}
                  />
                  <Label htmlFor="resuscitation" className="text-sm font-medium leading-none">Resuscitation Done</Label>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <Button 
              className="flex-1 rounded-2xl bg-blue-600 hover:bg-blue-700 h-12 font-bold shadow-lg shadow-blue-500/20"
              onClick={() => onSave(formData)}
            >
              Transition to Neonatal Care
            </Button>
            <Button 
              variant="ghost" 
              className="rounded-2xl h-12 font-semibold px-8"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
