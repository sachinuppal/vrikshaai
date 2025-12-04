import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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
const inviteSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().max(100).optional().transform(val => val ? escapeHtml(val) : undefined),
  role: z.string().max(100).optional().transform(val => val ? escapeHtml(val) : undefined),
  token: z.string().uuid(),
});

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawData = await req.json();
    
    // Validate and sanitize input
    const validationResult = inviteSchema.safeParse(rawData);
    if (!validationResult.success) {
      console.error("Validation failed:", validationResult.error.flatten());
      return new Response(
        JSON.stringify({ error: "Invalid input data", details: validationResult.error.flatten() }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { email, name, role, token } = validationResult.data;

    // Log with masked email
    console.log("Sending co-founder invite to:", email.replace(/(.{2}).*@/, '$1***@'));

    // Get the origin from the request or use a default
    const origin = req.headers.get("origin") || "https://vriksha.ai";
    const inviteLink = `${origin}/accept-invite?token=${token}`;

    const displayName = name || escapeHtml(email.split("@")[0]);
    const roleText = role ? ` as ${role}` : "";

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Vriksha.ai <onboarding@resend.dev>",
        to: [email],
        subject: "You've been invited to join an application on Vriksha.ai",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; padding: 20px; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #f97316; margin-bottom: 10px;">Vriksha.ai</h1>
              <p style="color: #666; font-size: 14px;">AI-First Startup Accelerator</p>
            </div>
            
            <div style="background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 30px;">
              <h2 style="color: #1a1a1a; margin-top: 0;">Hey ${displayName}! 👋</h2>
              
              <p style="color: #333;">
                You've been invited to join a startup application${roleText} on Vriksha.ai's accelerator program.
              </p>
              
              <p style="color: #333;">
                As a co-founder, you'll be able to view and edit the application together with your team.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteLink}" 
                   style="display: inline-block; background: #f97316; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                  Accept Invitation
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px;">
                This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
              <p>© ${new Date().getFullYear()} Vriksha.ai. All rights reserved.</p>
            </div>
          </body>
          </html>
        `,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Resend API error");
      throw new Error(`Failed to send email`);
    }

    const data = await res.json();
    console.log("Email sent successfully");

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-cofounder-invite function:", error.message);
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
