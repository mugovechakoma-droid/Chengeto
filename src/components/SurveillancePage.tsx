import React from 'react';
import { Map as MapIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SurveillancePage: React.FC = () => {
  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-black/[0.05] dark:border-white/[0.05] bg-white dark:bg-slate-900 relative min-h-[600px]">
      <iframe 
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2295499.0380129246!2d28.592142381787447!3d-17.522089124765113!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1937e227cf8f781f%3A0x5e27a79725768876!2sGokwe%20North!5e1!3m2!1sen!2szw!4v1776898098762!5m2!1sen!2szw" 
        width="100%" 
        height="100%" 
        style={{ border: 0 }} 
        allowFullScreen={true} 
        loading="lazy" 
        referrerPolicy="no-referrer-when-downgrade"
        title="Gokwe North District Heatmap"
        className="grayscale-[0.2] dark:invert-[0.9] dark:hue-rotate-180"
      />
      
      {/* Floating Control Card */}
      <div className="absolute top-6 left-6 flex flex-col gap-2 z-10 pointer-events-none">
        <div className="glass-panel p-4 rounded-3xl space-y-3 w-64 shadow-2xl border border-white/20 dark:border-white/5 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 pointer-events-auto">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-6 bg-blue-600 rounded-full" />
            <h3 className="font-bold text-sm text-foreground">District Surveillance</h3>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Live risk assessment clusters for Gokwe North. Data synchronized with clinic assessments.
          </p>
          
          <div className="pt-2 space-y-2 border-t border-black/5 dark:border-white/5">
            <p className="text-[10px] font-bold text-black/40 dark:text-white/40 uppercase tracking-widest">Risk Legend</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                  <span className="text-[10px] font-semibold text-foreground">Critical Status</span>
                </div>
                <span className="text-[10px] font-bold text-red-600 dark:text-red-400">High</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                  <span className="text-[10px] font-semibold text-foreground">Warning Zone</span>
                </div>
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">Med</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] font-semibold text-foreground">Stable Area</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Low</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 right-6 z-10 flex gap-2">
         <Button variant="secondary" size="sm" className="rounded-full shadow-lg backdrop-blur-md bg-white/90 dark:bg-slate-800/90 font-bold text-[10px] uppercase tracking-wider h-8">
            Filter Layers
         </Button>
         <Button variant="secondary" size="sm" className="rounded-full shadow-lg backdrop-blur-md bg-white/90 dark:bg-slate-800/90 font-bold text-[10px] uppercase tracking-wider h-8">
            Export Data
         </Button>
      </div>
    </div>
  );
};

export default SurveillancePage;
