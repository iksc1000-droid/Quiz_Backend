# Email URL Issue - Complete Analysis

## 🔍 Problem Summary

**Symptom:** Email button opens `https://www.ikscbandhan.in/results?quiz=divorce_conflict_v1` instead of `https://conflict-resolution-quiz.ikscbandhan.in/divorce-email`

**Works in:** Localhost ✅  
**Fails in:** Production (VPS) ❌

---

## 🎯 Root Cause Analysis

The email is sent from the **BACKEND**, not frontend. The URL is constructed in `src/config/mailer.js`.

### Why Localhost Works:
- Your local backend has the **updated** `mailer.js` with hardcoded URL
- Code on line 82-83: `const resultsUrl = 'https://conflict-resolution-quiz.ikscbandhan.in/divorce-email';`

### Why Production Fails:
The VPS backend likely has **one of these issues**:

1. **Old code not updated** - `mailer.js` still has old URL
2. **PM2 not restarted** - Old code still running in memory
3. **Wrong file being used** - Different mailer file or cached version
4. **Git not synced** - Code pulled but not restarted

---

## 🔧 How Many Things Matter Here?

### 1. **Backend Code (`mailer.js`)**
   - **Location:** `src/config/mailer.js` line 82-83
   - **Must have:** Hardcoded URL `'https://conflict-resolution-quiz.ikscbandhan.in/divorce-email'`
   - **Check:** `grep "resultsUrl" src/config/mailer.js` on VPS

### 2. **PM2 Process Manager**
   - **Must restart:** After code changes
   - **Command:** `pm2 restart all`
   - **Verify:** `pm2 logs --lines 20` should show new code running

### 3. **Git Sync**
   - **Must pull:** Latest code from repository
   - **Command:** `git pull origin main`
   - **Verify:** `git status` shows clean working tree

### 4. **Node.js Module Cache**
   - **May need:** Clear cache if PM2 restart doesn't work
   - **Command:** `rm -rf node_modules/.cache && pm2 restart all`

### 5. **Environment Variables (Less Likely)**
   - **BRAND_SITE** should NOT affect hardcoded URL
   - **But check:** `.env` file doesn't override anything

---

## ✅ Step-by-Step Fix

### Step 1: SSH into VPS
```bash
ssh your-user@your-vps-ip
```

### Step 2: Navigate to Backend
```bash
cd /path/to/Quiz_Backend
# Common paths:
# /var/www/Quiz_Backend
# /home/username/Quiz_Backend
# /root/Quiz_Backend
```

### Step 3: Check Current Code
```bash
# Check what URL is in the file
grep -A 2 "resultsUrl" src/config/mailer.js
```

**Expected (CORRECT):**
```javascript
const resultsUrl =
  'https://conflict-resolution-quiz.ikscbandhan.in/divorce-email';
```

**If you see (WRONG):**
```javascript
const resultsUrl = config.branding.site + '/results?quiz=...'
// OR
const resultsUrl = 'https://www.ikscbandhan.in/results?quiz=...'
```

### Step 4: Update Code

**Option A: Via Git (Recommended)**
```bash
git status
git pull origin main  # or master
```

**Option B: Manual Edit**
```bash
nano src/config/mailer.js
```

Find line ~82-83, change to:
```javascript
    // ✅ FINAL: Divorce quiz result page (NO dynamic override)
    const resultsUrl =
      'https://conflict-resolution-quiz.ikscbandhan.in/divorce-email';
```

Save: `Ctrl+O`, `Enter`, `Ctrl+X`

### Step 5: Restart Backend
```bash
# Check PM2 status
pm2 list

# Restart all processes
pm2 restart all

# OR if you know the app name
pm2 restart quiz-backend
```

### Step 6: Verify Restart
```bash
# Check logs for the URL being used
pm2 logs --lines 50 | grep -i "resultsUrl\|EMAIL CTA"
```

**Should see:**
```
🔥 [EMAIL CTA LINK] Using resultsUrl → https://conflict-resolution-quiz.ikscbandhan.in/divorce-email
```

### Step 7: Test
1. Complete quiz on production
2. Check email HTML source
3. Button should have: `href="https://conflict-resolution-quiz.ikscbandhan.in/divorce-email"`

---

## 🐛 Troubleshooting

### Issue: Code updated but still wrong URL

**Check 1: Multiple PM2 processes**
```bash
pm2 list
pm2 delete all
pm2 start src/server.js --name quiz-backend
```

**Check 2: File permissions**
```bash
ls -la src/config/mailer.js
# Should be readable by Node.js process
```

**Check 3: Different mailer file**
```bash
find . -name "*mailer*" -type f
# Should only see: src/config/mailer.js
```

### Issue: PM2 not restarting

**Force restart:**
```bash
pm2 stop all
pm2 start all
# OR
pm2 delete all
cd /path/to/Quiz_Backend
pm2 start src/server.js --name quiz-backend
```

### Issue: Git pull shows conflicts

**Resolve conflicts:**
```bash
git status
# If conflicts, check:
git diff src/config/mailer.js
# Manually fix conflicts
git add src/config/mailer.js
git commit -m "Fix email URL"
```

---

## 📋 Verification Checklist

After fixing, verify:

- [ ] `grep "resultsUrl" src/config/mailer.js` shows correct URL
- [ ] `pm2 logs` shows correct URL in email logs
- [ ] New test email has correct button link
- [ ] Email HTML source shows: `href="https://conflict-resolution-quiz.ikscbandhan.in/divorce-email"`
- [ ] Button click opens correct page (not www.ikscbandhan.in)

---

## 🎯 Quick Reference

**Correct URL in code:**
```javascript
const resultsUrl = 'https://conflict-resolution-quiz.ikscbandhan.in/divorce-email';
```

**Wrong URLs to avoid:**
- ❌ `https://www.ikscbandhan.in/results?quiz=...`
- ❌ `config.branding.site + '/results?quiz=...'`
- ❌ Any dynamic URL construction

**Key Commands:**
```bash
# Check code
grep "resultsUrl" src/config/mailer.js

# Update code
git pull origin main

# Restart
pm2 restart all

# Verify
pm2 logs --lines 50 | grep "resultsUrl"
```

---

## 💡 Why This Happens

1. **Code not synced:** Local has new code, VPS has old code
2. **PM2 cache:** Old code still in memory even after file update
3. **Multiple deployments:** Code updated but wrong process running
4. **Git branch mismatch:** Pulling from wrong branch

**Solution:** Always verify code on VPS matches local, then restart PM2.

