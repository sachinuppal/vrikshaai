import { Globe, Users, Zap } from "lucide-react";

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
            <span className="text-foreground">India is the Next </span>
            <span className="text-primary">AI Superpower.</span>
          </h2>
          <div className="max-w-3xl mx-auto space-y-4 text-lg text-muted-foreground">
            <p>
              With <span className="text-primary font-semibold">500 million connected citizens</span>, India has the scale, speed, and spirit to lead the AI revolution.
            </p>
            <p>
              Vriksha.ai builds on Jio's digital infrastructure, India's engineering talent, and the world's hunger for scalable innovation.
            </p>
            <p className="text-secondary font-medium text-xl">
              We believe the next global giants in AI will not emerge from Silicon Valley — they'll grow from Indian soil.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-8">
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
      </div>
    </section>
  );
};

export default WhyIndia;
