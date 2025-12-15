import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SECTION_NAMES = [
  'identity', 'objectives', 'style', 'response_guidelines', 'greeting',
  'guardrails', 'fallbacks', 'variable_capture', 'task_flow', 'conditional_paths',
  'required_phrases', 'forbidden_phrases', 'escalation_triggers', 'closing',
  'error_handling', 'silence_handling', 'interrupt_handling', 'context_retention'
];

interface TranscriptEntry {
  role?: string;
  content?: string;
  bot?: string;
  user?: string;
  timestamp?: number;
}

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scriptJson, transcript, callId, sessionId } = await req.json();

    if (!transcript || transcript.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Transcript is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format transcript for analysis
    const formattedTranscript = transcript.map((entry: TranscriptEntry, index: number) => {
      const role = entry.role || (entry.bot ? 'assistant' : 'user');
      const content = entry.content || entry.bot || entry.user || '';
      return `[Turn ${index + 1}] ${role}: ${content}`;
    }).join('\n');

    // Build script context
    const scriptContext = scriptJson ? JSON.stringify(scriptJson, null, 2) : 'No script provided';

    const analysisPrompt = `You are an expert AI voice agent quality analyst. Analyze this voice call transcript against the provided script.

## Script Configuration:
${scriptContext}

## Transcript:
${formattedTranscript}

## Analysis Requirements:

### 1. Five Pillars Assessment (0-100 each):
- **Reliability**: Error handling, tool success, fallback usage, conversation flow stability
- **Latency**: Mark as null (not measurable from transcript alone)
- **Accuracy**: Intent recognition, slot extraction correctness, information accuracy, no hallucinations
- **Adherence**: Script compliance, section coverage, required phrases usage, proper sequencing
- **Outcome**: Primary objective achievement, user satisfaction indicators, successful resolution

### 2. Section Compliance (18 sections):
For each section: identity, objectives, style, response_guidelines, greeting, guardrails, fallbacks, variable_capture, task_flow, conditional_paths, required_phrases, forbidden_phrases, escalation_triggers, closing, error_handling, silence_handling, interrupt_handling, context_retention

Rate 0-100 with status (pass/partial/fail) and notes.

### 3. Anomaly Detection:
Identify issues like:
- guardrail_triggered: Safety check activated
- brevity_violation: Response too long (>50 words) or too short
- off_topic: Discussion outside script scope
- pii_exposure: Sensitive data mishandling
- tone_mismatch: Voice not matching brand
- long_monologue: Bot speaking >30 seconds equivalent
- user_frustration: Signs of user dissatisfaction
- hallucination: Information not in script/context

### 4. Violations:
Critical rule breaches with evidence quotes.

### 5. Recommendations:
3-5 actionable improvements.

Respond with ONLY valid JSON matching this structure:
{
  "pillars": {
    "reliability": <number 0-100>,
    "latency": null,
    "accuracy": <number 0-100>,
    "adherence": <number 0-100>,
    "outcome": { "score": <number 0-100>, "status": "<success|partial|failed>" }
  },
  "sectionCompliance": {
    "<section_name>": { "score": <0-100>, "status": "<pass|partial|fail>", "notes": "<brief note>" }
  },
  "anomalies": [
    { "type": "<anomaly_type>", "severity": "<high|medium|low>", "message": "<description>", "turnIndex": <optional number> }
  ],
  "violations": [
    { "rule": "<rule name>", "evidence": "<quote from transcript>", "severity": "<critical|warning>" }
  ],
  "recommendations": ["<recommendation 1>", "<recommendation 2>", ...],
  "overallScore": <number 0-100>,
  "riskLevel": "<low|medium|high|critical>"
}`;

    console.log('Calling AI for comprehensive observability analysis...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert AI voice agent quality analyst. Always respond with valid JSON only.' },
          { role: 'user', content: analysisPrompt }
        ],
        max_tokens: 4000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', errorText);
      throw new Error(`AI analysis failed: ${response.status}`);
    }

    const aiResponse = await response.json();
    let analysisText = aiResponse.choices?.[0]?.message?.content || '';
    
    // Clean up markdown formatting
    analysisText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let analysis: AnalysisResult;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', analysisText);
      // Return a default structure if parsing fails
      analysis = {
        pillars: { reliability: 0, latency: null, accuracy: 0, adherence: 0, outcome: { score: 0, status: 'failed' } },
        sectionCompliance: {},
        anomalies: [{ type: 'analysis_error', severity: 'high', message: 'Failed to analyze transcript' }],
        violations: [],
        recommendations: ['Re-run analysis with clearer transcript'],
        overallScore: 0,
        riskLevel: 'high'
      };
    }

    // Store in database if sessionId provided
    if (sessionId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      await supabase.from('observability_sessions').upsert({
        id: sessionId,
        transcript: transcript,
        observability_result: analysis,
        reliability_score: analysis.pillars.reliability,
        latency_score: analysis.pillars.latency,
        accuracy_score: analysis.pillars.accuracy,
        adherence_score: analysis.pillars.adherence,
        outcome_score: analysis.pillars.outcome.score,
        overall_score: analysis.overallScore,
        anomalies_detected: analysis.anomalies,
        violations: analysis.violations,
        risk_level: analysis.riskLevel,
        status: 'completed',
        external_call_id: callId,
      });
    }

    console.log('Analysis completed successfully');

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Comprehensive observability error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
