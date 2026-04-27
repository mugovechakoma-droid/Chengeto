import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Users, 
  ShieldAlert, 
  Settings, 
  Download, 
  Search, 
  Filter, 
  BarChart3, 
  TrendingUp, 
  Ambulance, 
  Droplets, 
  Stethoscope,
  Activity,
  Zap,
  Globe,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { useFirebase } from '../contexts/FirebaseContext';
import { seedPatients } from '../lib/firebase';
import { toast } from 'sonner';

const MOCK_FACILITIES = [
// ... (rest of the file)
  { name: 'Murehwa District Hospital', type: 'District', status: 'Online', reporting: 100, patients: 450, staff: '124', riskSaturation: 12, color: 'text-blue-600', bg: 'bg-blue-50' },
  { name: 'Zumba Rural Clinic', type: 'Clinic', status: 'Online', reporting: 94, patients: 120, staff: '12', riskSaturation: 45, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { name: 'Murehwa North Post', type: 'Post', status: 'Offline', reporting: 0, patients: 45, staff: '2', riskSaturation: 0, color: 'text-slate-400', bg: 'bg-slate-100' },
  { name: 'Kuwirirana Clinic', type: 'Clinic', status: 'Online', reporting: 88, patients: 86, staff: '8', riskSaturation: 22, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { name: 'Gokwe South Facility', type: 'Clinic', status: 'Online', reporting: 92, patients: 145, staff: '15', riskSaturation: 38, color: 'text-amber-600', bg: 'bg-amber-50' },
];

const MOCK_RESOURCES = [
  { item: 'Magnesium Sulfate', level: 85, target: '200 Units', trend: 'stable' },
  { item: 'Oxytocin', level: 42, target: '500 Units', trend: 'down' },
  { item: 'Blood O-', level: 12, target: '20 Units', trend: 'critical' },
  { item: 'Ambulance Fuel', level: 95, target: '1000L', trend: 'up' },
];

const MOCK_KPI_DATA = [
  { month: 'Jan', anc: 85, delivery: 78 },
  { month: 'Feb', anc: 92, delivery: 82 },
  { month: 'Mar', anc: 88, delivery: 85 },
  { month: 'Apr', anc: 95, delivery: 90 },
];

const DistrictAdminPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { profile, user } = useFirebase();
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeed = async () => {
    if (!user) return;
    setIsSeeding(true);
    try {
      await seedPatients(user.uid);
      toast.success('Firebase seeded with clinical dataset');
    } catch (error) {
      toast.error('Failed to seed database');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">District Administration</h1>
          <p className="text-sm text-muted-foreground">Governance and resource orchestration for Gokwe North.</p>
        </div>
        <div className="flex items-center gap-2">
          {profile?.role === 'admin' && (
            <Button 
              onClick={handleSeed}
              variant="outline" 
              size="sm" 
              disabled={isSeeding}
              className="rounded-xl h-9 border-amber-200 text-amber-700 hover:bg-amber-50"
            >
              <Zap className={cn("w-4 h-4 mr-2", isSeeding && "animate-pulse")} />
              {isSeeding ? 'Seeding...' : 'Seed Database'}
            </Button>
          )}
          <Button variant="outline" size="sm" className="rounded-xl h-9">
            <Download className="w-4 h-4 mr-2" />
            District Report
          </Button>
          <Button className="rounded-xl h-9 bg-blue-600 hover:bg-blue-700 text-white">
            <Settings className="w-4 h-4 mr-2" />
            Operational Settings
          </Button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Facilities', value: '18', sub: '3 Pending Sync', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Patients', value: '1,248', sub: '+12% this month', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Referral Success', value: '98.2%', sub: 'Target 95%', icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Emergency Response', value: '14m', sub: '-2m vs district avg', icon: Ambulance, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="mac-card p-6 flex flex-col gap-4 bg-card border-border shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div className={cn("p-3 rounded-2xl", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <Badge variant="secondary" className="bg-white dark:bg-slate-800 text-[10px] uppercase font-bold tracking-widest">{stat.label}</Badge>
            </div>
            <div>
              <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
              <p className="text-[11px] font-medium text-muted-foreground mt-1">{stat.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column: Facility Matrix */}
        <div className="xl:col-span-8 space-y-8">
           <div className="mac-card p-6 bg-white dark:bg-slate-900 border-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  District Facility Matrix
                </h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Filter clinics..." 
                      className="pl-9 h-9 text-xs rounded-full bg-slate-50 dark:bg-slate-800 border-none w-48"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-4 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Facility</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Status</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 text-center">Data Sync</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 text-center">Risk Saturation</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {MOCK_FACILITIES.map((facility) => (
                      <tr key={facility.name} className="group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold", facility.bg, facility.color)}>
                              {facility.name[0]}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground">{facility.name}</p>
                              <p className="text-[10px] font-medium text-muted-foreground uppercase">{facility.type}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <Badge className={cn(
                            "text-[10px] font-bold uppercase tracking-widest",
                            facility.status === 'Online' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"
                          )}>
                            {facility.status}
                          </Badge>
                        </td>
                        <td className="py-4">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs font-bold">{facility.reporting}%</span>
                            <div className="w-16 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600" style={{ width: `${facility.reporting}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                           <div className="flex items-center justify-center gap-2">
                             <div className={cn(
                                "w-2 h-2 rounded-full h-8",
                                facility.riskSaturation > 40 ? "bg-red-500" : facility.riskSaturation > 20 ? "bg-amber-500" : "bg-emerald-500"
                             )} />
                             <span className="text-xs font-bold">{facility.riskSaturation > 0 ? `${facility.riskSaturation}%` : 'N/A'}</span>
                           </div>
                        </td>
                        <td className="py-4 text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight className="w-5 h-5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </div>

           {/* Health Coverage Trends */}
           <div className="mac-card p-6 bg-white dark:bg-slate-900 border-border">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold">Health Coverage Trends</h3>
                  <p className="text-xs text-muted-foreground">ANC vs. Facility Delivery coverage rates.</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-foreground">ANC Coverage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-foreground">Facility Delivery</span>
                  </div>
                </div>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MOCK_KPI_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#94a3b8'}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                    />
                    <Bar dataKey="anc" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                    <Bar dataKey="delivery" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>
        </div>

        {/* Right Column: Resources & Intelligence */}
        <div className="xl:col-span-4 space-y-6">
           <div className="mac-card p-6 bg-slate-900 text-white rounded-[32px] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                 <ShieldAlert className="w-24 h-24" />
              </div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                 <Zap className="w-3 h-3 text-amber-500" />
                 District Compliance Alert
              </h4>
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 backdrop-blur-md mb-6">
                 <p className="text-[10px] font-bold text-red-400 uppercase mb-2">Critical Performance Gap</p>
                 <p className="text-sm font-medium leading-relaxed">
                   3 Rural clinics in Murehwa North have not synchronized clinical data in the last 48 hours. Communication follow-up required.
                 </p>
                 <Button variant="ghost" className="p-0 h-auto text-red-400 text-[10px] font-bold uppercase mt-3 hover:bg-transparent">
                   Initiate Contact <ChevronRight className="w-3 h-3 ml-1" />
                 </Button>
              </div>
           </div>

           <div className="mac-card p-6 bg-white dark:bg-slate-900 border-border">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                 <Droplets className="w-4 h-4 text-red-500" />
                 Vital Commodities
              </h4>
              <div className="space-y-6">
                 {MOCK_RESOURCES.map(r => (
                   <div key={r.item} className="space-y-2">
                      <div className="flex items-center justify-between">
                         <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{r.item}</span>
                            <p className="text-[9px] font-medium text-slate-400">Target: {r.target}</p>
                         </div>
                         <Badge variant="outline" className={cn(
                           "text-[8px] font-bold uppercase",
                           r.trend === 'critical' ? 'text-red-600 border-red-200' : 
                           r.trend === 'down' ? 'text-amber-600 border-amber-200' :
                           'text-emerald-600 border-emerald-200'
                         )}>{r.trend}</Badge>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                         <div className={cn(
                           "h-full",
                           r.level > 50 ? "bg-emerald-500" : r.level > 20 ? "bg-amber-500" : "bg-red-500"
                         )} style={{ width: `${r.level}%` }} />
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="mac-card p-6 bg-blue-600 text-white rounded-[32px] space-y-4">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] opacity-60">Logistics Readiness</h4>
              <div className="grid grid-cols-2 gap-4 pt-2">
                 <div className="p-3 rounded-2xl bg-white/10 border border-white/10">
                    <div className="flex items-center justify-between mb-1">
                      <Ambulance className="w-4 h-4" />
                      <span className="text-[10px] font-bold">85%</span>
                    </div>
                    <p className="text-sm font-bold">Ambulance</p>
                    <p className="text-[9px] opacity-60">District Fleet Ready</p>
                 </div>
                 <div className="p-3 rounded-2xl bg-white/10 border border-white/10">
                    <div className="flex items-center justify-between mb-1">
                      <Stethoscope className="w-4 h-4" />
                      <span className="text-[10px] font-bold">482</span>
                    </div>
                    <p className="text-sm font-bold">Health Staff</p>
                    <p className="text-[9px] opacity-60">Assigned District-wide</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DistrictAdminPage;
