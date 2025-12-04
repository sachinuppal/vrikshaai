import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, Building2, TrendingUp, Lightbulb, DollarSign, Calendar,
  ArrowLeft, Save, Send, Loader2, CheckCircle, Circle, Menu, X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApplicationData {
  id?: string;
  status: string;
  batch: string;
  cofounder_details: any[];
  company_name: string;
  company_description: string;
  company_url: string;
  company_location: string;
  founding_date: string;
  current_progress: string;
  tech_stack: string;
  traction_metrics: string;
  problem_statement: string;
  solution: string;
  competitors: string;
  differentiation: string;
  business_model: string;
  previous_funding: string;
  equity_raised: string;
  current_valuation: string;
}

const defaultApplication: ApplicationData = {
  status: 'draft',
  batch: 'Winter 2026',
  cofounder_details: [],
  company_name: '',
  company_description: '',
  company_url: '',
  company_location: '',
  founding_date: '',
  current_progress: '',
  tech_stack: '',
  traction_metrics: '',
  problem_statement: '',
  solution: '',
  competitors: '',
  differentiation: '',
  business_model: '',
  previous_funding: '',
  equity_raised: '',
  current_valuation: '',
};

const sections = [
  { id: 'founders', label: 'Founders', icon: Users },
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'idea', label: 'Idea', icon: Lightbulb },
  { id: 'equity', label: 'Equity', icon: DollarSign },
  { id: 'batch', label: 'Batch', icon: Calendar },
];

