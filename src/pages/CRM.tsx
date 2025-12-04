import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FadeInView, ScaleInView, StaggerContainer } from "@/components/animations";
import {
  HeroPipeline,
  RelationshipTimeline,
  IndustryGraph,
  VoiceToProfileDemo,
  NextBestActionAnimation,
} from "@/components/crm";
import { motion } from "framer-motion";
import {
  TreeDeciduous,
  Shield,
  Phone,
  Brain,
  Zap,
  BarChart3,
  Network,
  Bot,
  Building2,
  Plug,
  Layers,
  Rocket,
  Check,
  X,
  Home,
  Banknote,
  ShoppingCart,
  Sun,
  Heart,
  GraduationCap,
  Wrench,
  Send,
  Loader2,
} from "lucide-react";

const formSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  company_name: z.string().min(2, "Company name is required"),
  industry: z.string().min(1, "Please select an industry"),
  estimated_lead_volume: z.string().optional(),
  current_crm: z.string().optional(),
  key_pain_point: z.string().min(10, "Please describe your pain point"),
  pilot_path: z.string().min(1, "Please select a pilot path"),
  phone: z.string().min(10, "Valid phone number required"),
  email: z.string().email("Valid email required"),
  preferred_time: z.string().optional(),
  consent: z.boolean().refine((val) => val === true, "Consent is required"),
});

type FormData = z.infer<typeof formSchema>;

