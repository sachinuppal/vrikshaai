import { Sprout, Network, TrendingUp } from "lucide-react";

const Philosophy = () => {
  return (
    <section className="py-20 px-6 bg-background border-t-2 border-primary/20">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16 space-y-6 animate-fade-up">
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="text-primary">Strong Roots. Expanding Branches. </span>
            <span className="text-foreground">Continuous Growth.</span>
          </h2>
          <div className="max-w-3xl mx-auto space-y-4 text-lg text-muted-foreground">
            <p>
              Every tree grows because it's <span className="text-primary font-medium">rooted deeply</span>.
            </p>
            <p>
              At Vriksha.ai, our roots are values that have endured — <span className="text-foreground font-medium">curiosity, collaboration, and creation</span>.
            </p>
            <p>
              Our branches are AI ventures that redefine industries, empower people, and strengthen India's digital foundation.
            </p>
            <p className="text-xl font-bold text-foreground">
              We don't just invest. We build, grow, and co-own the future.
            </p>
          </div>
        </div>

        {/* Visual Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Deep Roots */}
          <div className="group relative p-8 rounded-lg bg-card border-2 border-primary/30 hover:border-primary transition-all hover:scale-105 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ boxShadow: "0 0 30px hsl(var(--primary) / 0.5)" }} />
            <div className="relative space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center group-hover:animate-glow-intense">
                <Sprout className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Deep Roots</h3>
              <p className="text-muted-foreground leading-relaxed">
                Grounded in timeless values and Indian wisdom — our foundation is strong, resilient, and enduring.
              </p>
            </div>
          </div>

          {/* Expanding Branches */}
          <div className="group relative p-8 rounded-lg bg-card border-2 border-secondary/30 hover:border-secondary transition-all hover:scale-105 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ boxShadow: "0 0 30px hsl(var(--secondary) / 0.5)" }} />
            <div className="relative space-y-4">
              <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center group-hover:animate-glow-intense">
                <Network className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Expanding Branches</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our ventures reach far and wide — each one a neural pathway connecting intelligence to impact.
              </p>
            </div>
          </div>

          {/* Continuous Growth */}
          <div className="group relative p-8 rounded-lg bg-card border-2 border-accent/30 hover:border-accent transition-all hover:scale-105 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ boxShadow: "0 0 30px hsl(var(--accent) / 0.5)" }} />
            <div className="relative space-y-4">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center group-hover:animate-glow-intense">
                <TrendingUp className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Continuous Growth</h3>
              <p className="text-muted-foreground leading-relaxed">
                We evolve, learn, and adapt — just like nature, our ecosystem thrives through constant innovation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Philosophy;
