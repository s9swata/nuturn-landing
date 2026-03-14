"use client";

import { motion } from "framer-motion";
import {
  WhatsappLogo,
  EnvelopeSimple,
} from "@phosphor-icons/react";
import { CalEmbed } from "./CalEmbed";

export function ContactForm() {
  return (
    <section
      id="contact"
      className="py-24 md:py-32 relative border-t border-border/40"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 max-w-6xl mx-auto">
          {/* Left column — info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs uppercase tracking-widest text-primary font-medium mb-3 inline-block">
              Get Started
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Let&apos;s Make It Happen
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Fill out the form or reach us directly on WhatsApp.
            </p>

            {/* Contact Alternatives */}
            <div className="space-y-4">
              <a
                href="https://wa.me/918603538436"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <WhatsappLogo
                    weight="fill"
                    className="w-5 h-5 text-emerald-500"
                  />
                </div>
                <div>
                  <div className="font-semibold text-sm group-hover:text-primary transition-colors">
                    Chat on WhatsApp
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Quick replies, usually within an hour
                  </div>
                </div>
              </a>

              {/* Instagram option - commented out
              <a
                href="https://instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
                  <InstagramLogo
                    weight="fill"
                    className="w-5 h-5 text-pink-500"
                  />
                </div>
                <div>
                  <div className="font-semibold text-sm group-hover:text-primary transition-colors">
                    DM on Instagram
                  </div>
                  <div className="text-xs text-muted-foreground">
                    See our latest work and reach out
                  </div>
                </div>
              </a>
              */}

              <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <EnvelopeSimple
                    weight="fill"
                    className="w-5 h-5 text-primary"
                  />
                </div>
                <div>
                  <div className="font-semibold text-sm">
                    amriteshanshu1234@gmail.com
                  </div>
                  <div className="text-xs text-muted-foreground">
                    We respond within 24 hours
                  </div>
                </div>
              </div>
            </div>

            {/* SaaS / Commerce framings */}
            <div className="mt-10 space-y-4 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground/80">
                  SaaS founders:
                </span>{" "}
                We&apos;ll schedule a 30-minute discovery call to discuss your
                product roadmap and timeline.
              </p>
              <p>
                <span className="font-medium text-foreground/80">
                  Local businesses:
                </span>{" "}
                We&apos;ll walk you through how to launch your store and what
                success looks like.
              </p>
            </div>
          </motion.div>

          {/* Right column — Cal.com embed */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8">
              <CalEmbed />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
