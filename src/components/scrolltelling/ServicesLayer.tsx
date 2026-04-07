'use client';

import React, { useMemo } from 'react';

interface ServicesLayerProps {
  activeFrame: number;
}

const PortfolioCard = ({ 
  src, 
  category, 
  title, 
  desc, 
  isVisible, 
  delay = 0 
}: { 
  src: string; 
  category: string; 
  title: string; 
  desc: string; 
  isVisible: boolean;
  delay?: number;
}) => {
  return (
    <div 
      className="group cursor-pointer space-y-4 md:space-y-6 transform transition-all duration-1000 cubic-bezier(0.23, 1, 0.32, 1)"
      style={{ 
        opacity: isVisible ? 1 : 0, 
        transform: `translateY(${isVisible ? 0 : 40}px)`,
        transitionDelay: `${delay}ms`
      }}
    >
      <div className="aspect-4/5 bg-gray-50 flex items-center justify-center overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
        <img 
          src={src} 
          alt={title} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000"
        />
      </div>
      <div className="space-y-1">
        <span className="text-[10px] uppercase tracking-[0.2em] text-black/40 mb-3 font-expanded-medium">{category}</span>
        <h3 className="text-lg md:text-xl font-expanded-bold uppercase tracking-tight">{title}</h3>
        <p className="text-xs md:text-sm text-black/60 font-roc mt-2">{desc}</p>
      </div>
    </div>
  );
};

export const ServicesLayer: React.FC<ServicesLayerProps> = ({ activeFrame }) => {
  // Trigger range: 205 to 235
  const visibility = useMemo(() => {
    if (activeFrame < 205) return 0;
    if (activeFrame > 240) return 0;
    
    // Smooth reveal between 205 and 215
    if (activeFrame >= 205 && activeFrame <= 215) {
      return (activeFrame - 205) / 10;
    }
    
    // Hold until fade out
    if (activeFrame > 215 && activeFrame <= 235) {
      return 1;
    }

    if (activeFrame > 235 && activeFrame <= 240) {
      return 1 - (activeFrame - 235) / 5;
    }
    
    return 0;
  }, [activeFrame]);

  if (visibility <= 0) return null;

  return (
    <div 
      className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none p-8 md:p-24"
      style={{ opacity: visibility }}
    >
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 pointer-events-auto">
        <PortfolioCard 
          src="/images/luxe_commerce.png" 
          category="01 / E-commerce" 
          title="Luxe Commerce" 
          desc="Defining luxury for the global digital storefront."
          isVisible={visibility > 0.3}
          delay={0}
        />
        <PortfolioCard 
          src="/images/aether_labs.png" 
          category="02 / SaaS Platform" 
          title="Aether Labs" 
          desc="Next-Gen software infrastructure for enterprise scaling."
          isVisible={visibility > 0.5}
          delay={200}
        />
        <PortfolioCard 
          src="/images/city_pulse.png" 
          category="03 / Transformation" 
          title="City Pulse" 
          desc="Bringing traditional leaders to the digital forefront." 
          isVisible={visibility > 0.7}
          delay={400}
        />
      </div>
    </div>
  );
};
