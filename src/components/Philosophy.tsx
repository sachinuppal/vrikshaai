import { Sprout, Network, TrendingUp } from "lucide-react";

const Philosophy = () => {
  return (
    <section className="py-20 px-6 bg-background">
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
          <div className="group relative p-8 rounded-2xl bg-card border border-border shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="relative space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Sprout className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Deep Roots</h3>
              <p className="text-muted-foreground leading-relaxed">
                Grounded in timeless values and Indian wisdom — our foundation is strong, resilient, and enduring.
              </p>
            </div>
          </div>

          {/* Expanding Branches */}
          <div className="group relative p-8 rounded-2xl bg-card border border-border shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="relative space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                <Network className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Expanding Branches</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our ventures reach far and wide — each one a neural pathway connecting intelligence to impact.
              </p>
            </div>
          </div>

          {/* Continuous Growth */}
          <div className="group relative p-8 rounded-2xl bg-card border border-border shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="relative space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
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
