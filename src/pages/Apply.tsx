import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, Building2, TrendingUp, Lightbulb, DollarSign, Calendar,
  Save, Send, Loader2, CheckCircle, Circle, Menu, X, Plus, Mail,
  ChevronLeft, ChevronRight, Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CofounderCard } from '@/components/application/CofounderCard';
import { AddCofounderModal } from '@/components/application/AddCofounderModal';
import { InviteCofounderModal } from '@/components/application/InviteCofounderModal';
import { PendingInvites } from '@/components/application/PendingInvites';
import { type Cofounder } from '@/lib/validations/applicationSchema';

interface ApplicationData {
  id?: string;
  status: string;
  batch: string;
  cofounder_details: Cofounder[];
  company_name: string;
  company_description: string;
  company_url: string;
  company_location: string;
  founding_date: string;
  company_registered: boolean;
  registration_status: string;
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
  company_registered: true,
  registration_status: 'registered',
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

// Field validation rules
const fieldValidations: Record<string, { min?: number; required?: boolean; label: string }> = {
  company_description: { min: 50, label: 'Company description' },
  current_progress: { min: 20, label: 'Current progress' },
  problem_statement: { min: 50, label: 'Problem statement' },
  solution: { min: 50, label: 'Solution' },
};

export default function Apply() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [application, setApplication] = useState<ApplicationData>(defaultApplication);
  const [activeSection, setActiveSection] = useState('founders');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  // Co-founder modals
  const [showAddCofounder, setShowAddCofounder] = useState(false);
  const [showInviteCofounder, setShowInviteCofounder] = useState(false);
  const [editingCofounder, setEditingCofounder] = useState<Cofounder | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [inviteRefreshTrigger, setInviteRefreshTrigger] = useState(0);
  
  // Debounce timer
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
          cofounder_details: (data.cofounder_details as Cofounder[]) || [],
          company_name: data.company_name || '',
          company_description: data.company_description || '',
          company_url: data.company_url || '',
          company_location: data.company_location || '',
          founding_date: data.founding_date || '',
          company_registered: data.company_registered ?? true,
          registration_status: data.registration_status || 'registered',
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

  // Validate a single field
  const validateField = (field: string, value: string): string | null => {
    const rules = fieldValidations[field];
    if (!rules) return null;
    
    if (rules.min && value.length > 0 && value.length < rules.min) {
      return `${rules.label} must be at least ${rules.min} characters`;
    }
    return null;
  };

