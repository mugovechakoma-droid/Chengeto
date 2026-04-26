import { useState, useMemo } from 'react';
import { 
  Users, 
  Hospital, 
  Activity, 
  ShieldCheck, 
  Database, 
  BarChart3, 
  History, 
  Settings, 
  AlertTriangle,
  ArrowUpRight,
  Search,
  Plus,
  MoreVertical,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Server,
  Globe,
  Lock,
  FileText,
  ChevronRight,
  UserPlus,
  Building2,
  Zap
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Patient, Referral, UserProfile } from '../../types';

interface AdminDashboardProps {
  patients: Patient[];
  referrals: Referral[];
  onPatientClick: (patient: Patient) => void;
}

const MOCK_ANALYTICS = [
  { name: 'Jan', referrals: 45, anc: 120 },
  { name: 'Feb', referrals: 52, anc: 145 },
  { name: 'Mar', referrals: 48, anc: 132 },
  { name: 'Apr', referrals: 61, anc: 168 },
  { name: 'May', referrals: 55, anc: 155 },
  { name: 'Jun', referrals: 67, anc: 189 },
];

const MOCK_REASONS = [
  { reason: 'Preeclampsia', count: 45 },
  { reason: 'Obstructed Labor', count: 32 },
  { reason: 'APH/PPH', count: 28 },
  { reason: 'Malpresentation', count: 15 },
  { reason: 'Fetal Distress', count: 12 },
];

const MOCK_USERS: Partial<UserProfile>[] = [
  { uid: '1', email: 'pcn@chengeto.gov.zw', displayName: 'Sr. Sibanda', role: 'pcn', clinic: 'Murehwa Clinic' },
  { uid: '2', email: 'dmo@chengeto.gov.zw', displayName: 'Dr. Moyo', role: 'dmo', clinic: 'Murehwa District Hospital' },
  { uid: '3', email: 'specialist@chengeto.gov.zw', displayName: 'Dr. Chen', role: 'specialist', clinic: 'Parirenyatwa Hospital' },
  { uid: '4', email: 'admin@chengeto.gov.zw', displayName: 'Admin User', role: 'admin', clinic: 'MOHCC HQ' },
];

const MOCK_LOGS = [
  { id: '1', user: 'Sr. Sibanda', action: 'Created Referral', target: 'Sarah Moyo', timestamp: '2026-04-12T09:15:00Z', location: 'Murehwa Clinic' },
  { id: '2', user: 'Dr. Moyo', action: 'Accepted Referral', target: 'Sarah Moyo', timestamp: '2026-04-12T09:22:00Z', location: 'Murehwa District Hospital' },
  { id: '3', user: 'Admin User', action: 'Updated Role', target: 'Dr. Chen', timestamp: '2026-04-12T08:45:00Z', location: 'MOHCC HQ' },
];

