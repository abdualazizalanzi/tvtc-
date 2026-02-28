# Task Plan: Career Guidance & CV Generator

## Phase 1: Database Schema Updates
- [x] 1.1 Update shared/schema.ts - Add new fields for CV:
  - profileImageUrl (string)
  - bio (text)
  - skills (jsonb - array of strings)
  - languages (jsonb - array of objects {name, level})
  - linkedIn (string)
  - github (string)
  - interests (jsonb - array of strings)
  - careerGoals (text)

## Phase 2: Storage Layer Updates
- [x] 2.1 Update server/storage.ts - Already handles upsert (no changes needed)

## Phase 3: Backend Routes
- [x] 3.1 Update server/routes.ts - Add API endpoints:
  - POST /api/profile - Updated with new fields
  - POST /api/career/analyze - Analyze career interests

## Phase 4: Career Guidance Feature
- [x] 4.1 Create new page: client/src/pages/career-guidance.tsx
- [x] 4.2 Add questions for assessing interests/skills
- [x] 4.3 Add AI analysis to suggest suitable majors
- [x] 4.4 Add navigation link in sidebar

## Phase 5: Profile Page Updates
- [x] 5.1 Update client/src/pages/profile.tsx
- [x] 5.2 Add new fields: photo upload, bio, skills, languages, links
- [ ] 5.3 Add image upload component (future enhancement)

## Phase 6: CV Generator
- [x] 6.1 Create CV generator component
- [x] 6.2 Add CV preview/download functionality
- [x] 6.3 Support Arabic and English formats
- [ ] 6.4 Add PDF export capability (HTML export available)

## Phase 7: Internationalization
- [x] 7.1 Add new translation keys for:
  - Career guidance questions
  - CV fields
  - New profile fields

## Phase 8: Navigation Updates
- [x] 8.1 Update sidebar (app-sidebar.tsx) with new menu items
- [x] 8.2 Add routes in App.tsx

