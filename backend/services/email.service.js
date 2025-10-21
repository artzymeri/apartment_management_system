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
          ? `[TEST] Email Mirëseardhje për ${user.email}`
          : 'Mirë se erdhe në Menaxhimin e Apartamenteve BllokuSync',
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
    const roleDisplay = user.role === 'property_manager' ? 'Menaxher Prone' : 'Banorë';

    return `
Mirë se erdhe në Menaxhimin e Apartamenteve BllokuSync!

Përshëndetje ${user.name} ${user.surname},

Lajm i mirë! Kërkesa juaj për regjistrim është miratuar. Ju tani keni qasje në Sistemin e Menaxhimit të Apartamenteve BllokuSync si ${roleDisplay}.

Ju mund të hyni në llogarinë tuaj duke përdorur adresën e emailit me të cilën jeni regjistruar.

Hyni këtu: ${loginUrl}/login

${user.role === 'property_manager' ? 
`Çfarë mund të bëni:
- Menaxhoni pronat dhe banorët
- Ndiqni pagesat e qirasë
- Trajtoni kërkesat për mirëmbajtje
- Gjeneroni raporte mujore
- Monitoroni shpenzimet e pronës` : 
`Çfarë mund të bëni:
- Shikoni historikun tuaj të pagesave
- Dërgoni kërkesa për mirëmbajtje
- Qasuni në raportet mujore
- Përditësoni informacionin tuaj personal`}

Keni Nevojë për Ndihmë?
Nëse keni ndonjë pyetje ose keni nevojë për asistencë, ju lutemi mos hezitoni të kontaktoni ekipin tonë të mbështetjes.

---
© ${new Date().getFullYear()} Sistemi i Menaxhimit të Apartamenteve BllokuSync. Të gjitha të drejtat e rezervuara.
Ky email u dërgua në ${user.email}

Nëse ju nuk keni kërkuar këtë llogari, ju lutemi injoroni këtë email ose kontaktoni mbështetjen.
    `.trim();
  }

  /**
   * Welcome email HTML template
   */
  getWelcomeEmailTemplate(user, temporaryPassword, isRedirected = false) {
    const loginUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const roleDisplay = user.role === 'property_manager' ? 'Menaxher Prone' : 'Banorë';

    return `
      <!DOCTYPE html>
      <html lang="sq">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mirë se erdhe në Menaxhimin e Apartamenteve BllokuSync</title>
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
                      MËNYRA TEST - Ky email ishte destinuar për: ${user.email}
                    </p>
                  </td>
                </tr>
                ` : ''}
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Mirë se erdhe në BllokuSync</h1>
                    <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Llogaria juaj është miratuar</p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #1a202c; margin: 0 0 20px 0; font-size: 24px;">Përshëndetje ${user.name} ${user.surname},</h2>
                    
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Lajm i mirë! Kërkesa juaj për regjistrim është miratuar. 
                      Ju tani keni qasje në Sistemin e Menaxhimit të Apartamenteve BllokuSync si <strong>${roleDisplay}</strong>.
                    </p>

                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Ju mund të hyni në llogarinë tuaj duke përdorur adresën e emailit me të cilën jeni regjistruar.
                    </p>

                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="${loginUrl}/login" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                            Hyni në Llogarinë Tuaj
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Features List -->
                    <div style="margin: 30px 0 20px 0;">
                      <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px;">Çfarë mund të bëni:</h3>
                      ${user.role === 'property_manager' ? `
                        <ul style="color: #4a5568; font-size: 14px; line-height: 1.8; padding-left: 20px;">
                          <li>Menaxhoni pronat dhe banorët</li>
                          <li>Ndiqni pagesat e qirasë</li>
                          <li>Trajtoni kërkesat për mirëmbajtje</li>
                          <li>Gjeneroni raporte mujore</li>
                          <li>Monitoroni shpenzimet e pronës</li>
                        </ul>
                      ` : `
                        <ul style="color: #4a5568; font-size: 14px; line-height: 1.8; padding-left: 20px;">
                          <li>Shikoni historikun tuaj të pagesave</li>
                          <li>Dërgoni kërkesa për mirëmbajtje</li>
                          <li>Qasuni në raportet mujore</li>
                          <li>Përditësoni informacionin tuaj personal</li>
                        </ul>
                      `}
                    </div>

                    <div style="background-color: #edf2f7; border-radius: 8px; padding: 20px; margin: 20px 0;">
                      <p style="color: #4a5568; font-size: 14px; margin: 0; line-height: 1.6;">
                        <strong>Keni Nevojë për Ndihmë?</strong><br>
                        Nëse keni ndonjë pyetje ose keni nevojë për asistencë, ju lutemi përgjigjuni këtij emaili ose kontaktoni ekipin tonë të mbështetjes.
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #718096; font-size: 12px; margin: 0 0 10px 0;">
                      © ${new Date().getFullYear()} Sistemi i Menaxhimit të Apartamenteve BllokuSync. Të gjitha të drejtat e rezervuara.
                    </p>
                    <p style="color: #a0aec0; font-size: 11px; margin: 0 0 10px 0;">
                      Ky email u dërgua në ${user.email}
                    </p>
                    <p style="color: #a0aec0; font-size: 11px; margin: 0;">
                      Nëse ju nuk keni kërkuar këtë llogari, ju lutemi injoroni këtë email ose kontaktoni mbështetjen.
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
        subject: `Kujtesë Pagese - ${payment.payment_month}`,
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
      <html lang="sq">
      <body style="font-family: Arial, sans-serif; background-color: #f4f7fa; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="background-color: #fbbf24; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0;">Kujtesë Pagese</h1>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #374151;">Përshëndetje ${tenant.name} ${tenant.surname},</p>
            <p style="font-size: 16px; color: #374151;">Ky është një kujtesë miqësore se pagesa juaj e qirasë është në afat.</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0; color: #1f2937;"><strong>Muaji i Pagesës:</strong> ${payment.payment_month}</p>
              <p style="margin: 5px 0; color: #1f2937;"><strong>Shuma:</strong> €${payment.amount}</p>
              <p style="margin: 5px 0; color: #1f2937;"><strong>Statusi:</strong> ${payment.status}</p>
            </div>
            <p style="font-size: 14px; color: #6b7280;">Ju lutemi bëni pagesën tuaj sa më shpejt të jetë e mundur për të shmangur çdo tarifë vonese.</p>
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
        subject: `Pagesa e Konfirmuar - ${payment.payment_month}`,
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
      <html lang="sq">
      <body style="font-family: Arial, sans-serif; background-color: #f4f7fa; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="background-color: #10b981; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0;">Pagesa e Konfirmuar</h1>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #374151;">Përshëndetje ${tenant.name} ${tenant.surname},</p>
            <p style="font-size: 16px; color: #374151;">Faleminderit! Pagesa juaj është pranuar dhe konfirmuar.</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0; color: #1f2937;"><strong>Muaji i Pagesës:</strong> ${payment.payment_month}</p>
              <p style="margin: 5px 0; color: #1f2937;"><strong>Shuma:</strong> €${payment.amount}</p>
              <p style="margin: 5px 0; color: #1f2937;"><strong>Data e Pagesës:</strong> ${payment.payment_date}</p>
            </div>
            <p style="font-size: 14px; color: #6b7280;">Ne e vlerësojmë pagesën tuaj në kohë!</p>
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
        subject: `Raporti Mujor i Disponueshëm - ${this.formatMonthYear(report.report_month)} - ${property.name}`,
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
          ? `[TEST] Pagesa e Konfirmuar për ${tenant.email} - ${this.formatMonthYear(payment.payment_month)}`
          : `Pagesa e Konfirmuar - ${this.formatMonthYear(payment.payment_month)}`,
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
          ? `[TEST] ${payments.length} Pagesa të Konfirmuara për ${tenant.email}`
          : `${payments.length} Pagesa të Konfirmuara - ${property.name}`,
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
Pagesa e Konfirmuar - ${monthYear}

