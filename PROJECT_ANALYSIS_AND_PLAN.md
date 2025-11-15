# Divorce Project Analysis & Implementation Plan for All Quiz Projects

## 📋 Executive Summary
This document analyzes the divorce project implementation and creates a plan to replicate all features across 8 other quiz projects with 100% accuracy.

---

## 🎯 Quiz Projects List

### Active Quiz Projects:
1. **divorce** (conflict-resolution-quiz.ikscbandhan.in) ✅ **COMPLETE - REFERENCE**
2. **happiness index** (marriage-happiness-index.ikscbandhan.in)
3. **pre-marriage preparation** (pre-marriage-preparation.ikscbandhan.in)
4. **pre-marriage compatibility** (pre-marriage-compatibility.ikscbandhan.in)
5. **school-collages students** (career-compass-school-collage.ikscbandhan.in)
6. **senior** (wisdom-seniors.ikscbandhan.in)
7. **unemployed** (career-compass-working-professional.ikscbandhan.in - unemployed)
8. **working professionals** (career-compass-working-professional.ikscbandhan.in)
9. **industry** (industry.ikscbandhan.in)
10. **career-compass-graduation** (career-compass-graduation.ikscbandhan.in)

---

## ✅ DIVORCE PROJECT - Complete Feature List

### **Frontend Features:**

#### 1. **Routing Structure** (`App.tsx`)
- ✅ Landing Page (`/`)
- ✅ Gender Selection (`/gender`)
- ✅ Quiz Questions (`/conflict-resolution-quiz/:questionId`) - 30 questions
- ✅ Interlude Page (`/divorce-interlude/:stage`) - After question 15
- ✅ Phone Capture (`/phone-capture`) - After question 15
- ✅ Email Capture (`/divorce-email`) - After question 30
- ✅ Loading Page (`/divorce-loading`)
- ✅ Results Page (`/conflict-resolution-results`)
- ✅ Email Verification Results (`/results`) - For email link access
- ✅ Thank You Page (`/thank-you`)

#### 2. **Quiz Flow Logic**
- ✅ 30 questions total
- ✅ Phone capture after question 15
- ✅ Email & Name capture after question 30
- ✅ Auto-save answers to localStorage
- ✅ Gender-based image display
- ✅ Progress tracking
- ✅ Answer normalization (Format A: questionId, selectedOption, score, discMapping, wpdMapping)

#### 3. **Phone Capture Page** (`PhoneCapturePage.tsx`)
- ✅ Indian mobile validation (10 digits, starts with 6-9)
- ✅ Real-time validation feedback
- ✅ Privacy statement
- ✅ Progress indicator (50% complete)
- ✅ Saves to localStorage: `conflict-resolution-phone`

#### 4. **Email Capture Page** (`EmailCapturePage.tsx`)
- ✅ Two-step form: Name → Email
- ✅ Email validation
- ✅ Duplicate email detection modal
- ✅ "View Existing Result" option
- ✅ "Use Different Email" option
- ✅ **Email link verification** - Checks URL params for email/token
- ✅ Auto-verifies and shows results if email in URL
- ✅ Shows loading state during verification
- ✅ Error handling with fallback to manual entry
- ✅ Saves to localStorage: `conflict-resolution-name`, `conflict-resolution-email`

#### 5. **Results Page** (`ConflictResolutionResults.tsx`)
- ✅ Fetches results from backend API (`/user/:email?quizId=...`)
- ✅ Retry logic (3 attempts with exponential backoff)
- ✅ Falls back to localStorage if backend unavailable
- ✅ Comprehensive result visualization:
  - Relationship Health Assessment (6 parameters: A-F)
  - Parameter selection menu
  - Detailed insights per parameter
  - Relationship Skills Progress chart
  - Relationship Dynamics Radar chart
  - Strength & Growth section
  - Archetype display
  - Complete Conflict Resolution Analysis
- ✅ **Explore Button** - Links to landing page
- ✅ 5% unlocked / 95% remaining marketing message

