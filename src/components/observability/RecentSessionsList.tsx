import { useState, useEffect } from 'react';
import { Clock, Eye, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Session {
  id: string;
  created_at: string;
  overall_score: number | null;
  risk_level: string | null;
  status: string | null;
  external_call_id: string | null;
}

interface RecentSessionsListProps {
  onSelectSession: (sessionId: string) => void;
}

export function RecentSessionsList({ onSelectSession }: RecentSessionsListProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('observability_sessions')
        .select('id, created_at, overall_score, risk_level, status, external_call_id')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (risk: string | null) => {
    switch (risk) {
      case 'low': return 'text-green-500 bg-green-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/20';
      case 'critical': return 'text-red-500 bg-red-500/20';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-muted-foreground';
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Recent Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No analysis sessions yet</p>
            <p className="text-sm">Run your first analysis to see results here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Recent Sessions
          <Badge variant="outline">{sessions.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sessions.map((session) => (
            <div 
              key={session.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {session.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                )}
                <div>
                  <p className="text-sm font-medium">
                    {session.external_call_id || session.id.slice(0, 8)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(session.created_at), 'MMM d, yyyy HH:mm')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {session.overall_score !== null && (
                  <span className={`text-lg font-bold ${getScoreColor(session.overall_score)}`}>
                    {session.overall_score}%
                  </span>
                )}
                {session.risk_level && (
                  <Badge className={getRiskColor(session.risk_level)}>
                    {session.risk_level}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectSession(session.id)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
