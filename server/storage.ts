import {
  users,
  studentProfiles,
  activities,
  courses,
  courseLessons,
  courseQuizzes,
  quizQuestions,
  quizAttempts,
  projectSubmissions,
  courseEnrollments,
  certificates,
  lessonProgress,
  auditLogs,
  type User,
  type UpsertUser,
  type InsertActivity,
  type Activity,
  type InsertCourse,
  type Course,
  type InsertCourseLesson,
  type CourseLesson,
  type InsertCourseQuiz,
  type CourseQuiz,
  type InsertQuizQuestion,
  type QuizQuestion,
  type QuizAttempt,
  type InsertProjectSubmission,
  type ProjectSubmission,
  type InsertCourseEnrollment,
  type CourseEnrollment,
  type InsertCertificate,
  type Certificate,
  type StudentProfile,
  type InsertStudentProfile,
  type LessonProgress,
  type InsertAuditLog,
  type AuditLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, count, sum } from "drizzle-orm";

export interface IStorage {
  getActivitiesByUser(userId: string): Promise<Activity[]>;
  getAllActivities(): Promise<(Activity & { userName?: string; userEmail?: string })[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  reviewActivity(activityId: string, reviewerId: string, action: "approve" | "reject", reason?: string): Promise<Activity>;

  getCourses(): Promise<Course[]>;
  getAllCourses(): Promise<Course[]>;
  getCourseById(id: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, data: Partial<InsertCourse>): Promise<Course>;

  getLessonsByCourse(courseId: string): Promise<CourseLesson[]>;
  createLesson(lesson: InsertCourseLesson): Promise<CourseLesson>;
  updateLesson(id: string, data: Partial<InsertCourseLesson>): Promise<CourseLesson>;
  deleteLesson(id: string): Promise<void>;

  getQuizzesByCourse(courseId: string): Promise<CourseQuiz[]>;
  getQuizById(id: string): Promise<CourseQuiz | undefined>;
  createQuiz(quiz: InsertCourseQuiz): Promise<CourseQuiz>;

  getQuestionsByQuiz(quizId: string): Promise<QuizQuestion[]>;
  createQuestion(question: InsertQuizQuestion): Promise<QuizQuestion>;

  createQuizAttempt(data: { quizId: string; userId: string; score: number; passed: boolean; answers: any }): Promise<QuizAttempt>;
  getQuizAttempts(quizId: string, userId: string): Promise<QuizAttempt[]>;

  getProjectSubmissions(courseId: string): Promise<(ProjectSubmission & { userName?: string })[]>;
  getProjectSubmissionByUser(courseId: string, userId: string): Promise<ProjectSubmission | undefined>;
  createProjectSubmission(submission: InsertProjectSubmission): Promise<ProjectSubmission>;
  gradeProject(id: string, reviewerId: string, grade: number, feedback: string): Promise<ProjectSubmission>;

  getEnrollmentsByUser(userId: string): Promise<CourseEnrollment[]>;
  getEnrollment(userId: string, courseId: string): Promise<CourseEnrollment | undefined>;
  createEnrollment(enrollment: InsertCourseEnrollment): Promise<CourseEnrollment>;
  updateEnrollmentProgress(id: string, progress: number, completedLessons: string[]): Promise<CourseEnrollment>;
  completeEnrollment(id: string): Promise<CourseEnrollment>;

  getCertificatesByUser(userId: string): Promise<Certificate[]>;
  getCertificateById(id: string): Promise<Certificate | undefined>;
  getCertificateByVerification(code: string): Promise<(Certificate & { userName?: string; courseName?: string }) | undefined>;
  createCertificate(cert: InsertCertificate): Promise<Certificate>;
  getNextCertificateNumber(): Promise<number>;
  deleteCourse(id: string): Promise<void>;

  getLessonProgress(userId: string, lessonId: string): Promise<LessonProgress | undefined>;
  markLessonComplete(userId: string, lessonId: string): Promise<LessonProgress>;
  getUserLessonProgress(userId: string, courseId: string): Promise<LessonProgress[]>;

  getStudentProfile(userId: string): Promise<StudentProfile | undefined>;
  upsertStudentProfile(profile: InsertStudentProfile): Promise<StudentProfile>;
  getAllUsersWithProfiles(): Promise<{ id: string; email: string | null; firstName: string | null; lastName: string | null; createdAt: Date | null; role: string | null; studentId: string | null; major: string | null; phone: string | null }[]>;
  updateUserRole(userId: string, role: "student" | "trainer" | "supervisor"): Promise<StudentProfile>;

  getStats(): Promise<{ totalStudents: number; totalActivities: number; totalApproved: number; totalCourses: number }>;

  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(limit?: number): Promise<(AuditLog & { actorName?: string })[]>;

  getReportHoursByStudent(): Promise<{ userId: string; userName: string; major: string; totalHours: number; approvedActivities: number }[]>;
  getReportStudentsByMajor(): Promise<{ major: string; count: number }[]>;
  getReportCompletedCourses(): Promise<{ courseId: string; courseName: string; completedCount: number }[]>;
  getReportApprovedActivities(): Promise<{ type: string; count: number; totalHours: number }[]>;
}

class DatabaseStorage implements IStorage {
  async getActivitiesByUser(userId: string): Promise<Activity[]> {
    return db.select().from(activities).where(eq(activities.userId, userId)).orderBy(desc(activities.createdAt));
  }

