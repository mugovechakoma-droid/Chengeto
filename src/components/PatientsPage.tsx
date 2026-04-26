import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  ChevronRight, 
  Calendar, 
  Activity,
  UserPlus
} from 'lucide-react';
import { Patient } from '../types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface PatientsPageProps {
  patients: Patient[];
  onPatientClick: (patient: Patient) => void;
  onNewPatient: () => void;
}

const PatientsPage: React.FC<PatientsPageProps> = ({ patients, onPatientClick, onNewPatient }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'high-risk' | 'delivered'>('all');

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'high-risk') return matchesSearch && p.riskLevel === 'high';
    if (activeTab === 'delivered') return matchesSearch && p.status === 'delivered';
    return matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Patient Registry</h2>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            Managing {patients.length} active clinical profiles in Gokwe North
          </p>
        </div>
        <Button onClick={onNewPatient} className="rounded-2xl bg-blue-600 hover:bg-blue-700 h-12 px-6 font-bold shadow-lg shadow-blue-500/20 gap-2">
          <UserPlus className="w-5 h-5" />
          Enroll New Patient
        </Button>
      </div>

      {/* Registry Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm transition-all focus-within:shadow-md">
        <div className="flex bg-muted p-1 rounded-[22px] w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Patients' },
            { id: 'high-risk', label: 'High Risk' },
            { id: 'delivered', label: 'Post-Delivery' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-6 py-2 rounded-[18px] text-[11px] font-bold uppercase tracking-wider transition-all",
                activeTab === tab.id 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, ID, or location..." 
            className="pl-11 h-11 rounded-[20px] border-none bg-muted/50 focus:bg-muted transition-all text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Registry Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-muted/30">
                <th className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Patient Details</th>
                <th className="px-6 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Gestation</th>
                <th className="px-6 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Risk Status</th>
                <th className="px-6 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Last Visit</th>
                <th className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <AnimatePresence mode="popLayout">
                {filteredPatients.length > 0 ? filteredPatients.map((p, i) => (
                  <motion.tr 
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                    onClick={() => onPatientClick(p)}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          {p.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{p.name}</p>
                          <p className="text-[11px] font-medium text-slate-400">ID: {p.id} • {p.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="text-sm font-bold dark:text-white">{p.gestationalAge} wks</span>
                        <span className="text-[9px] text-slate-400 font-medium uppercase">EDD {p.edd ? new Date(p.edd).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <Badge className={cn(
                        "rounded-full px-4 py-1 border-none font-bold text-[9px] uppercase tracking-widest",
                        p.riskLevel === 'high' ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" :
                        p.riskLevel === 'medium' ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" :
                        "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                      )}>
                        {p.riskLevel} Risk
                      </Badge>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(p.lastVisit).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <Button variant="ghost" size="icon" className="rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-400 hover:text-blue-600 transition-all">
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </td>
                  </motion.tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Users className="w-10 h-10 opacity-20 mb-2" />
                        <p className="font-bold">No patients found matching your criteria</p>
                        <p className="text-xs">Try adjusting your search or filters</p>
                        <Button variant="link" className="mt-2 text-blue-600" onClick={() => {setSearchQuery(''); setActiveTab('all');}}>Clear all filters</Button>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PatientsPage;
