# Firebase + Netlify Deployment Plan

## Overview
This plan outlines the steps to:
1. Migrate from SQLite to Firebase Firestore (no SQL)
2. Switch from Replit Auth to Firebase Authentication
3. Deploy to Netlify

---

## Phase 1: Firebase Firestore Setup

### 1.1 Create Firestore Schema
- [ ] Create `server/firebase-db.ts` - Firebase Firestore initialization
- [ ] Create `server/firebase-storage.ts` - Firestore CRUD operations for all collections:
  - `users` - User accounts
  - `studentProfiles` - Student profiles
  - `activities` - Activities/achievements
  - `courses` - Course catalog
  - `courseLessons` - Course content
  - `courseQuizzes` - Quizzes
  - `quizQuestions` - Quiz questions
  - `quizAttempts` - Quiz attempts
  - `courseEnrollments` - User enrollments
  - `certificates` - Issued certificates
  - `auditLogs` - Activity logs

### 1.2 Create Firebase Storage Layer
- [ ] Replace `server/storage.ts` with Firestore-based implementation
- [ ] Create `server/firebase-models/` - Type definitions for Firestore documents
- [ ] Implement data migration utilities

---

## Phase 2: Firebase Authentication

### 2.1 Client-side Auth
- [ ] Update `client/src/lib/firebase.ts` - Ensure complete Firebase setup
- [ ] Create `client/src/lib/firebase-auth.ts` - Firebase authentication utilities
- [ ] Update `client/src/hooks/use-auth.ts` - Use Firebase Auth instead of session-based auth
- [ ] Create login/signup pages using Firebase Auth

### 2.2 Server-side Auth
- [ ] Update `server/replit_integrations/auth/replitAuth.ts` - Replace with Firebase token verification
- [ ] Create middleware `server/middleware/auth.ts` - Verify Firebase ID tokens
- [ ] Update all routes to use Firebase token verification

---

## Phase 3: Netlify Deployment Configuration

### 3.1 Netlify Configuration
- [ ] Create `netlify.toml` - Netlify build and deploy configuration
- [ ] Create `netlify/functions/` - Serverless functions (if needed)
- [ ] Update `vite.config.ts` - Ensure proper build output
- [ ] Create `vercel.json` or handle redirects properly

### 3.2 Environment Variables
- [ ] Document required environment variables:
  - `FIREBASE_API_KEY`
  - `FIREBASE_AUTH_DOMAIN`
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_STORAGE_BUCKET`
  - `FIREBASE_MESSAGING_SENDER_ID`
  - `FIREBASE_APP_ID`
  - `FIREBASE_PRIVATE_KEY` (for Admin SDK)
  - `FIREBASE_CLIENT_EMAIL` (for Admin SDK)

### 3.3 Build Configuration
- [ ] Update `package.json` scripts for Netlify
- [ ] Configure proper CORS for Firebase
- [ ] Handle static file serving

---

## Phase 4: Testing & Migration

### 4.1 Data Migration (Optional)
- [ ] Create migration script to export SQLite data to Firestore
- [ ] Test data integrity after migration

### 4.2 Testing
- [ ] Test authentication flow
- [ ] Test all CRUD operations
- [ ] Test deployed version on Netlify

---

## Implementation Priority

1. **Priority 1**: Set up Firebase Firestore connection
2. **Priority 2**: Implement Firebase Auth on client
3. **Priority 3**: Update server to verify Firebase tokens
4. **Priority 4**: Create Firestore storage layer
5. **Priority 5**: Configure Netlify deployment
6. **Priority 6**: Test and verify

---

## Files to Modify/Create

### New Files:
- `server/firebase-db.ts`
- `server/firebase-storage.ts`
- `client/src/lib/firebase-auth.ts`
- `netlify.toml`

### Modified Files:
- `server/routes.ts` - Update auth middleware
- `client/src/hooks/use-auth.ts` - Firebase Auth
- `client/src/App.tsx` - Auth flow updates
- `vite.config.ts` - Build config
- `package.json` - Scripts

---

## Notes

- Firebase Firestore is a NoSQL document database
- Authentication will use Firebase Auth (email/password, Google, etc.)
- Netlify can host the React frontend and use Netlify Functions or a separate server
- For a full Express backend on Netlify, consider using Netlify Functions or the Netlify Edge

