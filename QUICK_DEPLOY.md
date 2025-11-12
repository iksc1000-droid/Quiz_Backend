# Quick Deployment Guide

## Before Deployment - CRITICAL CHECKS

### 1. Backend .env File (On VPS)

```env
# MongoDB (Required)
MONGO_URI_SOURCE=mongodb+srv://psychouser:Psycho%401234@psychometriccluster.jryoayj.mongodb.net/Bandhan?retryWrites=true&w=majority&appName=PsychometricCluster
MONGO_URI_RESULTS=mongodb+srv://psychouser:Psycho%401234@psychometriccluster.jryoayj.mongodb.net/demo_test_answer?retryWrites=true&w=majority&appName=PsychometricCluster

# Server (Required)
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://www.ikscbandhan.in

# SMTP - Gmail (Required)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=ikscbandhan@gmail.com
SMTP_PASS=kvxmitjcerfxhgal
FROM_EMAIL=ikscbandhan@gmail.com
FROM_NAME=IKSC Bandhan

# Frontend URL for Email Links (Required)
BRAND_SITE=https://www.ikscbandhan.in

# Quiz Config
QUIZ_ID=divorce_conflict_v1
QUIZ_COLLECTION=divorce conflict
```

### 2. Frontend Build

Set environment variable before building:
```bash
VITE_API_URL=https://api.ikscbandhan.in npm run build
```

Or create `.env.production`:
```env
VITE_API_URL=https://api.ikscbandhan.in
```

### 3. Verify SMTP Password

**CRITICAL**: Check password has NO spaces:
```bash
# On VPS, check .env
grep SMTP_PASS .env
# Should show: SMTP_PASS=kvxmitjcerfxhgal (16 chars, NO SPACES)
```

If it has spaces, fix it:
```bash
# Remove spaces
sed -i 's/SMTP_PASS=.*/SMTP_PASS=kvxmitjcerfxhgal/' .env
```

---

## Deployment Commands

### Backend (On VPS)

```bash
# 1. Navigate to backend
cd /path/to/backend

# 2. Pull latest code
git pull origin main

# 3. Install dependencies
npm install

# 4. Verify .env file (check SMTP_PASS has no spaces)
grep SMTP_PASS .env

# 5. Restart with PM2
pm2 restart backend
# OR
pm2 start src/server.js --name backend

# 6. Check logs
pm2 logs backend

# 7. Verify SMTP connection
# Should see: "✅ SMTP connection verified successfully"
```

### Frontend

```bash
# 1. Build for production
VITE_API_URL=https://api.ikscbandhan.in npm run build

# 2. Deploy dist/ folder to your hosting
# (Nginx, Vercel, Netlify, etc.)
```

---

## Post-Deployment Verification

1. **Backend Health**: `https://api.ikscbandhan.in/health`
2. **Frontend Loads**: `https://www.ikscbandhan.in`
3. **Complete Quiz Flow**:
   - Take quiz
   - Submit → Email sent
   - Click email link → Email verification page
   - Enter email → Results shown

---

## If Email Not Working

1. Check backend logs: `pm2 logs backend`
2. Verify SMTP_PASS has no spaces
3. Verify App Password is correct (16 chars)
4. Check Gmail 2FA is enabled

---

## If CORS Errors

1. Verify `CORS_ORIGIN` in backend .env matches frontend domain
2. No trailing slashes
3. Restart backend after changing .env
