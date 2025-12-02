import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TermsOfUse = () => {
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
          <h1 className="text-4xl font-bold text-foreground mb-4">VRIKSHA.ai — Terms of Use</h1>
          <p className="text-muted-foreground">Effective Date: [Insert date]</p>
        </div>

        {/* Introduction */}
        <div className="bg-card rounded-xl border border-border p-6 mb-8 shadow-sm">
          <p className="text-foreground leading-relaxed">
            By accessing or using the website, platform, services or applications (collectively, the "Services") of VRIKSHA.ai, you agree to be bound by these Terms of Use ("Terms"). If you do not agree, do not use the Services.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-muted/50 rounded-xl border border-border p-6 mb-12">
          <h2 className="text-lg font-semibold text-foreground mb-4">Table of Contents</h2>
          <nav className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              "Definitions",
              "Acceptance of Terms",
              "Changes to Terms",
              "Use of Services — License & Restrictions",
              "Services That Involve Payment",
              "Intellectual Property",
              "Termination & Suspension",
              "Disclaimers & Limitation of Liability",
              "Indemnification",
              "Governing Law & Dispute Resolution",
              "Third-Party Services & Links",
              "Privacy Policy & Data Protection",
              "Export / Compliance / Data Residency",
              "Changes to Services & Disclaimers",
              "Severability & Waiver",
              "Contact Info",
              "Entire Agreement"
            ].map((item, index) => (
              <a 
                key={index}
                href={`#section-${index + 1}`}
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
          <section id="section-1" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              <span className="text-primary">1.</span> Definitions
            </h2>
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-3">
              <p><strong>"Company", "we", "us", "our"</strong> — refers to VRIKSHA.ai.</p>
              <p><strong>"User", "you", "your"</strong> — any individual or entity using the Services.</p>
              <p><strong>"Content"</strong> — any text, data, media, code or other materials made available to you by the Company or its users.</p>
              <p><strong>"Services"</strong> — VRIKSHA.ai's websites, platforms, AI-products, tools, APIs, SDKs, voice/AI services, accelerator services, and related offerings.</p>
            </div>
          </section>

          {/* Section 2 */}
          <section id="section-2" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              <span className="text-primary">2.</span> Acceptance of Terms
            </h2>
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <p className="text-foreground leading-relaxed">
                By using or accessing any part of the Services, you confirm that you have read, understood, and agree to these Terms and any referenced policies (e.g., Privacy Policy). Continued use indicates ongoing acceptance.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section id="section-3" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              <span className="text-primary">3.</span> Changes to Terms
            </h2>
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <p className="text-foreground leading-relaxed">
                We may modify these Terms at any time. We will post changes on our site. If you continue to use the Services after changes are posted, you accept the updated Terms. If you do not accept, you must stop using the Services.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section id="section-4" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              <span className="text-primary">4.</span> Use of Services — License & Restrictions
            </h2>
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">4.1 License to Use</h3>
                <p className="text-foreground leading-relaxed">
                  Subject to your compliance, we grant you a limited, non-exclusive, non-transferable license to use the Services for their intended purpose.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">4.2 Prohibited Uses</h3>
                <p className="text-foreground mb-3">You agree not to:</p>
                <ul className="list-disc list-inside space-y-2 text-foreground">
                  <li>Use Services for illegal, fraudulent, abusive or unethical purposes.</li>
                  <li>Attempt unauthorized access, reverse-engineer, tamper, or interfere with the Services.</li>
                  <li>Use the Services to infringe intellectual property rights, or violate privacy or data-protection laws.</li>
                  <li>Use the Services to send spam, malware, or unlawful content.</li>
                  <li>Use the Services in a manner that harms or overloads the infrastructure, or interferes with other users' access.</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">4.3 Account & Data Responsibility</h3>
                <p className="text-foreground leading-relaxed">
                  If you create an account, you must provide accurate info. Keep credentials confidential. You are responsible for all actions under your account. Notify us of unauthorized use immediately.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section id="section-5" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              <span className="text-primary">5.</span> Services That Involve Payment, Subscriptions or Third-Party Products
            </h2>
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-3">
              <p className="text-foreground leading-relaxed">
                If you pay for certain Services (e.g., subscription, usage-based, license, enterprise offer), additional terms apply: pricing, billing, refunds (if any), usage limits, and compliance with payment terms.
              </p>
              <p className="text-foreground leading-relaxed">
                We may suspend or terminate paid access if you violate payment terms or these Terms.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section id="section-6" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              <span className="text-primary">6.</span> Intellectual Property
            </h2>
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-3">
              <p className="text-foreground leading-relaxed">
                All content, software, designs, data models, trademarks and materials provided by VRIKSHA.ai remain our property (or that of our licensors). You may not copy, reproduce, distribute or create derivative works without our explicit permission.
              </p>
              <p className="text-foreground leading-relaxed">
                If you submit content or data to us (e.g., feedback, support requests), you grant us a worldwide, royalty-free license to use, reproduce, modify, adapt, publish, translate, distribute — solely for improving the Services.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section id="section-7" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              <span className="text-primary">7.</span> Termination & Suspension
            </h2>
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-3">
              <p className="text-foreground leading-relaxed">
                We may suspend or terminate your access or account at our discretion — for any breach, abusive behaviour, illegal use, or inactivity — without prior notice.
              </p>
              <p className="text-foreground leading-relaxed">
                You may also discontinue using the Services at any time. Termination does not relieve you of payment obligations or liabilities for prior actions.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section id="section-8" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              <span className="text-primary">8.</span> Disclaimers & Limitation of Liability
            </h2>
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">8.1 No Warranty</h3>
                <p className="text-foreground leading-relaxed">
                  The Services are provided "as is." We disclaim all warranties — express, implied or statutory, including warranties of fitness for a particular purpose, merchantability, security, or non-infringement.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">8.2 Limitation of Liability</h3>
                <p className="text-foreground leading-relaxed">
                  To the maximum extent permitted by law, VRIKSHA.ai (and its team, affiliates, partners) will not be liable for any indirect, incidental, special, consequential or punitive damages — including lost profits, data loss, downtime, or business interruption — arising from or relating to use of or inability to use Services, even if advised of the possibility of such damages.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">8.3 Cap on Liability</h3>
                <p className="text-foreground leading-relaxed">
                  Our total aggregate liability under or in connection with these Terms is limited to the amount you paid us in the preceding 12 months (if any), or INR 1,00,000 (One Lakh INR), whichever is lower.
                </p>
              </div>
            </div>
          </section>

          {/* Section 9 */}
          <section id="section-9" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              <span className="text-primary">9.</span> Indemnification
            </h2>
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <p className="text-foreground leading-relaxed">
                You agree to indemnify, defend, and hold harmless VRIKSHA.ai and its officers, employees, agents from any claim, demand, loss, liability, damages, or expenses (including legal fees) arising from your use of Services or violation of these Terms.
              </p>
            </div>
          </section>

          {/* Section 10 */}
          <section id="section-10" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              <span className="text-primary">10.</span> Governing Law & Dispute Resolution
            </h2>
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-3">
              <p className="text-foreground leading-relaxed">
                These Terms are governed by the laws of India. Any dispute shall be subject to the exclusive jurisdiction of courts in Bengaluru, Karnataka (or such other jurisdiction as chosen by the Company).
              </p>
              <p className="text-foreground leading-relaxed">
                Parties waive any right to a jury trial to the extent permitted.
              </p>
            </div>
          </section>

          {/* Section 11 */}
          <section id="section-11" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              <span className="text-primary">11.</span> Third-Party Services & Links
            </h2>
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <p className="text-foreground leading-relaxed">
                Our Services may include links or integrations to third-party services, APIs or platforms. We do not control them, and are not responsible for their terms, practices, data-security, or content. Use them at your own risk.
              </p>
            </div>
          </section>

          {/* Section 12 */}
          <section id="section-12" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              <span className="text-primary">12.</span> Privacy Policy & Data Protection
            </h2>
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <p className="text-foreground leading-relaxed">
                Your use of data, personal information or communications via the Services is governed by our separate <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>. By using the Services you confirm you have read and agree to that policy.
              </p>
            </div>
          </section>

          {/* Section 13 */}
          <section id="section-13" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              <span className="text-primary">13.</span> Export / Compliance / Data Residency
            </h2>
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-3">
              <p className="text-foreground leading-relaxed">
                You understand that some Services (e.g. AI, voice, analytics) may rely on infrastructure, APIs or operations across jurisdictions. You agree to comply with applicable export, data-protection, and local laws.
              </p>
              <p className="text-foreground leading-relaxed">
                We may restrict or refuse service in certain geographies at our discretion.
              </p>
            </div>
          </section>

          {/* Section 14 */}
          <section id="section-14" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              <span className="text-primary">14.</span> Changes to Services & Disclaimers
            </h2>
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <p className="text-foreground leading-relaxed">
                We may modify, suspend, or discontinue parts (or all) of our Services at any time without liability or obligation. We may also remove or modify content or features.
              </p>
            </div>
          </section>

          {/* Section 15 */}
          <section id="section-15" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              <span className="text-primary">15.</span> Severability & Waiver
            </h2>
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <p className="text-foreground leading-relaxed">
                If any provision is found invalid or unenforceable, that provision will be struck out and the rest remain effective. Failure or delay to enforce any right under these Terms doesn't constitute waiver of that right.
              </p>
            </div>
          </section>

          {/* Section 16 */}
          <section id="section-16" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              <span className="text-primary">16.</span> Contact Info
            </h2>
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <p className="text-foreground leading-relaxed mb-4">
                If you have questions about these Terms or the Services, contact us at:
              </p>
              <div className="space-y-2 text-foreground">
                <p><strong>Email:</strong> support@vriksha.ai</p>
                <p><strong>Address:</strong> FLAT C1-123, Gottigere Main Road, CHIKKA KAMMANAHALLI, Bannerghatta, Bangalore South, Karnataka, PIN Code: 560083</p>
              </div>
            </div>
          </section>

          {/* Section 17 */}
          <section id="section-17" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              <span className="text-primary">17.</span> Entire Agreement
            </h2>
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <p className="text-foreground leading-relaxed">
                These Terms (in combination with the <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link> and any additional separate agreements) constitute the entire agreement between you and VRIKSHA.ai regarding use of the Services.
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

export default TermsOfUse;
