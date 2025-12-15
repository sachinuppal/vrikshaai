import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Token pricing per 1M tokens (as of Dec 2024)
const PRICING: Record<string, { input: number; output: number }> = {
  // OpenAI
  "openai/gpt-5": { input: 2.50, output: 10.00 },
  "openai/gpt-5-mini": { input: 0.40, output: 1.60 },
  "openai/gpt-5-nano": { input: 0.10, output: 0.40 },
  "gpt-4o": { input: 2.50, output: 10.00 },
  "gpt-4o-mini": { input: 0.15, output: 0.60 },
  // Google
  "google/gemini-2.5-pro": { input: 1.25, output: 5.00 },
  "google/gemini-2.5-flash": { input: 0.075, output: 0.30 },
  "google/gemini-2.5-flash-lite": { input: 0.02, output: 0.08 },
  // Lovable AI (using Gemini pricing as baseline)
  "lovable/gemini-2.5-flash": { input: 0.075, output: 0.30 },
};

interface AIRouterRequest {
  messages: Array<{ role: string; content: string }>;
  model?: string;
  user_id?: string;
  feature: string;
  session_id?: string;
  max_tokens?: number;
  temperature?: number;
  response_format?: { type: string };
  tools?: any[];
  tool_choice?: any;
}

interface UsageInfo {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost_usd: number;
  provider: string;
  model: string;
  using_own_key: boolean;
}

// Get user's API key for a provider
async function getUserApiKey(supabase: any, userId: string, provider: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("user_api_keys")
    .select("encrypted_key")
    .eq("user_id", userId)
    .eq("provider", provider)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;
  return data.encrypted_key;
}

// Calculate cost from token usage
function calculateCost(inputTokens: number, outputTokens: number, model: string): number {
  const pricing = PRICING[model] || PRICING["google/gemini-2.5-flash"];
  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  return inputCost + outputCost;
}

// Log usage to database
async function logUsage(
  supabase: any,
  userId: string | undefined,
  sessionId: string | undefined,
  feature: string,
  provider: string,
  model: string,
  inputTokens: number,
  outputTokens: number,
  costUsd: number,
  apiKeyId?: string
) {
  try {
    await supabase.from("ai_usage_log").insert({
      user_id: userId || null,
      session_id: sessionId,
      provider,
      model,
      feature,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      total_tokens: inputTokens + outputTokens,
      cost_usd: costUsd,
      api_key_id: apiKeyId || null,
      metadata: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error("Failed to log usage:", error);
  }
}

// Call OpenAI API
async function callOpenAI(apiKey: string, request: AIRouterRequest): Promise<{ data: any; usage: UsageInfo }> {
  const model = request.model?.replace("openai/", "") || "gpt-4o-mini";
  
  const body: any = {
    model,
    messages: request.messages,
  };
  
  if (request.max_tokens) body.max_tokens = request.max_tokens;
  if (request.temperature !== undefined) body.temperature = request.temperature;
  if (request.response_format) body.response_format = request.response_format;
  if (request.tools) body.tools = request.tools;
  if (request.tool_choice) body.tool_choice = request.tool_choice;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const inputTokens = data.usage?.prompt_tokens || 0;
  const outputTokens = data.usage?.completion_tokens || 0;
  const cost = calculateCost(inputTokens, outputTokens, request.model || "gpt-4o-mini");

  return {
    data,
    usage: {
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      total_tokens: inputTokens + outputTokens,
      cost_usd: cost,
      provider: "openai",
      model: model,
      using_own_key: true,
    },
  };
}

// Call Google AI API
async function callGoogle(apiKey: string, request: AIRouterRequest): Promise<{ data: any; usage: UsageInfo }> {
  const modelName = request.model?.replace("google/", "") || "gemini-2.5-flash";
  
  // Convert OpenAI format to Google format
  const contents = request.messages
    .filter(m => m.role !== "system")
    .map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const systemInstruction = request.messages.find(m => m.role === "system");

  const body: any = {
    contents,
    generationConfig: {},
  };

  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction.content }] };
  }
  if (request.max_tokens) body.generationConfig.maxOutputTokens = request.max_tokens;
  if (request.temperature !== undefined) body.generationConfig.temperature = request.temperature;
  if (request.response_format?.type === "json_object") {
    body.generationConfig.responseMimeType = "application/json";
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google AI API error: ${response.status} - ${errorText}`);
  }

  const googleData = await response.json();
  
  // Convert Google response to OpenAI format
  const inputTokens = googleData.usageMetadata?.promptTokenCount || 0;
  const outputTokens = googleData.usageMetadata?.candidatesTokenCount || 0;
  const cost = calculateCost(inputTokens, outputTokens, request.model || "google/gemini-2.5-flash");

  const content = googleData.candidates?.[0]?.content?.parts?.[0]?.text || "";
  
  const openAIFormat = {
    choices: [
      {
        message: {
          role: "assistant",
          content,
        },
        finish_reason: googleData.candidates?.[0]?.finishReason?.toLowerCase() || "stop",
      },
    ],
    usage: {
      prompt_tokens: inputTokens,
      completion_tokens: outputTokens,
      total_tokens: inputTokens + outputTokens,
    },
  };

  return {
    data: openAIFormat,
    usage: {
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      total_tokens: inputTokens + outputTokens,
      cost_usd: cost,
      provider: "google",
      model: modelName,
      using_own_key: true,
    },
  };
}

// Call Lovable AI Gateway (fallback)
async function callLovableAI(apiKey: string, request: AIRouterRequest): Promise<{ data: any; usage: UsageInfo }> {
  const model = request.model || "google/gemini-2.5-flash";
  
  const body: any = {
    model,
    messages: request.messages,
  };
  
  if (request.max_tokens) body.max_tokens = request.max_tokens;
  if (request.temperature !== undefined) body.temperature = request.temperature;
  if (request.response_format) body.response_format = request.response_format;
  if (request.tools) body.tools = request.tools;
  if (request.tool_choice) body.tool_choice = request.tool_choice;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 429) {
      throw new Error("RATE_LIMIT");
    }
    if (response.status === 402) {
      throw new Error("CREDITS_EXHAUSTED");
    }
    throw new Error(`Lovable AI error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  // Estimate tokens if not provided (Lovable AI may not always return usage)
  const inputTokens = data.usage?.prompt_tokens || estimateTokens(request.messages.map(m => m.content).join(" "));
  const outputTokens = data.usage?.completion_tokens || estimateTokens(data.choices?.[0]?.message?.content || "");
  const cost = calculateCost(inputTokens, outputTokens, model);

  return {
    data,
    usage: {
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      total_tokens: inputTokens + outputTokens,
      cost_usd: cost,
      provider: "lovable",
      model,
      using_own_key: false,
    },
  };
}