Përshëndetje ${tenant.name} ${tenant.surname},

Lajm i mirë! Pagesa juaj e qirasë është konfirmuar dhe shënuar si e paguar.

Detajet e Pagesës:
- Prona: ${property.name}
- Muaji i Pagesës: ${monthYear}
- Shuma: €${payment.amount}
- Data e Pagesës: ${payment.payment_date}
- Statusi: E Paguar ✓

${payment.notes ? `Shënime: ${payment.notes}\n\n` : ''}

Faleminderit për pagesën tuaj në kohë. Ky konfirmim shërben si fatura juaj.

Shikoni historikun tuaj të pagesave:
${loginUrl}/tenant/payments

Keni Nevojë për Ndihmë?
Nëse keni ndonjë pyetje rreth kësaj pagese, ju lutemi përgjigjuni këtij emaili ose kontaktoni ekipin tonë të mbështetjes.

---
© ${new Date().getFullYear()} Sistemi i Menaxhimit të Apartamenteve BllokuSync. Të gjitha të drejtat e rezervuara.
Ky email u dërgua në ${tenant.email}
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
      <html lang="sq">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pagesa e Konfirmuar</title>
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
                      MËNYRA TEST - Ky email ishte destinuar për: ${tenant.email}
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
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Pagesa e Konfirmuar</h1>
                    <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px;">Faleminderit për pagesën tuaj</p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #1a202c; margin: 0 0 20px 0; font-size: 22px;">Përshëndetje ${tenant.name} ${tenant.surname},</h2>
                    
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                      Lajm i mirë! Pagesa juaj e qirasë është konfirmuar dhe shënuar si <strong style="color: #10b981;">e paguar</strong>.
                    </p>

                    <!-- Payment Details Box -->
                    <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-left: 4px solid #10b981; border-radius: 8px; padding: 25px; margin: 25px 0;">
                      <h3 style="color: #065f46; margin: 0 0 15px 0; font-size: 18px;">Detajet e Pagesës</h3>
                      
                      <table width="100%" cellpadding="8" cellspacing="0">
                        <tr>
                          <td style="color: #374151; font-size: 14px; padding: 8px 0;">
                            <strong>Prona:</strong>
                          </td>
                          <td align="right" style="color: #1f2937; font-size: 14px; font-weight: 600; padding: 8px 0;">
                            ${property.name}
                          </td>
                        </tr>
                        <tr>
                          <td style="color: #374151; font-size: 14px; padding: 8px 0; border-top: 1px solid #a7f3d0;">
                            <strong>Muaji i Pagesës:</strong>
                          </td>
                          <td align="right" style="color: #1f2937; font-size: 14px; font-weight: 600; padding: 8px 0; border-top: 1px solid #a7f3d0;">
                            ${monthYear}
                          </td>
                        </tr>
                        <tr>
                          <td style="color: #374151; font-size: 14px; padding: 8px 0; border-top: 1px solid #a7f3d0;">
                            <strong>Shuma:</strong>
                          </td>
                          <td align="right" style="color: #10b981; font-size: 20px; font-weight: 700; padding: 8px 0; border-top: 1px solid #a7f3d0;">
                            €${payment.amount}
                          </td>
                        </tr>
                        <tr>
                          <td style="color: #374151; font-size: 14px; padding: 8px 0; border-top: 1px solid #a7f3d0;">
                            <strong>Data e Pagesës:</strong>
                          </td>
                          <td align="right" style="color: #1f2937; font-size: 14px; font-weight: 600; padding: 8px 0; border-top: 1px solid #a7f3d0;">
                            ${payment.payment_date}
                          </td>
                        </tr>
                        <tr>
                          <td style="color: #374151; font-size: 14px; padding: 8px 0; border-top: 1px solid #a7f3d0;">
                            <strong>Statusi:</strong>
                          </td>
                          <td align="right" style="padding: 8px 0; border-top: 1px solid #a7f3d0;">
                            <span style="background-color: #10b981; color: #ffffff; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">E PAGUAR ✓</span>
                          </td>
                        </tr>
                      </table>
                    </div>

                    ${payment.notes ? `
                    <!-- Notes -->
                    <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 25px 0;">
                      <h3 style="color: #1e40af; margin: 0 0 10px 0; font-size: 16px;">Shënime</h3>
                      <p style="color: #1e3a8a; font-size: 14px; line-height: 1.6; margin: 0;">${payment.notes}</p>
                    </div>
                    ` : ''}

                    <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 25px 0;">
                      Faleminderit për pagesën tuaj në kohë. Ky konfirmim shërben si fatura juaj.
                    </p>

                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="${loginUrl}/tenant/payments" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                            Shiko Historikun e Pagesave
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Help Box -->
                    <div style="background-color: #edf2f7; border-radius: 8px; padding: 20px; margin: 20px 0;">
                      <p style="color: #4a5568; font-size: 14px; margin: 0; line-height: 1.6;">
                        <strong>Keni Nevojë për Ndihmë?</strong><br>
                        Nëse keni ndonjë pyetje rreth kësaj pagese, ju lutemi përgjigjuni këtij emaili ose kontaktoni ekipin tonë të mbështetjes.
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #718096; font-size: 12px; margin: 0 0 10px 0;">
                      © ${new Date().getFullYear()} Sistemi i Menaxhimit të Apartamenteve BllokuSync. Të gjitha të drejtat e rezervuara.
                    </p>
                    <p style="color: #a0aec0; font-size: 11px; margin: 0;">
                      Ky email u dërgua në ${tenant.email}
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
Pagesa të Shumta të Konfirmuara

