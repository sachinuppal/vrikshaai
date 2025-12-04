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
const enterpriseSchema = z.object({
  companyName: z.string().min(1).max(200).transform(escapeHtml),
  industry: z.string().min(1).max(100).transform(escapeHtml),
  useCases: z.array(z.string().max(200).transform(escapeHtml)).min(1).max(20),
  contactName: z.string().min(1).max(100).transform(escapeHtml),
  email: z.string().email().max(255),
  phone: z.string().max(20).optional().transform(val => val ? escapeHtml(val) : undefined),
});

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawData = await req.json();
    
    // Validate and sanitize input
    const validationResult = enterpriseSchema.safeParse(rawData);
    if (!validationResult.success) {
      console.error("Validation failed:", validationResult.error.flatten());
      return new Response(
        JSON.stringify({ error: "Invalid input data", details: validationResult.error.flatten() }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { companyName, industry, useCases, contactName, email, phone } = validationResult.data;
    
    // Log with masked email
    console.log("Sending enterprise notification for:", email.replace(/(.{2}).*@/, '$1***@'));

    const useCasesList = useCases.map(uc => `<li>${uc}</li>`).join("");

    // Send notification to admin
    const adminEmailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Vriksha <onboarding@resend.dev>",
        to: ["sachin@vriksha.ai"],
        subject: `🏢 New Enterprise Pilot Request from ${companyName}`,
        html: `
          <h2>New Enterprise Pilot Request</h2>
          <h3>Company Information</h3>
          <p><strong>Company:</strong> ${companyName}</p>
          <p><strong>Industry:</strong> ${industry}</p>
          
          <h3>Use Cases Interested In</h3>
          <ul>${useCasesList}</ul>
          
          <h3>Contact Information</h3>
          <p><strong>Name:</strong> ${contactName}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
          
          <hr>
          <p style="color: #666; font-size: 12px;">This email was sent from the Vriksha.ai Enterprise Portal.</p>
        `,
      }),
    });

    const adminEmailData = await adminEmailRes.json();
    console.log("Admin notification sent successfully");

    // Send confirmation to enterprise contact
    const userEmailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Vriksha <onboarding@resend.dev>",
        to: [email],
        subject: "Thank you for your interest in partnering with Vriksha.ai",
        html: `
          <h2>Thank you for reaching out, ${contactName}!</h2>
          <p>We have received your pilot request for <strong>${companyName}</strong> and our enterprise team will get back to you within 24-48 hours.</p>
          
          <h3>Your Request Summary</h3>
          <p><strong>Industry:</strong> ${industry}</p>
          <p><strong>Use Cases:</strong></p>
          <ul>${useCasesList}</ul>
          
          <p>Our team will review your requirements and prepare a tailored proposal for your pilot program.</p>
          
          <p>Best regards,<br>The Vriksha.ai Enterprise Team</p>
        `,
      }),
    });

    const userEmailData = await userEmailRes.json();
    console.log("User confirmation sent successfully");

    return new Response(
      JSON.stringify({ success: true, adminEmail: adminEmailData, userEmail: userEmailData }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-enterprise-notification function:", error.message);
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