  async getAllActivities(): Promise<(Activity & { userName?: string; userEmail?: string })[]> {
    const results = await db
      .select({ activity: activities, firstName: users.firstName, lastName: users.lastName, email: users.email })
      .from(activities)
      .leftJoin(users, eq(activities.userId, users.id))
      .orderBy(desc(activities.createdAt));
    return results.map((r) => ({
      ...r.activity,
      userName: [r.firstName, r.lastName].filter(Boolean).join(" ") || undefined,
      userEmail: r.email || undefined,
    }));
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [result] = await db.insert(activities).values(activity).returning();
    return result;
  }

  async reviewActivity(activityId: string, reviewerId: string, action: "approve" | "reject", reason?: string): Promise<Activity> {
    const [result] = await db
      .update(activities)
      .set({ status: action === "approve" ? "approved" : "rejected", rejectionReason: reason || null, reviewedBy: reviewerId, reviewedAt: new Date() })
      .where(eq(activities.id, activityId))
      .returning();
    return result;
  }

  async getCourses(): Promise<Course[]> {
    return db.select().from(courses).where(eq(courses.isPublished, true)).orderBy(desc(courses.createdAt));
  }

  async getAllCourses(): Promise<Course[]> {
    return db.select().from(courses).orderBy(desc(courses.createdAt));
  }

  async getCourseById(id: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [result] = await db.insert(courses).values(course).returning();
    return result;
  }

  async updateCourse(id: string, data: Partial<InsertCourse>): Promise<Course> {
    const [result] = await db.update(courses).set(data).where(eq(courses.id, id)).returning();
    return result;
  }

  async getLessonsByCourse(courseId: string): Promise<CourseLesson[]> {
    return db.select().from(courseLessons).where(eq(courseLessons.courseId, courseId)).orderBy(courseLessons.orderIndex);
  }

  async createLesson(lesson: InsertCourseLesson): Promise<CourseLesson> {
    const [result] = await db.insert(courseLessons).values(lesson).returning();
    return result;
  }

  async updateLesson(id: string, data: Partial<InsertCourseLesson>): Promise<CourseLesson> {
    const [result] = await db.update(courseLessons).set(data).where(eq(courseLessons.id, id)).returning();
    return result;
  }

  async deleteLesson(id: string): Promise<void> {
    await db.delete(courseLessons).where(eq(courseLessons.id, id));
  }

  async getQuizzesByCourse(courseId: string): Promise<CourseQuiz[]> {
    return db.select().from(courseQuizzes).where(eq(courseQuizzes.courseId, courseId)).orderBy(courseQuizzes.orderIndex);
  }

  async getQuizById(id: string): Promise<CourseQuiz | undefined> {
    const [quiz] = await db.select().from(courseQuizzes).where(eq(courseQuizzes.id, id));
    return quiz;
  }

