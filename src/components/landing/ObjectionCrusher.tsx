"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionItem,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Is this right for me?",
    answer:
      "Perfect for funded startups and ambitious indie builders ready to scale. If you are pre-revenue and pre-funding, we might be overkill. But if you have traction and need a robust, scalable platform to handle growth, you're exactly who we built this for.",
  },
  {
    question: "What do you actually build?",
    answer:
      "We build two things: (1) High-converting SaaS products with modern architecture, and (2) Done-for-you ecommerce stores for local businesses. Every build includes strategy, design, development, and post-launch support.",
  },
  {
    question: "How long does it take?",
    answer:
      "Most projects launch in 2–4 weeks. High-converting landing pages: 2–3 weeks. Full SaaS MVPs: 3–6 weeks. Ecommerce stores: 10–14 days. Timelines are guaranteed in your contract.",
  },
  {
    question: "Will I be able to manage it later?",
    answer:
      "Yes. We build simple admin interfaces and train your team on day one. You'll never be dependent on us for basic updates, order management, or content changes. We're here to support, not replace, your team.",
  },
  {
    question: "What makes this different?",
    answer:
      "We're marketers who code. Most agencies build what you ask for. We build what makes money. Every design decision and technical choice is made with your MRR and conversion rate in mind.",
  },
  {
    question: "What happens after launch?",
    answer:
      "We stay involved for 30 days of optimization. We monitor analytics, A/B test key elements, and help you understand what's working. After that, you have options to extend or we hand everything off fully documented.",
  },
];

export function ObjectionCrusher() {
  return (
    <section
      id="faq"
      className="py-24 md:py-32 bg-background border-t border-border/40 relative overflow-hidden"
    >
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-start max-w-6xl mx-auto">
          {/* Left Column - Header */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="md:sticky md:top-32"
          >
            <span className="text-xs uppercase tracking-widest text-primary font-medium mb-3 inline-block">
              Clear Answers
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              You Probably Have{" "}
              <span className="text-primary">Questions.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              We believe in total transparency. Here&apos;s everything you need
              to know before we jump on a discovery call.
            </p>
          </motion.div>

          {/* Right Column - FAQs */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full"
          >
            <Accordion className="w-full space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  title={faq.question}
                  className="bg-card/30 border border-border rounded-2xl px-6 transition-all duration-300"
                >
                  <p className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-1/2 bg-primary/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
    </section>
  );
}