export default function AdminDashboard({ patients, referrals, onPatientClick }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const stats = [
    { label: 'Total Users', value: '124', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Facilities', value: '18', icon: Hospital, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Patients', value: patients.length.toString(), icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Referrals (MTD)', value: referrals.length.toString(), icon: ArrowUpRight, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Administration</h1>
          <p className="text-sm text-muted-foreground">Operational backbone & governance control center.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="h-8 px-3 border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
            <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
            System Online
          </Badge>
          <Button variant="outline" size="sm" className="rounded-xl">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="bg-muted/50 p-1 rounded-2xl w-fit mb-6">
          <TabsTrigger value="overview" className="rounded-xl px-6">Overview</TabsTrigger>
          <TabsTrigger value="users" className="rounded-xl px-6">Users & Roles</TabsTrigger>
          <TabsTrigger value="facilities" className="rounded-xl px-6">Facilities</TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-xl px-6">Analytics</TabsTrigger>
          <TabsTrigger value="logs" className="rounded-xl px-6">Audit Logs</TabsTrigger>
          <TabsTrigger value="settings" className="rounded-xl px-6">Settings</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="overview" className="m-0 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="mac-card p-6 bg-card border-border"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn("p-3 rounded-2xl", stat.bg)}>
                      <stat.icon className={cn("w-6 h-6", stat.color)} />
                    </div>
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-none">+12%</Badge>
                  </div>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                  <p className="text-3xl font-bold tracking-tight mt-1">{stat.value}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* System Health */}
              <div className="lg:col-span-2 mac-card p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    Operational Traffic
                  </h3>
                  <div className="flex gap-4">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Uptime</p>
                      <p className="text-sm font-bold text-emerald-600">99.98%</p>
                    </div>
                    <div className="text-right border-l pl-4 border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Sync Latency</p>
                      <p className="text-sm font-bold text-blue-600">42ms</p>
                    </div>
                  </div>
                </div>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MOCK_ANALYTICS}>
                      <defs>
                        <linearGradient id="colorAnc" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Area type="monotone" dataKey="anc" stroke="#3b82f6" fillOpacity={1} fill="url(#colorAnc)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Data Quality */}
              <div className="mac-card p-6 space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-500" />
                  Data Quality Score
                </h3>
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                      <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364.4} strokeDashoffset={364.4 * (1 - 0.94)} className="text-emerald-500 transition-all duration-1000" />
                    </svg>
                    <span className="absolute text-3xl font-bold">94%</span>
                  </div>
                  <p className="text-sm font-bold text-muted-foreground mt-4">System-wide Integrity</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Complete ANC Records</span>
                    <span className="font-bold">98.2%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[98.2%]" />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Valid Phone Numbers</span>
                    <span className="font-bold">89.5%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 w-[89.5%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Distribution Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
               <div className="mac-card p-6 space-y-6">
                 <h3 className="text-lg font-bold flex items-center gap-2">
                   <BarChart3 className="w-5 h-5 text-red-500" />
                   Referral Distribution by Reason
                 </h3>
                 <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={MOCK_REASONS} layout="vertical" margin={{ left: 40 }}>
                          <XAxis type="number" hide />
                          <YAxis dataKey="reason" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600}} width={120} />
                          <Tooltip />
                          <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
               </div>

               <div className="mac-card p-6 space-y-6">
                 <h3 className="text-lg font-bold flex items-center gap-2">
                   <Globe className="w-5 h-5 text-emerald-500" />
                   Facility Reporting Compliance
                 </h3>
                 <div className="space-y-4">
                    {[
                      { name: 'Murehwa District', status: '100%', color: 'bg-emerald-500' },
                      { name: 'Gokwe North Pilot', status: '94%', color: 'bg-emerald-500' },
                      { name: 'Mutare Central', status: '82%', color: 'bg-amber-500' },
                      { name: 'Bulawayo General', status: '45%', color: 'bg-red-500' },
                    ].map(f => (
                      <div key={f.name} className="space-y-2">
                         <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{f.name}</span>
                            <span className="text-xs font-bold">{f.status}</span>
                         </div>
                         <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className={cn("h-full", f.color)} style={{ width: f.status }} />
                         </div>
                      </div>
                    ))}
                 </div>
               </div>
            </div>
          </TabsContent>

          <TabsContent value="users" className="m-0 space-y-6">
            <div className="flex items-center justify-between">
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search users..." 
                  className="pl-10 rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
                <UserPlus className="w-4 h-4 mr-2" />
                Add New User
              </Button>
            </div>

            <div className="mac-card overflow-hidden border-border">
              <table className="w-full text-left">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">User</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Role</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Facility</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {MOCK_USERS.map((user) => (
                    <tr key={user.uid} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                            {user.displayName?.[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold">{user.displayName}</p>
                            <p className="text-[10px] text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest">
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {user.clinic}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className="bg-emerald-50 text-emerald-700 border-none text-[10px]">Active</Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="m-0 space-y-6">
            <div className="mac-card overflow-hidden border-border">
              <table className="w-full text-left">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Timestamp</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">User</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Action</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Target</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {MOCK_LOGS.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-xs text-muted-foreground font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold">
                        {log.user}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-widest">
                          {log.action}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {log.target}
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {log.location}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="m-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="mac-card p-6 space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  Security Policies
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-border">
                    <div>
                      <p className="text-sm font-bold">Two-Factor Authentication</p>
                      <p className="text-xs text-muted-foreground">Require 2FA for all administrative accounts.</p>
                    </div>
                    <div className="w-10 h-5 bg-blue-600 rounded-full relative">
                      <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-border">
                    <div>
                      <p className="text-sm font-bold">Session Timeout</p>
                      <p className="text-xs text-muted-foreground">Automatically log out inactive users after 15 mins.</p>
                    </div>
                    <Badge variant="outline">15 MINS</Badge>
                  </div>
                </div>
              </div>

              <div className="mac-card p-6 space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Globe className="w-5 h-5 text-emerald-600" />
                  Integration & Interoperability
                </h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-border flex items-center justify-center">
                        <FileText className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">National EHR (Impilo)</p>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Connected</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs">Configure</Button>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-border flex items-center justify-center">
                        <Server className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">HL7/FHIR Gateway</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Standby</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs">Initialize</Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