  async createQuiz(quiz: InsertCourseQuiz): Promise<CourseQuiz> {
    const [result] = await db.insert(courseQuizzes).values(quiz).returning();
    return result;
  }

  async getQuestionsByQuiz(quizId: string): Promise<QuizQuestion[]> {
    return db.select().from(quizQuestions).where(eq(quizQuestions.quizId, quizId)).orderBy(quizQuestions.orderIndex);
  }

  async createQuestion(question: InsertQuizQuestion): Promise<QuizQuestion> {
    const [result] = await db.insert(quizQuestions).values(question).returning();
    return result;
  }

  async createQuizAttempt(data: { quizId: string; userId: string; score: number; passed: boolean; answers: any }): Promise<QuizAttempt> {
    const [result] = await db.insert(quizAttempts).values(data).returning();
    return result;
  }

  async getQuizAttempts(quizId: string, userId: string): Promise<QuizAttempt[]> {
    return db.select().from(quizAttempts).where(and(eq(quizAttempts.quizId, quizId), eq(quizAttempts.userId, userId))).orderBy(desc(quizAttempts.completedAt));
  }

  async getProjectSubmissions(courseId: string): Promise<(ProjectSubmission & { userName?: string })[]> {
    const results = await db
      .select({ submission: projectSubmissions, firstName: users.firstName, lastName: users.lastName })
      .from(projectSubmissions)
      .leftJoin(users, eq(projectSubmissions.userId, users.id))
      .where(eq(projectSubmissions.courseId, courseId))
      .orderBy(desc(projectSubmissions.createdAt));
    return results.map((r) => ({
      ...r.submission,
      userName: [r.firstName, r.lastName].filter(Boolean).join(" ") || undefined,
    }));
  }

  async getProjectSubmissionByUser(courseId: string, userId: string): Promise<ProjectSubmission | undefined> {
    const [result] = await db.select().from(projectSubmissions).where(and(eq(projectSubmissions.courseId, courseId), eq(projectSubmissions.userId, userId)));
    return result;
  }

  async createProjectSubmission(submission: InsertProjectSubmission): Promise<ProjectSubmission> {
    const [result] = await db.insert(projectSubmissions).values(submission).returning();
    return result;
  }

  async gradeProject(id: string, reviewerId: string, grade: number, feedback: string): Promise<ProjectSubmission> {
    const [result] = await db
      .update(projectSubmissions)
      .set({ grade, feedback, reviewedBy: reviewerId, reviewedAt: new Date() })
      .where(eq(projectSubmissions.id, id))
      .returning();
    return result;
  }

  async getEnrollmentsByUser(userId: string): Promise<CourseEnrollment[]> {
    return db.select().from(courseEnrollments).where(eq(courseEnrollments.userId, userId));
  }

  async getEnrollment(userId: string, courseId: string): Promise<CourseEnrollment | undefined> {
    const [result] = await db.select().from(courseEnrollments).where(and(eq(courseEnrollments.userId, userId), eq(courseEnrollments.courseId, courseId)));
    return result;
  }

  async createEnrollment(enrollment: InsertCourseEnrollment): Promise<CourseEnrollment> {
    const [result] = await db.insert(courseEnrollments).values(enrollment).returning();
    return result;
  }

  async updateEnrollmentProgress(id: string, progress: number, completedLessons: string[]): Promise<CourseEnrollment> {
    const [result] = await db
      .update(courseEnrollments)
      .set({ progress, completedLessons })
      .where(eq(courseEnrollments.id, id))
      .returning();
    return result;
  }

  async completeEnrollment(id: string): Promise<CourseEnrollment> {
    const [result] = await db
      .update(courseEnrollments)
      .set({ isCompleted: true, completedAt: new Date(), progress: 100 })
      .where(eq(courseEnrollments.id, id))
      .returning();
    return result;
  }

  async getCertificatesByUser(userId: string): Promise<Certificate[]> {
    return db.select().from(certificates).where(eq(certificates.userId, userId)).orderBy(desc(certificates.issuedAt));
  }

