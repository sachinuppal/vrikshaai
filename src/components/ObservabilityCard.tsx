import { motion } from "framer-motion";
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  ChevronDown, 
  ChevronUp,
  Shield,
  MessageSquare,
  Target,
  Lightbulb,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface SectionCoverage {
  section: string;
  covered: boolean;
  compliance_score: number;
  questions_asked?: string[];
  questions_missed?: string[];
}

interface ToneAnalysis {
  professional: boolean;
  empathetic: boolean;
  clear: boolean;
}

interface ObservabilityAnalysis {
  overall_score: number;
  status: string;
  sections_covered: SectionCoverage[];
  tone_analysis: ToneAnalysis;
  guardrail_violations: string[];
  language_compliance: boolean;
  strengths: string[];
  improvements: string[];
  summary: string;
}

interface ObservabilityCardProps {
  analysis: ObservabilityAnalysis | null;
  status: string | null;
  onRunAnalysis?: () => void;
  isAnalyzing?: boolean;
}

export const ObservabilityCard = ({ 
  analysis, 
  status, 
  onRunAnalysis,
  isAnalyzing = false 
}: ObservabilityCardProps) => {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const getStatusIcon = (statusValue: string | null) => {
    switch (statusValue) {
      case "compliant":
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case "partial":
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case "non_compliant":
        return <XCircle className="h-6 w-6 text-red-500" />;
      case "analyzing":
        return <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />;
      default:
        return <Shield className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (statusValue: string | null) => {
    switch (statusValue) {
      case "compliant":
        return "Compliant";
      case "partial":
        return "Partial Compliance";
      case "non_compliant":
        return "Non-Compliant";
      case "analyzing":
        return "Analyzing...";
      case "error":
        return "Analysis Failed";
      default:
        return "Not Analyzed";
    }
  };

  const getStatusColor = (statusValue: string | null) => {
    switch (statusValue) {
      case "compliant":
        return "text-green-500 bg-green-500/10";
      case "partial":
        return "text-yellow-500 bg-yellow-500/10";
      case "non_compliant":
        return "text-red-500 bg-red-500/10";
      case "analyzing":
        return "text-blue-500 bg-blue-500/10";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  // Show run analysis button if no analysis exists
  if (!analysis && status !== "analyzing") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Script Observability</h3>
          </div>
        </div>
        
        <p className="text-muted-foreground mb-4">
          Analyze how well the AI agent followed the script during this call.
        </p>
        
        <Button 
          onClick={onRunAnalysis} 
          disabled={isAnalyzing}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Target className="h-4 w-4 mr-2" />
              Run Script Analysis
            </>
          )}
        </Button>
      </motion.div>
    );
  }

  // Show loading state
  if (status === "analyzing" && !analysis) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
          <h3 className="text-lg font-semibold">Analyzing Script Compliance...</h3>
        </div>
        <p className="text-muted-foreground">
          Comparing the call transcript against the expected script using AI...
        </p>
      </motion.div>
    );
  }

  if (!analysis) return null;

  const coveredSections = analysis.sections_covered?.filter(s => s.covered).length || 0;
  const totalSections = analysis.sections_covered?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-6 space-y-6"
    >
      {/* Header with Status Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Script Observability</h3>
        </div>
        
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full",
          getStatusColor(analysis.status)
        )}>
          {getStatusIcon(analysis.status)}
          <span className="font-medium">{analysis.overall_score}%</span>
        </div>
      </div>

      {/* Status Badge */}
      <div className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-lg",
        getStatusColor(analysis.status)
      )}>
        {getStatusIcon(analysis.status)}
        <span className="font-semibold">{getStatusLabel(analysis.status)}</span>
      </div>

      {/* Summary */}
      {analysis.summary && (
        <p className="text-muted-foreground">{analysis.summary}</p>
      )}

      {/* Sections Covered */}
      {analysis.sections_covered && analysis.sections_covered.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Sections Covered ({coveredSections}/{totalSections})
            </h4>
          </div>
          
          <div className="space-y-2">
            {analysis.sections_covered.map((section, index) => (
              <div 
                key={index}
                className="border border-border rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleSection(section.section)}
                  className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {section.covered ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="font-medium">{section.section}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn("text-sm font-medium", getScoreColor(section.compliance_score))}>
                      {section.compliance_score}%
                    </span>
                    {expandedSections.includes(section.section) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </button>
                
                {expandedSections.includes(section.section) && (
                  <div className="px-3 pb-3 space-y-2 border-t border-border pt-3">
                    {section.questions_asked && section.questions_asked.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-green-500 mb-1">Questions Asked:</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {section.questions_asked.map((q, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                              {q}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {section.questions_missed && section.questions_missed.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-red-500 mb-1">Questions Missed:</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {section.questions_missed.map((q, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <XCircle className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
                              {q}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tone Analysis */}
      {analysis.tone_analysis && (
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Tone Analysis
          </h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(analysis.tone_analysis).map(([key, value]) => (
              <div
                key={key}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm",
                  value ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                )}
              >
                {value ? (
                  <CheckCircle className="h-3.5 w-3.5" />
                ) : (
                  <XCircle className="h-3.5 w-3.5" />
                )}
                <span className="capitalize">{key}</span>
              </div>
            ))}
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm",
                analysis.language_compliance ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
              )}
            >
              {analysis.language_compliance ? (
                <CheckCircle className="h-3.5 w-3.5" />
              ) : (
                <XCircle className="h-3.5 w-3.5" />
              )}
              <span>Language Compliance</span>
            </div>
          </div>
        </div>
      )}

      {/* Guardrail Violations */}
      {analysis.guardrail_violations && analysis.guardrail_violations.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2 text-red-500">
            <AlertTriangle className="h-4 w-4" />
            Guardrail Violations ({analysis.guardrail_violations.length})
          </h4>
          <ul className="space-y-2">
            {analysis.guardrail_violations.map((violation, index) => (
              <li 
                key={index}
                className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 p-3 rounded-lg"
              >
                <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                {violation}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Strengths */}
      {analysis.strengths && analysis.strengths.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2 text-green-500">
            <CheckCircle className="h-4 w-4" />
            Strengths
          </h4>
          <ul className="space-y-2">
            {analysis.strengths.map((strength, index) => (
              <li 
                key={index}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                {strength}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvements */}
      {analysis.improvements && analysis.improvements.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2 text-primary">
            <Lightbulb className="h-4 w-4" />
            Improvements
          </h4>
          <ul className="space-y-2">
            {analysis.improvements.map((improvement, index) => (
              <li 
                key={index}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                {improvement}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Re-run Analysis Button */}
      {onRunAnalysis && (
        <Button 
          variant="outline" 
          onClick={onRunAnalysis}
          disabled={isAnalyzing}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Re-analyzing...
            </>
          ) : (
            <>
              <Target className="h-4 w-4 mr-2" />
              Re-run Analysis
            </>
          )}
        </Button>
      )}
    </motion.div>
  );
};
