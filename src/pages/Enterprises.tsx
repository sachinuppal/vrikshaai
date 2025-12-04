import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  Mic,
  Video,
  Satellite,
  BarChart3,
  Layers,
  Rocket,
  Shield,
  Scale,
  Clock,
  Brain,
  Leaf,
  HeadphonesIcon,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  Banknote,
  ShoppingCart,
  Truck,
  Zap,
  Building,
  Landmark,
  Heart,
  Factory,
  Phone,
} from "lucide-react";
import { Link } from "react-router-dom";

// Industry options
const industries = [
  { id: "finance", name: "Finance & Banking", icon: Banknote },
  { id: "retail", name: "Retail & E-commerce", icon: ShoppingCart },
  { id: "logistics", name: "Logistics & Supply-Chain", icon: Truck },
  { id: "energy", name: "Energy / Renewables / Utilities", icon: Zap },
  { id: "realestate", name: "Real Estate / Infra / Smart-Buildings", icon: Building },
  { id: "government", name: "Public Sector / Government / Compliance & Safety", icon: Landmark },
  { id: "healthcare", name: "Healthcare / Pharma / Life Sciences", icon: Heart },
  { id: "manufacturing", name: "Manufacturing / Industrial", icon: Factory },
  { id: "telecom", name: "Telecom / Services / Customer Support", icon: Phone },
];

// Use cases
const useCases = [
  { id: "voice", name: "Voice AI & Conversational Engines", icon: Mic },
  { id: "video", name: "Image & Video AI", icon: Video },
  { id: "satellite", name: "Geo-Satellite & Remote Imaging AI", icon: Satellite },
  { id: "analytics", name: "Data & Analytics Backbone", icon: BarChart3 },
  { id: "hybrid", name: "Hybrid / Multi-Modal Deployments", icon: Layers },
];

// Industry to use case mapping
const industryUseCaseMapping: Record<string, string[]> = {
  finance: ["voice", "analytics", "hybrid"],
  retail: ["voice", "video", "analytics"],
  logistics: ["video", "satellite", "analytics"],
  energy: ["voice", "satellite", "analytics", "hybrid"],
  realestate: ["video", "satellite", "hybrid"],
  government: ["voice", "video", "satellite", "analytics"],
  healthcare: ["voice", "video", "analytics"],
  manufacturing: ["video", "analytics", "hybrid"],
  telecom: ["voice", "analytics"],
};

// Form schema
const formSchema = z.object({
  company_name: z.string().min(1, "Company name is required").max(200),
  contact_name: z.string().min(1, "Contact name is required").max(100),
  role: z.string().max(100).optional(),
  email: z.string().email("Invalid email address").max(255),
  phone: z.string().max(20).optional(),
  deployment_mode: z.string().optional(),
  estimated_scale: z.string().max(500).optional(),
  additional_notes: z.string().max(2000).optional(),
  best_time_for_demo: z.string().optional(),
  nda_accepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the data privacy agreement",
  }),
});

type FormData = z.infer<typeof formSchema>;

// Use case cards data
const useCaseCards = [
  {
    id: "voice",
    title: "Voice AI & Conversational Engines",
    icon: Mic,
    useCases: [
      "Customer support automation",
      "Call-center automation",
      "Multilingual IVR",
      "Lead conversion via calls",
    ],
    industries: ["Finance", "Telecom", "Retail", "Services", "Healthcare", "Utilities"],
    value: "Dramatically reduces human workload, improves response times, cuts operational costs and increases reach — especially for high-volume customer interactions.",
    cta: "Explore Voice AI Pilots",
    color: "from-violet-500/20 to-purple-500/20",
  },
  {
    id: "video",
    title: "Image & Video AI — Monitoring & Analytics",
    icon: Video,
    useCases: [
      "CCTV-based surveillance & compliance",
      "Infrastructure monitoring",
      "Anomaly detection",
      "Quality control",
    ],
    industries: ["Manufacturing", "Industrial", "Infra", "Government", "Smart-Buildings", "Logistics"],
    value: "Provides scalable, automated monitoring and compliance, reduces manual audits, enables real-time alerts & analytics, improves safety and operational oversight.",
    cta: "Request Video AI Demo",
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    id: "satellite",
    title: "Geo-Satellite & Remote Imaging AI",
    icon: Satellite,
    useCases: [
      "Site feasibility for energy",
      "Land-use analytics",
      "Environmental monitoring",
      "Remote asset monitoring",
    ],
    industries: ["Energy & Renewables", "Agriculture", "Real-Estate", "Government", "Utilities"],
    value: "Enables remote, large-scale analysis without physical inspections — cost and time effective, scalable across geography, ideal for countries with large rural/remote areas.",
    cta: "Get Solar / Site Analysis Pilot",
    color: "from-emerald-500/20 to-teal-500/20",
  },
  {
    id: "analytics",
    title: "Data & Analytics Backbone + AI Insights",
    icon: BarChart3,
    useCases: [
      "Customer analytics",
      "Predictive analytics",
      "Compliance & risk analytics",
      "Automated reporting",
    ],
    industries: ["Finance", "Retail", "Manufacturing", "Healthcare", "Logistics", "Telecom"],
    value: "Turns data (voice logs, video feeds, satellite + IoT + transactional data) into actionable insights — helps enterprises make informed, data-driven decisions rapidly.",
    cta: "See Analytics Use Cases",
    color: "from-orange-500/20 to-amber-500/20",
  },
  {
    id: "hybrid",
    title: "Hybrid / Multi-Modal Deployments",
    icon: Layers,
    useCases: [
      "Combined voice + video + satellite + data workflows",
      "Smart-building automation",
      "End-to-end AI transformation",
    ],
    industries: ["Real-Estate", "Infrastructure", "Smart-Cities", "Energy", "Utilities"],
    value: "Enables end-to-end AI transformation, not just isolated tools — reduce silos, integrate workflows, and future-proof operations.",
    cta: "Talk to Enterprise Architect",
    color: "from-rose-500/20 to-pink-500/20",
  },
];

