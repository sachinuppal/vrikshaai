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
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 space-y-4 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Four Branches. One Living Ecosystem.
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Vriksha.ai brings together technologists, marketers, and creators who build scalable, 
              AI-native companies from the ground up.
            </p>
            <div className="w-24 h-1 bg-gradient-neural mx-auto rounded-full" />
          </div>

          {/* Ventures Grid */}
          <div className="grid md:grid-cols-2 gap-6 animate-fade-up">
            {ventures.map((venture, index) => {
              const Icon = venture.icon;
              return (
                <Card 
                  key={index}
                  className="group p-8 hover:shadow-elegant transition-all duration-500 hover:scale-105 border-2 hover:border-primary/30 bg-card"
                >
                  <div className="space-y-4">
                    {/* Icon */}
                    <div className={`
                      p-4 rounded-2xl w-fit
                      ${venture.color === 'primary' ? 'bg-primary/10 group-hover:bg-primary/20' : ''}
                      ${venture.color === 'secondary' ? 'bg-secondary/10 group-hover:bg-secondary/20' : ''}
                      ${venture.color === 'accent' ? 'bg-accent/10 group-hover:bg-accent/20' : ''}
                      transition-colors duration-300
                    `}>
                      <Icon className={`
                        w-8 h-8
                        ${venture.color === 'primary' ? 'text-primary' : ''}
                        ${venture.color === 'secondary' ? 'text-secondary' : ''}
                        ${venture.color === 'accent' ? 'text-accent' : ''}
                      `} />
                    </div>

                    {/* Content */}
                    <div>
                      <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                        {venture.name}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {venture.description}
                      </p>
                    </div>

                    {/* Decorative Line */}
                    <div className={`
                      h-1 w-0 group-hover:w-full transition-all duration-500 rounded-full
                      ${venture.color === 'primary' ? 'bg-gradient-primary' : ''}
                      ${venture.color === 'secondary' ? 'bg-secondary' : ''}
                      ${venture.color === 'accent' ? 'bg-gradient-accent' : ''}
                    `} />
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Bottom Text */}
          <div className="text-center mt-12">
            <p className="text-lg text-muted-foreground">
              From enterprise automation to creative intelligence, every venture feeds the same mission — 
              <span className="font-semibold text-foreground"> to make India the world's AI innovation hub.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Ventures;
