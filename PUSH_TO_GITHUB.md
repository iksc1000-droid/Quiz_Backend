# How to Push to GitHub

## Steps to Complete:

### 1. Create Repository on GitHub
1. Go to: https://github.com/new
2. Repository name: `quiz-backend`
3. Choose Public or Private
4. **IMPORTANT**: Do NOT check "Add a README file" (we already have code)
5. Click "Create repository"

### 2. Push Your Code (Choose ONE method):

**Method A - GitHub Desktop (Easiest):**
1. Download: https://desktop.github.com/
2. Open GitHub Desktop
3. File → Add Local Repository → Select `Y:\PRASAD_RATHOD\quizzes\Backend`
4. Publish repository

**Method B - Terminal (After repository is created):**
Run these commands one by one:

```powershell
cd "Y:\PRASAD_RATHOD\quizzes\Backend"

# Add remote (if not already added)
git remote add origin https://github.com/iksc1000-droid/quiz-backend.git

# Push to GitHub
git push -u origin main
```

**Method C - Using GitHub CLI (gh):**
```powershell
cd "Y:\PRASAD_RATHOD\quizzes\Backend"
gh repo create quiz-backend --public --source=. --remote=origin --push
```

### 3. Authentication
If prompted for credentials:
- Username: Your GitHub username
- Password: Use a Personal Access Token (not your password)
- Create token at: https://github.com/settings/tokens

