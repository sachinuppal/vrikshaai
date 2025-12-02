import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DollarSign, TrendingUp, Network, Zap } from "lucide-react";
import HubSpotFormModal from "@/components/HubSpotFormModal";
import { FadeInView, SlideInView } from "@/components/animations";

const features = [
  {
    title: "Capital + Capability",
    description: "Funding paired with engineering, design, and GTM muscle.",
    icon: DollarSign,
    color: "primary",
  },
  {
    title: "Shared Growth Model",
    description: "Our success grows only when yours does.",
    icon: TrendingUp,
    color: "secondary",
  },
  {
    title: "AI Infrastructure",
    description: "Access to Vriksha's APIs, Voice AI, CRM, analytics, and data tooling.",
    icon: Zap,
    color: "accent",
  },
  {
    title: "Distribution Power",
    description: "Reach across BFSI, Retail, Energy, Manufacturing, and Government ecosystems.",
    icon: Network,
    color: "primary",
  },
];

const Accelerator = () => {
  const [showContactModal, setShowContactModal] = useState(false);

  return (
    <section className="py-20 px-6 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <FadeInView className="text-center mb-16 space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="text-primary">The Vriksha Accelerator — </span>
            <span className="text-foreground">Co-Build. Co-Grow. Co-Scale.</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We're not mentors on the sidelines.
            <br />
            We're <span className="text-secondary font-medium">hands-on partners</span> in the arena.
          </p>
        </FadeInView>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const iconBg = feature.color === "primary" ? "bg-primary/10" : feature.color === "secondary" ? "bg-secondary/10" : "bg-accent/10";
            const iconColor = feature.color === "primary" ? "text-primary" : feature.color === "secondary" ? "text-secondary" : "text-accent";
            
            return (
              <SlideInView
                key={index}
                direction={index % 2 === 0 ? "left" : "right"}
                delay={index * 0.1}
              >
                <Card className="group relative p-8 bg-card border border-border shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1">
                  <div className="relative space-y-4">
                    <div className={`w-14 h-14 rounded-xl ${iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-7 h-7 ${iconColor}`} />
                    </div>

                    <div className="space-y-2">
                      <h3 className={`text-2xl font-bold ${iconColor}`}>
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>

                    <div className={`h-1 w-0 group-hover:w-full transition-all duration-500 rounded-full ${iconColor === "text-primary" ? "bg-primary" : iconColor === "text-secondary" ? "bg-secondary" : "bg-accent"}`} />
                  </div>
                </Card>
              </SlideInView>
            );
          })}
        </div>

        {/* CTA */}
        <FadeInView className="text-center" delay={0.4}>
          <Button 
            size="lg"
            onClick={() => setShowContactModal(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-10 py-6 text-lg rounded-xl transition-all hover:scale-105 hover:shadow-hover"
          >
            Contact Us
          </Button>
        </FadeInView>
      </div>

      <HubSpotFormModal open={showContactModal} onOpenChange={setShowContactModal} />
    </section>
  );
};

export default Accelerator;
