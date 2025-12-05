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
const contactSchema = z.object({
  firstName: z.string().min(1).max(100).transform(escapeHtml),
  lastName: z.string().min(1).max(100).transform(escapeHtml),
  email: z.string().email().max(255),
  countryCode: z.string().min(1).max(10).transform(escapeHtml),
  mobile: z.string().min(1).max(20).transform(escapeHtml),
  message: z.string().max(2000).optional().transform(val => val ? escapeHtml(val) : undefined),
});

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawData = await req.json();
    
    // Validate and sanitize input
    const validationResult = contactSchema.safeParse(rawData);
    if (!validationResult.success) {
      console.error("Validation failed:", validationResult.error.flatten());
      return new Response(
        JSON.stringify({ error: "Invalid input data", details: validationResult.error.flatten() }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    const { firstName, lastName, email, countryCode, mobile, message } = validationResult.data;

    // Log with masked email
    console.log("Sending contact notification for:", email.replace(/(.{2}).*@/, '$1***@'));

    // Send notification to admin
    const adminEmailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Vriksha <noreply@emails.vriksha.ai>",
        to: ["sachin@vriksha.ai"],
        subject: `New Contact Form Submission from ${firstName} ${lastName}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Country:</strong> ${countryCode}</p>
          <p><strong>Phone:</strong> ${mobile}</p>
          ${message ? `<p><strong>Message:</strong></p><p>${message}</p>` : '<p><em>No message provided</em></p>'}
          <hr>
          <p style="color: #666; font-size: 12px;">This email was sent from the Vriksha website contact form.</p>
        `,
      }),
    });

    const adminEmailData = await adminEmailRes.json();
    console.log("Admin notification sent successfully");

    // Send confirmation to user
    const userEmailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Vriksha <noreply@emails.vriksha.ai>",
        to: [email],
        subject: "Thank you for contacting Vriksha",
        html: `
          <h2>Thank you for reaching out, ${firstName}!</h2>
          <p>We have received your message and our team will get back to you shortly.</p>
          <p>Here's a summary of your submission:</p>
          <ul>
            <li><strong>Name:</strong> ${firstName} ${lastName}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Phone:</strong> ${mobile}</li>
            ${message ? `<li><strong>Message:</strong> ${message}</li>` : ''}
          </ul>
          <p>Best regards,<br>The Vriksha Team</p>
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
    console.error("Error in send-contact-notification function:", error.message);
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
