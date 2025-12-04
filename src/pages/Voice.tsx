import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mic, 
  Phone, 
  Globe, 
  Clock, 
  FileText, 
  GitBranch, 
  Database, 
  Zap, 
  Settings, 
  BarChart3, 
  Shield, 
  Share2,
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FadeInView, ScaleInView, StaggerContainer, StaggerItem } from '@/components/animations';
import { 
  VoiceWaveformHero, 
  ArchitectureFlow,
  VoiceCallDemo,
  VoiceJourneyPipeline,
  VoiceOrchestration,
  AnimatedROIMetrics,
  BeforeAfterVoice,
  InteractiveIndustryGrid
} from '@/components/voice';

const Voice = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    company_name: '',
    email: '',
    phone: '',
    industry: '',
    use_case: '',
    current_solution: '',
    estimated_call_volume: '',
    comments: '',
    consent: false,
  });

  const capabilities = [
    { icon: Mic, title: "Natural-Language Conversations", description: "ASR + NLU + TTS for human-like voice interactions — no rigid IVR menus" },
    { icon: Phone, title: "Inbound & Outbound Calls", description: "Handle support calls or run high-volume outbound campaigns at scale" },
    { icon: Clock, title: "24/7 Availability", description: "Never miss a call — handle peak loads, holidays, off-hours automatically" },
    { icon: Globe, title: "Multi-Language Support", description: "Support multiple languages and regional accents for global reach" },
    { icon: FileText, title: "Real-Time Transcription", description: "Every call transcribed, summarized, and sentiment-scored automatically" },
    { icon: GitBranch, title: "Intelligent Routing", description: "Context-based routing — escalate to humans when needed" },
    { icon: Database, title: "CRM Integration", description: "Auto-sync extracted data to CRM, update profiles, trigger tasks" },
    { icon: Zap, title: "Next Best Actions", description: "AI triggers follow-ups via voice, SMS, email, WhatsApp automatically" },
    { icon: Settings, title: "Full Workflow Automation", description: "From lead gen to conversion to retention — end-to-end" },
    { icon: BarChart3, title: "Analytics Dashboard", description: "Real-time metrics: call volume, conversion, sentiment trends" },
    { icon: Shield, title: "Compliance & Audit", description: "Full logging, consent capture, encryption for regulated industries" },
    { icon: Share2, title: "Omnichannel Outreach", description: "Orchestrate across voice, SMS, email, WhatsApp, ads" },
  ];

  const whyChoose = [
    { icon: DollarSign, title: "Massive Cost Savings", description: "Reduce call-center workload by 60-80% with AI automation" },
    { icon: TrendingUp, title: "Scalability & Agility", description: "Spin up campaigns in hours, handle surges without staffing overhead" },
    { icon: CheckCircle, title: "Consistent Quality", description: "Every conversation on-brand, compliant, and quality-controlled" },
    { icon: Users, title: "Higher Conversion", description: "24/7 availability, quick responses, context preservation" },
    { icon: BarChart3, title: "Data-Driven Decisions", description: "Rich voice + behavioral data enables smarter business choices" },
    { icon: Shield, title: "Multi-Industry Ready", description: "Sales, support, collections, surveys — any vertical" },
  ];

  const industryNames = [
    'Financial Services & FinTech',
    'Telecom / Utilities',
    'Real Estate / PropTech',
    'Retail / E-commerce / D2C',
    'Healthcare / Wellness',
    'Education / EdTech',
    'SaaS / B2B Services',
    'Surveys / Market Research',
  ];

  const differentiators = [
    { title: "Full-Stack Integration", description: "Voice AI + CRM + automation + analytics + omnichannel — no stitching tools" },
    { title: "Enterprise-Grade Architecture", description: "Scalable, secure, compliant, multilingual, multi-modal" },
    { title: "Real-Time Intelligence", description: "Live transcription, intent & sentiment detection, automatic summaries" },
    { title: "Automation-First", description: "From first call to follow-up to conversion — minimal human load" },
    { title: "Flexible Deployment", description: "Integrate with existing systems, CRMs, databases, marketing tools" },
    { title: "ROI-First Approach", description: "Cost reduction, higher throughput, better conversion" },
  ];

  const steps = [
    { step: 1, title: "Quick Demo & PoC", description: "Run a short pilot — connect to sample leads, run AI-voice calls, show results" },
    { step: 2, title: "Custom Setup", description: "Customize flows, voice tone, languages, call logic, backend integrations" },
    { step: 3, title: "Scale & Automate", description: "Enable large-scale campaigns, 24/7 support, omnichannel outreach" },
    { step: 4, title: "Analyze & Expand", description: "Use data + analytics to refine flows, expand across geographies" },
  ];

  const faqs = [
    { q: "Does Voice AI replace human agents entirely?", a: "Not always. For complex tasks requiring empathy or nuanced judgment, human agents still play a role. Voice AI excels at repetitive, high-volume, structured calls (L1/L2, lead qualification, reminders, basic support)." },
    { q: "How accurate is speech recognition / multilingual support?", a: "We use state-of-the-art speech-to-text + NLU, trained on regional accents and languages. Accuracy is continuously improved via feedback loops." },
    { q: "Is data secure and compliant?", a: "Yes. All call data, transcripts, metadata are logged, encrypted, and governed via compliance layer. Suitable for regulated sectors (finance, healthcare, etc.)." },
    { q: "Can we integrate with our existing CRM / backend?", a: "Absolutely. We support REST / webhook / API integrations, custom workflows, data syncs — you can continue with your existing systems." },
    { q: "What kind of ROI can we expect?", a: "Typical improvements: 60–80% reduction in call-center workload, major cost savings, increased lead conversion, 24/7 availability — ROI often visible within first 3–6 months." },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.consent) {
      toast({
        title: "Consent Required",
        description: "Please accept the terms to proceed.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: dbError } = await supabase
        .from('voice_leads')
        .insert([formData]);

      if (dbError) throw dbError;

      try {
        await supabase.functions.invoke('send-voice-notification', {
          body: formData,
        });
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
      }

      toast({
        title: "Demo Request Submitted!",
        description: "Our team will contact you within 24 hours.",
      });

      setFormData({
        full_name: '',
        company_name: '',
        email: '',
        phone: '',
        industry: '',
        use_case: '',
        current_solution: '',
        estimated_call_volume: '',
        comments: '',
        consent: false,
      });
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToForm = () => {
    document.getElementById('demo-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <FadeInView>
            <div className="text-center mb-8">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Enterprise-Grade Voice AI</span>
              </motion.div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Transform Voice Into Value
                <br />
                <span className="text-primary">Automated Voice AI</span> Customer Journeys
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                24/7 intelligent voice agents. Real-time data extraction. Autonomous follow-ups.
                From first call to long-term relationship — without human overhead.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="text-lg px-8"
                  onClick={scrollToForm}
                >
                  Get a Demo <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-8"
                  onClick={scrollToForm}
                >
                  Talk to Sales
                </Button>
              </div>
            </div>
          </FadeInView>

          <VoiceWaveformHero />
          
          {/* Voice Journey Pipeline - NEW */}
          <div className="mt-12">
            <VoiceJourneyPipeline />
          </div>
        </div>
      </section>

      {/* What Voice AI Means - with BeforeAfter */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <FadeInView>
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                A New Era of <span className="text-primary">Customer Engagement</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Traditional call-centers are expensive, slow, and hard to scale. Voice AI changes everything.
              </p>
            </div>
          </FadeInView>

          {/* Before/After Scroll Animation - NEW */}
          <BeforeAfterVoice />
        </div>
      </section>

      {/* Live Voice Call Demo - NEW */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <FadeInView>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                See Voice AI <span className="text-primary">in Action</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Watch how our AI handles a live call — real-time transcription, sentiment analysis, and auto-triggered actions
              </p>
            </div>
          </FadeInView>

          <VoiceCallDemo />
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <FadeInView>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Core <span className="text-primary">Capabilities</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need for enterprise voice automation
              </p>
            </div>
          </FadeInView>

          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {capabilities.map((cap, index) => (
              <StaggerItem key={index}>
                <div
                  className="p-5 rounded-xl bg-card border border-border hover:border-primary/50 hover:-translate-y-1 hover:scale-[1.02] transition-all duration-200 h-full"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <cap.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{cap.title}</h3>
                  <p className="text-sm text-muted-foreground">{cap.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Voice Orchestration - NEW */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <FadeInView>
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                One Call. <span className="text-primary">Multiple Actions.</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our AI automatically triggers follow-ups across all channels
              </p>
            </div>
          </FadeInView>

          <VoiceOrchestration />
        </div>
      </section>

      {/* Why Enterprises Choose */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <FadeInView>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Enterprises Choose <span className="text-primary">Vriksha Voice AI</span>
              </h2>
            </div>
          </FadeInView>

          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChoose.map((item, index) => (
              <StaggerItem key={index}>
                <div
                  className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center mb-4">
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Industry Use Cases - Interactive Grid - REPLACED */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <FadeInView>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Industry <span className="text-primary">Use Cases</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Click on any industry to explore specific voice AI applications
              </p>
            </div>
          </FadeInView>

          <InteractiveIndustryGrid />
        </div>
      </section>

      {/* Differentiators */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <FadeInView>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Vriksha AI <span className="text-primary">Outshines Others</span>
              </h2>
            </div>
          </FadeInView>

          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {differentiators.map((diff, index) => (
              <StaggerItem key={index}>
                <div
                  className="p-6 rounded-xl bg-card border border-border hover:scale-[1.02] transition-transform duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{diff.title}</h3>
                  <p className="text-sm text-muted-foreground">{diff.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ROI Metrics - Animated - REPLACED */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <FadeInView>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                ROI & <span className="text-primary">Performance Metrics</span>
              </h2>
            </div>
          </FadeInView>

          <AnimatedROIMetrics />
        </div>
      </section>

      {/* Architecture Overview */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <FadeInView>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Architecture <span className="text-primary">Overview</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                How it works under the hood — from voice input to automated actions
              </p>
            </div>
          </FadeInView>

          <ArchitectureFlow />
        </div>
      </section>

      {/* How to Get Started */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <FadeInView>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How to <span className="text-primary">Get Started</span>
              </h2>
            </div>
          </FadeInView>

          <div className="space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="flex gap-6 items-start"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {step.step}
                </div>
                <div className="flex-1 pb-6 border-b border-border last:border-0">
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <FadeInView>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Frequently Asked <span className="text-primary">Questions</span>
              </h2>
            </div>
          </FadeInView>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="rounded-xl bg-card border border-border overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <button
                  className="w-full p-5 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                >
                  <span className="font-semibold pr-4">{faq.q}</span>
                  {expandedFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  )}
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: expandedFaq === index ? 'auto' : 0 }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-muted-foreground">{faq.a}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Request Form */}
      <section id="demo-form" className="py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <FadeInView>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Transform Your <span className="text-primary">Voice Channel</span>?
              </h2>
              <p className="text-muted-foreground">
                Request a demo and see Vriksha Voice AI in action
              </p>
            </div>
          </FadeInView>

          <ScaleInView>
            <form onSubmit={handleSubmit} className="p-8 rounded-2xl bg-card border border-border space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    required
                    placeholder="Acme Corp"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="john@acme.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => setFormData({ ...formData, industry: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industryNames.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="use_case">Primary Use Case</Label>
                <Input
                  id="use_case"
                  value={formData.use_case}
                  onChange={(e) => setFormData({ ...formData, use_case: e.target.value })}
                  placeholder="e.g., Lead qualification, Customer support"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current_solution">Current Call Center Setup</Label>
                  <Input
                    id="current_solution"
                    value={formData.current_solution}
                    onChange={(e) => setFormData({ ...formData, current_solution: e.target.value })}
                    placeholder="e.g., In-house team, BPO"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimated_call_volume">Estimated Monthly Call Volume</Label>
                  <Input
                    id="estimated_call_volume"
                    value={formData.estimated_call_volume}
                    onChange={(e) => setFormData({ ...formData, estimated_call_volume: e.target.value })}
                    placeholder="e.g., 10,000 calls/month"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comments">Additional Comments</Label>
                <Textarea
                  id="comments"
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                  placeholder="Tell us more about your requirements..."
                  rows={3}
                />
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="consent"
                  checked={formData.consent}
                  onCheckedChange={(checked) => setFormData({ ...formData, consent: checked as boolean })}
                />
                <Label htmlFor="consent" className="text-sm text-muted-foreground leading-relaxed">
                  I consent to Vriksha AI processing my data and contacting me regarding Voice AI solutions. 
                  I understand I can withdraw consent at any time.
                </Label>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Request a Demo'}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </form>
          </ScaleInView>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Voice;
