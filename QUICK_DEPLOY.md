# Quick Deployment Guide

## 🚀 Fast Track to Deploy

### On Your Local Machine (Push to GitHub)

```powershell
cd Y:\PRASAD_RATHOD\Backend
git push origin main
```

### On Your VPS (Deploy Backend)

```bash
# 1. Pull latest code
cd /path/to/backend
git pull origin main

# 2. Run cleanup script (FIXES EXISTING DATA)
node scripts/fix-null-result-tokens.js

# 3. Fix email password in .env (REMOVE SPACES)
nano .env
# Change: SMTP_PASS=sfhh gdsb tgzg ywxj
# To:     SMTP_PASS=sfhhgdsbtgzgywxj
# Save and exit (Ctrl+X, Y, Enter)

# 4. Restart backend
pm2 restart all
```

### Frontend (Build & Deploy)

```powershell
cd Y:\PRASAD_RATHOD\divorce
npm run build
# Upload 'dist' folder to your hosting
```

---

## ✅ Verify Everything Works

1. **Test Quiz Submission** - Should complete without errors
2. **Check Email** - User should receive welcome email
3. **Check Console** - Should be clean (no debug logs)
4. **Check Results** - Results page should load

---

## 🆘 If Something Fails

### resultToken Error Still Appears?
→ Run cleanup script again: `node scripts/fix-null-result-tokens.js`

### Email Not Sending?
→ Check `.env` password has NO spaces

### 404 Errors?
→ Check backend is running: `pm2 status`

---

**That's it!** 🎉

