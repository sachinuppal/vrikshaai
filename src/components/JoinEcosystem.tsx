import { useState } from "react";
import { Button } from "@/components/ui/button";
import HubSpotFormModal from "@/components/HubSpotFormModal";
import { Code2, Rocket, Building2, TrendingUp, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeInView } from "@/components/animations";

const audiences = [
  {
    id: 'developers',
    title: 'Developers',
    icon: Code2,
    tagline: "A place where builders actually get to build.",
    description: "Developers come to Vriksha.ai because they want more than tasks — they want ownership. Here, you work on meaningful problems, ship real systems, and see your work turn into products, companies, and impact.",
    benefits: [
      "A team that values craftsmanship and speed",
      "Room to innovate without bureaucracy",
      "Access to cutting-edge AI challenges",
      "Mentorship from people who have scaled real businesses",
      "A community that cares about learning, experimenting, and creating"
    ],
    closing: "If you want to build the future — not just maintain the present — you'll feel at home here."
  },
  {
    id: 'founders',
    title: 'Founders',
    icon: Rocket,
    tagline: "A partner who builds with you, not just funds you.",
    description: "Founders choose Vriksha.ai because we remove the loneliness and friction from early-stage building. You don't just get advice — you get hands-on support across the entire journey.",
    benefits: [
      "Help validating your idea and shaping your product",
      "Technical and strategic support to build fast",
      "A team that shares your execution load",
      "A structured path to traction and growth",
      "Guidance on fundraising, storytelling, and scaling",
      "A partner who co-owns the outcome, not just the equity"
    ],
    closing: "If you want a co-founder-style relationship with real skin in the game, you'll find it here."
  },
  {
    id: 'enterprises',
    title: 'Enterprises',
    icon: Building2,
    tagline: "A strategic partner in automation, transformation, and growth.",
    description: "Enterprises work with Vriksha.ai because we help them modernize with clarity and speed — without disrupting daily operations.",
    benefits: [
      "Expert guidance on adopting AI safely and effectively",
      "Customized workflows that match how your teams work",
      "Support in transforming manual processes into intelligent systems",
      "Help in improving efficiencies, outcomes, and customer experience",
      "Long-term partnership instead of one-time implementation",
      "A team that speaks both business and technology fluently"
    ],
    closing: "If you're serious about building the next version of your enterprise, we're the right partner."
  },
  {
    id: 'investors',
    title: 'Investors',
    icon: TrendingUp,
    tagline: "A scalable engine for creating high-velocity AI ventures.",
    description: "Investors engage with Vriksha.ai because we offer a systematic way to build multiple strong companies — not just hope for a lucky winner.",
    benefits: [
      "A repeatable model for venture creation",
      "Deep founder support that increases survival rates",
      "Strong early validation through rapid prototyping",
      "Rigorous market, strategy, and execution discipline",
      "Shared infrastructure that accelerates multiple ventures",
      "Long-term alignment focused on outcomes, not optics"
    ],
    closing: "If you're betting on India becoming an AI powerhouse, Vriksha.ai is the platform that turns that belief into returns."
  }
];

const JoinEcosystem = () => {
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState<string | null>('developers');

  const selectedData = audiences.find(a => a.id === selectedAudience);
  
  return (
    <section className="relative py-32 overflow-hidden bg-gradient-to-b from-muted/30 to-background">
      <div className="relative container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Header */}
          <FadeInView className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-bold">
              <span className="text-foreground">Let's Grow </span>
              <span className="bg-gradient-neural bg-clip-text text-transparent">Together.</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-primary mx-auto rounded-full" />
          </FadeInView>

          {/* Description */}
          <FadeInView delay={0.1}>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Whether you're a founder, developer, enterprise, or investor, Vriksha.ai is an open ecosystem built for people who want to create.
            </p>
          </FadeInView>

          <FadeInView delay={0.2}>
            <p className="text-lg text-foreground font-medium max-w-3xl mx-auto">
              Together, we'll plant the next generation of AI ventures — rooted in India, scaling globally.
            </p>
          </FadeInView>

          {/* CTA Buttons */}
          <FadeInView delay={0.3} className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button 
              size="lg"
              onClick={() => setShowContactModal(true)}
              className="group bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-10 py-6 text-lg rounded-xl shadow-hover transition-all hover:scale-105"
            >
              Contact Us
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => {
                const selectors = [
                  '[data-dv-agent-trigger]',
                  '.dv-agent-button',
                  '.ringg-widget-button',
                  'button[class*="dv-"]',
                  'button[class*="ringg"]'
                ];
                
                for (const selector of selectors) {
                  const trigger = document.querySelector(selector) as HTMLElement;
                  if (trigger) {
                    trigger.click();
                    return;
                  }
                }
                
                console.warn('Ringg widget button not found');
              }}
              className="group border-2 border-secondary/30 text-secondary hover:border-secondary hover:bg-secondary hover:text-secondary-foreground font-semibold px-10 py-6 text-lg rounded-xl transition-all hover:scale-105"
            >
              Talk to Us
            </Button>
          </FadeInView>

          {/* Audience Tabs */}
          <FadeInView delay={0.4} className="pt-12 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {audiences.map((audience) => {
                const Icon = audience.icon;
                const isSelected = selectedAudience === audience.id;
                return (
                  <motion.button
                    key={audience.id}
                    onClick={() => setSelectedAudience(isSelected ? null : audience.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                      isSelected 
                        ? 'bg-primary/10 border-primary text-primary shadow-lg' 
                        : 'bg-card border-border text-foreground hover:border-primary/50 hover:shadow-hover'
                    }`}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className={`w-5 h-5 mx-auto mb-2 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                    <p className="font-semibold">{audience.title}</p>
                  </motion.button>
                );
              })}
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
              {selectedData ? (
                <motion.div
                  key={selectedData.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-3xl mx-auto bg-card border border-border rounded-2xl p-8 text-left shadow-card"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <selectedData.icon className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-bold text-foreground">For {selectedData.title}</h3>
                  </div>
                  
                  <p className="text-lg font-semibold text-primary mb-4 italic">
                    "{selectedData.tagline}"
                  </p>
                  
                  <p className="text-muted-foreground mb-6">
                    {selectedData.description}
                  </p>
                  
                  <p className="font-medium text-foreground mb-3">You get:</p>
                  <ul className="space-y-2 mb-6">
                    {selectedData.benefits.map((benefit, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start gap-3"
                      >
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{benefit}</span>
                      </motion.li>
                    ))}
                  </ul>
                  
                  <p className="text-foreground font-medium italic border-l-4 border-primary pl-4">
                    {selectedData.closing}
                  </p>
                </motion.div>
              ) : (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-lg text-muted-foreground italic max-w-2xl mx-auto pt-4"
                >
                  Builders build with us. Founders grow with us. Enterprises transform with us. Investors scale with us.
                </motion.p>
              )}
            </AnimatePresence>
          </FadeInView>
        </div>
      </div>

      <HubSpotFormModal open={showContactModal} onOpenChange={setShowContactModal} />
    </section>
  );
};

export default JoinEcosystem;
