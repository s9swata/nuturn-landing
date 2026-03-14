import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { ProblemAgitation } from "@/components/landing/ProblemAgitation";
import { SolutionShowcase } from "@/components/landing/SolutionShowcase";
import { AudienceFit } from "@/components/landing/AudienceFit";
import { Benefits } from "@/components/landing/Benefits";
import { Pricing } from "@/components/landing/Pricing";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ObjectionCrusher } from "@/components/landing/ObjectionCrusher";
import { FinalCta } from "@/components/landing/FinalCta";
import { ContactForm } from "@/components/landing/ContactForm";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen selection:bg-primary/30">
      <Navbar />
      <Hero />
      <ProblemAgitation />
      <SolutionShowcase />
      <AudienceFit />
      <Benefits />
      <Pricing />
      <HowItWorks />
      <ObjectionCrusher />
      <FinalCta />
      <ContactForm />
      <Footer />
    </main>
  );
}
