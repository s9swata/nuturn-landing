import type { Metadata } from "next";
import localFont from "next/font/local";
import LenisProvider from "@/components/LenisProvider";
import "lenis/dist/lenis.css";
import "./globals.css";
import { cn } from "@/lib/utils";

const specialExpandedBold = localFont({
  src: "./fonts/special-gothic-ttf/SpecialGothicExpanded-Bold.ttf",
  variable: "--font-special-bold",
  weight: "700",
  display: "swap",
});

const specialExpandedMedium = localFont({
  src: "./fonts/special-gothic-ttf/SpecialGothicExpanded-Medium.ttf",
  variable: "--font-special-medium",
  weight: "500",
  display: "swap",
});

const rocGroteskLight = localFont({
  src: "./fonts/roc-grotesk-woff2/Roc Grotesk Light.woff2",
  variable: "--font-roc-light",
  weight: "300",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nuturn Studio",
  description: "Cinematic Scrolltelling Experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full antialiased",
        specialExpandedBold.variable,
        specialExpandedMedium.variable,
        rocGroteskLight.variable
      )}
    >
      <body className="min-h-full flex flex-col">
        <LenisProvider>
          {children}
        </LenisProvider>
      </body>
    </html>
  );
}

