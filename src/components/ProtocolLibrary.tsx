import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Zap, 
  ShieldCheck, 
  Info,
  ExternalLink,
  Droplets,
  Stethoscope,
  Baby,
  Heart,
  Activity,
  AlertTriangle,
  ClipboardList,
  ChevronRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProtocolItem {
  title: string;
  content: string;
}

interface GuidelineSection {
  id: string;
  title: string;
  items: ProtocolItem[];
}

const MATERNAL_GUIDELINES: GuidelineSection[] = [
  {
    id: 'hypertension-adv',
    title: '1. Hypertensive Disorders (Pre-eclampsia/Eclampsia)',
    items: [
      { title: 'Mild/Moderate Pre-eclampsia', content: 'Trigger: Gestation > 20 weeks, BP 140/90 - 159/109 mmHg, Proteinuria ≤ 2+. Management: Admit, monitor BP 4-hourly, Methyldopa 250-500mg 3-4 times a day and/or Nifedipine 20mg twice a day. Plan delivery at >37 weeks.' },
      { title: 'Severe Pre-eclampsia', content: 'Trigger: BP ≥ 160/110 mmHg OR Proteinuria ≥ 2+ with severe symptoms (headache, epigastric pain, visual disturbances). Management: Admit immediately. Restrict IV fluids (keep strictly to ~1L over 12 hours). Give Hydralazine 10mg IM every 4 hours. Prepare for delivery.' },
      { title: 'Eclampsia (Imminent/Active)', content: 'Trigger: Above signs plus brisk reflexes or actively convulsing. Management: Magnesium Sulphate Loading Dose: 14g stat (4g IV in 20mls normal saline over 20 mins, plus 10g IM [5g in each buttock] with 1ml 2% lignocaine). Deliver within 6 hours.' }
    ]
  },
  {
    id: 'aph-adv',
    title: '2. Antepartum Haemorrhage (APH)',
    items: [
      { title: 'Placenta Praevia', content: 'Signs: Painless vaginal bleeding with a soft abdomen. Management: DO NOT perform digital VE. Diagnose via ultrasound. Prepare for possible elective/emergency CS.' },
      { title: 'Abruptio Placentae', content: 'Signs: Abdominal pain, woody hard abdomen, and possible fetal distress. Management: Urgent stabilization and delivery required. High risk of maternal shock and fetal loss.' }
    ]
  },
  {
    id: 'pph-shoc-adv',
    title: '3. Post-Partum Haemorrhage (PPH) & Shock',
    items: [
      { title: 'Shock Estimation', content: 'Pulse > 100 (700ml loss); Pulse > 100 & RR > 22 (1500ml); BP < 90/60 (2000ml). Actions: Give crystalloids (3:1 ratio) and blood products for severe loss.' },
      { title: 'The 4 Ts of PPH', content: 'Tone: Uterine atony. Tissue: Retained placenta. Trauma: Tears/Lacerations. Thrombin: Coagulopathy. management depends on specific T identified.' },
      { title: 'E-MOTIVE Management Bundle', content: 'M: Massage uterus. O: Oxytocics (Oxytocin 10 IU IM/IV or Misoprostol 800mcg SL/PR). T: Tranexamic Acid (TXA) 1g IV slowly over 10 mins. IV: Crystalloids via 14G/16G cannulae. E: Examine 4Ts.' }
    ]
  },
  {
    id: 'labour-adv',
    title: '4. Obstructed & Prolonged Labour',
    items: [
      { title: 'Partograph Alerts', content: 'Alert Line crossed: Observe closely, refer if at basic facility. Action Line reached: Immediate intervention (Oxytocin augmentation if safe, or Caesarean Section).' },
      { title: 'Oxytocin Contraindications', content: 'Signs of CPD, severe moulding (3+), or secondary arrest → DO NOT augment with Oxytocin due to risk of uterine rupture. Prepare for urgent Caesarean Section.' }
    ]
  },
  {
    id: 'preterm-adv',
    title: '5. Preterm Labour & PROM',
    items: [
      { title: 'Preterm Labour (24-34 weeks)', content: 'Recommendation: Administer Antenatal Corticosteroids (Dexamethasone 6mg IM 12-hourly for 2 days, or Betamethasone 12mg once daily for 2 days).' },
      { title: 'PPROM / Infection (>18h)', content: 'Trigger: Rupture > 18h or foul-smelling liquor. Management: Erythromycin 250mg PO 6-hourly for 10 days. WARNING: Avoid co-amoxiclav (Augmentin) as it increases risk of Necrotizing Enterocolitis (NEC).' }
    ]
  },
  {
    id: 'sepsis-adv',
    title: '6. Obstetric Sepsis',
    items: [
      { title: 'Sepsis Trigger', content: 'Pyrexia (Temp > 37.5°C) AND recent delivery/miscarriage (within 6 weeks) AND abdominal pain.' },
      { title: 'Empirical Treatment', content: 'Mild/Moderate: Amoxicillin 500mg PO 3x/day + Metronidazole 400mg PO 3x/day + Doxycycline 100mg PO 2x/day for 10 days. Evaluate for retained products.' }
    ]
  },
  {
    id: 'safety-constraints',
    title: '7. Critical Safety Constraints',
    items: [
      { title: 'Cardiac Disease', content: 'IF Cardiac disease = TRUE → DO NOT give Ergometrine. Use Oxytocin 10 units for the third stage. Avoid fluid overload.' },
      { title: 'Placenta Praevia', content: 'IF Painless vaginal bleeding with soft abdomen → DO NOT perform a digital Vaginal Examination (VE). Diagnose via Ultrasound.' },
      { title: 'Tranexamic Acid (TXA)', content: 'DO NOT mix with blood or penicillin in the same IV line. Give slowly over 10 minutes to prevent transient hypotension.' }
    ]
  }
];

