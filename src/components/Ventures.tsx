import { Button } from "@/components/ui/button";
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
    <section className="py-20 px-6 bg-background border-t-2 border-primary/20">
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
            const colorClass = venture.color === "primary" ? "border-primary/40 hover:border-primary" : venture.color === "secondary" ? "border-secondary/40 hover:border-secondary" : "border-accent/40 hover:border-accent";
            const iconBg = venture.color === "primary" ? "bg-primary/20" : venture.color === "secondary" ? "bg-secondary/20" : "bg-accent/20";
            const iconColor = venture.color === "primary" ? "text-primary" : venture.color === "secondary" ? "text-secondary" : "text-accent";
            const shadowColor = venture.color === "primary" ? "0 0 30px hsl(var(--primary) / 0.4)" : venture.color === "secondary" ? "0 0 30px hsl(var(--secondary) / 0.4)" : "0 0 30px hsl(var(--accent) / 0.4)";
            
            return (
              <Card
                key={index}
                className={`group relative p-8 bg-card border-2 ${colorClass} transition-all hover:scale-105 animate-fade-in overflow-hidden`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" 
                  style={{ boxShadow: shadowColor }}
                />
                
                <div className="relative space-y-4">
                  <div className={`w-14 h-14 rounded-lg ${iconBg} flex items-center justify-center group-hover:animate-glow-intense`}>
                    <Icon className={`w-7 h-7 ${iconColor}`} />
                  </div>

                  <div className="space-y-2">
                    <h3 className={`text-2xl font-bold ${iconColor}`}>
                      {venture.name}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {venture.description}
                    </p>
                  </div>

                  <div className={`h-0.5 w-0 group-hover:w-full transition-all duration-500 ${iconColor === "text-primary" ? "bg-primary" : iconColor === "text-secondary" ? "bg-secondary" : "bg-accent"}`} />
                </div>
              </Card>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button 
            size="lg" 
            variant="outline"
            className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold px-8 py-6 text-lg rounded-lg transition-all hover:scale-105"
          >
            View All Ventures
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Ventures;
