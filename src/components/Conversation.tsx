import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send } from "lucide-react";

const Conversation = () => {
  const suggestedQuestions = [
    "Tell me about your ventures",
    "How does the accelerator work?",
    "What's your gamification SDK?",
  ];

  return (
    <section className="py-20 px-6 bg-background border-t-2 border-primary/20">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12 space-y-6 animate-fade-up">
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="text-foreground">Talk to </span>
            <span className="text-primary">Vriksha 🌳</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A conversational demo that showcases our voice and chat stack — a friendly AI that can explain our ventures, share insights, or even crack a good tree pun.
          </p>
        </div>

        {/* Chat Interface Mockup */}
        <div className="max-w-3xl mx-auto space-y-6">
          {/* AI Message Bubble */}
          <div className="flex gap-4 items-start animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 border-2 border-primary/40">
              <MessageCircle className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="bg-card border-2 border-primary/30 rounded-2xl rounded-tl-none p-6 shadow-lg">
                <p className="text-foreground leading-relaxed">
                  Hi, I'm Vriksha — <span className="text-primary font-semibold">half sage, half startup</span>. Ask me about our ventures or your growth goals.
                </p>
              </div>
              
              {/* Suggested Questions */}
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <Badge 
                    key={index}
                    variant="outline" 
                    className="cursor-pointer hover:bg-primary/10 hover:border-primary transition-all text-xs sm:text-sm py-2 px-3"
                  >
                    {question}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Input Field */}
          <div className="flex gap-3 items-center bg-card border-2 border-border rounded-2xl p-4 shadow-lg hover:border-primary/40 transition-all animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <input 
              type="text" 
              placeholder="Ask me anything..."
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-base"
              disabled
            />
            <Button 
              size="sm"
              className="bg-primary hover:bg-primary-glow text-primary-foreground rounded-xl px-4 py-2"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* CTA */}
          <div className="text-center pt-6 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Button 
              size="lg"
              onClick={() => {
                const trigger = document.querySelector('[data-dv-agent-trigger]') as HTMLElement;
                if (trigger) trigger.click();
              }}
              className="bg-gradient-to-r from-primary to-secondary hover:scale-105 transition-transform text-primary-foreground font-semibold px-8 py-6 text-lg rounded-xl"
            >
              Talk to Us
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Conversation;
