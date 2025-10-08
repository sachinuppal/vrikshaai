import { Card } from "@/components/ui/card";
import { Phone, Users, Sparkles, Network } from "lucide-react";

const ventures = [
  {
    name: "Revenueable.ai",
    description: "The AI Call Center transforming enterprise communication.",
    icon: Phone,
    color: "primary",
  },
  {
    name: "NexoCircle",
    description: "AI-powered social commerce and community platform.",
    icon: Users,
    color: "secondary",
  },
  {
    name: "The Forge",
    description: "Interactive storytelling and IP creation at scale. The Disney of India.",
    icon: Sparkles,
    color: "accent",
  },
  {
    name: "ModelSpine",
    description: "AI model orchestration and interoperability infrastructure.",
    icon: Network,
    color: "primary",
  },
];

const Ventures = () => {
  return (
    <section className="py-20 px-6 bg-background border-t-2 border-primary/20">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16 space-y-6 animate-fade-up">
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="text-primary">Four Branches. </span>
            <span className="text-foreground">One Living Ecosystem.</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Vriksha.ai brings together technologists, marketers, and creators who build scalable, AI-native companies from the ground up.
            <br />
            <span className="text-secondary font-medium">From enterprise automation to creative intelligence</span>, every venture feeds the same mission — to make India the world's AI innovation hub.
          </p>
        </div>

        {/* Ventures Grid */}
        <div className="grid md:grid-cols-2 gap-8">
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
      </div>
    </section>
  );
};

export default Ventures;
