# 🚀 Resend DNS Verification - Final Steps

## Current Status
✅ DNS records have been added to your domain registrar
✅ Backend is configured with `noreply@notifications.bllokusync.com`  
✅ Resend API key is set in `.env`  
⏳ **NEXT:** Add DNS records in GoDaddy and verify in Resend

---

## Step-by-Step Instructions

### 1. Add DNS Records in GoDaddy (10 minutes)

#### Access GoDaddy DNS Management
1. Go to: **https://dnsmanagement.godaddy.com/**
2. Log in to your GoDaddy account
3. Find your domain: **bllokusync.com**
4. Click **"DNS"** or **"Manage DNS"**

#### Add the 4 Required DNS Records
⏳ **NEXT:** Verify DNS records and enable production mode
**Record 1: MX Record (Mail Exchange)**
- **Type:** MX
- **Name/Host:** `send.notifications` (NOT the full domain, just this part)
- **Points to/Value:** `feedback-smtp.us-east-1.amazonses.com`
- **Priority:** `10`
### 1. Verify DNS Records in Resend Dashboard (5-15 minutes)

1. Go to: **https://resend.com/domains**
2. Log in to your Resend account
3. Find your domain: `notifications.bllokusync.com`
4. Click the **"Verify Records"** button
5. Wait for verification - you should see ✅ green checkmarks for all 4 records:
   - ✅ **MX Record** - `send.notifications` → `feedback-smtp.us-east-1.amazonses.com`
   - ✅ **SPF Record** - `v=spf1 include:amazonses.com ~all`
   - ✅ **DKIM Record** - `resend._domainkey.notifications`
   - ✅ **DMARC Record** - `v=DMARC1; p=none;`
- **Type:** TXT
- **Name/Host:** `resend._domainkey.notifications`
- If records don't verify immediately, wait 15-30 minutes and try again
- **TTL:** 600 (or use "Default/Auto")

**Record 4: DMARC Record (TXT - Email Authentication Policy)**
- **Type:** TXT
**Note:** Verification can take 5-15 minutes, but may take up to 48 hours for DNS propagation.
3. Change it to:
   ```
   EMAIL_TEST_MODE=false
   ```
4. Save the file
5. **Restart your backend server**:
   ```bash
   cd backend
   npm start
   ```

**That's it!** Your system will now send emails to actual user email addresses. 🎉

---

### 4. Test the Email System

1. **Create a test registration request** from your frontend
2. **Approve the request** from the property manager dashboard
3. **Check the user's email inbox** - they should receive the welcome email
4. **Verify in Resend Dashboard**:
   - Go to https://resend.com/emails
   - You should see the sent email with status "Delivered"

---

## Current Configuration

Your system is already set up with:

| Setting | Value |
|---------|-------|
| **From Email** | `noreply@notifications.bllokusync.com` |
| **Domain** | `notifications.bllokusync.com` |
| **Test Mode** | `true` (change to `false` after DNS verification) |
| **Test Email** | `artzymeri2001@gmail.com` |
| **API Key** | Set ✅ |

---

## What Happens in Each Mode

### 🧪 Test Mode (`EMAIL_TEST_MODE=true`)
- Make sure you added the records exactly as shown above
- Contact your domain registrar if records still don't verify after 48 hours
- Perfect for testing without spamming users

### 🚀 Production Mode (`EMAIL_TEST_MODE=false`)
### 2. Enable Production Mode (Once DNS is Verified)
- No `[TEST]` prefix or banner
- Professional appearance
- Requires verified domain

---

## Email Features Available

Your system includes these email templates (all ready to use):

1. ✅ **Welcome Email** - Sent when registration is approved
2. 💰 **Payment Reminder** - For upcoming rent payments
3. ✅ **Payment Confirmation** - When payment is received
4. 📊 **Monthly Reports** - (can be added if needed)

---

## Monitoring & Analytics

**Resend Dashboard:** https://resend.com/emails

You can track:
- ✉️ All sent emails
- 📬 Delivery status (delivered, bounced, failed)
- 📊 Open rates and click rates
- 🐛 Error logs and debugging info
### 3. Test the Email System

---

## Pricing Reminder

| Plan | Emails/Month | Price | Your Usage |
|------|-------------|-------|------------|
| **Free** | 3,000 | $0 | Good for testing |
| **Pro** | 50,000 | $20/month | **Recommended for 10k emails** |

You're currently on the **Free tier** - upgrade to Pro when you need more than 3,000 emails/month.

---

## Quick Commands

### Restart Backend
```bash
cd /Users/artz./Desktop/Private/apartment_management/backend
npm start
```

### Check DNS Records
```bash
# Check MX record
dig MX send.notifications.bllokusync.com

# Check SPF record
dig TXT send.notifications.bllokusync.com

# Check DKIM record
dig TXT resend._domainkey.notifications.bllokusync.com

# Check DMARC record
dig TXT _dmarc.notifications.bllokusync.com
```

---

## Support

- **Resend Docs:** https://resend.com/docs
- **Resend Support:** support@resend.com
- **DNS Help:** https://resend.com/docs/dashboard/domains/dns-setup

---

## ✅ Final Checklist

- [ ] DNS records added to domain registrar
- [ ] Wait 15-30 minutes for DNS propagation
- [ ] Verify records in Resend dashboard (all green checkmarks)
- [ ] Change `EMAIL_TEST_MODE=false` in `/backend/.env`
- [ ] Restart backend server
- [ ] Test by approving a registration request
- [ ] Check email delivery in Resend dashboard

---

**Once all checkmarks are complete, your email system is fully operational!** 🎉📧
