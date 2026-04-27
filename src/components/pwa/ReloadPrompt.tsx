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
    if (needRefresh) {
      toast.info('New clinical updates found. Refreshing to apply...', {
        icon: <RefreshCw className="w-4 h-4 animate-spin" />,
        duration: 5000
      });
      // Small delay to allow user to read the toast
      setTimeout(() => {
        updateServiceWorker(true);
      }, 2000);
    }
  }, [needRefresh, updateServiceWorker]);

  if (!offlineReady) return null;

  return null; // Don't show the manual prompt anymore
}
