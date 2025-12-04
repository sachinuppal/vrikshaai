import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactNotificationRequest {
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  mobile: string;
  message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { firstName, lastName, email, countryCode, mobile, message }: ContactNotificationRequest = await req.json();

    console.log("Sending contact notification email for:", email);

    // Send notification to admin
    const adminEmailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Vriksha <onboarding@resend.dev>",
        to: ["contact@vriksha.ai"],
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
    console.log("Admin notification response:", adminEmailData);

    // Send confirmation to user
    const userEmailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Vriksha <onboarding@resend.dev>",
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
    console.log("User confirmation response:", userEmailData);

    return new Response(
      JSON.stringify({ success: true, adminEmail: adminEmailData, userEmail: userEmailData }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-notification function:", error);
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
