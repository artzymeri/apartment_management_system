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

  /**
   * Send monthly report notification to tenants
   */
  async sendMonthlyReportNotification(tenant, report, property) {
    try {
      const recipientEmail = this.getRecipientEmail(tenant.email);

      const { data, error } = await resend.emails.send({
        from: 'BllokuSync Apartments <reports@notifications.bllokusync.com>',
        to: recipientEmail,
        replyTo: 'support@bllokusync.com',
        subject: `Monthly Report Available - ${this.formatMonthYear(report.report_month)} - ${property.name}`,
        html: this.getMonthlyReportTemplate(tenant, report, property),
        text: this.getMonthlyReportPlainText(tenant, report, property),
        headers: {
          'X-Entity-Ref-ID': `report-${report.id}`,
        },
      });

      if (error) {
        console.error('Resend API Error:', error);
        throw error;
      }

      console.log(`✅ Monthly report email sent to ${tenant.email} for report ${report.id}`);
      return { success: true, data };
    } catch (error) {
      console.error(`Failed to send monthly report email to ${tenant.email}:`, error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Send monthly report to all tenants in a property
   */
  async sendMonthlyReportToAllTenants(report, property, tenants) {
    const results = {
      success: [],
      failed: []
    };

    console.log(`📧 Sending monthly report emails to ${tenants.length} tenants for property: ${property.name}`);

    for (const tenant of tenants) {
      try {
        await this.sendMonthlyReportNotification(tenant, report, property);
        results.success.push(tenant.email);
      } catch (error) {
        console.error(`Failed to send report email to ${tenant.email}:`, error.message);
        results.failed.push({ email: tenant.email, error: error.message });
      }
    }

    console.log(`✅ Monthly report emails sent: ${results.success.length} succeeded, ${results.failed.length} failed`);
    return results;
  }

  /**
   * Send single payment marked as paid confirmation email
   */
  async sendSinglePaymentPaidEmail(tenant, payment, property) {
    try {
      const recipientEmail = this.getRecipientEmail(tenant.email);
      const isRedirected = recipientEmail !== tenant.email;

      const { data, error } = await resend.emails.send({
        from: 'BllokuSync Apartments <payments@notifications.bllokusync.com>',
        to: recipientEmail,
        replyTo: 'support@bllokusync.com',
        subject: isRedirected
          ? `[TEST] Payment Confirmed for ${tenant.email} - ${this.formatMonthYear(payment.payment_month)}`
          : `Payment Confirmed - ${this.formatMonthYear(payment.payment_month)}`,
        html: this.getSinglePaymentPaidTemplate(tenant, payment, property, isRedirected),
        text: this.getSinglePaymentPaidPlainText(tenant, payment, property),
        headers: {
          'X-Entity-Ref-ID': `payment-${payment.id}`,
        },
      });

      if (error) {
        console.error('Resend API Error:', error);
        throw error;
      }

      if (isRedirected) {
        console.log(`✅ Payment confirmation email sent to ${recipientEmail} (intended for ${tenant.email})`);
      } else {
        console.log(`✅ Payment confirmation email sent to ${tenant.email}`);
      }

      return { success: true, data };
    } catch (error) {
      console.error(`Failed to send payment confirmation email to ${tenant.email}:`, error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Send multiple payments marked as paid confirmation email
   */
  async sendMultiplePaymentsPaidEmail(tenant, payments, property) {
    try {
      const recipientEmail = this.getRecipientEmail(tenant.email);
      const isRedirected = recipientEmail !== tenant.email;

      const monthsList = payments.map(p => this.formatMonthYear(p.payment_month)).join(', ');

      const { data, error } = await resend.emails.send({
        from: 'BllokuSync Apartments <payments@notifications.bllokusync.com>',
        to: recipientEmail,
        replyTo: 'support@bllokusync.com',
        subject: isRedirected
          ? `[TEST] ${payments.length} Payments Confirmed for ${tenant.email}`
          : `${payments.length} Payments Confirmed - ${property.name}`,
        html: this.getMultiplePaymentsPaidTemplate(tenant, payments, property, isRedirected),
        text: this.getMultiplePaymentsPaidPlainText(tenant, payments, property),
        headers: {
          'X-Entity-Ref-ID': `payments-bulk-${payments.map(p => p.id).join('-')}`,
        },
      });

      if (error) {
        console.error('Resend API Error:', error);
        throw error;
      }

      if (isRedirected) {
        console.log(`✅ Multiple payments confirmation email sent to ${recipientEmail} (intended for ${tenant.email})`);
      } else {
        console.log(`✅ Multiple payments confirmation email sent to ${tenant.email} for ${payments.length} payments`);
      }

      return { success: true, data };
    } catch (error) {
      console.error(`Failed to send multiple payments confirmation email to ${tenant.email}:`, error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Plain text version of single payment confirmation
   */
  getSinglePaymentPaidPlainText(tenant, payment, property) {
    const loginUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const monthYear = this.formatMonthYear(payment.payment_month);

    return `
Payment Confirmed - ${monthYear}

Hello ${tenant.name} ${tenant.surname},

Great news! Your rent payment has been confirmed and marked as paid.

Payment Details:
- Property: ${property.name}
- Payment Month: ${monthYear}
- Amount: €${payment.amount}
- Payment Date: ${payment.payment_date}
- Status: Paid ✓

${payment.notes ? `Notes: ${payment.notes}\n\n` : ''}

Thank you for your timely payment. This confirmation serves as your receipt.

View your payment history:
${loginUrl}/tenant/payments

Need Help?
If you have any questions about this payment, please reply to this email or contact our support team.

---
© ${new Date().getFullYear()} BllokuSync Apartment Management System. All rights reserved.
This email was sent to ${tenant.email}
    `.trim();
  }

  /**
   * HTML template for single payment confirmation
   */
  getSinglePaymentPaidTemplate(tenant, payment, property, isRedirected = false) {
    const loginUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const monthYear = this.formatMonthYear(payment.payment_month);

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Confirmed</title>
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
                      TEST MODE - This email was intended for: ${tenant.email}
                    </p>
                  </td>
                </tr>
                ` : ''}
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                    <div style="background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                      <span style="font-size: 48px;">✓</span>
                    </div>
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Payment Confirmed</h1>
                    <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px;">Thank you for your payment</p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #1a202c; margin: 0 0 20px 0; font-size: 22px;">Hello ${tenant.name} ${tenant.surname},</h2>
                    
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                      Great news! Your rent payment has been confirmed and marked as <strong style="color: #10b981;">paid</strong>.
                    </p>

                    <!-- Payment Details Box -->
                    <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-left: 4px solid #10b981; border-radius: 8px; padding: 25px; margin: 25px 0;">
                      <h3 style="color: #065f46; margin: 0 0 15px 0; font-size: 18px;">Payment Details</h3>
                      
                      <table width="100%" cellpadding="8" cellspacing="0">
                        <tr>
                          <td style="color: #374151; font-size: 14px; padding: 8px 0;">
                            <strong>Property:</strong>
                          </td>
                          <td align="right" style="color: #1f2937; font-size: 14px; font-weight: 600; padding: 8px 0;">
                            ${property.name}
                          </td>
                        </tr>
                        <tr>
                          <td style="color: #374151; font-size: 14px; padding: 8px 0; border-top: 1px solid #a7f3d0;">
                            <strong>Payment Month:</strong>
                          </td>
                          <td align="right" style="color: #1f2937; font-size: 14px; font-weight: 600; padding: 8px 0; border-top: 1px solid #a7f3d0;">
                            ${monthYear}
                          </td>
                        </tr>
                        <tr>
                          <td style="color: #374151; font-size: 14px; padding: 8px 0; border-top: 1px solid #a7f3d0;">
                            <strong>Amount:</strong>
                          </td>
                          <td align="right" style="color: #10b981; font-size: 20px; font-weight: 700; padding: 8px 0; border-top: 1px solid #a7f3d0;">
                            €${payment.amount}
                          </td>
                        </tr>
                        <tr>
                          <td style="color: #374151; font-size: 14px; padding: 8px 0; border-top: 1px solid #a7f3d0;">
                            <strong>Payment Date:</strong>
                          </td>
                          <td align="right" style="color: #1f2937; font-size: 14px; font-weight: 600; padding: 8px 0; border-top: 1px solid #a7f3d0;">
                            ${payment.payment_date}
                          </td>
                        </tr>
                        <tr>
                          <td style="color: #374151; font-size: 14px; padding: 8px 0; border-top: 1px solid #a7f3d0;">
                            <strong>Status:</strong>
                          </td>
                          <td align="right" style="padding: 8px 0; border-top: 1px solid #a7f3d0;">
                            <span style="background-color: #10b981; color: #ffffff; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">PAID ✓</span>
                          </td>
                        </tr>
                      </table>
                    </div>

                    ${payment.notes ? `
                    <!-- Notes -->
                    <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 25px 0;">
                      <h3 style="color: #1e40af; margin: 0 0 10px 0; font-size: 16px;">Notes</h3>
                      <p style="color: #1e3a8a; font-size: 14px; line-height: 1.6; margin: 0;">${payment.notes}</p>
                    </div>
                    ` : ''}

                    <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 25px 0;">
                      Thank you for your timely payment. This confirmation serves as your receipt.
                    </p>

                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="${loginUrl}/tenant/payments" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                            View Payment History
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Help Box -->
                    <div style="background-color: #edf2f7; border-radius: 8px; padding: 20px; margin: 20px 0;">
                      <p style="color: #4a5568; font-size: 14px; margin: 0; line-height: 1.6;">
                        <strong>Need Help?</strong><br>
                        If you have any questions about this payment, please reply to this email or contact our support team.
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
                    <p style="color: #a0aec0; font-size: 11px; margin: 0;">
                      This email was sent to ${tenant.email}
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
   * Plain text version of multiple payments confirmation
   */
  getMultiplePaymentsPaidPlainText(tenant, payments, property) {
    const loginUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const totalAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0).toFixed(2);

    const paymentsList = payments.map(p =>
      `- ${this.formatMonthYear(p.payment_month)}: €${p.amount}`
    ).join('\n');

    return `
Multiple Payments Confirmed

Hello ${tenant.name} ${tenant.surname},

Great news! ${payments.length} of your rent payments have been confirmed and marked as paid.

Property: ${property.name}

Payments Confirmed:
${paymentsList}

Total Amount: €${totalAmount}
Number of Payments: ${payments.length}

Thank you for your payments. This confirmation serves as your receipt for all the listed payments.

View your payment history:
${loginUrl}/tenant/payments

Need Help?
If you have any questions about these payments, please reply to this email or contact our support team.

---
© ${new Date().getFullYear()} BllokuSync Apartment Management System. All rights reserved.
This email was sent to ${tenant.email}
    `.trim();
  }

  /**
   * HTML template for multiple payments confirmation
   */
  getMultiplePaymentsPaidTemplate(tenant, payments, property, isRedirected = false) {
    const loginUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const totalAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0).toFixed(2);

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Multiple Payments Confirmed</title>
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
                      TEST MODE - This email was intended for: ${tenant.email}
                    </p>
                  </td>
                </tr>
                ` : ''}
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                    <div style="background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                      <span style="font-size: 48px;">✓</span>
                    </div>
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Multiple Payments Confirmed</h1>
                    <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px; font-weight: 600;">${payments.length} Payment${payments.length > 1 ? 's' : ''} Processed</p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #1a202c; margin: 0 0 20px 0; font-size: 22px;">Hello ${tenant.name} ${tenant.surname},</h2>
                    
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                      Great news! <strong>${payments.length}</strong> of your rent payments have been confirmed and marked as <strong style="color: #10b981;">paid</strong>.
                    </p>

                    <!-- Summary Box -->
                    <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-left: 4px solid #10b981; border-radius: 8px; padding: 25px; margin: 25px 0;">
                      <table width="100%" cellpadding="8" cellspacing="0">
                        <tr>
                          <td style="color: #374151; font-size: 14px; padding: 8px 0;">
                            <strong>Property:</strong>
                          </td>
                          <td align="right" style="color: #1f2937; font-size: 14px; font-weight: 600; padding: 8px 0;">
                            ${property.name}
                          </td>
                        </tr>
                        <tr>
                          <td style="color: #374151; font-size: 14px; padding: 8px 0; border-top: 1px solid #a7f3d0;">
                            <strong>Total Amount:</strong>
                          </td>
                          <td align="right" style="color: #10b981; font-size: 20px; font-weight: 700; padding: 8px 0; border-top: 1px solid #a7f3d0;">
                            €${totalAmount}
                          </td>
                        </tr>
                        <tr>
                          <td style="color: #374151; font-size: 14px; padding: 8px 0; border-top: 1px solid #a7f3d0;">
                            <strong>Number of Payments:</strong>
                          </td>
                          <td align="right" style="color: #1f2937; font-size: 14px; font-weight: 600; padding: 8px 0; border-top: 1px solid #a7f3d0;">
                            ${payments.length}
                          </td>
                        </tr>
                      </table>
                    </div>

                    <!-- Payments List -->
                    <div style="margin: 25px 0;">
                      <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px;">Payments Confirmed:</h3>
                      <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px;">
                        ${payments.map((payment, index) => `
                          <div style="margin-bottom: ${index < payments.length - 1 ? '15px' : '0'}; padding-bottom: ${index < payments.length - 1 ? '15px' : '0'}; ${index < payments.length - 1 ? 'border-bottom: 1px solid #e2e8f0;' : ''}">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="color: #1e293b; font-weight: 600; font-size: 15px; padding-bottom: 5px;">
                                  ${this.formatMonthYear(payment.payment_month)}
                                </td>
                                <td align="right" style="padding-bottom: 5px;">
                                  <span style="background-color: #10b981; color: #ffffff; padding: 3px 10px; border-radius: 10px; font-size: 11px; font-weight: 600;">PAID ✓</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="color: #64748b; font-size: 13px;">
                                  Payment Date: ${payment.payment_date}
                                </td>
                                <td align="right" style="color: #10b981; font-weight: 700; font-size: 16px;">
                                  €${payment.amount}
                                </td>
                              </tr>
                              ${payment.notes ? `
                              <tr>
                                <td colspan="2" style="color: #64748b; font-size: 12px; padding-top: 5px; font-style: italic;">
                                  Note: ${payment.notes}
                                </td>
                              </tr>
                              ` : ''}
                            </table>
                          </div>
                        `).join('')}
                      </div>
                    </div>

                    <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 25px 0;">
                      Thank you for your payments. This confirmation serves as your receipt for all the listed payments.
                    </p>

                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="${loginUrl}/tenant/payments" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                            View Payment History
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Help Box -->
                    <div style="background-color: #edf2f7; border-radius: 8px; padding: 20px; margin: 20px 0;">
                      <p style="color: #4a5568; font-size: 14px; margin: 0; line-height: 1.6;">
                        <strong>Need Help?</strong><br>
                        If you have any questions about these payments, please reply to this email or contact our support team.
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
                    <p style="color: #a0aec0; font-size: 11px; margin: 0;">
                      This email was sent to ${tenant.email}
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
   * Format month and year for display
   */
  formatMonthYear(reportMonth) {
    const date = new Date(reportMonth);
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  /**
   * Plain text version of monthly report email
   */
  getMonthlyReportPlainText(tenant, report, property) {
    const loginUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const monthYear = this.formatMonthYear(report.report_month);

    return `
Monthly Report Available - ${monthYear}

Hello ${tenant.name} ${tenant.surname},

Your monthly financial report for ${property.name} is now available.

Report Summary for ${monthYear}:
- Total Budget Collected: €${report.total_budget}
- Total Tenants: ${report.total_tenants}
- Paid Tenants: ${report.paid_tenants}
- Pending Amount: €${report.pending_amount}

${report.notes ? `Property Manager Notes:\n${report.notes}\n\n` : ''}

View your detailed report online:
${loginUrl}/tenant/reports

This report includes:
- Complete budget breakdown
- Spending allocations by category
- Payment status summary
- Important notes from property management

Need Help?
If you have any questions about this report, please reply to this email or contact our support team.

---
© ${new Date().getFullYear()} BllokuSync Apartment Management System. All rights reserved.
This email was sent to ${tenant.email}
    `.trim();
  }

  /**
   * HTML template for monthly report notification
   */
  getMonthlyReportTemplate(tenant, report, property) {
    const loginUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const monthYear = this.formatMonthYear(report.report_month);

    // Calculate percentages
    const paidPercentage = report.total_tenants > 0 ? ((report.paid_tenants / report.total_tenants) * 100).toFixed(0) : 0;

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Monthly Report - ${monthYear}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 20px;">
          <tr>
            <td align="center">
              <!-- Main Container -->
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Monthly Report Available</h1>
                    <p style="color: #dbeafe; margin: 10px 0 0 0; font-size: 18px; font-weight: 600;">${monthYear}</p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #1a202c; margin: 0 0 10px 0; font-size: 22px;">Hello ${tenant.name} ${tenant.surname},</h2>
                    
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                      Your monthly financial report for <strong>${property.name}</strong> is now available.
                    </p>

                    <!-- Report Summary Box -->
                    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #3b82f6; border-radius: 8px; padding: 25px; margin: 25px 0;">
                      <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">Report Summary</h3>
                      
                      <table width="100%" cellpadding="8" cellspacing="0">
                        <tr>
                          <td style="color: #475569; font-size: 14px; padding: 8px 0;">
                            <strong>Total Budget Collected:</strong>
                          </td>
                          <td align="right" style="color: #10b981; font-size: 18px; font-weight: 700; padding: 8px 0;">
                            €${report.total_budget}
                          </td>
                        </tr>
                        <tr>
                          <td style="color: #475569; font-size: 14px; padding: 8px 0; border-top: 1px solid #cbd5e1;">
                            <strong>Payment Status:</strong>
                          </td>
                          <td align="right" style="color: #1e40af; font-size: 14px; font-weight: 600; padding: 8px 0; border-top: 1px solid #cbd5e1;">
                            ${report.paid_tenants} of ${report.total_tenants} tenants (${paidPercentage}%)
                          </td>
                        </tr>
                        ${parseFloat(report.pending_amount) > 0 ? `
                        <tr>
                          <td style="color: #475569; font-size: 14px; padding: 8px 0; border-top: 1px solid #cbd5e1;">
                            <strong>Pending Amount:</strong>
                          </td>
                          <td align="right" style="color: #f59e0b; font-size: 14px; font-weight: 600; padding: 8px 0; border-top: 1px solid #cbd5e1;">
                            €${report.pending_amount}
                          </td>
                        </tr>
                        ` : ''}
                      </table>
                    </div>

                    ${report.spending_breakdown && report.spending_breakdown.length > 0 ? `
                    <!-- Spending Breakdown -->
                    <div style="margin: 25px 0;">
                      <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px;">Budget Allocation</h3>
                      <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px;">
                        ${report.spending_breakdown.map(item => `
                          <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e2e8f0;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                              <span style="color: #1e293b; font-weight: 600; font-size: 14px;">${item.config_title}</span>
                              <span style="color: #3b82f6; font-weight: 700; font-size: 14px;">€${item.allocated_amount} (${item.percentage}%)</span>
                            </div>
                            ${item.description ? `<p style="color: #64748b; font-size: 13px; margin: 5px 0 0 0; line-height: 1.4;">${item.description}</p>` : ''}
                          </div>
                        `).join('')}
                      </div>
                    </div>
                    ` : ''}

                    ${report.notes ? `
                    <!-- Property Manager Notes -->
                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 25px 0;">
                      <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">Property Manager Notes</h3>
                      <p style="color: #78350f; font-size: 14px; line-height: 1.6; margin: 0;">${report.notes}</p>
                    </div>
                    ` : ''}

                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="${loginUrl}/tenant/reports" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                            View Detailed Report
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Info Box -->
                    <div style="background-color: #edf2f7; border-radius: 8px; padding: 20px; margin: 20px 0;">
                      <p style="color: #4a5568; font-size: 14px; margin: 0; line-height: 1.6;">
                        <strong>What's included in your report:</strong><br>
                        • Complete budget breakdown<br>
                        • Spending allocations by category<br>
                        • Payment status summary<br>
                        • Important notes from property management
                      </p>
                    </div>

                    <div style="margin-top: 25px;">
                      <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0;">
                        <strong>Have questions about this report?</strong><br>
                        Feel free to reply to this email or contact our support team for assistance.
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
                      This email was sent to ${tenant.email}
                    </p>
                    <p style="color: #a0aec0; font-size: 11px; margin: 0;">
                      Property: ${property.name} | Report: ${monthYear}
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
}

module.exports = new EmailService();
