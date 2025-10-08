import { Globe, Users, Zap } from "lucide-react";
import neuralPattern from "@/assets/neural-pattern.jpg";

const WhyIndia = () => {
  return (
    <section className="relative py-24 overflow-hidden bg-gradient-hero">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <img 
          src={neuralPattern} 
          alt="Neural network pattern background"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/80" />

      <div className="relative container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 space-y-4 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold">
              <span className="text-foreground">India is the Next </span>
              <span className="bg-gradient-neural bg-clip-text text-transparent">AI Superpower.</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-accent mx-auto rounded-full" />
          </div>

          {/* Main Content */}
          <div className="space-y-8 mb-12 animate-fade-up">
            <p className="text-xl md:text-2xl text-center leading-relaxed max-w-4xl mx-auto">
              With <span className="font-bold text-secondary">500 million connected citizens</span>, 
              India has the scale, speed, and spirit to lead the AI revolution.
            </p>
            
            <p className="text-lg text-center text-muted-foreground max-w-3xl mx-auto">
              Vriksha.ai builds on Jio's digital infrastructure, India's engineering talent, 
              and the world's hunger for scalable innovation.
            </p>

            <p className="text-xl text-center font-semibold text-foreground max-w-3xl mx-auto pt-4">
              We believe the next global giants in AI will not emerge from Silicon Valley — 
              they'll grow from Indian soil.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            {/* Scale */}
            <div className="group p-8 rounded-2xl bg-card/50 backdrop-blur-sm border-2 border-border hover:border-secondary/50 transition-all hover:scale-105 hover:shadow-neural">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 rounded-full bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                  <Globe className="w-8 h-8 text-secondary" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-foreground mb-2">500M+</div>
                  <p className="text-muted-foreground">Connected Citizens</p>
                </div>
              </div>
            </div>

            {/* Talent */}
            <div className="group p-8 rounded-2xl bg-card/50 backdrop-blur-sm border-2 border-border hover:border-primary/50 transition-all hover:scale-105 hover:shadow-glow">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-foreground mb-2">World-Class</div>
                  <p className="text-muted-foreground">Engineering Talent</p>
                </div>
              </div>
            </div>

            {/* Speed */}
            <div className="group p-8 rounded-2xl bg-card/50 backdrop-blur-sm border-2 border-border hover:border-accent/50 transition-all hover:scale-105">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors">
                  <Zap className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-foreground mb-2">Rapid</div>
                  <p className="text-muted-foreground">Digital Infrastructure</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyIndia;
