import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DollarSign, TrendingUp, Network, Zap } from "lucide-react";

const features = [
  {
    title: "Capital + Capability",
    description: "Funding combined with in-house tech, design, and GTM.",
    icon: DollarSign,
    color: "primary",
  },
  {
    title: "Shared Growth Model",
    description: "We co-participate in outcomes — our success grows with yours.",
    icon: TrendingUp,
    color: "secondary",
  },
  {
    title: "AI Infrastructure",
    description: "Access to Vriksha's APIs, Voice AI stack, and analytics engine.",
    icon: Zap,
    color: "accent",
  },
  {
    title: "Distribution Power",
    description: "Network across BFSI, Retail, Manufacturing, Energy, and Government.",
    icon: Network,
    color: "primary",
  },
];

const Accelerator = () => {
  return (
    <section className="py-20 px-6 bg-background border-t-2 border-primary/20">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16 space-y-6 animate-fade-up">
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="text-primary">The Vriksha Accelerator — </span>
            <span className="text-foreground">Co-Build. Co-Grow. Co-Scale.</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We're more than mentors — we're hands-on co-founders.
            <br />
            Our accelerator partners with visionary teams to create <span className="text-secondary font-medium">real traction</span>, not pitch decks.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colorClass = feature.color === "primary" ? "border-primary/40 hover:border-primary" : feature.color === "secondary" ? "border-secondary/40 hover:border-secondary" : "border-accent/40 hover:border-accent";
            const iconBg = feature.color === "primary" ? "bg-primary/20" : feature.color === "secondary" ? "bg-secondary/20" : "bg-accent/20";
            const iconColor = feature.color === "primary" ? "text-primary" : feature.color === "secondary" ? "text-secondary" : "text-accent";
            const shadowColor = feature.color === "primary" ? "0 0 30px hsl(var(--primary) / 0.4)" : feature.color === "secondary" ? "0 0 30px hsl(var(--secondary) / 0.4)" : "0 0 30px hsl(var(--accent) / 0.4)";
            
            return (
              <Card
                key={index}
                className={`group relative p-8 bg-card border-2 ${colorClass} transition-all hover:scale-105 animate-fade-in`}
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
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
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
            className="bg-primary hover:bg-primary-glow text-primary-foreground font-semibold px-8 py-6 text-lg rounded-lg transition-all hover:scale-105"
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            Apply to Accelerator
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Accelerator;