// Value propositions
const valueProps = [
  {
    icon: Rocket,
    title: "Fast Deployment & Minimum Disruption",
    description: "Plug-and-play AI modules or custom integration; minimal infra changes; hybrid cloud / on-prem / on-device options.",
  },
  {
    icon: Shield,
    title: "Compliance & Privacy Ready",
    description: "On-device or on-prem versions (via Signal Box) for regulated industries, data protection, compliance-heavy sectors.",
  },
  {
    icon: Scale,
    title: "Scalable & Modular",
    description: "Start small (pilot), scale across units/geographies. Use only what you need.",
  },
  {
    icon: Clock,
    title: "Cost & Time Efficient",
    description: "Reduce manual workloads, inspections, physical audits, manpower cost; speed up decision-making.",
  },
  {
    icon: Brain,
    title: "Data-Driven Intelligence",
    description: "Unified analytics across voice, video, image, satellite, operations — get insights in real time.",
  },
  {
    icon: Leaf,
    title: "Sustainability & ESG Alignment",
    description: "Especially with geo & infra-AI — helps enterprises meet green commitments, regulatory norms, corporate responsibility goals.",
  },
  {
    icon: HeadphonesIcon,
    title: "Dedicated Support & Customization",
    description: "From initial PoC to full deployment, with managed services, maintenance and upgrades.",
  },
];

// FAQ items
const faqItems = [
  {
    question: "How do we ensure data privacy and compliance?",
    answer: "We offer multiple deployment modes including on-device and on-premises solutions via our Signal Box technology. All data processing can happen within your infrastructure, ensuring complete data sovereignty. We are compliant with major data protection regulations and can sign NDAs as required.",
  },
  {
    question: "Can we start with a small pilot before scaling?",
    answer: "Absolutely! We encourage starting with a focused pilot project. This allows you to validate the solution with minimal risk and investment. Typical pilots run 4-8 weeks with clear success metrics defined upfront.",
  },
  {
    question: "What deployment models do you support?",
    answer: "We support Cloud (managed by us), On-Premises (within your data center), On-Device (edge deployment via Signal Box), and Hybrid models. We'll recommend the best approach based on your compliance requirements, latency needs, and infrastructure.",
  },
  {
    question: "What kinds of support and SLAs do you offer?",
    answer: "Enterprise partnerships include dedicated account management, 24/7 technical support for critical deployments, guaranteed uptime SLAs (typically 99.5%+), and regular business reviews. Custom SLAs can be negotiated based on your requirements.",
  },
  {
    question: "What's the estimated time to deploy a pilot?",
    answer: "Most pilots can be deployed within 2-4 weeks from kickoff. This includes discovery, configuration, integration, testing, and go-live. Complex integrations may take 6-8 weeks. We'll provide a detailed timeline during the proposal phase.",
  },
  {
    question: "How do you handle maintenance, upgrades, and data security?",
    answer: "For cloud deployments, we handle all maintenance and upgrades seamlessly. For on-prem/hybrid, we provide update packages and support. All data is encrypted at rest and in transit. We conduct regular security audits and can provide compliance certifications as needed.",
  },
];

