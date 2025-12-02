import { Globe, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const WhyIndia = () => {
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
    <section className="relative py-20 px-6 bg-background border-t-2 border-primary/20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{ 
          backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

      <div className="relative container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16 space-y-6 animate-fade-up">
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="text-primary">India's Moment in AI </span>
            <span className="text-foreground">Has Arrived.</span>
          </h2>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const colorClass = stat.color === "primary" ? "border-primary/40 hover:border-primary text-primary" : stat.color === "secondary" ? "border-secondary/40 hover:border-secondary text-secondary" : "border-accent/40 hover:border-accent text-accent";
            const shadowColor = stat.color === "primary" ? "0 0 40px hsl(var(--primary) / 0.5)" : stat.color === "secondary" ? "0 0 40px hsl(var(--secondary) / 0.5)" : "0 0 40px hsl(var(--accent) / 0.5)";
            
            return (
              <div
                key={index}
                className={`group relative p-8 rounded-lg bg-card border-2 ${colorClass} transition-all hover:scale-110 animate-fade-in text-center`}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div 
                  className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" 
                  style={{ boxShadow: shadowColor }}
                />
                
                <div className="relative space-y-4">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-card border-2 border-current flex items-center justify-center group-hover:animate-glow-intense">
                      <Icon className="w-8 h-8" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-4xl font-bold">{stat.value}</div>
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
            Vriksha.ai stands on India's strongest roots — and builds branches that reach the world.
          </p>
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary-glow text-primary-foreground font-semibold px-8 py-6 text-lg rounded-lg transition-all hover:scale-105"
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            Partner with Us
          </Button>
        </div>
      </div>
    </section>
  );
};

export default WhyIndia;