const NEONATAL_GUIDELINES: GuidelineSection[] = [
  {
    id: 'routine',
    title: '1. Routine Management at Birth',
    items: [
      { title: 'Clear Airway', content: 'Do not routinely suction the mouth unless there is thick meconium to remove.' },
      { title: 'Cord Care', content: 'Delayed cord clamping (after 1 minute) is recommended for all normal births, excluding cases of intrauterine growth restriction (IUGR), asphyxia, or infants of diabetic mothers.' },
      { title: 'Eye Care', content: 'Instil 1% Tetracycline eye ointment into both eyes once at birth to prevent ophthalmia neonatorum.' },
      { title: 'Bleeding Prevention', content: 'Administer Vitamin K IM once only (1mg for >1.5kg, 0.5mg for <1.5kg) to prevent haemorrhagic disease of the newborn.' }
    ]
  },
  {
    id: 'resuscitation',
    title: '2. Neonatal Resuscitation',
    items: [
      { title: 'Warmth and Ventilation', content: 'Ensuring adequate warmth and ventilation (via bag and mask) is much more important than administering medicines.' },
      { title: 'Respiratory Depression', content: 'If the mother received pethidine in labour and the baby has respiratory depression, administer Neonatal Naloxone (10mcg for <1kg, up to 40mcg for >3kg) IM.' }
    ]
  },
  {
    id: 'feeding',
    title: '3. Feeding and Fluids',
    items: [
      { title: 'Breastfeeding', content: 'Initiate exclusive breastfeeding within the first hour of life on demand.' },
      { title: 'Sick/Premature infants (<1500g or <32 weeks)', content: 'Keep nil by mouth immediately after birth (unless colostrum is present), give 10% Dextrose IV fluids starting at 70-90ml/kg/day, and gradually introduce enteral feeds via nasogastric tube. Add breastmilk fortifier for infants <1500g when tolerating 160mls/kg/day.' }
    ]
  },
  {
    id: 'infections-neo',
    title: '4. Neonatal Infections & Sepsis',
    items: [
      { title: 'Antibiotic Initiation', content: 'Start antibiotics within 1 hour if major criteria (e.g., maternal chorioamnionitis, seizures, severe respiratory distress) or two minor criteria (e.g., prolonged rupture of membranes >18h, BBA, fever) are present.' },
      { title: 'Suspected Sepsis (First 48 hours)', content: 'Benzylpenicillin IM/IV (0.1MU/kg) + Gentamicin IM/IV.' },
      { title: 'Suspected Sepsis (After 48 hours)', content: 'Gentamicin IM/IV + Cloxacillin IM/IV (30mg/kg).' },
      { title: 'Neonatal Meningitis', content: 'Benzylpenicillin + Gentamicin + Chloramphenicol (or Ceftriaxone).' },
      { title: 'Ophthalmia Neonatorum (Infected)', content: 'Ceftriaxone IM 50mg/kg (max 250mg) as a single dose.' }
    ]
  },
  {
    id: 'special-neo',
    title: '5. Special Neonatal Conditions',
    items: [
      { title: 'Jaundice', content: 'Use phototherapy. If unavailable, expose to the sun intermittently (up to 2h) while keeping warm and shading eyes. Give extra 20ml/kg/24h fluid and encourage breastfeeding. Refer for exchange transfusion if serum bilirubin critical.' },
      { title: 'Neonatal Convulsions', content: 'Check for hypoglycaemia first (treat with 10% Dextrose). Phenobarbitone is the anticonvulsant of choice (20mg/kg loading dose). Avoid diazepam due to prolonged sedative effects.' },
      { title: 'Respiratory Distress Syndrome (RDS)', content: 'Minimal handling, supplemental oxygen, CPAP, and administer Surfactant 100mg/kg preferably within 15 minutes of birth.' },
      { title: 'PMTCT for the Infant', content: 'Universal triple prophylaxis (AZT + 3TC + NVP) for 6 weeks. Step down to NVP monotherapy from 6 weeks until end of breastfeeding. Cotrimoxazole prophylaxis starts at 6 weeks.' }
    ]
  }
];

