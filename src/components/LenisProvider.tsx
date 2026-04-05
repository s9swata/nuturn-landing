"use client";

import { ReactLenis } from 'lenis/react';
import { ReactNode } from 'react';

/**
 * Global Lenis smooth scroll provider.
 * Configured with a cinematic lerp (0.1) and slightly longer duration for a weighted feel.
 */
export default function LenisProvider({ children }: { children: ReactNode }) {
  return (
    <ReactLenis 
      root 
      options={{ 
        lerp: 0.1, 
        duration: 1.2, 
        syncTouch: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
      }}
    >
      {children}
    </ReactLenis>
  );
}
