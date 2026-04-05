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

  const [loadedFrames, setLoadedFrames] = useState(0);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Preload Images
  useEffect(() => {
    let loadedCount = 0;
    const imgArray: HTMLImageElement[] = [];

    // We want to load them in order, or at least keep track of them
    const promises = Array.from({ length: TOTAL_FRAMES }).map((_, i) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        // Construct filename: frame-000.webp to frame-239.webp
        const num = i.toString().padStart(3, "0");
        img.src = `/frames/frame-${num}.webp`;

        img.onload = () => {
          loadedCount++;
          setLoadedFrames(loadedCount);
          resolve(img);
        };
        img.onerror = () => {
          console.error(`Failed to load frame ${num}`);
          // Resolve anyway to prevent full block, fallback to undefined handled in render loop
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
    if (!img.width) return; // In case of error loading

    const canvasRatio = canvas.width / canvas.height;
    const imageRatio = img.width / img.height;

    let renderWidth = canvas.width;
    let renderHeight = canvas.height;
    let offsetX = 0;
    let offsetY = 0;

    // object-fit: cover mathematics
    if (canvasRatio > imageRatio) {
      // Canvas is wider than image
      renderHeight = canvas.width / imageRatio;
      offsetY = (canvas.height - renderHeight) / 2;
    } else {
      // Canvas is taller than image
      renderWidth = canvas.height * imageRatio;
      offsetX = (canvas.width - renderWidth) / 2;
    }

    // Apply zoom
    const zoomWidth = renderWidth * ZOOM_FACTOR;
    const zoomHeight = renderHeight * ZOOM_FACTOR;
    const zoomOffsetX = offsetX - (zoomWidth - renderWidth) / 2;
    const zoomOffsetY = offsetY - (zoomHeight - renderHeight) / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, zoomOffsetX, zoomOffsetY, zoomWidth, zoomHeight);
  };

  // 3. Scroll Logic
  useEffect(() => {
    if (!isLoaded || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;

    // Setup canvas resolution to match window size for sharpness
    const resizeCanvas = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      // Re-draw current frame after resize
      const scrollY = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const scrollFraction = Math.max(0, Math.min(1, maxScroll > 0 ? scrollY / maxScroll : 0));
      const frameIndex = Math.min(ANIMATION_FRAMES - 1, Math.floor(scrollFraction * ANIMATION_FRAMES));
      drawFrame(frameIndex);
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas(); // initial setup

    let animationFrameId: number;
    let currentFrameIndex = 0;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;

      let scrollFraction = 0;
      if (maxScroll > 0) {
        scrollFraction = scrollY / maxScroll;
      }
      scrollFraction = Math.max(0, Math.min(1, scrollFraction));

      const frameIndex = Math.min(ANIMATION_FRAMES - 1, Math.floor(scrollFraction * ANIMATION_FRAMES));

      if (frameIndex !== currentFrameIndex) {
        currentFrameIndex = frameIndex;
        // optimization: handle draw in next animation frame
        cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(() => drawFrame(frameIndex));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Initial draw
    handleScroll();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, [images, isLoaded]); // Re-run when fully loaded

  // 4. GSAP Mouse Parallax
  useEffect(() => {
    if (!isLoaded || !canvasRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const xPos = (clientX / window.innerWidth) - 0.5;
      const yPos = (clientY / window.innerHeight) - 0.5;

      // Move canvas in opposite direction by a max of 30px
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
    <div ref={containerRef} className="w-full h-full relative selection:bg-none">
      {!isLoaded && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black">
          <div className="text-white text-8xl font-light tracking-tighter tabular-nums mb-4">
            {Math.floor((loadedFrames / TOTAL_FRAMES) * 100)}%
          </div>
          <div className="text-zinc-500 text-sm tracking-widest uppercase">Loading Experience</div>
        </div>
      )}

      {/* 
        We use position fixed, inset 0 so it stays put while the body scrolls. 
        scale 1.05 prevents edges from showing during parallax shifts.
      */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full object-cover scale-[1.05] pointer-events-none"
        style={{ opacity: isLoaded ? 1 : 0, transition: "opacity 1s ease" }}
      />

      {/* Cinematic Vignette Overlay to hide edge quality issues */}
      <div
        className="fixed inset-0 pointer-events-none z-10"
        style={{
          background: "radial-gradient(circle, transparent 40%, rgba(0,0,0,0.8) 100%)",
          opacity: isLoaded ? 1 : 0,
          transition: "opacity 1.5s ease"
        }}
      />
    </div>
  );
}
