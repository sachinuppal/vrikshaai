import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Scale,
  FileText,
  Download,
  Shield,
  Server,
  Cloud,
  Building2,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

// Governance stack features
const governanceFeatures = [
  { id: "audit_logs", name: "Audit Logs", description: "Immutable, timestamped logs of all AI decisions" },
  { id: "data_privacy", name: "Data Privacy", description: "Consent management & data anonymization" },
  { id: "on_prem", name: "On-Device / On-Prem", description: "Deploy within your infrastructure" },
  { id: "regulatory", name: "Regulatory Tracking", description: "Real-time alerts for regulatory changes" },
  { id: "risk", name: "Risk Assessment", description: "Automated risk scoring for AI outputs" },
  { id: "versioning", name: "Versioning", description: "Full model version history with rollback" },
  { id: "explainability", name: "Explainability", description: "Human-readable AI decision explanations" },
  { id: "access_control", name: "Access Control", description: "Role-based permissions & audit trails" },
];

// Industries for compliance
const complianceIndustries = [
  { id: "finance", name: "Finance & Banking" },
  { id: "healthcare", name: "Healthcare" },
  { id: "energy", name: "Energy & Utilities" },
  { id: "government", name: "Municipal / Government" },
  { id: "law_enforcement", name: "Law Enforcement" },
  { id: "esg", name: "ESG / Infrastructure Investment" },
  { id: "smart_cities", name: "Smart Cities" },
];

// Deployment options
const deploymentOptions = [
  { id: "cloud", name: "Cloud", icon: Cloud },
  { id: "on_prem", name: "On-Premises", icon: Server },
  { id: "hybrid", name: "Hybrid", icon: Building2 },
  { id: "on_device", name: "On-Device", icon: Shield },
];

// Form schema
const formSchema = z.object({
  company_name: z.string().min(1, "Company name is required").max(200),
  contact_name: z.string().min(1, "Contact name is required").max(100),
  email: z.string().email("Invalid email address").max(255),
  phone: z.string().max(20).optional(),
  industry: z.string().min(1, "Please select an industry"),
  deployment_preference: z.string().min(1, "Please select deployment preference"),
  compliance_focus: z.array(z.string()).min(1, "Select at least one compliance focus"),
  consent: z.boolean().refine((val) => val === true, {
    message: "You must accept the data privacy agreement",
  }),
});

const checklistFormSchema = z.object({
  email: z.string().email("Invalid email address").max(255),
  company_name: z.string().min(1, "Company name is required").max(200),
  consent: z.boolean().refine((val) => val === true, {
    message: "You must accept to receive communications",
  }),
});

type FormData = z.infer<typeof formSchema>;
type ChecklistFormData = z.infer<typeof checklistFormSchema>;

interface ComplianceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: "pilot" | "checklist";
}

