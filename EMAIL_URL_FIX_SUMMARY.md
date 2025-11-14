# Email URL Fix - Summary

## 🐛 Original Bug

**Symptom:** Email button was opening `https://www.ikscbandhan.in/results?quiz=divorce_conflict_v1` instead of `https://conflict-resolution-quiz.ikscbandhan.in/divorce-email`

**Root Cause:** The URL was being constructed in multiple places or using `BRAND_SITE` environment variable which pointed to the wrong domain.

---

## ✅ Solution Implemented

### 1. Centralized URL Builder

**Location:** `src/config/mailer.js` - `getResultsUrlForQuiz()` function (line 18-30)

**Function:**
```javascript
const getResultsUrlForQuiz = (quizId, resultToken) => {
  // For divorce conflict quiz, hard-code the frontend results page
  if (quizId === 'divorce_conflict_v1') {
    return 'https://conflict-resolution-quiz.ikscbandhan.in/divorce-email';
  }
  
  // Future quizzes can have their own mapping here
  const fallbackUrl = `${config.branding.site || 'https://www.ikscbandhan.in'}/results?quiz=${encodeURIComponent(quizId)}`;
  logger.warn(`⚠️ [EMAIL] Using fallback URL for quizId: ${quizId}`, { fallbackUrl });
  return fallbackUrl;
};
```

**This is the ONLY place in the codebase that constructs the "See Your Quiz Result" CTA URL.**

### 2. Production Email Sender Path

**Confirmed Flow:**
1. `quiz.controller.js` → `queueWelcomeToUser()` (line 425)
2. `mail.service.js` → `sendWelcome()` (line 20)
3. `mailer.js` → `sendWelcomeEmail()` (line 274) ← **URL built here via `getResultsUrlForQuiz()`**

### 3. Enhanced Debug Logging

**Added strong logging in `sendWelcomeEmail()`:**
```javascript
console.log('🔥 [EMAIL][FINAL_RESULTS_URL]', {
  function: 'sendWelcomeEmail',
  to,
  quizId,
  resultToken: resultToken ? 'present' : 'missing',
  resultsUrl,
  nodeEnv: process.env.NODE_ENV,
  timestamp: new Date().toISOString()
});
logger.info('🔥 [EMAIL][FINAL_RESULTS_URL]', { ... });
```

**This will appear in PM2 logs, making it easy to verify which URL is being sent.**

### 4. Extracted HTML Template

**Created `buildWelcomeEmailHtml()` function** (line 64-272) for:
- Code reusability
- Testing (can be called without sending email)
- Maintainability

### 5. Verified mail.service.js

**Confirmed:** `mail.service.js` does NOT build URLs - it delegates to `mailer.js`
- Added documentation comments explaining the flow
- No URL construction logic in this file

### 6. Test Helper Created

**File:** `scripts/test-email-template.js`

**Usage:**
```bash
node scripts/test-email-template.js
```

**What it does:**
- Generates email HTML without sending
- Verifies URL is correct
- Checks button link in HTML
- Saves preview to `tmp/email-preview.html`

---

## 📋 Files Changed

### `src/config/mailer.js`
- ✅ Added `getResultsUrlForQuiz()` - centralized URL builder
- ✅ Added `buildWelcomeEmailHtml()` - extracted HTML template
- ✅ Enhanced debug logging with `🔥 [EMAIL][FINAL_RESULTS_URL]`
- ✅ Added documentation comments explaining production flow
- ✅ Removed duplicate HTML code

### `src/services/mail.service.js`
- ✅ Added documentation comments
- ✅ Confirmed it delegates to `mailer.js` (no URL building)

### `scripts/test-email-template.js` (NEW)
- ✅ Test helper to preview email and verify URL

---

## 🔍 Verification

### No Wrong URLs Found
- ✅ No instances of `www.ikscbandhan.in/results?quiz=` in codebase
- ✅ No URL construction using `BRAND_SITE` for divorce quiz
- ✅ `mailer-mock.js` not used in production (different signature)

### Single Source of Truth
- ✅ Only `getResultsUrlForQuiz()` in `mailer.js` builds result URLs
- ✅ All email sending goes through `sendWelcomeEmail()` in `mailer.js`
- ✅ URL is hardcoded for `divorce_conflict_v1` quiz

---

## 🚀 Deployment Checklist

After deploying to VPS:

1. **Verify code is updated:**
   ```bash
   grep -n "getResultsUrlForQuiz" src/config/mailer.js
   # Should show line 18
   ```

2. **Check URL in code:**
   ```bash
   grep -A 3 "divorce_conflict_v1" src/config/mailer.js
   # Should show: return 'https://conflict-resolution-quiz.ikscbandhan.in/divorce-email';
   ```

3. **Restart backend:**
   ```bash
   pm2 restart all
   ```

4. **Check logs for URL:**
   ```bash
   pm2 logs --lines 50 | grep "FINAL_RESULTS_URL"
   # Should show: resultsUrl: 'https://conflict-resolution-quiz.ikscbandhan.in/divorce-email'
   ```

5. **Test email:**
   - Complete quiz
   - Check email HTML source
   - Verify button link is: `https://conflict-resolution-quiz.ikscbandhan.in/divorce-email`

---

## 📝 Summary

**Where the bug was:** The URL was potentially being constructed from `BRAND_SITE` environment variable or in multiple places, causing inconsistency.

**How it's fixed:**
1. Created single `getResultsUrlForQuiz()` function in `mailer.js`
2. Hardcoded URL for `divorce_conflict_v1` to `https://conflict-resolution-quiz.ikscbandhan.in/divorce-email`
3. Added strong debug logging to verify URL in PM2 logs
4. Extracted HTML template for testability
5. Documented the entire email flow

**Result:** Email button will ALWAYS open `https://conflict-resolution-quiz.ikscbandhan.in/divorce-email` for `divorce_conflict_v1` quiz, regardless of `BRAND_SITE` environment variable.

