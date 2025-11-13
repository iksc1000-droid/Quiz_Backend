# Verify Email URL on VPS - Step by Step

## Quick Check Commands

Run these commands on your VPS to diagnose the issue:

### 1. Check if mailer.js has the correct URL

```bash
cd /path/to/Quiz_Backend
grep -n "resultsUrl" src/config/mailer.js
```

**Expected output:**
```
82:    const resultsUrl =
83:      'https://conflict-resolution-quiz.ikscbandhan.in/divorce-email';
```

**If you see:**
```
const resultsUrl = config.branding.site + '/results?quiz=...'
```
**OR**
```
const resultsUrl = 'https://www.ikscbandhan.in/results?quiz=...'
```

**Then the file is NOT updated!**

---

### 2. Check the exact line content

```bash
sed -n '80,85p' src/config/mailer.js
```

Should show:
```javascript
    // ✅ FINAL: Divorce quiz result page (NO dynamic override)
    const resultsUrl =
      'https://conflict-resolution-quiz.ikscbandhan.in/divorce-email';
```

---

### 3. Check PM2 logs for what URL is being sent

```bash
pm2 logs --lines 100 | grep -i "resultsUrl\|EMAIL CTA\|results"
```

Look for:
```
🔥 [EMAIL CTA LINK] Using resultsUrl → https://conflict-resolution-quiz.ikscbandhan.in/divorce-email
```

**If you see a different URL, the code is not updated!**

---

### 4. Check when file was last modified

```bash
ls -lh src/config/mailer.js
stat src/config/mailer.js
```

If the file was modified days/weeks ago, it needs to be updated.

---

## Fix Steps

### Option 1: Update via Git (Recommended)

```bash
cd /path/to/Quiz_Backend
git status
git pull origin main  # or master
npm install  # if package.json changed
pm2 restart all
pm2 logs --lines 20  # verify restart
```

### Option 2: Manual Edit

```bash
cd /path/to/Quiz_Backend
nano src/config/mailer.js
```

Find line ~82-83 and change to:
```javascript
    // ✅ FINAL: Divorce quiz result page (NO dynamic override)
    const resultsUrl =
      'https://conflict-resolution-quiz.ikscbandhan.in/divorce-email';
```

Save (Ctrl+O, Enter, Ctrl+X)

Then:
```bash
pm2 restart all
pm2 logs --lines 20
```

---

## Verify the Fix

### 1. Check logs after restart

```bash
pm2 logs --lines 50 | grep -i "resultsUrl"
```

Should see:
```
🔥 [EMAIL CTA LINK] Using resultsUrl → https://conflict-resolution-quiz.ikscbandhan.in/divorce-email
```

### 2. Send a test email

Complete the quiz and check the email HTML source. The button should have:
```html
<a href="https://conflict-resolution-quiz.ikscbandhan.in/divorce-email" class="cta-button">See My Quiz Result</a>
```

---

## Common Issues

### Issue 1: PM2 not restarting properly
```bash
pm2 stop all
pm2 start all
# OR
pm2 delete all
pm2 start src/server.js --name quiz-backend
```

### Issue 2: Code cached
```bash
# Clear Node.js cache
rm -rf node_modules/.cache
pm2 restart all
```

### Issue 3: Wrong file being used
```bash
# Check which file is actually being imported
grep -r "from.*mailer" src/
# Should show: import { sendWelcomeEmail } from '../config/mailer.js';
```

---

## Still Not Working?

1. **Check if multiple backend instances are running:**
   ```bash
   pm2 list
   ps aux | grep node
   ```

2. **Check if there's a different mailer file:**
   ```bash
   find . -name "*mailer*" -type f
   ```

3. **Check environment variables:**
   ```bash
   cat .env | grep BRAND_SITE
   ```

4. **Test email sending directly:**
   ```bash
   # Use the test-email endpoint
   curl -X POST http://localhost:5000/test-email \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'
   ```

