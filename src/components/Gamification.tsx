import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, Award, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { FadeInView, StaggerContainer, StaggerItem, ScaleInView } from "@/components/animations";
import { openVoiceChat } from "@/lib/voiceChat";

const Gamification = () => {
  const highlights = [
    { icon: Brain, title: "Motivation mapping" },
    { icon: TrendingUp, title: "Progress visibility" },
    { icon: BarChart3, title: "Real-time analytics" },
    { icon: Award, title: "Rewards & recognition" }
  ];

  const stats = [
    { value: "+60%", label: "Engagement", color: "text-primary" },
    { value: "+80%", label: "Retention", color: "text-secondary" },
    { value: "2×", label: "Lifetime Contribution", color: "text-accent" }
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-muted/30">
      <div className="container mx-auto max-w-6xl space-y-12 sm:space-y-16">
        {/* Header */}
        <FadeInView className="text-center space-y-3 sm:space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            <span className="text-primary">Turning Intelligence into Motivation.</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Gamification at Vriksha isn't decoration — it's growth science. Our AI-powered gamification SDK transforms any user journey into a habit loop that boosts retention and lifetime value.
          </p>
        </FadeInView>

        {/* Mini Highlights */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.1}>
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <StaggerItem key={index}>
                <div className="p-6 rounded-2xl bg-card border border-border shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1">
                  <Icon className="w-8 h-8 text-primary mb-3" />
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* Animated Stats */}
        <div className="flex flex-col sm:flex-row gap-8 justify-center items-center py-8">
          {stats.map((stat, index) => (
            <ScaleInView key={index} delay={index * 0.15}>
              <motion.div
                className="text-center p-6 rounded-2xl bg-card border border-border shadow-card hover:scale-105 transition-transform duration-200"
              >
                <div className={`text-5xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                <div className="text-lg text-muted-foreground">{stat.label}</div>
              </motion.div>
            </ScaleInView>
          ))}
        </div>

        {/* Call to Action */}
        <FadeInView className="text-center space-y-6 pt-8 border-t border-border" delay={0.3}>
          <Button
            size="lg"
            onClick={openVoiceChat}
            className="min-h-[48px] bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground hover:scale-105 active:scale-95 transition-all text-base sm:text-lg px-10 py-6 rounded-xl shadow-hover"
          >
            Let's Talk
          </Button>
        </FadeInView>
      </div>
    </section>
  );
};

export default Gamification;
