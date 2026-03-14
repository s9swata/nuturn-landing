"use client";

import { motion, Variants } from "framer-motion";
import {
  RocketLaunch,
  ChartLineUp,
  Storefront,
  Sparkle,
  Check,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

const tiers = [
  {
    name: "SaaS Launch",
    audience: "Founders ready to validate and launch",
    icon: RocketLaunch,
    bullets: [
      "High-converting landing page",
      "Mobile-responsive design",
      "Contact + lead capture form",
      "2 revision rounds",
    ],
    cta: "Get Started",
    ctaVariant: "outline" as const,
    highlighted: false,
    iconColor: "text-secondary",
    iconBg: "bg-secondary/10",
  },
  {
    name: "SaaS Growth",
    audience: "Scaling SaaS with proven product-market fit",
    icon: ChartLineUp,
    bullets: [
      "Full SaaS product + landing page",
      "AI feature integration",
      "Production-ready codebase",
      "30 days of post-launch support",
    ],
    cta: "Book Discovery Call",
    ctaVariant: "default" as const,
    highlighted: true,
    badge: "Most Popular",
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
  },
  {
    name: "Commerce Launch",
    audience: "Local businesses ready to go online",
    icon: Storefront,
    bullets: [
      "Done-for-you ecommerce store",
      "Mobile-optimized checkout",
      "Payment processor setup",
      "Initial admin training",
    ],
    cta: "Start Your Store",
    ctaVariant: "outline" as const,
    highlighted: false,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
  },
  {
    name: "Custom",
    audience: "Unique projects that need a custom fit",
    icon: Sparkle,
    bullets: [
      "Tailored scope and timeline",
      "Full-service strategy included",
      "Unlimited revisions until happy",
      "Post-launch optimization partner",
    ],
    cta: "Let's Talk",
    ctaVariant: "outline" as const,
    highlighted: false,
    iconColor: "text-muted-foreground",
    iconBg: "bg-muted/30",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
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

export function Pricing() {
  return (
    <section
      id="pricing"
      className="py-24 md:py-32 relative border-t border-border/40"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs uppercase tracking-widest text-primary font-medium mb-3 inline-block">
              Investment
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-balance">
              Clear Pricing. No Surprises.
            </h2>
            <p className="text-lg text-muted-foreground">
              Choose the track that fits your stage. Every tier includes our full
              attention and quality guarantee.
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
          {tiers.map((tier) => (
            <motion.div
              key={tier.name}
              variants={cardVariants}
              className={`relative flex flex-col bg-card border rounded-2xl p-6 md:p-8 transition-colors duration-300 ${
                tier.highlighted
                  ? "border-primary/50 bg-primary/5 hover:border-primary/70"
                  : "border-border/50 hover:border-primary/30"
              }`}
            >
              {/* Badge */}
              {tier.highlighted && (
                <span className="absolute -top-3 left-6 inline-flex items-center px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {tier.badge}
                </span>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-10 h-10 rounded-xl ${tier.iconBg} flex items-center justify-center`}
                >
                  <tier.icon
                    weight="duotone"
                    className={`w-5 h-5 ${tier.iconColor}`}
                  />
                </div>
                <h3 className="text-xl font-bold">{tier.name}</h3>
              </div>

              <p className="text-sm text-muted-foreground mb-6">
                {tier.audience}
              </p>

              <ul className="space-y-3 mb-8 flex-1">
                {tier.bullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check
                      weight="bold"
                      className="w-4 h-4 text-primary mt-0.5 shrink-0"
                    />
                    <span className="text-sm text-foreground/90">{bullet}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={tier.ctaVariant}
                size="lg"
                className={`w-full h-12 text-base ${
                  tier.highlighted
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : ""
                }`}
              >
                <a href="https://cal.com/saswata-biswas-dfnuvi/client-call">{tier.cta}</a>
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
