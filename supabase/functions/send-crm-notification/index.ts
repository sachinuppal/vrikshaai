import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// HTML escape function to prevent injection
const escapeHtml = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Server-side validation schema
const crmLeadSchema = z.object({
  full_name: z.string().min(1).max(100).transform(escapeHtml),
  company_name: z.string().min(1).max(200).transform(escapeHtml),
  industry: z.string().min(1).max(100).transform(escapeHtml),
  estimated_lead_volume: z.string().max(100).optional().transform(val => val ? escapeHtml(val) : undefined),
  current_crm: z.string().max(100).optional().transform(val => val ? escapeHtml(val) : undefined),
  key_pain_point: z.string().min(1).max(1000).transform(escapeHtml),
  pilot_path: z.string().min(1).max(100).transform(escapeHtml),
  phone: z.string().min(1).max(20).transform(escapeHtml),
  email: z.string().email().max(255),
  preferred_time: z.string().max(100).optional().transform(val => val ? escapeHtml(val) : undefined),
});

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
      from: "Vriksha AI CRM <hello@emails.vriksha.ai>",
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
    const rawData = await req.json();
    
    // Validate and sanitize input
    const validationResult = crmLeadSchema.safeParse(rawData);
    if (!validationResult.success) {
      console.error("Validation failed:", validationResult.error.flatten());
      return new Response(
        JSON.stringify({ error: "Invalid input data", details: validationResult.error.flatten() }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const data = validationResult.data;
    
    // Log with masked email
    console.log("Received CRM lead data for:", data.email.replace(/(.{2}).*@/, '$1***@'));

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

    console.log("Admin notification sent successfully");

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

    console.log("User confirmation sent successfully");

    return new Response(
      JSON.stringify({ success: true, adminEmail: adminEmailResponse, userEmail: userEmailResponse }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-crm-notification:", error.message);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