#### 6. **API Integration** (`utils/api.ts`)
- ✅ `submitTestData()` function:
  - Step 1: Register user (`/register`)
  - Step 2: Submit answers (`/result`)
  - Handles duplicate email (409 status)
  - Timeout handling (30 seconds)
  - Error handling with user-friendly messages
- ✅ Data validation before submission
- ✅ Answer normalization to Format A
- ✅ Stores userId, email in localStorage

#### 7. **Data Storage** (`utils/storage.ts`)
- ✅ localStorage keys:
  - `conflict-resolution-answers`
  - `conflict-resolution-gender`
  - `conflict-resolution-phone`
  - `conflict-resolution-name`
  - `conflict-resolution-email`
  - `conflict-resolution-token`
  - `conflict-resolution-userId`

#### 8. **Context & State Management**
- ✅ `TestContext.tsx` - Global state management
- ✅ `setupRefreshDetection()` - Clears data on refresh

#### 9. **Email Verification Results** (`EmailVerificationResults.tsx`)
- ✅ Email input form
- ✅ Token support
- ✅ Auto-verification from URL params
- ✅ Shows `ConflictResolutionResults` when verified

---

### **Backend Features:**

#### 1. **Quiz Configuration** (`config/quizConfig.js`)
- ✅ Quiz-specific configs (category, color, emoji, branding)
- ✅ `getQuizConfig(quizId)` - Maps quizId to config
- ✅ Supports: divorce, happiness-index, pre-marriage-prep, etc.

#### 2. **Email Service** (`config/mailer.js`)
- ✅ `sendWelcomeEmail()` - Sends personalized email
- ✅ Dynamic email template based on quiz type
- ✅ **Button URL**: `https://conflict-resolution-quiz.ikscbandhan.in/divorce-email`
- ✅ Includes quiz-specific branding, colors, emojis
- ✅ Includes topCategory in email summary

#### 3. **API Endpoints** (`controllers/quiz.controller.js`)
- ✅ `POST /register` - User registration
  - Validates email, name, phone, gender
  - Checks for duplicate email (409 status)
  - Creates/updates user attempt
- ✅ `POST /result` - Finalize quiz attempt
  - Normalizes answers (Format A)
  - Calculates scores
  - Calculates topCategory (quiz-specific)
  - Creates result record
  - Sends welcome email (non-blocking)
  - Sends owner notification (non-blocking)
- ✅ `GET /user/:email` - Get results by email
  - Supports quizId query parameter
  - Supports token query parameter
  - Multiple query strategies (exact match, case-insensitive)
  - Returns result data with answers

#### 4. **Database Models** (`models/`)
- ✅ Dynamic model factory based on quizId
- ✅ Separate collections per quiz type
- ✅ Result model stores: email, quizId, name, phone, summary, raw answers

#### 5. **Data Flow**
- ✅ Registration → Answer Submission → Result Creation → Email Sending
- ✅ All data stored in MongoDB
- ✅ Duplicate detection at registration stage

---

## ❌ MISSING FEATURES IN OTHER PROJECTS

### **Common Missing Features Across All Projects:**

1. **Email Link Verification**
   - ❌ No email/token verification from URL params
   - ❌ No auto-loading results from email link
   - ❌ Missing `EmailVerificationResults` component

2. **Email Capture Page Enhancements**
   - ❌ No duplicate email modal
   - ❌ No "View Existing Result" option
   - ❌ No email verification from URL

3. **Results Page Features**
   - ❌ Missing retry logic for backend fetch
   - ❌ Missing fallback to localStorage
   - ❌ Missing comprehensive result visualization
   - ❌ Missing parameter-based insights
   - ❌ Missing Explore button with correct landing URL

4. **API Integration**
   - ❌ Incomplete error handling
   - ❌ Missing timeout handling
   - ❌ Missing duplicate email detection handling

