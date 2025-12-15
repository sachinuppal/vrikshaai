import { useState, useMemo } from "react";
import { 
  Stethoscope, 
  CreditCard, 
  ShoppingCart, 
  Headphones,
  Pill,
  UserCheck,
  Building2,
  FileText,
  Wallet,
  Package,
  ShoppingBag,
  RefreshCw,
  Wrench,
  HelpCircle,
  MessageSquare,
  Search,
  LayoutTemplate
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ScriptSection } from "@/pages/ScriptStudio";

// Industry categories
type IndustryCategory = "All" | "Healthcare" | "Finance" | "E-commerce" | "Customer Support";

interface ScriptTemplate {
  id: string;
  name: string;
  description: string;
  industry: IndustryCategory;
  useCase: string;
  icon: React.ComponentType<{ className?: string }>;
  tags: string[];
  sections: ScriptSection[];
}

// Helper to create pre-filled sections
const createSections = (overrides: Partial<Record<string, Record<string, any>>>): ScriptSection[] => {
  const baseSections = [
    { id: "identity_framing", name: "Identity & Framing" },
    { id: "objectives", name: "Objectives & Success Criteria" },
    { id: "conversation_contract", name: "Conversation Contract" },
    { id: "operating_context", name: "Operating Context" },
    { id: "stt_instructions", name: "STT Instructions" },
    { id: "tts_instructions", name: "TTS Instructions" },
    { id: "turn_taking", name: "Turn-Taking & Dialogue" },
    { id: "task_logic", name: "Task Logic" },
    { id: "core_flows", name: "Core Call Flows" },
    { id: "guardrails", name: "Guardrails & Safety" },
    { id: "knowledge_grounding", name: "Knowledge & Grounding" },
    { id: "faq_pack", name: "FAQ Pack" },
    { id: "compliance_policy", name: "Compliance & Policy" },
    { id: "ux_guidelines", name: "UX Guidelines" },
    { id: "output_formats", name: "Output Formats" },
    { id: "testing_config", name: "Testing & Evaluation" },
    { id: "deployment_config", name: "Deployment Config" },
    { id: "usage_guidelines", name: "Usage Guidelines" },
  ];

  return baseSections.map(section => ({
    ...section,
    content: overrides[section.id] || {},
    isComplete: !!overrides[section.id] && Object.keys(overrides[section.id]).length > 0,
  }));
};

