import { Card } from "@/components/ui/card";
import { Phone, BarChart3, Headphones, Shield, Users, Clipboard, BadgeCheck, Camera, Sun } from "lucide-react";

const ventures = [
  {
    name: "Revenueable.ai",
    description: "Sales & Marketing Automation. Turns silent leads into real conversations using AI voice, chat, and omnichannel flows.",
    icon: Phone,
    color: "primary",
  },
  {
    name: "Vriksha Analytics",
    description: "Chat-Based Deep Analytics. Ask questions. Get instant insights. No dashboards. Just conversation.",
    icon: BarChart3,
    color: "secondary",
  },
  {
    name: "Telecallers.ai",
    description: "Cloud Voice AI. AI agents that call, talk, and sell — multilingual and massively scalable.",
    icon: Headphones,
    color: "accent",
  },
  {
    name: "Signal Box",
    description: "On-Premise + On-Device Voice AI. Ultra-secure voice intelligence for regulated industries.",
    icon: Shield,
    color: "primary",
  },
  {
    name: "Vriksha CRM",
    description: "AI-First CRM. A CRM that listens, thinks, and acts — from follow-ups to proposals.",
    icon: Users,
    color: "secondary",
  },
  {
    name: "MarketResearchLabs",
    description: "Voice-Led Research Automation. Outbound AI calling, segmentation, insights — fully automated.",
    icon: Clipboard,
    color: "accent",
  },
  {
    name: "AirMingle",
    description: "Hardware + Voice Workflows. A smart badge that captures meetings, summarizes instantly, and triggers actions.",
    icon: BadgeCheck,
    color: "primary",
  },
  {
    name: "iPolice",
    description: "AI Image & Video Monitoring. Automates challan detection, number-plate recognition, and city-level compliance.",
    icon: Camera,
    color: "secondary",
  },
  {
    name: "OneSolar",
    description: "Satellite + AI Solar Intelligence. Unified lead generation, feasibility, and remote solar analysis.",
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
            <span className="text-foreground">Built for the Real World</span>
          </h2>
        </div>

        {/* Ventures Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
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
