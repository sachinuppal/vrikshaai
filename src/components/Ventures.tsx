import { Card } from "@/components/ui/card";
import { Phone, BarChart3, Headphones, Shield, Users, Clipboard, BadgeCheck, Camera, Sun } from "lucide-react";

const ventures = [
  {
    name: "Revenueable.ai",
    description: "Sales and Marketing Automation Engine. Converts lost leads into conversations using AI voice, chat, and omnichannel automation.",
    icon: Phone,
    color: "primary",
  },
  {
    name: "Vriksha Analytics",
    description: "Chat-based Deep Analytics. Ask questions. Get instant insights. No dashboards. Just conversation.",
    icon: BarChart3,
    color: "secondary",
  },
  {
    name: "Telecallers.ai",
    description: "Cloud-Native Voice AI Platform. AI voice agents that call, talk, and sell — at scale, with empathy.",
    icon: Headphones,
    color: "accent",
  },
  {
    name: "Signal Box",
    description: "On-premise + On-device Voice AI. Private, secure, and enterprise-grade voice AI stack for regulated industries.",
    icon: Shield,
    color: "primary",
  },
  {
    name: "Vriksha CRM",
    description: "The All-New AI-led CRM. A CRM that listens, talks, and acts — automating follow-ups, proposals, and insights.",
    icon: Users,
    color: "secondary",
  },
  {
    name: "MarketResearchLabs",
    description: "Rapid Voice AI-based Market Research. Outbound voice surveys, instant segmentation, and analytics — all automated.",
    icon: Clipboard,
    color: "accent",
  },
  {
    name: "AirMingle",
    description: "Hardware Badge + Voice Transcription + Workflow Automation. Bridges the offline world with AI — record, summarize, and trigger actions instantly.",
    icon: BadgeCheck,
    color: "primary",
  },
  {
    name: "iPolice",
    description: "AI-powered Image and Video Monitoring. Automates challan detection, license plate recognition, and violation analytics.",
    icon: Camera,
    color: "secondary",
  },
  {
    name: "OneSolar",
    description: "AI-driven Solar Analytics and Lead Platform. Unified solar lead generation and satellite-based feasibility analysis.",
    icon: Sun,
    color: "accent",
  },
];

const Ventures = () => {
  return (
    <section className="py-20 px-6 bg-background">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16 space-y-6 animate-fade-up">
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="text-primary">Branches of the Vriksha — </span>
            <span className="text-foreground">Platforms Built for the Real World.</span>
          </h2>
        </div>

        {/* Ventures Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {ventures.map((venture, index) => {
            const Icon = venture.icon;
            const iconBg = venture.color === "primary" ? "bg-primary/10" : venture.color === "secondary" ? "bg-secondary/10" : "bg-accent/10";
            const iconColor = venture.color === "primary" ? "text-primary" : venture.color === "secondary" ? "text-secondary" : "text-accent";
            
            return (
              <Card
                key={index}
                className="group relative p-6 bg-card border border-border shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1 animate-fade-in overflow-hidden"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="relative space-y-4">
                  <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                  </div>

                  <div className="space-y-2">
                    <h3 className={`text-xl font-bold ${iconColor}`}>
                      {venture.name}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {venture.description}
                    </p>
                  </div>

                  <div className={`h-0.5 w-0 group-hover:w-full transition-all duration-500 rounded-full ${iconColor === "text-primary" ? "bg-primary" : iconColor === "text-secondary" ? "bg-secondary" : "bg-accent"}`} />
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Ventures;
