import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Phone, Clock, CheckCircle, Loader2, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';

interface CallRecord {
  id: string;
  created_at: string;
  call_status: string | null;
  call_duration: number | null;
  platform_analysis: unknown;
  client_analysis: unknown;
}

export default function MyCalls() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/demo-login', { state: { from: '/my-calls' } });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchCalls();
    }
  }, [user]);

  const fetchCalls = async () => {
    try {
      const { data, error } = await supabase
        .from('voice_widget_calls')
        .select('id, created_at, call_status, call_duration, platform_analysis, client_analysis')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching calls:', error);
      } else {
        setCalls(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (call: CallRecord) => {
    const hasAnalysis = call.platform_analysis && call.client_analysis;
    
    if (hasAnalysis) {
      return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Analysis Ready</Badge>;
    }
    if (call.call_status === 'completed') {
      return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">Processing</Badge>;
    }
    if (call.call_status === 'in_progress') {
      return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">In Progress</Badge>;
    }
    return <Badge variant="secondary">Initiated</Badge>;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">{user?.phone}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">My Calls</h1>
            <p className="text-muted-foreground">View your call history and AI analysis</p>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-border/50">
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : calls.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="p-12 text-center">
                <Phone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No calls yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start a conversation with our AI to see your call history here
                </p>
                <Button asChild>
                  <Link to="/">Go to Home</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {calls.map((call) => {
                const hasAnalysis = call.platform_analysis && call.client_analysis;
                
                return (
                  <Card 
                    key={call.id} 
                    className={`border-border/50 transition-all ${hasAnalysis ? 'hover:border-primary/50 cursor-pointer' : ''}`}
                    onClick={() => hasAnalysis && navigate(`/call-analysis/${call.id}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-foreground">
                              {format(new Date(call.created_at), 'MMM d, yyyy')}
                            </h3>
                            {getStatusBadge(call)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(new Date(call.created_at), 'h:mm a')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {formatDuration(call.call_duration)}
                            </span>
                          </div>
                        </div>
                        
                        {hasAnalysis ? (
                          <Button variant="outline" size="sm">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            View Analysis
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            {call.call_status === 'completed' ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Analyzing...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-sm">Pending</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
