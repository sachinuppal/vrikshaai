import { Sprout, Network, TrendingUp } from "lucide-react";
import { FadeInView, StaggerContainer, StaggerItem } from "@/components/animations";

const Philosophy = () => {
  return (
    <section className="py-20 px-6 bg-background">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <FadeInView className="text-center mb-16 space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="text-primary">Strong Roots. Expanding Branches. </span>
            <span className="text-foreground">Continuous Growth.</span>
          </h2>
          <div className="max-w-3xl mx-auto space-y-4 text-lg text-muted-foreground">
            <p>
              Every thriving system starts with <span className="text-primary font-medium">strong roots</span>.
            </p>
            <p>
              Ours are simple: <span className="text-foreground font-medium">curiosity, collaboration, and creation</span>.
            </p>
            <p>
              From these roots grow ventures that transform industries, empower people, and strengthen India's digital backbone.
            </p>
            <p className="text-xl font-bold text-foreground">
              We don't just invest. We build, grow, and co-own the future.
            </p>
          </div>
        </FadeInView>

        {/* Visual Cards */}
        <StaggerContainer className="grid md:grid-cols-3 gap-8" staggerDelay={0.15}>
          {/* Deep Roots */}
          <StaggerItem>
            <div className="group relative p-8 rounded-2xl bg-card border border-border shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1">
              <div className="relative space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Sprout className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Deep Roots</h3>
                <p className="text-muted-foreground leading-relaxed">
                  A foundation shaped by Indian values — resilient, steady, and purpose-driven.
                </p>
              </div>
            </div>
          </StaggerItem>

          {/* Expanding Branches */}
          <StaggerItem>
            <div className="group relative p-8 rounded-2xl bg-card border border-border shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1">
              <div className="relative space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                  <Network className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Expanding Branches</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Ventures that stretch across sectors and unlock intelligence where it matters.
                </p>
              </div>
            </div>
          </StaggerItem>

          {/* Continuous Growth */}
          <StaggerItem>
            <div className="group relative p-8 rounded-2xl bg-card border border-border shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1">
              <div className="relative space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <TrendingUp className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Continuous Growth</h3>
                <p className="text-muted-foreground leading-relaxed">
                  An evolving ecosystem — always learning, always adapting, always building.
                </p>
              </div>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  );
};

export default Philosophy;
