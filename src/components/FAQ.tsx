import { useState } from "react";
import { TreeDeciduous } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const categories = [
  { id: "about", label: "About Vriksha" },
  { id: "accelerator", label: "Accelerator" },
  { id: "products", label: "AI Products" },
  { id: "technical", label: "Technical" },
  { id: "security", label: "Security" },
  { id: "start", label: "Getting Started" },
];

const faqData = {
  about: [
    {
      question: "What exactly is Vriksha.ai?",
      answer: (
        <>
          <p className="mb-3">Vriksha.ai is India's first AI Venture Studio + Accelerator.</p>
          <p className="mb-3">We build and scale AI-first companies. We provide funding, engineering, product development, voice AI, analytics, CRM, and go-to-market execution — all under one roof.</p>
          <p className="font-semibold text-primary">We're hands-on partners, not passive investors.</p>
        </>
      ),
    },
    {
      question: "How is Vriksha different from a normal accelerator?",
      answer: (
        <>
          <p className="mb-3">Unlike a typical accelerator that only gives mentorship, Vriksha:</p>
          <ul className="list-disc pl-6 space-y-2 mb-3">
            <li>Co-builds your product</li>
            <li>Provides engineering + GTM staff</li>
            <li>Gives access to our AI platforms (voice AI, analytics, CRM, workflows)</li>
            <li>Helps get your first customers</li>
            <li>Co-invests in growth</li>
            <li>Stays with you after the program</li>
          </ul>
          <p className="font-semibold text-primary">Think of us as a technical co-founder plus early investor, combined.</p>
        </>
      ),
    },
  ],
  accelerator: [
    {
      question: "Who can apply to the Vriksha Accelerator?",
      answer: (
        <>
          <p className="mb-3">We accept:</p>
          <ul className="list-disc pl-6 space-y-1 mb-3">
            <li>Early-stage startups</li>
            <li>Solo founders</li>
            <li>Small teams</li>
            <li>AI-first product ideas</li>
            <li>Enterprise spin-offs</li>
            <li>GovTech innovators</li>
          </ul>
          <p className="mb-3">You must have:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>A strong founder</li>
            <li>A problem worth solving</li>
            <li>AI as the core engine</li>
            <li>Full-time commitment</li>
          </ul>
        </>
      ),
    },
    {
      question: "How much funding do you provide?",
      answer: (
        <>
          <p className="mb-3">Our standard accelerator deal: <strong>₹75 lakh for 7% equity</strong> (similar to YC's model).</p>
          <p className="mb-3">Depending on stage, we invest up to <strong>₹3 crore</strong> in the first check.</p>
          <p>Follow-on funding can go up to <strong>₹5 crore</strong>.</p>
        </>
      ),
    },
    {
      question: "How much equity does Vriksha take?",
      answer: (
        <>
          <ul className="list-disc pl-6 space-y-2 mb-3">
            <li>Accelerator companies: <strong>5%–12%</strong></li>
            <li>Co-built Studio ventures: <strong>15%–30%</strong></li>
          </ul>
          <p>We only take equity — no board control, no hidden terms.</p>
        </>
      ),
    },
    {
      question: "Does Vriksha work with idea-stage founders?",
      answer: (
        <>
          <p className="mb-3">Yes.</p>
          <p className="mb-3">We invest based on founder quality, not just traction.</p>
          <p>If the founder is exceptional, we help build from zero.</p>
        </>
      ),
    },
    {
      question: "What do startups get inside the 12–16 week program?",
      answer: (
        <>
          <p className="mb-3">A complete build + launch stack:</p>
          <ul className="list-disc pl-6 space-y-1 mb-3">
            <li>Engineering team</li>
            <li>Product & design</li>
            <li>GTM planning</li>
            <li>Voice AI stack (Telecallers.ai, Signal Box)</li>
            <li>Vriksha CRM</li>
            <li>Vriksha Analytics</li>
            <li>Market research & outbound automation</li>
            <li>Access to early customers</li>
            <li>Fundraising preparation</li>
            <li>Demo day with investors</li>
          </ul>
          <p className="font-semibold text-primary">You leave the program with a live product, real users, and initial revenue.</p>
        </>
      ),
    },
    {
      question: "Do startups keep their intellectual property (IP)?",
      answer: (
        <>
          <p className="mb-3">Yes.</p>
          <p className="mb-3">Founders own <strong>100% of their product IP</strong>.</p>
          <p>Vriksha only owns equity.</p>
        </>
      ),
    },
    {
      question: "When does the next accelerator batch start?",
      answer: (
        <>
          <p className="mb-3">We run rolling batches every 4–6 weeks.</p>
          <p>You can apply anytime.</p>
        </>
      ),
    },
  ],
  products: [
    {
      question: "What AI platforms are part of the Vriksha ecosystem?",
      answer: (
        <>
          <ul className="space-y-3">
            <li><strong>Revenueable.ai</strong> — Sales & marketing automation. Voice AI + WhatsApp + SMS + email + analytics to convert leads into revenue.</li>
            <li><strong>Vriksha Analytics</strong> — Chat-based deep analytics. Ask questions, get instant insights. No dashboards.</li>
            <li><strong>Telecallers.ai</strong> — Cloud voice AI. AI agents that call, talk, and sell at scale.</li>
            <li><strong>Signal Box</strong> — On-device/on-prem voice AI. Secure, private, enterprise-grade voice automation.</li>
            <li><strong>Vriksha CRM</strong> — AI-first CRM. Automates follow-ups, proposals, and lead workflows.</li>
            <li><strong>MarketResearchLabs</strong> — Voice-driven market research. Automated surveys, segmentation, and insights.</li>
            <li><strong>AirMingle</strong> — Hardware + voice workflows. Smart badge that records, summarizes, and automates tasks.</li>
            <li><strong>iPolice</strong> — AI-based policing automation. Image/video analysis, plate detection, challan workflows.</li>
            <li><strong>OneSolar</strong> — Solar intelligence. Satellite-based feasibility and solar lead engine.</li>
          </ul>
        </>
      ),
    },
    {
      question: "Can enterprises use Vriksha's AI products without joining the accelerator?",
      answer: (
        <>
          <p className="mb-3">Yes. Enterprises can work with:</p>
          <ul className="list-disc pl-6 space-y-1 mb-3">
            <li>Revenueable.ai</li>
            <li>Telecallers.ai</li>
            <li>Signal Box</li>
            <li>Vriksha CRM</li>
            <li>MarketResearchLabs</li>
            <li>iPolice</li>
            <li>OneSolar</li>
            <li>AirMingle</li>
          </ul>
          <p>Each can be purchased independently.</p>
        </>
      ),
    },
  ],
  technical: [
    {
      question: "Do you support on-premise or air-gapped deployments?",
      answer: (
        <>
          <p className="mb-3">Yes.</p>
          <p className="mb-3">We offer secure on-prem deployments through <strong>Signal Box</strong>.</p>
          <p>Perfect for banks, insurance companies, PSUs, hospitals, and government bodies.</p>
        </>
      ),
    },
    {
      question: "Which languages does your Voice AI support?",
      answer: (
        <>
          <ul className="list-disc pl-6 space-y-1 mb-3">
            <li>English</li>
            <li>Hindi</li>
            <li>Tamil</li>
            <li>Telugu</li>
            <li>Kannada</li>
            <li>Gujarati</li>
            <li>Marathi</li>
            <li>Bengali</li>
            <li>And more on request</li>
          </ul>
          <p className="font-semibold text-primary">We specialize in Indian multilingual voice intelligence.</p>
        </>
      ),
    },
    {
      question: "What industries does Vriksha work with?",
      answer: (
        <>
          <ul className="list-disc pl-6 space-y-1 mb-3">
            <li>BFSI</li>
            <li>Retail</li>
            <li>Education</li>
            <li>Healthcare</li>
            <li>Manufacturing</li>
            <li>Transport</li>
            <li>Energy & Solar</li>
            <li>Smart Cities</li>
            <li>Government & Law Enforcement</li>
            <li>D2C & Ecommerce</li>
          </ul>
          <p className="font-semibold text-primary">If your system involves communication, workflows, or intelligence — we can automate it.</p>
        </>
      ),
    },
    {
      question: "How long does a pilot or POC take?",
      answer: (
        <>
          <ul className="list-disc pl-6 space-y-1 mb-3">
            <li>Cloud Voice AI: <strong>1–2 weeks</strong></li>
            <li>On-prem / on-device: <strong>2–4 weeks</strong></li>
            <li>Analytics/CRM: <strong>3–7 days</strong></li>
            <li>Hardware (AirMingle): special timelines depending on supply</li>
          </ul>
          <p className="font-semibold text-primary">We move fast.</p>
        </>
      ),
    },
    {
      question: "How does pricing work?",
      answer: (
        <>
          <p className="mb-3">Each product has its own structure:</p>
          <ul className="list-disc pl-6 space-y-1 mb-3">
            <li>Voice AI → per-minute usage + platform fee</li>
            <li>WhatsApp/SMS → per-message + automation fee</li>
            <li>Analytics → per-seat or usage-based</li>
            <li>CRM → per-user</li>
            <li>MarketResearchLabs → per-call/per-survey</li>
            <li>AirMingle → hardware + cloud software</li>
            <li>iPolice → per-camera or per-feed pricing</li>
            <li>OneSolar → per-analysis + SaaS</li>
          </ul>
          <p className="font-semibold text-primary">Custom enterprise pricing available.</p>
        </>
      ),
    },
    {
      question: "Can you integrate with our CRM or internal systems?",
      answer: (
        <>
          <p className="mb-3">Yes. We support:</p>
          <ul className="list-disc pl-6 space-y-1 mb-3">
            <li>HubSpot</li>
            <li>Salesforce</li>
            <li>Zoho</li>
            <li>Freshsales</li>
            <li>Custom CRMs</li>
            <li>ERPs</li>
            <li>Data warehouses</li>
            <li>REST APIs</li>
            <li>Webhooks</li>
            <li>CSV imports</li>
          </ul>
          <p>We also build custom connectors if required.</p>
        </>
      ),
    },
  ],
  security: [
    {
      question: "How secure is Vriksha.ai?",
      answer: (
        <>
          <ul className="list-disc pl-6 space-y-1 mb-3">
            <li>Encryption at rest and in transit</li>
            <li>Secure credential storage</li>
            <li>India-based data residency available</li>
            <li>DPDP compliance</li>
            <li>Audit logs and role-based access</li>
            <li>On-premise processing via Signal Box</li>
            <li>Privacy-first workflows</li>
          </ul>
          <p className="font-semibold text-primary">Perfect for sensitive industries.</p>
        </>
      ),
    },
    {
      question: "What makes Vriksha.ai uniquely Indian?",
      answer: (
        <>
          <ul className="list-disc pl-6 space-y-1">
            <li>Multilingual voice tech at scale</li>
            <li>Hardware + software innovation (AirMingle)</li>
            <li>Deep alignment with Jio-scale infrastructure</li>
            <li>Solutions for Bharat, not just metro users</li>
            <li>GovTech readiness</li>
            <li>Engineering built for Indian challenges (volumes, accents, infra, complexity)</li>
          </ul>
        </>
      ),
    },
  ],
  start: [
    {
      question: "How do I get started?",
      answer: (
        <>
          <p className="mb-3">Choose one of the paths below:</p>
          <ul className="list-disc pl-6 space-y-1 mb-3">
            <li><strong>Apply to Accelerator</strong> (if you're building a startup)</li>
            <li><strong>Request Demo</strong> (if you want to use our AI products)</li>
            <li><strong>Partnership Inquiry</strong> (if you're from enterprise or government)</li>
            <li><strong>Talk to Vriksha</strong> (AI chatbot)</li>
          </ul>
          <p>We'll guide you from there.</p>
        </>
      ),
    },
    {
      question: "I have more questions. What should I do?",
      answer: (
        <>
          <p>Just tap <strong>Talk to Vriksha 🌳</strong> on the site — our AI conversational assistant can answer anything instantly, or route you to the right person.</p>
        </>
      ),
    },
  ],
};

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState("about");

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <TreeDeciduous className="w-8 h-8 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Frequently Asked Questions
              </h2>
            </div>
            <p className="text-muted-foreground text-lg">
              Everything you need to know about Vriksha.ai
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === category.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-background text-muted-foreground hover:bg-primary/10 hover:text-primary border border-border"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* FAQ Accordion */}
          <div className="bg-background rounded-2xl border border-border shadow-sm p-6">
            <Accordion type="multiple" className="space-y-2">
              {faqData[activeCategory as keyof typeof faqData].map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border border-border/50 rounded-xl px-4 data-[state=open]:bg-primary/5"
                >
                  <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary hover:no-underline py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
