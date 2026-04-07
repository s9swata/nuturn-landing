'use client';

import React, { useMemo } from 'react';

interface FooterLayerProps {
  activeFrame: number;
}

export const FooterLayer: React.FC<FooterLayerProps> = ({ activeFrame }) => {
  // Trigger range: 230 to 240
  const visibility = useMemo(() => {
    if (activeFrame < 230) return 0;
    
    // Scale from 0 to 1 between 230 and 240
    return Math.min(1, (activeFrame - 230) / 10);
  }, [activeFrame]);

  if (visibility <= 0) return null;

  return (
    <div 
      className="absolute inset-0 z-40 bg-black text-white p-8 md:p-24 flex flex-col justify-center items-center pointer-events-auto"
      style={{ opacity: visibility }}
    >
      <div className="max-w-6xl w-full mx-auto flex flex-col gap-12 text-center md:text-left">
        <div className="max-w-xl mx-auto md:mx-0">
          <h1 
            className="text-4xl md:text-8xl font-expanded-bold uppercase tracking-tighter leading-[0.8] mb-8"
            style={{ transform: `scale(${0.9 + visibility * 0.1})` }}
          >
            Your vision.<br />
            <span className="text-white/20">Built for the Future.</span>
          </h1>
          <div className="w-12 h-px bg-white/20 mb-8 mx-auto md:mx-0"></div>
          <p className="text-sm md:text-lg text-white/50 font-roc leading-relaxed max-w-sm mb-12">
            Luxury commerce and enterprise SaaS engineered to define the future of your brand presence.
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-12 w-full mt-auto">
          <button className="bg-white text-black px-12 py-4 rounded-full uppercase tracking-widest font-expanded-medium text-xs font-bold hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-4">
            Start a Digital Evolution
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </button>
          <div className="flex gap-8 text-[10px] md:text-xs uppercase tracking-[0.25em] text-white/30 font-roc">
            <span className="hover:text-white cursor-pointer transition-colors">Instagram</span>
            <span>/</span>
            <span className="hover:text-white cursor-pointer transition-colors">LinkedIn</span>
            <span>/</span>
            <span className="hover:text-white cursor-pointer transition-colors">Twitter</span>
          </div>
        </div>
      </div>
    </div>
  );
};
