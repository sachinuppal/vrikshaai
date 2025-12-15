import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Target,
  FileText,
  Settings,
  Mic,
  Volume2,
  MessageCircle,
  Brain,
  GitBranch,
  Shield,
  BookOpen,
  HelpCircle,
  Scale,
  Smile,
  FileOutput,
  TestTube,
  Rocket,
  Users,
  Check,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { ScriptSection } from "@/pages/ScriptStudio";

interface ScriptSectionEditorProps {
  sections: ScriptSection[];
  onSectionUpdate: (sectionId: string, content: Record<string, any>) => void;
}

const SECTION_ICONS: Record<string, any> = {
  identity_framing: User,
  objectives: Target,
  conversation_contract: FileText,
  operating_context: Settings,
  stt_instructions: Mic,
  tts_instructions: Volume2,
  turn_taking: MessageCircle,
  task_logic: Brain,
  core_flows: GitBranch,
  guardrails: Shield,
  knowledge_grounding: BookOpen,
  faq_pack: HelpCircle,
  compliance_policy: Scale,
  ux_guidelines: Smile,
  output_formats: FileOutput,
  testing_config: TestTube,
  deployment_config: Rocket,
  usage_guidelines: Users,
};

const SECTION_DESCRIPTIONS: Record<string, string> = {
  identity_framing: "Agent name, role, brand voice, persona boundaries",
  objectives: "Primary/secondary goals, success criteria, quality metrics",
  conversation_contract: "Consent, privacy notice, safety notes, user control cues",
  operating_context: "Available tools, data fields, environment assumptions",
  stt_instructions: "Language detection, entity extraction, error handling",
  tts_instructions: "Speaking style, prosody, pronunciation dictionary",
  turn_taking: "Barge-in behavior, backchanneling, silence policy",
  task_logic: "Intent taxonomy, slot schema, decision tree, fallback logic",
  core_flows: "Happy path, alternate paths, edge cases, escalation",
  guardrails: "Hard bans, sensitive topics, PII rules, no-hallucination",
  knowledge_grounding: "Knowledge sources, citation rules, recency rules",
  faq_pack: "Top FAQs, objection handling, localized variants",
  compliance_policy: "Regulatory requirements, disclaimers, approved phrasing",
  ux_guidelines: "Empathy rules, clarity heuristics, choice architecture",
  output_formats: "Structured outputs, call summary, message templates",
  testing_config: "Golden test set, adversarial set, rubric, iteration loop",
  deployment_config: "Voice selection, latency constraints, feature flags",
  usage_guidelines: "How teams update, versioning, escalation contacts",
};

const SECTION_FIELDS: Record<string, { name: string; type: "text" | "textarea" | "list"; placeholder: string }[]> = {
  identity_framing: [
    { name: "agent_name", type: "text", placeholder: "e.g., Aria, Max" },
    { name: "agent_role", type: "text", placeholder: "e.g., Customer Support Agent" },
    { name: "brand_voice", type: "textarea", placeholder: "Describe tone, formality, energy level..." },
    { name: "persona_boundaries", type: "textarea", placeholder: "What the agent should NOT do..." },
  ],
  objectives: [
    { name: "primary_objective", type: "textarea", placeholder: "The one thing this call must achieve" },
    { name: "secondary_objectives", type: "textarea", placeholder: "Nice-to-haves, one per line" },
    { name: "non_goals", type: "textarea", placeholder: "Explicitly what not to do" },
    { name: "success_definition", type: "textarea", placeholder: "Clear measurable outcome" },
  ],
  guardrails: [
    { name: "hard_bans", type: "textarea", placeholder: "List of absolutely forbidden actions/topics" },
    { name: "sensitive_topics", type: "textarea", placeholder: "How to handle health, legal, finance topics" },
    { name: "pii_rules", type: "textarea", placeholder: "What can be asked, what must be masked" },
    { name: "no_hallucination_rules", type: "textarea", placeholder: "Rules for factual accuracy" },
  ],
  core_flows: [
    { name: "happy_path", type: "textarea", placeholder: "Describe the ideal conversation flow" },
    { name: "alternate_paths", type: "textarea", placeholder: "Common variations and branches" },
    { name: "edge_cases", type: "textarea", placeholder: "Angry user, wrong number, prank, silent" },
    { name: "escalation_flow", type: "textarea", placeholder: "When and how to hand off to human" },
  ],
};

export const ScriptSectionEditor = ({ sections, onSectionUpdate }: ScriptSectionEditorProps) => {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["identity_framing"]));
  const [localContent, setLocalContent] = useState<Record<string, Record<string, any>>>({});

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const handleFieldChange = (sectionId: string, fieldName: string, value: string) => {
    const updatedContent = {
      ...localContent[sectionId],
      [fieldName]: value,
    };
    setLocalContent((prev) => ({
      ...prev,
      [sectionId]: updatedContent,
    }));
  };

  const handleSaveSection = (sectionId: string) => {
    if (localContent[sectionId]) {
      onSectionUpdate(sectionId, localContent[sectionId]);
    }
  };

  const completedCount = sections.filter((s) => s.isComplete).length;

  return (
    <div className="space-y-4">
      {/* Progress */}
      <Card className="border-border/50 bg-card/50">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Script Completion</h3>
              <p className="text-sm text-muted-foreground">
                {completedCount} of {sections.length} sections complete
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-48 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${(completedCount / sections.length) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium">
                {Math.round((completedCount / sections.length) * 100)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      <div className="grid gap-3">
        {sections.map((section) => {
          const Icon = SECTION_ICONS[section.id] || FileText;
          const isOpen = openSections.has(section.id);
          const fields = SECTION_FIELDS[section.id] || [];
          const sectionContent = localContent[section.id] || section.content;

          return (
            <Collapsible key={section.id} open={isOpen} onOpenChange={() => toggleSection(section.id)}>
              <Card className="border-border/50 bg-card/50 overflow-hidden">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer py-3 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            section.isComplete ? "bg-green-500/20 text-green-400" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {section.isComplete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                        </div>
                        <div>
                          <CardTitle className="text-sm font-medium">{section.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">
                            {SECTION_DESCRIPTIONS[section.id]}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {section.isComplete && (
                          <Badge variant="secondary" className="text-xs">
                            Complete
                          </Badge>
                        )}
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <CardContent className="border-t border-border/50 pt-4">
                          {fields.length > 0 ? (
                            <div className="space-y-4">
                              {fields.map((field) => (
                                <div key={field.name} className="space-y-2">
                                  <Label htmlFor={`${section.id}-${field.name}`} className="text-sm capitalize">
                                    {field.name.replace(/_/g, " ")}
                                  </Label>
                                  {field.type === "textarea" ? (
                                    <Textarea
                                      id={`${section.id}-${field.name}`}
                                      placeholder={field.placeholder}
                                      value={sectionContent[field.name] || ""}
                                      onChange={(e) => handleFieldChange(section.id, field.name, e.target.value)}
                                      className="min-h-[80px]"
                                    />
                                  ) : (
                                    <Input
                                      id={`${section.id}-${field.name}`}
                                      placeholder={field.placeholder}
                                      value={sectionContent[field.name] || ""}
                                      onChange={(e) => handleFieldChange(section.id, field.name, e.target.value)}
                                    />
                                  )}
                                </div>
                              ))}
                              <Button size="sm" onClick={() => handleSaveSection(section.id)} className="mt-2">
                                Save Section
                              </Button>
                            </div>
                          ) : (
                            <div className="text-center py-4 text-sm text-muted-foreground">
                              <p>Use the chat interface to populate this section, or add fields manually.</p>
                            </div>
                          )}
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
};
