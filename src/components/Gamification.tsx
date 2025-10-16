import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Gamepad2,
  Heart,
  TrendingUp,
  Target,
  Users,
  Award,
  Puzzle,
  Package,
  Brain,
  BarChart3,
  Link,
  Code2,
  PlayCircle,
  Sparkles,
} from "lucide-react";

const Gamification = () => {
  const [showReward, setShowReward] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleExperienceGrowth = () => {
    setShowReward(true);
    setTimeout(() => setShowReward(false), 3000);
  };

  const principles = [
    {
      emoji: "🌱",
      title: "Intrinsic Motivation",
      subtitle: "Growth must feel meaningful.",
      description: "We use AI-driven personalization to create experiences aligned with what users want to become, not just what they do.",
      icon: Heart,
      color: "primary",
    },
    {
      emoji: "🌿",
      title: "Progress Visibility",
      subtitle: "People grow when they see their evolution.",
      description: "We design feedback loops — dashboards, streaks, milestones — powered by real-time data APIs.",
      icon: TrendingUp,
      color: "secondary",
    },
    {
      emoji: "🌾",
      title: "Challenge and Mastery",
      subtitle: "Growth happens through tension and triumph.",
      description: "Our system dynamically adjusts difficulty using reinforcement learning — creating just the right level of challenge to sustain engagement.",
      icon: Target,
      color: "accent",
    },
    {
      emoji: "🍃",
      title: "Social Connection",
      subtitle: "Trees don't grow alone.",
      description: "We embed social graphs and team-based goals, rewarding collaboration and community engagement.",
      icon: Users,
      color: "primary",
    },
    {
      emoji: "🌸",
      title: "Rewards and Recognition",
      subtitle: "Recognition reinforces behavior.",
      description: "Our SDK enables tiered reward systems — badges, reputation points, or even tokenized incentives — seamlessly integrated into your product.",
      icon: Award,
      color: "secondary",
    },
  ];

  const capabilities = [
    {
      emoji: "🧩",
      title: "Gamify any user flow",
      description: "signups, learning modules, purchases, community participation",
      icon: Puzzle,
    },
    {
      emoji: "⚙️",
      title: "Plug-and-play SDKs",
      description: "for Web, Android, iOS, and React-based apps",
      icon: Package,
    },
    {
      emoji: "🧠",
      title: "AI-powered personalization",
      description: "adapts rewards and challenges to user behavior",
      icon: Brain,
    },
    {
      emoji: "📈",
      title: "Analytics layer",
      description: "track engagement, retention, and LTC with dashboards",
      icon: BarChart3,
    },
    {
      emoji: "🔗",
      title: "Compatible integrations",
      description: "HubSpot, Intercom, Segment, Mixpanel, or in-house systems",
      icon: Link,
    },
  ];

  const metrics = [
    {
      metric: "Acquisition",
      impact: "+25–60% through engagement-based referrals and rewards",
    },
    {
      metric: "Retention",
      impact: "+40–80% through habit loops and progression systems",
    },
    {
      metric: "LTC (Lifetime Contribution)",
      impact: "+2–3x uplift via reactivation, loyalty, and up-sell incentives",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-20 px-6 bg-background border-t-2 border-primary/20"
    >
      <div className="container mx-auto max-w-6xl space-y-16">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 mb-4">
            <Gamepad2 className="w-10 h-10 text-primary" />
            <h2
              className={`text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent transition-all duration-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              Gamification as a Growth Engine
            </h2>
          </div>
          <p
            className={`text-xl text-muted-foreground transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Turning Intelligence into Motivation
          </p>
        </div>

        {/* Context Section */}
        <div
          className={`max-w-4xl mx-auto space-y-4 text-lg leading-relaxed transition-all duration-700 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <p>
            Gamification isn't about points or badges. It's about designing
            systems that <span className="text-primary font-semibold">feel alive</span> — systems that respond to users,
            reward progress, and build long-term relationships.
          </p>
          <p>
            At Vriksha.ai, we've built a gamification layer that plugs into any
            digital experience — transforming ordinary interactions into
            self-reinforcing <span className="text-secondary font-semibold">growth loops</span>.
          </p>
          <p>
            We believe the next era of growth won't come from ads or incentives
            — it will come from{" "}
            <span className="text-primary font-bold">motivation architecture</span>.
          </p>
        </div>

        {/* Core Principles Grid */}
        <div>
          <h3 className="text-3xl font-bold text-center mb-8">
            Core Principles of Gamification
            <span className="block text-lg text-muted-foreground mt-2 font-normal">
              The Vriksha.ai Framework
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {principles.map((principle, index) => {
              const Icon = principle.icon;
              return (
                <div
                  key={index}
                  className={`p-8 rounded-lg bg-card border-2 border-${principle.color}/40 hover:border-${principle.color} transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                  style={{
                    transitionDelay: `${300 + index * 100}ms`,
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-full bg-${principle.color}/20`}>
                      <Icon className={`w-8 h-8 text-${principle.color}`} />
                    </div>
                    <span className="text-3xl">{principle.emoji}</span>
                  </div>
                  <h4 className="text-xl font-bold mb-2">{principle.title}</h4>
                  <p className="text-sm text-muted-foreground font-medium mb-3">
                    {principle.subtitle}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {principle.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Visual Data-Tree Animation */}
        <div className="relative w-full max-w-3xl mx-auto">
          <svg viewBox="0 0 600 600" className="w-full h-full">
            {/* Central core with intense glow */}
            <defs>
              <radialGradient id="coreGlow">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="1" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              </radialGradient>
            </defs>
            
            <circle
              cx="300"
              cy="300"
              r="40"
              fill="url(#coreGlow)"
              className="animate-glow-intense"
            />

            {/* 5 concentric rings - one for each principle */}
            {[80, 140, 200, 260, 320].map((radius, i) => (
              <g key={i}>
                <circle
                  cx="300"
                  cy="300"
                  r={radius}
                  className="fill-none stroke-primary/30 animate-glow-pulse"
                  strokeWidth="3"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
                <text
                  x="300"
                  y={300 - radius - 15}
                  className="text-xs fill-primary font-medium"
                  textAnchor="middle"
                >
                  {["Motivation", "Progress", "Mastery", "Connection", "Rewards"][i]}
                </text>
                <circle
                  cx={300 + radius * Math.cos((i * 72 * Math.PI) / 180)}
                  cy={300 + radius * Math.sin((i * 72 * Math.PI) / 180)}
                  r="6"
                  className="fill-secondary animate-electric-pulse"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              </g>
            ))}
          </svg>

          {/* Floating metric badges */}
          <div className="absolute top-10 right-10 bg-card/90 backdrop-blur p-3 rounded-lg border border-primary/30 animate-fade-in">
            <div className="text-2xl font-bold text-primary">+60%</div>
            <div className="text-xs text-muted-foreground">Engagement</div>
          </div>
          <div className="absolute bottom-20 left-10 bg-card/90 backdrop-blur p-3 rounded-lg border border-secondary/30 animate-fade-in delay-200">
            <div className="text-2xl font-bold text-secondary">+80%</div>
            <div className="text-xs text-muted-foreground">Retention</div>
          </div>
        </div>

        {/* Technology & APIs Section */}
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h3 className="text-3xl font-bold">
              Seamless Integration. Infinite Engagement.
            </h3>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              The <span className="text-primary font-semibold">Vriksha Gamification API</span> is
              built to integrate with your existing website or app — in minutes.
              It turns every customer journey into a live growth experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {capabilities.map((capability, index) => {
              const Icon = capability.icon;
              return (
                <div
                  key={index}
                  className="p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold mb-1 flex items-center gap-2">
                        <span>{capability.emoji}</span>
                        {capability.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {capability.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Business Outcomes Section */}
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h3 className="text-3xl font-bold">Measured Growth. Real ROI.</h3>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Gamification is not decoration — it's a{" "}
              <span className="text-primary font-semibold">performance engine</span>. Our clients see{" "}
              <span className="text-secondary font-semibold">measurable improvement</span> across all
              key growth metrics.
            </p>
          </div>

          {/* Metrics Table - Desktop */}
          <div className="hidden md:block overflow-hidden rounded-lg border border-primary/20">
            <table className="w-full">
              <thead>
                <tr className="bg-primary/10 border-b border-primary/20">
                  <th className="text-left p-4 font-bold text-lg">Metric</th>
                  <th className="text-left p-4 font-bold text-lg">Impact</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b border-primary/10 hover:bg-card/50 transition-colors"
                  >
                    <td className="p-4 text-primary font-bold">{row.metric}</td>
                    <td className="p-4 text-foreground">{row.impact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Metrics Cards - Mobile */}
          <div className="md:hidden space-y-4">
            {metrics.map((row, index) => (
              <div
                key={index}
                className="p-6 rounded-lg bg-card border border-primary/20"
              >
                <div className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary font-bold text-sm mb-3">
                  {row.metric}
                </div>
                <p className="text-foreground">{row.impact}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-muted-foreground italic">
            These outcomes aren't hypothetical — they're coded into our{" "}
            <span className="text-primary font-semibold">growth architecture</span>.
          </p>
        </div>

        {/* Interactive Widget */}
        <div className="text-center space-y-8">
          <Button
            size="lg"
            onClick={handleExperienceGrowth}
            className="bg-gradient-to-r from-primary to-secondary hover:scale-110 transition-transform text-lg px-8 py-6"
          >
            <Sparkles className="mr-2" />
            Experience Growth
          </Button>

          {showReward && (
            <div className="p-8 bg-card border-2 border-primary rounded-lg animate-scale-in relative overflow-hidden">
              <Award className="w-16 h-16 text-primary mx-auto animate-bounce" />
              <h3 className="text-2xl font-bold mt-4">Achievement Unlocked!</h3>
              <p className="text-muted-foreground">+100 XP • Growth Badge Earned</p>
              
              {/* Confetti particles */}
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full animate-[confetti_1s_ease-out_forwards]"
                  style={{
                    left: "50%",
                    top: "50%",
                    backgroundColor: i % 3 === 0 ? "hsl(var(--primary))" : i % 3 === 1 ? "hsl(var(--secondary))" : "hsl(var(--accent))",
                    animationDelay: `${i * 0.05}s`,
                    transform: `rotate(${i * 18}deg) translateY(-${50 + i * 10}px)`,
                    opacity: 0,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-8 pt-8 border-t-2 border-primary/20">
          <blockquote className="text-2xl md:text-3xl font-medium italic border-l-4 border-primary pl-6 py-2 inline-block">
            "Gamification is not a layer on top of growth — it{" "}
            <span className="text-primary font-bold">is</span> growth."
          </blockquote>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-2xl transition-all text-lg px-8"
            >
              <Code2 className="mr-2" />
              Explore Vriksha APIs
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-background transition-all text-lg px-8"
            >
              <PlayCircle className="mr-2" />
              Request a Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Gamification;
