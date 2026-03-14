"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden lg:pt-48 lg:pb-32">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary border border-primary/20 mb-6">
              <Sparkle weight="fill" className="w-4 h-4" />
              SaaS Products & Ecommerce Stores
            </span>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl md:text-7xl lg:text-[84px] font-black tracking-[-0.02em] mb-6 text-balance leading-[1.05]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Stop Waiting. Start{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-400">
              Shipping
            </span>{" "}
            What Sells.
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl text-balance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            We build fast, beautiful digital experiences for founders and local
            business owners — from SaaS products to online stores.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 w-full justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button
              size="lg"
              className="h-14 px-8 text-base group bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <a href="https://cal.com/saswata-biswas-dfnuvi/client-call" className="flex items-center">
                Book a Free Call
                <ArrowRight
                  className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform"
                  aria-hidden="true"
                />
              </a>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute top-1/4 right-0 w-1/3 h-1/3 bg-primary/8 blur-[100px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>
    </section>
  );
}
