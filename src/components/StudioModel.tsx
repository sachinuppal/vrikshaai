import { Lightbulb, Rocket, Globe2 } from "lucide-react";

const StudioModel = () => {
  const processes = [
    {
      icon: Lightbulb,
      title: "Co-Create",
      description: "We don't wait for perfect ideas. We co-create with founders, validate with real users, and iterate until product-market fit emerges.",
      color: "primary",
    },
    {
      icon: Rocket,
      title: "Launch Fast",
      description: "Speed is survival. We build MVPs in weeks, not months — testing, learning, and scaling what works while cutting what doesn't.",
      color: "secondary",
    },
    {
      icon: Globe2,
      title: "Scale Globally",
      description: "Born in India, built for the world. Our ventures leverage India's talent and infrastructure to create products that scale globally.",
      color: "accent",
    },
  ];

  return (
    <section className="py-20 px-6 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16 space-y-6 animate-fade-up">
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="text-foreground">We Don't Invest in Startups. </span>
            <br />
            <span className="text-primary">We Grow Them.</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Vriksha.ai operates as a <span className="text-secondary font-semibold">Venture Studio</span> — we don't bet on ideas, we build them.
            <br />
            We provide technology, design, marketing, and go-to-market capabilities under one roof.
            <br />
            <span className="text-foreground font-medium">Every product we build is co-created, tested in real markets, and designed for global scalability.</span>
          </p>
        </div>

        {/* Process Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {processes.map((process, index) => {
            const Icon = process.icon;
            const iconBg = process.color === "primary" ? "bg-primary/10" : process.color === "secondary" ? "bg-secondary/10" : "bg-accent/10";
            const iconColor = process.color === "primary" ? "text-primary" : process.color === "secondary" ? "text-secondary" : "text-accent";

            return (
              <div
                key={index}
                className="group relative p-8 rounded-2xl bg-card border border-border shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="relative space-y-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl ${iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-8 h-8 ${iconColor}`} />
                    </div>
                    <span className={`text-5xl font-bold ${iconColor} opacity-20`}>
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <h3 className={`text-2xl font-bold ${iconColor}`}>
                      {process.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {process.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StudioModel;
