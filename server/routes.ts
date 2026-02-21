import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { insertActivitySchema } from "@shared/schema";
import { z } from "zod";

async function isSupervisor(userId: string): Promise<boolean> {
  const profile = await storage.getStudentProfile(userId);
  return profile?.role === "supervisor" || profile?.role === "trainer";
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  app.get("/api/activities", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const activities = await storage.getActivitiesByUser(userId);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.get("/api/activities/all", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const supervisor = await isSupervisor(userId);
      if (!supervisor) {
        return res.status(403).json({ message: "Forbidden: supervisor access required" });
      }
      const activities = await storage.getAllActivities();
      res.json(activities);
    } catch (error) {
      console.error("Error fetching all activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.post("/api/activities", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      const bodySchema = z.object({
        type: z.enum([
          "volunteer_work", "student_employment", "participation", "self_development",
          "awards", "student_activity", "professional_activity", "leadership_skills",
        ]),
        nameAr: z.string().min(1),
        nameEn: z.string().optional().nullable(),
        organization: z.string().min(1),
        hours: z.number().int().min(1).max(500),
        startDate: z.string().min(1),
        endDate: z.string().optional().nullable(),
        descriptionAr: z.string().optional().nullable(),
        descriptionEn: z.string().optional().nullable(),
      });

      const parsed = bodySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
      }

      const data = {
        ...parsed.data,
        userId,
        startDate: new Date(parsed.data.startDate),
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
      };

      const activity = await storage.createActivity(data);
      res.status(201).json(activity);
    } catch (error) {
      console.error("Error creating activity:", error);
      res.status(500).json({ message: "Failed to create activity" });
    }
  });

  app.post("/api/activities/:id/review", isAuthenticated, async (req: any, res) => {
    try {
      const reviewerId = req.user.claims.sub;

      const supervisor = await isSupervisor(reviewerId);
      if (!supervisor) {
        return res.status(403).json({ message: "Forbidden: supervisor access required" });
      }

      const { id } = req.params;
      const reviewSchema = z.object({
        action: z.enum(["approve", "reject"]),
        rejectionReason: z.string().optional(),
      });

      const parsed = reviewSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
      }

      const activity = await storage.reviewActivity(id, reviewerId, parsed.data.action, parsed.data.rejectionReason);
      res.json(activity);
    } catch (error) {
      console.error("Error reviewing activity:", error);
      res.status(500).json({ message: "Failed to review activity" });
    }
  });

  app.get("/api/courses", isAuthenticated, async (req: any, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get("/api/enrollments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const enrollments = await storage.getEnrollmentsByUser(userId);
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  app.post("/api/enrollments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      const enrollSchema = z.object({
        courseId: z.string().min(1),
      });

      const parsed = enrollSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
      }

      const existing = await storage.getEnrollmentsByUser(userId);
      if (existing.some((e) => e.courseId === parsed.data.courseId)) {
        return res.status(409).json({ message: "Already enrolled in this course" });
      }

      const enrollment = await storage.createEnrollment({ userId, courseId: parsed.data.courseId });
      res.status(201).json(enrollment);
    } catch (error) {
      console.error("Error creating enrollment:", error);
      res.status(500).json({ message: "Failed to enroll in course" });
    }
  });

  app.get("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getStudentProfile(userId);
      res.json(profile || null);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  return httpServer;
}
