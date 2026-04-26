import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { toast } from 'sonner';
import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  React.useEffect(() => {
    if (offlineReady) {
      toast.success('App ready to work offline');
    }
  }, [offlineReady]);

  if (!needRefresh) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-[100] max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin-slow" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">New Version Available</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Update to get the latest clinical features and fixes.
              </p>
            </div>
          </div>
          <button 
            onClick={close}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="default"
            size="sm"
            className="flex-1 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
            onClick={() => updateServiceWorker(true)}
          >
            Update Now
          </Button>
          <Button 
            variant="ghost"
            size="sm"
            className="rounded-2xl font-semibold transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={close}
          >
            Later
          </Button>
        </div>
      </div>
    </div>
  );
}
