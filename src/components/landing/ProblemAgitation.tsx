"use client";

import { motion, Variants } from "framer-motion";
import { Clock, TrendDown, ChatCircleDots } from "@phosphor-icons/react";
import ShinyText from "@/components/ui/shiny-text";

const painPoints = [
  {
    icon: Clock,
    title: "Slow Execution, Missed Deadlines",
    description:
      "You've been waiting months for a developer to ship something that should have taken weeks. Opportunities don't wait.",
  },
  {
    icon: TrendDown,
    title: "Visitors Don't Convert to Buyers",
    description:
      "Your traffic is real but the sales aren't. Whether it's a SaaS landing page or your online store, leaky funnels cost you every day.",
  },
  {
    icon: ChatCircleDots,
    title: "Orders Lost in DMs and Inboxes",
    description:
      "You're managing sales through WhatsApp and Instagram. It works — until it doesn't. One missed message is a lost sale.",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function ProblemAgitation() {
  return (
    <section className="py-24 md:py-32 bg-background relative border-t border-border/40">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs uppercase tracking-widest text-primary font-medium mb-3 inline-block">
              The Challenge
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              We Know Exactly What&apos;s{" "}
              <span className="text-primary">Slowing You Down</span>
            </h2>
          </motion.div>
        </div>

        <motion.div
          className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {painPoints.map((point, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-card/30 border border-border p-8 rounded-2xl hover:bg-card/50 transition-colors"
            >
              <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center mb-6 text-destructive">
                <point.icon weight="duotone" className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{point.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {point.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="text-xl md:text-2xl font-medium text-foreground">
            There&apos;s a better way.{" "}
            <ShinyText
              text="Nuturn Studio"
              speed={3}
              color="#a1a1aa"
              shineColor="#f59e0b"
              pauseOnHover={true}
              className="font-semibold"
            />{" "}
            handles the execution so you can focus on growing.
          </p>
        </motion.div>
      </div>

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-1/2 bg-destructive/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
    </section>
  );
}
