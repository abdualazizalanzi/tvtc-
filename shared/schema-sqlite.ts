import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth-sqlite";
export * from "./models/chat-sqlite";
import { users } from "./models/auth-sqlite";

export const studentProfiles = sqliteTable("student_profiles", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id).unique(),
  studentId: text("student_id"),
  trainingId: text("training_id"),
  phone: text("phone"),
  major: text("major"),
  role: text("role").notNull().default("student"),
  bio: text("bio"),
  skills: text("skills").$defaultFn(() => "[]"),
  languages: text("languages").$defaultFn(() => "[]"),
  linkedIn: text("linkedin"),
  github: text("github"),
  interests: text("interests").$defaultFn(() => "[]"),
  careerGoals: text("career_goals"),
  profileImageUrl: text("profile_image_url"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const activities = sqliteTable("activities", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en"),
  organization: text("organization").notNull(),
  hours: integer("hours").notNull(),
  startDate: integer("start_date", { mode: "timestamp" }).notNull(),
  endDate: integer("end_date", { mode: "timestamp" }),
  descriptionAr: text("description_ar"),
  descriptionEn: text("description_en"),
  proofUrl: text("proof_url"),
  certificateUrl: text("certificate_url"),
  status: text("status").notNull().default("submitted"),
  rejectionReason: text("rejection_reason"),
  reviewedBy: text("reviewed_by").references(() => users.id),
  reviewedAt: integer("reviewed_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const courses = sqliteTable("courses", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  titleAr: text("title_ar").notNull(),
  titleEn: text("title_en"),
  descriptionAr: text("description_ar"),
  descriptionEn: text("description_en"),
  category: text("category").notNull(),
  duration: integer("duration").notNull(),
  instructorId: text("instructor_id").references(() => users.id),
  imageUrl: text("image_url"),
  isPublished: integer("is_published", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const courseLessons = sqliteTable("course_lessons", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  courseId: text("course_id").notNull().references(() => courses.id),
  titleAr: text("title_ar").notNull(),
  titleEn: text("title_en"),
  contentAr: text("content_ar"),
  contentEn: text("content_en"),
  videoUrl: text("video_url"),
  orderIndex: integer("order_index").notNull().default(0),
  durationMinutes: integer("duration_minutes").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const courseQuizzes = sqliteTable("course_quizzes", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  courseId: text("course_id").notNull().references(() => courses.id),
  titleAr: text("title_ar").notNull(),
  titleEn: text("title_en"),
  type: text("type").notNull().default("intermediate"),
  passingScore: integer("passing_score").notNull().default(60),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const quizQuestions = sqliteTable("quiz_questions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  quizId: text("quiz_id").notNull().references(() => courseQuizzes.id),
  questionAr: text("question_ar").notNull(),
  questionEn: text("question_en"),
  options: text("options").notNull(),
  correctAnswer: integer("correct_answer").notNull(),
  orderIndex: integer("order_index").notNull().default(0),
});

export const quizAttempts = sqliteTable("quiz_attempts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  quizId: text("quiz_id").notNull().references(() => courseQuizzes.id),
  userId: text("user_id").notNull().references(() => users.id),
  score: integer("score").notNull(),
  passed: integer("passed", { mode: "boolean" }).notNull().default(false),
  answers: text("answers"),
  completedAt: integer("completed_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const projectSubmissions = sqliteTable("project_submissions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  courseId: text("course_id").notNull().references(() => courses.id),
  userId: text("user_id").notNull().references(() => users.id),
  titleAr: text("title_ar").notNull(),
  titleEn: text("title_en"),
  descriptionAr: text("description_ar"),
  descriptionEn: text("description_en"),
  fileUrl: text("file_url"),
  grade: integer("grade"),
  feedback: text("feedback"),
  reviewedBy: text("reviewed_by").references(() => users.id),
  reviewedAt: integer("reviewed_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const courseEnrollments = sqliteTable("course_enrollments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id),
  courseId: text("course_id").notNull().references(() => courses.id),
  progress: integer("progress").default(0),
  completedLessons: text("completed_lessons").default(JSON.stringify([])),
  isCompleted: integer("is_completed", { mode: "boolean" }).default(false),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const certificates = sqliteTable("certificates", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id),
  courseId: text("course_id").references(() => courses.id),
  activityId: text("activity_id").references(() => activities.id),
  type: text("type").notNull().default("course_completion"),
  titleAr: text("title_ar").notNull(),
  titleEn: text("title_en"),
  certificateNumber: integer("certificate_number"),
  issuedAt: integer("issued_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  verificationCode: text("verification_code").$defaultFn(() => crypto.randomUUID()),
});

export const lessonProgress = sqliteTable("lesson_progress", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id),
  lessonId: text("lesson_id").notNull().references(() => courseLessons.id),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  completedAt: integer("completed_at", { mode: "timestamp" }),
});

export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  actorUserId: text("actor_user_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  details: text("details"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const insertStudentProfileSchema = createInsertSchema(studentProfiles).omit({
  id: true,
  createdAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  status: true,
  rejectionReason: true,
  reviewedBy: true,
  reviewedAt: true,
  createdAt: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
});

export const insertCourseLessonSchema = createInsertSchema(courseLessons).omit({
  id: true,
  createdAt: true,
});

export const insertCourseQuizSchema = createInsertSchema(courseQuizzes).omit({
  id: true,
  createdAt: true,
});

export const insertQuizQuestionSchema = createInsertSchema(quizQuestions).omit({
  id: true,
});

export const insertProjectSubmissionSchema = createInsertSchema(projectSubmissions).omit({
  id: true,
  grade: true,
  feedback: true,
  reviewedBy: true,
  reviewedAt: true,
  createdAt: true,
});

export const insertCourseEnrollmentSchema = createInsertSchema(courseEnrollments).omit({
  id: true,
  progress: true,
  completedLessons: true,
  isCompleted: true,
  completedAt: true,
  createdAt: true,
});

export const insertCertificateSchema = createInsertSchema(certificates).omit({
  id: true,
  issuedAt: true,
  verificationCode: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertStudentProfile = z.infer<typeof insertStudentProfileSchema>;
export type StudentProfile = typeof studentProfiles.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertCourseLesson = z.infer<typeof insertCourseLessonSchema>;
export type CourseLesson = typeof courseLessons.$inferSelect;
export type InsertCourseQuiz = z.infer<typeof insertCourseQuizSchema>;
export type CourseQuiz = typeof courseQuizzes.$inferSelect;
export type InsertQuizQuestion = z.infer<typeof insertQuizQuestionSchema>;
export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type InsertProjectSubmission = z.infer<typeof insertProjectSubmissionSchema>;
export type ProjectSubmission = typeof projectSubmissions.$inferSelect;
export type InsertCourseEnrollment = z.infer<typeof insertCourseEnrollmentSchema>;
export type CourseEnrollment = typeof courseEnrollments.$inferSelect;
export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type Certificate = typeof certificates.$inferSelect;
export type LessonProgress = typeof lessonProgress.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

export const ACTIVITY_MIN_HOURS: Record<string, number> = {
  volunteer_work: 25,
  student_employment: 10,
  participation: 8,
  self_development: 3,
  awards: 1,
  student_activity: 20,
  professional_activity: 5,
  leadership_skills: 5,
};

