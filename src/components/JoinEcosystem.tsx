import { useState } from "react";
import { Button } from "@/components/ui/button";
import HubSpotFormModal from "@/components/HubSpotFormModal";

const JoinEcosystem = () => {
  const [showContactModal, setShowContactModal] = useState(false);
  
  return (
    <section className="relative py-32 overflow-hidden bg-gradient-to-b from-muted/30 to-background">
      <div className="relative container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-up">
          {/* Header */}
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-bold">
              <span className="text-foreground">Let's Grow </span>
              <span className="bg-gradient-neural bg-clip-text text-transparent">Together.</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-primary mx-auto rounded-full" />
          </div>

          {/* Description */}
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Whether you're a founder, developer, enterprise, or investor, Vriksha.ai is an open ecosystem designed for collaboration.
          </p>

          <p className="text-lg text-foreground font-medium max-w-3xl mx-auto">
            Together, we'll plant the next generation of AI ventures — rooted in India, scaling to the world.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
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
          </div>

          {/* Roles */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {['Developers', 'Founders', 'Enterprises', 'Investors'].map((role, index) => (
              <div 
                key={index}
                className="p-4 rounded-xl bg-card border border-border shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1"
              >
                <p className="font-semibold text-foreground">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <HubSpotFormModal open={showContactModal} onOpenChange={setShowContactModal} />
    </section>
  );
};

export default JoinEcosystem;
