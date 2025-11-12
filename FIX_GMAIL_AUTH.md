# Fix Gmail Authentication Error (535-5.7.8)

## Error Message
```
535-5.7.8 Username and Password not accepted
```

## Root Cause
Gmail is rejecting the App Password. This usually means:
1. **App Password is incorrect/expired** (most common)
2. **App Password was revoked** (if you regenerated 2FA or changed security settings)
3. **2FA is not enabled** on the Gmail account
4. **Account has security restrictions**

## Solution: Generate a New Gmail App Password

### Step 1: Enable 2FA (if not already enabled)
1. Go to: https://myaccount.google.com/security
2. Under "Signing in to Google", click **2-Step Verification**
3. Follow the prompts to enable 2FA

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
   - Or: Google Account → Security → 2-Step Verification → App passwords
2. Select app: **Mail**
3. Select device: **Other (Custom name)** → Enter "IKSC Backend"
4. Click **Generate**
5. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)
6. **Remove all spaces** → Should be: `abcdefghijklmnop`

### Step 3: Update .env File
```bash
SMTP_PASS=abcdefghijklmnop  # 16 characters, NO SPACES
```

### Step 4: Restart Backend
```bash
npm run dev
```

## Verify It Works
After restarting, you should see:
```
✅ SMTP connection verified successfully
```

If you still see errors, check:
- Password has exactly 16 characters (no spaces)
- 2FA is enabled on the account
- App Password was generated for "Mail" app
- No extra spaces or newlines in .env file

## Common Mistakes
❌ **Wrong:** `SMTP_PASS=abcd efgh ijkl mnop` (with spaces)  
✅ **Correct:** `SMTP_PASS=abcdefghijklmnop` (no spaces)

❌ **Wrong:** Using regular Gmail password  
✅ **Correct:** Using App Password (16 chars, generated from Google Account)

❌ **Wrong:** 2FA not enabled  
✅ **Correct:** 2FA must be enabled to use App Passwords

