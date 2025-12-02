import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Brain,
  TrendingUp,
  Award,
  BarChart3,
} from "lucide-react";
import HubSpotFormModal from "@/components/HubSpotFormModal";

const Gamification = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
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

  return (
    <section
      ref={sectionRef}
      className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-muted/30"
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
            className={`text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-700 delay-100 ${
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
                className={`p-6 rounded-2xl bg-card border border-border shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1 ${
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
          <div className="text-center p-6 rounded-2xl bg-card border border-border shadow-card">
            <div className="text-5xl font-bold text-primary mb-2">+60%</div>
            <div className="text-lg text-muted-foreground">Engagement</div>
          </div>
          <div className="text-center p-6 rounded-2xl bg-card border border-border shadow-card">
            <div className="text-5xl font-bold text-secondary mb-2">+80%</div>
            <div className="text-lg text-muted-foreground">Retention</div>
          </div>
          <div className="text-center p-6 rounded-2xl bg-card border border-border shadow-card">
            <div className="text-5xl font-bold text-accent mb-2">×2</div>
            <div className="text-lg text-muted-foreground">LTC</div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center space-y-6 pt-8 border-t border-border">
          <Button
            size="lg"
            onClick={() => setShowContactModal(true)}
            className="min-h-[48px] bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground hover:scale-105 active:scale-95 transition-all text-base sm:text-lg px-10 py-6 rounded-xl shadow-hover"
          >
            Contact Us
          </Button>
        </div>
      </div>

      <HubSpotFormModal open={showContactModal} onOpenChange={setShowContactModal} />
    </section>
  );
};

export default Gamification;