const Enterprises = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [selectedUseCases, setSelectedUseCases] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_name: "",
      contact_name: "",
      role: "",
      email: "",
      phone: "",
      deployment_mode: "",
      estimated_scale: "",
      additional_notes: "",
      best_time_for_demo: "",
      nda_accepted: false,
    },
  });

  const openModalWithUseCase = (useCaseId: string) => {
    setSelectedUseCases([useCaseId]);
    setCurrentStep(1);
    setIsModalOpen(true);
  };

  const openModal = () => {
    setSelectedIndustry(null);
    setSelectedUseCases([]);
    setCurrentStep(1);
    setIsModalOpen(true);
  };

  const handleIndustrySelect = (industryId: string) => {
    setSelectedIndustry(industryId);
    // Pre-select recommended use cases for this industry
    const recommended = industryUseCaseMapping[industryId] || [];
    setSelectedUseCases(recommended);
    setCurrentStep(2);
  };

  const toggleUseCase = (useCaseId: string) => {
    setSelectedUseCases((prev) =>
      prev.includes(useCaseId)
        ? prev.filter((id) => id !== useCaseId)
        : [...prev, useCaseId]
    );
  };

  const handleNextToForm = () => {
    if (selectedUseCases.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select at least one use case to proceed.",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep(3);
  };

  const onSubmit = async (data: FormData) => {
    if (!selectedIndustry || selectedUseCases.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please complete industry and use case selection.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const industryName = industries.find((i) => i.id === selectedIndustry)?.name || selectedIndustry;
      const useCaseNames = selectedUseCases.map(
        (id) => useCases.find((u) => u.id === id)?.name || id
      );

      const { error } = await supabase.from("enterprise_leads").insert({
        company_name: data.company_name,
        industry: industryName,
        use_cases: useCaseNames,
        contact_name: data.contact_name,
        role: data.role || null,
        email: data.email,
        phone: data.phone || null,
        deployment_mode: data.deployment_mode || null,
        estimated_scale: data.estimated_scale || null,
        additional_notes: data.additional_notes || null,
        best_time_for_demo: data.best_time_for_demo || null,
        nda_accepted: data.nda_accepted,
      });

      if (error) throw error;

      toast({
        title: "Request Submitted!",
        description: "Our enterprise team will contact you within 24-48 hours.",
      });

      setIsModalOpen(false);
      form.reset();
      setSelectedIndustry(null);
      setSelectedUseCases([]);
      setCurrentStep(1);
    } catch (error) {
      console.error("Error submitting enterprise lead:", error);
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableUseCases = selectedIndustry
    ? useCases.filter((uc) =>
        industryUseCaseMapping[selectedIndustry]?.includes(uc.id)
      )
    : useCases;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/10" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />

        <div className="container relative z-10 max-w-6xl mx-auto px-4">
          <FadeInView>
            <div className="text-center max-w-4xl mx-auto">
              <Badge variant="outline" className="mb-6 border-primary/30 text-primary">
                <Building2 className="w-3 h-3 mr-1" />
                Enterprise Partnership Portal
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Partner with Vriksha.ai —{" "}
                <span className="text-primary">Build the Future of Intelligent Enterprise</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                From voice automation to satellite-AI, we enable enterprises across sectors to
                deploy AI solutions — fast, securely, and at scale.
              </p>
              <Button size="lg" onClick={openModal} className="text-lg px-8 py-6">
                Start Pilot / Partner with Us
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </FadeInView>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container max-w-6xl mx-auto px-4">
          <FadeInView>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-muted-foreground text-lg">
                Three simple steps to start your AI transformation journey
              </p>
            </div>
          </FadeInView>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                title: "Select Your Industry",
                description: "Choose from 9 industry verticals to get tailored AI solutions.",
              },
              {
                step: 2,
                title: "Choose Use Cases",
                description: "Pick the AI capabilities that match your business needs.",
              },
              {
                step: 3,
                title: "Start a Pilot",
                description: "Fill a short form and we'll propose a tailored pilot plan.",
              },
            ].map((item, index) => (
              <ScaleInView key={item.step} delay={index * 0.1}>
                <Card className="p-6 text-center relative overflow-hidden group hover:border-primary/50 transition-colors">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-primary" />
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-xl flex items-center justify-center mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </Card>
              </ScaleInView>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button onClick={openModal} variant="outline" size="lg">
              Begin Your Journey
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Use Case Cards */}
      <section className="py-20">
        <div className="container max-w-6xl mx-auto px-4">
          <FadeInView>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">AI Solutions by Capability</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Explore our AI stack and discover solutions tailored to your enterprise needs
              </p>
            </div>
          </FadeInView>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
            {useCaseCards.map((card) => (
              <ScaleInView key={card.id}>
                <Card className={`p-6 h-full flex flex-col bg-gradient-to-br ${card.color} border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-background/80 flex items-center justify-center">
                      <card.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">{card.title}</h3>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Use Cases:</p>
                    <ul className="space-y-1">
                      {card.useCases.map((useCase, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          {useCase}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Industries:</p>
                    <div className="flex flex-wrap gap-1">
                      {card.industries.slice(0, 4).map((industry, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {industry}
                        </Badge>
                      ))}
                      {card.industries.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{card.industries.length - 4}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 flex-grow">{card.value}</p>

                  <Button
                    variant="outline"
                    className="w-full mt-auto"
                    onClick={() => openModalWithUseCase(card.id)}
                  >
                    {card.cta}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Card>
              </ScaleInView>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 bg-muted/30">
        <div className="container max-w-6xl mx-auto px-4">
          <FadeInView>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Enterprises Get</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Partnership benefits that drive real business value
              </p>
            </div>
          </FadeInView>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {valueProps.map((prop, index) => (
              <ScaleInView key={index} delay={index * 0.05}>
                <Card className="p-6 h-full hover:border-primary/50 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <prop.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{prop.title}</h3>
                  <p className="text-sm text-muted-foreground">{prop.description}</p>
                </Card>
              </ScaleInView>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container max-w-4xl mx-auto px-4">
          <FadeInView>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-muted-foreground text-lg">
                Common questions from enterprise partners
              </p>
            </div>
          </FadeInView>

          <FadeInView delay={0.2}>
            <Accordion type="single" collapsible className="space-y-4">
              {faqItems.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border rounded-xl px-6 bg-card"
                >
                  <AccordionTrigger className="text-left hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </FadeInView>

          <div className="text-center mt-8">
            <p className="text-muted-foreground mb-4">
              For more details, see our{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link to="/terms" className="text-primary hover:underline">
                Terms of Use
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <FadeInView>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Enterprise?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Start with a focused pilot and scale when you're ready. Our team is here to guide
              you every step of the way.
            </p>
            <Button size="lg" onClick={openModal} className="text-lg px-8 py-6">
              Request Pilot / Get Proposal
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </FadeInView>
        </div>
      </section>

      <Footer />

      {/* 3-Step Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              {currentStep === 1 && "Step 1: Select Your Industry"}
              {currentStep === 2 && "Step 2: Choose Use Cases"}
              {currentStep === 3 && "Step 3: Request Pilot"}
            </DialogTitle>
          </DialogHeader>

          {/* Step Progress */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step <= currentStep
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-12 h-1 mx-1 rounded ${
                      step < currentStep ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Industry Selection */}
          {currentStep === 1 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {industries.map((industry) => (
                <button
                  key={industry.id}
                  onClick={() => handleIndustrySelect(industry.id)}
                  className={`p-4 rounded-xl border text-left transition-all hover:border-primary/50 hover:bg-primary/5 ${
                    selectedIndustry === industry.id
                      ? "border-primary bg-primary/10"
                      : "border-border"
                  }`}
                >
                  <industry.icon className="w-6 h-6 text-primary mb-2" />
                  <p className="text-sm font-medium">{industry.name}</p>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Use Case Selection */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Based on your industry, we recommend these AI capabilities. Select all that apply:
              </p>
              <div className="grid gap-3">
                {availableUseCases.map((useCase) => (
                  <button
                    key={useCase.id}
                    onClick={() => toggleUseCase(useCase.id)}
                    className={`p-4 rounded-xl border text-left transition-all flex items-center gap-4 ${
                      selectedUseCases.includes(useCase.id)
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        selectedUseCases.includes(useCase.id)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <useCase.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{useCase.name}</p>
                    </div>
                    <CheckCircle2
                      className={`w-5 h-5 ${
                        selectedUseCases.includes(useCase.id)
                          ? "text-primary"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Back
                </Button>
                <Button className="flex-1" onClick={handleNextToForm}>
                  Continue to Form
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Pilot Form */}
          {currentStep === 3 && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="company_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Your organization" {...field} />
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
                        <FormLabel>Contact Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="work@company.com" {...field} />
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
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+91 98765 43210" {...field} />
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
                      <FormLabel>Role / Designation</FormLabel>
                      <FormControl>
                        <Input placeholder="CTO, VP Engineering, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deployment_mode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Deployment Mode</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select deployment preference" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cloud">Cloud (Managed)</SelectItem>
                          <SelectItem value="on-prem">On-Premises</SelectItem>
                          <SelectItem value="on-device">On-Device (Edge)</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimated_scale"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Scale / Volume</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 10K calls/month, 50 cameras, 100 sites"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="additional_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes / Requirements</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any specific requirements, integrations, or questions..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="best_time_for_demo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Best Time for Demo / Call</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select preferred time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="morning">Morning (9 AM - 12 PM)</SelectItem>
                          <SelectItem value="afternoon">Afternoon (12 PM - 5 PM)</SelectItem>
                          <SelectItem value="evening">Evening (5 PM - 8 PM)</SelectItem>
                          <SelectItem value="flexible">Flexible</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nda_accepted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I agree to the data privacy agreement and consent to be contacted by
                          Vriksha.ai regarding this inquiry. *
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Request Pilot / Get Proposal"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Enterprises;