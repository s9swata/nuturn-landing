"use client";

import { useState } from "react";
import ScrolltellingCanvas from "@/components/ScrolltellingCanvas";
import Navbar from "@/components/Navbar";

export default function Home() {
  const [introDone, setIntroDone] = useState(false);

  return (
    <>
      {/* ─── CINEMATIC INTRO ─── */}
      {/* Unmounts entirely at Frame 185, freeing all GPU/memory resources. */}
      {!introDone && (
        <div className="h-[500vh] w-full bg-black relative overflow-hidden">
          <ScrolltellingCanvas onComplete={() => setIntroDone(true)} />
        </div>
      )}

      {/* ─── YOUR NORMAL WEBSITE ─── */}
      {/* Mounts after the intro completes. Build freely below. */}
      {introDone && (
        <main className="bg-white text-black min-h-screen relative overflow-hidden">
          {/* RECREATED NAVBAR COMPONENT */}
          <Navbar />

          {/* New Hero Section */}


          {/* Spacer for scrolling */}
          <section className="h-screen bg-zinc-50" />
        </main>
      )}
    </>
  );
}
