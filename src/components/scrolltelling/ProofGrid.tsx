"use client";

import { useRef } from "react";
import gsap from "gsap";

interface ScrollSectionProps {
  frameIndex: number;
  scrollFraction: number;
}

export default function ProofGrid({ frameIndex, scrollFraction }: ScrollSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Animation logic: Reveal after frame 190 (Spaceship settles)
  let opacity = 0;
  let y = 50;

  if (frameIndex >= 190) {
    const p = Math.min(1, (frameIndex - 190) / 25);
    opacity = p;
    y = 50 - (50 * p);
  }

  return (
    <div 
      ref={containerRef}
      className="w-full py-24 px-8 md:px-24 bg-white text-black"
      style={{ 
        opacity, 
        transform: `translateY(${y}px)`,
        pointerEvents: opacity > 0.8 ? "auto" : "none"
      }}
    >
      <div className="max-w-6xl mx-auto">
        <h2 
          className="text-xs font-bold uppercase tracking-[0.3em] text-black/30 mb-12 font-sans"
        >
          Impact that speaks for itself
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
          {/* Aether Labs */}
          <div className="space-y-6">
            <p className="text-2xl md:text-3xl font-light leading-relaxed font-sans italic border-l-2 border-black/10 pl-8">
              "Nuturn didn't just build our SaaS; they built our growth engine. User retention increased by 200% in 3 months."
            </p>
            <div className="pl-8">
              <h4 className="font-bold uppercase tracking-tight text-sm" style={{ fontFamily: 'var(--font-roc)' }}>Aether Labs</h4>
              <span className="text-xs text-black/40 uppercase tracking-widest font-sans">SaaS Engineering Partner</span>
            </div>
          </div>

          {/* City Pulse */}
          <div className="space-y-6">
            <p className="text-2xl md:text-3xl font-light leading-relaxed font-sans italic border-l-2 border-black/10 pl-8">
              "Taking our local legacy online felt impossible until Nuturn. We're now shipping nationwide with a premium digital presence."
            </p>
            <div className="pl-8">
              <h4 className="font-bold uppercase tracking-tight text-sm" style={{ fontFamily: 'var(--font-roc)' }}>City Pulse</h4>
              <span className="text-xs text-black/40 uppercase tracking-widest font-sans">Business Transformation Client</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
