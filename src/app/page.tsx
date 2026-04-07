"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useLenis } from "lenis/react";
import ScrolltellingCanvas from "@/components/ScrolltellingCanvas";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { Squiggle } from "@/components/Squiggle";

export default function Home() {
  const [introDone, setIntroDone] = useState(false);
  const squiggleRef = useRef<SVGSVGElement>(null);

  // Reset scroll to top when intro finishes
  const lenis = useLenis(
    useCallback(
      (lenis: { scroll: number; }) => {
        if (!introDone) return;
        const svg = squiggleRef.current;
        if (!svg) return;
        const path = svg.querySelector("path") as SVGPathElement | null;
        if (!path) return;

        // Same math as scroll-path.ts, but using Lenis scroll position
        const pathLength = path.getTotalLength();
        const totalDistance = svg.clientHeight - window.innerHeight;
        const percentage = lenis.scroll / totalDistance;

        path.style.strokeDasharray = `${pathLength}`;
        path.style.strokeDashoffset = `${pathLength * (1 - percentage)}`;
      },
      [introDone]
    )
  );

  // Reset scroll to top when intro finishes
  useEffect(() => {
    if (introDone) {
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo(0, 0);
      }
    }
  }, [introDone, lenis]);

  // Initialize squiggle path to fully hidden on mount (before first scroll event)
  useEffect(() => {
    if (!introDone) return;
    const raf = requestAnimationFrame(() => {
      const svg = squiggleRef.current;
      if (!svg) return;
      const path = svg.querySelector("path") as SVGPathElement | null;
      if (!path) return;
      const pathLength = path.getTotalLength();
      // At scroll=0, offset = pathLength → entire dash is pushed off, path invisible
      path.style.strokeDasharray = `${pathLength}`;
      path.style.strokeDashoffset = `${pathLength}`;
    });
    return () => cancelAnimationFrame(raf);
  }, [introDone]);

  return (
    <>
      {/* ─── CINEMATIC INTRO ─── */}
      {/* Unmounts entirely after completion, freeing GPU/memory resources. */}
      {!introDone && (
        <div className="h-[500vh] w-full bg-black relative overflow-hidden">
          <ScrolltellingCanvas onComplete={() => setIntroDone(true)} />
        </div>
      )}

      {/* ─── YOUR NORMAL WEBSITE ─── */}
      {/* Mounts after the intro completes. Build freely below. */}
      {introDone && (
        <>
          <main className="bg-white text-black min-h-screen relative overflow-hidden">
            {/* RECREATED NAVBAR COMPONENT */}
            <Navbar />

            {/* New Hero Section */}
            <Hero />
          </main>
          <Squiggle ref={squiggleRef} />
        </>
      )}
    </>
  );
}

