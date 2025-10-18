const { Resend } = require('resend');
const path = require('path');

// Initialize Resend with API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

// Test mode configuration
const EMAIL_TEST_MODE = process.env.EMAIL_TEST_MODE === 'true';
const VERIFIED_EMAIL = process.env.TEST_EMAIL || 'artzymeri2001@gmail.com';

class EmailService {
  /**
   * Get the appropriate recipient email
   * In test mode, all emails are redirected to the verified email
   * Once domain is verified, set EMAIL_TEST_MODE=false in .env
   */
  getRecipientEmail(userEmail) {
    // If test mode is disabled, send to actual user email
    if (!EMAIL_TEST_MODE) {
      return userEmail;
    }

    // Check if the user's email matches the verified email
    if (userEmail.toLowerCase() === VERIFIED_EMAIL.toLowerCase()) {
      return userEmail; // Can send to this user directly
    }

    // Otherwise, send to verified email for testing
    console.log(`⚠️  EMAIL TEST MODE: Cannot send to ${userEmail} in test mode.`);
    console.log(`📧 Redirecting email to test address: ${VERIFIED_EMAIL}`);
    console.log(`💡 Once domain is verified, set EMAIL_TEST_MODE=false in .env to send to real users`);
    return VERIFIED_EMAIL;
  }

