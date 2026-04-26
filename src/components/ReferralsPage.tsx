import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  Clock, 
  MapPin, 
  Ambulance, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Hospital
} from 'lucide-react';
import { Referral } from '../types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ReferralsPageProps {
  referrals: Referral[];
  onUpdateStatus: (id: string, status: Referral['status']) => void;
  onViewPatient: (id: string) => void;
}

const ReferralsPage: React.FC<ReferralsPageProps> = ({ referrals, onUpdateStatus, onViewPatient }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReferrals = referrals.filter(r => 
    r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.patientId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeReferrals = filteredReferrals.filter(r => r.status !== 'completed' && r.status !== 'arrived');
  const completedReferrals = filteredReferrals.filter(r => r.status === 'completed' || r.status === 'arrived');

  const getStatusColor = (status: Referral['status']) => {
    switch (status) {
      case 'pending': return 'bg-amber-500';
      case 'accepted': return 'bg-blue-500';
      case 'dispatched': return 'bg-indigo-500';
      case 'arrived': return 'bg-emerald-500';
      default: return 'bg-slate-500';
    }
  };

  const getUrgencyStyles = (urgency: Referral['urgency']) => {
    switch (urgency) {
      case 'emergency': return 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:border-red-900/30';
      case 'urgent': return 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/30';
      default: return 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-900/20 dark:border-slate-800';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Referral Tracking</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Gokwe North Logistics Network</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search patient or referral ID..."
            className="pl-9 h-10 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-[32px] bg-red-50/30 dark:bg-red-900/10 border-red-100/50 dark:border-red-900/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-2xl bg-red-500 flex items-center justify-center text-white">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <TrendingUp className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">
            {referrals.filter(r => r.urgency === 'emergency').length}
          </p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Active Emergencies</p>
        </div>

        <div className="glass-panel p-6 rounded-[32px] bg-blue-50/30 dark:bg-blue-900/10 border-blue-100/50 dark:border-blue-900/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-500 flex items-center justify-center text-white">
              <Ambulance className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">
            {activeReferrals.length}
          </p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Total In Transit</p>
        </div>

        <div className="glass-panel p-6 rounded-[32px] bg-emerald-50/30 dark:bg-emerald-900/10 border-emerald-100/50 dark:border-emerald-900/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">
            {completedReferrals.length}
          </p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Successful Arrivals</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Escalations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Live Escalations
            </h3>
            <Badge variant="outline" className="rounded-full">{activeReferrals.length}</Badge>
          </div>

          <div className="space-y-3">
            {activeReferrals.length === 0 ? (
              <div className="p-12 text-center glass-panel rounded-[32px] border-dashed">
                <p className="text-sm text-slate-400">No active escalations at this time.</p>
              </div>
            ) : (
              activeReferrals.map(referral => (
                <div 
                  key={referral.id} 
                  className={cn(
                    "glass-panel p-5 rounded-[28px] border transition-all hover:scale-[1.01] group relative overflow-hidden",
                    referral.urgency === 'emergency' ? "border-red-200/50 dark:border-red-900/30" : "border-slate-100 dark:border-white/5"
                  )}
                >
                  {referral.urgency === 'emergency' && (
                    <div className="absolute top-0 right-0 p-3">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.5)]" />
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="space-y-1">
                      <h4 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">{referral.patientName}</h4>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <MapPin className="w-3 h-3" />
                        {referral.fromClinic} → {referral.toHospital}
                      </div>
                    </div>
                    <Badge className={cn("rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-tighter", getUrgencyStyles(referral.urgency))}>
                      {referral.urgency}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 space-y-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Reason</p>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{referral.reason}</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 space-y-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-1.5 h-1.5 rounded-full", getStatusColor(referral.status))} />
                        <p className="text-xs font-black uppercase tracking-tighter text-slate-900 dark:text-white">{referral.status}</p>
                      </div>
                    </div>
                  </div>

                  {referral.clinicalRecommendations && referral.clinicalRecommendations.length > 0 && (
                    <div className="mb-6 p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-900/20 space-y-2">
                      <p className="text-[9px] font-black uppercase tracking-widest text-blue-600">Actions Initiated</p>
                      <div className="space-y-1">
                        {referral.clinicalRecommendations.map((rec, i) => (
                          <div key={i} className="flex gap-2 items-start text-[10px] leading-tight text-slate-600 dark:text-slate-400">
                            <div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                            <p>{rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {referral.status === 'pending' && (
                      <Button 
                        size="sm" 
                        className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 h-10 text-[10px] font-bold uppercase tracking-widest"
                        onClick={() => onUpdateStatus(referral.id, 'dispatched')}
                      >
                        Dispatch Ambulance
                      </Button>
                    )}
                    {referral.status === 'dispatched' && (
                      <Button 
                        size="sm" 
                        className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 h-10 text-[10px] font-bold uppercase tracking-widest"
                        onClick={() => onUpdateStatus(referral.id, 'arrived')}
                      >
                        Confirm Arrival
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-white/10"
                      onClick={() => onViewPatient(referral.patientId)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* History / Recently Arrived */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
              <Hospital className="w-4 h-4 text-emerald-500" />
              Arrival History
            </h3>
            <span className="text-[10px] font-bold text-slate-400">Past 24 Hours</span>
          </div>

          <div className="glass-panel rounded-[32px] overflow-hidden border-slate-100 dark:border-white/5">
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {completedReferrals.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No completed transfers recorded.</div>
              ) : (
                completedReferrals.map(referral => (
                  <div key={referral.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div 
                        className="cursor-pointer group-hover:opacity-80 transition-opacity"
                        onClick={() => onViewPatient(referral.patientId)}
                      >
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{referral.patientName}</p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Hospital className="w-3 h-3" />
                          {referral.toHospital}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-900 dark:text-white tabular-nums">
                        {new Date(referral.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Arrived</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralsPage;