const EMERGENCY_GUIDELINES: GuidelineSection[] = [
  {
    id: 'airway',
    title: '1. Airway and Breathing Emergencies',
    items: [
      { title: 'Asthma Exacerbations (Bronchodilators)', content: 'Give Salbutamol MDI (2-4 puffs depending on age, every 20 mins) or Nebulised Salbutamol 0.15-0.3 mg/kg/dose (max 5mg/dose). For severe cases, add Nebulised Ipratropium Bromide 250 mcg every 20-30 minutes for up to 4 doses.' },
      { title: 'Asthma Exacerbations (Corticosteroids)', content: 'Administer Oral Prednisolone 1-2 mg/kg/day for 3-5 days (max 40-60 mg/day). If severe, give IV Hydrocortisone 4-5 mg/kg every 6 hours (max 250 mg) or 10 mg/kg stat.' },
      { title: 'Refractory/Silent Chest', content: 'Consider IM/SC Adrenaline 0.01 ml/kg of 1:1000 solution (max 0.4-0.5 ml) or IV Magnesium Sulfate 50% at 0.1 mg/kg over 20 minutes.' },
      { title: 'Severe Croup (Corticosteroids)', content: 'Give a single dose of Dexamethasone 0.6 mg/kg IM, IV, or PO. Alternative: single dose of Oral Prednisolone 1.0 mg/kg.' },
      { title: 'Severe Croup (Nebulised Adrenaline)', content: '4 mL of 1:1000 Adrenaline undiluted with oxygen, or mix 0.25 mL of 1:1000 Adrenaline with 3-5 mL of normal saline. Observe for 2 hours for recurrence.' }
    ]
  },
  {
    id: 'circulation',
    title: '2. Circulation and Shock (Non-Malnourished)',
    items: [
      { title: 'Fluid Resuscitation', content: 'Rapid bolus of Normal Saline or Ringer’s Lactate. For neonates: 10 ml/kg IV over 15 to 20 minutes.' },
      { title: 'Inotropic Support', content: 'If shock persists after fluid boluses, initiate IV Dopamine at 5-20 mcg/kg/min. Consider IV Hydrocortisone for vasopressor-resistant shock.' }
    ]
  },
  {
    id: 'convulsions',
    title: '3. Coma and Convulsions',
    items: [
      { title: 'Neonates (< 1 month)', content: 'DO NOT use Diazepam. First-line: IV Phenobarbitone 15-20 mg/kg loading dose over 20 mins. Second-line: IV Phenytoin 20 mg/kg diluted in normal saline (never dextrose) slowly.' },
      { title: 'Children (> 1 month)', content: 'First-line: IV Diazepam 0.3 mg/kg slowly over 1 minute OR Rectal Diazepam 0.5 mg/kg. Repeat once after 10 mins if needed.' },
      { title: 'Status Epilepticus', content: 'If seizures persist after two doses of benzodiazepines, load with IV Phenytoin 20 mg/kg over 20-30 mins or IV Phenobarbitone 15-20 mg/kg.' }
    ]
  },
  {
    id: 'sam',
    title: '4. Severe Acute Malnutrition (SAM)',
    items: [
      { title: 'SAM (Dehydration Management)', content: 'Rehydrate via ReSoMal at 5 ml/kg every 30 minutes for 2 hours, then 5-10 ml/kg/hr. DO NOT give rapid IV boluses.' },
      { title: 'SAM (Shock Management)', content: 'Only use IV fluids if lethargic/unconscious. Give 15 ml/kg (Half-Strength Darrows in 5% Dextrose, or Ringer\'s with 5% Dextrose) slowly over 1 hour.' },
      { title: 'SAM (Antibiotics)', content: 'Hospitalized: IV/IM Ampicillin 50 mg/kg 6-hourly + Gentamicin 7.5 mg/kg once daily for 7 days. Outpatient: Oral Amoxicillin 30 mg/kg 8-hourly for 5 days.' },
      { title: 'SAM (Therapeutic Feeding)', content: 'Phase 1: F-75 formula (130 ml/kg/day). Transition: F-100 formula or RUTF once appetite returns and oedema resolves.' }
    ]
  },
  {
    id: 'neonatal-emergency',
    title: '5. Neonatal Sepsis and Resuscitation',
    items: [
      { title: 'Empiric Antibiotics', content: 'First-line: IV Ampicillin 50 mg/kg/dose (12h if <7d, 8h if >7d) PLUS IV Gentamicin 5 mg/kg/dose (24-hourly). For Meningitis, increase Ampicillin to 100 mg/kg and add IV Cefotaxime 50 mg/kg.' },
      { title: 'Resuscitation Medications', content: 'If HR < 60 despite ventilation/compressions, give Adrenaline 0.01-0.03 mg/kg of 1:10,000 solution. Give Naloxone (0.1 mg/kg) only if maternal pethidine used and respiratory depression present.' }
    ]
  }
];

