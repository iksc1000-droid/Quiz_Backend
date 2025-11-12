# Email Troubleshooting Guide

## Problem: Customers Not Receiving Emails

### Quick Diagnosis

1. **Check Backend Logs** for email errors:
   ```bash
   # On VPS:
   pm2 logs | grep -i email
   # OR
   tail -f logs/app.log | grep -i email
   ```

2. **Test Email Configuration** using the test endpoint:
   ```bash
   curl -X POST http://localhost:5000/test-email \
     -H "Content-Type: application/json" \
     -d '{"to": "your-email@gmail.com"}'
   ```

### Common Issues & Solutions

#### 1. **SMTP Password Has Spaces** ⚠️ MOST COMMON

**Problem:**
```env
SMTP_PASS=sfhh gdsb tgzg ywxj  ← SPACES!
```

**Solution:**
```env
SMTP_PASS=sfhhgdsbtgzgywxj  ← NO SPACES!
```

**Fix on VPS:**
```bash
nano .env
# Remove all spaces from SMTP_PASS
# Save and restart: pm2 restart all
```

#### 2. **Gmail App Password Not Set Up**

**Requirements:**
- ✅ Gmail account must have 2-Factor Authentication enabled
- ✅ App Password must be generated (not regular password)
- ✅ App Password is 16 characters, NO SPACES

**Generate App Password:**
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Name it: "IKSC Bandhan Backend"
4. Copy the 16-character password (no spaces)
5. Update `.env`: `SMTP_PASS=your16charpassword`

#### 3. **Wrong Environment Variables**

**Check `.env` file has:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=ikscbandhan@gmail.com
SMTP_PASS=your16charapppassword  # NO SPACES!
FROM_EMAIL=ikscbandhan@gmail.com
FROM_NAME=IKSC Bandhan
```

#### 4. **Email Being Sent But Going to Spam**

- Check spam/junk folder
- Verify sender reputation
- Check email content (avoid spam trigger words)

#### 5. **Backend Not Restarted After .env Changes**

**After fixing `.env`:**
```bash
pm2 restart all
# OR
sudo systemctl restart your-service-name
```

### Testing Email Configuration

#### Method 1: Use Test Endpoint

```bash
# Test from command line:
curl -X POST http://localhost:5000/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "iksc1000@gmail.com"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Test email sent successfully",
  "messageId": "..."
}
```

#### Method 2: Check Backend Logs

After quiz submission, check logs for:
- ✅ `✅ Welcome email sent to [email]` - Success!
- ❌ `❌ Failed to send welcome email` - Check error details

### Error Messages & Solutions

| Error Message | Solution |
|--------------|----------|
| `Invalid login` | Check SMTP_USER and SMTP_PASS are correct |
| `Authentication failed` | Verify App Password (not regular password) |
| `Connection timeout` | Check internet connection, firewall settings |
| `535-5.7.8 Username and Password not accepted` | App Password required, not regular password |
| `550-5.7.1 Message rejected` | Gmail blocking - check sender reputation |

### Verification Checklist

- [ ] `.env` file has correct SMTP credentials
- [ ] `SMTP_PASS` has NO SPACES
- [ ] Gmail 2FA is enabled
- [ ] App Password is generated (16 chars, no spaces)
- [ ] Backend restarted after `.env` changes
- [ ] Test endpoint works: `POST /test-email`
- [ ] Backend logs show email sent successfully
- [ ] Check spam folder if email not received

### Debugging Steps

1. **Check SMTP Connection:**
   ```bash
   # Test endpoint will verify connection
   curl -X POST http://localhost:5000/test-email
   ```

2. **Check Backend Logs:**
   ```bash
   pm2 logs | grep -i "email\|mail\|smtp"
   ```

3. **Verify Environment Variables:**
   ```bash
   # On VPS, check .env file:
   cat .env | grep SMTP
   ```

4. **Test Email Manually:**
   ```bash
   # Use the test endpoint with your email
   curl -X POST http://your-domain.com/test-email \
     -H "Content-Type: application/json" \
     -d '{"to": "your-email@gmail.com"}'
   ```

### Quick Fix Script

If emails are failing, run this on VPS:

```bash
# 1. Check .env file
echo "Checking SMTP_PASS..."
grep SMTP_PASS .env

# 2. If password has spaces, fix it:
# Edit .env and remove spaces from SMTP_PASS

# 3. Restart backend
pm2 restart all

# 4. Test email
curl -X POST http://localhost:5000/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "iksc1000@gmail.com"}'
```

### Still Not Working?

1. Check backend logs for exact error message
2. Verify Gmail App Password is correct
3. Test SMTP connection using test endpoint
4. Check if emails are in spam folder
5. Verify FROM_EMAIL matches SMTP_USER

---

**Last Updated:** $(date)
**Status:** Ready for troubleshooting