  const updateField = (field: keyof ApplicationData, value: any) => {
    setApplication(prev => ({ ...prev, [field]: value }));
    
    // Validate on change
    if (typeof value === 'string') {
      const error = validateField(field, value);
      setFieldErrors(prev => {
        if (error) return { ...prev, [field]: error };
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
    
    // Trigger auto-save with debounce
    triggerAutoSave();
  };

  const triggerAutoSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    setSaveStatus('idle');
    saveTimeoutRef.current = setTimeout(() => {
      autoSave();
    }, 1500);
  };

  const autoSave = async () => {
    if (!user || application.status === 'submitted') return;
    
    setSaveStatus('saving');
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
        company_registered: application.company_registered,
        registration_status: application.registration_status,
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

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error: any) {
      setSaveStatus('idle');
      console.error('Auto-save failed:', error);
    }
  };

  const saveApplication = useCallback(async () => {
    if (!user) return;
    setIsSaving(true);
    setSaveStatus('saving');

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
        company_registered: application.company_registered,
        registration_status: application.registration_status,
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

      setSaveStatus('saved');
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
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  }, [user, application, toast]);

  const submitApplication = async () => {
    // Validate required fields
    const errors: string[] = [];
    
    if (!application.company_registered && !application.company_name) {
      // Company name is optional if not registered
    } else if (application.company_registered && !application.company_name) {
      errors.push('Company name is required for registered companies');
    }
    
    if (!application.problem_statement || application.problem_statement.length < 50) {
      errors.push('Problem statement must be at least 50 characters');
    }
    
    if (!application.solution || application.solution.length < 50) {
      errors.push('Solution must be at least 50 characters');
    }

    if (errors.length > 0) {
      toast({
        variant: 'destructive',
        title: 'Incomplete Application',
        description: errors[0],
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
        return application.company_registered 
          ? !!(application.company_name && application.company_description)
          : !!application.company_description;
      case 'progress':
        return !!(application.current_progress && application.current_progress.length >= 20);
      case 'idea':
        return !!(application.problem_statement && application.problem_statement.length >= 50 && 
                  application.solution && application.solution.length >= 50);
      case 'equity':
        return !!(application.previous_funding);
      case 'batch':
        return !!application.batch;
      default:
        return false;
    }
  };

  // Navigation functions
  const currentSectionIndex = sections.findIndex(s => s.id === activeSection);
  
  const goToNextSection = () => {
    if (currentSectionIndex < sections.length - 1) {
      setActiveSection(sections[currentSectionIndex + 1].id);
    }
  };
  
  const goToPreviousSection = () => {
    if (currentSectionIndex > 0) {
      setActiveSection(sections[currentSectionIndex - 1].id);
    }
  };

  // Co-founder management
  const handleAddCofounder = (cofounder: Cofounder) => {
    if (editingIndex !== null) {
      const updated = [...application.cofounder_details];
      updated[editingIndex] = cofounder;
      updateField('cofounder_details', updated);
      setEditingIndex(null);
      setEditingCofounder(null);
    } else {
      updateField('cofounder_details', [...application.cofounder_details, cofounder]);
    }
  };

  const handleEditCofounder = (index: number) => {
    setEditingIndex(index);
    setEditingCofounder(application.cofounder_details[index]);
    setShowAddCofounder(true);
  };

  const handleRemoveCofounder = (index: number) => {
    const updated = application.cofounder_details.filter((_, i) => i !== index);
    updateField('cofounder_details', updated);
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
            {/* Save Status Indicator */}
            <span className={cn(
              "text-xs transition-opacity",
              saveStatus === 'idle' && "opacity-0",
              saveStatus === 'saving' && "text-muted-foreground",
              saveStatus === 'saved' && "text-green-600 dark:text-green-400"
            )}>
              {saveStatus === 'saving' && 'Saving...'}
              {saveStatus === 'saved' && (
                <span className="flex items-center gap-1">
                  <Check className="w-3 h-3" /> Saved
                </span>
              )}
            </span>
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
            {sections.map((section, index) => {
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
                  <span className="w-6 h-6 rounded-full bg-background/20 flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </span>
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
          
          {/* Progress indicator */}
          <div className="px-4 mt-4">
            <div className="text-xs text-muted-foreground mb-2">
              Progress: {sections.filter(s => getSectionCompletion(s.id)).length}/{sections.length} sections complete
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(sections.filter(s => getSectionCompletion(s.id)).length / sections.length) * 100}%` }}
              />
            </div>
          </div>
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
            {currentSectionIndex + 1}/{sections.length}: {sections.find(s => s.id === activeSection)?.label}
          </Button>
          {mobileMenuOpen && (
            <Card className="absolute bottom-full mb-2 w-full shadow-xl">
              <CardContent className="p-2">
                {sections.map((section, index) => {
                  const Icon = section.icon;
                  const isComplete = getSectionCompletion(section.id);
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
                      <span className="w-6 h-6 rounded-full bg-background/20 flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </span>
                      <span className="font-medium">{section.label}</span>
                      {isComplete && <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
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
                    <p className="text-sm text-muted-foreground mb-2">
                      Your profile was created from your signup info.
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">Your Email</Label>
                        <p className="font-medium">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Co-founder list */}
                  {application.cofounder_details.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-muted-foreground">Co-founders ({application.cofounder_details.length})</h4>
                      {application.cofounder_details.map((cofounder, index) => (
                        <CofounderCard
                          key={index}
                          cofounder={cofounder}
                          index={index}
                          onEdit={handleEditCofounder}
                          onRemove={handleRemoveCofounder}
                          disabled={isSubmitted}
                        />
                      ))}
                    </div>
                  )}
                  
                  {/* Pending invites */}
                  {application.id && (
                    <PendingInvites 
                      applicationId={application.id} 
                      refreshTrigger={inviteRefreshTrigger}
                    />
                  )}
                  
                  {/* Add/Invite buttons */}
                  {!isSubmitted && (
                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingCofounder(null);
                          setEditingIndex(null);
                          setShowAddCofounder(true);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Co-founder
                      </Button>
                      {application.id && (
                        <Button
                          variant="outline"
                          onClick={() => setShowInviteCofounder(true)}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Invite Co-founder
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {!application.id && (
                    <p className="text-sm text-muted-foreground">
                      Save your application first to invite co-founders via email.
                    </p>
                  )}
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
                <CardContent className="space-y-6">
                  {/* Registration status toggle */}
                  <div className="space-y-3">
                    <Label>Company Registration Status</Label>
                    <RadioGroup
                      value={application.registration_status}
                      onValueChange={(value) => {
                        updateField('registration_status', value);
                        updateField('company_registered', value === 'registered');
                      }}
                      disabled={isSubmitted}
                      className="grid gap-3"
                    >
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="not_started" id="not_started" />
                        <Label htmlFor="not_started" className="flex-1 cursor-pointer">
                          <span className="font-medium">Not registered yet</span>
                          <p className="text-xs text-muted-foreground">We're still in the idea stage</p>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="in_progress" id="in_progress" />
                        <Label htmlFor="in_progress" className="flex-1 cursor-pointer">
                          <span className="font-medium">Registration in progress</span>
                          <p className="text-xs text-muted-foreground">Currently registering the company</p>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="registered" id="registered" />
                        <Label htmlFor="registered" className="flex-1 cursor-pointer">
                          <span className="font-medium">Registered company</span>
                          <p className="text-xs text-muted-foreground">Company is legally registered</p>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="company_name">
                        {application.company_registered ? 'Company Name *' : 'Working Name (Optional)'}
                      </Label>
                      <Input
                        id="company_name"
                        value={application.company_name}
                        onChange={(e) => updateField('company_name', e.target.value)}
                        disabled={isSubmitted}
                        placeholder={application.company_registered ? "Acme Inc." : "Project name or working title"}
                      />
                      {!application.company_registered && (
                        <p className="text-xs text-muted-foreground">You can update this later once registered</p>
                      )}
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
                    <Label htmlFor="company_description">
                      Company Description {application.company_description.length > 0 && `(${application.company_description.length}/50 min)`}
                    </Label>
                    <Textarea
                      id="company_description"
                      value={application.company_description}
                      onChange={(e) => updateField('company_description', e.target.value)}
                      disabled={isSubmitted}
                      placeholder="Describe what your company does in 2-3 sentences..."
                      rows={3}
                      className={cn(fieldErrors.company_description && "border-destructive")}
                    />
                    {fieldErrors.company_description && (
                      <p className="text-xs text-destructive">{fieldErrors.company_description}</p>
                    )}
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
                    <Label htmlFor="current_progress">
                      Current Progress * {application.current_progress.length > 0 && `(${application.current_progress.length}/20 min)`}
                    </Label>
                    <Textarea
                      id="current_progress"
                      value={application.current_progress}
                      onChange={(e) => updateField('current_progress', e.target.value)}
                      disabled={isSubmitted}
                      placeholder="Describe your current stage: idea, prototype, MVP, launched, etc."
                      rows={4}
                      className={cn(fieldErrors.current_progress && "border-destructive")}
                    />
                    {fieldErrors.current_progress && (
                      <p className="text-xs text-destructive">{fieldErrors.current_progress}</p>
                    )}
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
                    <Label htmlFor="problem_statement">
                      Problem Statement * {application.problem_statement.length > 0 && `(${application.problem_statement.length}/50 min)`}
                    </Label>
                    <Textarea
                      id="problem_statement"
                      value={application.problem_statement}
                      onChange={(e) => updateField('problem_statement', e.target.value)}
                      disabled={isSubmitted}
                      placeholder="What problem are you solving? Who has this problem?"
                      rows={4}
                      className={cn(fieldErrors.problem_statement && "border-destructive")}
                    />
                    {fieldErrors.problem_statement && (
                      <p className="text-xs text-destructive">{fieldErrors.problem_statement}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="solution">
                      Solution * {application.solution.length > 0 && `(${application.solution.length}/50 min)`}
                    </Label>
                    <Textarea
                      id="solution"
                      value={application.solution}
                      onChange={(e) => updateField('solution', e.target.value)}
                      disabled={isSubmitted}
                      placeholder="How does your product solve this problem?"
                      rows={4}
                      className={cn(fieldErrors.solution && "border-destructive")}
                    />
                    {fieldErrors.solution && (
                      <p className="text-xs text-destructive">{fieldErrors.solution}</p>
                    )}
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

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={goToPreviousSection}
                disabled={currentSectionIndex === 0}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
              
              <span className="text-sm text-muted-foreground">
                {currentSectionIndex + 1} of {sections.length}
              </span>
              
              {currentSectionIndex < sections.length - 1 ? (
                <Button
                  onClick={goToNextSection}
                  className="gap-2"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <div className="w-[100px]" /> // Spacer for alignment
              )}
            </div>

            {/* Submit Section */}
            {!isSubmitted && application.id && activeSection === 'batch' && (
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

      {/* Modals */}
      <AddCofounderModal
        open={showAddCofounder}
        onOpenChange={setShowAddCofounder}
        onAdd={handleAddCofounder}
        editingCofounder={editingCofounder}
        editingIndex={editingIndex}
      />
      
      {application.id && user && (
        <InviteCofounderModal
          open={showInviteCofounder}
          onOpenChange={setShowInviteCofounder}
          applicationId={application.id}
          userId={user.id}
          onInviteSent={() => setInviteRefreshTrigger(prev => prev + 1)}
        />
      )}
    </div>
  );
}
