"use client";

import { motion, Variants } from "framer-motion";
import {
  Code,
  Storefront,
  CubeTransparent,
  Browser,
  Robot,
  TShirt,
  FlowerLotus,
  House,
  CookingPot,
  DiamondsFour,
} from "@phosphor-icons/react";
import { GlowingEffect } from "@/components/ui/glowing-effect";

const saasUseCases = [
  {
    icon: CubeTransparent,
    title: "MVPs & Product Launches",
    description:
      "Get your idea into users' hands fast. Clean code, scalable architecture, no compromise.",
  },
  {
    icon: Browser,
    title: "SaaS Landing Pages",
    description:
      "High-converting pages that explain your product and make the CTA impossible to ignore.",
  },
  {
    icon: Robot,
    title: "AI-Integrated Products",
    description:
      "OpenAI, Anthropic, or custom APIs — we build AI features that feel magical, not gimmicky.",
  },
];

const commerceVerticals = [
  {
    icon: TShirt,
    title: "Clothing & Fashion",
    description: "Beautiful lookbooks, size guides, and one-click checkout.",
  },
  {
    icon: FlowerLotus,
    title: "Beauty & Skincare",
    description:
      "Product detail pages that build trust and drive repeat purchases.",
  },
  {
    icon: House,
    title: "Home Decor & Gifts",
    description:
      "Showcase your collections with editorial-quality presentation.",
  },
  {
    icon: CookingPot,
    title: "Food, Snacks & Sweets",
    description:
      "Mouth-watering product photos, smooth ordering, delivery integration.",
  },
  {
    icon: DiamondsFour,
    title: "Jewellery & Premium Products",
    description: "Premium storefronts worthy of your products' price point.",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function AudienceFit() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden border-t border-border/40">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs uppercase tracking-widest text-primary font-medium mb-3 inline-block">
              Perfect Fit
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-balance">
              Two Tracks.{" "}
              <span className="text-primary">Built for You.</span>
            </h2>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* SaaS Track */}
          <motion.div
            className="relative rounded-2xl border border-border bg-card/30 p-1 md:p-2"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <GlowingEffect 
              spread={40} 
              glow={true} 
              disabled={false} 
              proximity={64} 
              inactiveZone={0.01} 
              borderWidth={1} 
              variant="white" 
            />
            {/* Subtle cool tint */}
            <div className="absolute inset-0 bg-secondary/3 pointer-events-none rounded-xl" />

            <div className="relative p-6 md:p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Code weight="duotone" className="w-5 h-5 text-secondary" />
                </div>
                <h3 className="text-xl font-bold">SaaS Founders & Builders</h3>
              </div>

              <div className="space-y-5">
                {saasUseCases.map((item, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="flex gap-4 items-start group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-muted/30 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-secondary/10 transition-colors">
                      <item.icon
                        weight="duotone"
                        className="w-5 h-5 text-muted-foreground group-hover:text-secondary transition-colors"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Commerce Track */}
          <motion.div
            className="relative rounded-2xl border border-border bg-card/30 p-1 md:p-2"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <GlowingEffect 
              spread={40} 
              glow={true} 
              disabled={false} 
              proximity={64} 
              inactiveZone={0.01} 
              borderWidth={1} 
              variant="white" 
            />
            {/* Subtle warm tint */}
            <div className="absolute inset-0 bg-primary/3 pointer-events-none rounded-xl" />

            <div className="relative p-6 md:p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Storefront
                    weight="duotone"
                    className="w-5 h-5 text-primary"
                  />
                </div>
                <h3 className="text-xl font-bold">
                  Local Brands & Commerce
                </h3>
              </div>

              <div className="space-y-5">
                {commerceVerticals.map((item, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="flex gap-4 items-start group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-muted/30 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary/10 transition-colors">
                      <item.icon
                        weight="duotone"
                        className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
