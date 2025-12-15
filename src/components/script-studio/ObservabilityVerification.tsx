import { useState, useEffect, useMemo } from "react";
import {
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Key,
  Webhook,
  Database,
  FileCode,
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ScriptData } from "@/pages/ScriptStudio";

interface ObservabilityVerificationProps {
  scriptData: ScriptData;
  scriptId: string | null;
}

interface VerificationCheck {
  id: string;
  label: string;
  status: "pending" | "checking" | "passed" | "failed" | "warning";
  message?: string;
}

interface WebhookEvent {
  name: string;
  description: string;
  fields: string[];
  mappedTo: string;
}

const WEBHOOK_EVENTS: WebhookEvent[] = [
  {
    name: "call_completed",
    description: "Call finished with transcript and basic data",
    fields: ["call_id", "transcript", "duration", "call_status", "recording_url"],
    mappedTo: "voice_widget_calls",
  },
  {
    name: "platform_analysis_completed",
    description: "AI analysis with summary, classification, key points",
    fields: ["call_id", "analysis_data.summary", "analysis_data.classification", "analysis_data.key_points"],
    mappedTo: "voice_widget_calls.platform_analysis",
  },
  {
    name: "client_analysis_completed",
    description: "Custom client-specific analysis fields",
    fields: ["call_id", "custom_args_values", "client_analysis"],
    mappedTo: "voice_widget_calls.client_analysis",
  },
  {
    name: "recording_completed",
    description: "Call recording available for download",
    fields: ["call_id", "recording_url", "recording_duration"],
    mappedTo: "voice_widget_calls.recording_url",
  },
];

const RINGG_PAYLOAD_EXAMPLE = `{
  "event_type": "platform_analysis_completed",
  "call_id": "uuid-string",
  "call_sid": "ringg-call-sid",
  "timestamp": "2024-01-15T10:30:00Z",
  "transcript": [
    { "role": "agent", "content": "Hello, how can I help?" },
    { "role": "user", "content": "I need to book an appointment" }
  ],
  "analysis_data": {
    "summary": "Customer requested appointment booking",
    "classification": "appointment_booking",
    "sentiment": "positive",
    "key_points": ["appointment", "next week", "morning"]
  },
  "custom_args_values": {
    "customer_name": "John Doe",
    "appointment_date": "2024-01-20",
    "confirmation_status": "confirmed"
  }
}`;