export default function Apply() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [application, setApplication] = useState<ApplicationData>(defaultApplication);
  const [activeSection, setActiveSection] = useState('founders');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load existing application
  useEffect(() => {
    const loadApplication = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('accelerator_applications')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load application',
        });
      }

      if (data) {
        setApplication({
          id: data.id,
          status: data.status,
          batch: data.batch || 'Winter 2026',
          cofounder_details: (data.cofounder_details as any[]) || [],
          company_name: data.company_name || '',
          company_description: data.company_description || '',
          company_url: data.company_url || '',
          company_location: data.company_location || '',
          founding_date: data.founding_date || '',
          current_progress: data.current_progress || '',
          tech_stack: data.tech_stack || '',
          traction_metrics: data.traction_metrics || '',
          problem_statement: data.problem_statement || '',
          solution: data.solution || '',
          competitors: data.competitors || '',
          differentiation: data.differentiation || '',
          business_model: data.business_model || '',
          previous_funding: data.previous_funding || '',
          equity_raised: data.equity_raised || '',
          current_valuation: data.current_valuation || '',
        });
      }
      setIsLoading(false);
    };

    loadApplication();
  }, [user, toast]);

  const updateField = (field: keyof ApplicationData, value: any) => {
    setApplication(prev => ({ ...prev, [field]: value }));
  };

  const saveApplication = useCallback(async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      const payload = {
        user_id: user.id,
        status: application.status as any,
        batch: application.batch,
        cofounder_details: application.cofounder_details,
        company_name: application.company_name,
        company_description: application.company_description,
        company_url: application.company_url,
        company_location: application.company_location,
        founding_date: application.founding_date || null,
        current_progress: application.current_progress,
        tech_stack: application.tech_stack,
        traction_metrics: application.traction_metrics,
        problem_statement: application.problem_statement,
        solution: application.solution,
        competitors: application.competitors,
        differentiation: application.differentiation,
        business_model: application.business_model,
        previous_funding: application.previous_funding,
        equity_raised: application.equity_raised,
        current_valuation: application.current_valuation,
      };

      if (application.id) {
        const { error } = await supabase
          .from('accelerator_applications')
          .update(payload)
          .eq('id', application.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('accelerator_applications')
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        setApplication(prev => ({ ...prev, id: data.id }));
      }

      toast({
        title: 'Saved',
        description: 'Your application has been saved as draft.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  }, [user, application, toast]);

  const submitApplication = async () => {
    if (!application.company_name || !application.problem_statement) {
      toast({
        variant: 'destructive',
        title: 'Incomplete Application',
        description: 'Please fill in at least Company Name and Problem Statement before submitting.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('accelerator_applications')
        .update({ 
          status: 'submitted' as any,
          submitted_at: new Date().toISOString(),
        })
        .eq('id', application.id);

      if (error) throw error;

      setApplication(prev => ({ ...prev, status: 'submitted' }));
      toast({
        title: 'Application Submitted!',
        description: 'We\'ll review your application and get back to you soon.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSectionCompletion = (sectionId: string): boolean => {
    switch (sectionId) {
      case 'founders':
        return application.cofounder_details.length > 0;
      case 'company':
        return !!(application.company_name && application.company_description);
      case 'progress':
        return !!(application.current_progress);
      case 'idea':
        return !!(application.problem_statement && application.solution);
      case 'equity':
        return !!(application.previous_funding);
      case 'batch':
        return !!application.batch;
      default:
        return false;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isSubmitted = application.status === 'submitted';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <img src="/images/vriksha-logo.png" alt="Vriksha.ai" className="w-10 h-10 rounded-lg" />
              <span className="text-xl font-bold text-foreground hidden sm:inline">Vriksha.ai</span>
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium text-foreground">Application</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={saveApplication}
              disabled={isSaving || isSubmitted}
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span className="hidden sm:inline ml-2">Save Draft</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-muted-foreground"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 border-r border-border/50 min-h-[calc(100vh-57px)] sticky top-[57px] bg-muted/30">
          <nav className="p-4 space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              const isComplete = getSectionCompletion(section.id);
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                    activeSection === section.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="flex-1 font-medium">{section.label}</span>
                  {isComplete ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Circle className="w-4 h-4 opacity-30" />
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Navigation */}
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-full bg-background shadow-lg"
          >
            {mobileMenuOpen ? <X className="w-4 h-4 mr-2" /> : <Menu className="w-4 h-4 mr-2" />}
            {sections.find(s => s.id === activeSection)?.label}
          </Button>
          {mobileMenuOpen && (
            <Card className="absolute bottom-full mb-2 w-full shadow-xl">
              <CardContent className="p-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => {
                        setActiveSection(section.id);
                        setMobileMenuOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                        activeSection === section.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{section.label}</span>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Status Banner */}
            {isSubmitted && (
              <Card className="bg-green-500/10 border-green-500/20">
                <CardContent className="py-4 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-700 dark:text-green-300 font-medium">
                    Application submitted! We'll review it and get back to you soon.
                  </span>
                </CardContent>
              </Card>
            )}

            {/* Section Content */}
            {activeSection === 'founders' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Founders
                  </CardTitle>
                  <CardDescription>Tell us about yourself and your co-founders</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                    <p className="text-sm text-muted-foreground mb-4">
                      Your profile was created from your signup info. Add co-founder details below.
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">Your Email</Label>
                        <p className="font-medium">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Co-founder Details (JSON format)</Label>
                    <Textarea
                      placeholder='[{"name": "John Doe", "role": "CTO", "linkedin": "..."}]'
                      value={JSON.stringify(application.cofounder_details, null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          updateField('cofounder_details', parsed);
                        } catch {
                          // Invalid JSON, ignore
                        }
                      }}
                      disabled={isSubmitted}
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter co-founder information in JSON array format
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'company' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    Company
                  </CardTitle>
                  <CardDescription>Basic information about your startup</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="company_name">Company Name *</Label>
                      <Input
                        id="company_name"
                        value={application.company_name}
                        onChange={(e) => updateField('company_name', e.target.value)}
                        disabled={isSubmitted}
                        placeholder="Acme Inc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company_url">Website</Label>
                      <Input
                        id="company_url"
                        value={application.company_url}
                        onChange={(e) => updateField('company_url', e.target.value)}
                        disabled={isSubmitted}
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_description">Company Description *</Label>
                    <Textarea
                      id="company_description"
                      value={application.company_description}
                      onChange={(e) => updateField('company_description', e.target.value)}
                      disabled={isSubmitted}
                      placeholder="Describe what your company does in 2-3 sentences..."
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="company_location">Location</Label>
                      <Input
                        id="company_location"
                        value={application.company_location}
                        onChange={(e) => updateField('company_location', e.target.value)}
                        disabled={isSubmitted}
                        placeholder="Bangalore, India"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="founding_date">Founding Date</Label>
                      <Input
                        id="founding_date"
                        type="date"
                        value={application.founding_date}
                        onChange={(e) => updateField('founding_date', e.target.value)}
                        disabled={isSubmitted}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'progress' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Progress
                  </CardTitle>
                  <CardDescription>What have you built so far?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current_progress">Current Progress *</Label>
                    <Textarea
                      id="current_progress"
                      value={application.current_progress}
                      onChange={(e) => updateField('current_progress', e.target.value)}
                      disabled={isSubmitted}
                      placeholder="Describe your current stage: idea, prototype, MVP, launched, etc."
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tech_stack">Tech Stack</Label>
                    <Textarea
                      id="tech_stack"
                      value={application.tech_stack}
                      onChange={(e) => updateField('tech_stack', e.target.value)}
                      disabled={isSubmitted}
                      placeholder="React, Node.js, PostgreSQL, AWS, etc."
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="traction_metrics">Traction Metrics</Label>
                    <Textarea
                      id="traction_metrics"
                      value={application.traction_metrics}
                      onChange={(e) => updateField('traction_metrics', e.target.value)}
                      disabled={isSubmitted}
                      placeholder="Users, revenue, growth rate, key milestones..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'idea' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    Idea
                  </CardTitle>
                  <CardDescription>Tell us about your product and market</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="problem_statement">Problem Statement *</Label>
                    <Textarea
                      id="problem_statement"
                      value={application.problem_statement}
                      onChange={(e) => updateField('problem_statement', e.target.value)}
                      disabled={isSubmitted}
                      placeholder="What problem are you solving? Who has this problem?"
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="solution">Solution *</Label>
                    <Textarea
                      id="solution"
                      value={application.solution}
                      onChange={(e) => updateField('solution', e.target.value)}
                      disabled={isSubmitted}
                      placeholder="How does your product solve this problem?"
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="competitors">Competitors</Label>
                    <Textarea
                      id="competitors"
                      value={application.competitors}
                      onChange={(e) => updateField('competitors', e.target.value)}
                      disabled={isSubmitted}
                      placeholder="Who are your competitors? How are they solving this?"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="differentiation">Differentiation</Label>
                    <Textarea
                      id="differentiation"
                      value={application.differentiation}
                      onChange={(e) => updateField('differentiation', e.target.value)}
                      disabled={isSubmitted}
                      placeholder="What makes your solution unique?"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business_model">Business Model</Label>
                    <Textarea
                      id="business_model"
                      value={application.business_model}
                      onChange={(e) => updateField('business_model', e.target.value)}
                      disabled={isSubmitted}
                      placeholder="How do you plan to make money?"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'equity' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    Equity & Funding
                  </CardTitle>
                  <CardDescription>Tell us about your funding history</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="previous_funding">Previous Funding *</Label>
                    <Textarea
                      id="previous_funding"
                      value={application.previous_funding}
                      onChange={(e) => updateField('previous_funding', e.target.value)}
                      disabled={isSubmitted}
                      placeholder="Have you raised any money before? From whom? How much?"
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="equity_raised">Total Equity Raised</Label>
                      <Input
                        id="equity_raised"
                        value={application.equity_raised}
                        onChange={(e) => updateField('equity_raised', e.target.value)}
                        disabled={isSubmitted}
                        placeholder="₹0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="current_valuation">Current Valuation</Label>
                      <Input
                        id="current_valuation"
                        value={application.current_valuation}
                        onChange={(e) => updateField('current_valuation', e.target.value)}
                        disabled={isSubmitted}
                        placeholder="₹0"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'batch' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Batch Preference
                  </CardTitle>
                  <CardDescription>Which batch would you like to join?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="batch">Preferred Batch</Label>
                    <Select
                      value={application.batch}
                      onValueChange={(value) => updateField('batch', value)}
                      disabled={isSubmitted}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a batch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Winter 2026">Winter 2026</SelectItem>
                        <SelectItem value="Summer 2026">Summer 2026</SelectItem>
                        <SelectItem value="Winter 2027">Winter 2027</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Section */}
            {!isSubmitted && application.id && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-foreground">Ready to submit?</h3>
                    <p className="text-sm text-muted-foreground">
                      Make sure you've filled in all required fields before submitting.
                    </p>
                  </div>
                  <Button
                    onClick={submitApplication}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Application
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
