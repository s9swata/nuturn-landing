"use client";

import { motion, Variants } from "framer-motion";
import {
  Lightning,
  ChartLineUp,
  ShoppingCart,
  DeviceMobile,
} from "@phosphor-icons/react";

const benefits = [
  {
    number: "01",
    icon: Lightning,
    title: "Launch Faster",
    description:
      "We've refined our process to eliminate wasted time. Most projects go live in 2–4 weeks — not months.",
    iconColor: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    number: "02",
    icon: ChartLineUp,
    title: "Convert Better",
    description:
      "Design decisions backed by conversion principles. Every CTA, headline, and layout element earns its place.",
    iconColor: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    number: "03",
    icon: ShoppingCart,
    title: "Sell Smoothly",
    description:
      "Mobile-first checkouts, trust signals, and seamless payment flows that turn browsers into buyers.",
    iconColor: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    number: "04",
    icon: DeviceMobile,
    title: "Manage Easily",
    description:
      "Simple admin panels, clear order dashboards, and training so you're never dependent on a developer again.",
    iconColor: "text-secondary",
    bgColor: "bg-secondary/10",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function Benefits() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs uppercase tracking-widest text-primary font-medium mb-3 inline-block">
              Why Nuturn
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-balance">
              Built to Move the Needle
            </h2>
            <p className="text-lg text-muted-foreground">
              We don&apos;t just build things. We build things that work,
              convert, and scale.
            </p>
          </motion.div>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {benefits.map((benefit) => (
            <motion.div
              key={benefit.number}
              variants={cardVariants}
              className="relative group bg-card border border-border/50 rounded-2xl p-6 md:p-8 hover:border-primary/30 transition-colors duration-300 overflow-hidden"
            >
              {/* Number badge */}
              <span className="absolute top-6 right-6 text-5xl font-black text-muted/10 select-none pointer-events-none">
                {benefit.number}
              </span>

              <div
                className={`w-12 h-12 rounded-xl ${benefit.bgColor} flex items-center justify-center mb-6`}
              >
                <benefit.icon
                  weight="duotone"
                  className={`w-6 h-6 ${benefit.iconColor}`}
                />
              </div>

              <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-primary/5 blur-[150px] rounded-full -z-10 pointer-events-none" />
    </section>
  );
}
