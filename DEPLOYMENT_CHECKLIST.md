# Deployment Readiness Checklist

## Issues Fixed After Previous Deployment

### 1. ✅ MongoDB Duplicate Key Error (resultToken)
- **Issue**: `E11000 duplicate key error` for null resultToken
- **Fix**: Added pre-save/pre-validate hooks, explicit generation, retry logic
- **Status**: RESOLVED

### 2. ✅ Email Not Sending
- **Issue**: SMTP authentication failed
- **Root Causes**:
  - Password had spaces (fixed)
  - App Password expired/revoked (fixed)
- **Fix**: Removed spaces, updated App Password, improved error logging
- **Status**: RESOLVED

### 3. ✅ Data Replacement Issue
- **Issue**: Old user data being replaced instead of preserved
- **Fix**: Changed `createOrUpdateUser` to only update missing fields
- **Status**: RESOLVED

### 4. ✅ Unnecessary Username/Password Generation
- **Issue**: System generating username/password unnecessarily
- **Fix**: Removed all username/password generation and storage
- **Status**: RESOLVED

### 5. ✅ Email Category Display
- **Issue**: Email showing "Personal Growth" instead of actual category
- **Fix**: Calculate topCategory from quiz results
- **Status**: RESOLVED

### 6. ✅ Email Verification Results Page
- **Issue**: Need email verification before showing results
- **Fix**: Created EmailVerificationResults page
- **Status**: RESOLVED

---

## Pre-Deployment Checklist

### Backend Environment Variables (.env)

**Required Variables:**
```env
# MongoDB
MONGO_URI_SOURCE=mongodb+srv://...
MONGO_URI_RESULTS=mongodb+srv://...

# Server
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://www.ikscbandhan.in

# SMTP (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=ikscbandhan@gmail.com
SMTP_PASS=kvxmitjcerfxhgal  # NO SPACES - 16 characters
FROM_EMAIL=ikscbandhan@gmail.com
FROM_NAME=IKSC Bandhan

# Frontend URL (for email links)
BRAND_SITE=https://www.ikscbandhan.in

# Quiz Configuration
QUIZ_ID=divorce_conflict_v1
QUIZ_COLLECTION=divorce conflict
```

**Critical Checks:**
- ✅ `SMTP_PASS` has NO spaces (16 characters)
- ✅ `CORS_ORIGIN` matches your frontend domain
- ✅ `BRAND_SITE` matches your frontend domain (not backend)
- ✅ `NODE_ENV=production` for production
- ✅ MongoDB URIs are correct and accessible

### Frontend Environment Variables

**Required in `.env` or build-time:**
```env
VITE_API_URL=https://api.ikscbandhan.in
# OR
VITE_API_URL=https://www.ikscbandhan.in/api
```

**Critical Checks:**
- ✅ `VITE_API_URL` points to your backend API
- ✅ No hardcoded localhost URLs
- ✅ API URL is accessible from frontend domain

### CORS Configuration

**Backend (`src/config/env.js`):**
- ✅ `CORS_ORIGIN` includes your frontend domain
- ✅ Supports multiple origins if needed (comma-separated)
- ✅ No wildcard `*` in production

### Email Configuration

**Verification Steps:**
1. ✅ Gmail App Password is correct (16 chars, no spaces)
2. ✅ 2FA is enabled on Gmail account
3. ✅ App Password generated for "Mail" app
4. ✅ Test email sending works before deployment

### Database

**Verification:**
- ✅ MongoDB connection strings are correct
- ✅ Database is accessible from VPS
- ✅ Collections exist and are accessible
- ✅ Indexes are created (resultToken unique index)

### Error Handling

**Production Safety:**
- ✅ No stack traces exposed in production responses
- ✅ Error messages are user-friendly
- ✅ Sensitive data (passwords, tokens) not logged
- ✅ Proper error codes returned

### Security

**Checks:**
- ✅ Helmet.js enabled (security headers)
- ✅ Rate limiting configured
- ✅ CORS properly configured
- ✅ No sensitive data in code (all in .env)
- ✅ `.env` file not committed to git

---

## Deployment Steps

### Backend Deployment

1. **SSH to VPS**
2. **Navigate to backend directory**
3. **Pull latest code**: `git pull origin main`
4. **Install dependencies**: `npm install`
5. **Update .env file** with production values
6. **Verify .env**:
   ```bash
   # Check SMTP password has no spaces
   grep SMTP_PASS .env
   # Should show: SMTP_PASS=kvxmitjcerfxhgal (16 chars, no spaces)
   ```
7. **Test SMTP connection**:
   ```bash
   node -e "require('dotenv').config(); const {createMailer} = require('./src/config/mailer.js'); const t = createMailer(); t.verify().then(() => console.log('✅ SMTP OK')).catch(e => console.error('❌ SMTP Error:', e.message));"
   ```
8. **Restart PM2**: `pm2 restart backend` or `pm2 start src/server.js --name backend`
9. **Check logs**: `pm2 logs backend`
10. **Verify**: Check for "✅ SMTP connection verified successfully"

### Frontend Deployment

1. **Build for production**:
   ```bash
   npm run build
   ```
2. **Verify build**:
   - Check `dist/` folder exists
   - No errors in build output
3. **Set environment variable**:
   ```bash
   # In .env.production or build command
   VITE_API_URL=https://api.ikscbandhan.in npm run build
   ```
4. **Deploy dist/ folder** to your hosting (Nginx, Vercel, Netlify, etc.)
5. **Verify**:
   - Frontend loads correctly
   - API calls work (check browser console)
   - Email verification page works

---

## Post-Deployment Verification

### Backend Tests

1. **Health Check**: `GET https://api.ikscbandhan.in/health`
2. **SMTP Test**: `POST https://api.ikscbandhan.in/test-email` (if enabled)
3. **Check logs**: Verify no errors on startup

### Frontend Tests

1. **Load homepage**: Should load without errors
2. **Complete quiz flow**: 
   - Take quiz
   - Submit answers
   - Verify email sent
   - Click email link
   - Enter email
   - View results
3. **Check console**: No API errors

### Integration Tests

1. **Email Flow**:
   - Complete quiz → Email sent
   - Click email button → Opens verification page
   - Enter email → Results shown
2. **Data Persistence**:
   - Complete quiz → Data saved
   - Refresh page → Data preserved
   - Complete again with same email → Data preserved (not replaced)

---

## Common Issues & Solutions

### Issue: Email Not Sending
**Check:**
- SMTP_PASS has no spaces
- App Password is correct
- 2FA enabled on Gmail
- Check backend logs for SMTP errors

### Issue: CORS Error
**Check:**
- CORS_ORIGIN in backend .env matches frontend domain
- Frontend making requests to correct API URL
- No trailing slashes in URLs

### Issue: API 404 Errors
**Check:**
- VITE_API_URL is set correctly
- Backend routes are correct
- Backend is running and accessible

### Issue: Results Not Found
**Check:**
- Email verification working
- Database connection working
- Results saved correctly (check database)

---

## Rollback Plan

If deployment fails:

1. **Backend**: `pm2 restart backend` (previous version)
2. **Frontend**: Deploy previous build
3. **Database**: No changes needed (backward compatible)

---

## Support

If issues persist:
1. Check PM2 logs: `pm2 logs backend`
2. Check browser console for frontend errors
3. Check backend logs for API errors
4. Verify all environment variables are set correctly

