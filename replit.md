# Skill Record (السجل المهاري)

## Overview
A bilingual (Arabic/English) web platform for documenting non-academic skills and activities for university students. Students can log volunteer work, courses, leadership roles, and more — supervised by university staff.

## Architecture
- **Frontend**: React + Vite + Tailwind CSS + Shadcn UI + wouter routing
- **Backend**: Express.js + Drizzle ORM + PostgreSQL
- **Auth**: Replit Auth (OpenID Connect) - handles login/logout/sessions
- **i18n**: Custom React context (client/src/lib/i18n.tsx) with AR/EN translations

## Key Directories
- `client/src/pages/` - React pages (landing, dashboard, activities, courses, review)
- `client/src/components/` - Reusable components (sidebar, language toggle, theme provider)
- `client/src/lib/` - Utilities (queryClient, i18n, auth-utils)
- `server/` - Express backend (routes, storage, db, seed)
- `server/replit_integrations/auth/` - Replit Auth integration
- `shared/` - Schema types shared between frontend and backend

## Database Schema
- `users` + `sessions` (Replit Auth)
- `student_profiles` - Extended student info (studentId, trainingId, phone, major, role)
- `activities` - Activity submissions with status workflow (draft→submitted→under_review→approved/rejected)
- `courses` - Training courses catalog
- `course_enrollments` - Student course registrations

## API Routes
- `GET /api/auth/user` - Current authenticated user
- `GET /api/activities` - User's activities
- `GET /api/activities/all` - All activities (supervisor view)
- `POST /api/activities` - Create activity
- `POST /api/activities/:id/review` - Approve/reject activity
- `GET /api/courses` - List courses
- `GET /api/enrollments` - User's enrollments
- `POST /api/enrollments` - Enroll in course

## Running
- `npm run dev` starts both frontend and backend on port 5000
- `npm run db:push` syncs database schema

## Recent Changes
- 2026-02-21: Initial MVP build with bilingual support, Replit Auth, activities, courses, and supervisor review
