"use client";

import ScrolltellingCanvas from "@/components/ScrolltellingCanvas";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

export default function Home() {
  const scrollToTop = () => {
    gsap.to(window, {
      scrollTo: 0,
      duration: 1.5,
      ease: "power3.inOut",
    });
  };

  return (
    <main className="bg-black text-white relative">
      {/* 
        Container with massive height to allow scrolling.
        500vh = 5 screens tall.
      */}
      <div className="h-[500vh] w-full">
        <ScrolltellingCanvas />
      </div>

      {/* Optional: Add a call to action or a fixed overlay here if needed */}
      
      {/* Scroll to top floating button */}
      <button 
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 z-50 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full w-12 h-12 flex items-center justify-center transition-all duration-300 border border-white/10"
        aria-label="Scroll to top"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m18 15-6-6-6 6"/>
        </svg>
      </button>
    </main>
  );
}
