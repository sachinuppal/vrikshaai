import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Check, ChevronRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import type { ScriptSection } from "@/pages/ScriptStudio";

interface ScriptPreviewProps {
  sections: ScriptSection[];
  scriptName: string;
  onProceedToFlowchart: () => void;
  animatingSection?: string | null;
}

// Typewriter effect component
const TypewriterText = ({ 
  text, 
  onComplete 
}: { 
  text: string; 
  onComplete?: () => void;
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) {
      setIsComplete(true);
      onComplete?.();
      return;
    }

    let index = 0;
    const speed = 15; // ms per character
    
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
        setIsComplete(true);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, onComplete]);

  return (
    <span>
      {displayedText}
      {!isComplete && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-middle"
        />
      )}
    </span>
  );
};

// Format content object to readable string
const formatContent = (content: Record<string, any>): string => {
  if (!content || Object.keys(content).length === 0) return "";
  
  return Object.entries(content)
    .map(([key, value]) => {
      const formattedKey = key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
      if (typeof value === "object" && value !== null) {
        if (Array.isArray(value)) {
          return `${formattedKey}:\n${value.map((v) => `  • ${v}`).join("\n")}`;
        }
        return `${formattedKey}:\n${JSON.stringify(value, null, 2)}`;
      }
      return `${formattedKey}: ${value}`;
    })
    .join("\n\n");
};

export const ScriptPreview = ({
  sections,
  scriptName,
  onProceedToFlowchart,
  animatingSection,
}: ScriptPreviewProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [completedAnimations, setCompletedAnimations] = useState<Set<string>>(new Set());
  
  const completeSections = sections.filter((s) => s.isComplete);
  const progress = (completeSections.length / sections.length) * 100;
  const canProceed = completeSections.length >= 3;

  // Scroll to animating section
  useEffect(() => {
    if (animatingSection && scrollRef.current) {
      const element = document.getElementById(`section-${animatingSection}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [animatingSection]);

  const handleAnimationComplete = (sectionId: string) => {
    setCompletedAnimations((prev) => new Set([...prev, sectionId]));
  };

  return (
    <Card className="flex h-full flex-col overflow-hidden border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="border-b border-border/50 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-5 w-5 text-primary" />
            Script Preview
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {completeSections.length}/{sections.length} sections
          </Badge>
        </div>
        <Progress value={progress} className="h-1.5 mt-2" />
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full" ref={scrollRef}>
          <div className="p-6 space-y-6">
            {/* Script Title */}
            <div className="border-b border-border pb-4">
              <h1 className="text-2xl font-bold text-foreground">{scriptName || "Untitled Script"}</h1>
              <p className="text-sm text-muted-foreground mt-1">Voice Agent Script Document</p>
            </div>

            {/* Sections */}
            <div className="space-y-8">
              {sections.map((section, index) => {
                const content = formatContent(section.content);
                const isAnimating = animatingSection === section.id;
                const hasAnimated = completedAnimations.has(section.id);
                const shouldType = isAnimating && content && !hasAnimated;

                return (
                  <motion.div
                    id={`section-${section.id}`}
                    key={section.id}
                    initial={{ opacity: 0.5 }}
                    animate={{ 
                      opacity: section.isComplete ? 1 : 0.5,
                      backgroundColor: isAnimating ? "hsl(var(--primary) / 0.05)" : "transparent"
                    }}
                    transition={{ duration: 0.3 }}
                    className="rounded-lg p-4 -mx-4 transition-colors"
                  >
                    {/* Section Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                        section.isComplete 
                          ? "bg-primary/10 text-primary" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {section.isComplete ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <h2 className={`text-lg font-semibold ${
                        section.isComplete ? "text-foreground" : "text-muted-foreground"
                      }`}>
                        {section.name}
                      </h2>
                      {isAnimating && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                        >
                          <Sparkles className="h-4 w-4 text-primary" />
                        </motion.div>
                      )}
                    </div>

                    {/* Section Content */}
                    <div className="pl-11">
                      <AnimatePresence mode="wait">
                        {section.isComplete && content ? (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="prose prose-sm max-w-none text-foreground/80"
                          >
                            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed bg-transparent p-0 m-0">
                              {shouldType ? (
                                <TypewriterText 
                                  text={content} 
                                  onComplete={() => handleAnimationComplete(section.id)}
                                />
                              ) : (
                                content
                              )}
                            </pre>
                          </motion.div>
                        ) : (
                          <p className="text-sm text-muted-foreground/60 italic">
                            Not yet defined...
                          </p>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </CardContent>

      {/* Proceed Button */}
      <div className="border-t border-border/50 p-4">
        <Button 
          onClick={onProceedToFlowchart} 
          disabled={!canProceed}
          className="w-full"
          size="lg"
        >
          <ChevronRight className="mr-2 h-5 w-5" />
          Proceed to Flowchart
          {!canProceed && (
            <span className="ml-2 text-xs opacity-70">
              (need {3 - completeSections.length} more sections)
            </span>
          )}
        </Button>
      </div>
    </Card>
  );
};