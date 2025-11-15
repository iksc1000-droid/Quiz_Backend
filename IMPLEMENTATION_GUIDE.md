# Complete Implementation Guide - All Quiz Projects

## Status: Backend Configuration ✅ COMPLETE

### Completed:
1. ✅ Updated `quizConfig.js` with all quiz types, landing URLs, and email button URLs
2. ✅ Updated `mailer.js` to use dynamic email button URLs based on quizId

---

## Frontend Implementation Required

For EACH project, the following files need to be updated/created:

### 1. Create `src/lib/api.ts` (if missing)
```typescript
const RAW_API_BASE = import.meta.env.VITE_API_URL;
const API_BASE = (RAW_API_BASE ? String(RAW_API_BASE).trim() : '')
  .replace(/\/+$/, '');

export const apiUrl = (path: string) => {
  const p = path.startsWith('/') ? path : `/${path}`;
  return API_BASE ? `${API_BASE}${p}` : p;
};
```

### 2. Update `src/utils/api.ts`
- Replace with divorce project's api.ts structure
- Update localStorage keys to be quiz-specific
- Update quizId to match project (e.g., 'happiness_index_v1')
- Use `/register` and `/result` endpoints (wrapper routes)

### 3. Update `src/pages/EmailCapturePage.tsx`
- Add email verification from URL params
- Add duplicate email modal
- Add "View Existing Result" functionality
- Update localStorage keys to be quiz-specific
- Update navigation routes to match project

### 4. Create `src/pages/EmailVerificationResults.tsx`
- Copy from divorce project
- Update quizId and localStorage keys
- Update Results component import

### 5. Update `src/pages/ResultsPage.tsx` (or equivalent)
- Add retry logic for backend fetch (3 attempts with exponential backoff)
- Add fallback to localStorage
- Add Explore button with correct landing URL from quizConfig
- Update localStorage keys

### 6. Update `src/App.tsx`
- Add `/results` route with EmailVerificationResults component

### 7. Update `src/pages/PhoneCapturePage.tsx`
- Ensure localStorage keys are quiz-specific
- Ensure navigation goes to question 16

---

## Quiz-Specific Configuration

### localStorage Key Patterns:
- `{quiz-name}-answers`
- `{quiz-name}-gender`
- `{quiz-name}-phone`
- `{quiz-name}-name`
- `{quiz-name}-email`
- `{quiz-name}-token`
- `{quiz-name}-userId`

### Quiz ID Mapping:
- divorce: `divorce_conflict_v1`
- happiness index: `happiness_index_v1`
- pre-marriage preparation: `pre_marriage_prep_v1`
- pre-marriage compatibility: `pre_marriage_compat_v1`
- school-collages students: `career_school_v1`
- senior: `senior_citizen_v1`
- unemployed: `unemployed_career_v1`
- working professionals: `career_working_v1` or `working_professional_v1`
- industry: `industry_v1`
- career-compass-graduation: `career_graduation_v1`

---

## Next Steps

I will now systematically update each project, starting with "happiness index" as the template.

