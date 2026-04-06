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
  const whitePortalRef = useRef<HTMLDivElement>(null);
  const debugRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

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

      // Log current frame for manual tracking
      if (debugRef.current) {
        debugRef.current.innerText = `Frame: ${frameIndex} / ${ANIMATION_FRAMES}`;
      }
      console.log(`Current Frame: ${frameIndex}`);

      if (frameIndex !== currentFrameIndex) {
        currentFrameIndex = frameIndex;
        cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(() => drawFrame(frameIndex));
      }

      // 3.2 Dynamic Zoom-In for Text Overlays
      const uniformScale = 1 + scrollFraction * 5;
      const sideScale = 1 + scrollFraction * 2;

      // Side text life-cycle: Fade out between Frame 90 and 104
      let sideOpacity = 1;
      if (frameIndex >= 128) {
        sideOpacity = 0; // Completely hidden as background rises
      } else if (frameIndex >= 104) {
        sideOpacity = 0;
      } else if (frameIndex >= 90) {
        sideOpacity = 1 - (frameIndex - 90) / 14; // 14 frames fade duration
      }

      const lateralMove = scrollFraction * 40; // 40vw lateral shift

      if (leftTextRef.current) {
        gsap.set(leftTextRef.current, {
          scale: sideScale,
          x: -lateralMove + 'vw',
          opacity: sideOpacity,
          transformOrigin: "center center"
        });
      }
      if (rightTextRef.current) {
        gsap.set(rightTextRef.current, {
          scale: sideScale,
          x: lateralMove + 'vw',
          opacity: sideOpacity,
          transformOrigin: "center center"
        });
      }

      // Center Branding Logic ("Nuturn Studio")
      // Steady until frame 104, then glides to top-center (navbar level) by frame 157
      let centerY = 0;
      let centerScale = 1;

      // Blended White Portal Expansion (Starts at frame 95, finishes by 170)
      let portalRadius = 0;
      let portalOpacity = 0;
      let brandColor = "rgba(255, 255, 255, 0.9)"; // text-white/90

      if (frameIndex >= 95) {
        const linearP = Math.min(1, (frameIndex - 95) / (114 - 95));
        const logP = Math.log(1 + 9 * linearP) / Math.log(10); // Logarithmic curve
        
        // 1. Reduced Easing (30% blend with linear)
        const blendedP = (linearP * 0.3) + (logP * 0.7);
        
        // 2. Bouncy Overshoot (GSAP back easing)
        const bounceP = gsap.parseEase("back.out(1.7)")(blendedP);
        portalRadius = bounceP * 150; 
        
        // 3. Opacity Transition
        portalOpacity = linearP; // Fully solid by frame 114

        // 4. Color Transition Logic (White to Black)
        const colorVal = Math.floor(255 * (1 - linearP));
        brandColor = `rgba(${colorVal}, ${colorVal}, ${colorVal}, 1)`;
        
        // Update all links in the header to match brandColor
        if (headerRef.current) {
          const links = headerRef.current.querySelectorAll("a");
          links.forEach(link => {
            (link as HTMLElement).style.color = brandColor;
          });
        }
      } else {
        // Reset navbar links to white when before the portal transition
        if (headerRef.current) {
          const links = headerRef.current.querySelectorAll("a");
          links.forEach(link => {
            (link as HTMLElement).style.color = ""; // Revert to CSS default (white/inherit)
          });
        }
      }

      if (whitePortalRef.current) {
        gsap.set(whitePortalRef.current, {
          clipPath: `circle(${portalRadius}% at 50% 50%)`,
          opacity: portalOpacity,
        });
      }

      // Center Branding Glide Logic
      if (frameIndex > 104) {
        const glideLinearP = Math.min(1, (frameIndex - 104) / (157 - 104));
        const easedProgress = 1 - Math.pow(1 - glideLinearP, 2); // Quad Out easing
        centerY = -42.5 * easedProgress;
        centerScale = 1 - (easedProgress * 0.3);
      }

      if (centerTextRef.current) {
        gsap.set(centerTextRef.current, {
          y: centerY + 'vh',
          scale: centerScale,
          opacity: 1,
          color: brandColor,
          transformOrigin: "center center"
        });
      }

      // Footer Visibility Cleanup
      let footerOpacity = Math.max(0, 1 - (scrollFraction * 2.5));
      if (frameIndex >= 95) {
        const transitionP = Math.min(1, (frameIndex - 95) / 20); // Quick fade out as portal starts
        footerOpacity *= (1 - transitionP);
      }

      if (bottomRef.current) {
        gsap.set(bottomRef.current, {
          scale: uniformScale,
          opacity: footerOpacity,
          transformOrigin: "center center"
        });
      }
    }

    const resizeCanvas = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      currentFrameIndex = -1; // Force redraw on resize
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
        x: xPos * -60,
        y: yPos * -60,
        rotationY: xPos * 10,
        rotationX: yPos * -10,
        transformPerspective: 1200,
        duration: 0.8,
        ease: "power2.out",
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isLoaded]);

  return (
    <div ref={containerRef} className="w-full h-full relative selection:bg-none font-special">
      {/* FRAME DEBUGGER (FIXED TOP-RIGHT) */}
      <div
        ref={debugRef}
        className="fixed top-4 right-4 z-999 bg-black/80 text-white font-mono text-[10px] px-2 py-1 rounded border border-white/20 pointer-events-none"
      >
        Frame: 0 / {ANIMATION_FRAMES}
      </div>

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
        className="fixed inset-0 w-full h-full object-cover scale-[1.1] pointer-events-none"
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



      {/* Snapping White Portal Background (Circular Expansion) */}
      <div
        ref={whitePortalRef}
        className="fixed inset-0 bg-white"
        style={{ zIndex: 17, clipPath: "circle(0% at 50% 50%)" }}
      />

      {/* Text Overlays - Only visible when loaded */}
      {isLoaded && (
        <div className="fixed inset-0 z-20 pointer-events-none flex flex-col justify-between p-8 md:p-12 text-white">

          {/* TOP NAV */}
          <header ref={headerRef} className="flex justify-between items-start text-sm tracking-wider font-expanded pointer-events-auto">
            <nav className="flex gap-8">
              <a href="#" className="hover:text-gray-300 transition-colors">About</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Our Work</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Services</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Contact</a>
            </nav>
            <div className="hidden sm:flex gap-8 text-right">
              <a href="mailto:hello@nuturnstudio.com" className="hover:text-gray-300 transition-colors">hello@nuturnstudio.com</a>
            </div>
          </header>

          {/* LARGE SIDE TEXT OVERLAYS */}
          {/* Left side text - Slightly higher */}
          <div className="absolute left-8 md:left-12 top-[38%] -translate-y-1/2 z-20 pointer-events-none">
            <h1
              ref={leftTextRef}
              className="text-[5vw] leading-[0.8] tracking-tight drop-shadow-2xl font-expanded font-bold"
            >
              Creative <br /> Solutions
            </h1>
          </div>

          {/* Right side text - Slightly lower */}
          <div className="absolute right-8 md:right-12 top-[62%] -translate-y-1/2 z-20 pointer-events-none">
            <h1
              ref={rightTextRef}
              className="text-[5vw] leading-[0.8] tracking-tight text-right drop-shadow-2xl font-expanded font-bold"
            >
              For SaaS & <br /> Local Biz
            </h1>
          </div>

          {/* ABSOLUTE CENTER TEXT (Inside the window visually) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
            <h2
              ref={centerTextRef}
              className="text-lg md:text-xl tracking-[0.6em] text-white/90 drop-shadow-xl whitespace-nowrap font-roc font-light"
            >
              Nuturn Studio
            </h2>
          </div>

          {/* BOTTOM BAR */}
          <footer ref={bottomRef} className="flex justify-between items-end relative pointer-events-auto">

            {/* Bottom Left */}
            <div className="max-w-sm">
              <h3 className="text-xl md:text-2xl mb-4 leading-tight">
                Your vision,<br />brought to life
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
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
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
