# Deployment Steps for resultToken Fix

## Step 1: Push to GitHub (if not done yet)

```bash
cd Y:\PRASAD_RATHOD\Backend
git add .
git commit -m "Fix: Resolve MongoDB duplicate key error on resultToken"
git push origin main
```

## Step 2: On Your VPS - Pull Latest Code

```bash
# SSH into your VPS
ssh your-vps-user@your-vps-ip

# Navigate to backend directory
cd /path/to/your/backend

# Pull latest changes
git pull origin main

# Install any new dependencies (if needed)
npm install
```

## Step 3: Run Database Cleanup Script

**IMPORTANT:** This fixes existing documents with null resultToken values.

```bash
# Make sure you're in the backend directory
cd /path/to/your/backend

# Run the cleanup script
node scripts/fix-null-result-tokens.js
```

The script will:
- Connect to MongoDB
- Find all documents with null/missing resultToken
- Generate unique tokens for each
- Update them in the database
- Verify the fix

**Expected Output:**
```
🔌 Connecting to MongoDB...
✅ Connected to MongoDB
🔍 Searching for documents with null resultToken...
📊 Found X documents with null/missing resultToken
🔧 Generating unique tokens and updating documents...
✅ Successfully updated: X
✅ Verification passed: No documents with null/empty resultToken remain
```

## Step 4: Restart Your Backend Application

```bash
# If using PM2:
pm2 restart your-app-name
# Or
pm2 restart all

# If using systemd:
sudo systemctl restart your-service-name

# If running directly with node:
# Stop current process (Ctrl+C) and restart:
npm start
# or
node src/server.js
```

## Step 5: Test the Fix

1. Go to your frontend URL
2. Complete the quiz
3. Submit the email
4. Check if the error is resolved

## Troubleshooting

### If cleanup script fails:
- Check your `.env` file has correct `MONGODB_URI` or `MONGO_URI`
- Verify MongoDB connection is working
- Check collection name matches (default: `divorce_conflict_results`)

### If error still occurs after deployment:
- Check backend logs for errors
- Verify the code was pulled correctly: `git log -1`
- Make sure cleanup script ran successfully
- Check if there are new documents with null tokens (run cleanup again)

### Verify the fix is deployed:
```bash
# Check if pre-save hook exists in Result.js
grep -n "pre-save" src/models/Result.js

# Check if createResult has retry logic
grep -n "retries" src/services/attempt.service.js
```

