# 🚨 URGENT SECURITY ACTION REQUIRED

## Exposed Resend API Key - Immediate Rotation Needed

During the security audit, we discovered a **hardcoded Resend API key** that was committed to the GitHub repository.

### Exposed Credential
```
Key: re_j299ogpf_EEAKZAoLJArch69r5tXmjVPs
Location: apps/backend/src/services/resendService.ts (removed in commit a44177e)
Exposure Duration: Unknown - needs git history review
```

### ⚠️ Risk Level: **HIGH**
Anyone with access to the repository history can retrieve this key and potentially:
- Send emails from your domain
- Consume your Resend API quota
- Potentially access email sending logs

---

## Required Actions

### 1. Rotate the API Key Immediately ⏰

**Steps to rotate:**

1. **Log into Resend Dashboard**
   - Go to: https://resend.com/api-keys

2. **Revoke the Exposed Key**
   - Find key: `re_j299ogpf_EEAKZAoLJArch69r5tXmjVPs`
   - Click "Delete" or "Revoke"
   - Confirm deletion

3. **Generate New API Key**
   - Click "Create API Key"
   - Name it: `Production - BilanCompetence.AI`
   - Copy the new key **immediately** (it won't be shown again)

4. **Update Environment Variables**

   **For Production (Railway/Vercel/etc.):**
   ```bash
   # In your deployment platform dashboard:
   RESEND_API_KEY=re_NEW_KEY_HERE
   ```

   **For Local Development:**
   ```bash
   # In apps/backend/.env.local
   RESEND_API_KEY=re_NEW_KEY_HERE
   ```

5. **Restart Services**
   - Restart backend server
   - Verify emails are sending correctly

### 2. Review Resend Logs 📊

Check for any suspicious activity:
1. Go to Resend Dashboard → Logs
2. Review email sending activity for the past 30 days
3. Look for:
   - Unexpected recipient addresses
   - Unusual sending volumes
   - Failed authentication attempts
4. Report any suspicious activity to Resend support

### 3. Update Team (If Applicable) 👥

If working in a team:
- Notify all team members of the key rotation
- Update shared documentation with new setup instructions
- Remind team about secrets management best practices

---

## Prevention - What Was Fixed ✅

### Code Changes Made:

**1. Removed Hardcoded Fallback**
```typescript
// ❌ BEFORE (INSECURE):
const resend = new Resend(process.env.RESEND_API_KEY || 're_j299ogpf_...');

// ✅ AFTER (SECURE):
const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  logger.error('CRITICAL: RESEND_API_KEY environment variable is required');
  throw new Error('RESEND_API_KEY environment variable is required for email service');
}
const resend = new Resend(apiKey);
```

**2. Added Environment Variable Validation**
- Server now fails to start if `RESEND_API_KEY` is missing
- Prevents accidental deployments without proper configuration

**3. Updated `.gitignore`**
- Ensured `.env`, `.env.local`, `.env.production` are ignored
- Prevents future credential commits

---

## Best Practices Going Forward 🛡️

### DO ✅
- Store ALL secrets in environment variables
- Use different keys for development, staging, and production
- Rotate keys periodically (every 90 days)
- Use secrets management tools (Vault, AWS Secrets Manager, etc.)
- Add pre-commit hooks to scan for secrets

### DON'T ❌
- Never commit `.env` files
- Never hardcode API keys as fallbacks
- Never share keys via Slack, email, or unencrypted channels
- Never use production keys in development

---

## Verification Checklist

After completing the rotation:

- [ ] Old API key revoked in Resend dashboard
- [ ] New API key generated and saved securely
- [ ] Production environment variable updated
- [ ] Development environment variable updated
- [ ] Backend server restarted
- [ ] Test email sent successfully (password reset, verification, etc.)
- [ ] Resend logs reviewed for suspicious activity
- [ ] Team notified (if applicable)
- [ ] This document marked as completed

---

## Questions or Issues?

If you encounter any problems during the rotation:
1. Check the Resend documentation: https://resend.com/docs
2. Verify environment variables are loaded: Add `console.log(!!process.env.RESEND_API_KEY)` temporarily
3. Check backend logs for error messages
4. Contact Resend support if emails stop working

---

**Status:** 🔴 ACTION REQUIRED
**Priority:** URGENT
**Estimated Time:** 15-20 minutes
**Difficulty:** Easy

---

*This security notice was generated during the security audit on 2025-11-06.*
