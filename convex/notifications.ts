// Email notification system for user approvals and authentication setup

import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Send welcome email with temporary credentials (placeholder for email service)
export const sendWelcomeEmail = mutation({
  args: {
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    tempPassword: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const setupUrl = `${process.env.SITE_URL || 'http://localhost:3000'}/complete-signup?email=${encodeURIComponent(args.email)}`;
    
    const emailContent = {
      to: args.email,
      subject: "Welcome to CypherGuard - Complete Your Account Setup",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to CypherGuard!</h2>
          
          <p>Hi ${args.firstName},</p>
          
          <p>Great news! Your registration request has been approved and your ${args.role} account is ready to be set up.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your Account Setup Information:</h3>
            <p><strong>Email:</strong> ${args.email}</p>
            <p><strong>Temporary Password:</strong> <code style="background-color: #ffffff; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${args.tempPassword}</code></p>
          </div>
          
          <div style="margin: 30px 0;">
            <a href="${setupUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Complete Account Setup</a>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #92400e;">Important Security Information:</h4>
            <ul style="color: #92400e; margin: 0;">
              <li>This temporary password expires in 7 days</li>
              <li>You'll create your own secure password during setup</li>
              <li>Never share your login credentials with anyone</li>
              <li>If you have any issues, contact your estate administrator</li>
            </ul>
          </div>
          
          <p>Thank you for joining CypherGuard!</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px;">
            This email was sent automatically. If you didn't request access to CypherGuard, please ignore this email.
          </p>
        </div>
      `,
      text: `
Welcome to CypherGuard!

Hi ${args.firstName},

Your registration request has been approved! Here are your account setup details:

Email: ${args.email}
Temporary Password: ${args.tempPassword}

Complete your setup here: ${setupUrl}

Important:
- This temporary password expires in 7 days
- You'll create your own secure password during setup
- Never share your login credentials with anyone

Thank you for joining CypherGuard!
      `
    };

    // Log the email for now (in production, integrate with email service)
    await ctx.db.insert("notification_logs", {
      type: "email",
      recipient: args.email,
      message: `Welcome email sent with setup instructions`,
      status: "sent", // In development, we'll mark as sent
      notificationType: "welcome_email",
      timestamp: Date.now(),
      });

    // TODO: In production, integrate with email service like:
    // - SendGrid
    // - AWS SES  
    // - Mailgun
    // - Resend
    // Example: await sendGridClient.send(emailContent);

    console.log("📧 WELCOME EMAIL (Development Mode)");
    console.log("=".repeat(50));
    console.log(`To: ${args.email}`);
    console.log(`Subject: ${emailContent.subject}`);
    console.log(`Setup URL: ${setupUrl}`);
    console.log(`Temp Password: ${args.tempPassword}`);
    console.log("=".repeat(50));
    
    return {
      success: true,
      emailContent, // Return email content for development/testing
      setupUrl,
    };
  },
});

// Send notification when account setup is completed
export const sendSetupCompleteNotification = mutation({
  args: {
    email: v.string(),
    firstName: v.string(),
  },
  handler: async (ctx, args) => {
    const emailContent = {
      to: args.email,
      subject: "Account Setup Complete - Welcome to CypherGuard",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Account Setup Complete!</h2>
          
          <p>Hi ${args.firstName},</p>
          
          <p>Congratulations! Your CypherGuard account has been successfully set up.</p>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #059669;">What's Next?</h3>
            <ul style="color: #065f46;">
              <li>Log in to your resident dashboard</li>
              <li>Create guest invitations</li>
              <li>Manage your visitor access</li>
            </ul>
          </div>
          
          <div style="margin: 30px 0;">
            <a href="${process.env.SITE_URL || 'http://localhost:3000'}/resident/login" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Go to Dashboard</a>
          </div>
          
          <p>Welcome to the community!</p>
        </div>
      `
    };

    await ctx.db.insert("notification_logs", {
      type: "email",
      recipient: args.email,
      message: "Account setup completion notification",
      status: "sent",
      notificationType: "setup_complete",
      timestamp: Date.now(),
    });

    console.log("✅ SETUP COMPLETE EMAIL (Development Mode)");
    console.log(`To: ${args.email} - Account setup completed!`);
    
    return { success: true };
  },
}); 