const ComplianceModal = ({ open, onOpenChange, initialMode = "pilot" }: ComplianceModalProps) => {
  const [mode, setMode] = useState<"select" | "pilot" | "checklist">(initialMode === "checklist" ? "checklist" : "select");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_name: "",
      contact_name: "",
      email: "",
      phone: "",
      industry: "",
      deployment_preference: "",
      compliance_focus: [],
      consent: false,
    },
  });

  const checklistForm = useForm<ChecklistFormData>({
    resolver: zodResolver(checklistFormSchema),
    defaultValues: {
      email: "",
      company_name: "",
      consent: false,
    },
  });

  const toggleFeature = (featureId: string) => {
    const newFeatures = selectedFeatures.includes(featureId)
      ? selectedFeatures.filter((id) => id !== featureId)
      : [...selectedFeatures, featureId];
    setSelectedFeatures(newFeatures);
    form.setValue("compliance_focus", newFeatures);
  };

  const onSubmitPilot = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const industryName = complianceIndustries.find((i) => i.id === data.industry)?.name || data.industry;
      const featureNames = data.compliance_focus.map(
        (id) => governanceFeatures.find((f) => f.id === id)?.name || id
      );

      // Insert into enterprise_leads with compliance-specific data
      const { error } = await supabase.from("enterprise_leads").insert({
        company_name: data.company_name,
        industry: industryName,
        use_cases: ["Compliance & Governance AI", ...featureNames],
        contact_name: data.contact_name,
        email: data.email,
        phone: data.phone || null,
        deployment_mode: data.deployment_preference,
        nda_accepted: data.consent,
      });

      if (error) throw error;

      // Send notification email
      try {
        await supabase.functions.invoke("send-compliance-notification", {
          body: {
            companyName: data.company_name,
            industry: industryName,
            complianceFocus: featureNames,
            deploymentPreference: data.deployment_preference,
            contactName: data.contact_name,
            email: data.email,
            phone: data.phone,
            requestType: "governance_pilot",
          },
        });
      } catch (emailError) {
        console.error("Failed to send notification email:", emailError);
      }

      toast({
        title: "Request Submitted!",
        description: "Our governance team will contact you within 24-48 hours.",
      });

      onOpenChange(false);
      form.reset();
      setSelectedFeatures([]);
      setMode("select");
    } catch (error) {
      console.error("Error submitting compliance request:", error);
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitChecklist = async (data: ChecklistFormData) => {
    setIsSubmitting(true);
    try {
      // Insert lead submission
      const { error } = await supabase.from("lead_submissions").insert({
        email: data.email,
        name: data.company_name,
        source: "compliance_checklist",
        ai_calling_consent: data.consent,
      });

      if (error) throw error;

      // Send notification
      try {
        await supabase.functions.invoke("send-compliance-notification", {
          body: {
            companyName: data.company_name,
            email: data.email,
            requestType: "checklist_download",
          },
        });
      } catch (emailError) {
        console.error("Failed to send notification:", emailError);
      }

      toast({
        title: "Checklist Ready!",
        description: "Your compliance readiness checklist is downloading.",
      });

      // Trigger download (placeholder PDF)
      const link = document.createElement("a");
      link.href = "/downloads/compliance-readiness-checklist.pdf";
      link.download = "Vriksha-AI-Compliance-Readiness-Checklist.pdf";
      link.click();

      onOpenChange(false);
      checklistForm.reset();
      setMode("select");
    } catch (error) {
      console.error("Error submitting checklist request:", error);
      toast({
        title: "Download Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetModal = () => {
    setMode("select");
    form.reset();
    checklistForm.reset();
    setSelectedFeatures([]);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetModal();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        {mode === "select" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-primary">
                <Scale className="w-5 h-5" />
                Compliance & Governance AI
              </DialogTitle>
              <DialogDescription>
                Enterprise-grade AI governance for regulated industries. No vendor lock-in, data never leaves your premises.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <Button
                variant="outline"
                className="group h-auto p-6 flex flex-col items-start gap-2 hover:border-primary hover:bg-primary/10"
                onClick={() => setMode("pilot")}
              >
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <Shield className="w-5 h-5" />
                  Request Governance Pilot / Compliance Audit
                </div>
                <p className="text-sm text-muted-foreground text-left group-hover:text-foreground">
                  Start a pilot program to test our governance stack with your infrastructure. Includes audit-log generation, regulatory tracking, and explainability dashboards.
                </p>
              </Button>

              <Button
                variant="outline"
                className="group h-auto p-6 flex flex-col items-start gap-2 hover:border-primary hover:bg-primary/10"
                onClick={() => setMode("checklist")}
              >
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <FileText className="w-5 h-5" />
                  Download Compliance Readiness Checklist
                </div>
                <p className="text-sm text-muted-foreground text-left group-hover:text-foreground">
                  Get our free enterprise AI compliance checklist covering data privacy, audit readiness, model documentation, access control, and regulatory alignment.
                </p>
              </Button>
            </div>

            {/* Key Features Preview */}
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-3">Governance Stack Features:</p>
              <div className="flex flex-wrap gap-2">
                {governanceFeatures.slice(0, 4).map((feature) => (
                  <Badge key={feature.id} variant="secondary" className="text-xs">
                    {feature.name}
                  </Badge>
                ))}
                <Badge variant="outline" className="text-xs">+4 more</Badge>
              </div>
            </div>
          </>
        )}

        {mode === "pilot" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-primary">
                <Shield className="w-5 h-5" />
                Request Governance Pilot
              </DialogTitle>
              <DialogDescription>
                Start with a focused pilot — hybrid deployment, no vendor lock-in.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitPilot)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="company_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Acme Corp" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contact_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@acme.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="+91 98765 43210" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {complianceIndustries.map((industry) => (
                              <SelectItem key={industry.id} value={industry.id}>
                                {industry.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="deployment_preference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deployment Preference</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select deployment" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {deploymentOptions.map((option) => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="compliance_focus"
                  render={() => (
                    <FormItem>
                      <FormLabel>Compliance Focus (Select all that apply)</FormLabel>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {governanceFeatures.map((feature) => (
                          <div
                            key={feature.id}
                            onClick={() => toggleFeature(feature.id)}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              selectedFeatures.includes(feature.id)
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/30"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <CheckCircle2
                                className={`w-4 h-4 ${
                                  selectedFeatures.includes(feature.id)
                                    ? "text-primary"
                                    : "text-muted-foreground/30"
                                }`}
                              />
                              <span className="text-sm font-medium">{feature.name}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="consent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm text-muted-foreground">
                          I agree to the data privacy terms and authorize Vriksha.ai to contact me regarding governance solutions.
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setMode("select")}>
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Request Pilot"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </form>
            </Form>
          </>
        )}

        {mode === "checklist" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-primary">
                <Download className="w-5 h-5" />
                Download Compliance Checklist
              </DialogTitle>
              <DialogDescription>
                Get our comprehensive AI compliance readiness checklist — covers data privacy, audit trails, documentation, and regulatory alignment.
              </DialogDescription>
            </DialogHeader>

            <Form {...checklistForm}>
              <form onSubmit={checklistForm.handleSubmit(onSubmitChecklist)} className="space-y-4">
                <FormField
                  control={checklistForm.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Corp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={checklistForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@acme.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={checklistForm.control}
                  name="consent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm text-muted-foreground">
                          I agree to receive communications from Vriksha.ai about AI governance and compliance solutions.
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setMode("select")}>
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? "Processing..." : "Download Checklist"}
                    <Download className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ComplianceModal;