import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | Nuturn Studio",
  description: "Terms of Service for Nuturn Studio - Rules and guidelines for using our services.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-20 md:py-28 border-b border-border/40">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: March 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using the Nuturn Studio website (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), 
                you accept and agree to be bound by the terms and provisions of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Services Provided</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Nuturn Studio provides the following services:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Custom full-stack SaaS product development</li>
                <li>High-converting SaaS landing pages</li>
                <li>AI-integrated product development</li>
                <li>Done-for-you ecommerce store development</li>
                <li>Mobile-friendly storefront design and setup</li>
                <li>Payment integration and checkout setup</li>
                <li>Admin management system setup</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Client Responsibilities</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                As a client, you agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Provide accurate and complete project requirements</li>
                <li>Deliver necessary content, materials, and access credentials in a timely manner</li>
                <li>Provide feedback within agreed timeframes</li>
                <li>Make payments according to the agreed schedule</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Payment Terms</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Payment terms vary by project and will be outlined in individual service agreements. Generally:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Projects require an upfront deposit to begin work</li>
                <li>Remaining payments are due upon project completion or according to milestones</li>
                <li>Additional work outside the agreed scope will be billed separately</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                <strong>Client-Provided Materials:</strong> You retain full ownership of all content, images, 
                and materials you provide for the project.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                <strong>Work Product:</strong> Upon full payment, you receive ownership of the final deliverables 
                created specifically for your project. We retain the right to display completed work in our portfolio.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Third-Party Components:</strong> Code libraries, frameworks, and tools used remain under 
                their respective open-source or commercial licenses.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Nuturn Studio shall not be liable for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Indirect, incidental, or consequential damages</li>
                <li>Loss of profits, revenue, or business opportunities</li>
                <li>Issues arising from third-party services or integrations</li>
                <li>Delays caused by client-side factors (late feedback, content delivery, etc.)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Termination</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Either party may terminate this agreement with written notice. Upon termination:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Client will pay for all work completed up to the termination date</li>
                <li>Client will receive deliverables completed and paid for</li>
                <li>Intellectual property rights remain as specified in Section 5</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Refund Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Due to the custom nature of our services, all payments are non-refundable once work has commenced. 
                We are committed to delivering high-quality work and will address any concerns through revision cycles 
                as outlined in our project agreements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms of Service shall be governed by and construed in accordance with the laws of India. 
                Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts in India.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions about these Terms of Service, please contact us at:{" "}
                <a href="mailto:amriteshanshu1234@gmail.com" className="text-primary hover:underline">
                  amriteshanshu1234@gmail.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
