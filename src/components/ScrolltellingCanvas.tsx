"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

const TOTAL_FRAMES = 240;
const ANIMATION_FRAMES = 180; // Only animate through the first 180 frames for this test
const ZOOM_FACTOR = 1.05; // Slight zoom to hide edges

export default function ScrolltellingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Refs for text animation
  const leftTextRef = useRef<HTMLDivElement>(null);
  const rightTextRef = useRef<HTMLDivElement>(null);
  const centerTextRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [loadedFrames, setLoadedFrames] = useState(0);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Preload Images
  useEffect(() => {
    let loadedCount = 0;
    const imgArray: HTMLImageElement[] = [];

    const promises = Array.from({ length: TOTAL_FRAMES }).map((_, i) => {
      return new Promise<HTMLImageElement>((resolve) => {
        const img = new Image();
        const num = i.toString().padStart(3, "0");
        img.src = `/frames/frame-${num}.webp`;

        img.onload = () => {
          loadedCount++;
          setLoadedFrames(loadedCount);
          resolve(img);
        };
        img.onerror = () => {
          console.error(`Failed to load frame ${num}`);
          resolve(img);
        };
      });
    });

    Promise.all(promises).then((loadedImages) => {
      setImages(loadedImages);
      setIsLoaded(true);
    });
  }, []);

  // 2. Draw Frame & Resize handling
  const drawFrame = (index: number) => {
    if (!canvasRef.current || !images[index]) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = images[index];
    if (!img.width) return;

    const canvasRatio = canvas.width / canvas.height;
    const imageRatio = img.width / img.height;

    let renderWidth = canvas.width;
    let renderHeight = canvas.height;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasRatio > imageRatio) {
      renderHeight = canvas.width / imageRatio;
      offsetY = (canvas.height - renderHeight) / 2;
    } else {
      renderWidth = canvas.height * imageRatio;
      offsetX = (canvas.width - renderWidth) / 2;
    }

    const zoomWidth = renderWidth * ZOOM_FACTOR;
    const zoomHeight = renderHeight * ZOOM_FACTOR;
    const zoomOffsetX = offsetX - (zoomWidth - renderWidth) / 2;
    const zoomOffsetY = offsetY - (zoomHeight - renderHeight) / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, zoomOffsetX, zoomOffsetY, zoomWidth, zoomHeight);
  };

  // 3. Scroll Logic & Text Animation
  useEffect(() => {
    if (!isLoaded || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;

    let animationFrameId: number;
    let currentFrameIndex = -1;

    function handleScroll() {
      const scrollY = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight || 1;

      let scrollFraction = Math.max(0, Math.min(1, scrollY / maxScroll));

      // 3.1 Draw frame
      const frameIndex = Math.min(ANIMATION_FRAMES - 1, Math.floor(scrollFraction * ANIMATION_FRAMES));
      if (frameIndex !== currentFrameIndex) {
        currentFrameIndex = frameIndex;
        cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(() => drawFrame(frameIndex));
      }

      // 3.2 Animate text overlays using GSAP QuickSetter or direct styling
      // At scrollFraction = 0.5, we should be significantly separated
      const moveOutPower = scrollFraction * 200; // moves elements outwards by up to 200vw
      const fadeOutPower = 1 - (scrollFraction * 2); // fades out by halfway down

      if (leftTextRef.current) {
        gsap.set(leftTextRef.current, { 
          x: -moveOutPower + 'vw',
          opacity: fadeOutPower
        });
      }
      if (rightTextRef.current) {
        gsap.set(rightTextRef.current, { 
          x: moveOutPower + 'vw',
          opacity: fadeOutPower
        });
      }
      if (bottomRef.current) {
        gsap.set(bottomRef.current, {
          y: moveOutPower + 'vh',
          opacity: fadeOutPower
        });
      }
      if (centerTextRef.current) {
        // Center text slowly scales up and fades
        gsap.set(centerTextRef.current, {
          scale: 1 + scrollFraction * 3,
          opacity: fadeOutPower
        });
      }
    }

    const resizeCanvas = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      handleScroll();
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Assign handleScroll to global so resize can call it
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, [images, isLoaded]);

  // 4. GSAP Mouse Parallax
  useEffect(() => {
    if (!isLoaded || !canvasRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const xPos = (clientX / window.innerWidth) - 0.5;
      const yPos = (clientY / window.innerHeight) - 0.5;

      gsap.to(canvasRef.current, {
        x: xPos * -30,
        y: yPos * -30,
        duration: 0.5,
        ease: "power2.out",
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isLoaded]);

  return (
    <div ref={containerRef} className="w-full h-full relative selection:bg-none font-special">
      {!isLoaded && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black">
          <div className="text-white text-8xl font-light tracking-tighter tabular-nums mb-4">
            {Math.floor((loadedFrames / TOTAL_FRAMES) * 100)}%
          </div>
          <div className="text-zinc-500 text-sm tracking-widest uppercase font-sans">Loading Experience</div>
        </div>
      )}

      {/* Background Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full object-cover scale-[1.05] pointer-events-none"
        style={{ opacity: isLoaded ? 1 : 0, transition: "opacity 1s ease" }}
      />

      {/* Cinematic Vignette Overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-10"
        style={{
          background: "radial-gradient(circle, transparent 40%, rgba(0,0,0,0.85) 100%)",
          opacity: isLoaded ? 1 : 0,
          transition: "opacity 1.5s ease"
        }}
      />

      {/* Text Overlays - Only visible when loaded */}
      {isLoaded && (
        <div className="fixed inset-0 z-20 pointer-events-none flex flex-col justify-between p-8 md:p-12 text-white">
          
          {/* TOP NAV */}
          <header className="flex justify-between items-start text-sm tracking-wider uppercase font-sans font-medium pointer-events-auto">
            <nav className="flex gap-8">
              <a href="#" className="hover:text-gray-300 transition-colors">About</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Our Work</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Services</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Contact</a>
            </nav>
            <div className="hidden sm:flex gap-8 text-right">
              <span>+1 234 567 8900</span>
              <a href="mailto:hello@nuturnstudio.com" className="hover:text-gray-300 transition-colors">hello@nuturnstudio.com</a>
            </div>
          </header>

          {/* LARGE CENTER TEXT OVERLAY */}
          <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 flex justify-between items-center z-20 pointer-events-none">
            {/* Left side text */}
            <h1 
              ref={leftTextRef} 
              className="text-[10vw] leading-[0.9] tracking-tighter drop-shadow-2xl"
            >
              Creative <br/> Solutions
            </h1>
            
            {/* Right side text */}
            <h1 
              ref={rightTextRef} 
              className="text-[10vw] leading-[0.9] tracking-tighter text-right drop-shadow-2xl"
            >
              For SaaS & <br/> Local Biz
            </h1>
          </div>

          {/* ABSOLUTE CENTER TEXT (Inside the window visually) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
            <h2 
              ref={centerTextRef}
              className="text-4xl md:text-5xl tracking-widest text-white/90 drop-shadow-xl whitespace-nowrap"
            >
              Nuturn Studio
            </h2>
          </div>

          {/* BOTTOM BAR */}
          <footer ref={bottomRef} className="flex justify-between items-end relative pointer-events-auto">
            
            {/* Bottom Left */}
            <div className="max-w-sm">
              <h3 className="text-xl md:text-2xl mb-4 leading-tight">
                Your vision,<br/>brought to life
              </h3>
              <div className="w-12 h-px bg-white mb-4"></div>
              <p className="text-sm text-gray-200 font-sans leading-relaxed">
                Every project is designed around your goals, brand, and audience — so you can focus on scaling your business, while we take care of the creative execution.
              </p>
            </div>

            {/* Bottom Center Button */}
            <div className="absolute left-1/2 bottom-0 -translate-x-1/2">
              <button className="bg-white text-black px-8 py-3 rounded-full uppercase tracking-wider font-sans text-sm font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2">
                Start a Project
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </button>
            </div>

            {/* Bottom Right */}
            <div className="text-right text-xs tracking-[0.2em] font-sans">
              <div className="w-full h-px bg-white/30 mb-4 inline-block max-w-[200px]"></div>
              <div className="flex justify-end gap-16 uppercase">
                <span className="flex items-center gap-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  Scroll Down
                </span>
                <span>To See Our Work</span>
              </div>
            </div>

          </footer>

        </div>
      )}
    </div>
  );
}
