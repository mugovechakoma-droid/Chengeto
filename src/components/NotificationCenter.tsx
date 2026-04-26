import { useState } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  AlertCircle, 
  Info, 
  Clock,
  ChevronRight,
  ShieldAlert,
  Ambulance,
  Stethoscope
} from 'lucide-react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  read: boolean;
  category?: 'referral' | 'risk' | 'system';
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export default function NotificationCenter({ notifications, onMarkAsRead, onClearAll }: NotificationCenterProps) {
  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: Notification['type'], category?: Notification['category']) => {
    if (category === 'referral') return <Ambulance className="w-4 h-4 text-blue-500" />;
    if (category === 'risk') return <ShieldAlert className="w-4 h-4 text-red-500" />;
    
    switch (type) {
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'success': return <Check className="w-4 h-4 text-emerald-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 border-border bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl rounded-2xl shadow-2xl" align="end">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <Badge className="bg-blue-600 text-white text-[10px] px-1.5 py-0 h-4">{unreadCount}</Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClearAll} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">
            Clear All
          </Button>
        </div>
        <ScrollArea className="h-[400px]">
          <div className="divide-y divide-border">
            <AnimatePresence initial={false}>
              {notifications.length === 0 ? (
                <div className="p-8 text-center space-y-2 opacity-40">
                  <Bell className="w-8 h-8 mx-auto text-muted-foreground" />
                  <p className="text-xs font-bold">All caught up!</p>
                </div>
              ) : (
                notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={cn(
                      "p-4 flex gap-3 transition-colors hover:bg-muted/50 group relative",
                      !notification.read && "bg-blue-50/30 dark:bg-blue-900/10"
                    )}
                  >
                    <div className="mt-0.5 shrink-0">
                      {getIcon(notification.type, notification.category)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className={cn("text-xs font-bold", !notification.read ? "text-foreground" : "text-muted-foreground")}>
                          {notification.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.read && (
                      <button 
                        onClick={() => onMarkAsRead(notification.id)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full"
                      >
                        <Check className="w-3 h-3 text-blue-600" />
                      </button>
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
        <div className="p-3 border-t border-border text-center">
          <Button variant="ghost" size="sm" className="w-full text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-700">
            View All Activity
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
