import {
  users,
  studentProfiles,
  activities,
  courses,
  courseEnrollments,
  type User,
  type UpsertUser,
  type InsertActivity,
  type Activity,
  type InsertCourse,
  type Course,
  type InsertCourseEnrollment,
  type CourseEnrollment,
  type StudentProfile,
  type InsertStudentProfile,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  getActivitiesByUser(userId: string): Promise<Activity[]>;
  getAllActivities(): Promise<(Activity & { userName?: string; userEmail?: string })[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  reviewActivity(
    activityId: string,
    reviewerId: string,
    action: "approve" | "reject",
    reason?: string
  ): Promise<Activity>;

  getCourses(): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;

  getEnrollmentsByUser(userId: string): Promise<CourseEnrollment[]>;
  createEnrollment(enrollment: InsertCourseEnrollment): Promise<CourseEnrollment>;

  getStudentProfile(userId: string): Promise<StudentProfile | undefined>;
  upsertStudentProfile(profile: InsertStudentProfile): Promise<StudentProfile>;
}

class DatabaseStorage implements IStorage {
  async getActivitiesByUser(userId: string): Promise<Activity[]> {
    return db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.createdAt));
  }

  async getAllActivities(): Promise<(Activity & { userName?: string; userEmail?: string })[]> {
    const results = await db
      .select({
        activity: activities,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
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

  async reviewActivity(
    activityId: string,
    reviewerId: string,
    action: "approve" | "reject",
    reason?: string
  ): Promise<Activity> {
    const [result] = await db
      .update(activities)
      .set({
        status: action === "approve" ? "approved" : "rejected",
        rejectionReason: reason || null,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
      })
      .where(eq(activities.id, activityId))
      .returning();
    return result;
  }

  async getCourses(): Promise<Course[]> {
    return db
      .select()
      .from(courses)
      .where(eq(courses.isPublished, true))
      .orderBy(desc(courses.createdAt));
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [result] = await db.insert(courses).values(course).returning();
    return result;
  }

  async getEnrollmentsByUser(userId: string): Promise<CourseEnrollment[]> {
    return db
      .select()
      .from(courseEnrollments)
      .where(eq(courseEnrollments.userId, userId));
  }

  async createEnrollment(enrollment: InsertCourseEnrollment): Promise<CourseEnrollment> {
    const [result] = await db.insert(courseEnrollments).values(enrollment).returning();
    return result;
  }

  async getStudentProfile(userId: string): Promise<StudentProfile | undefined> {
    const [profile] = await db
      .select()
      .from(studentProfiles)
      .where(eq(studentProfiles.userId, userId));
    return profile;
  }

  async upsertStudentProfile(profile: InsertStudentProfile): Promise<StudentProfile> {
    const [result] = await db
      .insert(studentProfiles)
      .values(profile)
      .onConflictDoUpdate({
        target: studentProfiles.userId,
        set: profile,
      })
      .returning();
    return result;
  }
}

export const storage = new DatabaseStorage();