  async getCertificateById(id: string): Promise<Certificate | undefined> {
    const [result] = await db.select().from(certificates).where(eq(certificates.id, id));
    return result;
  }

  async getCertificateByVerification(code: string): Promise<(Certificate & { userName?: string; courseName?: string }) | undefined> {
    const results = await db
      .select({ cert: certificates, firstName: users.firstName, lastName: users.lastName, courseTitle: courses.titleAr })
      .from(certificates)
      .leftJoin(users, eq(certificates.userId, users.id))
      .leftJoin(courses, eq(certificates.courseId, courses.id))
      .where(eq(certificates.verificationCode, code));
    if (results.length === 0) return undefined;
    const r = results[0];
    return {
      ...r.cert,
      userName: [r.firstName, r.lastName].filter(Boolean).join(" ") || undefined,
      courseName: r.courseTitle || undefined,
    };
  }

  async getNextCertificateNumber(): Promise<number> {
    const result = await db.select({ maxNum: sql<number>`COALESCE(MAX(${certificates.certificateNumber}), 0)` }).from(certificates);
    return (result[0]?.maxNum || 0) + 1;
  }

  async createCertificate(cert: InsertCertificate): Promise<Certificate> {
    const nextNumber = await this.getNextCertificateNumber();
    const [result] = await db.insert(certificates).values({ ...cert, certificateNumber: nextNumber }).returning();
    return result;
  }

  async deleteCourse(id: string): Promise<void> {
    await db.delete(lessonProgress).where(
      sql`${lessonProgress.lessonId} IN (SELECT id FROM course_lessons WHERE course_id = ${id})`
    );
    await db.delete(courseLessons).where(eq(courseLessons.courseId, id));
    await db.delete(quizQuestions).where(
      sql`${quizQuestions.quizId} IN (SELECT id FROM course_quizzes WHERE course_id = ${id})`
    );
    await db.delete(courseQuizzes).where(eq(courseQuizzes.courseId, id));
    await db.delete(quizAttempts).where(
      sql`${quizAttempts.quizId} IN (SELECT id FROM course_quizzes WHERE course_id = ${id})`
    );
    await db.delete(projectSubmissions).where(eq(projectSubmissions.courseId, id));
    await db.delete(courseEnrollments).where(eq(courseEnrollments.courseId, id));
    await db.delete(courses).where(eq(courses.id, id));
  }

