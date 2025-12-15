import { useState } from 'react';
import { MessageSquare, Bot, User, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TranscriptEntry {
  role?: string;
  content?: string;
  bot?: string;
  user?: string;
  timestamp?: number;
}

interface SectionCompliance {
  score: number;
  status: 'pass' | 'partial' | 'fail';
  notes: string;
}

interface AnnotatedTranscriptProps {
  transcript: TranscriptEntry[];
  compliance?: Record<string, SectionCompliance>;
}

export function AnnotatedTranscript({ transcript, compliance }: AnnotatedTranscriptProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const displayedTranscript = showAll ? transcript : transcript.slice(0, 10);

  const getAnnotation = (content: string, index: number): string | null => {
    const lowerContent = content.toLowerCase();
    
    if (index === 0 || lowerContent.includes('hello') || lowerContent.includes('hi')) {
      return 'Greeting';
    }
    if (lowerContent.includes('name') || lowerContent.includes('company') || lowerContent.includes('email')) {
      return 'Variable Capture';
    }
    if (lowerContent.includes('sorry') || lowerContent.includes("can't") || lowerContent.includes('unable')) {
      return 'Guardrail/Fallback';
    }
    if (lowerContent.includes('thank') || lowerContent.includes('goodbye') || lowerContent.includes('bye')) {
      return 'Closing';
    }
    return null;
  };

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Annotated Transcript
            <Badge variant="outline">{transcript.length} turns</Badge>
          </div>
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </CardTitle>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {displayedTranscript.map((entry, index) => {
              const role = entry.role || (entry.bot ? 'assistant' : 'user');
              const content = entry.content || entry.bot || entry.user || '';
              const isBot = role === 'assistant' || role === 'bot';
              const annotation = getAnnotation(content, index);

              return (
                <div 
                  key={index}
                  className={`flex gap-3 p-3 rounded-lg ${
                    isBot ? 'bg-primary/5 border border-primary/20' : 'bg-muted/30'
                  }`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    isBot ? 'bg-primary/20' : 'bg-muted'
                  }`}>
                    {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        Turn {index + 1}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {isBot ? 'Assistant' : 'User'}
                      </span>
                      {annotation && (
                        <Badge variant="secondary" className="text-xs">
                          {annotation}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{content}</p>
                  </div>
                </div>
              );
            })}
          </div>
          
          {transcript.length > 10 && (
            <div className="mt-4 text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? 'Show Less' : `Show All ${transcript.length} Turns`}
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
