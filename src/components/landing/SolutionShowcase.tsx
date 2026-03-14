"use client";

import { motion, Variants } from "framer-motion";
import {
  RocketLaunch,
  ChartLineUp,
  Storefront,
  Code,
  ShoppingBag,
} from "@phosphor-icons/react";

const features = [
  {
    icon: RocketLaunch,
    title: "Ship Fast",
    description:
      "From strategy to live product in weeks, not months. We eliminate waiting and excuses.",
    iconColor: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: ChartLineUp,
    title: "Convert Better",
    description:
      "Every pixel is designed to turn visitors into buyers and trials into paying customers.",
    iconColor: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    icon: Storefront,
    title: "Sell Smoothly",
    description:
      "From SaaS dashboards to ecommerce stores — built clean, managed easily.",
    iconColor: "text-secondary",
    bgColor: "bg-secondary/10",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export function SolutionShowcase() {
  return (
    <section
      id="services"
      className="py-24 md:py-32 relative overflow-hidden"
    >
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs uppercase tracking-widest text-primary font-medium mb-3 inline-block">
              What We Do
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-balance">
              Everything You Need to Launch and Grow
            </h2>
            <p className="text-lg text-muted-foreground">
              Two focused service lines. One studio. Unlimited execution.
            </p>
          </motion.div>
        </div>

        {/* 3 Feature Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="relative group p-8 rounded-3xl bg-card border border-border hover:border-primary/50 transition-colors duration-300 overflow-hidden"
            >
              <div
                className={`absolute inset-0 ${feature.bgColor} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
              />
              <div
                className={`w-14 h-14 rounded-2xl ${feature.bgColor} ${feature.iconColor} flex items-center justify-center mb-6`}
              >
                <feature.icon weight="duotone" className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Two Service Track Callouts */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* SaaS Track */}
          <div className="p-6 md:p-8 rounded-2xl bg-card border border-border hover:border-secondary/50 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Code weight="duotone" className="w-5 h-5 text-secondary" />
              </div>
              <h3 className="text-lg font-bold">For Founders & Builders</h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Custom SaaS products, AI integrations, and high-converting landing
              pages built with Next.js and modern architecture. Ship faster, scale
              confidently.
            </p>
          </div>

          {/* Commerce Track */}
          <div className="p-6 md:p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShoppingBag
                  weight="duotone"
                  className="w-5 h-5 text-primary"
                />
              </div>
              <h3 className="text-lg font-bold">For Local Brands & Stores</h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Done-for-you ecommerce stores with mobile-first design, smooth
              checkout, payment setup, and admin tools you can manage from your
              phone.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Decorative background elements */}
      <div className="absolute right-0 bottom-0 w-1/3 h-1/2 bg-primary/5 blur-[150px] rounded-full -z-10 pointer-events-none" />
    </section>
  );
}
