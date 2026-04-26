import { ReactNode } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ArrowUpRight, 
  Map as MapIcon, 
  Settings, 
  Search,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import NotificationCenter, { Notification } from './NotificationCenter';
import ProtocolLibrary from './ProtocolLibrary';
import { NavLink } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
  onNewAssessment: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

import { useFirebase } from '../contexts/FirebaseContext';
import { useTheme } from '../contexts/ThemeContext';
import { LogOut, Sun, Moon } from 'lucide-react';

export default function Layout({ 
  children, 
  onNewAssessment,
  notifications,
  onMarkAsRead,
  onClearAll
}: LayoutProps) {
  const { logout, user, profile } = useFirebase();
  const { theme, toggleTheme } = useTheme();

  const getNavItems = (role?: string) => {
    const baseItems = [
      { id: 'dashboard', path: '/dashboard', label: role === 'pcn' ? 'PCN Dashboard' : 'Mission Control', icon: LayoutDashboard },
    ];

    if (role === 'pcn') {
      return [
        ...baseItems,
        { id: 'patients', path: '/patients', label: 'Patient Registry', icon: Users },
        { id: 'referrals', path: '/referrals', label: 'Escalations', icon: ArrowUpRight },
        { id: 'surveillance', path: '/surveillance', label: 'District Map', icon: MapIcon },
      ];
    }

    if (role === 'dmo') {
      return [
        ...baseItems,
        { id: 'referrals', path: '/referrals', label: 'Incoming Referrals', icon: ArrowUpRight },
        { id: 'surveillance', path: '/surveillance', label: 'District Analytics', icon: MapIcon },
        { id: 'admin', path: '/admin', label: 'District Admin', icon: ShieldCheck },
        { id: 'patients', path: '/patients', label: 'District Registry', icon: Users },
      ];
    }

    if (role === 'admin') {
      return [
        ...baseItems,
        { id: 'admin', path: '/admin', label: 'System Admin', icon: ShieldCheck },
        { id: 'patients', path: '/patients', label: 'Patients', icon: Users },
        { id: 'referrals', path: '/referrals', label: 'Escalations', icon: ArrowUpRight },
        { id: 'surveillance', path: '/surveillance', label: 'Surveillance', icon: MapIcon },
      ];
    }

    return [
      ...baseItems,
      { id: 'patients', path: '/patients', label: 'Patients', icon: Users },
      { id: 'referrals', path: '/referrals', label: 'Escalations', icon: ArrowUpRight },
      { id: 'surveillance', path: '/surveillance', label: 'Surveillance', icon: MapIcon },
    ];
  };

  const navItems = getNavItems(profile?.role);

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'pcn': return 'Primary Care Nurse';
      case 'dmo': return 'District Medical Officer';
      case 'specialist': return 'Provincial Specialist';
      case 'admin': return 'System Administrator';
      default: return 'Healthcare Provider';
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar - Finder Style */}
      <aside className="w-64 flex flex-col border-r border-border bg-sidebar/80 backdrop-blur-3xl">
        <div className="p-8 pb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/30">
            <span className="text-white font-black text-xl">C</span>
          </div>
          <div className="flex flex-col">
            <h1 className="font-bold text-lg leading-tight tracking-tight text-foreground">Chengeto</h1>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600">Continuum</p>
          </div>
        </div>

        <div className="px-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search patients..." 
              className="w-full bg-muted border-none rounded-md py-1.5 pl-9 pr-3 text-sm focus:ring-1 focus:ring-blue-500/50 outline-none placeholder:text-muted-foreground/50 text-foreground"
            />
          </div>
        </div>

        <ScrollArea className="flex-1 px-3">
          <div className="space-y-1">
            <p className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Navigation</p>
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 group",
                  isActive 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={cn("w-4 h-4", isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground")} />
                    {item.label}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          <div className="mt-8 space-y-1">
            <p className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Recent Clinics</p>
            {['Kuwirirana Clinic', 'Zumba Clinic', 'Chireya Mission'].map((clinic) => (
              <button key={clinic} className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-muted hover:text-foreground group">
                <span className="truncate">{clinic}</span>
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>

          <div className="mt-auto px-6 py-4 border-t border-border/50">
            <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">Developer Signature</p>
            <p className="text-[10px] font-medium text-muted-foreground/60 mt-1 italic">Created by Mugove Chakoma</p>
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-muted">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 border border-border flex items-center justify-center text-[10px] font-bold text-foreground">
              {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate text-foreground">{user?.displayName || user?.email?.split('@')[0] || 'User'}</p>
              <p className="text-[10px] text-muted-foreground truncate">{getRoleLabel(profile?.role)}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => logout()} className="h-8 w-8 text-muted-foreground hover:text-red-600">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Bar */}
        <header className="h-16 border-b border-border bg-background/40 backdrop-blur-xl flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {navItems.find(i => i.path === location.pathname)?.label || 'Overview'}
            </h2>
            <div className="h-6 w-[1px] bg-border mx-1 hidden md:block" />
            <div className="hidden lg:flex items-center gap-4">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Node: Gokwe North HQ</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Status: Syncing</span>
               </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ProtocolLibrary />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground h-10 w-10 rounded-full"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>
            <NotificationCenter 
              notifications={notifications} 
              onMarkAsRead={onMarkAsRead} 
              onClearAll={onClearAll} 
            />
            <div className="h-4 w-[1px] bg-border mx-1" />
            <Button 
              onClick={onNewAssessment}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 rounded-full px-6"
            >
              New Assessment
            </Button>
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 overflow-auto p-8 bg-background">
          {children}
        </div>
      </main>
    </div>
  );
}