export default function ProtocolLibrary() {
  const [search, setSearch] = useState('');

  const filterGuidelines = (sections: GuidelineSection[]) => {
    if (!search) return sections;
    return sections.map(section => ({
      ...section,
      items: section.items.filter(item => 
        item.title.toLowerCase().includes(search.toLowerCase()) || 
        item.content.toLowerCase().includes(search.toLowerCase())
      )
    })).filter(section => section.items.length > 0);
  };

  const filteredMaternal = filterGuidelines(MATERNAL_GUIDELINES);
  const filteredNeonatal = filterGuidelines(NEONATAL_GUIDELINES);
  const filteredEmergency = filterGuidelines(EMERGENCY_GUIDELINES);

  return (
    <Dialog>
      <DialogTrigger 
        render={
          <Button variant="outline" className="rounded-full gap-2 border-primary/20 hover:border-primary transition-all shadow-sm" />
        }
      >
        <BookOpen className="w-4 h-4 text-primary" />
        EDLIZ Protocols
      </DialogTrigger>
      <DialogContent className="max-w-[98vw] sm:max-w-[98vw] p-0 h-[96vh] flex flex-col gap-0 border-none overflow-hidden rounded-[32px] bg-slate-50 dark:bg-slate-950 shadow-2xl">
        <DialogHeader className="p-8 border-b border-border bg-white dark:bg-slate-900/50 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold tracking-tight">EDLIZ Clinical Library</DialogTitle>
                <DialogDescription className="text-xs font-medium uppercase tracking-widest text-slate-400">Zimbabwe National Medicine Guidelines 2025</DialogDescription>
              </div>
            </div>
          </div>
          
          <div className="pt-6 relative">
            <Search className="absolute left-4 top-[38px] w-5 h-5 text-slate-300" />
            <Input 
              placeholder="Search sections, drugs, or clinical indications..." 
              className="pl-12 h-14 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-base focus-visible:ring-blue-500 transition-all font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </DialogHeader>

        <Tabs defaultValue="maternal" className="flex-1 flex flex-col overflow-hidden">
          <div className="px-8 py-2 bg-white dark:bg-slate-900/30 border-b border-border">
            <TabsList className="grid w-full grid-cols-3 h-12 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800">
              <TabsTrigger value="maternal" className="rounded-lg text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                <Heart className="w-3 h-3 mr-2 hidden sm:block" /> Maternal
              </TabsTrigger>
              <TabsTrigger value="neonatal" className="rounded-lg text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                <Baby className="w-3 h-3 mr-2 hidden sm:block" /> Neonatal
              </TabsTrigger>
              <TabsTrigger value="emergency" className="rounded-lg text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-red-600 data-[state=active]:shadow-sm">
                <Zap className="w-3 h-3 mr-2 hidden sm:block text-red-500" /> Pediatric Emergency
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="maternal" className="flex-1 overflow-hidden mt-0 focus-visible:ring-0 data-[state=inactive]:hidden">
            <ScrollArea className="h-full">
              <div className="p-8 pb-32 space-y-12">
                {filteredMaternal.map((section) => (
                  <div key={section.id} className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 flex items-center gap-3">
                      <div className="h-[1px] flex-1 bg-blue-100 dark:bg-blue-900/30" />
                      {section.title}
                      <div className="h-[1px] flex-1 bg-blue-100 dark:bg-blue-900/30" />
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {section.items.map((item, idx) => (
                        <GuidelineCard key={idx} item={item} color="blue" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="neonatal" className="flex-1 overflow-hidden mt-0 focus-visible:ring-0 data-[state=inactive]:hidden">
            <ScrollArea className="h-full">
              <div className="p-8 pb-32 space-y-12">
                {filteredNeonatal.map((section) => (
                  <div key={section.id} className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-teal-600 flex items-center gap-3">
                      <div className="h-[1px] flex-1 bg-teal-100 dark:bg-teal-900/30" />
                      {section.title}
                      <div className="h-[1px] flex-1 bg-teal-100 dark:bg-teal-900/30" />
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {section.items.map((item, idx) => (
                        <GuidelineCard key={idx} item={item} color="teal" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="emergency" className="flex-1 overflow-hidden mt-0 focus-visible:ring-0 data-[state=inactive]:hidden">
            <ScrollArea className="h-full">
              <div className="p-8 pb-32 space-y-12">
                {filteredEmergency.map((section) => (
                  <div key={section.id} className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-red-600 flex items-center gap-3">
                      <div className="h-[1px] flex-1 bg-red-100 dark:bg-red-900/30" />
                      {section.title}
                      <div className="h-[1px] flex-1 bg-red-100 dark:bg-red-900/30" />
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {section.items.map((item, idx) => (
                        <GuidelineCard key={idx} item={item} color="red" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                 <ShieldCheck className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-[13px] font-bold leading-tight">Clinical Decision Support Tool</p>
                <p className="text-[11px] text-slate-400">Always verify protocols against local hospital policy and patient context.</p>
              </div>
           </div>
           <Button variant="link" className="text-white text-xs h-auto p-0 gap-1.5 opacity-60 hover:opacity-100">
              MOHCC Guidelines Portal <ExternalLink className="w-3.5 h-3.5" />
           </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface GuidelineCardProps {
  item: ProtocolItem;
  color: 'blue' | 'teal' | 'red';
}

const GuidelineCard: React.FC<GuidelineCardProps> = ({ item, color }) => {
  const isEmergency = item.title.toLowerCase().includes('emergency') || 
                      item.title.toLowerCase().includes('eclampsia') || 
                      item.title.toLowerCase().includes('haemorrhage') ||
                      item.title.toLowerCase().includes('sepsis') ||
                      item.title.toLowerCase().includes('shock') ||
                      item.title.toLowerCase().includes('convulsion') ||
                      item.title.toLowerCase().includes('resuscitation');

  return (
    <div className="group mac-card bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 p-6 transition-all hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1.5 flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "w-10 h-10 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110",
          color === 'blue' ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600" : 
          color === 'teal' ? "bg-teal-50 dark:bg-teal-900/30 text-teal-600" :
          "bg-red-50 dark:bg-red-900/30 text-red-600"
        )}>
          {isEmergency ? <AlertTriangle className="w-5 h-5 animate-pulse text-red-500" /> : <ClipboardList className="w-5 h-5" />}
        </div>
        {isEmergency && (
          <Badge className="bg-red-500 text-white border-none text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1 animate-pulse shadow-lg shadow-red-500/20">
            Critical Path
          </Badge>
        )}
      </div>
      <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-3 leading-tight group-hover:text-blue-600 transition-colors">
        {item.title}
      </h4>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
          {item.content}
        </p>
      </div>
    </div>
  );
}

