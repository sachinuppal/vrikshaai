import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SectionCompliance {
  score: number;
  status: 'pass' | 'partial' | 'fail';
  notes: string;
}

interface SectionComplianceGridProps {
  compliance: Record<string, SectionCompliance>;
}

const SECTION_LABELS: Record<string, string> = {
  identity: 'Identity',
  objectives: 'Objectives',
  style: 'Style & Tone',
  response_guidelines: 'Response Guidelines',
  greeting: 'Greeting',
  guardrails: 'Guardrails',
  fallbacks: 'Fallbacks',
  variable_capture: 'Variable Capture',
  task_flow: 'Task Flow',
  conditional_paths: 'Conditional Paths',
  required_phrases: 'Required Phrases',
  forbidden_phrases: 'Forbidden Phrases',
  escalation_triggers: 'Escalation Triggers',
  closing: 'Closing',
  error_handling: 'Error Handling',
  silence_handling: 'Silence Handling',
  interrupt_handling: 'Interrupt Handling',
  context_retention: 'Context Retention',
};

export function SectionComplianceGrid({ compliance }: SectionComplianceGridProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'partial':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-500/10 border-green-500/30';
      case 'partial':
        return 'bg-yellow-500/10 border-yellow-500/30';
      case 'fail':
        return 'bg-red-500/10 border-red-500/30';
      default:
        return 'bg-muted/10 border-muted/30';
    }
  };

  const sections = Object.entries(SECTION_LABELS);

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-primary" />
          18-Section Compliance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {sections.map(([key, label]) => {
              const section = compliance[key] || { score: 0, status: 'fail', notes: 'Not analyzed' };
              
              return (
                <Tooltip key={key}>
                  <TooltipTrigger asChild>
                    <div className={`p-3 rounded-lg border cursor-pointer transition-all hover:scale-105 ${getStatusBg(section.status)}`}>
                      <div className="flex items-center justify-between mb-1">
                        {getStatusIcon(section.status)}
                        <span className="text-xs font-medium">{section.score}%</span>
                      </div>
                      <p className="text-xs text-foreground truncate">{label}</p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p className="font-medium">{label}</p>
                    <p className="text-sm text-muted-foreground">{section.notes}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
        
        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Pass (≥80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-500" />
            <span>Partial (60-79%)</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <span>Fail (&lt;60%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