  /**
   * Send welcome email to newly approved user
   */
  async sendWelcomeEmail(user, temporaryPassword) {
    try {
      const recipientEmail = this.getRecipientEmail(user.email);
      const isRedirected = recipientEmail !== user.email;

      const { data, error } = await resend.emails.send({
        from: 'BllokuSync Apartments <noreply@notifications.bllokusync.com>',
        to: recipientEmail,
        replyTo: 'support@bllokusync.com',
        subject: isRedirected
          ? `[TEST] Welcome Email for ${user.email}`
          : 'Welcome to BllokuSync Apartment Management',
        html: this.getWelcomeEmailTemplate(user, temporaryPassword, isRedirected),
        text: this.getWelcomeEmailPlainText(user, temporaryPassword),
        headers: {
          'X-Entity-Ref-ID': `user-${user.id}`,
        },
      });

      if (error) {
        console.error('Resend API Error:', error);
        throw error;
      }

      if (isRedirected) {
        console.log(`✅ Welcome email sent to ${recipientEmail} (intended for ${user.email})`, data);
      } else {
        console.log(`✅ Welcome email sent successfully to ${user.email}`, data);
      }

      return { success: true, data, actualRecipient: recipientEmail, intended: user.email };
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Plain text version of welcome email (improves deliverability)
   */
  getWelcomeEmailPlainText(user, temporaryPassword) {
    const loginUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const roleDisplay = user.role === 'property_manager' ? 'Property Manager' : 'Tenant';

    return `
Welcome to BllokuSync Apartment Management!

Hello ${user.name} ${user.surname},

Great news! Your registration request has been approved. You now have access to the BllokuSync Apartment Management System as a ${roleDisplay}.

You can now log in to your account using the email address you registered with.

Login here: ${loginUrl}/login

${user.role === 'property_manager' ? 
`What you can do:
- Manage properties and tenants
- Track rent payments
- Handle maintenance requests
- Generate monthly reports
- Monitor property expenses` : 
`What you can do:
- View your payment history
- Submit maintenance requests
- Access monthly reports
- Update your profile information`}

Need Help?
If you have any questions or need assistance, please don't hesitate to contact our support team.

---
© ${new Date().getFullYear()} BllokuSync Apartment Management System. All rights reserved.
This email was sent to ${user.email}

If you did not request this account, please ignore this email or contact support.
    `.trim();
  }

  /**
   * Welcome email HTML template
   */
  getWelcomeEmailTemplate(user, temporaryPassword, isRedirected = false) {
    const loginUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const roleDisplay = user.role === 'property_manager' ? 'Property Manager' : 'Tenant';

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to BllokuSync Apartment Management</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 20px;">
          <tr>
            <td align="center">
              <!-- Main Container -->
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                
                ${isRedirected ? `
                <!-- Test Mode Notice -->
                <tr>
                  <td style="background-color: #fbbf24; padding: 15px 30px; text-align: center;">
                    <p style="color: #78350f; margin: 0; font-size: 13px; font-weight: 600;">
                      TEST MODE - This email was intended for: ${user.email}
                    </p>
                  </td>
                </tr>
                ` : ''}
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Welcome to BllokuSync</h1>
                    <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Your account has been approved</p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #1a202c; margin: 0 0 20px 0; font-size: 24px;">Hello ${user.name} ${user.surname},</h2>
                    
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Great news! Your registration request has been approved. 
                      You now have access to the BllokuSync Apartment Management System as a <strong>${roleDisplay}</strong>.
                    </p>

                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      You can now log in to your account using the email address you registered with.
                    </p>

                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="${loginUrl}/login" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                            Login to Your Account
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Features List -->
                    <div style="margin: 30px 0 20px 0;">
                      <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px;">What you can do:</h3>
                      ${user.role === 'property_manager' ? `
                        <ul style="color: #4a5568; font-size: 14px; line-height: 1.8; padding-left: 20px;">
                          <li>Manage properties and tenants</li>
                          <li>Track rent payments</li>
                          <li>Handle maintenance requests</li>
                          <li>Generate monthly reports</li>
                          <li>Monitor property expenses</li>
                        </ul>
                      ` : `
                        <ul style="color: #4a5568; font-size: 14px; line-height: 1.8; padding-left: 20px;">
                          <li>View your payment history</li>
                          <li>Submit maintenance requests</li>
                          <li>Access monthly reports</li>
                          <li>Update your profile information</li>
                        </ul>
                      `}
                    </div>

                    <div style="background-color: #edf2f7; border-radius: 8px; padding: 20px; margin: 20px 0;">
                      <p style="color: #4a5568; font-size: 14px; margin: 0; line-height: 1.6;">
                        <strong>Need Help?</strong><br>
                        If you have any questions or need assistance, please reply to this email or contact our support team.
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #718096; font-size: 12px; margin: 0 0 10px 0;">
                      © ${new Date().getFullYear()} BllokuSync Apartment Management System. All rights reserved.
                    </p>
                    <p style="color: #a0aec0; font-size: 11px; margin: 0 0 10px 0;">
                      This email was sent to ${user.email}
                    </p>
                    <p style="color: #a0aec0; font-size: 11px; margin: 0;">
                      If you did not request this account, please ignore this email or contact support.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  /**
   * Send payment reminder to tenant
   */
  async sendPaymentReminder(tenant, payment) {
    try {
      const recipientEmail = this.getRecipientEmail(tenant.email);

      const { data, error } = await resend.emails.send({
        from: 'Apartment Management <payments@notifications.bllokusync.com>',
        to: recipientEmail,
        subject: `Payment Reminder - ${payment.payment_month}`,
        html: this.getPaymentReminderTemplate(tenant, payment),
      });

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      console.error('Failed to send payment reminder:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Payment reminder email template
   */
  getPaymentReminderTemplate(tenant, payment) {
    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; background-color: #f4f7fa; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="background-color: #fbbf24; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0;">Payment Reminder</h1>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #374151;">Hello ${tenant.name} ${tenant.surname},</p>
            <p style="font-size: 16px; color: #374151;">This is a friendly reminder that your rent payment is due.</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0; color: #1f2937;"><strong>Payment Month:</strong> ${payment.payment_month}</p>
              <p style="margin: 5px 0; color: #1f2937;"><strong>Amount:</strong> €${payment.amount}</p>
              <p style="margin: 5px 0; color: #1f2937;"><strong>Status:</strong> ${payment.status}</p>
            </div>
            <p style="font-size: 14px; color: #6b7280;">Please make your payment at your earliest convenience to avoid any late fees.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Send payment confirmation to tenant
   */
  async sendPaymentConfirmation(tenant, payment) {
    try {
      const recipientEmail = this.getRecipientEmail(tenant.email);

      const { data, error } = await resend.emails.send({
        from: 'Apartment Management <payments@notifications.bllokusync.com>',
        to: recipientEmail,
        subject: `Payment Confirmed - ${payment.payment_month}`,
        html: this.getPaymentConfirmationTemplate(tenant, payment),
      });

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      console.error('Failed to send payment confirmation:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Payment confirmation email template
   */
  getPaymentConfirmationTemplate(tenant, payment) {
    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; background-color: #f4f7fa; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="background-color: #10b981; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0;">Payment Confirmed</h1>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #374151;">Hello ${tenant.name} ${tenant.surname},</p>
            <p style="font-size: 16px; color: #374151;">Thank you! Your payment has been received and confirmed.</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0; color: #1f2937;"><strong>Payment Month:</strong> ${payment.payment_month}</p>
              <p style="margin: 5px 0; color: #1f2937;"><strong>Amount:</strong> €${payment.amount}</p>
              <p style="margin: 5px 0; color: #1f2937;"><strong>Payment Date:</strong> ${payment.payment_date}</p>
            </div>
            <p style="font-size: 14px; color: #6b7280;">We appreciate your timely payment!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();
