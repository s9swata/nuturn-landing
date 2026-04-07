'use client';

import { motion } from "framer-motion";

export default function HeroVideo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
      className="px-10 md:px-16 lg:px-24 pb-24 w-full grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center "
    >
      <div className="relative rounded-[1.5rem] md:rounded-[2rem] overflow-hidden aspect-1472/1056 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-black/5 group order-2 md:order-1">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.02] z-20"
        >
          <source src="/videos/flower-ascii-art.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/5 rounded-[1.5rem] md:rounded-[2rem]" />
        <div className="absolute top-4 right-4 md:top-6 md:right-6 px-3 py-1 rounded-full bg-black/10 backdrop-blur-md text-[8px] md:text-[10px] font-expanded-medium uppercase tracking-widest text-white/40 pointer-events-none">
          Live Artifact 001
        </div>
      </div>

      <div className="order-1 md:order-2">
        <p className="text-xl md:text-2xl lg:text-3xl font-roc leading-tight text-zinc-900">
          We design, build, and engineer high-performance digital experiences that look sharp and work flawlessly. From launch campaigns to full-scale platforms, everything we create is custom-built to capture attention and drive real results.
        </p>
      </div>
    </motion.div>
  );
}