5. **Backend Email Configuration**
   - ❌ Email button URLs not configured per quiz
   - ❌ Missing quiz-specific email templates
   - ❌ Missing landing page URL mapping

6. **Quiz-Specific Configuration**
   - ❌ Missing quizId mapping in frontend
   - ❌ Missing quiz-specific localStorage keys
   - ❌ Missing quiz-specific routes

---

## 🗺️ QUIZ → LANDING PAGE URL MAPPING

| Quiz Project | Quiz Domain | Landing Page URL | Quiz ID (Backend) |
|-------------|-------------|------------------|-------------------|
| divorce | conflict-resolution-quiz.ikscbandhan.in | N/A (no explore button) | `divorce_conflict_v1` |
| happiness index | marriage-happiness-index.ikscbandhan.in | happiness-index-landing.ikscbandhan.in | `happiness_index_v1` |
| pre-marriage preparation | pre-marriage-preparation.ikscbandhan.in | pre-marriage-preparation-landing.ikscbandhan.in | `pre_marriage_prep_v1` |
| pre-marriage compatibility | pre-marriage-compatibility.ikscbandhan.in | pre-marriage-compatibility-landing.ikscbandhan.in | `pre_marriage_compat_v1` |
| school-collages students | career-compass-school-collage.ikscbandhan.in | school-student-landing.ikscbandhan.in | `career_school_v1` |
| senior | wisdom-seniors.ikscbandhan.in | wisdom-landing.ikscbandhan.in | `senior_citizen_v1` |
| unemployed | career-compass-working-professional.ikscbandhan.in | professional-landing.ikscbandhan.in | `unemployed_career_v1` |
| working professionals | career-compass-working-professional.ikscbandhan.in | professional-landing.ikscbandhan.in | `career_working_v1` |
| industry | industry.ikscbandhan.in | industry-landing.ikscbandhan.in | `industry_v1` |
| career-compass-graduation | career-compass-graduation.ikscbandhan.in | happiness-index-landing.ikscbandhan.in | `career_graduation_v1` |

---

## 📧 EMAIL BUTTON URL MAPPING

Each quiz needs its own email button URL pointing to its specific email capture page:

| Quiz Project | Email Button URL |
|-------------|------------------|
| divorce | https://conflict-resolution-quiz.ikscbandhan.in/divorce-email |
| happiness index | https://marriage-happiness-index.ikscbandhan.in/happiness-index-email |
| pre-marriage preparation | https://pre-marriage-preparation.ikscbandhan.in/bandhan-email |
| pre-marriage compatibility | TBD |
| school-collages students | TBD |
| senior | TBD |
| unemployed | TBD |
| working professionals | TBD |
| industry | TBD |
| career-compass-graduation | TBD |

---

## 🎯 IMPLEMENTATION PLAN

### **Phase 1: Backend Configuration** (All Projects)

1. **Update `quizConfig.js`**
   - ✅ Add all quiz types with correct quizId mappings
   - ✅ Add landing page URLs for Explore buttons
   - ✅ Add email button URLs for each quiz

2. **Update `mailer.js`**
   - ✅ Make email button URL dynamic based on quizId
   - ✅ Map quizId to correct subdomain and route

3. **Verify Backend Endpoints**
   - ✅ Ensure `/register` handles all quiz types
   - ✅ Ensure `/result` handles all quiz types
   - ✅ Ensure `/user/:email` handles all quiz types

### **Phase 2: Frontend - Core Features** (Per Project)

For EACH quiz project:

1. **Update `App.tsx` Routing**
   - ✅ Add `/results` route with `EmailVerificationResults` component
   - ✅ Ensure all routes match divorce project structure

2. **Update `EmailCapturePage.tsx`**
   - ✅ Add email verification from URL params
   - ✅ Add duplicate email modal
   - ✅ Add "View Existing Result" functionality
   - ✅ Update localStorage keys to be quiz-specific

3. **Create/Update `EmailVerificationResults.tsx`**
   - ✅ Copy from divorce project
   - ✅ Update quizId and API calls

