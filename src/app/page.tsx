"use client";

import { useState } from "react";
import ScrolltellingCanvas from "@/components/ScrolltellingCanvas";

export default function Home() {
  const [introDone, setIntroDone] = useState(false);

  return (
    <>
      {/* ─── CINEMATIC INTRO ─── */}
      {/* Unmounts entirely at Frame 185, freeing all GPU/memory resources. */}
      {!introDone && (
        <div className="h-[500vh] w-full bg-black relative">
          <ScrolltellingCanvas onComplete={() => setIntroDone(true)} />
        </div>
      )}

      {/* ─── YOUR NORMAL WEBSITE ─── */}
      {/* Mounts after the intro completes. Build freely below. */}
      {introDone && (
        <main className="bg-white text-black min-h-screen">
          {/* ════════════════════════════════════════════════
              ADD YOUR SECTIONS HERE
              Examples:
                <HeroSection />
                <ServicesSection />
                <PortfolioSection />
                <ContactSection />
              ════════════════════════════════════════════════ */}

          {/* Placeholder — remove once you add your sections */}
          <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-8">
            <p className="text-xs uppercase tracking-[0.5em] text-black/30 font-sans">
              Nuturn Studio
            </p>
            <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none">
              Your Canvas,
              <br />
              <span className="text-black/20">Your Rules.</span>
            </h1>
            <p className="text-sm text-black/50 font-sans max-w-md mt-4">
              The cinematic intro has completed. Build your agency sections here in <code>src/app/page.tsx</code>.
            </p>
          </div>
        </main>
      )}
    </>
  );
}
