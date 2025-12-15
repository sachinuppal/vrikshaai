import { ShieldAlert, AlertOctagon, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Violation {
  rule: string;
  evidence: string;
  severity: 'critical' | 'warning';
}

interface ViolationsListProps {
  violations: Violation[];
}

export function ViolationsList({ violations }: ViolationsListProps) {
  if (violations.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            Policy Violations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-50 text-green-500" />
            <p className="text-green-500">No violations detected</p>
            <p className="text-sm">All policies were followed correctly</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-primary" />
          Policy Violations
          <Badge variant="destructive" className="ml-2">{violations.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {violations.map((violation, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border ${
                violation.severity === 'critical' 
                  ? 'bg-red-500/10 border-red-500/30' 
                  : 'bg-yellow-500/10 border-yellow-500/30'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {violation.severity === 'critical' ? (
                  <AlertOctagon className="w-5 h-5 text-red-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                )}
                <span className="font-semibold">{violation.rule}</span>
                <Badge className={
                  violation.severity === 'critical' 
                    ? 'bg-red-500/20 text-red-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }>
                  {violation.severity}
                </Badge>
              </div>
              <div className="ml-7">
                <p className="text-sm text-muted-foreground mb-1">Evidence:</p>
                <blockquote className="border-l-2 border-muted pl-3 italic text-sm">
                  "{violation.evidence}"
                </blockquote>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
