# VPS Deployment - Quick Fix Guide

## Issue: PM2 Process Name Mismatch

Your PM2 process is named **`Quiz_Backend`**, not `backend`.

## Solution: Restart with Correct Name

```bash
# Restart with correct process name and update environment variables
pm2 restart Quiz_Backend --update-env

# Check status
pm2 status

# View logs to verify SMTP connection
pm2 logs Quiz_Backend --lines 20
```

## Verify SMTP Connection

After restart, you should see in logs:
```
✅ SMTP connection verified successfully
```

If you see this, email is working! ✅

## If SMTP Still Fails

1. Check .env file:
```bash
grep SMTP_PASS .env
# Should show: SMTP_PASS=kvxmitjcerfxhgal (16 chars, NO SPACES)
```

2. If password has spaces, fix it:
```bash
nano .env
# Edit SMTP_PASS line, remove all spaces
# Save: Ctrl+O, Enter, Ctrl+X
```

3. Restart again:
```bash
pm2 restart Quiz_Backend --update-env
```

## PM2 Useful Commands

```bash
# List all processes
pm2 list

# Restart specific process
pm2 restart Quiz_Backend --update-env

# View logs
pm2 logs Quiz_Backend

# Stop process
pm2 stop Quiz_Backend

# Delete process
pm2 delete Quiz_Backend

# Start process
pm2 start src/server.js --name Quiz_Backend
```