// Industry Templates
const SCRIPT_TEMPLATES: ScriptTemplate[] = [
  // Healthcare Templates
  {
    id: "healthcare-appointment",
    name: "Appointment Booking",
    description: "Schedule, confirm, and reschedule medical appointments with HIPAA-compliant handling",
    industry: "Healthcare",
    useCase: "Appointment Booking",
    icon: Stethoscope,
    tags: ["Healthcare", "Appointments", "Medical", "HIPAA", "Scheduling"],
    sections: createSections({
      identity_framing: {
        agentName: "Medical Scheduling Assistant",
        agentRole: "Healthcare Appointment Coordinator",
        companyName: "[Clinic/Hospital Name]",
        personality: "Professional, empathetic, and efficient",
        openingGreeting: "Hello, this is [Agent Name] from [Clinic Name]. How may I assist you with your appointment today?"
      },
      objectives: {
        primaryGoal: "Schedule, confirm, or reschedule patient appointments efficiently",
        successMetrics: ["Appointment booked/confirmed", "Patient verified", "Appointment details communicated clearly"],
        failureConditions: ["Unable to verify patient identity", "No available slots match patient needs"]
      },
      guardrails: {
        prohibited: ["Providing medical advice", "Discussing diagnoses", "Sharing other patient information"],
        required: ["Patient verification before sharing details", "HIPAA compliance", "Clear communication of next steps"]
      },
      compliance_policy: {
        regulations: ["HIPAA", "PHI Protection"],
        dataHandling: "No PHI shared without verification. All calls recorded for quality assurance.",
        consentRequired: true
      },
      core_flows: {
        mainFlow: "1. Greet patient → 2. Verify identity (DOB, name) → 3. Determine intent (new/reschedule/confirm) → 4. Check availability → 5. Book/modify → 6. Confirm details → 7. Send reminder",
        escalationPath: "Transfer to human scheduler for complex cases or insurance verification"
      }
    })
  },
  {
    id: "healthcare-prescription",
    name: "Prescription Refill",
    description: "Handle prescription refill requests with patient verification and pharmacy coordination",
    industry: "Healthcare",
    useCase: "Prescription Management",
    icon: Pill,
    tags: ["Healthcare", "Prescriptions", "Pharmacy", "Refills", "HIPAA"],
    sections: createSections({
      identity_framing: {
        agentName: "Prescription Refill Assistant",
        agentRole: "Pharmacy Coordination Specialist",
        companyName: "[Pharmacy/Clinic Name]",
        personality: "Helpful, accurate, and reassuring",
        openingGreeting: "Hello, this is [Agent Name] from [Pharmacy Name]. I'm calling to help you with your prescription refill request."
      },
      objectives: {
        primaryGoal: "Process prescription refill requests and coordinate with pharmacy",
        successMetrics: ["Refill request submitted", "Pickup/delivery confirmed", "Patient informed of status"],
        failureConditions: ["Prescription expired", "Controlled substance requiring doctor approval", "Insurance issues"]
      },
      guardrails: {
        prohibited: ["Recommending dosage changes", "Providing drug interaction advice", "Processing expired prescriptions"],
        required: ["Verify patient identity", "Confirm medication details", "Explain refill timeline"]
      },
      compliance_policy: {
        regulations: ["HIPAA", "DEA for controlled substances"],
        dataHandling: "Patient verification required. Controlled substances require additional authorization.",
        consentRequired: true
      }
    })
  },
  {
    id: "healthcare-followup",
    name: "Patient Follow-up",
    description: "Post-visit follow-up calls with feedback collection and care instructions",
    industry: "Healthcare",
    useCase: "Patient Follow-up",
    icon: UserCheck,
    tags: ["Healthcare", "Follow-up", "Patient Care", "Feedback", "CSAT"],
    sections: createSections({
      identity_framing: {
        agentName: "Patient Care Coordinator",
        agentRole: "Post-Visit Follow-up Specialist",
        companyName: "[Healthcare Provider Name]",
        personality: "Caring, attentive, and thorough",
        openingGreeting: "Hello, this is [Agent Name] from [Provider Name]. I'm calling to check on how you're doing after your recent visit."
      },
      objectives: {
        primaryGoal: "Conduct post-visit follow-up, gather feedback, and ensure patient understanding of care instructions",
        successMetrics: ["Patient contacted within 48 hours", "Care instructions confirmed", "Feedback collected"],
        failureConditions: ["Patient reports concerning symptoms", "Unable to reach patient after 3 attempts"]
      },
      guardrails: {
        prohibited: ["Modifying treatment plans", "Diagnosing new symptoms", "Adjusting medications"],
        required: ["Immediate escalation for emergency symptoms", "Document all patient concerns", "Schedule follow-up if needed"]
      }
    })
  },

  // Finance Templates
  {
    id: "finance-debt-collection",
    name: "Debt Collection",
    description: "Compliant debt collection with payment negotiation and dispute handling",
    industry: "Finance",
    useCase: "Debt Collection",
    icon: CreditCard,
    tags: ["Finance", "Collections", "Debt", "FDCPA", "Payments"],
    sections: createSections({
      identity_framing: {
        agentName: "Account Resolution Specialist",
        agentRole: "Debt Collection Agent",
        companyName: "[Collection Agency Name]",
        personality: "Professional, firm yet respectful, solution-oriented",
        openingGreeting: "Hello, this is [Agent Name] from [Company Name]. I'm calling regarding your account. This is an attempt to collect a debt, and any information obtained will be used for that purpose."
      },
      objectives: {
        primaryGoal: "Collect outstanding debt while maintaining compliance and exploring payment options",
        successMetrics: ["Payment collected or arrangement made", "Account updated", "Compliance maintained"],
        failureConditions: ["Consumer requests cease communication", "Dispute filed", "Unable to verify identity"]
      },
      guardrails: {
        prohibited: ["Threatening language", "Calling outside allowed hours", "Discussing debt with third parties", "Misrepresenting amount owed"],
        required: ["Mini-Miranda disclosure", "Debt validation on request", "Document all communications"]
      },
      compliance_policy: {
        regulations: ["FDCPA", "TCPA", "State collection laws"],
        dataHandling: "All calls recorded. Consumer rights must be disclosed on request.",
        consentRequired: true
      },
      core_flows: {
        mainFlow: "1. Verify identity → 2. Mini-Miranda disclosure → 3. State amount owed → 4. Discuss payment options → 5. Handle objections/disputes → 6. Set up payment/arrangement → 7. Confirm terms",
        escalationPath: "Transfer to supervisor for disputes, hardship cases, or settlement negotiations"
      }
    })
  },
  {
    id: "finance-loan-application",
    name: "Loan Pre-Qualification",
    description: "Pre-qualify leads and collect loan application details with credit disclosure",
    industry: "Finance",
    useCase: "Loan Applications",
    icon: Building2,
    tags: ["Finance", "Loans", "Pre-qualification", "Credit", "Mortgage"],
    sections: createSections({
      identity_framing: {
        agentName: "Loan Specialist",
        agentRole: "Pre-Qualification Agent",
        companyName: "[Lender Name]",
        personality: "Knowledgeable, trustworthy, and patient",
        openingGreeting: "Hello, this is [Agent Name] from [Lender Name]. I'm calling to help you explore your loan options and see what you might qualify for."
      },
      objectives: {
        primaryGoal: "Pre-qualify leads for loans and collect necessary application information",
        successMetrics: ["Lead pre-qualified", "Application started", "Required disclosures provided"],
        failureConditions: ["Applicant doesn't meet minimum requirements", "Missing required documentation"]
      },
      guardrails: {
        prohibited: ["Guaranteeing approval", "Providing exact rates without disclaimer", "Discriminatory questions"],
        required: ["Equal Credit Opportunity Act compliance", "Required disclosures", "Income/employment verification"]
      },
      compliance_policy: {
        regulations: ["ECOA", "TILA", "RESPA", "FCRA"],
        dataHandling: "Credit pulls require explicit consent. All disclosures must be provided.",
        consentRequired: true
      }
    })
  },
  {
    id: "finance-account-services",
    name: "Account Services",
    description: "Balance inquiries, payment reminders, and account updates",
    industry: "Finance",
    useCase: "Account Management",
    icon: Wallet,
    tags: ["Finance", "Account Services", "Payments", "Balance", "Banking"],
    sections: createSections({
      identity_framing: {
        agentName: "Account Services Representative",
        agentRole: "Customer Account Specialist",
        companyName: "[Financial Institution Name]",
        personality: "Helpful, secure-minded, and efficient",
        openingGreeting: "Hello, this is [Agent Name] from [Bank Name]. I'm calling to help with your account. For security purposes, I'll need to verify your identity first."
      },
      objectives: {
        primaryGoal: "Provide account information and process account-related requests securely",
        successMetrics: ["Customer request resolved", "Identity verified", "Account updated if needed"],
        failureConditions: ["Failed identity verification", "Suspected fraud detected"]
      },
      guardrails: {
        prohibited: ["Sharing account info without verification", "Processing transactions over limit", "Bypassing security protocols"],
        required: ["Multi-factor identity verification", "Transaction confirmation", "Fraud alert triggers"]
      }
    })
  },

  // E-commerce Templates
  {
    id: "ecommerce-order-status",
    name: "Order Status & Tracking",
    description: "Track orders, handle delivery issues, and process returns",
    industry: "E-commerce",
    useCase: "Order Management",
    icon: Package,
    tags: ["E-commerce", "Orders", "Tracking", "Delivery", "Returns"],
    sections: createSections({
      identity_framing: {
        agentName: "Order Support Specialist",
        agentRole: "Customer Order Assistant",
        companyName: "[E-commerce Company Name]",
        personality: "Friendly, proactive, and solution-focused",
        openingGreeting: "Hi there! This is [Agent Name] from [Company Name]. I'm here to help with your order. Can I have your order number please?"
      },
      objectives: {
        primaryGoal: "Provide order status updates, resolve delivery issues, and process returns/exchanges",
        successMetrics: ["Status provided", "Issue resolved", "Customer satisfaction"],
        failureConditions: ["Order not found", "Complex return requiring manager approval"]
      },
      core_flows: {
        mainFlow: "1. Greet → 2. Get order number → 3. Verify customer → 4. Provide status → 5. Handle issues → 6. Process action → 7. Confirm next steps",
        escalationPath: "Transfer to supervisor for refunds over limit, damaged items, or fraud concerns"
      },
      guardrails: {
        prohibited: ["Processing refunds over authorized limit", "Sharing customer info", "Making promises on delivery times"],
        required: ["Verify order ownership", "Document all issues", "Provide tracking info"]
      }
    })
  },
  {
    id: "ecommerce-cart-abandonment",
    name: "Cart Abandonment Recovery",
    description: "Follow up on abandoned carts with personalized offers and assistance",
    industry: "E-commerce",
    useCase: "Cart Recovery",
    icon: ShoppingBag,
    tags: ["E-commerce", "Cart Abandonment", "Sales", "Recovery", "Offers"],
    sections: createSections({
      identity_framing: {
        agentName: "Shopping Assistant",
        agentRole: "Cart Recovery Specialist",
        companyName: "[E-commerce Company Name]",
        personality: "Helpful, not pushy, genuinely interested in helping",
        openingGreeting: "Hi! This is [Agent Name] from [Company Name]. I noticed you left some items in your cart and wanted to see if I can help you complete your purchase."
      },
      objectives: {
        primaryGoal: "Recover abandoned carts by addressing concerns and offering assistance",
        successMetrics: ["Cart recovered", "Customer concern addressed", "Offer redeemed"],
        failureConditions: ["Customer requests no contact", "Competitor already purchased from"]
      },
      guardrails: {
        prohibited: ["Being pushy or aggressive", "Multiple calls if declined", "Sharing unauthorized discounts"],
        required: ["Respect opt-out requests", "Offer help before discounts", "Document call outcome"]
      },
      task_logic: {
        discountTiers: ["10% for first-time customers", "Free shipping for orders over $50", "15% for cart value > $100"],
        escalationTriggers: ["Customer mentions competitor", "Requests manager", "Cart value > $500"]
      }
    })
  },
  {
    id: "ecommerce-product-support",
    name: "Product Support",
    description: "Handle product questions, troubleshooting, and usage guidance",
    industry: "E-commerce",
    useCase: "Product Support",
    icon: RefreshCw,
    tags: ["E-commerce", "Products", "Support", "Troubleshooting", "FAQ"],
    sections: createSections({
      identity_framing: {
        agentName: "Product Specialist",
        agentRole: "Customer Product Support",
        companyName: "[E-commerce Company Name]",
        personality: "Knowledgeable, patient, and thorough",
        openingGreeting: "Hello! This is [Agent Name] from [Company Name]. I'm here to help you with any product questions. What can I assist you with today?"
      },
      objectives: {
        primaryGoal: "Answer product questions and provide troubleshooting assistance",
        successMetrics: ["Question answered", "Issue resolved", "Customer satisfied"],
        failureConditions: ["Technical issue requiring manufacturer", "Defective product needing return"]
      },
      knowledge_grounding: {
        sources: ["Product database", "User manuals", "FAQ system", "Troubleshooting guides"],
        fallback: "I don't have that information, but let me find someone who does."
      }
    })
  },

  // Customer Support Templates
  {
    id: "support-technical",
    name: "Technical Support",
    description: "IT helpdesk with troubleshooting flows and escalation paths",
    industry: "Customer Support",
    useCase: "Technical Support",
    icon: Wrench,
    tags: ["Support", "Technical", "IT", "Helpdesk", "Troubleshooting"],
    sections: createSections({
      identity_framing: {
        agentName: "Tech Support Specialist",
        agentRole: "IT Helpdesk Agent",
        companyName: "[Company Name]",
        personality: "Patient, clear-communicating, technically competent",
        openingGreeting: "Hello, this is [Agent Name] from [Company] Tech Support. I'm here to help resolve your technical issue. Could you describe what you're experiencing?"
      },
      objectives: {
        primaryGoal: "Diagnose and resolve technical issues through guided troubleshooting",
        successMetrics: ["Issue resolved on first call", "Ticket created if escalated", "Customer understands solution"],
        failureConditions: ["Hardware failure requiring replacement", "Issue requires on-site visit"]
      },
      core_flows: {
        mainFlow: "1. Identify issue → 2. Gather system info → 3. Check known issues → 4. Guide troubleshooting → 5. Verify resolution → 6. Document solution",
        escalationPath: "Tier 2 for complex issues, Hardware team for physical problems, Security for potential breaches"
      },
      task_logic: {
        troubleshootingSteps: ["Restart device", "Clear cache", "Check connectivity", "Verify settings", "Reinstall if needed"],
        knownIssues: ["Check status page for outages", "Reference known bug database"]
      }
    })
  },
  {
    id: "support-general",
    name: "General Inquiries",
    description: "Handle common questions and route to specialists when needed",
    industry: "Customer Support",
    useCase: "General Support",
    icon: HelpCircle,
    tags: ["Support", "General", "Inquiries", "Routing", "FAQ"],
    sections: createSections({
      identity_framing: {
        agentName: "Customer Service Representative",
        agentRole: "General Support Agent",
        companyName: "[Company Name]",
        personality: "Warm, helpful, and resourceful",
        openingGreeting: "Hello and thank you for calling [Company Name]. My name is [Agent Name]. How can I help you today?"
      },
      objectives: {
        primaryGoal: "Answer customer inquiries and route to appropriate departments",
        successMetrics: ["Inquiry resolved or properly routed", "Customer satisfied", "Wait time minimized"],
        failureConditions: ["Cannot identify customer need", "All specialists unavailable"]
      },
      core_flows: {
        mainFlow: "1. Greet → 2. Identify need → 3. Check if can resolve → 4. Resolve or route → 5. Confirm satisfaction → 6. Close",
        escalationPath: "Route to: Sales, Billing, Technical, Complaints, or Manager based on need"
      },
      faq_pack: {
        commonQuestions: ["Hours of operation", "Return policy", "Pricing information", "Contact methods", "Account access"],
        transferPhrases: ["Let me connect you with...", "I'll transfer you to a specialist who can...", "The best person to help with this is..."]
      }
    })
  },
  {
    id: "support-feedback",
    name: "Feedback Collection",
    description: "CSAT surveys, NPS collection, and customer feedback gathering",
    industry: "Customer Support",
    useCase: "Feedback & Surveys",
    icon: MessageSquare,
    tags: ["Support", "Feedback", "CSAT", "NPS", "Surveys"],
    sections: createSections({
      identity_framing: {
        agentName: "Customer Experience Specialist",
        agentRole: "Feedback Collection Agent",
        companyName: "[Company Name]",
        personality: "Appreciative, non-intrusive, genuinely interested",
        openingGreeting: "Hello! This is [Agent Name] from [Company Name]. We value your opinion and would love to hear about your recent experience. Do you have a few minutes to share your feedback?"
      },
      objectives: {
        primaryGoal: "Collect customer feedback through structured surveys",
        successMetrics: ["Survey completed", "Actionable feedback collected", "Detractors flagged for follow-up"],
        failureConditions: ["Customer refuses to participate", "Negative feedback requiring immediate escalation"]
      },
      task_logic: {
        surveyQuestions: [
          "On a scale of 1-10, how likely are you to recommend us?",
          "How satisfied were you with your recent interaction?",
          "What could we have done better?",
          "Is there anything else you'd like to share?"
        ],
        escalationTriggers: ["NPS score < 7", "Serious complaint mentioned", "Request to speak to manager"]
      },
      guardrails: {
        prohibited: ["Pressuring for positive feedback", "Arguing with negative feedback", "Promising compensation without authorization"],
        required: ["Thank customer regardless of feedback", "Document all responses", "Flag serious issues immediately"]
      }
    })
  }
];