Përshëndetje ${tenant.name} ${tenant.surname},

Lajm i mirë! ${payments.length} nga pagesat tuaja të qirasë janë konfirmuar dhe shënuar si të paguara.

Prona: ${property.name}

Pagesa të Konfirmuara:
${paymentsList}

Shuma Totale: €${totalAmount}
Numri i Pagesave: ${payments.length}

Faleminderit për pagesat tuaja. Ky konfirmim shërben si fatura juaj për të gjitha pagesat e listuara.

Shikoni historikun tuaj të pagesave:
${loginUrl}/tenant/payments

Keni Nevojë për Ndihmë?
Nëse keni ndonjë pyetje rreth këtyre pagesave, ju lutemi përgjigjuni këtij emaili ose kontaktoni ekipin tonë të mbështetjes.

---
© ${new Date().getFullYear()} Sistemi i Menaxhimit të Apartamenteve BllokuSync. Të gjitha të drejtat e rezervuara.
Ky email u dërgua në ${tenant.email}
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
      <html lang="sq">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pagesa të Shumta të Konfirmuara</title>
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
                      MËNYRA TEST - Ky email ishte destinuar për: ${tenant.email}
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
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Pagesa të Shumta të Konfirmuara</h1>
                    <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px; font-weight: 600;">${payments.length} Pagesë${payments.length > 1 ? ' të' : ''} Procesuar${payments.length > 1 ? 'a' : ''}</p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #1a202c; margin: 0 0 20px 0; font-size: 22px;">Përshëndetje ${tenant.name} ${tenant.surname},</h2>
                    
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                      Lajm i mirë! <strong>${payments.length}</strong> nga pagesat tuaja të qirasë janë konfirmuar dhe shënuar si <strong style="color: #10b981;">të paguara</strong>.
                    </p>

                    <!-- Summary Box -->
                    <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-left: 4px solid #10b981; border-radius: 8px; padding: 25px; margin: 25px 0;">
                      <table width="100%" cellpadding="8" cellspacing="0">
                        <tr>
                          <td style="color: #374151; font-size: 14px; padding: 8px 0;">
                            <strong>Prona:</strong>
                          </td>
                          <td align="right" style="color: #1f2937; font-size: 14px; font-weight: 600; padding: 8px 0;">
                            ${property.name}
                          </td>
                        </tr>
                        <tr>
                          <td style="color: #374151; font-size: 14px; padding: 8px 0; border-top: 1px solid #a7f3d0;">
                            <strong>Shuma Totale:</strong>
                          </td>
                          <td align="right" style="color: #10b981; font-size: 20px; font-weight: 700; padding: 8px 0; border-top: 1px solid #a7f3d0;">
                            €${totalAmount}
                          </td>
                        </tr>
                        <tr>
                          <td style="color: #374151; font-size: 14px; padding: 8px 0; border-top: 1px solid #a7f3d0;">
                            <strong>Numri i Pagesave:</strong>
                          </td>
                          <td align="right" style="color: #1f2937; font-size: 14px; font-weight: 600; padding: 8px 0; border-top: 1px solid #a7f3d0;">
                            ${payments.length}
                          </td>
                        </tr>
                      </table>
                    </div>

                    <!-- Payments List -->
                    <div style="margin: 25px 0;">
                      <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px;">Pagesa të Konfirmuara:</h3>
                      <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px;">
                        ${payments.map((payment, index) => `
                          <div style="margin-bottom: ${index < payments.length - 1 ? '15px' : '0'}; padding-bottom: ${index < payments.length - 1 ? '15px' : '0'}; ${index < payments.length - 1 ? 'border-bottom: 1px solid #e2e8f0;' : ''}">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="color: #1e293b; font-weight: 600; font-size: 15px; padding-bottom: 5px;">
                                  ${this.formatMonthYear(payment.payment_month)}
                                </td>
                                <td align="right" style="padding-bottom: 5px;">
                                  <span style="background-color: #10b981; color: #ffffff; padding: 3px 10px; border-radius: 10px; font-size: 11px; font-weight: 600;">E PAGUAR ✓</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="color: #64748b; font-size: 13px;">
                                  Data e Pagesës: ${payment.payment_date}
                                </td>
                                <td align="right" style="color: #10b981; font-weight: 700; font-size: 16px;">
                                  €${payment.amount}
                                </td>
                              </tr>
                              ${payment.notes ? `
                              <tr>
                                <td colspan="2" style="color: #64748b; font-size: 12px; padding-top: 5px; font-style: italic;">
                                  Shënim: ${payment.notes}
                                </td>
                              </tr>
                              ` : ''}
                            </table>
                          </div>
                        `).join('')}
                      </div>
                    </div>

                    <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 25px 0;">
                      Faleminderit për pagesat tuaja. Ky konfirmim shërben si fatura juaj për të gjitha pagesat e listuara.
                    </p>

                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="${loginUrl}/tenant/payments" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                            Shiko Historikun e Pagesave
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Help Box -->
                    <div style="background-color: #edf2f7; border-radius: 8px; padding: 20px; margin: 20px 0;">
                      <p style="color: #4a5568; font-size: 14px; margin: 0; line-height: 1.6;">
                        <strong>Keni Nevojë për Ndihmë?</strong><br>
                        Nëse keni ndonjë pyetje rreth këtyre pagesave, ju lutemi përgjigjuni këtij emaili ose kontaktoni ekipin tonë të mbështetjes.
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #718096; font-size: 12px; margin: 0 0 10px 0;">
                      © ${new Date().getFullYear()} Sistemi i Menaxhimit të Apartamenteve BllokuSync. Të gjitha të drejtat e rezervuara.
                    </p>
                    <p style="color: #a0aec0; font-size: 11px; margin: 0;">
                      Ky email u dërgua në ${tenant.email}
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
    const months = ['Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor',
                   'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  /**
   * Plain text version of monthly report email
   */
  getMonthlyReportPlainText(tenant, report, property) {
    const loginUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const monthYear = this.formatMonthYear(report.report_month);

    return `
Raporti Mujor i Disponueshëm - ${monthYear}

Përshëndetje ${tenant.name} ${tenant.surname},

Raporti juaj mujor financiar për ${property.name} është i disponueshëm tani.

Përmbledhja e Raportit për ${monthYear}:
- Buxheti Total i Mbledhur: €${report.total_budget}
- Gjithsej Banorë: ${report.total_tenants}
- Banorë që Kanë Paguar: ${report.paid_tenants}
- Shuma në Pritje: €${report.pending_amount}

${report.notes ? `Shënime nga Menaxheri i Pronës:\n${report.notes}\n\n` : ''}

Shikoni raportin tuaj të detajuar online:
${loginUrl}/tenant/reports

Ky raport përfshin:
- Ndarjen e plotë të buxhetit
- Shpërndarjen e shpenzimeve sipas kategorisë
- Përmbledhjen e statusit të pagesave
- Shënime të rëndësishme nga menaxhimi i pronës

Keni Nevojë për Ndihmë?
Nëse keni ndonjë pyetje rreth këtij raporti, ju lutemi përgjigjuni këtij emaili ose kontaktoni ekipin tonë të mbështetjes.

---
© ${new Date().getFullYear()} Sistemi i Menaxhimit të Apartamenteve BllokuSync. Të gjitha të drejtat e rezervuara.
Ky email u dërgua në ${tenant.email}
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
      <html lang="sq">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Raporti Mujor - ${monthYear}</title>
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
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Raporti Mujor i Disponueshëm</h1>
                    <p style="color: #dbeafe; margin: 10px 0 0 0; font-size: 18px; font-weight: 600;">${monthYear}</p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #1a202c; margin: 0 0 10px 0; font-size: 22px;">Përshëndetje ${tenant.name} ${tenant.surname},</h2>
                    
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                      Raporti juaj mujor financiar për <strong>${property.name}</strong> është i disponueshëm tani.
                    </p>

                    <!-- Report Summary Box -->
                    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #3b82f6; border-radius: 8px; padding: 25px; margin: 25px 0;">
                      <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">Përmbledhja e Raportit</h3>
                      
                      <table width="100%" cellpadding="8" cellspacing="0">
                        <tr>
                          <td style="color: #475569; font-size: 14px; padding: 8px 0;">
                            <strong>Buxheti Total i Mbledhur:</strong>
                          </td>
                          <td align="right" style="color: #10b981; font-size: 18px; font-weight: 700; padding: 8px 0;">
                            €${report.total_budget}
                          </td>
                        </tr>
                        <tr>
                          <td style="color: #475569; font-size: 14px; padding: 8px 0; border-top: 1px solid #cbd5e1;">
                            <strong>Statusi i Pagesave:</strong>
                          </td>
                          <td align="right" style="color: #1e40af; font-size: 14px; font-weight: 600; padding: 8px 0; border-top: 1px solid #cbd5e1;">
                            ${report.paid_tenants} nga ${report.total_tenants} banorë (${paidPercentage}%)
                          </td>
                        </tr>
                        ${parseFloat(report.pending_amount) > 0 ? `
                        <tr>
                          <td style="color: #475569; font-size: 14px; padding: 8px 0; border-top: 1px solid #cbd5e1;">
                            <strong>Shuma në Pritje:</strong>
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
                      <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px;">Shpërndarja e Buxhetit</h3>
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
                    <!-- Shënime nga Menaxheri i Pronës -->
                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 25px 0;">
                      <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">Shënime nga Menaxheri i Pronës</h3>
                      <p style="color: #78350f; font-size: 14px; line-height: 1.6; margin: 0;">${report.notes}</p>
                    </div>
                    ` : ''}

                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="${loginUrl}/tenant/reports" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                            Shiko Raportin e Detajuar
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Info Box -->
                    <div style="background-color: #edf2f7; border-radius: 8px; padding: 20px; margin: 20px 0;">
                      <p style="color: #4a5568; font-size: 14px; margin: 0; line-height: 1.6;">
                        <strong>Çfarë përfshin raporti juaj:</strong><br>
                        • Ndarjen e plotë të buxhetit<br>
                        • Shpërndarjen e shpenzimeve sipas kategorisë<br>
                        • Përmbledhjen e statusit të pagesave<br>
                        • Shënime të rëndësishme nga menaxhimi i pronës
                      </p>
                    </div>

                    <div style="margin-top: 25px;">
                      <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0;">
                        <strong>Keni pyetje rreth këtij raporti?</strong><br>
                        Mos hezitoni të përgjigjeni në këtë email ose të kontaktoni ekipin tonë të mbështetjes për asistencë.
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #718096; font-size: 12px; margin: 0 0 10px 0;">
                      © ${new Date().getFullYear()} Sistemi i Menaxhimit të Apartamenteve BllokuSync. Të gjitha të drejtat e rezervuara.
                    </p>
                    <p style="color: #a0aec0; font-size: 11px; margin: 0 0 10px 0;">
                      Ky email u dërgua në ${tenant.email}
                    </p>
                    <p style="color: #a0aec0; font-size: 11px; margin: 0;">
                      Prona: ${property.name} | Raporti: ${monthYear}
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
