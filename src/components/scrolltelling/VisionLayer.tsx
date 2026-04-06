'use client';

import React, { useMemo } from 'react';

interface VisionLayerProps {
  activeFrame: number;
}

export const VisionLayer: React.FC<VisionLayerProps> = ({ activeFrame }) => {
  // Trigger range: 185 to 205
  // We want it to be fully visible by 195 and start fading out slightly or stay by 205
  const visibility = useMemo(() => {
    if (activeFrame < 185) return 0;
    if (activeFrame > 215) return 0;
    
    // Fade in between 185 and 195
    if (activeFrame >= 185 && activeFrame <= 195) {
      return (activeFrame - 185) / 10;
    }
    
    // Hold between 195 and 205
    if (activeFrame > 195 && activeFrame <= 205) {
      return 1;
    }
    
    // Fade out between 205 and 215
    if (activeFrame > 205 && activeFrame <= 215) {
      return 1 - (activeFrame - 205) / 10;
    }
    
    return 0;
  }, [activeFrame]);

  if (visibility <= 0) return null;

  return (
    <div 
      className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none p-8 md:p-24"
      style={{ opacity: visibility }}
    >
      <div className="max-w-4xl text-center space-y-6 md:space-y-8">
        <span className="text-[10px] md:text-xs uppercase tracking-[0.5em] text-black/30 font-sans block mb-2 transition-transform duration-1000"
              style={{ transform: `translateY(${(1 - visibility) * 20}px)` }}>
          Precision Narrative
        </span>
        <h1 
          className="text-4xl md:text-7xl font-sans font-black uppercase tracking-tighter leading-[0.9] text-black"
          style={{ transform: `translateY(${(1 - visibility) * 40}px)` }}
        >
          Architecture that <br />
          <span className="text-black/20">Builds the Future.</span>
        </h1>
        <div className="w-12 md:w-24 h-px bg-black/10 mx-auto transform transition-all duration-1000"
              style={{ width: visibility * 96 }}></div>
        <p 
          className="text-sm md:text-xl text-black/60 font-sans max-w-2xl mx-auto leading-relaxed"
          style={{ transform: `translateY(${(1 - visibility) * 30}px)` }}
        >
          We transform complex business visions into cinematic digital realities. Scalable SaaS engineering meets high-end brand storytelling.
        </p>
      </div>
    </div>
  );
};
