# Fix for MongoDB Duplicate Key Error on resultToken

## Problem
The application was failing with this error:
```
E11000 duplicate key error collection: demo_test_answer.divorce_conflict_results 
index: resultToken_1 dup key: { resultToken: null }
```

This occurred because some documents in the database had `resultToken: null`, and when trying to insert a new document with a null token, MongoDB's unique index rejected it.

## Solution

### ✅ Part 1: Code Fix (Done Locally)
I've implemented a comprehensive, multi-layered solution to ensure `resultToken` is always generated:

1. **Updated `src/models/Result.js`**:
   - Added **pre-save hook** to ensure `resultToken` is always set before saving
   - Added **pre-validate hook** as an additional safety layer
   - Removed `unique: true` from field definition (index handles uniqueness)
   - Made `resultToken` required
   - Kept the default function as a fallback
   - Created unique index with partial filter expression (allows multiple nulls, unique non-nulls)

2. **Updated `src/services/attempt.service.js`**:
   - Added **duplicate result check** to prevent creating multiple results for same attempt
   - Added **explicit `resultToken` generation** with fallback mechanism
   - Added **retry logic** (3 attempts) for duplicate key errors
   - Added **comprehensive error logging** with detailed context
   - Validates token is not empty before saving

### ⚠️ Part 2: Database Cleanup (Must be done on VPS)

You need to run the cleanup script on your VPS to fix existing documents with null `resultToken` values.

#### Steps to Run on VPS:

1. **Deploy the updated code** to your VPS (push the changes)

2. **SSH into your VPS** and navigate to your backend directory

3. **Run the cleanup script**:
   ```bash
   node scripts/fix-null-result-tokens.js
   ```

   This script will:
   - Find all documents with null/missing `resultToken`
   - Generate unique tokens for each
   - Update them in the database
   - Verify the fix

4. **Restart your application** after the cleanup:
   ```bash
   # If using PM2:
   pm2 restart your-app-name
   
   # Or if using systemd:
   sudo systemctl restart your-service-name
   ```

## What the Fix Does

### Defense in Depth Strategy:
1. **Pre-validate hook**: Ensures token exists before validation
2. **Pre-save hook**: Double-checks and generates token if missing
3. **Explicit generation**: Service layer explicitly sets token
4. **Retry mechanism**: Handles rare duplicate token collisions
5. **Duplicate prevention**: Checks for existing results before creating

### Benefits:
- **Prevents future issues**: New result documents will always have a valid `resultToken` through multiple safeguards
- **Fixes existing data**: The cleanup script updates all existing documents with null tokens
- **Maintains uniqueness**: The partial index ensures uniqueness only for non-null values
- **Handles edge cases**: Retry logic and fallback token generation handle rare scenarios
- **Prevents duplicates**: Checks for existing results to avoid duplicate creation

## Testing

After deploying and running the cleanup:
1. Try submitting a quiz result again
2. The error should no longer occur
3. Check the logs to confirm `resultToken` is being generated

## Notes

- The cleanup script is safe to run multiple times (it only updates documents with null tokens)
- The script connects using your `MONGODB_URI` environment variable
- Make sure your `.env` file on the VPS has the correct database connection string

