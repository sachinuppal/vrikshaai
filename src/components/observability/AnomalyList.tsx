import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Anomaly {
  type: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
  turnIndex?: number;
}

interface AnomalyListProps {
  anomalies: Anomaly[];
}

const ANOMALY_TYPE_LABELS: Record<string, string> = {
  guardrail_triggered: 'Guardrail Triggered',
  brevity_violation: 'Brevity Violation',
  off_topic: 'Off-Topic',
  pii_exposure: 'PII Exposure',
  tone_mismatch: 'Tone Mismatch',
  long_monologue: 'Long Monologue',
  user_frustration: 'User Frustration',
  hallucination: 'Hallucination',
  analysis_error: 'Analysis Error',
};

export function AnomalyList({ anomalies }: AnomalyListProps) {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      high: 'bg-red-500/20 text-red-400 border-red-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    };
    return colors[severity] || 'bg-muted text-muted-foreground';
  };

  if (anomalies.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary" />
            Anomalies Detected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No anomalies detected</p>
            <p className="text-sm">The conversation followed expected patterns</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-primary" />
          Anomalies Detected
          <Badge variant="outline" className="ml-2">{anomalies.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {anomalies.map((anomaly, index) => (
            <div 
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50"
            >
              {getSeverityIcon(anomaly.severity)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">
                    {ANOMALY_TYPE_LABELS[anomaly.type] || anomaly.type}
                  </span>
                  <Badge className={`text-xs ${getSeverityBadge(anomaly.severity)}`}>
                    {anomaly.severity}
                  </Badge>
                  {anomaly.turnIndex !== undefined && (
                    <Badge variant="outline" className="text-xs">
                      Turn {anomaly.turnIndex}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{anomaly.message}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
