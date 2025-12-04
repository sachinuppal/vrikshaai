import { Card } from "@/components/ui/card";
import { Mic, Database, Eye, Satellite, Bot, Phone, BarChart3, Headphones, Shield, Users, Clipboard, BadgeCheck, Camera, Sun } from "lucide-react";
import { FadeInView, StaggerContainer, StaggerItem, BentoCard3D } from "@/components/animations";

const ventureCategories = [
  {
    technology: "Voice AI & Conversational Engines",
    icon: Mic,
    color: "primary",
    ventures: [
      {
        name: "Revenueable.ai",
        description: "Sales & Marketing Automation. Turns silent leads into real conversations using AI voice, chat, and omnichannel flows.",
        icon: Phone,
      },
      {
        name: "Telecallers.ai",
        description: "Cloud Voice AI. AI agents that call, talk, and sell — multilingual and massively scalable.",
        icon: Headphones,
      },
      {
        name: "Signal Box",
        description: "On-Premise + On-Device Voice AI. Ultra-secure voice intelligence for regulated industries.",
        icon: Shield,
      },
      {
        name: "Vriksha CRM",
        description: "AI-First CRM. A CRM that listens, thinks, and acts — from follow-ups to proposals.",
        icon: Users,
      },
      {
        name: "MarketResearchLabs",
        description: "Voice-Led Research Automation. Outbound AI calling, segmentation, insights — fully automated.",
        icon: Clipboard,
      },
    ]
  },
  {
    technology: "Data & Analytics Backbone",
    icon: Database,
    color: "secondary",
    ventures: [
      {
        name: "Vriksha Analytics",
        description: "Chat-Based Deep Analytics. Ask questions. Get instant insights. No dashboards. Just conversation.",
        icon: BarChart3,
      },
    ]
  },
  {
    technology: "Image & Video AI",
    icon: Eye,
    color: "accent",
    ventures: [
      {
        name: "iPolice",
        description: "AI Image & Video Monitoring. Automates challan detection, number-plate recognition, and city-level compliance.",
        icon: Camera,
      },
    ]
  },
  {
    technology: "Geo-Satellite & Remote Imaging AI",
    icon: Satellite,
    color: "primary",
    ventures: [
      {
        name: "OneSolar",
        description: "Satellite + AI Solar Intelligence. Unified lead generation, feasibility, and remote solar analysis.",
        icon: Sun,
      },
    ]
  },
  {
    technology: "AI Robotics",
    icon: Bot,
    color: "secondary",
    ventures: [
      {
        name: "AirMingle",
        description: "Hardware + Voice Workflows. A smart badge that captures meetings, summarizes instantly, and triggers actions.",
        icon: BadgeCheck,
      },
    ]
  },
];

const Ventures = () => {
  return (
    <section className="py-20 px-6 bg-background">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <FadeInView className="text-center mb-16 space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="text-primary">Branches of the Vriksha — </span>
            <span className="text-foreground">Built for the Real World</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our ventures are organized around core foundational technologies that power real-world AI applications.
          </p>
        </FadeInView>

        {/* Categories */}
        <div className="space-y-12">
          {ventureCategories.map((category, catIndex) => {
            const CategoryIcon = category.icon;
            const categoryColor = category.color === "primary" ? "text-primary" : category.color === "secondary" ? "text-secondary" : "text-accent";
            const categoryBg = category.color === "primary" ? "bg-primary/10" : category.color === "secondary" ? "bg-secondary/10" : "bg-accent/10";
            const categoryBorder = category.color === "primary" ? "border-primary/20" : category.color === "secondary" ? "border-secondary/20" : "border-accent/20";

            return (
              <FadeInView key={catIndex} delay={catIndex * 0.1}>
                <div className="space-y-6">
                  {/* Category Header */}
                  <div className={`flex items-center gap-4 p-4 rounded-xl ${categoryBg} border ${categoryBorder}`}>
                    <div className={`w-12 h-12 rounded-lg ${categoryBg} flex items-center justify-center`}>
                      <CategoryIcon className={`w-6 h-6 ${categoryColor}`} />
                    </div>
                    <h3 className={`text-xl md:text-2xl font-bold ${categoryColor}`}>
                      {category.technology}
                    </h3>
                  </div>

                  {/* Ventures Grid */}
                  <StaggerContainer 
                    className={`grid grid-cols-1 ${category.ventures.length > 1 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'max-w-md'} gap-6`} 
                    staggerDelay={0.08}
                  >
                    {category.ventures.map((venture, ventureIndex) => {
                      const Icon = venture.icon;
                      
                      return (
                        <StaggerItem key={ventureIndex}>
                          <BentoCard3D className="h-full group">
                            <Card className="relative p-6 bg-card border border-border shadow-card transition-all duration-300 overflow-hidden h-full">
                              <div className="relative space-y-4">
                                <div className={`w-12 h-12 rounded-xl ${categoryBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                  <Icon className={`w-6 h-6 ${categoryColor}`} />
                                </div>

                                <div className="space-y-2">
                                  <h4 className={`text-xl font-bold ${categoryColor}`}>
                                    {venture.name}
                                  </h4>
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {venture.description}
                                  </p>
                                </div>

                                <div className={`h-0.5 w-0 group-hover:w-full transition-all duration-500 rounded-full ${category.color === "primary" ? "bg-primary" : category.color === "secondary" ? "bg-secondary" : "bg-accent"}`} />
                              </div>
                            </Card>
                          </BentoCard3D>
                        </StaggerItem>
                      );
                    })}
                  </StaggerContainer>
                </div>
              </FadeInView>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Ventures;
