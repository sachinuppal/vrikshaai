import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, Database, Eye, Satellite, Bot, Phone, BarChart3, Headphones, Shield, Users, Clipboard, BadgeCheck, Camera, Sun, ExternalLink } from "lucide-react";
import { FadeInView, StaggerContainer, StaggerItem, BentoCard3D } from "@/components/animations";
import { openVoiceChat } from "@/lib/voiceChat";
import TelecallersModal from "./TelecallersModal";
import SignalBoxModal from "./SignalBoxModal";

type CTAType = 'voice-chat' | 'link' | 'modal-phone' | 'modal-email' | 'coming-soon' | 'feature-link';

interface CTA {
  type: CTAType;
  label: string;
  href?: string;
}

interface Venture {
  name: string;
  description: string;
  icon: typeof Phone;
  cta: CTA;
}

interface VentureCategory {
  technology: string;
  icon: typeof Mic;
  color: string;
  categoryCta?: CTA;
  ventures: Venture[];
}

const ventureCategories: VentureCategory[] = [
  {
    technology: "Voice AI & Conversational Engines",
    icon: Mic,
    color: "primary",
    categoryCta: { type: 'voice-chat', label: "Let's Talk" },
    ventures: [
      {
        name: "Revenueable.ai",
        description: "Performance Marketing led B2B and B2C Growth Engine - Traffic De-Anonymization, Real-time Personalization, Attribution Modeling and Omnichannel workflows: voice, chat, whatsapp, SMS, email — all automated.",
        icon: Phone,
        cta: { type: 'link', label: "Learn more →", href: "https://revenueable.ai" },
      },
      {
        name: "Telecallers.ai",
        description: "High-volume, cloud-native AI voice agents that call, talk, sell — scalable, multilingual, enterprise-grade.",
        icon: Headphones,
        cta: { type: 'modal-phone', label: "Request Voice Pilot" },
      },
      {
        name: "Signal Box",
        description: "Need absolute privacy & compliance? Get on-device or on-prem AI voice stack — ideal for regulated industries, sensitive workflows, compliance-heavy operations.",
        icon: Shield,
        cta: { type: 'modal-email', label: "Share your use case" },
      },
      {
        name: "Vriksha CRM",
        description: "Intelligent CRM that listens, predicts, acts — automates follow-ups, proposals, pipelines, workflows.",
        icon: Users,
        cta: { type: 'feature-link', label: "See CRM Features" },
      },
      {
        name: "MarketResearchLabs",
        description: "Automated outbound surveys, campaign calls, segmentation and analytics — instant market research results at scale.",
        icon: Clipboard,
        cta: { type: 'link', label: "Try Research Demo →", href: "https://marketresearchlabs.ai" },
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
        description: "No dashboards. Just ask. Instant insights from business data — fast, simple, intelligent.",
        icon: BarChart3,
        cta: { type: 'coming-soon', label: "Coming Soon" },
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
        description: "Automated compliance, surveillance, license-plate recognition, real-time video/image analysis for cities, enforcement, infra monitoring.",
        icon: Camera,
        cta: { type: 'coming-soon', label: "Coming Soon" },
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
        description: "Unified remote solar-lead generation + satellite-based feasibility & analysis — ideal for energy, environment, infrastructure sectors.",
        icon: Sun,
        cta: { type: 'link', label: "See more →", href: "https://onesolar.co.in" },
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
        description: "Smart-badge + voice + AI workflows — record meetings, transcribe, auto-summarize, trigger actions. Bridge physical world & AI automation.",
        icon: BadgeCheck,
        cta: { type: 'link', label: "See more →", href: "https://airnexo.co" },
      },
    ]
  },
];

const Ventures = () => {
  const [telecallersModalOpen, setTelecallersModalOpen] = useState(false);
  const [signalBoxModalOpen, setSignalBoxModalOpen] = useState(false);

  const handleCTAClick = (cta: CTA) => {
    switch (cta.type) {
      case 'voice-chat':
        openVoiceChat();
        break;
      case 'link':
        if (cta.href) {
          window.open(cta.href, '_blank', 'noopener,noreferrer');
        }
        break;
      case 'modal-phone':
        setTelecallersModalOpen(true);
        break;
      case 'modal-email':
        setSignalBoxModalOpen(true);
        break;
      case 'feature-link':
        // Placeholder for future feature pages
        console.log('Feature link clicked:', cta.label);
        break;
      case 'coming-soon':
        // No action for coming soon
        break;
    }
  };

  const renderCTA = (cta: CTA, categoryColor: string) => {
    const colorClasses = {
      primary: "bg-primary hover:bg-primary/90 text-primary-foreground",
      secondary: "bg-secondary hover:bg-secondary/90 text-secondary-foreground",
      accent: "bg-accent hover:bg-accent/90 text-accent-foreground",
    };

    if (cta.type === 'coming-soon') {
      return (
        <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30">
          {cta.label}
        </Badge>
      );
    }

    const isExternal = cta.type === 'link';

    return (
      <Button
        size="sm"
        className={`${colorClasses[categoryColor as keyof typeof colorClasses]} gap-1`}
        onClick={() => handleCTAClick(cta)}
      >
        {cta.label}
        {isExternal && <ExternalLink className="w-3 h-3" />}
      </Button>
    );
  };

  return (
    <section className="py-20 px-6 bg-background">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <FadeInView className="text-center mb-16 space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="text-primary">Our Product & </span>
            <span className="text-foreground">AI-Solutions Stack</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Scalable, multilingual voice + chat agents for customer interaction, outreach, support, and sales.
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
                  <div className={`flex items-center justify-between gap-4 p-4 rounded-xl ${categoryBg} border ${categoryBorder}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg ${categoryBg} flex items-center justify-center`}>
                        <CategoryIcon className={`w-6 h-6 ${categoryColor}`} />
                      </div>
                      <h3 className={`text-xl md:text-2xl font-bold ${categoryColor}`}>
                        {category.technology}
                      </h3>
                    </div>
                    {category.categoryCta && (
                      <Button
                        variant="outline"
                        className={`${categoryColor} border-current hover:bg-current/10`}
                        onClick={() => handleCTAClick(category.categoryCta!)}
                      >
                        {category.categoryCta.label}
                      </Button>
                    )}
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
                            <Card className="relative p-6 bg-card border border-border shadow-card transition-all duration-300 overflow-hidden h-full flex flex-col">
                              <div className="relative space-y-4 flex-1 flex flex-col">
                                <div className={`w-12 h-12 rounded-xl ${categoryBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                  <Icon className={`w-6 h-6 ${categoryColor}`} />
                                </div>

                                <div className="space-y-2 flex-1">
                                  <h4 className={`text-xl font-bold ${categoryColor}`}>
                                    {venture.name}
                                  </h4>
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {venture.description}
                                  </p>
                                </div>

                                <div className="pt-4">
                                  {renderCTA(venture.cta, category.color)}
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

      {/* Modals */}
      <TelecallersModal open={telecallersModalOpen} onOpenChange={setTelecallersModalOpen} />
      <SignalBoxModal open={signalBoxModalOpen} onOpenChange={setSignalBoxModalOpen} />
    </section>
  );
};

export default Ventures;
