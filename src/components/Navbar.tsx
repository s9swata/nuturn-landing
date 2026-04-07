"use client";

import React from "react";

/**
 * Recreated Cinematic Navbar for the main application.
 * Highlights:
 * - font-expanded for navigation links.
 * - centered font-roc 'Nuturn Studio' logo.
 * - fixed positioning with high z-index.
 */
export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 w-full p-8 md:p-12 z-50 flex justify-between items-start pointer-events-auto mix-blend-difference invert sm:mix-blend-normal sm:invert-0">
      {/* Nav Links */}
      <nav className="flex gap-8 text-sm tracking-wider font-expanded-medium text-black font-medium">
        <a href="#" className="hover:text-black/50 transition-colors">About</a>
        <a href="#" className="hover:text-black/50 transition-colors">Our Work</a>
        <a href="#" className="hover:text-black/50 transition-colors">Services</a>
        <a href="#" className="hover:text-black/50 transition-colors">Contact</a>
      </nav>

      {/* Email Link */}
      <div className="hidden sm:block text-sm tracking-wider font-expanded-medium text-black font-medium">
        <a href="mailto:hello@nuturnstudio.com" className="hover:text-black/50 transition-colors">
          hello@nuturnstudio.com
        </a>
      </div>

      {/* Logo (Centered top) */}
      <div className="absolute top-8 md:top-12 left-1/2 -translate-x-1/2 text-black">
        <h2 className="text-lg md:text-xl tracking-[0.6em] whitespace-nowrap font-roc">
          Nuturn Studio
        </h2>
      </div>

    </header>
  );
}