// Simple token estimation (rough approximation)
function estimateTokens(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: AIRouterRequest = await req.json();
    const { user_id, feature, session_id, model } = request;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`AI Router - Feature: ${feature}, User: ${user_id || "anonymous"}, Model: ${model}`);

    let result: { data: any; usage: UsageInfo };
    let apiKeyId: string | undefined;

    // Determine provider based on model prefix and check for user's own key
    const modelLower = (model || "").toLowerCase();
    
    if (user_id) {
      // Check for user's OpenAI key
      if (modelLower.includes("gpt") || modelLower.startsWith("openai/")) {
        const openaiKey = await getUserApiKey(supabase, user_id, "openai");
        if (openaiKey) {
          console.log("Using user's OpenAI key");
          result = await callOpenAI(openaiKey, request);
        } else {
          console.log("No OpenAI key found, using Lovable AI");
          result = await callLovableAI(lovableApiKey, request);
        }
      }
      // Check for user's Google key
      else if (modelLower.includes("gemini") || modelLower.startsWith("google/")) {
        const googleKey = await getUserApiKey(supabase, user_id, "google");
        if (googleKey) {
          console.log("Using user's Google key");
          result = await callGoogle(googleKey, request);
        } else {
          console.log("No Google key found, using Lovable AI");
          result = await callLovableAI(lovableApiKey, request);
        }
      }
      // Default to Lovable AI
      else {
        result = await callLovableAI(lovableApiKey, request);
      }
    } else {
      // No user_id, use Lovable AI
      result = await callLovableAI(lovableApiKey, request);
    }

    // Log usage to database
    await logUsage(
      supabase,
      user_id,
      session_id,
      feature,
      result.usage.provider,
      result.usage.model,
      result.usage.input_tokens,
      result.usage.output_tokens,
      result.usage.cost_usd,
      apiKeyId
    );

    // Return response with usage metadata
    return new Response(
      JSON.stringify({
        ...result.data,
        usage: result.usage,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("AI Router error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    if (errorMessage === "RATE_LIMIT") {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (errorMessage === "CREDITS_EXHAUSTED") {
      return new Response(
        JSON.stringify({ error: "AI credits exhausted. Please add credits or configure your own API key." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
