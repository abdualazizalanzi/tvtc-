import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";
export * from "./models/chat";
import { users } from "./models/auth";

export const userRoleEnum = pgEnum("user_role", ["student", "trainer", "supervisor"]);

export const activityTypeEnum = pgEnum("activity_type", [
  "volunteer_work",
  "student_employment",
  "participation",
  "self_development",
  "awards",
  "student_activity",
  "professional_activity",
  "leadership_skills",
]);

export const activityStatusEnum = pgEnum("activity_status", [
  "draft",
  "submitted",
  "under_review",
  "approved",
  "rejected",
]);

export const studentProfiles = pgTable("student_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  studentId: varchar("student_id"),
  trainingId: varchar("training_id"),
  phone: varchar("phone"),
  major: varchar("major"),
  role: userRoleEnum("role").notNull().default("student"),
  // New CV fields
  bio: text("bio"),
  skills: jsonb("skills").$type<string[]>().default([]),
  languages: jsonb("languages").$type<{ name: string; level: string }[]>().default([]),
  linkedIn: varchar("linkedin"),
  github: varchar("github"),
  interests: jsonb("interests").$type<string[]>().default([]),
  careerGoals: text("career_goals"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: activityTypeEnum("type").notNull(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en"),
  organization: text("organization").notNull(),
  hours: integer("hours").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  descriptionAr: text("description_ar"),
  descriptionEn: text("description_en"),
  proofUrl: text("proof_url"),
  certificateUrl: text("certificate_url"),
  status: activityStatusEnum("status").notNull().default("submitted"),
  rejectionReason: text("rejection_reason"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  titleAr: text("title_ar").notNull(),
  titleEn: text("title_en"),
  descriptionAr: text("description_ar"),
  descriptionEn: text("description_en"),
  category: varchar("category").notNull(),
  duration: integer("duration").notNull(),
  instructorId: varchar("instructor_id").references(() => users.id),
  imageUrl: text("image_url"),
  isPublished: boolean("is_published").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const courseLessons = pgTable("course_lessons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  titleAr: text("title_ar").notNull(),
  titleEn: text("title_en"),
  contentAr: text("content_ar"),
  contentEn: text("content_en"),
  videoUrl: text("video_url"),
  orderIndex: integer("order_index").notNull().default(0),
  durationMinutes: integer("duration_minutes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const courseQuizzes = pgTable("course_quizzes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  titleAr: text("title_ar").notNull(),
  titleEn: text("title_en"),
  type: varchar("type").notNull().default("intermediate"),
  passingScore: integer("passing_score").notNull().default(60),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quizQuestions = pgTable("quiz_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quizId: varchar("quiz_id").notNull().references(() => courseQuizzes.id),
  questionAr: text("question_ar").notNull(),
  questionEn: text("question_en"),
  options: jsonb("options").notNull(),
  correctAnswer: integer("correct_answer").notNull(),
  orderIndex: integer("order_index").notNull().default(0),
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quizId: varchar("quiz_id").notNull().references(() => courseQuizzes.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  score: integer("score").notNull(),
  passed: boolean("passed").notNull().default(false),
  answers: jsonb("answers"),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const projectSubmissions = pgTable("project_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  titleAr: text("title_ar").notNull(),
  titleEn: text("title_en"),
  descriptionAr: text("description_ar"),
  descriptionEn: text("description_en"),
  fileUrl: text("file_url"),
  grade: integer("grade"),
  feedback: text("feedback"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const courseEnrollments = pgTable("course_enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  progress: integer("progress").default(0),
  completedLessons: jsonb("completed_lessons").default([]),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const certificates = pgTable("certificates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  courseId: varchar("course_id").references(() => courses.id),
  activityId: varchar("activity_id").references(() => activities.id),
  type: varchar("type").notNull().default("course_completion"),
  titleAr: text("title_ar").notNull(),
  titleEn: text("title_en"),
  certificateNumber: integer("certificate_number"),
  issuedAt: timestamp("issued_at").defaultNow(),
  verificationCode: varchar("verification_code").default(sql`gen_random_uuid()`),
});

export const lessonProgress = pgTable("lesson_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  lessonId: varchar("lesson_id").notNull().references(() => courseLessons.id),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
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

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  actorUserId: varchar("actor_user_id").notNull().references(() => users.id),
  action: varchar("action").notNull(),
  entityType: varchar("entity_type").notNull(),
  entityId: varchar("entity_id"),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

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
