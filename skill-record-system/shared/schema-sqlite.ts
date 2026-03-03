import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// جدول الملفات الشخصية
export const studentProfiles = sqliteTable("student_profiles", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  studentId: text("student_id").notNull(),
  trainingId: text("training_id").notNull(),
  phone: text("phone"),
  major: text("major"),
  role: text("role").notNull(), // student/trainer/supervisor
  bio: text("bio"),
  skills: text("skills"), // JSON array
  languages: text("languages"), // JSON array
  linkedIn: text("linkedIn"),
  github: text("github"),
  interests: text("interests"), // JSON array
  careerGoals: text("career_goals"),
  profileImageUrl: text("profile_image_url"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// جدول الأنشطة
export const activities = sqliteTable("activities", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  type: text("type").notNull(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  organization: text("organization"),
  hours: integer("hours"),
  startDate: integer("start_date", { mode: "timestamp" }),
  endDate: integer("end_date", { mode: "timestamp" }),
  descriptionAr: text("description_ar"),
  descriptionEn: text("description_en"),
  proofUrl: text("proof_url"),
  certificateUrl: text("certificate_url"),
  status: text("status").notNull(), // submitted/under_review/approved/rejected
  rejectionReason: text("rejection_reason"),
  reviewedBy: text("reviewed_by"),
  reviewedAt: integer("reviewed_at", { mode: "timestamp" }),
});

// جدول الدورات
export const courses = sqliteTable("courses", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  titleAr: text("title_ar").notNull(),
  titleEn: text("title_en").notNull(),
  descriptionAr: text("description_ar"),
  descriptionEn: text("description_en"),
  category: text("category"),
  duration: integer("duration"),
  instructorId: text("instructor_id"),
  imageUrl: text("image_url"),
  isPublished: integer("is_published", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// جدول الشهادات
export const certificates = sqliteTable("certificates", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  courseId: text("course_id").notNull(), // مرجع للدورة
  activityId: text("activity_id"), // مرجع للنشاط
  type: text("type").notNull(),
  titleAr: text("title_ar").notNull(),
  titleEn: text("title_en").notNull(),
  certificateNumber: text("certificate_number").notNull(),
  issuedAt: integer("issued_at", { mode: "timestamp" }),
  verificationCode: text("verification_code"),
});

// جدول صور الأنشطة
export const activityImages = sqliteTable("activity_images", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  activityId: text("activity_id").notNull().references(() => activities.id),
  url: text("url").notNull(),
  type: text("type").notNull().default("certificate"), // certificate, proof, other
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// جدول صور الدورات
export const courseImages = sqliteTable("course_images", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  courseId: text("course_id").notNull().references(() => courses.id),
  url: text("url").notNull(),
  isPrimary: integer("is_primary", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});