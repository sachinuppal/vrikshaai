import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Rocket, TrendingUp, Megaphone, Code, Cloud, CheckCircle, Star, Sparkles } from "lucide-react";
import HubSpotFormModal from "@/components/HubSpotFormModal";
import { FadeInView, SlideInView, StaggerContainer, StaggerItem } from "@/components/animations";

const phase1Allocations = [
  {
    icon: Megaphone,
    label: "Marketing & GTM credits",
    amount: "₹8.25 L",
    percentage: "~33%",
  },
  {
    icon: Code,
    label: "Core tech man-hours (product & engineering)",
    amount: "₹8.25 L",
    percentage: "~33%",
  },
  {
    icon: Cloud,
    label: "AI infrastructure & cloud/compute credits",
    amount: "₹8.25 L",
    percentage: "~33%",
  },
];

const phase2Allocations = [
  {
    icon: Megaphone,
    label: "Market-scale spends & customer acquisition",
  },
  {
    icon: Code,
    label: "Engineering resources & product build-out",
  },
  {
    icon: Cloud,
    label: "Infrastructure, compute, analytics & platform credits",
  },
];

const founderBenefits = [
  {
    icon: Sparkles,
    title: "All-in-One Package",
    description: "Capital + full-stack infrastructure + go-to-market backing in a single package.",
  },
  {
    icon: Rocket,
    title: "Beyond Just a Check",
    description: "You don't just get funding — you get the tools, team, and runway to build, test, scale.",
  },
  {
    icon: TrendingUp,
    title: "Aligned Success",
    description: "We're aligned with you: our success grows only if you scale.",
  },
];

const differentiators = [
  {
    icon: Star,
    title: "Cash + Infra + GTM",
    description: "Many accelerators give only cash — you get cash + infra + GTM support. Reduces friction, risk and time to market.",
  },
  {
    icon: CheckCircle,
    title: "Real Execution Power",
    description: "You get real execution power, not just advisory. We're hands-on partners in the arena.",
  },
  {
    icon: TrendingUp,
    title: "Balanced Investment",
    description: "The evenly-split approach signals our commitment to technology, growth, and infrastructure — equally important for AI-driven startups.",
  },
];

const Accelerator = () => {
  const [showContactModal, setShowContactModal] = useState(false);

  return (
    <section className="py-20 px-6 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <FadeInView className="text-center mb-16 space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="text-primary">Accelerator Funding</span>
            <span className="text-foreground"> & Resource Package</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            <span className="text-secondary font-medium">Co-Build. Co-Grow. Co-Scale.</span>
            <br />
            We're not mentors on the sidelines — we're hands-on partners in the arena.
          </p>
        </FadeInView>

        {/* Funding Phases */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Phase 1 */}
          <SlideInView direction="left">
            <Card className="relative p-8 bg-card border border-border shadow-card hover:shadow-hover transition-all duration-300 h-full overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Rocket className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Phase 1</p>
                    <h3 className="text-2xl font-bold text-primary">₹25 Lakh</h3>
                    <p className="text-foreground font-medium">Startup Kick-Start</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {phase1Allocations.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Icon className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm text-muted-foreground">{item.label}</span>
                            <span className="text-sm font-semibold text-primary whitespace-nowrap">{item.amount}</span>
                          </div>
                          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" style={{ width: '33%' }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </SlideInView>

          {/* Phase 2 */}
          <SlideInView direction="right">
            <Card className="relative p-8 bg-card border border-border shadow-card hover:shadow-hover transition-all duration-300 h-full overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 text-xs font-medium bg-secondary/10 text-secondary rounded-full">Optional</span>
              </div>
              <div className="relative space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center">
                    <TrendingUp className="w-7 h-7 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Phase 2</p>
                    <h3 className="text-2xl font-bold text-secondary">₹50 Lakh</h3>
                    <p className="text-foreground font-medium">Growth Tranche</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground italic border-l-2 border-secondary/30 pl-3">
                  Upon hitting agreed milestones, we inject a larger pool — again split ~33/33/33 across:
                </p>

                <div className="space-y-4">
                  {phase2Allocations.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Icon className="w-5 h-5 text-secondary flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </SlideInView>
        </div>

        {/* What This Means for Founders */}
        <FadeInView className="mb-16">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">
            <span className="text-foreground">What This Means for </span>
            <span className="text-primary">Founders & Partners</span>
          </h3>
          <StaggerContainer className="grid md:grid-cols-3 gap-6">
            {founderBenefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <StaggerItem key={index}>
                  <Card className="group p-6 bg-card border border-border shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1 h-full">
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h4 className="text-lg font-bold text-foreground">{benefit.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                    </div>
                  </Card>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </FadeInView>

        {/* Why This is a Strong Differentiator */}
        <FadeInView className="mb-12">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">
            <span className="text-foreground">Why This is a </span>
            <span className="text-secondary">Strong Differentiator</span>
          </h3>
          <StaggerContainer className="grid md:grid-cols-3 gap-6">
            {differentiators.map((diff, index) => {
              const Icon = diff.icon;
              return (
                <StaggerItem key={index}>
                  <Card className="group p-6 bg-card border border-border shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1 h-full">
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6 text-secondary" />
                      </div>
                      <h4 className="text-lg font-bold text-foreground">{diff.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{diff.description}</p>
                    </div>
                  </Card>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </FadeInView>

        {/* CTA */}
        <FadeInView className="text-center" delay={0.4}>
          <Button 
            size="lg"
            onClick={() => setShowContactModal(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-10 py-6 text-lg rounded-xl transition-all hover:scale-105 hover:shadow-hover"
          >
            Contact Us
          </Button>
        </FadeInView>
      </div>

      <HubSpotFormModal open={showContactModal} onOpenChange={setShowContactModal} />
    </section>
  );
};

export default Accelerator;