  async getLessonProgress(userId: string, lessonId: string): Promise<LessonProgress | undefined> {
    const [result] = await db.select().from(lessonProgress).where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, lessonId)));
    return result;
  }

  async markLessonComplete(userId: string, lessonId: string): Promise<LessonProgress> {
    const existing = await this.getLessonProgress(userId, lessonId);
    if (existing) {
      const [result] = await db.update(lessonProgress).set({ completed: true, completedAt: new Date() }).where(eq(lessonProgress.id, existing.id)).returning();
      return result;
    }
    const [result] = await db.insert(lessonProgress).values({ userId, lessonId, completed: true, completedAt: new Date() }).returning();
    return result;
  }

  async getUserLessonProgress(userId: string, courseId: string): Promise<LessonProgress[]> {
    const lessons = await this.getLessonsByCourse(courseId);
    const lessonIds = lessons.map((l) => l.id);
    if (lessonIds.length === 0) return [];
    const results = await db.select().from(lessonProgress).where(and(eq(lessonProgress.userId, userId)));
    return results.filter((r) => lessonIds.includes(r.lessonId));
  }

  async getStudentProfile(userId: string): Promise<StudentProfile | undefined> {
    const [profile] = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, userId));
    return profile;
  }

  async upsertStudentProfile(profile: InsertStudentProfile): Promise<StudentProfile> {
    const [result] = await db
      .insert(studentProfiles)
      .values(profile)
      .onConflictDoUpdate({ target: studentProfiles.userId, set: profile })
      .returning();
    return result;
  }

  async getAllUsersWithProfiles() {
    const results = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        createdAt: users.createdAt,
        role: studentProfiles.role,
        studentId: studentProfiles.studentId,
        major: studentProfiles.major,
        phone: studentProfiles.phone,
      })
      .from(users)
      .leftJoin(studentProfiles, eq(users.id, studentProfiles.userId))
      .orderBy(desc(users.createdAt));
    return results;
  }

  async updateUserRole(userId: string, role: "student" | "trainer" | "supervisor"): Promise<StudentProfile> {
    const existing = await this.getStudentProfile(userId);
    if (existing) {
      const [result] = await db
        .update(studentProfiles)
        .set({ role })
        .where(eq(studentProfiles.userId, userId))
        .returning();
      return result;
    } else {
      const [result] = await db
        .insert(studentProfiles)
        .values({ userId, role })
        .returning();
      return result;
    }
  }

  async getStats(): Promise<{ totalStudents: number; totalActivities: number; totalApproved: number; totalCourses: number }> {
    const [studentsResult] = await db.select({ count: count() }).from(studentProfiles);
    const [activitiesResult] = await db.select({ count: count() }).from(activities);
    const [approvedResult] = await db.select({ count: count() }).from(activities).where(eq(activities.status, "approved"));
    const [coursesResult] = await db.select({ count: count() }).from(courses);
    return {
      totalStudents: studentsResult.count,
      totalActivities: activitiesResult.count,
      totalApproved: approvedResult.count,
      totalCourses: coursesResult.count,
    };
  }

  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [result] = await db.insert(auditLogs).values(log).returning();
    return result;
  }

  async getAuditLogs(limit = 100): Promise<(AuditLog & { actorName?: string })[]> {
    const results = await db
      .select({ log: auditLogs, firstName: users.firstName, lastName: users.lastName })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.actorUserId, users.id))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
    return results.map((r) => ({
      ...r.log,
      actorName: [r.firstName, r.lastName].filter(Boolean).join(" ") || undefined,
    }));
  }

  async getReportHoursByStudent(): Promise<{ userId: string; userName: string; major: string; totalHours: number; approvedActivities: number }[]> {
    const results = await db
      .select({
        userId: studentProfiles.userId,
        firstName: users.firstName,
        lastName: users.lastName,
        major: studentProfiles.major,
        totalHours: sum(activities.hours),
        approvedActivities: count(activities.id),
      })
      .from(studentProfiles)
      .leftJoin(users, eq(studentProfiles.userId, users.id))
      .leftJoin(activities, and(eq(activities.userId, studentProfiles.userId), eq(activities.status, "approved")))
      .groupBy(studentProfiles.userId, users.firstName, users.lastName, studentProfiles.major);
    return results.map((r) => ({
      userId: r.userId,
      userName: [r.firstName, r.lastName].filter(Boolean).join(" ") || "—",
      major: r.major || "—",
      totalHours: Number(r.totalHours) || 0,
      approvedActivities: r.approvedActivities,
    }));
  }

  async getReportStudentsByMajor(): Promise<{ major: string; count: number }[]> {
    const results = await db
      .select({ major: studentProfiles.major, count: count() })
      .from(studentProfiles)
      .groupBy(studentProfiles.major);
    return results.map((r) => ({ major: r.major || "—", count: r.count }));
  }

  async getReportCompletedCourses(): Promise<{ courseId: string; courseName: string; completedCount: number }[]> {
    const results = await db
      .select({ courseId: courses.id, courseName: courses.titleAr, completedCount: count(courseEnrollments.id) })
      .from(courses)
      .leftJoin(courseEnrollments, and(eq(courseEnrollments.courseId, courses.id), eq(courseEnrollments.isCompleted, true)))
      .groupBy(courses.id, courses.titleAr);
    return results.map((r) => ({
      courseId: r.courseId,
      courseName: r.courseName,
      completedCount: r.completedCount,
    }));
  }

  async getReportApprovedActivities(): Promise<{ type: string; count: number; totalHours: number }[]> {
    const results = await db
      .select({ type: activities.type, count: count(), totalHours: sum(activities.hours) })
      .from(activities)
      .where(eq(activities.status, "approved"))
      .groupBy(activities.type);
    return results.map((r) => ({
      type: r.type,
      count: r.count,
      totalHours: Number(r.totalHours) || 0,
    }));
  }
}

export const storage = new DatabaseStorage();
