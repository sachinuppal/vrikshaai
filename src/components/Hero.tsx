import { Button } from "@/components/ui/button";
import AnimatedNeuralTree from "./AnimatedNeuralTree";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Animated Neural Tree Background */}
      <div className="absolute inset-0 opacity-40">
        <AnimatedNeuralTree />
      </div>

      {/* Radial Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-hero" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border-2 border-primary/40 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-secondary animate-glow-intense" />
            <span className="text-sm font-medium text-primary">India's First AI Venture Studio</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="text-foreground">Rooted in India.</span>
            <br />
            <span className="bg-gradient-neural bg-clip-text text-transparent animate-glow-pulse" style={{ backgroundSize: "200% auto" }}>
              Growing the Future of AI.
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Vriksha.ai nurtures bold ideas into global-scale products.
            <br />
            <span className="text-foreground font-medium">Rooted in Indian wisdom, powered by <span className="text-primary">modern intelligence</span>.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary-glow text-primary-foreground font-semibold px-8 py-6 text-lg rounded-lg transition-all hover:scale-105 hover:shadow-intense"
              style={{ boxShadow: "var(--shadow-glow)" }}
            >
              Explore Our Ventures
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold px-8 py-6 text-lg rounded-lg transition-all hover:scale-105 hover:shadow-glow"
            >
              Partner with Us
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary/60 rounded-full flex items-start justify-center p-2" style={{ boxShadow: "var(--shadow-glow)" }}>
            <div className="w-1.5 h-3 bg-primary rounded-full animate-glow-intense" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
