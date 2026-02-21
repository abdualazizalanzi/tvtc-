# Skill Record (السجل المهاري)

## Overview
A bilingual (Arabic/English) web platform for documenting non-academic skills and activities for university students. Students can log volunteer work, courses, leadership roles, and more — supervised by university staff. The system includes trainer course management, quiz-based assessment, certificate issuance, AI-powered suggestions, and PDF export with QR verification.

## Architecture
- **Frontend**: React + Vite + Tailwind CSS + Shadcn UI + wouter routing
- **Backend**: Express.js + Drizzle ORM + PostgreSQL
- **Auth**: Custom email/password auth with bcryptjs hashing + express-session (PostgreSQL-backed sessions)
- **i18n**: Custom React context (client/src/lib/i18n.tsx) with AR/EN translations
- **File Uploads**: Multer for certificates and project files (10MB limit, PDF/images/docs)

## Key Directories
- `client/src/pages/` - React pages (landing, dashboard, activities, courses, course-player, trainer-dashboard, supervisor-dashboard, profile, certificates, skill-record, ai-assistant, review)
- `client/src/components/` - Reusable components (sidebar, language toggle, theme provider)
- `client/src/lib/` - Utilities (queryClient, i18n, auth-utils)
- `server/` - Express backend (routes, storage, db, seed)
- `server/replit_integrations/auth/` - Custom auth (register/login/logout/session)
- `shared/` - Schema types shared between frontend and backend
- `uploads/` - Uploaded certificate and project files

## Database Schema
- `users` + `sessions` (Replit Auth)
- `student_profiles` - Extended student info (studentId, trainingId, phone, major, role: student/trainer/supervisor)
- `activities` - Activity submissions with status workflow (draft→submitted→under_review→approved/rejected), certificate file path
- `courses` - Training courses catalog with bilingual titles/descriptions, isPublished flag
- `course_enrollments` - Student course registrations with completion status
- `course_lessons` - Individual lessons with videoUrl and content
- `lesson_progress` - Tracks lesson completion per user
- `quizzes` - Course quizzes (intermediate/final) with passing score
- `quiz_questions` - MCQ questions with options array and correct answer
- `quiz_attempts` - Student quiz attempt scores
- `project_submissions` - Final project submissions with grading
- `certificates` - Auto-generated completion certificates with verification codes

## Activity Types & Minimum Hours
- volunteer_work: 25h, student_employment: 10h, participation: 8h
- self_development: 15h, awards: 5h, student_activity: 10h
- professional_activity: 10h, leadership_skills: 8h

## API Routes
### Auth
- `POST /api/auth/register` - Register new user (email, password, firstName, lastName)
- `POST /api/auth/login` - Login (email, password)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/user` - Current authenticated user

### Profile
- `GET /api/profile` - User profile
- `POST /api/profile` - Create/update profile

### Activities
- `GET /api/activities` - User's activities
- `GET /api/activities/all` - All activities (supervisor view)
- `POST /api/activities` - Create activity (FormData with certificate file)
- `POST /api/activities/:id/review` - Approve/reject activity

### Courses
- `GET /api/courses` - Published courses
- `GET /api/courses/all` - All courses (trainer/supervisor)
- `GET /api/courses/:id` - Single course
- `POST /api/courses` - Create course (trainer)
- `PATCH /api/courses/:id` - Update course (publish/unpublish)

### Lessons
- `GET /api/courses/:courseId/lessons` - Course lessons
- `POST /api/courses/:courseId/lessons` - Add lesson (trainer)
- `POST /api/lessons/:lessonId/complete` - Mark lesson complete
- `GET /api/courses/:courseId/progress` - Lesson progress

### Quizzes
- `GET /api/courses/:courseId/quizzes` - Course quizzes
- `POST /api/courses/:courseId/quizzes` - Create quiz (trainer)
- `GET /api/quizzes/:quizId/questions` - Quiz questions
- `POST /api/quizzes/:quizId/questions` - Add question (trainer)
- `POST /api/quizzes/:quizId/attempt` - Submit quiz answers
- `GET /api/quizzes/:quizId/attempts` - User's attempts

### Projects
- `GET /api/courses/:courseId/projects` - Project submissions
- `POST /api/courses/:courseId/projects` - Submit project (FormData)
- `POST /api/projects/:id/grade` - Grade project (trainer)

### Enrollments & Certificates
- `GET /api/enrollments` - User's enrollments
- `POST /api/enrollments` - Enroll in course
- `POST /api/courses/:courseId/complete` - Complete course & get certificate
- `GET /api/certificates` - User's certificates
- `GET /api/certificates/verify/:code` - Verify certificate

### Admin (Supervisor Only)
- `GET /api/admin/users` - List all users with profiles
- `POST /api/admin/users` - Create user with role (email, password, firstName, lastName, role)
- `PATCH /api/admin/users/:id/role` - Change user role

### Stats
- `GET /api/stats` - Dashboard statistics (supervisor)

## Running
- `npm run dev` starts both frontend and backend on port 5000
- `npm run db:push` syncs database schema

## Recent Changes
- 2026-02-21: Initial MVP build with bilingual support, Replit Auth, activities, courses, and supervisor review
- 2026-02-21: Expanded schema with course content system (lessons, quizzes, projects, certificates)
- 2026-02-21: Added file upload for activity certificates and project submissions
- 2026-02-21: Built trainer dashboard with course management, lesson/quiz creation, project grading
- 2026-02-21: Built course player with video lessons, MCQ quizzes, project submission
- 2026-02-21: Added skill record PDF export page with hours tracking and QR verification
- 2026-02-21: Added supervisor analytics dashboard with statistics
- 2026-02-21: Added AI assistant with activity/course suggestions and CV generation
- 2026-02-21: Added profile page, certificates page, expanded sidebar navigation
- 2026-02-21: Replaced Replit Auth with custom email/password authentication (bcryptjs + express-session)
- 2026-02-21: Added admin user management - only supervisors can create accounts and assign roles (student/trainer/supervisor)
- 2026-02-21: Integrated real AI (OpenAI gpt-5-nano) for AI assistant with streaming responses and student context awareness
