"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.2,
      lerp: 0.1,
    });

    return () => {
      lenis.destroy();
    };
  }, []);

  return null;
}
