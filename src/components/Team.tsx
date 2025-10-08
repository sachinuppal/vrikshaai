import { Award, Code, TrendingUp } from "lucide-react";

const Team = () => {
  return (
    <section className="py-20 px-6 bg-background border-t-2 border-primary/20">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 space-y-4 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Founders Who've Built Before.
            </h2>
            <div className="w-24 h-1 bg-gradient-neural mx-auto rounded-full" />
          </div>

          {/* Main Content */}
          <div className="space-y-8 mb-16 animate-fade-up">
            <p className="text-xl text-center leading-relaxed max-w-3xl mx-auto">
              Vriksha.ai is led by a team that has scaled businesses from 
              <span className="font-bold text-primary"> zero to millions of users</span> and 
              <span className="font-bold text-secondary"> multi-billion-dollar valuations</span> — 
              across gaming, community, and AI.
            </p>
            
            <p className="text-lg text-center font-medium text-foreground max-w-3xl mx-auto">
              We're builders, not consultants.
            </p>

            <p className="text-xl text-center text-muted-foreground max-w-3xl mx-auto">
              We've done it before, and we're doing it again — this time for India's AI era.
            </p>
          </div>

          {/* Expertise Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Experience */}
            <div className="group p-8 rounded-lg bg-card border-2 border-primary/30 hover:border-primary transition-all hover:scale-105" style={{ boxShadow: "0 0 0 hsl(var(--primary) / 0)" }}>
              <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ boxShadow: "0 0 30px hsl(var(--primary) / 0.5)" }} />
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-primary/10 w-fit group-hover:bg-primary/20 transition-colors">
                  <Award className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Proven Track Record</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Multi-billion dollar valuations and millions of engaged users across previous ventures.
                </p>
              </div>
            </div>

            {/* Technical */}
            <div className="group p-8 rounded-2xl bg-card border-2 border-border hover:border-secondary/40 transition-all hover:scale-105 hover:shadow-neural">
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-secondary/10 w-fit group-hover:bg-secondary/20 transition-colors">
                  <Code className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Deep Technical Expertise</h3>
                <p className="text-muted-foreground leading-relaxed">
                  World-class engineering teams building cutting-edge AI and scalable infrastructure.
                </p>
              </div>
            </div>

            {/* Growth */}
            <div className="group p-8 rounded-2xl bg-card border-2 border-border hover:border-accent/40 transition-all hover:scale-105">
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-accent/10 w-fit group-hover:bg-accent/20 transition-colors">
                  <TrendingUp className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Growth at Scale</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Expertise in community building, marketing, and scaling products to global markets.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Team;
