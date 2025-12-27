import { useState } from "react";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Brain,
  Target,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Users,
  Workflow,
  MessageSquare,
  Phone,
  Mail,
  Zap,
  Clock,
  GitBranch,
  Database,
  Building2,
  GraduationCap,
  Heart,
  ShoppingCart,
  Home,
  Copy,
  Check,
  BookOpen,
  Lightbulb,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const CRMDocs = () => {
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock = ({ code, id }: { code: string; id: string }) => (
    <div className="relative bg-muted/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8"
        onClick={() => copyToClipboard(code, id)}
      >
        {copiedCode === id ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
      <pre className="whitespace-pre-wrap">{code}</pre>
    </div>
  );

  const ScoreCard = ({
    title,
    icon: Icon,
    range,
    description,
    factors,
    color,
  }: {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    range: string;
    description: string;
    factors: string[];
    color: string;
  }) => (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <Badge variant="secondary" className="mt-1">
              {range}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-3">{description}</p>
        <div className="space-y-1">
          <p className="text-sm font-medium">Factors:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            {factors.map((factor, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-primary">•</span>
                {factor}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );

  const NodeTypeTable = ({
    category,
    nodes,
  }: {
    category: string;
    nodes: { name: string; description: string }[];
  }) => (
    <div className="space-y-2">
      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
        {category}
      </h4>
      <div className="border border-border/50 rounded-lg overflow-hidden">
        {nodes.map((node, i) => (
          <div
            key={node.name}
            className={`flex items-center justify-between p-3 ${
              i !== nodes.length - 1 ? "border-b border-border/50" : ""
            }`}
          >
            <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
              {node.name}
            </code>
            <span className="text-sm text-muted-foreground">{node.description}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <CRMLayout>
      <ScrollArea className="h-[calc(100vh-120px)]">
        <div className="space-y-8 pr-4">
          {/* Hero Section */}
          <Card className="bg-gradient-to-br from-primary/10 via-background to-accent/10 border-primary/20">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
                  <Brain className="h-12 w-12 text-primary" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-3">
                    One AI Agent Per Contact
                  </h1>
                  <p className="text-lg text-muted-foreground mb-4 max-w-2xl">
                    Every contact deserves their own AI agent—one that remembers everything,
                    predicts what's next, and takes action at the perfect moment to maximize
                    Customer Lifetime Value.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild>
                      <Link to="/crm/flow-builder">
                        <Workflow className="mr-2 h-4 w-4" />
                        Build Your First Flow
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/crm/contacts">
                        <Users className="mr-2 h-4 w-4" />
                        View Contacts
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: "ML Scores", value: "5 Pillars", icon: Brain },
              { label: "Node Types", value: "20+", icon: GitBranch },
              { label: "Channels", value: "4 Native", icon: MessageSquare },
              { label: "Industries", value: "5 Templates", icon: Building2 },
            ].map((stat) => (
              <Card key={stat.label} className="border-border/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-muted">
                    <stat.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator />

          {/* Main Content Accordion */}
          <Accordion type="multiple" defaultValue={["philosophy", "scoring"]} className="space-y-4">
            {/* Philosophy Section */}
            <AccordionItem value="philosophy" className="border border-border/50 rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Lightbulb className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">Core Philosophy</h3>
                    <p className="text-sm text-muted-foreground">
                      From passive CRM to active AI agents
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4">
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Traditional CRMs are databases with dashboards—they store data and wait for
                    humans to extract insights. Vriksha AI CRM deploys an intelligent agent for
                    each contact that autonomously:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { title: "Learns Continuously", desc: "From every call, message, and interaction" },
                      { title: "Computes Real-time Scores", desc: "Using ML algorithms across 5 dimensions" },
                      { title: "Predicts Future Behaviors", desc: "With confidence levels and reasoning" },
                      { title: "Executes Optimal Actions", desc: "Through agentic automation flows" },
                    ].map((item) => (
                      <div key={item.title} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                        <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border border-border/50 rounded-lg overflow-hidden">
                    <div className="grid grid-cols-2 font-medium text-sm bg-muted/50 p-3 border-b border-border/50">
                      <span>Traditional CRM</span>
                      <span>Vriksha AI CRM</span>
                    </div>
                    {[
                      ["Stores data passively", "Acts on data autonomously"],
                      ["Requires manual analysis", "Provides predictive insights"],
                      ["Rule-based automation", "ML-driven intelligent flows"],
                      ["Same treatment for all", "Personalized AI per contact"],
                      ["Historical reporting", "Future-predictive timeline"],
                    ].map(([old, new_], i) => (
                      <div key={i} className="grid grid-cols-2 text-sm p-3 border-b border-border/50 last:border-0">
                        <span className="text-muted-foreground">{old}</span>
                        <span className="text-primary font-medium">{new_}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* ML Scoring Engine */}
            <AccordionItem value="scoring" className="border border-border/50 rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <Brain className="h-5 w-5 text-orange-500" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">5-Pillar ML Scoring Engine</h3>
                    <p className="text-sm text-muted-foreground">
                      Real-time scores that drive all automation
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <ScoreCard
                    title="Intent Score"
                    icon={Target}
                    range="0-100"
                    description="How likely is this contact to convert?"
                    factors={[
                      "Recent interaction frequency",
                      "Sentiment analysis",
                      "Purchase signals detected",
                      "Budget mentions",
                      "Timeline urgency keywords",
                    ]}
                    color="bg-blue-500/10 text-blue-500"
                  />
                  <ScoreCard
                    title="Engagement Score"
                    icon={TrendingUp}
                    range="0-100"
                    description="How actively is this contact engaging?"
                    factors={[
                      "Total interaction count",
                      "Recency of last interaction",
                      "Response rate to outreach",
                      "Channel diversity",
                    ]}
                    color="bg-green-500/10 text-green-500"
                  />
                  <ScoreCard
                    title="Urgency Score"
                    icon={Clock}
                    range="0-100"
                    description="How quickly does this contact need attention?"
                    factors={[
                      "Volume of recent interactions",
                      "Number of channels used",
                      "Inbound vs outbound ratio",
                      "Timeline keywords detected",
                    ]}
                    color="bg-amber-500/10 text-amber-500"
                  />
                  <ScoreCard
                    title="Churn Risk"
                    icon={AlertTriangle}
                    range="0-100"
                    description="How likely is this contact to disengage?"
                    factors={[
                      "Days since last interaction",
                      "Recent negative sentiment",
                      "Complaint frequency",
                      "Declining engagement trend",
                    ]}
                    color="bg-red-500/10 text-red-500"
                  />
                  <ScoreCard
                    title="LTV Prediction"
                    icon={DollarSign}
                    range="₹ Value"
                    description="Estimated lifetime value of this relationship"
                    factors={[
                      "Stated or detected budget",
                      "User type multiplier",
                      "Industry multiplier",
                      "Historical transaction data",
                    ]}
                    color="bg-purple-500/10 text-purple-500"
                  />
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Score Computation Example</h4>
                  <CodeBlock
                    id="score-algo"
                    code={`// Intent Score Algorithm
Base Score = 30
+ Recent positive interactions (up to +20)
+ Sentiment boost (positive = +15, neutral = +5)
+ Purchase signals detected (+25)
+ Budget mentioned (+20)
+ Timeline urgency (+20)
= Final Intent Score (capped at 100)`}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Predictive Timeline */}
            <AccordionItem value="timeline" className="border border-border/50 rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10">
                    <Clock className="h-5 w-5 text-cyan-500" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">Predictive Timeline</h3>
                    <p className="text-sm text-muted-foreground">
                      Past, present, and AI-predicted future
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                        Past
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      <ul className="space-y-2">
                        <li>• All historical interactions</li>
                        <li>• Channel and direction tracking</li>
                        <li>• Sentiment analysis per interaction</li>
                        <li>• Key entities extracted</li>
                        <li>• AI-generated summaries</li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card className="border-primary/50 bg-primary/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                        Present
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      <ul className="space-y-2">
                        <li>• All 5 ML scores with trends</li>
                        <li>• Active automation flows</li>
                        <li>• Pending tasks</li>
                        <li>• Current lifecycle stage</li>
                        <li>• Tags and segments</li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        Future (AI Predicted)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      <ul className="space-y-2">
                        <li>• Recommended actions</li>
                        <li>• Optimal timing predictions</li>
                        <li>• Confidence levels</li>
                        <li>• AI reasoning explained</li>
                        <li>• One-click execution</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Agentic Flow Builder */}
            <AccordionItem value="flows" className="border border-border/50 rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-500/10">
                    <Workflow className="h-5 w-5 text-violet-500" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">Agentic Flow Builder</h3>
                    <p className="text-sm text-muted-foreground">
                      AI-powered automation workflows
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4">
                <div className="space-y-6">
                  <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                    <p className="font-medium mb-2">Natural Language → Complete Flow</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Simply describe what you want and the AI generates the entire flow:
                    </p>
                    <div className="bg-background rounded-lg p-3 border border-border/50 italic text-muted-foreground">
                      "Create a flow that qualifies leads using BANT methodology, schedules
                      appointments for qualified leads, and nurtures unqualified ones with
                      educational content."
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Node Types Reference</h4>
                    
                    <NodeTypeTable
                      category="Triggers"
                      nodes={[
                        { name: "api_trigger", description: "External API webhook" },
                        { name: "schedule_trigger", description: "Time-based recurring" },
                        { name: "event_trigger", description: "Internal event based" },
                      ]}
                    />
                    
                    <NodeTypeTable
                      category="Routers"
                      nodes={[
                        { name: "channel_router", description: "Route by preferred channel" },
                        { name: "conditional", description: "If/else logic" },
                        { name: "score_router", description: "Route by ML scores" },
                      ]}
                    />
                    
                    <NodeTypeTable
                      category="Channels"
                      nodes={[
                        { name: "voice_call", description: "Initiate AI voice call" },
                        { name: "whatsapp_message", description: "Send WhatsApp message" },
                        { name: "sms_message", description: "Send SMS" },
                        { name: "email_action", description: "Send email" },
                      ]}
                    />
                    
                    <NodeTypeTable
                      category="AI Nodes"
                      nodes={[
                        { name: "ai_conversation", description: "Multi-turn AI chat" },
                        { name: "ai_classify", description: "Classify into categories" },
                        { name: "ai_extract", description: "Extract entities" },
                      ]}
                    />
                  </div>

                  <div className="flex justify-center">
                    <Button asChild>
                      <Link to="/crm/flow-builder">
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Open Flow Builder
                      </Link>
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Industry Applications */}
            <AccordionItem value="industries" className="border border-border/50 rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <Building2 className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">Industry Applications</h3>
                    <p className="text-sm text-muted-foreground">
                      Pre-built templates for common use cases
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      icon: Home,
                      title: "Real Estate",
                      color: "bg-blue-500/10 text-blue-500",
                      flows: [
                        "BANT qualification",
                        "Site visit scheduling",
                        "Allied services (loans, interiors)",
                      ],
                    },
                    {
                      icon: DollarSign,
                      title: "Financial Services",
                      color: "bg-green-500/10 text-green-500",
                      flows: [
                        "KYC collection",
                        "Risk-based products",
                        "Policy renewals",
                      ],
                    },
                    {
                      icon: Heart,
                      title: "Healthcare",
                      color: "bg-red-500/10 text-red-500",
                      flows: [
                        "Appointment booking",
                        "Post-consultation follow-up",
                        "Prescription reminders",
                      ],
                    },
                    {
                      icon: ShoppingCart,
                      title: "E-commerce",
                      color: "bg-orange-500/10 text-orange-500",
                      flows: [
                        "Abandoned cart recovery",
                        "Order status updates",
                        "Loyalty engagement",
                      ],
                    },
                    {
                      icon: GraduationCap,
                      title: "Education",
                      color: "bg-purple-500/10 text-purple-500",
                      flows: [
                        "Admission inquiries",
                        "Course counseling",
                        "Alumni engagement",
                      ],
                    },
                  ].map((industry) => (
                    <Card key={industry.title} className="border-border/50">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${industry.color}`}>
                            <industry.icon className="h-5 w-5" />
                          </div>
                          <CardTitle className="text-base">{industry.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {industry.flows.map((flow) => (
                            <li key={flow} className="flex items-center gap-2">
                              <Zap className="h-3 w-3 text-primary" />
                              {flow}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Data Model */}
            <AccordionItem value="data" className="border border-border/50 rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-500/10">
                    <Database className="h-5 w-5 text-slate-500" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">Data Model</h3>
                    <p className="text-sm text-muted-foreground">
                      Core tables and relationships
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4">
                <div className="space-y-4">
                  {[
                    {
                      table: "crm_contacts",
                      desc: "Core entity with 5 ML scores",
                      fields: ["id", "full_name", "email", "phone", "intent_score", "engagement_score", "urgency_score", "churn_risk", "ltv_prediction", "lifecycle_stage"],
                    },
                    {
                      table: "crm_interactions",
                      desc: "Every touchpoint with sentiment",
                      fields: ["id", "contact_id", "channel", "direction", "summary", "sentiment", "intent_detected"],
                    },
                    {
                      table: "crm_variables",
                      desc: "AI-extracted conversation data",
                      fields: ["id", "contact_id", "variable_name", "variable_value", "confidence", "source_channel"],
                    },
                    {
                      table: "crm_agentic_flows",
                      desc: "Flow definitions",
                      fields: ["id", "name", "description", "flow_json", "global_prompt", "status"],
                    },
                  ].map((model) => (
                    <div key={model.table} className="border border-border/50 rounded-lg overflow-hidden">
                      <div className="bg-muted/50 p-3 border-b border-border/50">
                        <code className="font-mono font-semibold">{model.table}</code>
                        <p className="text-sm text-muted-foreground mt-1">{model.desc}</p>
                      </div>
                      <div className="p-3 flex flex-wrap gap-2">
                        {model.fields.map((field) => (
                          <Badge key={field} variant="secondary" className="font-mono text-xs">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Best Practices */}
            <AccordionItem value="best-practices" className="border border-border/50 rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-500/10">
                    <BookOpen className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">Best Practices for LTV Maximization</h3>
                    <p className="text-sm text-muted-foreground">
                      Strategies for optimal outcomes
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4">
                <div className="space-y-4">
                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Score-Based Segmentation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="border border-border/50 rounded-lg overflow-hidden text-sm">
                        <div className="grid grid-cols-3 font-medium bg-muted/50 p-2 border-b border-border/50">
                          <span>Segment</span>
                          <span>Criteria</span>
                          <span>Action</span>
                        </div>
                        {[
                          ["Hot Leads", "Intent > 70, Urgency > 50", "Immediate call"],
                          ["Nurture Pool", "Intent 30-70, Engagement > 40", "Educational drip"],
                          ["At Risk", "Churn Risk > 60", "Retention campaign"],
                          ["Champions", "LTV > ₹5L, Engagement > 80", "VIP treatment"],
                        ].map(([seg, criteria, action], i) => (
                          <div key={i} className="grid grid-cols-3 p-2 border-b border-border/50 last:border-0">
                            <span className="font-medium">{seg}</span>
                            <span className="text-muted-foreground">{criteria}</span>
                            <span className="text-primary">{action}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Channel Orchestration</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { icon: Phone, channel: "Voice", use: "Complex discussions, closing" },
                        { icon: MessageSquare, channel: "WhatsApp", use: "Quick updates, docs" },
                        { icon: Mail, channel: "Email", use: "Detailed info, formal" },
                        { icon: Zap, channel: "SMS", use: "Urgent alerts, OTPs" },
                      ].map((ch) => (
                        <div key={ch.channel} className="p-3 rounded-lg bg-muted/50 text-center">
                          <ch.icon className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                          <p className="font-medium text-sm">{ch.channel}</p>
                          <p className="text-xs text-muted-foreground">{ch.use}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Quick Links Footer */}
          <Card className="border-border/50 bg-muted/30">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Dashboard", href: "/crm/dashboard", icon: TrendingUp },
                  { label: "Contacts", href: "/crm/contacts", icon: Users },
                  { label: "Flow Builder", href: "/crm/flow-builder", icon: Workflow },
                  { label: "Settings", href: "/crm/settings", icon: Database },
                ].map((link) => (
                  <Button key={link.href} variant="outline" asChild className="justify-start">
                    <Link to={link.href}>
                      <link.icon className="mr-2 h-4 w-4" />
                      {link.label}
                    </Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </CRMLayout>
  );
};

export default CRMDocs;
