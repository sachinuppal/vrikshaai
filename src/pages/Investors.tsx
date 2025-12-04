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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FadeInView, ScaleInView, StaggerContainer } from "@/components/animations";
import {
  Building2,
  Sun,
  Leaf,
  Users,
  Briefcase,
  Gift,
  PiggyBank,
  TrendingUp,
  Shield,
  Clock,
  Target,
  Layers,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const investorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  company_name: z.string().optional(),
  role: z.string().optional(),
  interest_types: z.array(z.string()).min(1, "Please select at least one interest"),
  comments: z.string().optional(),
  estimated_budget: z.string().optional(),
  preferred_followup: z.string().optional(),
  best_time_to_contact: z.string().optional(),
  consent: z.boolean().refine((val) => val === true, "You must agree to be contacted"),
});

type InvestorFormData = z.infer<typeof investorSchema>;

const interestOptions = [
  "Capital Investment",
  "Infrastructure / Real-Estate",
  "Distribution / Market Access",
  "Corporate Partnership",
  "Grant / Subsidy Collaboration",
  "Pilot / PoC Request",
  "Other",
];

const whyInvestReasons = [
  {
    icon: Layers,
    title: "Diversified AI Portfolio",
    description: "We build multiple AI companies across verticals — reducing risk, increasing likelihood of success.",
  },
  {
    icon: Building2,
    title: "Real-World Infrastructure",
    description: "We embed real-world infrastructure (solar, compliance, IoT, satellite, data) — bridging tech with tangible assets.",
  },
  {
    icon: Clock,
    title: "Faster Exits",
    description: "We deliver faster exits than traditional VC-backed startups — often within 5–6 years.",
  },
  {
    icon: TrendingUp,
    title: "Hybrid Returns",
    description: "We enable steady cash flows (solar/infra) + high-growth upside (AI SaaS & services) — a rare hybrid of stability + growth.",
  },
  {
    icon: Shield,
    title: "Future-Proof & Compliant",
    description: "Our model is compliant, scalable, sustainability-ready — future-proof for Indian & global regulations and ESG demands.",
  },
];

const partnershipModels = [
  {
    icon: PiggyBank,
    title: "Capital Investor",
    description: "Equity in AI ventures + portfolio diversification across multiple verticals.",
  },
  {
    icon: Sun,
    title: "Real-Estate & Solar Partner",
    description: "Convert property to high-yield solar + AI-infra asset with steady returns.",
  },
  {
    icon: Leaf,
    title: "Green-Infra Partner",
    description: "Upgrade buildings, reduce OPEX, earn returns + ESG value through sustainable retrofits.",
  },
  {
    icon: Target,
    title: "Market Access Partner",
    description: "Deploy AI products across existing customer base / distribution network.",
  },
  {
    icon: Users,
    title: "Corporate Talent Investor",
    description: "Contribute domain expertise + manpower to build vertical-specific solutions.",
  },
  {
    icon: Gift,
    title: "Grant/Scheme Partner",
    description: "Combine AI + solar/infra + subsidy/grant frameworks for optimized returns.",
  },
  {
    icon: Briefcase,
    title: "Co-Investment Syndicate",
    description: "Pool funds with other investors for diversified multi-vertical exposure.",
  },
];

const returnsData = [
  {
    model: "Solar / Infra Projects",
    returns: "10–16% annual ROI, payback in 6–8 years",
  },
  {
    model: "AI Portfolio Equity",
    returns: "Early exits in 5–6 years (venture-studio backed), multiple bets across verticals",
  },
  {
    model: "Mixed Infra + AI + Ventures",
    returns: "Balanced portfolio: recurring passive income + high growth upside + ESG advantage",
  },
  {
    model: "Strategic / Corporate Partners",
    returns: "Tech + infra upgrade, AI-modernization, long-term asset value, future-proofing",
  },
];

