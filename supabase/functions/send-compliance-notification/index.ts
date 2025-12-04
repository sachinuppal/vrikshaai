import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ComplianceNotificationRequest {
  companyName: string;
  industry?: string;
  complianceFocus?: string[];
  deploymentPreference?: string;
  contactName?: string;
  email: string;
  phone?: string;
  requestType: "governance_pilot" | "checklist_download";
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: ComplianceNotificationRequest = await req.json();
    console.log("Received compliance notification request:", data);

    const isPilotRequest = data.requestType === "governance_pilot";

    // Email to internal team
    const internalSubject = isPilotRequest
      ? `🛡️ New Governance Pilot Request: ${data.companyName}`
      : `📋 Compliance Checklist Download: ${data.companyName}`;

    const internalHtml = isPilotRequest
      ? `
        <h2>New Governance Pilot Request</h2>
        <p><strong>Company:</strong> ${data.companyName}</p>
        <p><strong>Contact:</strong> ${data.contactName || "N/A"}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone || "N/A"}</p>
        <p><strong>Industry:</strong> ${data.industry || "N/A"}</p>
        <p><strong>Deployment Preference:</strong> ${data.deploymentPreference || "N/A"}</p>
        <p><strong>Compliance Focus:</strong></p>
        <ul>
          ${data.complianceFocus?.map((focus) => `<li>${focus}</li>`).join("") || "<li>None specified</li>"}
        </ul>
        <hr>
        <p style="color: #666; font-size: 12px;">
          This lead is interested in enterprise AI governance. Follow up within 24-48 hours.
        </p>
      `
      : `
        <h2>Compliance Checklist Downloaded</h2>
        <p><strong>Company:</strong> ${data.companyName}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          Lead magnet download - consider adding to governance nurture sequence.
        </p>
      `;

    // Send internal notification
    const internalEmail = await resend.emails.send({
      from: "Vriksha.ai <notifications@vriksha.ai>",
      to: ["founders@vriksha.ai"],
      subject: internalSubject,
      html: internalHtml,
    });

    console.log("Internal notification sent:", internalEmail);

    // Send confirmation to user
    const userSubject = isPilotRequest
      ? "Your Governance Pilot Request - Vriksha.ai"
      : "Your AI Compliance Checklist - Vriksha.ai";

    const userHtml = isPilotRequest
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7C3AED;">Thank you for your interest!</h1>
          <p>Hi ${data.contactName || "there"},</p>
          <p>We've received your request for a Governance Pilot at <strong>${data.companyName}</strong>.</p>
          <p>Our enterprise team will review your requirements and contact you within <strong>24-48 hours</strong> to discuss:</p>
          <ul>
            <li>Your specific compliance requirements</li>
            <li>Deployment options (on-prem, hybrid, cloud)</li>
            <li>Pilot scope and timeline</li>
            <li>Integration with your existing systems</li>
          </ul>
          <p><strong>What to expect:</strong></p>
          <ul>
            <li>Initial discovery call to understand your needs</li>
            <li>Custom proposal with pilot scope</li>
            <li>2-4 week pilot deployment</li>
            <li>Dedicated support throughout</li>
          </ul>
          <p>In the meantime, feel free to reply to this email with any questions.</p>
          <p>Best regards,<br>The Vriksha.ai Governance Team</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Vriksha.ai - Enterprise AI with built-in governance<br>
            Data sovereignty • No vendor lock-in • Audit-ready
          </p>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7C3AED;">Your Compliance Checklist</h1>
          <p>Hi there,</p>
          <p>Thank you for downloading our AI Compliance Readiness Checklist.</p>
          <p>This checklist covers:</p>
          <ul>
            <li>✅ Data Privacy & Consent Management</li>
            <li>✅ Audit Trail Requirements</li>
            <li>✅ Model Documentation Standards</li>
            <li>✅ Access Control Best Practices</li>
            <li>✅ Regulatory Alignment Checklist</li>
          </ul>
          <p><strong>Ready to take the next step?</strong></p>
          <p>If you'd like to discuss how Vriksha.ai can help implement these governance standards, reply to this email or schedule a call with our team.</p>
          <p>Best regards,<br>The Vriksha.ai Team</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Vriksha.ai - Enterprise AI with built-in governance
          </p>
        </div>
      `;

    const userEmail = await resend.emails.send({
      from: "Vriksha.ai <hello@vriksha.ai>",
      to: [data.email],
      subject: userSubject,
      html: userHtml,
    });

    console.log("User confirmation sent:", userEmail);

    return new Response(
      JSON.stringify({ success: true, internalEmail, userEmail }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-compliance-notification:", error);
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