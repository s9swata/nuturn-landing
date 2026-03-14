"use client";

import { motion } from "framer-motion";
import {
  MapTrifold,
  CodeBlock,
  RocketLaunch,
  ChartLineUp,
} from "@phosphor-icons/react";

const steps = [
  {
    icon: MapTrifold,
    phase: "Phase 01",
    verb: "Deep Dive & Strategy",
    outcome:
      "We map your funnel, understand your users, and align on the architecture that serves your business.",
    color: "text-primary",
    bgColor: "bg-primary/20",
    borderColor: "border-primary/50",
  },
  {
    icon: CodeBlock,
    phase: "Phase 02",
    verb: "Tailored Plan",
    outcome:
      "We show you the roadmap before we write code. You see exactly what's building, and you get checkpoints to pivot if needed.",
    color: "text-secondary",
    bgColor: "bg-secondary/20",
    borderColor: "border-secondary/50",
  },
  {
    icon: RocketLaunch,
    phase: "Phase 03",
    verb: "Build & Setup",
    outcome:
      "Full-stack development using modern, scalable tech. We handle hosting, domains, payment setup, and all production details.",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/20",
    borderColor: "border-emerald-500/50",
  },
  {
    icon: ChartLineUp,
    phase: "Phase 04",
    verb: "Launch & Improve",
    outcome:
      "Deploy with confidence. We train your team, monitor early metrics, and optimize for conversions in the first 30 days.",
    color: "text-amber-500",
    bgColor: "bg-amber-500/20",
    borderColor: "border-amber-500/50",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-background">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20 md:mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs uppercase tracking-widest text-primary font-medium mb-3 inline-block">
              Our Process
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-balance">
              Three Steps to{" "}
              <span className="text-primary">Launch</span>.{" "}
              <br className="hidden md:block" />
              Zero Hassle.
            </h2>
            <p className="text-lg text-muted-foreground">
              We&apos;ve refined our process to be entirely frictionless. You
              provide the vision, we provide the execution.
            </p>
          </motion.div>
        </div>

        <div className="max-w-4xl mx-auto relative">
          {/* Glowing Vertical Timeline Line */}
          <div className="absolute left-4 sm:left-8 md:left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2 hidden sm:block">
            <motion.div
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-primary via-secondary to-amber-500 shadow-[0_0_15px_rgba(109,40,217,0.5)]"
              initial={{ height: 0 }}
              whileInView={{ height: "100%" }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </div>

          <div className="space-y-16 md:space-y-24">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={index}
                  className="relative flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-0"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  {/* Step Number Background */}
                  <div className="absolute left-0 md:left-1/2 top-0 md:top-1/2 -translate-y-1/2 -translate-x-1/2 text-[120px] font-black text-muted/5 -z-10 select-none hidden md:block pointer-events-none">
                    0{index + 1}
                  </div>

                  {/* Left Side */}
                  <div
                    className={`w-full md:w-1/2 ${isEven ? "md:pr-16 md:text-right" : "md:order-2 md:pl-16 md:text-left"} flex flex-col pl-10 sm:pl-20 md:pl-0`}
                  >
                    <div
                      className={`hidden md:flex flex-col ${isEven ? "items-end" : "items-start"} mb-4`}
                    >
                      <span className="text-sm font-bold tracking-widest text-muted-foreground uppercase mb-2">
                        {step.phase}
                      </span>
                      <h3 className="text-2xl md:text-3xl font-bold">
                        {step.verb}
                      </h3>
                    </div>

                    {/* Mobile Title */}
                    <div className="md:hidden flex flex-col mb-4">
                      <span className="text-sm font-bold tracking-widest text-muted-foreground uppercase mb-1">
                        {step.phase}
                      </span>
                      <h3 className="text-2xl font-bold">{step.verb}</h3>
                    </div>

                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {step.outcome}
                    </p>
                  </div>

                  {/* Center Icon Node */}
                  <div
                    className={`absolute left-0 sm:left-4 md:left-1/2 top-0 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border ${step.borderColor} ${step.bgColor} backdrop-blur-md flex items-center justify-center z-10 shadow-lg`}
                  >
                    <step.icon
                      weight="duotone"
                      className={`w-7 h-7 sm:w-8 sm:h-8 ${step.color}`}
                    />
                  </div>

                  {/* Right Side (spacer) */}
                  <div
                    className={`hidden md:block w-1/2 ${isEven ? "md:order-2" : ""}`}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Decorative background glow */}
      <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/10 blur-[150px] rounded-full -z-10 pointer-events-none" />
    </section>
  );
}
