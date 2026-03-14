import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Nuturn Studio",
  description: "Privacy Policy for Nuturn Studio - How we collect, use, and protect your information.",
};

export default function PrivacyPage() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: March 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nuturn Studio (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates the website nuturnstudio.com. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
                when you visit our website, book a consultation, or use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We may collect the following types of information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Personal Information:</strong> Name, email address, phone number, and business details when you fill out our contact form or book a consultation.</li>
                <li><strong>Usage Data:</strong> IP address, browser type, pages visited, and time spent on our website.</li>
                <li><strong>Communications:</strong> Records of correspondence when you contact us.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use the collected information to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Respond to your inquiries and provide customer support</li>
                <li>Schedule and conduct consultation calls</li>
                <li>Send you relevant updates about our services</li>
                <li>Improve our website and user experience</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Cookies and Tracking Technologies</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our website may use cookies and similar tracking technologies to enhance your browsing experience. 
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Third-Party Services</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use third-party services to operate our website and provide services:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Cal.com:</strong> For scheduling consultation calls</li>
                <li><strong>Analytics:</strong> To understand website traffic and usage patterns</li>
                <li><strong>Hosting:</strong> For website infrastructure and deployment</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal information. 
                However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Under applicable data protection laws (including GDPR and CCPA), you have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Access your personal information</li>
                <li>Request correction or deletion of your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Request data portability</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about this Privacy Policy, please contact us at:{" "}
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
