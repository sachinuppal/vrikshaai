import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, FileText, Clock, CheckCircle, AlertCircle, Loader2, 
  ChevronRight, Calendar, Users, LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Cohort {
  id: string;
  name: string;
  code: string;
  description: string | null;
  deadline: string | null;
  late_deadline: string | null;
  is_active: boolean;
}

interface Application {
  id: string;
  status: string;
  company_name: string | null;
  cohort_id: string | null;
  cofounder_details: any[];
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  cohort?: Cohort;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  draft: { label: 'Not submitted', color: 'bg-muted text-muted-foreground', icon: FileText },
  submitted: { label: 'Submitted', color: 'bg-blue-500/10 text-blue-600', icon: Clock },
  under_review: { label: 'Under review', color: 'bg-amber-500/10 text-amber-600', icon: Clock },
  accepted: { label: 'Accepted', color: 'bg-green-500/10 text-green-600', icon: CheckCircle },
  rejected: { label: 'Not accepted', color: 'bg-destructive/10 text-destructive', icon: AlertCircle },
};

export default function Applications() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      // Load cohorts and applications in parallel
      const [cohortsResult, applicationsResult] = await Promise.all([
        supabase.from('cohorts').select('*').order('deadline', { ascending: false }),
        supabase.from('accelerator_applications').select('*').eq('user_id', user.id),
      ]);

      if (cohortsResult.data) {
        setCohorts(cohortsResult.data as Cohort[]);
      }

      if (applicationsResult.data) {
        // Map cohort data to applications
        const appsWithCohorts = applicationsResult.data.map((app: any) => ({
          ...app,
          cohort: cohortsResult.data?.find((c: Cohort) => c.id === app.cohort_id),
        }));
        setApplications(appsWithCohorts);
      }

      setIsLoading(false);
    };

    loadData();
  }, [user]);

  const activeApplications = applications.filter(app => {
    const cohort = app.cohort;
    // Active if: draft/submitted AND cohort is active or deadline hasn't passed
    return (app.status === 'draft' || app.status === 'submitted' || app.status === 'under_review') &&
           (!cohort || cohort.is_active || (cohort.deadline && new Date(cohort.deadline) > new Date()));
  });

  const previousApplications = applications.filter(app => !activeApplications.includes(app));

  const activeCohorts = cohorts.filter(c => c.is_active);
  const appliedCohortIds = applications.map(app => app.cohort_id);

  const handleStartNewApplication = async (cohortId: string) => {
    if (!user) return;

    // Check if already applied to this cohort
    if (appliedCohortIds.includes(cohortId)) {
      const existingApp = applications.find(app => app.cohort_id === cohortId);
      if (existingApp) {
        navigate(`/apply/${existingApp.id}`);
        return;
      }
    }

    // Create new application
    const { data, error } = await supabase
      .from('accelerator_applications')
      .insert({
        user_id: user.id,
        cohort_id: cohortId,
        status: 'draft',
        cofounder_details: [],
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create application:', error);
      return;
    }

    navigate(`/apply/${data.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
            <span className="font-medium text-foreground">My Applications</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="text-muted-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          {/* Main Content */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-foreground">My Applications</h1>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="active">
                  Active ({activeApplications.length})
                </TabsTrigger>
                <TabsTrigger value="previous">
                  Previous ({previousApplications.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="space-y-4">
                {activeApplications.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-12 text-center">
                      <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No active applications</h3>
                      <p className="text-muted-foreground mb-4">
                        Start a new application to join our accelerator program.
                      </p>
                      {activeCohorts.length > 0 && (
                        <Button onClick={() => handleStartNewApplication(activeCohorts[0].id)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Start Application
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  activeApplications.map((app) => (
                    <ApplicationCard 
                      key={app.id} 
                      application={app} 
                      onClick={() => navigate(`/apply/${app.id}`)}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="previous" className="space-y-4">
                {previousApplications.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-12 text-center">
                      <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No previous applications</h3>
                      <p className="text-muted-foreground">
                        Your completed or past cohort applications will appear here.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  previousApplications.map((app) => (
                    <ApplicationCard 
                      key={app.id} 
                      application={app} 
                      onClick={() => navigate(`/apply/${app.id}`)}
                    />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Start New Application */}
            {activeCohorts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Apply for a Cohort</CardTitle>
                  <CardDescription>Select a cohort to start your application</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activeCohorts.map((cohort) => {
                    const hasApplied = appliedCohortIds.includes(cohort.id);
                    const existingApp = applications.find(app => app.cohort_id === cohort.id);
                    
                    return (
                      <button
                        key={cohort.id}
                        onClick={() => handleStartNewApplication(cohort.id)}
                        className={cn(
                          "w-full p-4 rounded-lg border border-border/50 text-left transition-all",
                          "hover:border-primary/50 hover:bg-primary/5",
                          hasApplied && "bg-muted/30"
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-mono">
                                {cohort.code}
                              </Badge>
                              {hasApplied && (
                                <Badge variant="secondary" className="text-xs">
                                  {existingApp?.status === 'draft' ? 'In Progress' : 'Applied'}
                                </Badge>
                              )}
                            </div>
                            <h4 className="font-medium text-foreground mt-1">{cohort.name}</h4>
                            {cohort.deadline && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Deadline: {format(new Date(cohort.deadline), 'MMM d, yyyy')}
                              </p>
                            )}
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Deadline Notice */}
            {activeCohorts.length > 0 && activeCohorts[0].deadline && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium text-foreground">Application Deadline</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(activeCohorts[0].deadline), 'MMMM d, yyyy')} for {activeCohorts[0].code}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Helpful Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Helpful Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link 
                  to="/" 
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                  About the Accelerator
                </Link>
                <Link 
                  to="/contact" 
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                  Contact Support
                </Link>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}

function ApplicationCard({ application, onClick }: { application: Application; onClick: () => void }) {
  const status = statusConfig[application.status] || statusConfig.draft;
  const StatusIcon = status.icon;
  const cofounderCount = Array.isArray(application.cofounder_details) ? application.cofounder_details.length : 0;

  return (
    <Card 
      className="cursor-pointer hover:border-primary/30 transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {application.cohort && (
                <Badge variant="outline" className="font-mono text-xs">
                  {application.cohort.code}
                </Badge>
              )}
              <Badge className={cn("text-xs", status.color)}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {status.label}
              </Badge>
            </div>
            <h3 className="font-medium text-foreground truncate">
              {application.company_name || 'Untitled Application'}
            </h3>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {cofounderCount + 1} founder{cofounderCount !== 0 ? 's' : ''}
              </span>
              <span>
                Updated {format(new Date(application.updated_at), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
          <Button variant="outline" size="sm">
            {application.status === 'draft' ? 'Continue' : 'View'}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}