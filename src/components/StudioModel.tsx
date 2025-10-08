import { Lightbulb, Rocket, Globe2 } from "lucide-react";

const StudioModel = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 space-y-4 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              We Don't Invest in Startups. We Grow Them.
            </h2>
            <div className="w-24 h-1 bg-gradient-primary mx-auto rounded-full" />
          </div>

          {/* Main Content */}
          <div className="space-y-8 mb-16 animate-fade-up">
            <p className="text-xl text-center leading-relaxed max-w-3xl mx-auto">
              Vriksha.ai operates as a <span className="font-bold text-primary">Venture Studio</span> — we don't bet on ideas, we build them.
            </p>
            
            <p className="text-lg text-center text-muted-foreground max-w-3xl mx-auto">
              We provide technology, design, marketing, and go-to-market capabilities under one roof.
            </p>

            <p className="text-lg text-center font-medium text-foreground max-w-3xl mx-auto">
              Every product we build is co-created, tested in real markets, and designed for global scalability.
            </p>
          </div>

          {/* Process Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Ideate */}
            <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-accent/5 to-accent/10 border-2 border-accent/20 hover:border-accent/40 transition-all hover:scale-105 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
              
              <div className="relative space-y-4">
                <div className="w-fit p-4 rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors">
                  <Lightbulb className="w-8 h-8 text-accent" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-foreground">Co-Create</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    From concept to prototype, we work alongside founders to validate and refine ideas with real market feedback.
                  </p>
                </div>
              </div>
            </div>

            {/* Build */}
            <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 hover:border-primary/40 transition-all hover:scale-105 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
              
              <div className="relative space-y-4">
                <div className="w-fit p-4 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Rocket className="w-8 h-8 text-primary" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-foreground">Launch Fast</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Full-stack capabilities in tech, design, and marketing ensure rapid go-to-market execution without compromises.
                  </p>
                </div>
              </div>
            </div>

            {/* Scale */}
            <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-secondary/5 to-secondary/10 border-2 border-secondary/20 hover:border-secondary/40 transition-all hover:scale-105 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
              
              <div className="relative space-y-4">
                <div className="w-fit p-4 rounded-xl bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                  <Globe2 className="w-8 h-8 text-secondary" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-foreground">Scale Globally</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Built for millions from day one. Our products are designed to grow from India to the world.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StudioModel;
