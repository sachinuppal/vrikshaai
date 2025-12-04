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
const voiceLeadSchema = z.object({
  full_name: z.string().min(1).max(100).transform(escapeHtml),
  company_name: z.string().min(1).max(200).transform(escapeHtml),
  email: z.string().email().max(255),
  phone: z.string().min(1).max(20).transform(escapeHtml),
  industry: z.string().min(1).max(100).transform(escapeHtml),
  use_case: z.string().max(500).optional().transform(val => val ? escapeHtml(val) : undefined),
  current_solution: z.string().max(500).optional().transform(val => val ? escapeHtml(val) : undefined),
  estimated_call_volume: z.string().max(100).optional().transform(val => val ? escapeHtml(val) : undefined),
  comments: z.string().max(2000).optional().transform(val => val ? escapeHtml(val) : undefined),
});

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawData = await req.json();
    
    // Validate and sanitize input
    const validationResult = voiceLeadSchema.safeParse(rawData);
    if (!validationResult.success) {
      console.error("Validation failed:", validationResult.error.flatten());
      return new Response(
        JSON.stringify({ error: "Invalid input data", details: validationResult.error.flatten() }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const data = validationResult.data;
    
    // Log with masked email and phone
    console.log("Received voice lead notification for:", data.email.replace(/(.{2}).*@/, '$1***@'));

    // Send admin notification
    const adminEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Vriksha Voice <notifications@vriksha.ai>",
        to: ["harshavardhan@vriksha.ai"],
        subject: `🎙️ New Voice AI Demo Request from ${data.company_name}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background-color: #f5f5f5; }
              .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; text-align: center; }
              .header h1 { color: white; margin: 0; font-size: 24px; }
              .content { padding: 30px; }
              .field { margin-bottom: 16px; padding: 12px; background: #fafafa; border-radius: 8px; border-left: 3px solid #f97316; }
              .field-label { font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
              .field-value { color: #1a1a1a; font-size: 15px; margin-top: 4px; }
              .highlight { background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); border-color: #f97316; }
              .footer { padding: 20px 30px; background: #1a1a1a; text-align: center; }
              .footer p { color: #888; margin: 0; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎙️ New Voice AI Demo Request</h1>
              </div>
              <div class="content">
                <div class="field highlight">
                  <div class="field-label">Contact Name</div>
                  <div class="field-value">${data.full_name}</div>
                </div>
                <div class="field highlight">
                  <div class="field-label">Company</div>
                  <div class="field-value">${data.company_name}</div>
                </div>
                <div class="field">
                  <div class="field-label">Email</div>
                  <div class="field-value"><a href="mailto:${data.email}">${data.email}</a></div>
                </div>
                <div class="field">
                  <div class="field-label">Phone</div>
                  <div class="field-value"><a href="tel:${data.phone}">${data.phone}</a></div>
                </div>
                <div class="field">
                  <div class="field-label">Industry</div>
                  <div class="field-value">${data.industry}</div>
                </div>
                ${data.use_case ? `
                <div class="field">
                  <div class="field-label">Primary Use Case</div>
                  <div class="field-value">${data.use_case}</div>
                </div>
                ` : ''}
                ${data.current_solution ? `
                <div class="field">
                  <div class="field-label">Current Call Center Setup</div>
                  <div class="field-value">${data.current_solution}</div>
                </div>
                ` : ''}
                ${data.estimated_call_volume ? `
                <div class="field">
                  <div class="field-label">Estimated Monthly Call Volume</div>
                  <div class="field-value">${data.estimated_call_volume}</div>
                </div>
                ` : ''}
                ${data.comments ? `
                <div class="field">
                  <div class="field-label">Additional Comments</div>
                  <div class="field-value">${data.comments}</div>
                </div>
                ` : ''}
              </div>
              <div class="footer">
                <p>Vriksha AI Voice Lead Notification System</p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const adminResult = await adminEmailResponse.json();
    console.log("Admin email sent successfully");

    // Send user confirmation
    const userEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Vriksha AI <hello@vriksha.ai>",
        to: [data.email],
        subject: "Thank you for your interest in Vriksha Voice AI!",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background-color: #f5f5f5; }
              .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 40px 30px; text-align: center; }
              .header h1 { color: white; margin: 0 0 10px 0; font-size: 28px; }
              .header p { color: rgba(255,255,255,0.9); margin: 0; font-size: 16px; }
              .content { padding: 40px 30px; }
              .content h2 { color: #f97316; margin-top: 0; }
              .content p { color: #444; }
              .cta { display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; }
              .features { background: #fafafa; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .features h3 { margin-top: 0; color: #1a1a1a; }
              .features ul { margin: 0; padding-left: 20px; color: #666; }
              .features li { margin-bottom: 8px; }
              .footer { padding: 30px; background: #1a1a1a; text-align: center; }
              .footer p { color: #888; margin: 0 0 10px 0; font-size: 13px; }
              .footer a { color: #f97316; text-decoration: none; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎙️ Vriksha Voice AI</h1>
                <p>Transform Voice Into Value</p>
              </div>
              <div class="content">
                <h2>Thank you, ${data.full_name}!</h2>
                <p>We've received your demo request for Vriksha Voice AI. Our team will review your requirements and reach out within 24 hours to schedule a personalized demo.</p>
                
                <div class="features">
                  <h3>What to Expect</h3>
                  <ul>
                    <li>Live demo of our Voice AI capabilities</li>
                    <li>Custom use case discussion for ${data.industry}</li>
                    <li>Integration & deployment roadmap</li>
                    <li>ROI analysis for your specific needs</li>
                  </ul>
                </div>

                <p>In the meantime, feel free to explore our resources or reach out if you have any questions.</p>
                
                <a href="https://vriksha.ai/voice" class="cta">Learn More About Voice AI →</a>
              </div>
              <div class="footer">
                <p>Vriksha AI | Enterprise Voice AI Solutions</p>
                <p><a href="https://vriksha.ai">vriksha.ai</a> | <a href="mailto:hello@vriksha.ai">hello@vriksha.ai</a></p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const userResult = await userEmailResponse.json();
    console.log("User confirmation email sent successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        adminEmail: adminResult, 
        userEmail: userResult 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-voice-notification:", error.message);
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
