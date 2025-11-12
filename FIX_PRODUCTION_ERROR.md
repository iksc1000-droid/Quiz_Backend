# Fix Production Error: resultToken Duplicate Key

## Error
```
E11000 duplicate key error collection: demo_test_answer.divorce_conflict_results 
index: resultToken_1 dup key: { resultToken: null }
```

## Problem
Existing records in production database have `null` resultToken values. The code prevents new nulls, but existing ones need to be fixed.

## Solution: Run Cleanup Script on VPS

### Step 1: SSH to VPS
```bash
ssh root@your-vps-ip
cd ~/Quiz_Backend
```

### Step 2: Run Cleanup Script
```bash
node scripts/fix-null-result-tokens.js
```

The script will:
- Find all documents with null resultToken
- Generate unique tokens for each
- Update them in batches
- Verify the fix

### Step 3: Verify Fix
After running the script, you should see:
```
✅ Verification passed: No documents with null/empty resultToken remain
```

### Step 4: Restart Backend
```bash
pm2 restart Quiz_Backend --update-env
```

## Alternative: Manual MongoDB Fix

If the script doesn't work, you can fix it directly in MongoDB:

```javascript
// Connect to MongoDB
use demo_test_answer

// Find all null tokens
db.divorce_conflict_results.find({ resultToken: null }).count()

// Update all null tokens
db.divorce_conflict_results.updateMany(
  { resultToken: null },
  [{ $set: { resultToken: { $concat: ["token_", { $toString: "$_id" }, "_", { $toString: "$$NOW" }] } } }]
)
```

## Prevention
The code now has:
- Pre-save hooks to generate tokens
- Pre-validate hooks as backup
- Explicit token generation before save
- Retry logic for duplicates

This error should not happen again for new records.

