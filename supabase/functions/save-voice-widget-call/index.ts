import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, phone, countryCode, fullPhone, pageUrl } = await req.json();

    // Validate required fields
    if (!name || !phone || !countryCode || !fullPhone) {
      console.error("Missing required fields:", { name: !!name, phone: !!phone, countryCode: !!countryCode, fullPhone: !!fullPhone });
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role key to bypass RLS
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    console.log("Saving voice widget call:", { name, phone, countryCode, fullPhone, pageUrl });

    const { data, error } = await supabase
      .from("voice_widget_calls")
      .insert({
        name: name.trim(),
        phone: phone.trim(),
        country_code: countryCode,
        full_phone: fullPhone,
        source: "voice_widget",
        page_url: pageUrl || null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error inserting voice widget call:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Voice widget call saved successfully:", data.id);

    return new Response(
      JSON.stringify({ id: data.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