const CRM = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      company_name: "",
      industry: "",
      estimated_lead_volume: "",
      current_crm: "",
      key_pain_point: "",
      pilot_path: "",
      phone: "",
      email: "",
      preferred_time: "",
      consent: false,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const { error: dbError } = await supabase.from("crm_leads").insert({
        full_name: data.full_name,
        company_name: data.company_name,
        industry: data.industry,
        estimated_lead_volume: data.estimated_lead_volume || null,
        current_crm: data.current_crm || null,
        key_pain_point: data.key_pain_point,
        pilot_path: data.pilot_path,
        phone: data.phone,
        email: data.email,
        preferred_time: data.preferred_time || null,
        consent: data.consent,
      });

      if (dbError) throw dbError;

      // Send notification email
      await supabase.functions.invoke("send-crm-notification", {
        body: data,
      });

      toast({
        title: "Pilot Request Submitted!",
        description: "Our team will contact you within 24 hours.",
      });
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const industries = [
    { value: "real_estate", label: "Real Estate" },
    { value: "finance", label: "Finance & Banking" },
    { value: "retail", label: "Retail & E-Commerce" },
    { value: "energy", label: "Energy / Solar" },
    { value: "healthcare", label: "Healthcare" },
    { value: "education", label: "Education" },
    { value: "services", label: "Professional Services" },
    { value: "other", label: "Other" },
  ];

  const pilotPaths = [
    { value: "voice_ai", label: "Voice AI Pilot" },
    { value: "crm_automation", label: "CRM Automation Pilot" },
    { value: "industry_graph", label: "Industry Opportunity Graph Pilot" },
    { value: "full_enterprise", label: "Full Enterprise Integration" },
  ];

  const features = [
    {
      icon: Shield,
      title: "Consent First. Always.",
      description: "API-driven consent capture, web embed forms, dialer-driven compliance, and audit-grade logs for regulated industries.",
    },
    {
      icon: Phone,
      title: "AI Voice Calls That Understand Context",
      description: "Inbound, outbound, website embedded. Multilingual, natural conversations. Zero call-center overhead.",
    },
    {
      icon: Brain,
      title: "Auto-Updates Customer Profiles",
      description: "Name, demographics, product interest, budget, timelines, objections, sentiment—all auto-linked. No typing required.",
    },
    {
      icon: Zap,
      title: "AI Decides Next Best Action",
      description: "WhatsApp follow-ups, email sequences, SMS, AI voice re-engagement, retargeting ads, sales alerts—autonomous intelligence.",
    },
    {
      icon: BarChart3,
      title: "Beautiful Vertical Timeline",
      description: "Every call, message, AI insight, sentiment shift in a single chronological view. One truth. Zero silos.",
    },
    {
      icon: Network,
      title: "Industry Graph — Connected Opportunities",
      description: "One lead becomes a network of revenue nodes. Auto-expand into allied services and partners.",
    },
    {
      icon: Bot,
      title: "Autonomous AI Relationship Manager",
      description: "Remembers every interaction, predicts conversion, flags risks, recommends growth actions over months and years.",
    },
  ];

  const industryCards = [
    {
      icon: Home,
      title: "Real Estate",
      description: "Voice qualification → Loan Intel → Interiors → Renovation → Services",
      color: "from-blue-500/20 to-blue-600/10",
    },
    {
      icon: Banknote,
      title: "Finance",
      description: "KYC calls → Loan workflows → Risk-based follow-ups → Renewal intelligence",
      color: "from-green-500/20 to-green-600/10",
    },
    {
      icon: ShoppingCart,
      title: "Retail & E-Commerce",
      description: "Re-engagement calls → Abandoned cart recovery → Personalized nudges",
      color: "from-purple-500/20 to-purple-600/10",
    },
    {
      icon: Sun,
      title: "Energy / Solar",
      description: "Site feasibility → Government subsidy workflows → Installation → AMC reminders",
      color: "from-yellow-500/20 to-yellow-600/10",
    },
    {
      icon: Heart,
      title: "Healthcare",
      description: "Appointment care → Post-care nurturing → Insurance linkage",
      color: "from-red-500/20 to-red-600/10",
    },
    {
      icon: GraduationCap,
      title: "Education",
      description: "Admissions → Counseling → Batch follow-ups → Fee reminders",
      color: "from-indigo-500/20 to-indigo-600/10",
    },
    {
      icon: Wrench,
      title: "Services",
      description: "Consultations → Renewals → Upsells → Cross-sell intelligence",
      color: "from-orange-500/20 to-orange-600/10",
    },
  ];

  const comparisonItems = [
    { old: "Manual data entry", new: "Autonomous AI voice & messaging" },
    { old: "No intelligence", new: "Industry graph expansion" },
    { old: "No voice", new: "Personalized, evolving relationships" },
    { old: "No relationship memory", new: "Cross-product revenue node generation" },
    { old: "No cross-industry expansion", new: "Enterprise-grade compliance" },
    { old: "No automation beyond templates", new: "True lifecycle continuity" },
  ];

  const integrations = [
    "Webhooks",
    "Zapier",
    "REST APIs",
    "WhatsApp Cloud",
    "Email SMTP",
    "Telephony",
    "Website embeds",
    "Custom enterprise connectors",
  ];

  const pilotOptions = [
    {
      title: "Voice AI Pilot",
      description: "AI calls + data extraction + next-best-action automation",
      icon: Phone,
    },
    {
      title: "CRM Automation Pilot",
      description: "Automate workflows, timelines, tasks, follow-ups, next actions",
      icon: Zap,
    },
    {
      title: "Industry Graph Pilot",
      description: "Expand one vertical into 8–10 allied product verticals",
      icon: Network,
    },
    {
      title: "Full Enterprise Integration",
      description: "AI CRM + Voice + WhatsApp + Satellite + Video AI unified deployment",
      icon: Building2,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="container mx-auto max-w-6xl relative z-10">
          <FadeInView>
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <TreeDeciduous className="w-12 h-12 text-primary" />
                <h1 className="text-4xl md:text-6xl font-bold text-foreground">
                  Vriksha AI CRM
                </h1>
              </div>
              <p className="text-2xl md:text-3xl text-primary font-semibold mb-6">
                The World's First AI Relationship Engine
              </p>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                From Consent → Conversation → Relationship
              </p>
              
              {/* Hero Pipeline Animation */}
              <HeroPipeline />
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  size="lg"
                  className="mt-4 gap-2"
                  onClick={() => document.getElementById("pilot-form")?.scrollIntoView({ behavior: "smooth" })}
                >
                  <Rocket className="w-5 h-5" />
                  Start Your AI CRM Pilot
                </Button>
              </motion.div>
            </div>
          </FadeInView>
        </div>
      </section>

      {/* The Old CRM Is Dead Section */}
      <section className="py-20 px-4 bg-card/50">
        <div className="container mx-auto max-w-6xl">
          <FadeInView>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                💬 The Old CRM Is Dead. This Is What Comes Next.
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Legacy CRMs do one thing badly — store data. They don't understand conversations.
                They don't act autonomously. They don't build relationships.
              </p>
            </div>
          </FadeInView>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <Card className="p-6 bg-destructive/5 border-destructive/20">
              <h3 className="text-xl font-semibold text-destructive mb-4">Legacy CRM</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-muted-foreground">
                  <X className="w-5 h-5 text-destructive flex-shrink-0" />
                  Stores data passively
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <X className="w-5 h-5 text-destructive flex-shrink-0" />
                  Doesn't understand conversations
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <X className="w-5 h-5 text-destructive flex-shrink-0" />
                  Manual everything
                </li>
              </ul>
            </Card>

            <Card className="p-6 bg-primary/5 border-primary/20">
              <h3 className="text-xl font-semibold text-primary mb-4">Vriksha AI CRM</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-foreground">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  It listens.
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  It learns.
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  It decides.
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  It expands opportunities automatically.
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Features Sections */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <FadeInView>
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-16">
              Core Capabilities
            </h2>
          </FadeInView>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
            {features.map((feature, index) => (
              <ScaleInView key={index}>
                <Card className="p-6 h-full hover:border-primary/30 hover:-translate-y-1 hover:shadow-[0_8px_30px_hsl(var(--primary)/0.15)] active:scale-[0.98] transition-all duration-200 group">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </Card>
              </ScaleInView>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Voice to Profile Demo Section */}
      <section className="py-20 px-4 bg-card/50">
        <div className="container mx-auto max-w-6xl">
          <FadeInView>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                🎙️ Voice Call → Transcript → Profile Auto-Update
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Watch AI listen, understand, and update customer profiles in real-time. No typing required.
              </p>
            </div>
          </FadeInView>
          
          <VoiceToProfileDemo />
        </div>
      </section>

      {/* Relationship Timeline Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <FadeInView>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                📊 Beautiful Vertical Timeline of Every Interaction
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                One view. One truth. Zero silos. See the complete journey from first contact to lifetime value.
              </p>
            </div>
          </FadeInView>
          
          <RelationshipTimeline />
        </div>
      </section>
      {/* Industry Graph Example - Now with Animation */}
      <section className="py-20 px-4 bg-card/50">
        <div className="container mx-auto max-w-6xl">
          <FadeInView>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                🌐 Industry Graph — Connected Opportunities Auto-Expand
              </h2>
              <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                One lead becomes a network of revenue nodes. Watch opportunities expand automatically.
              </p>
            </div>
          </FadeInView>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Example: A Real-Estate Lead
              </h3>
              <p className="text-muted-foreground mb-6">
                When a buyer expresses interest in a 3BHK apartment, our AI automatically identifies and triggers workflows for 10+ allied services.
              </p>
              <ul className="space-y-3">
                {["Home Loan → Partner bank outreach", "Interior Design → Consultation scheduling", "Legal Services → Document verification", "Smart Home → Automation quote"].map((item, i) => (
                  <motion.li
                    key={i}
                    className="flex items-center gap-2 text-foreground"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
            <IndustryGraph />
          </div>
        </div>
      </section>

      {/* Next Best Action Animation */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <FadeInView>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                🧠 AI Decides. Channels Execute. You Scale.
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Watch the AI brain analyze context and orchestrate multi-channel actions autonomously.
              </p>
            </div>
          </FadeInView>
          
          <NextBestActionAnimation />
        </div>
      </section>

      {/* Industry Verticals */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <FadeInView>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                🏢 Plug Into Any Industry — Instantly
              </h2>
              <p className="text-muted-foreground text-lg">
                Vriksha AI CRM works across all major verticals
              </p>
            </div>
          </FadeInView>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" staggerDelay={0.08}>
            {industryCards.map((industry, index) => (
              <ScaleInView key={index}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className={`p-6 h-full bg-gradient-to-br ${industry.color} border-0`}>
                    <industry.icon className="w-10 h-10 text-primary mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {industry.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {industry.description}
                    </p>
                  </Card>
                </motion.div>
              </ScaleInView>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20 px-4 bg-card/50">
        <div className="container mx-auto max-w-6xl">
          <FadeInView>
            <div className="text-center mb-12">
              <Plug className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Integrations That Take Minutes, Not Weeks
              </h2>
              <p className="text-muted-foreground text-lg">
                No engineering nightmare. Just plug, play, and scale.
              </p>
            </div>
          </FadeInView>

          <div className="flex flex-wrap justify-center gap-4">
            {integrations.map((integration, index) => (
              <div
                key={index}
                className="px-6 py-3 rounded-full bg-background border border-border text-foreground font-medium hover:border-primary/50 transition-colors"
              >
                {integration}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Stack */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <FadeInView>
            <div className="text-center mb-12">
              <Layers className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Built on Vriksha's Multi-Modal AI Stack
              </h2>
            </div>
          </FadeInView>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              "Voice AI",
              "NLP Intent Engine",
              "Auto Call Transcription",
              "Video & Image Insights",
              "Satellite & Geo-enrichment",
              "Data & Analytics Backbone",
              "Enterprise Security",
              "Real-time Processing",
            ].map((item, index) => (
              <Card key={index} className="p-4 text-center hover:bg-primary/5 transition-colors">
                <p className="font-medium text-foreground">{item}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-4 bg-card/50">
        <div className="container mx-auto max-w-4xl">
          <FadeInView>
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
              🔥 Why Vriksha AI CRM Is a Category Breakthrough
            </h2>
          </FadeInView>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 text-destructive font-semibold">❌ Old CRM</th>
                  <th className="text-left py-4 px-4 text-primary font-semibold">✅ Vriksha AI CRM</th>
                </tr>
              </thead>
              <tbody>
                {comparisonItems.map((item, index) => (
                  <tr key={index} className="border-b border-border/50">
                    <td className="py-4 px-4 text-muted-foreground">{item.old}</td>
                    <td className="py-4 px-4 text-foreground font-medium">{item.new}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-center text-xl font-semibold text-primary mt-8">
            This is the Relationship OS the world was waiting for.
          </p>
        </div>
      </section>

      {/* Pilot Options */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <FadeInView>
            <div className="text-center mb-12">
              <Rocket className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Start with a Pilot
              </h2>
              <p className="text-muted-foreground text-lg">
                Choose your onboarding path
              </p>
            </div>
          </FadeInView>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.1}>
            {pilotOptions.map((option, index) => (
              <ScaleInView key={index}>
                <Card className="p-6 h-full text-center hover:border-primary/50 transition-colors">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <option.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {option.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {option.description}
                  </p>
                </Card>
              </ScaleInView>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Pilot Form */}
      <section id="pilot-form" className="py-20 px-4 bg-card/50">
        <div className="container mx-auto max-w-2xl">
          <FadeInView>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                📩 Request Your Pilot
              </h2>
              <p className="text-muted-foreground">
                Fill in your details and we'll get you started within 24 hours
              </p>
            </div>
          </FadeInView>

          <Card className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Acme Inc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {industries.map((ind) => (
                              <SelectItem key={ind.value} value={ind.value}>
                                {ind.label}
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
                    name="estimated_lead_volume"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Lead Volume / Month</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 500-1000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="current_crm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current CRM (if any)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Salesforce, HubSpot, None" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="key_pain_point"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key Pain Point *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your biggest challenge with current lead/customer management..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pilot_path"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interested Pilot Path *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select pilot path" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {pilotPaths.map((path) => (
                            <SelectItem key={path.value} value={path.value}>
                              {path.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp / Phone *</FormLabel>
                        <FormControl>
                          <Input placeholder="+91 98765 43210" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@company.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="preferred_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Time to Connect</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Weekdays 10 AM - 6 PM IST" {...field} />
                      </FormControl>
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
                        <FormLabel className="text-sm font-normal">
                          I consent to be contacted by Vriksha.ai regarding the AI CRM pilot program *
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full gap-2" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Start Pilot
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-primary/5">
        <div className="container mx-auto max-w-4xl text-center">
          <FadeInView>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Reinvent Relationships.<br />
              Reinvent Revenue.<br />
              Reinvent the CRM.
            </h2>
            <Button
              size="lg"
              className="gap-2 text-lg px-8 py-6"
              onClick={() => document.getElementById("pilot-form")?.scrollIntoView({ behavior: "smooth" })}
            >
              <Rocket className="w-6 h-6" />
              Start Your AI CRM Pilot Today
            </Button>
          </FadeInView>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CRM;