const onboardingSteps = [
  {
    step: 1,
    title: "Choose Your Mode",
    description: "Select your preferred mode of participation (capital / infra / real-estate / distribution / meta-partner).",
  },
  {
    step: 2,
    title: "Fill Simple Form",
    description: "Share basic details + interest type through our quick onboarding form.",
  },
  {
    step: 3,
    title: "Receive Tailored Deck",
    description: "We'll share a tailored investment pitch or partnership deck aligned to your asset type / interest.",
  },
  {
    step: 4,
    title: "Sign & Onboard",
    description: "Sign Letter of Intent → MoU → Onboarding Phase (infra or investment or JV or pilot).",
  },
  {
    step: 5,
    title: "Launch & Monitor",
    description: "Launch, monitor, and share returns / results (quarterly) — full transparency.",
  },
];

const Investors = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<InvestorFormData>({
    resolver: zodResolver(investorSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company_name: "",
      role: "",
      interest_types: [],
      comments: "",
      estimated_budget: "",
      preferred_followup: "",
      best_time_to_contact: "",
      consent: false,
    },
  });

  const onSubmit = async (data: InvestorFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("investor_leads").insert({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        company_name: data.company_name || null,
        role: data.role || null,
        interest_types: data.interest_types,
        comments: data.comments || null,
        estimated_budget: data.estimated_budget || null,
        preferred_followup: data.preferred_followup || null,
        best_time_to_contact: data.best_time_to_contact || null,
        consent: data.consent,
      });

      if (error) throw error;

      toast({
        title: "Thank you for your interest!",
        description: "Our team will reach out to you shortly.",
      });
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Submission failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToForm = () => {
    document.getElementById("investor-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(18_100%_50%/0.08),transparent_50%)]" />
        
        <div className="container mx-auto px-6 relative z-10">
          <FadeInView>
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Partner with India's{" "}
                <span className="text-primary">AI-Infra & Venture Engine</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                Diverse investment models — from equity to real-estate, solar, infra, distribution, grants. 
                Build long-term value with AI-backed ventures.
              </p>
              <div className="pt-4">
                <Button size="lg" onClick={scrollToForm} className="gap-2">
                  Partner with Vriksha.ai
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </FadeInView>
        </div>
      </section>

      {/* Why Invest Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <FadeInView>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Why Invest with Vriksha.ai
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                A unique opportunity to combine stable infrastructure returns with high-growth AI ventures.
              </p>
            </div>
          </FadeInView>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {whyInvestReasons.map((reason, index) => (
              <ScaleInView key={index}>
                <div className="bg-card rounded-2xl p-6 border border-border hover:border-primary/30 hover:shadow-lg transition-all h-full">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <reason.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{reason.title}</h3>
                  <p className="text-muted-foreground text-sm">{reason.description}</p>
                </div>
              </ScaleInView>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Partnership Models Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <FadeInView>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Investment & Partnership Models
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Multiple entry points for different investor profiles — choose what works for you.
              </p>
            </div>
          </FadeInView>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 max-w-7xl mx-auto">
            {partnershipModels.map((model, index) => (
              <ScaleInView key={index}>
                <div className="bg-card rounded-2xl p-5 border border-border hover:border-primary/30 hover:shadow-lg transition-all h-full group">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                    <model.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">{model.title}</h3>
                  <p className="text-muted-foreground text-sm">{model.description}</p>
                </div>
              </ScaleInView>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Returns Table Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <FadeInView>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                What You Get — Returns & Benefits
              </h2>
            </div>
          </FadeInView>

          <FadeInView>
            <div className="max-w-4xl mx-auto">
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="grid grid-cols-2 bg-primary/10 px-6 py-4">
                  <span className="font-semibold text-foreground">Model</span>
                  <span className="font-semibold text-foreground">Expected Returns & Benefits</span>
                </div>
                {returnsData.map((item, index) => (
                  <div
                    key={index}
                    className={`grid grid-cols-2 px-6 py-4 ${
                      index !== returnsData.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <span className="font-medium text-foreground">{item.model}</span>
                    <span className="text-muted-foreground text-sm">{item.returns}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeInView>
        </div>
      </section>

      {/* Onboarding Steps Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <FadeInView>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                How to Engage — Quick Onboarding
              </h2>
            </div>
          </FadeInView>

          <StaggerContainer className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-primary/20 hidden md:block" />
              
              <div className="space-y-6">
                {onboardingSteps.map((step, index) => (
                  <ScaleInView key={index}>
                    <div className="flex gap-4 md:gap-6">
                      <div className="relative z-10 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">
                        {step.step}
                      </div>
                      <div className="bg-card rounded-2xl p-5 border border-border flex-1 hover:border-primary/30 transition-colors">
                        <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                        <p className="text-muted-foreground text-sm">{step.description}</p>
                      </div>
                    </div>
                  </ScaleInView>
                ))}
              </div>
            </div>
          </StaggerContainer>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="investor-form" className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <FadeInView>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Partner with Vriksha.ai
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Fill out the form below and our team will reach out with a tailored partnership proposal.
              </p>
            </div>
          </FadeInView>

          <FadeInView>
            <div className="max-w-2xl mx-auto">
              <div className="bg-card rounded-2xl p-6 md:p-8 border border-border">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Your full name" {...field} />
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
                              <Input type="email" placeholder="your@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone (with country code)</FormLabel>
                            <FormControl>
                              <Input placeholder="+91 98765 43210" {...field} />
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
                            <FormLabel>Company / Organization</FormLabel>
                            <FormControl>
                              <Input placeholder="Your company name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Role / Designation</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Managing Director, Investor, Partner" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="interest_types"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type of Interest / Engagement *</FormLabel>
                          <div className="grid grid-cols-2 gap-2 pt-2">
                            {interestOptions.map((option) => (
                              <label
                                key={option}
                                className="flex items-center gap-2 text-sm cursor-pointer"
                              >
                                <Checkbox
                                  checked={field.value.includes(option)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([...field.value, option]);
                                    } else {
                                      field.onChange(field.value.filter((v) => v !== option));
                                    }
                                  }}
                                />
                                <span className="text-foreground">{option}</span>
                              </label>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="comments"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brief Description of Interest</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us about your investment goals, assets, or partnership ideas..."
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="estimated_budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Budget / Asset Value</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. ₹50L - ₹1Cr, or USD 100K+" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="preferred_followup"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Follow-Up Mode</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select preference" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="phone">Phone / WhatsApp</SelectItem>
                                <SelectItem value="video">Video Call</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="best_time_to_contact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Best Time to Contact</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select time" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="morning">Morning (9AM - 12PM)</SelectItem>
                                <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
                                <SelectItem value="evening">Evening (5PM - 8PM)</SelectItem>
                                <SelectItem value="flexible">Flexible</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="consent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-normal cursor-pointer">
                              I agree to share my contact details so Vriksha.ai may reach out regarding partnership opportunities. *
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5 mr-2" />
                          Submit Partnership Interest
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          </FadeInView>
        </div>
      </section>

      {/* Summary Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <FadeInView>
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Why Vriksha.ai is a Strong Investor Magnet
              </h2>
              <div className="grid md:grid-cols-2 gap-4 text-left">
                {[
                  "Combines stable asset-based returns (solar/infra/real-estate) with high-growth AI ventures — rare in Indian market.",
                  "Offers multiple entry points for different investor profiles — from capital-rich VCs to real-estate owners.",
                  "Reduces risk via diversified portfolio + multiple verticals + hybrid exit paths.",
                  "Aligns with global trends: AI adoption, clean energy, ESG & compliance focus.",
                ].map((point, index) => (
                  <div key={index} className="flex gap-3 items-start bg-card rounded-xl p-4 border border-border">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-muted-foreground text-sm">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeInView>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Investors;
