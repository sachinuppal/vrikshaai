import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EnterpriseNotificationRequest {
  companyName: string;
  industry: string;
  useCases: string[];
  contactName: string;
  role?: string;
  email: string;
  phone?: string;
  deploymentMode?: string;
  estimatedScale?: string;
  additionalNotes?: string;
  bestTimeForDemo?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: EnterpriseNotificationRequest = await req.json();
    
    console.log("Sending enterprise notification email for:", data.email);

    const useCasesList = data.useCases.map(uc => `<li>${uc}</li>`).join("");

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
        subject: `🏢 New Enterprise Pilot Request from ${data.companyName}`,
        html: `
          <h2>New Enterprise Pilot Request</h2>
          <h3>Company Information</h3>
          <p><strong>Company:</strong> ${data.companyName}</p>
          <p><strong>Industry:</strong> ${data.industry}</p>
          
          <h3>Use Cases Interested In</h3>
          <ul>${useCasesList}</ul>
          
          <h3>Contact Information</h3>
          <p><strong>Name:</strong> ${data.contactName}</p>
          ${data.role ? `<p><strong>Role:</strong> ${data.role}</p>` : ''}
          <p><strong>Email:</strong> ${data.email}</p>
          ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ''}
          
          <h3>Requirements</h3>
          ${data.deploymentMode ? `<p><strong>Deployment Mode:</strong> ${data.deploymentMode}</p>` : ''}
          ${data.estimatedScale ? `<p><strong>Estimated Scale:</strong> ${data.estimatedScale}</p>` : ''}
          ${data.bestTimeForDemo ? `<p><strong>Best Time for Demo:</strong> ${data.bestTimeForDemo}</p>` : ''}
          ${data.additionalNotes ? `<p><strong>Additional Notes:</strong></p><p>${data.additionalNotes}</p>` : ''}
          
          <hr>
          <p style="color: #666; font-size: 12px;">This email was sent from the Vriksha.ai Enterprise Portal.</p>
        `,
      }),
    });

    const adminEmailData = await adminEmailRes.json();
    console.log("Admin notification response:", adminEmailData);

    // Send confirmation to enterprise contact
    const userEmailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Vriksha <onboarding@resend.dev>",
        to: [data.email],
        subject: "Thank you for your interest in partnering with Vriksha.ai",
        html: `
          <h2>Thank you for reaching out, ${data.contactName}!</h2>
          <p>We have received your pilot request for <strong>${data.companyName}</strong> and our enterprise team will get back to you within 24-48 hours.</p>
          
          <h3>Your Request Summary</h3>
          <p><strong>Industry:</strong> ${data.industry}</p>
          <p><strong>Use Cases:</strong></p>
          <ul>${useCasesList}</ul>
          ${data.deploymentMode ? `<p><strong>Deployment Preference:</strong> ${data.deploymentMode}</p>` : ''}
          
          <p>Our team will review your requirements and prepare a tailored proposal for your pilot program.</p>
          
          <p>Best regards,<br>The Vriksha.ai Enterprise Team</p>
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
    console.error("Error in send-enterprise-notification function:", error);
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
