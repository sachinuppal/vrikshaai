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
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const checkMobile = () => window.innerWidth < 640;
    setIsMobile(checkMobile());

    const handleResize = () => setIsMobile(checkMobile());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-background border-t-2 border-primary/20"
    >
      <div className="container mx-auto max-w-6xl space-y-12 sm:space-y-16">
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4">
          <h2
            className={`text-3xl sm:text-4xl md:text-5xl font-bold transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <span className="text-primary">Turning Intelligence into Motivation.</span>
          </h2>
          <p
            className={`text-lg sm:text-xl text-muted-foreground transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Gamification at Vriksha.ai isn't cosmetic — it's core architecture. Our AI-powered gamification SDK transforms every digital experience into a growth loop — improving acquisition, retention, and lifetime contribution (LTC).
          </p>
        </div>

        {/* Mini Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Brain, title: "AI-driven motivation mapping" },
            { icon: TrendingUp, title: "Progress visibility and habit loops" },
            { icon: BarChart3, title: "Real-time performance analytics" },
            { icon: Award, title: "Reward & recognition systems" }
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className={`p-6 rounded-lg bg-card border-2 border-primary/20 hover:border-primary transition-all duration-300 hover:scale-105 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: `${300 + index * 100}ms` }}
              >
                <Icon className="w-8 h-8 text-primary mb-3" />
                <p className="text-sm font-medium text-foreground">{item.title}</p>
              </div>
            );
          })}
        </div>

        {/* Animated Stats */}
        <div className="flex flex-col sm:flex-row gap-8 justify-center items-center py-8">
          <div className="text-center">
            <div className="text-5xl font-bold text-primary mb-2">+60%</div>
            <div className="text-lg text-muted-foreground">Engagement</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-secondary mb-2">+80%</div>
            <div className="text-lg text-muted-foreground">Retention</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-accent mb-2">×2</div>
            <div className="text-lg text-muted-foreground">LTC</div>
          </div>
        </div>


        {/* Call to Action */}
        <div className="text-center space-y-6 pt-8 border-t-2 border-primary/20">
          <Button
            size="lg"
            className="min-h-[44px] bg-gradient-to-r from-primary to-secondary hover:scale-110 active:scale-95 transition-transform text-base sm:text-lg px-8 py-6"
          >
            <PlayCircle className="mr-2 w-5 h-5" />
            See Gamification Demo ▶
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Gamification;
