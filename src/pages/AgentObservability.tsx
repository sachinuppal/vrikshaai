import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Download, Share2, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  FivePillarsDashboard,
  SectionComplianceGrid,
  AnomalyList,
  ViolationsList,
  AnnotatedTranscript,
  ObservabilityUploader,
  RecentSessionsList,
} from '@/components/observability';

interface AnalysisResult {
  pillars: {
    reliability: number;
    latency: number | null;
    accuracy: number;
    adherence: number;
    outcome: { score: number; status: string };
  };
  sectionCompliance: Record<string, { score: number; status: 'pass' | 'partial' | 'fail'; notes: string }>;
  anomalies: Array<{ type: string; severity: 'high' | 'medium' | 'low'; message: string; turnIndex?: number }>;
  violations: Array<{ rule: string; evidence: string; severity: 'critical' | 'warning' }>;
  recommendations: string[];
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export default function AgentObservability() {
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [transcript, setTranscript] = useState<object[]>([]);
  const [activeTab, setActiveTab] = useState('new');

  useEffect(() => {
    document.title = 'Agent Observability Hub - Vriksha AI';
  }, []);

  const handleAnalyze = async (data: { scriptJson?: object; transcript: object[]; callId?: string }) => {
    setIsAnalyzing(true);
    setTranscript(data.transcript);

    try {
      const sessionId = crypto.randomUUID();
      
      const { data: result, error } = await supabase.functions.invoke('comprehensive-observability', {
        body: {
          scriptJson: data.scriptJson,
          transcript: data.transcript,
          callId: data.callId,
          sessionId,
        },
      });

      if (error) throw error;

      if (result.analysis) {
        setAnalysisResult(result.analysis);
        toast.success('Analysis completed successfully');
      } else {
        throw new Error('No analysis result returned');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('observability_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) throw error;

      if (data) {
        const result = data.observability_result as unknown as AnalysisResult;
        setAnalysisResult(result);
        setTranscript((data.transcript as unknown as object[]) || []);
        setActiveTab('new');
        toast.success('Session loaded');
      }
    } catch (error) {
      console.error('Error loading session:', error);
      toast.error('Failed to load session');
    }
  };

  const handleExportJSON = () => {
    if (!analysisResult) return;
    
    const exportData = {
      analysis: analysisResult,
      transcript,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `observability-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported');
  };

  const getRiskBadge = (risk: string) => {
    const colors: Record<string, string> = {
      low: 'bg-green-500/20 text-green-400',
      medium: 'bg-yellow-500/20 text-yellow-400',
      high: 'bg-orange-500/20 text-orange-400',
      critical: 'bg-red-500/20 text-red-400',
    };
    return colors[risk] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Agent Observability Hub</h1>
                  <p className="text-sm text-muted-foreground">QA & Analytics for Voice AI</p>
                </div>
              </div>
            </div>
            
            {analysisResult && (
              <div className="flex items-center gap-3">
                <Badge className={getRiskBadge(analysisResult.riskLevel)}>
                  Risk: {analysisResult.riskLevel}
                </Badge>
                <span className="text-2xl font-bold text-primary">
                  {analysisResult.overallScore}%
                </span>
                <Button variant="outline" size="sm" onClick={handleExportJSON}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="new">New Analysis</TabsTrigger>
            <TabsTrigger value="recent">Recent Sessions</TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="space-y-6">
            {/* Upload Section */}
            <div className="grid lg:grid-cols-2 gap-6">
              <ObservabilityUploader onAnalyze={handleAnalyze} isLoading={isAnalyzing} />
              
              {/* Quick Stats or Instructions */}
              <div className="space-y-4">
                <div className="p-6 rounded-lg border border-border/50 bg-card/50">
                  <h3 className="font-semibold mb-3">What We Analyze</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      5 Pillars: Reliability, Latency, Accuracy, Adherence, Outcome
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      18-Section Script Compliance Check
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-500" />
                      Anomaly Detection (hallucinations, tone, etc.)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Policy Violation Identification
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                      AI-Powered Recommendations
                    </li>
                  </ul>
                </div>
                
                {analysisResult?.recommendations && analysisResult.recommendations.length > 0 && (
                  <div className="p-6 rounded-lg border border-border/50 bg-card/50">
                    <h3 className="font-semibold mb-3">AI Recommendations</h3>
                    <ul className="space-y-2">
                      {analysisResult.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <span className="text-primary">→</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Results Display */}
            {analysisResult && (
              <div className="space-y-6">
                {/* 5 Pillars */}
                <FivePillarsDashboard pillars={analysisResult.pillars} />

                {/* Section Compliance */}
                <SectionComplianceGrid compliance={analysisResult.sectionCompliance} />

                {/* Anomalies and Violations */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <AnomalyList anomalies={analysisResult.anomalies} />
                  <ViolationsList violations={analysisResult.violations} />
                </div>

                {/* Annotated Transcript */}
                {transcript.length > 0 && (
                  <AnnotatedTranscript 
                    transcript={transcript as any[]} 
                    compliance={analysisResult.sectionCompliance}
                  />
                )}

                {/* Export Actions */}
                <div className="flex justify-center gap-4">
                  <Button variant="outline" onClick={handleExportJSON}>
                    <FileJson className="w-4 h-4 mr-2" />
                    Download JSON Report
                  </Button>
                  <Button variant="outline" disabled>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Link (Coming Soon)
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recent">
            <RecentSessionsList onSelectSession={handleSelectSession} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
