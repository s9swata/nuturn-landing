"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, CheckCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="py-32 relative overflow-hidden bg-background border-t border-border/40">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="relative rounded-3xl overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            {/* Background Layer */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-card to-secondary/10 border border-primary/20 bg-opacity-90" />

            {/* Inner Content */}
            <div className="relative p-8 md:p-16 text-center backdrop-blur-md border border-white/5 rounded-3xl shadow-2xl shadow-primary/10 flex flex-col items-center">
              <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6 text-balance text-foreground">
                Ready to Build Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-400">
                  Revenue Machine?
                </span>
              </h2>

              <p className="text-xl text-muted-foreground mb-10 max-w-2xl text-balance">
                Transform your stagnant growth and buggy code into a scalable,
                automated digital product that users love.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-10 w-full max-w-lg mx-auto text-left">
                <div className="flex items-center gap-3 bg-background/50 p-4 rounded-xl border border-border/50">
                  <CheckCircle
                    weight="fill"
                    className="text-primary w-6 h-6 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span className="font-medium text-foreground/90">
                    100% Transparent Pricing
                  </span>
                </div>
                <div className="flex items-center gap-3 bg-background/50 p-4 rounded-xl border border-border/50">
                  <ShieldCheck
                    weight="fill"
                    className="text-emerald-500 w-6 h-6 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span className="font-medium text-foreground/90">
                    Guaranteed Timelines
                  </span>
                </div>
              </div>

              <Button
                size="lg"
                className="h-16 px-10 text-lg group bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 rounded-full w-full sm:w-auto transition-all hover:scale-105"
              >
                <a href="https://cal.com/saswata-biswas-dfnuvi/client-call" className="flex items-center">
                  Book Your Free Demo
                  <ArrowRight
                    className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform"
                    aria-hidden="true"
                  />
                </a>
              </Button>

              <p className="mt-6 text-sm text-muted-foreground">
                We respond within 24 hours. No long sales process, just a
                conversation about your goals.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[150px] rounded-full -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:linear-gradient(to_top,#000_10%,transparent_100%)] -z-10" />
    </section>
  );
}
