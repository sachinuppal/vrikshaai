import { useState } from "react";
import { Globe, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import HubSpotFormModal from "@/components/HubSpotFormModal";

const WhyIndia = () => {
  const [showContactModal, setShowContactModal] = useState(false);
  
  const stats = [
    {
      icon: Globe,
      value: "500M+",
      label: "Connected Citizens",
      color: "primary",
    },
    {
      icon: Users,
      value: "World-Class",
      label: "Engineering Talent",
      color: "secondary",
    },
    {
      icon: Zap,
      value: "Rapid",
      label: "Digital Infrastructure",
      color: "accent",
    },
  ];

  return (
    <section className="relative py-20 px-6 bg-background overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{ 
          backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

      <div className="relative container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16 space-y-6 animate-fade-up">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            India's AI Moment
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            India has everything needed to lead the global AI wave:
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const iconColor = stat.color === "primary" ? "text-primary" : stat.color === "secondary" ? "text-secondary" : "text-accent";
            const iconBg = stat.color === "primary" ? "bg-primary/10" : stat.color === "secondary" ? "bg-secondary/10" : "bg-accent/10";
            
            return (
              <div
                key={index}
                className="group relative p-8 rounded-2xl bg-card border border-border shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1 animate-fade-in text-center"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="relative space-y-4">
                  <div className="flex justify-center">
                    <div className={`w-16 h-16 rounded-2xl ${iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-8 h-8 ${iconColor}`} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className={`text-4xl font-bold ${iconColor}`}>{stat.value}</div>
                    <div className="text-foreground font-medium">{stat.label}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Body Text */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <p className="text-xl text-foreground font-medium">
            Vriksha.ai grows on India's strongest roots — and builds branches that reach the world.
          </p>
          <Button 
            size="lg"
            onClick={() => setShowContactModal(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-10 py-6 text-lg rounded-xl transition-all hover:scale-105 hover:shadow-hover"
          >
            Contact Us
          </Button>
        </div>
      </div>

      <HubSpotFormModal open={showContactModal} onOpenChange={setShowContactModal} />
    </section>
  );
};

export default WhyIndia;
