import { Sprout, Network, TrendingUp } from "lucide-react";

const Philosophy = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 space-y-4 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Strong Roots. Expanding Branches.
            </h2>
            <div className="w-24 h-1 bg-gradient-accent mx-auto rounded-full" />
          </div>

          {/* Main Content */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            {/* Left: Text */}
            <div className="space-y-6 animate-fade-up">
              <p className="text-lg text-muted-foreground leading-relaxed">
                A tree stands because its roots go deep.
              </p>
              <p className="text-lg leading-relaxed">
                At <span className="font-semibold text-primary">Vriksha.ai</span>, our roots are values that have stood the test of time — 
                <span className="font-medium text-accent"> curiosity, collaboration, and creation</span>.
              </p>
              <p className="text-lg leading-relaxed">
                Our branches are the ventures we grow: AI products that redefine industries, empower people, 
                and strengthen India's digital foundation.
              </p>
              <p className="text-lg text-foreground font-medium">
                Each idea we plant is designed to grow — powered by technology, guided by purpose.
              </p>
            </div>

            {/* Right: Visual Elements */}
            <div className="grid grid-cols-1 gap-6">
              {/* Roots */}
              <div className="group p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 hover:border-primary/40 transition-all hover:scale-105 hover:shadow-glow">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Sprout className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2 text-foreground">Deep Roots</h3>
                    <p className="text-muted-foreground">Values of curiosity, collaboration, and creation anchoring everything we build.</p>
                  </div>
                </div>
              </div>

              {/* Branches */}
              <div className="group p-6 rounded-2xl bg-gradient-to-br from-secondary/5 to-secondary/10 border border-secondary/20 hover:border-secondary/40 transition-all hover:scale-105 hover:shadow-neural">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                    <Network className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2 text-foreground">Expanding Branches</h3>
                    <p className="text-muted-foreground">AI ventures reaching across industries, empowering millions globally.</p>
                  </div>
                </div>
              </div>

              {/* Growth */}
              <div className="group p-6 rounded-2xl bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20 hover:border-accent/40 transition-all hover:scale-105">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors">
                    <TrendingUp className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2 text-foreground">Continuous Growth</h3>
                    <p className="text-muted-foreground">Every idea designed to scale, powered by technology, guided by purpose.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Philosophy;