export const ObservabilityVerification = ({
  scriptData,
  scriptId,
}: ObservabilityVerificationProps) => {
  const [isRunningChecks, setIsRunningChecks] = useState(false);
  const [apiChecks, setApiChecks] = useState<VerificationCheck[]>([
    { id: "ringg_api_key", label: "RINGG_API_KEY configured", status: "pending" },
    { id: "ringg_webhook_secret", label: "RINGG_WEBHOOK_SECRET configured", status: "pending" },
    { id: "api_connectivity", label: "Voice API connectivity", status: "pending" },
  ]);
  const [webhookChecks, setWebhookChecks] = useState<VerificationCheck[]>([
    { id: "webhook_function", label: "ringg-webhook function deployed", status: "pending" },
    { id: "observe_function", label: "observe-call-script function deployed", status: "pending" },
    { id: "comprehensive_function", label: "comprehensive-observability function deployed", status: "pending" },
  ]);
  const [expandedSections, setExpandedSections] = useState<string[]>(["api", "webhook", "variables"]);

  // Extract variables from script sections
  const extractedVariables = useMemo(() => {
    const variables: { name: string; source: string; section: string }[] = [];
    
    scriptData.sections.forEach((section) => {
      if (!section.isComplete || !section.content) return;
      
      const content = section.content;
      
      // Extract from task_logic
      if (section.id === "task_logic" && content.variables) {
        Object.keys(content.variables).forEach((v) => {
          variables.push({ name: v, source: "task_logic.variables", section: section.name });
        });
      }
      
      // Extract from output_formats
      if (section.id === "output_formats" && content.captured_variables) {
        Object.keys(content.captured_variables).forEach((v) => {
          variables.push({ name: v, source: "output_formats.captured_variables", section: section.name });
        });
      }
      
      // Extract from identity_framing
      if (section.id === "identity_framing") {
        if (content.agent_name) variables.push({ name: "agent_name", source: "identity", section: section.name });
        if (content.company_name) variables.push({ name: "company_name", source: "identity", section: section.name });
      }
      
      // Extract from guardrails
      if (section.id === "guardrails" && content.checkpoints) {
        content.checkpoints.forEach((cp: any, i: number) => {
          if (cp.name) variables.push({ name: `checkpoint_${i}_${cp.name}`, source: "guardrails", section: section.name });
        });
      }
      
      // Extract from compliance_policy
      if (section.id === "compliance_policy" && content.required_disclosures) {
        content.required_disclosures.forEach((d: string, i: number) => {
          variables.push({ name: `disclosure_${i}`, source: "compliance", section: section.name });
        });
      }
    });
    
    return variables;
  }, [scriptData.sections]);

  // Calculate readiness score
  const readinessScore = useMemo(() => {
    const allChecks = [...apiChecks, ...webhookChecks];
    const passedChecks = allChecks.filter((c) => c.status === "passed").length;
    const totalChecks = allChecks.length;
    return Math.round((passedChecks / totalChecks) * 100);
  }, [apiChecks, webhookChecks]);

  const readinessStatus = useMemo(() => {
    if (readinessScore >= 80) return { label: "Ready", color: "text-green-500", bg: "bg-green-500/10" };
    if (readinessScore >= 50) return { label: "Needs Attention", color: "text-amber-500", bg: "bg-amber-500/10" };
    return { label: "Not Configured", color: "text-red-500", bg: "bg-red-500/10" };
  }, [readinessScore]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const runVerificationChecks = async () => {
    setIsRunningChecks(true);
    
    // Set all checks to "checking"
    setApiChecks((prev) => prev.map((c) => ({ ...c, status: "checking" as const })));
    setWebhookChecks((prev) => prev.map((c) => ({ ...c, status: "checking" as const })));

    try {
      // Call verification edge function
      const { data, error } = await supabase.functions.invoke("verify-observability-config", {
        body: { scriptId },
      });

      if (error) throw error;

      // Update API checks
      setApiChecks((prev) =>
        prev.map((check) => {
          if (check.id === "ringg_api_key") {
            return {
              ...check,
              status: data.secrets?.ringg_api_key ? "passed" : "failed",
              message: data.secrets?.ringg_api_key ? "Secret is configured" : "Secret not found",
            };
          }
          if (check.id === "ringg_webhook_secret") {
            return {
              ...check,
              status: data.secrets?.ringg_webhook_secret ? "passed" : "failed",
              message: data.secrets?.ringg_webhook_secret ? "Secret is configured" : "Secret not found",
            };
          }
          if (check.id === "api_connectivity") {
            return {
              ...check,
              status: data.api_test?.reachable ? "passed" : "warning",
              message: data.api_test?.reachable
                ? `API reachable (${data.api_test.latency_ms}ms)`
                : "Could not verify API connectivity",
            };
          }
          return check;
        })
      );

      // Update webhook checks
      setWebhookChecks((prev) =>
        prev.map((check) => {
          if (check.id === "webhook_function") {
            return {
              ...check,
              status: data.functions?.ringg_webhook ? "passed" : "failed",
              message: data.functions?.ringg_webhook ? "Function is deployed" : "Function not found",
            };
          }
          if (check.id === "observe_function") {
            return {
              ...check,
              status: data.functions?.observe_call_script ? "passed" : "failed",
              message: data.functions?.observe_call_script ? "Function is deployed" : "Function not found",
            };
          }
          if (check.id === "comprehensive_function") {
            return {
              ...check,
              status: data.functions?.comprehensive_observability ? "passed" : "failed",
              message: data.functions?.comprehensive_observability ? "Function is deployed" : "Function not found",
            };
          }
          return check;
        })
      );

      toast.success("Verification checks completed");
    } catch (error) {
      console.error("Verification failed:", error);
      toast.error("Failed to run verification checks");
      
      // Mark all as failed on error
      setApiChecks((prev) => prev.map((c) => ({ ...c, status: "failed" as const, message: "Check failed" })));
      setWebhookChecks((prev) => prev.map((c) => ({ ...c, status: "failed" as const, message: "Check failed" })));
    } finally {
      setIsRunningChecks(false);
    }
  };

  // Run checks on mount
  useEffect(() => {
    runVerificationChecks();
  }, []);

  const renderCheckIcon = (status: VerificationCheck["status"]) => {
    switch (status) {
      case "passed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "checking":
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <Card className="flex h-full flex-col overflow-hidden border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Eye className="h-5 w-5 text-primary" />
            Observability Readiness
          </CardTitle>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={runVerificationChecks}
          disabled={isRunningChecks}
        >
          {isRunningChecks ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Run Checks
        </Button>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="space-y-4 p-4">
            {/* Readiness Score */}
            <div className={`rounded-lg p-4 ${readinessStatus.bg}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Readiness</span>
                <Badge variant="outline" className={readinessStatus.color}>
                  {readinessStatus.label}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={readinessScore} className="flex-1" />
                <span className={`text-2xl font-bold ${readinessStatus.color}`}>
                  {readinessScore}%
                </span>
              </div>
            </div>

            {/* API & Authentication */}
            <Collapsible
              open={expandedSections.includes("api")}
              onOpenChange={() => toggleSection("api")}
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-3 hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-primary" />
                  <span className="font-medium">API & Authentication</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {apiChecks.filter((c) => c.status === "passed").length}/{apiChecks.length}
                  </Badge>
                  {expandedSections.includes("api") ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 space-y-2 pl-2">
                {apiChecks.map((check) => (
                  <div
                    key={check.id}
                    className="flex items-center justify-between rounded-md border border-border/30 bg-background/50 p-2"
                  >
                    <div className="flex items-center gap-2">
                      {renderCheckIcon(check.status)}
                      <span className="text-sm">{check.label}</span>
                    </div>
                    {check.message && (
                      <span className="text-xs text-muted-foreground">{check.message}</span>
                    )}
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Webhook Configuration */}
            <Collapsible
              open={expandedSections.includes("webhook")}
              onOpenChange={() => toggleSection("webhook")}
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-3 hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  <Webhook className="h-4 w-4 text-primary" />
                  <span className="font-medium">Webhook & Functions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {webhookChecks.filter((c) => c.status === "passed").length}/{webhookChecks.length}
                  </Badge>
                  {expandedSections.includes("webhook") ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 space-y-2 pl-2">
                {webhookChecks.map((check) => (
                  <div
                    key={check.id}
                    className="flex items-center justify-between rounded-md border border-border/30 bg-background/50 p-2"
                  >
                    <div className="flex items-center gap-2">
                      {renderCheckIcon(check.status)}
                      <span className="text-sm">{check.label}</span>
                    </div>
                    {check.message && (
                      <span className="text-xs text-muted-foreground">{check.message}</span>
                    )}
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Webhook Events */}
            <Collapsible
              open={expandedSections.includes("events")}
              onOpenChange={() => toggleSection("events")}
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-3 hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  <span className="font-medium">Supported Webhook Events</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {WEBHOOK_EVENTS.length} events
                  </Badge>
                  {expandedSections.includes("events") ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 space-y-2 pl-2">
                {WEBHOOK_EVENTS.map((event) => (
                  <div
                    key={event.name}
                    className="rounded-md border border-border/30 bg-background/50 p-3"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <code className="text-xs font-medium text-primary">{event.name}</code>
                      <span className="text-[10px] text-muted-foreground">→ {event.mappedTo}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{event.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {event.fields.map((field) => (
                        <Badge key={field} variant="secondary" className="text-[10px]">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Script Variables */}
            <Collapsible
              open={expandedSections.includes("variables")}
              onOpenChange={() => toggleSection("variables")}
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-3 hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-primary" />
                  <span className="font-medium">Script Variables</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {extractedVariables.length} found
                  </Badge>
                  {expandedSections.includes("variables") ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 space-y-2 pl-2">
                {extractedVariables.length === 0 ? (
                  <div className="rounded-md border border-border/30 bg-background/50 p-3 text-center">
                    <p className="text-sm text-muted-foreground">
                      No variables found. Complete more script sections to extract variables.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {extractedVariables.map((variable, idx) => (
                      <div
                        key={`${variable.name}-${idx}`}
                        className="flex items-center justify-between rounded-md border border-border/30 bg-background/50 p-2"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          <code className="text-xs">{variable.name}</code>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">{variable.section}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>

            {/* Expected Payload Example */}
            <Collapsible
              open={expandedSections.includes("payload")}
              onOpenChange={() => toggleSection("payload")}
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-3 hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-primary" />
                  <span className="font-medium">Expected Webhook Payload (Ringg)</span>
                </div>
                <div className="flex items-center gap-2">
                  {expandedSections.includes("payload") ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 pl-2">
                <div className="relative rounded-md border border-border/30 bg-background/50">
                  <div className="flex items-center justify-between border-b border-border/30 px-3 py-2">
                    <span className="text-xs text-muted-foreground">Example payload</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(RINGG_PAYLOAD_EXAMPLE)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <a
                        href="https://docs.ringg.ai/get-started/webhooks/payloads"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                  <pre className="overflow-x-auto p-3 text-xs">
                    <code>{RINGG_PAYLOAD_EXAMPLE}</code>
                  </pre>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
