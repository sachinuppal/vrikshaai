import { Mic, Eye, Satellite, Database, Leaf, Zap, Clock, Shield, Bot } from "lucide-react";
import { FadeInView, StaggerContainer, StaggerItem } from "@/components/animations";

const technologies = [
  {
    icon: Mic,
    title: "Voice AI & Conversational Engines",
    description: "Cloud and on-device voice agents, multilingual speech recognition and natural language understanding."
  },
  {
    icon: Eye,
    title: "Image & Video AI",
    description: "Secure computer-vision pipelines, video analytics, object detection and automated insights."
  },
  {
    icon: Satellite,
    title: "Geo-Satellite & Remote Imaging AI",
    description: "Scalable satellite/remote-sensing pipelines for land, energy, environment, and infrastructure analysis."
  },
  {
    icon: Bot,
    title: "AI Robotics",
    description: "Intelligent robotics systems, autonomous navigation, robotic process automation, and AI-powered physical automation solutions."
  },
  {
    icon: Database,
    title: "Data & Analytics Backbone",
    description: "End-to-end data pipelines, unified analytics, real-time dashboards, and decision systems."
  },
  {
    icon: Leaf,
    title: "Sustainability-First Approach",
    description: "Designed for low-footprint deployment, efficient compute, and tools that help in environment, energy, and resource-management use cases."
  }
];

const benefits = [
  { icon: Zap, text: "Faster time-to-market" },
  { icon: Shield, text: "Lower cost of ownership" },
  { icon: Clock, text: "Higher trust & long-term scalability" }
];

const AIInfrastructure = () => {
  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <FadeInView className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Our AI Infrastructure & <span className="text-primary">Sustainability Commitment</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto">
            We build the foundational technologies that power tomorrow's AI solutions — while prioritizing sustainability and real-world responsibility.
          </p>
        </FadeInView>

        {/* Technology Cards */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {technologies.map((tech, index) => (
            <StaggerItem key={index}>
              <div className="bg-card rounded-2xl p-6 h-full border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <tech.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{tech.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{tech.description}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Why it matters */}
        <FadeInView delay={0.3}>
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl p-8 md:p-12 border border-primary/20">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Why it matters
            </h3>
            <p className="text-muted-foreground text-lg mb-8 max-w-4xl">
              Enterprises, governments, and large-scale projects often struggle building reliable, compliant, scalable AI infrastructure from scratch. We deliver ready-to-go AI building blocks — saving you time, cost, and compliance headache — while embedding sustainability at the core.
            </p>
            
            {/* Benefits */}
            <div className="flex flex-wrap gap-4">
              {benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-full px-5 py-2.5 border border-border/50"
                >
                  <benefit.icon className="w-5 h-5 text-primary" />
                  <span className="text-foreground font-medium">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeInView>
      </div>
    </section>
  );
};

export default AIInfrastructure;
