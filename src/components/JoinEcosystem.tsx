import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const JoinEcosystem = () => {
  return (
    <section className="relative py-32 overflow-hidden bg-background border-t-2 border-primary/20">

      <div className="relative container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-up">
          {/* Header */}
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-bold">
              <span className="text-foreground">Let's Grow </span>
              <span className="bg-gradient-neural bg-clip-text text-transparent">Together.</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-accent mx-auto rounded-full" />
          </div>

          {/* Description */}
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Whether you're a founder, developer, enterprise, or investor, Vriksha.ai is an open ecosystem designed for collaboration.
          </p>

          <p className="text-lg text-foreground font-medium max-w-3xl mx-auto">
            Together, we'll plant the next generation of AI ventures — rooted in India, scaling to the world.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button 
              size="lg" 
              className="group bg-primary hover:bg-primary-glow text-primary-foreground font-semibold px-8 py-6 text-lg rounded-xl shadow-glow transition-all hover:scale-105"
            >
              Join the Accelerator
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="group border-2 border-secondary/30 hover:border-secondary hover:bg-secondary/10 font-semibold px-8 py-6 text-lg rounded-xl backdrop-blur-sm transition-all hover:scale-105"
            >
              Integrate Our SDKs
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="ghost"
              className="group text-secondary hover:bg-secondary/10 font-semibold px-8 py-6 text-lg rounded-xl transition-all hover:scale-105"
            >
              Talk to Vriksha 🌳
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Roles */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {['Developers', 'Founders', 'Enterprises', 'Investors'].map((role, index) => (
              <div 
                key={index}
                className="p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border hover:border-primary/40 transition-all hover:scale-105"
              >
                <p className="font-semibold text-foreground">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default JoinEcosystem;