interface ScriptTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: {
    name: string;
    description: string;
    useCase: string;
    industry: string;
    sections: ScriptSection[];
  }) => void;
}

export const ScriptTemplatesModal = ({
  isOpen,
  onClose,
  onSelectTemplate,
}: ScriptTemplatesModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<IndustryCategory>("All");

  const categories: IndustryCategory[] = ["All", "Healthcare", "Finance", "E-commerce", "Customer Support"];

  const filteredTemplates = useMemo(() => {
    return SCRIPT_TEMPLATES.filter(template => {
      const matchesCategory = selectedCategory === "All" || template.industry === selectedCategory;
      const matchesSearch = searchQuery === "" || 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const handleSelectTemplate = (template: ScriptTemplate) => {
    onSelectTemplate({
      name: template.name,
      description: template.description,
      useCase: template.useCase,
      industry: template.industry,
      sections: template.sections,
    });
    onClose();
  };

  const getCategoryIcon = (category: IndustryCategory) => {
    switch (category) {
      case "Healthcare": return Stethoscope;
      case "Finance": return CreditCard;
      case "E-commerce": return ShoppingCart;
      case "Customer Support": return Headphones;
      default: return LayoutTemplate;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5 text-primary" />
            Script Templates
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = getCategoryIcon(category);
              return (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {category}
                </Button>
              );
            })}
          </div>

          {/* Template Grid */}
          <ScrollArea className="h-[50vh]">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pr-4">
              {filteredTemplates.map((template) => {
                const Icon = template.icon;
                const completeSections = template.sections.filter(s => s.isComplete).length;
                
                return (
                  <div
                    key={template.id}
                    className="group relative rounded-lg border border-border/50 bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md cursor-pointer"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium leading-tight">{template.name}</h3>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                          {template.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {template.industry}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {completeSections} sections pre-filled
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/80 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button size="sm" className="gap-2">
                        <LayoutTemplate className="h-4 w-4" />
                        Use Template
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <LayoutTemplate className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">No templates found matching your search.</p>
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
