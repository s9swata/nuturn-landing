"use client";

import {
  WhatsappLogo,
  InstagramLogo,
  EnvelopeSimple,
} from "@phosphor-icons/react";

const footerLinks = [
  { label: "Services", href: "#services" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card/30">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
          {/* Brand */}
          <div>
            <a href="#" className="flex items-center gap-1.5 mb-4 group">
              <span className="text-xl font-bold tracking-tight font-[family-name:var(--font-heading)]">
                nuturn
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary group-hover:scale-125 transition-transform" />
            </a>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              We build high-converting SaaS products and done-for-you ecommerce
              stores for founders and local businesses.
            </p>
          </div>

          {/* Nav Links */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2.5">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Connect</h4>
            <div className="flex gap-3">
              <a
                href="https://wa.me/918603538436"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-muted/30 flex items-center justify-center hover:bg-primary/10 transition-colors group"
                aria-label="WhatsApp"
              >
                <WhatsappLogo
                  weight="fill"
                  className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors"
                />
              </a>
              {/* Instagram - commented out
              <a
                href="https://instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-muted/30 flex items-center justify-center hover:bg-primary/10 transition-colors group"
                aria-label="Instagram"
              >
                <InstagramLogo
                  weight="fill"
                  className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors"
                />
              </a>
              */}
              <a
                href="mailto:amriteshanshu1234@gmail.com"
                className="w-10 h-10 rounded-lg bg-muted/30 flex items-center justify-center hover:bg-primary/10 transition-colors group"
                aria-label="Email"
              >
                <EnvelopeSimple
                  weight="fill"
                  className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors"
                />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Nuturn Studio. All rights
            reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="/privacy"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
