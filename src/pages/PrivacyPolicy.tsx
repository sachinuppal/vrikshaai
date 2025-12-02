import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Back Link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Vriksha.ai — Privacy Policy</h1>
          <p className="text-muted-foreground">Effective Date: [Insert date]</p>
        </div>

        {/* Table of Contents */}
        <div className="bg-muted/50 rounded-xl border border-border p-6 mb-12">
          <h2 className="text-lg font-semibold text-foreground mb-4">Table of Contents</h2>
          <nav className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              "Introduction",
              "Definitions",
              "What Information We Collect",
              "Why We Collect & How We Use Your Information",
              "Cookies & Tracking Technologies",
              "Data Sharing & Third-Party Services",
              "Data Retention & Deletion",
              "Security Measures",
              "Your Rights & Choices",
              "Cross-Border Data Transfers",
              "Children & Minors",
              "Grievances & Contact",
              "Changes to This Privacy Policy",
              "Governing Law & Dispute Resolution",
              "Additional Provisions for Indian Legal Context"
            ].map((item, index) => (
              <a 
                key={index}
                href={`#privacy-section-${index + 1}`}
                className="text-primary hover:text-primary/80 transition-colors text-sm"
              >
                {index + 1}. {item}
              </a>
            ))}
          </nav>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {/* Section 1 */}
          <section id="privacy-section-1" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              <span className="text-primary">1.</span> Introduction
            </h2>
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-3">
              <p className="text-foreground leading-relaxed">
                Vriksha.ai ("we", "our", "us") is committed to protecting the privacy and security of individuals ("you", "user", "visitor") who access our website, use our applications, or engage with our services (collectively, "Services").
              </p>
              <p className="text-foreground leading-relaxed">
                This Privacy Policy explains how we collect, use, store, and protect your personal data. By using our Services, you consent to this policy. If you do not agree, please do not use the Services.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section id="privacy-section-2" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              <span className="text-primary">2.</span> Definitions
            </h2>
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-3">
              <p><strong>Personal Data:</strong> any information relating to an identified or identifiable individual — e.g. name, email address, phone number, IP address, usage data, etc.</p>
              <p><strong>Sensitive Personal Data / Information (SPDI):</strong> any data defined under applicable laws (e.g. government ID, health/biometric/financial info) — collected only if explicitly needed.</p>
              <p><strong>Services:</strong> Vriksha.ai's website, platforms, applications, APIs, SDKs, voice-AI tools, analytics tools, CRM, and other offerings.</p>
              <p><strong>Cookies & Tracking Technologies:</strong> browser cookies, local storage, device identifiers, analytics scripts, and other similar mechanisms.</p>
            </div>
          </section>

          {/* Section 3 */}
          <section id="privacy-section-3" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              <span className="text-primary">3.</span> What Information We Collect
            </h2>
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-6">
              <p className="text-foreground leading-relaxed">
                We collect personal data when: you interact with us (signup forms, contact forms, demo requests); use our Services; or simply browse our website.
              </p>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">3.1 Information you provide</h3>
                <ul className="list-disc list-inside space-y-2 text-foreground">
                  <li>Name, company, role, contact email, phone number</li>
                  <li>Communication preferences (e.g. opt-in for WhatsApp/SMS)</li>
                  <li>Company/organization details when you represent an enterprise or government entity</li>
                  <li>Use-case details, interest area, product preferences</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">3.2 Automatically collected information</h3>
                <ul className="list-disc list-inside space-y-2 text-foreground">
                  <li>IP address, device/browser type, OS, localization data (for region-based services)</li>
                  <li>Usage data: pages/features used, timestamps, logs relevant to service usage (e.g. API calls, voice-AI usage)</li>
                  <li>Cookies and analytics identifiers (if consented) to help improve user experience, analyze traffic, and manage sessions</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">3.3 Sensitive data</h3>
                <p className="text-foreground leading-relaxed">
                  We do not knowingly collect sensitive personal data (SPDI) unless required for a specific service (for example, KYC for certain enterprise users). If such data is collected, explicit consent will be sought.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section id="privacy-section-4" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              <span className="text-primary">4.</span> Why We Collect & How We Use Your Information
            </h2>
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <p className="text-foreground mb-4">We use your data for the following legitimate purposes:</p>
              <ul className="list-disc list-inside space-y-2 text-foreground">
                <li>To provide, support, and maintain Services (e.g. demos, onboarding, voice-AI, CRM, analytics)</li>
                <li>To communicate with you: respond to inquiries, send updates, schedule calls/demos, send invoices/receipts</li>
                <li>To personalize and improve user experience, site navigation, and service features</li>
                <li>To monitor and analyze service usage, trends, performance metrics, and for internal analytics</li>
                <li>For compliance, legal obligations, fraud prevention, and security</li>
                <li>For marketing purposes — only with your explicit consent, and with clear option to opt-out</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section id="privacy-section-5" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              <span className="text-primary">5.</span> Cookies & Tracking Technologies
            </h2>
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <p className="text-foreground leading-relaxed">
                We may use cookies or similar technologies to collect usage and device information. You may opt-out or disable non-essential cookies via your browser settings, though this may affect functionality. We will ask for consent where required by law.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section id="privacy-section-6" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              <span className="text-primary">6.</span> Data Sharing & Third-Party Services
            </h2>
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-3">
              <p className="text-foreground leading-relaxed">
                We do not sell your Personal Data to third parties. However, we may share data with:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground">
                <li>Vendors/service-providers (e.g. hosting providers, cloud services, payment gateways, analytics tools) to the extent necessary to deliver Services</li>
                <li>Business partners when you opt-in for co-branded integrations, enterprise services, or partnership programs</li>
                <li>Regulatory or legal authorities if required by law, court order or to protect rights, safety, or security</li>
              </ul>
              <p className="text-foreground leading-relaxed">
                We ensure such third parties implement appropriate security practices consistent with this Policy.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section id="privacy-section-7" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              <span className="text-primary">7.</span> Data Retention & Deletion
            </h2>
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <p className="text-foreground leading-relaxed">
                We retain your personal data only as long as necessary for the purposes outlined above, or as required under applicable law. Once the purpose is fulfilled (for example, the user withdraws consent or service relationship ends), we will delete or anonymize the data, unless legal obligations mandate continued storage.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section id="privacy-section-8" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              <span className="text-primary">8.</span> Security Measures
            </h2>
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <p className="text-foreground leading-relaxed">
                We maintain reasonable technical and organizational safeguards — encryption, access controls, secure servers — to protect your data from unauthorized access, unlawful processing, or accidental loss or destruction.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section id="privacy-section-9" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              <span className="text-primary">9.</span> Your Rights & Choices
            </h2>
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-3">
              <p className="text-foreground leading-relaxed">
                Depending on applicable law, you may have rights including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground">
                <li>Request access to your personal data stored by us</li>
                <li>Request correction or update of inaccurate or incomplete data</li>
                <li>Request deletion or anonymization of your data (subject to retention obligations)</li>
                <li>Opt-out of marketing communications or non-essential data processing</li>
                <li>Withdraw consent at any time, where consent is the legal basis for processing</li>
              </ul>
              <p className="text-foreground leading-relaxed">
                To exercise your rights, contact us via the details below. We aim to respond within reasonable time.
              </p>
            </div>
          </section>

          {/* Section 10 */}
          <section id="privacy-section-10" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              <span className="text-primary">10.</span> Cross-Border Data Transfers
            </h2>
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <p className="text-foreground leading-relaxed">
                If your data is transferred outside India (for services, hosting, or third-party processing), we ensure appropriate safeguards and compliance with applicable laws — e.g. encryption, data-processing agreements, consent mechanisms.
              </p>
            </div>
          </section>

          {/* Section 11 */}
          <section id="privacy-section-11" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              <span className="text-primary">11.</span> Children & Minors
            </h2>
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <p className="text-foreground leading-relaxed">
                Our Services are not directed at children under 18. We do not knowingly collect personal data from minors. If we become aware of such data collection, we will delete it promptly.
              </p>
            </div>
          </section>

          {/* Section 12 */}
          <section id="privacy-section-12" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              <span className="text-primary">12.</span> Grievances & Contact
            </h2>
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <p className="text-foreground leading-relaxed mb-4">
                For any privacy-related questions, data access/removal requests, complaints or clarifications, contact us at:
              </p>
              <div className="space-y-2 text-foreground">
                <p><strong>Email:</strong> [insert email]</p>
                <p><strong>Address:</strong> [insert registered address]</p>
              </div>
              <p className="text-foreground leading-relaxed mt-4">
                We will respond within a reasonable timeframe.
              </p>
            </div>
          </section>

          {/* Section 13 */}
          <section id="privacy-section-13" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              <span className="text-primary">13.</span> Changes to This Privacy Policy
            </h2>
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <p className="text-foreground leading-relaxed">
                We may update this Privacy Policy periodically to reflect changes in our practices, services, legal requirements, or regulations. We will post the updated policy on our website with revised "Effective date". Continued use of Services following updates constitutes acceptance of the new policy.
              </p>
            </div>
          </section>

          {/* Section 14 */}
          <section id="privacy-section-14" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              <span className="text-primary">14.</span> Governing Law & Dispute Resolution
            </h2>
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <p className="text-foreground leading-relaxed">
                This Privacy Policy and any disputes arising from it are governed by the laws of India. Jurisdiction will lie in courts of Bengaluru, Karnataka, India.
              </p>
            </div>
          </section>

          {/* Section 15 */}
          <section id="privacy-section-15" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              <span className="text-primary">15.</span> Additional Provisions for Indian Legal Context
            </h2>
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-3">
              <p className="text-foreground leading-relaxed">
                Vriksha.ai commits to comply with the recently enacted Digital Personal Data Protection Act, 2023 (DPDP Act) regarding processing of digital personal data in India.
              </p>
              <p className="text-foreground leading-relaxed">
                We adopt best-practice data-handling aligned with Indian IT laws and data protection requirements: obtaining consent, ensuring transparency, offering opt-out, practicing data minimization, and reasonable security safeguards.
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-border text-center">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
