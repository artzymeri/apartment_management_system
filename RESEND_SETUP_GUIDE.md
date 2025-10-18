# 📧 Resend Email Setup Guide

## Overview
Your apartment management system now has email functionality integrated using **Resend**. When you approve a registration request, the user will automatically receive a beautiful welcome email with their login credentials.

---

## 💰 Pricing for 10,000 Emails/Month

With **10,000 emails per month**, here's what you'd pay with Resend:

- **FREE tier**: Up to 3,000 emails/month (100/day) - **$0**
- **Pro tier**: Up to 50,000 emails/month - **$20/month**

**For 10,000 emails/month, you need the Pro plan at $20/month.**

This breaks down to:
- **$0.002 per email** (very affordable!)
- Includes all features: API access, analytics, multiple domains, etc.

---

## 🚀 Setup Instructions (What YOU Need to Do)

### Step 1: Create a Resend Account (5 minutes)

1. Go to: https://resend.com/signup
2. Sign up with your email (no credit card required for free tier)
3. Verify your email address

### Step 2: Get Your API Key

1. After logging in, go to: https://resend.com/api-keys
2. Click "Create API Key"
3. Name it something like "Apartment Management"
4. Select permissions: "Sending access"
5. Click "Create"
6. **Copy the API key** (it starts with `re_...`)

### Step 3: Add Your API Key to the Project

1. Open the file: `/backend/.env`
2. Find this line:
   ```
   RESEND_API_KEY=your_resend_api_key_here
   ```
3. Replace `your_resend_api_key_here` with your actual API key:
   ```
   RESEND_API_KEY=re_abc123xyz...
   ```
4. Save the file

### Step 4: Test with Development Email (Optional)

For testing, Resend provides a special email: `onboarding@resend.dev`

The system is already configured to use this for testing. Emails will work immediately!

### Step 5: Add Your Custom Domain (For Production)

**For Production Use**, you'll want to use your own domain:

1. In Resend dashboard, go to "Domains"
2. Click "Add Domain"
3. Enter your domain (e.g., `yourdomain.com`)
4. Follow the DNS setup instructions (add TXT, MX, and CNAME records)
5. Wait for verification (usually 5-15 minutes)

Then update the email service to use your domain:
- Open `/backend/services/email.service.js`
- Change `onboarding@resend.dev` to `noreply@yourdomain.com`

---

## ✅ After DNS Records Are Added

### Step 6: Verify DNS Records in Resend Dashboard

1. Go to Resend dashboard: https://resend.com/domains
2. Find your domain (`notifications.yourdomain.com` or similar)
3. Click "Verify Records"
4. Wait for verification - all records should show ✅ green checkmarks:
   - MX record (for sending)
   - SPF record (TXT - authorizes senders)
   - DKIM record (TXT - email signing)
   - DMARC record (TXT - authentication policy)
5. Verification typically takes 5-15 minutes, but can take up to 48 hours

**Note**: Your DNS records show:
- **MX**: `send.notifications` → `feedback-smtp.us-east-1.amazonses.com`
- **SPF**: `v=spf1 include:amazonses.com ~all`
- **DKIM**: `resend._domainkey.notifications`
- **DMARC**: `_dmarc` → `v=DMARC1; p=none;`

### Step 7: Update Your Backend Configuration

Once DNS is verified, update the email service to use your verified domain:

1. Open `/backend/services/email.service.js`
2. Find the `from` field in email functions
3. Change from `onboarding@resend.dev` to your domain:
   ```javascript
   from: 'noreply@send.notifications.yourdomain.com'
   // Or use your main domain if that's what you verified:
   from: 'noreply@notifications.yourdomain.com'
   ```
4. Save the file and restart your backend server

### Step 8: Test the Email Functionality

1. **Create a test registration request** from the frontend
2. **Approve it** from the admin/property manager dashboard
3. Check the email inbox - you should receive the welcome email
4. Check Resend dashboard → Emails to see delivery status

### Step 9: Monitor Email Delivery

In your Resend dashboard (https://resend.com/emails), you can:
- See all sent emails
- Check delivery status (Delivered, Bounced, etc.)
- View email content
- Track opens and clicks (if enabled)
- Debug any issues

---

## 📝 How It Works Now

1. **Admin approves a registration request**
2. System creates the user account with a **temporary password**
3. **Welcome email is sent automatically** to the user's email
4. User receives:
   - Email with login credentials
   - Temporary password
   - Direct link to login page
5. User can log in immediately

---

## 🧪 Testing

### Test Right Now (No Setup Required!)

The system uses Resend's test email (`onboarding@resend.dev`), so you can test immediately:

1. Start your backend: `cd backend && npm start`
2. Go to admin panel and approve a registration request
3. Check the user's email inbox - they'll receive the welcome email!

### Check Logs

If an email fails to send, check your backend console for error messages.

---

## 🔧 Troubleshooting

### DNS Records Not Verifying?
- Wait up to 48 hours for DNS propagation
- Use a DNS checker: https://dnschecker.org
- Make sure there are no typos in the records
- Ensure TTL is set to Auto or a reasonable value

### Email not sending?
- Check that `RESEND_API_KEY` is set in `.env`
- Restart your backend server after adding the API key
- Check console logs for error messages
- Verify your API key is correct in Resend dashboard

### User not receiving email?
- Check their spam/junk folder
- Verify the email address is correct in the database
- Check Resend dashboard "Logs" section to see delivery status

### Want to test locally?
- You can use services like MailHog or Mailtrap for local testing
- Or just use Resend's free tier - it works instantly!

---

## 📊 Monitoring Emails

In your Resend dashboard:
1. Go to "Emails" to see all sent emails
2. View delivery status (delivered, bounced, etc.)
3. See open rates and click rates
4. Access detailed logs for debugging

---

## 🎯 Next Steps (Optional Enhancements)

Want to add more email features? Here are ideas:

1. **Payment Reminders**: Send automatic reminders before payment due date
2. **Overdue Notices**: Auto-send when payment is overdue
3. **Monthly Reports**: Email monthly reports to property managers
4. **Maintenance Updates**: Notify tenants when requests are updated
5. **Bulk Announcements**: Send announcements to all tenants

All the templates are already created in `email.service.js` - just call the functions!

---

## 💡 Tips

- **Free Tier**: Great for testing and small deployments (3,000 emails/month)
- **Pro Tier**: For production with 10,000 emails/month ($20/month)
- **Domain Verification**: Do this before launching to production
- **Monitor Usage**: Check Resend dashboard to track email usage
- **Upgrade Anytime**: No contract, upgrade or downgrade as needed

---

## 📞 Support

- **Resend Docs**: https://resend.com/docs
- **Resend Support**: support@resend.com
- **Status Page**: https://status.resend.com

---

## ✨ Summary

**What I've implemented:**
- ✅ Resend email service integration
- ✅ Beautiful HTML welcome email template
- ✅ Automatic email sending on registration approval
- ✅ Temporary password generation
- ✅ Logo embedding ready
- ✅ Payment reminder templates
- ✅ Error handling and logging

**What YOU need to do:**
1. Create Resend account (5 min)
2. Get API key (1 min)
3. Add API key to `.env` file (1 min)
4. Restart backend server (1 min)
5. Test by approving a registration! ✅

**Total setup time: ~10 minutes** 🚀

---

**Ready to go! Just add your Resend API key and start sending beautiful emails!** 📧✨
