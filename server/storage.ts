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
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, count } from "drizzle-orm";

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
  getCertificateByVerification(code: string): Promise<(Certificate & { userName?: string; courseName?: string }) | undefined>;
  createCertificate(cert: InsertCertificate): Promise<Certificate>;

  getLessonProgress(userId: string, lessonId: string): Promise<LessonProgress | undefined>;
  markLessonComplete(userId: string, lessonId: string): Promise<LessonProgress>;
  getUserLessonProgress(userId: string, courseId: string): Promise<LessonProgress[]>;

  getStudentProfile(userId: string): Promise<StudentProfile | undefined>;
  upsertStudentProfile(profile: InsertStudentProfile): Promise<StudentProfile>;

  getStats(): Promise<{ totalStudents: number; totalActivities: number; totalApproved: number; totalCourses: number }>;
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

  async createCertificate(cert: InsertCertificate): Promise<Certificate> {
    const [result] = await db.insert(certificates).values(cert).returning();
    return result;
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
}

export const storage = new DatabaseStorage();