4. **Update `Results Page`**
   - ✅ Add retry logic for backend fetch
   - ✅ Add fallback to localStorage
   - ✅ Add Explore button with correct landing URL
   - ✅ Update quiz-specific result visualization

5. **Update `api.ts`**
   - ✅ Ensure quizId is passed correctly
   - ✅ Update localStorage keys to be quiz-specific
   - ✅ Add proper error handling

6. **Update `PhoneCapturePage.tsx`**
   - ✅ Ensure it navigates to correct question number (16)
   - ✅ Update localStorage keys

7. **Update All localStorage Keys**
   - ✅ Make keys quiz-specific (e.g., `happiness-index-answers` instead of `conflict-resolution-answers`)

### **Phase 3: Testing** (Per Project)

1. ✅ Test complete flow: Landing → Gender → Quiz (1-15) → Phone → Quiz (16-30) → Email → Results
2. ✅ Test email link verification
3. ✅ Test duplicate email detection
4. ✅ Test results page with backend data
5. ✅ Test results page fallback to localStorage
6. ✅ Test Explore button navigation
7. ✅ Verify email sending with correct button URL

---

## 🔧 TECHNICAL IMPLEMENTATION DETAILS

### **1. Quiz-Specific localStorage Keys**

Each project needs unique localStorage keys:
- `{quiz-name}-answers`
- `{quiz-name}-gender`
- `{quiz-name}-phone`
- `{quiz-name}-name`
- `{quiz-name}-email`
- `{quiz-name}-token`
- `{quiz-name}-userId`

### **2. Quiz ID Mapping**

Backend quizId format:
- `divorce_conflict_v1`
- `happiness_index_v1`
- `pre_marriage_prep_v1`
- `pre_marriage_compat_v1`
- `career_school_v1`
- `senior_citizen_v1`
- `unemployed_career_v1`
- `career_working_v1`
- `industry_v1`
- `career_graduation_v1`

### **3. Email Button URL Logic**

```javascript
const getEmailButtonUrl = (quizId) => {
  const urlMap = {
    'divorce_conflict_v1': 'https://conflict-resolution-quiz.ikscbandhan.in/divorce-email',
    'happiness_index_v1': 'https://marriage-happiness-index.ikscbandhan.in/happiness-index-email',
    'pre_marriage_prep_v1': 'https://pre-marriage-preparation.ikscbandhan.in/bandhan-email',
    // ... add all mappings
  };
  return urlMap[quizId] || `${config.branding.site}/results?quiz=${quizId}`;
};
```

### **4. Landing Page URL Logic**

```javascript
const getLandingPageUrl = (quizId) => {
  const urlMap = {
    'happiness_index_v1': 'https://happiness-index-landing.ikscbandhan.in',
    'pre_marriage_prep_v1': 'https://pre-marriage-preparation-landing.ikscbandhan.in',
    // ... add all mappings
  };
  return urlMap[quizId] || '#';
};
```

---

## ✅ SUCCESS CRITERIA

For each project to be considered complete:

1. ✅ 30 questions with phone capture after Q15
2. ✅ Email & name capture after Q30
3. ✅ Results stored in MongoDB correctly
4. ✅ Email sent with correct button URL
5. ✅ Email button opens correct email capture page
6. ✅ Email link verification works
7. ✅ Duplicate email detection works
8. ✅ Results page shows comprehensive results
9. ✅ Explore button links to correct landing page
10. ✅ All localStorage keys are quiz-specific
11. ✅ All API calls include correct quizId
12. ✅ Error handling matches divorce project

---

## 📝 NEXT STEPS

1. **Review this document** - Confirm all requirements
2. **Start with one project** - Begin with "happiness index" as pilot
3. **Test thoroughly** - Ensure 100% feature parity
4. **Replicate to others** - Apply same changes to remaining projects
5. **Final verification** - Test all projects end-to-end

---

**Document Created:** 2025-01-16
**Status:** Ready for Implementation

