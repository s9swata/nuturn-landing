import type { Metadata } from "next";
import localFont from "next/font/local";
import { Space_Grotesk } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import { SmoothScroll } from "@/components/providers/SmoothScroll";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const gulfsSemiExpanded = localFont({
  src: "./fonts/GulfsDisplay-SemiExpanded.woff2",
  variable: "--font-gulfs-semi-expanded",
  weight: "600",
});

export const metadata: Metadata = {
  title: "Nuturn Studio | Launch Faster. Convert Better.",
  description:
    "We build high-converting SaaS products and done-for-you ecommerce stores for founders and local businesses.",
  openGraph: {
    title: "Nuturn Studio | Launch Faster. Convert Better.",
    description:
      "We build high-converting SaaS products and done-for-you ecommerce stores for founders and local businesses.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${spaceGrotesk.variable} ${gulfsSemiExpanded.variable} font-sans antialiased bg-background text-foreground`}
      >
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
