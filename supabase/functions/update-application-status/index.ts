import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const getAcceptedEmailHtml = (firstName: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .highlight { background: #d1fae5; padding: 15px; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Congratulations!</h1>
    </div>
    <div class="content">
      <p>Dear ${firstName || 'Founder'},</p>
      
      <div class="highlight">
        <strong>Your application to the Vriksha Accelerator has been accepted!</strong>
      </div>
      
      <p>We were impressed by your application and are excited to have you join our upcoming cohort. Your vision and dedication stood out among many talented applicants.</p>
      
      <p><strong>What's Next?</strong></p>
      <ul>
        <li>Our team will reach out within the next 48 hours with onboarding details</li>
        <li>You'll receive access to our founder community and resources</li>
        <li>We'll schedule an introductory call to discuss your goals and expectations</li>
      </ul>
      
      <p>If you have any questions in the meantime, feel free to reach out to us at <a href="mailto:founders@vriksha.ai">founders@vriksha.ai</a>.</p>
      
      <p>Welcome to the Vriksha family!</p>
      
      <p>Best regards,<br>The Vriksha Team</p>
    </div>
    <div class="footer">
      <p>Vriksha AI | Building the Future of AI-Native Enterprises</p>
    </div>
  </div>
</body>
</html>
`;

const getRejectedEmailHtml = (firstName: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #6b7280, #4b5563); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .highlight { background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Application Update</h1>
    </div>
    <div class="content">
      <p>Dear ${firstName || 'Founder'},</p>
      
      <p>Thank you for taking the time to apply to the Vriksha Accelerator. We truly appreciate your interest in our program and the effort you put into your application.</p>
      
      <div class="highlight">
        After careful consideration, we regret to inform you that we are unable to offer you a spot in our current cohort.
      </div>
      
      <p>This decision was incredibly difficult, as we received many exceptional applications this cycle. Not being selected does not reflect on the potential of your venture—it simply means we had to make very tough choices given our limited capacity.</p>
      
      <p><strong>We encourage you to:</strong></p>
      <ul>
        <li>Continue building and refining your product</li>
        <li>Apply again for future cohorts—many successful founders were accepted on subsequent applications</li>
        <li>Stay connected with our community through our events and resources</li>
      </ul>
      
      <p>We wish you the very best on your entrepreneurial journey.</p>
      
      <p>Warm regards,<br>The Vriksha Team</p>
    </div>
    <div class="footer">
      <p>Vriksha AI | Building the Future of AI-Native Enterprises</p>
    </div>
  </div>
</body>
</html>
`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { applicationId, status } = await req.json();

    if (!applicationId || !status) {
      return new Response(
        JSON.stringify({ error: "Missing applicationId or status" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validStatuses = ["draft", "submitted", "under_review", "accepted", "rejected"];
    if (!validStatuses.includes(status)) {
      return new Response(
        JSON.stringify({ error: "Invalid status value" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: roleData, error: roleError } = await serviceClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (roleError || !roleData) {
      console.log("Admin check failed:", roleError);
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update application status
    const { data: updatedApp, error: updateError } = await serviceClient
      .from("accelerator_applications")
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq("id", applicationId)
      .select("*, profiles:user_id(email, first_name, last_name)")
      .single();

    if (updateError) {
      console.error("Error updating application:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update application status" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Updated application ${applicationId} to status: ${status}`);

    // Send email notification for accepted/rejected status
    if (status === "accepted" || status === "rejected") {
      try {
        const profile = updatedApp.profiles as { email: string; first_name: string | null; last_name: string | null } | null;
        
        if (profile?.email) {
          const emailSubject = status === "accepted"
            ? "🎉 Congratulations! Your Vriksha Accelerator Application Has Been Accepted"
            : "Update on Your Vriksha Accelerator Application";
          
          const emailHtml = status === "accepted"
            ? getAcceptedEmailHtml(profile.first_name || "")
            : getRejectedEmailHtml(profile.first_name || "");

          const emailResult = await resend.emails.send({
            from: "Vriksha Accelerator <noreply@vriksha.ai>",
            to: [profile.email],
            subject: emailSubject,
            html: emailHtml,
          });

          console.log(`Email notification sent to ${profile.email}:`, emailResult);
        } else {
          console.warn("No email found for applicant, skipping notification");
        }
      } catch (emailError) {
        // Log email error but don't fail the request
        console.error("Failed to send email notification:", emailError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, application: updatedApp }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error in update-application-status:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
