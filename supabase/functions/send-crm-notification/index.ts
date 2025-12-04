import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CRMLeadRequest {
  full_name: string;
  company_name: string;
  industry: string;
  estimated_lead_volume?: string;
  current_crm?: string;
  key_pain_point: string;
  pilot_path: string;
  phone: string;
  email: string;
  preferred_time?: string;
}

const industryLabels: Record<string, string> = {
  real_estate: "Real Estate",
  finance: "Finance & Banking",
  retail: "Retail & E-Commerce",
  energy: "Energy / Solar",
  healthcare: "Healthcare",
  education: "Education",
  services: "Professional Services",
  other: "Other",
};

const pilotLabels: Record<string, string> = {
  voice_ai: "Voice AI Pilot",
  crm_automation: "CRM Automation Pilot",
  industry_graph: "Industry Opportunity Graph Pilot",
  full_enterprise: "Full Enterprise Integration",
};

const sendEmail = async (to: string[], subject: string, html: string) => {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Vriksha AI CRM <onboarding@resend.dev>",
      to,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to send email: ${error}`);
  }

  return res.json();
};

const handler = async (req: Request): Promise<Response> => {
  console.log("CRM notification function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: CRMLeadRequest = await req.json();
    console.log("Received CRM lead data:", { ...data, email: "***" });

    const industryLabel = industryLabels[data.industry] || data.industry;
    const pilotLabel = pilotLabels[data.pilot_path] || data.pilot_path;

    // Send admin notification
    const adminEmailResponse = await sendEmail(
      ["harshavardhan@vriksha.ai"],
      `🌳 New AI CRM Pilot Request - ${data.company_name}`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f97316;">New AI CRM Pilot Request</h1>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background: #f8f9fa;">
              <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Full Name</td>
              <td style="padding: 12px; border: 1px solid #dee2e6;">${data.full_name}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Company</td>
              <td style="padding: 12px; border: 1px solid #dee2e6;">${data.company_name}</td>
            </tr>
            <tr style="background: #f8f9fa;">
              <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Industry</td>
              <td style="padding: 12px; border: 1px solid #dee2e6;">${industryLabel}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Lead Volume</td>
              <td style="padding: 12px; border: 1px solid #dee2e6;">${data.estimated_lead_volume || "Not specified"}</td>
            </tr>
            <tr style="background: #f8f9fa;">
              <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Current CRM</td>
              <td style="padding: 12px; border: 1px solid #dee2e6;">${data.current_crm || "None"}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Pilot Path</td>
              <td style="padding: 12px; border: 1px solid #dee2e6;">${pilotLabel}</td>
            </tr>
            <tr style="background: #f8f9fa;">
              <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Phone</td>
              <td style="padding: 12px; border: 1px solid #dee2e6;">${data.phone}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Email</td>
              <td style="padding: 12px; border: 1px solid #dee2e6;">${data.email}</td>
            </tr>
            <tr style="background: #f8f9fa;">
              <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Preferred Time</td>
              <td style="padding: 12px; border: 1px solid #dee2e6;">${data.preferred_time || "Not specified"}</td>
            </tr>
          </table>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #856404;">Key Pain Point:</h3>
            <p style="margin: 0; color: #856404;">${data.key_pain_point}</p>
          </div>
          
          <p style="color: #6c757d; font-size: 12px;">
            Submitted at: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
          </p>
        </div>
      `
    );

    console.log("Admin notification sent:", adminEmailResponse);

    // Send user confirmation
    const userEmailResponse = await sendEmail(
      [data.email],
      "🌳 Your AI CRM Pilot Request Received - Vriksha.ai",
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f97316;">Thank you, ${data.full_name}!</h1>
          
          <p>We've received your request for the <strong>${pilotLabel}</strong>.</p>
          
          <p>Our team will review your submission and contact you within <strong>24 hours</strong> to discuss:</p>
          
          <ul>
            <li>Your specific requirements for ${data.company_name}</li>
            <li>Custom implementation approach for ${industryLabel}</li>
            <li>Timeline and next steps</li>
          </ul>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
            <p style="margin: 0; font-weight: bold; color: #166534;">What to expect:</p>
            <p style="margin: 10px 0 0 0; color: #166534;">
              You'll receive a personalized demo showing how Vriksha AI CRM can transform your customer relationships 
              and expand opportunities across your industry vertical.
            </p>
          </div>
          
          <p>If you have any immediate questions, feel free to reach out at <a href="mailto:harshavardhan@vriksha.ai">harshavardhan@vriksha.ai</a></p>
          
          <p style="margin-top: 30px;">
            Best regards,<br>
            <strong>The Vriksha.ai Team</strong>
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <p style="color: #6c757d; font-size: 12px;">
            Vriksha.ai - The World's First AI Relationship Engine<br>
            <a href="https://vriksha.ai" style="color: #f97316;">vriksha.ai</a>
          </p>
        </div>
      `
    );

    console.log("User confirmation sent:", userEmailResponse);

    return new Response(
      JSON.stringify({ success: true, adminEmail: adminEmailResponse, userEmail: userEmailResponse }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-crm-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);