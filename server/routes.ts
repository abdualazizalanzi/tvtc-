import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { authStorage } from "./replit_integrations/auth/storage";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import OpenAI from "openai";
import { ACTIVITY_MIN_HOURS } from "@shared/schema";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx", ".zip"];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

async function isAdmin(userId: string): Promise<boolean> {
  const profile = await storage.getStudentProfile(userId);
  return profile?.role === "supervisor";
}

async function isSupervisor(userId: string): Promise<boolean> {
  const profile = await storage.getStudentProfile(userId);
  return profile?.role === "supervisor";
}

async function isTrainer(userId: string): Promise<boolean> {
  const profile = await storage.getStudentProfile(userId);
  return profile?.role === "trainer" || profile?.role === "supervisor";
}

async function canStudentAccess(userId: string): Promise<boolean> {
  const profile = await storage.getStudentProfile(userId);
  return profile?.role === "student" || profile?.role === "supervisor";
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  app.use("/uploads", (req, res, next) => {
    const filePath = path.join(uploadDir, path.basename(req.path));
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: "File not found" });
    }
  });

  app.get("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getStudentProfile(userId);
      res.json(profile || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const schema = z.object({
        studentId: z.string().optional(),
        trainingId: z.string().optional(),
        phone: z.string().optional(),
        major: z.string().optional(),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data" });
      const profile = await storage.upsertStudentProfile({ userId, ...parsed.data });
      storage.createAuditLog({ actorUserId: userId, action: "profile_update", entityType: "student_profile", entityId: profile.id, details: parsed.data }).catch(() => {});
      res.json(profile);
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.get("/api/activities", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const activities = await storage.getActivitiesByUser(userId);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.get("/api/activities/all", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!(await isSupervisor(userId))) return res.status(403).json({ message: "Forbidden" });
      const activities = await storage.getAllActivities();
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.post("/api/activities", isAuthenticated, upload.single("certificate"), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!(await canStudentAccess(userId))) return res.status(403).json({ message: "Forbidden" });
      const bodySchema = z.object({
        type: z.enum(["volunteer_work", "student_employment", "participation", "self_development", "awards", "student_activity", "professional_activity", "leadership_skills"]),
        nameAr: z.string().min(1),
        nameEn: z.string().optional().nullable(),
        organization: z.string().min(1),
        hours: z.coerce.number().int().min(1).max(500),
        startDate: z.string().min(1),
        endDate: z.string().optional().nullable(),
        descriptionAr: z.string().optional().nullable(),
        descriptionEn: z.string().optional().nullable(),
      });
      const parsed = bodySchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });

      const certificateUrl = req.file ? `/uploads/${req.file.filename}` : null;
      const data = {
        ...parsed.data,
        userId,
        startDate: new Date(parsed.data.startDate),
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
        certificateUrl,
      };
      const activity = await storage.createActivity(data);
      res.status(201).json(activity);
    } catch (error) {
      res.status(500).json({ message: "Failed to create activity" });
    }
  });

  app.post("/api/activities/:id/review", isAuthenticated, async (req: any, res) => {
    try {
      const reviewerId = req.user.claims.sub;
      if (!(await isSupervisor(reviewerId))) return res.status(403).json({ message: "Forbidden" });
      const { id } = req.params;
      const reviewSchema = z.object({ action: z.enum(["approve", "reject"]), rejectionReason: z.string().optional() });
      const parsed = reviewSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data" });
      const activity = await storage.reviewActivity(id, reviewerId, parsed.data.action, parsed.data.rejectionReason);
      storage.createAuditLog({ actorUserId: reviewerId, action: `activity_${parsed.data.action}`, entityType: "activity", entityId: id, details: { action: parsed.data.action, reason: parsed.data.rejectionReason } }).catch(() => {});
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: "Failed to review activity" });
    }
  });

  app.get("/api/courses", isAuthenticated, async (req: any, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get("/api/courses/all", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!(await isTrainer(userId))) return res.status(403).json({ message: "Forbidden" });
      const courses = await storage.getAllCourses();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get("/api/courses/:id", isAuthenticated, async (req: any, res) => {
    try {
      const course = await storage.getCourseById(req.params.id);
      if (!course) return res.status(404).json({ message: "Not found" });
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  app.post("/api/courses", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!(await isTrainer(userId))) return res.status(403).json({ message: "Forbidden" });
      const schema = z.object({
        titleAr: z.string().min(1),
        titleEn: z.string().optional().nullable(),
        descriptionAr: z.string().optional().nullable(),
        descriptionEn: z.string().optional().nullable(),
        category: z.string().min(1),
        duration: z.coerce.number().int().min(1),
        isPublished: z.boolean().optional(),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data" });
      const course = await storage.createCourse({ ...parsed.data, instructorId: userId });
      res.status(201).json(course);
    } catch (error) {
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  app.patch("/api/courses/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!(await isTrainer(userId))) return res.status(403).json({ message: "Forbidden" });
      const course = await storage.updateCourse(req.params.id, req.body);
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: "Failed to update course" });
    }
  });

  app.get("/api/courses/:courseId/lessons", isAuthenticated, async (req: any, res) => {
    try {
      const lessons = await storage.getLessonsByCourse(req.params.courseId);
      res.json(lessons);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lessons" });
    }
  });

  app.post("/api/courses/:courseId/lessons", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!(await isTrainer(userId))) return res.status(403).json({ message: "Forbidden" });
      const schema = z.object({
        titleAr: z.string().min(1),
        titleEn: z.string().optional().nullable(),
        contentAr: z.string().optional().nullable(),
        contentEn: z.string().optional().nullable(),
        videoUrl: z.string().optional().nullable(),
        orderIndex: z.coerce.number().int().optional(),
        durationMinutes: z.coerce.number().int().optional(),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data" });
      const lesson = await storage.createLesson({ ...parsed.data, courseId: req.params.courseId });
      res.status(201).json(lesson);
    } catch (error) {
      res.status(500).json({ message: "Failed to create lesson" });
    }
  });

  app.get("/api/courses/:courseId/quizzes", isAuthenticated, async (req: any, res) => {
    try {
      const quizzes = await storage.getQuizzesByCourse(req.params.courseId);
      res.json(quizzes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quizzes" });
    }
  });

  app.post("/api/courses/:courseId/quizzes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!(await isTrainer(userId))) return res.status(403).json({ message: "Forbidden" });
      const schema = z.object({
        titleAr: z.string().min(1),
        titleEn: z.string().optional().nullable(),
        type: z.enum(["intermediate", "final"]).optional(),
        passingScore: z.coerce.number().int().min(1).max(100).optional(),
        orderIndex: z.coerce.number().int().optional(),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data" });
      const quiz = await storage.createQuiz({ ...parsed.data, courseId: req.params.courseId });
      res.status(201).json(quiz);
    } catch (error) {
      res.status(500).json({ message: "Failed to create quiz" });
    }
  });

  app.get("/api/quizzes/:quizId/questions", isAuthenticated, async (req: any, res) => {
    try {
      const questions = await storage.getQuestionsByQuiz(req.params.quizId);
      res.json(questions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  app.post("/api/quizzes/:quizId/questions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!(await isTrainer(userId))) return res.status(403).json({ message: "Forbidden" });
      const schema = z.object({
        questionAr: z.string().min(1),
        questionEn: z.string().optional().nullable(),
        options: z.array(z.object({ textAr: z.string(), textEn: z.string().optional() })).min(2),
        correctAnswer: z.number().int().min(0),
        orderIndex: z.coerce.number().int().optional(),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data" });
      const question = await storage.createQuestion({ ...parsed.data, quizId: req.params.quizId });
      res.status(201).json(question);
    } catch (error) {
      res.status(500).json({ message: "Failed to create question" });
    }
  });

  app.post("/api/quizzes/:quizId/attempt", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const quiz = await storage.getQuizById(req.params.quizId);
      if (!quiz) return res.status(404).json({ message: "Quiz not found" });
      const schema = z.object({ answers: z.array(z.number().int()) });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data" });
      const questions = await storage.getQuestionsByQuiz(req.params.quizId);
      let correct = 0;
      parsed.data.answers.forEach((ans, i) => { if (i < questions.length && questions[i].correctAnswer === ans) correct++; });
      const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
      const passed = score >= (quiz.passingScore || 60);
      const attempt = await storage.createQuizAttempt({ quizId: req.params.quizId, userId, score, passed, answers: parsed.data.answers });
      res.status(201).json(attempt);
    } catch (error) {
      res.status(500).json({ message: "Failed to submit quiz" });
    }
  });

  app.get("/api/quizzes/:quizId/attempts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const attempts = await storage.getQuizAttempts(req.params.quizId, userId);
      res.json(attempts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attempts" });
    }
  });

  app.get("/api/courses/:courseId/projects", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!(await isTrainer(userId))) return res.status(403).json({ message: "Forbidden" });
      const submissions = await storage.getProjectSubmissions(req.params.courseId);
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post("/api/courses/:courseId/projects", isAuthenticated, upload.single("project"), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const schema = z.object({
        titleAr: z.string().min(1),
        titleEn: z.string().optional().nullable(),
        descriptionAr: z.string().optional().nullable(),
        descriptionEn: z.string().optional().nullable(),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data" });
      const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
      const submission = await storage.createProjectSubmission({ ...parsed.data, courseId: req.params.courseId, userId, fileUrl });
      res.status(201).json(submission);
    } catch (error) {
      res.status(500).json({ message: "Failed to submit project" });
    }
  });

  app.post("/api/projects/:id/grade", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!(await isTrainer(userId))) return res.status(403).json({ message: "Forbidden" });
      const schema = z.object({ grade: z.number().int().min(0).max(100), feedback: z.string().optional() });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data" });
      const result = await storage.gradeProject(req.params.id, userId, parsed.data.grade, parsed.data.feedback || "");
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to grade project" });
    }
  });

  app.get("/api/enrollments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const enrollments = await storage.getEnrollmentsByUser(userId);
      res.json(enrollments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  app.post("/api/enrollments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!(await canStudentAccess(userId))) return res.status(403).json({ message: "Forbidden" });
      const schema = z.object({ courseId: z.string().min(1) });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data" });
      const existing = await storage.getEnrollment(userId, parsed.data.courseId);
      if (existing) return res.status(409).json({ message: "Already enrolled" });
      const enrollment = await storage.createEnrollment({ userId, courseId: parsed.data.courseId });
      res.status(201).json(enrollment);
    } catch (error) {
      res.status(500).json({ message: "Failed to enroll" });
    }
  });

  app.post("/api/lessons/:lessonId/complete", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!(await canStudentAccess(userId))) return res.status(403).json({ message: "Forbidden" });
      const progress = await storage.markLessonComplete(userId, req.params.lessonId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark lesson complete" });
    }
  });

  app.get("/api/courses/:courseId/progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progress = await storage.getUserLessonProgress(userId, req.params.courseId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  app.get("/api/certificates", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const certs = await storage.getCertificatesByUser(userId);
      res.json(certs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch certificates" });
    }
  });

  app.get("/api/certificates/verify/:code", async (req, res) => {
    try {
      const cert = await storage.getCertificateByVerification(req.params.code);
      if (!cert) return res.status(404).json({ message: "Certificate not found" });
      res.json(cert);
    } catch (error) {
      res.status(500).json({ message: "Failed to verify certificate" });
    }
  });

  app.post("/api/courses/:courseId/complete", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const enrollment = await storage.getEnrollment(userId, req.params.courseId);
      if (!enrollment) return res.status(404).json({ message: "Not enrolled" });
      if (enrollment.isCompleted) return res.status(400).json({ message: "Already completed" });

      const completed = await storage.completeEnrollment(enrollment.id);
      const course = await storage.getCourseById(req.params.courseId);
      const cert = await storage.createCertificate({
        userId,
        courseId: req.params.courseId,
        type: "course_completion",
        titleAr: `شهادة إتمام: ${course?.titleAr || ""}`,
        titleEn: `Completion Certificate: ${course?.titleEn || ""}`,
      });
      storage.createAuditLog({ actorUserId: userId, action: "course_completed", entityType: "course", entityId: req.params.courseId, details: { certificateId: cert.id } }).catch(() => {});
      storage.createAuditLog({ actorUserId: userId, action: "certificate_issued", entityType: "certificate", entityId: cert.id, details: { courseId: req.params.courseId, type: "course_completion" } }).catch(() => {});
      res.json({ enrollment: completed, certificate: cert });
    } catch (error) {
      res.status(500).json({ message: "Failed to complete course" });
    }
  });

  app.get("/api/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!(await isSupervisor(userId))) return res.status(403).json({ message: "Forbidden" });
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/audit-logs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!(await isSupervisor(userId))) return res.status(403).json({ message: "Forbidden" });
      const logs = await storage.getAuditLogs(200);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  app.get("/api/reports/hours-by-student", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!(await isSupervisor(userId))) return res.status(403).json({ message: "Forbidden" });
      const data = await storage.getReportHoursByStudent();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch report" });
    }
  });

  app.get("/api/reports/students-by-major", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!(await isSupervisor(userId))) return res.status(403).json({ message: "Forbidden" });
      const data = await storage.getReportStudentsByMajor();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch report" });
    }
  });

  app.get("/api/reports/completed-courses", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!(await isSupervisor(userId))) return res.status(403).json({ message: "Forbidden" });
      const data = await storage.getReportCompletedCourses();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch report" });
    }
  });

  app.get("/api/reports/approved-activities", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!(await isSupervisor(userId))) return res.status(403).json({ message: "Forbidden" });
      const data = await storage.getReportApprovedActivities();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch report" });
    }
  });

  app.post("/api/admin/issue-certificate", isAuthenticated, async (req: any, res) => {
    try {
      const actorId = req.user.claims.sub;
      if (!(await isSupervisor(actorId))) return res.status(403).json({ message: "Forbidden" });

      const schema = z.object({
        userId: z.string().min(1),
        courseId: z.string().min(1),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data" });

      const course = await storage.getCourseById(parsed.data.courseId);
      const cert = await storage.createCertificate({
        userId: parsed.data.userId,
        courseId: parsed.data.courseId,
        type: "course_completion",
        titleAr: `شهادة إتمام (إصدار إداري): ${course?.titleAr || ""}`,
        titleEn: `Completion Certificate (Admin Issued): ${course?.titleEn || ""}`,
      });

      storage.createAuditLog({
        actorUserId: actorId,
        action: "admin_certificate_issued",
        entityType: "certificate",
        entityId: cert.id,
        details: { targetUserId: parsed.data.userId, courseId: parsed.data.courseId }
      }).catch(() => {});

      res.json(cert);
    } catch (error) {
      console.error("Admin certificate issuance error:", error);
      res.status(500).json({ message: "Failed to issue certificate" });
    }
  });

  app.get("/api/admin/users", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!(await isSupervisor(userId))) return res.status(403).json({ message: "Forbidden" });
      const users = await storage.getAllUsersWithProfiles();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/users/:id/role", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!(await isSupervisor(userId))) return res.status(403).json({ message: "Forbidden" });
      const schema = z.object({
        role: z.enum(["student", "trainer", "supervisor"]),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data" });
      const profile = await storage.updateUserRole(req.params.id, parsed.data.role);
      storage.createAuditLog({
        actorUserId: userId,
        action: "role_change",
        entityType: "student_profile",
        entityId: profile.id,
        details: { targetUserId: req.params.id, newRole: parsed.data.role },
      }).catch(() => {});
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  app.post("/api/admin/users", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!(await isSupervisor(userId))) return res.status(403).json({ message: "Forbidden" });
      const schema = z.object({
        email: z.string().email(),
        password: z.string().min(6),
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        role: z.enum(["student", "trainer", "supervisor"]),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data" });

      const { authStorage } = await import("./replit_integrations/auth/storage");
      const bcrypt = await import("bcryptjs");
      const existing = await authStorage.getUserByEmail(parsed.data.email);
      if (existing) return res.status(409).json({ message: "البريد مسجل بالفعل / Email already registered" });

      const hashedPassword = await bcrypt.hash(parsed.data.password, 10);
      const newUser = await authStorage.upsertUser({
        email: parsed.data.email,
        password: hashedPassword,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
      });

      await storage.upsertStudentProfile({
        userId: newUser.id,
        role: parsed.data.role,
      });

      storage.createAuditLog({
        actorUserId: userId,
        action: "admin_create_user",
        entityType: "user",
        entityId: newUser.id,
        details: { email: parsed.data.email, role: parsed.data.role },
      }).catch(() => {});

      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json({ ...userWithoutPassword, role: parsed.data.role });
    } catch (error) {
      console.error("Admin create user error:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.post("/api/admin/users/:id/reset-password", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!(await isSupervisor(userId))) return res.status(403).json({ message: "Forbidden" });
      const schema = z.object({ newPassword: z.string().min(6) });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });

      const bcrypt = await import("bcryptjs");
      const hashedPassword = await bcrypt.hash(parsed.data.newPassword, 10);
      const { authStorage } = await import("./replit_integrations/auth/storage");
      const targetUser = await authStorage.getUser(req.params.id);
      if (!targetUser) return res.status(404).json({ message: "User not found" });

      await authStorage.upsertUser({ ...targetUser, password: hashedPassword });

      storage.createAuditLog({
        actorUserId: userId,
        action: "password_reset",
        entityType: "user",
        entityId: req.params.id,
        details: { targetEmail: targetUser.email },
      }).catch(() => {});

      res.json({ message: "تم تغيير كلمة المرور بنجاح / Password reset successfully" });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  app.delete("/api/lessons/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!(await isTrainer(userId)) && !(await isSupervisor(userId))) return res.status(403).json({ message: "Forbidden" });
      await storage.deleteLesson(req.params.id);
      res.json({ message: "Lesson deleted" });
    } catch (error) {
      console.error("Delete lesson error:", error);
      res.status(500).json({ message: "Failed to delete lesson" });
    }
  });

  app.delete("/api/courses/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!(await isTrainer(userId)) && !(await isSupervisor(userId))) return res.status(403).json({ message: "Forbidden" });
      await storage.deleteCourse(req.params.id);
      res.json({ message: "Course deleted" });
    } catch (error) {
      console.error("Delete course error:", error);
      res.status(500).json({ message: "Failed to delete course" });
    }
  });

  const openai = new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });

  app.post("/api/ai/chat", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const aiSchema = z.object({
        message: z.string().min(1),
        language: z.enum(["ar", "en"]).optional().default("ar"),
      });
      const parsed = aiSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid request" });
      const { message, language } = parsed.data;
      const lang = language;

      const [profile, activities, enrollmentsData, coursesData, certificatesData] = await Promise.all([
        storage.getStudentProfile(userId),
        storage.getActivitiesByUser(userId),
        storage.getEnrollmentsByUser(userId),
        storage.getCourses(),
        storage.getCertificatesByUser(userId),
      ]);

      const user = await authStorage.getUser(userId);
      const approved = activities.filter((a: any) => a.status === "approved");
      const hoursByType: Record<string, number> = {};
      approved.forEach((a: any) => {
        hoursByType[a.type] = (hoursByType[a.type] || 0) + a.hours;
      });

      const neededTypes = Object.entries(ACTIVITY_MIN_HOURS)
        .map(([type, required]) => ({
          type,
          required,
          current: hoursByType[type] || 0,
          remaining: required - (hoursByType[type] || 0),
        }))
        .filter((item) => item.remaining > 0);

      const enrolledCourseIds = new Set(enrollmentsData.map((e: any) => e.courseId));
      const completedEnrollments = enrollmentsData.filter((e: any) => e.isCompleted);
      const availableCourses = coursesData.filter((c: any) => c.isPublished && !enrolledCourseIds.has(c.id));

      const systemPrompt = lang === "ar" 
        ? `أنت مساعد ذكي متخصص في نظام السجل المهاري للكلية التقنية. تساعد الطلاب في تتبع أنشطتهم وساعاتهم وتقدمهم. أجب دائماً باللغة العربية.

معلومات الطالب:
- الاسم: ${user?.firstName || ""} ${user?.lastName || ""}
- الرقم التدريبي: ${profile?.studentId || "غير محدد"}
- التخصص: ${profile?.major || "غير محدد"}
- الأنشطة المعتمدة: ${approved.length}
- إجمالي الساعات المعتمدة: ${approved.reduce((s: number, a: any) => s + a.hours, 0)}
- الدورات المسجلة: ${enrollmentsData.length}
- الدورات المكتملة: ${completedEnrollments.length}
- الشهادات: ${certificatesData.length}

الساعات المطلوبة لكل فئة:
${Object.entries(ACTIVITY_MIN_HOURS).map(([type, req]) => `- ${type}: مطلوب ${req} ساعة، متحقق ${hoursByType[type] || 0} ساعة`).join("\n")}

الفئات التي تحتاج ساعات إضافية:
${neededTypes.length > 0 ? neededTypes.map(n => `- ${n.type}: يحتاج ${n.remaining} ساعة إضافية`).join("\n") : "لا يوجد - أكمل جميع الفئات!"}

الدورات المتاحة للتسجيل:
${availableCourses.slice(0, 5).map((c: any) => `- ${c.titleAr} (${c.duration} ساعة)`).join("\n") || "لا توجد دورات متاحة حالياً"}

الأنشطة المعتمدة للطالب:
${approved.slice(0, 10).map((a: any) => `- ${a.nameAr} (${a.type}, ${a.hours} ساعة، ${a.organization})`).join("\n") || "لا توجد أنشطة معتمدة بعد"}

ساعد الطالب بتقديم نصائح واقتراحات مفيدة لإكمال سجله المهاري. كن ودوداً ومختصراً.`
        : `You are an intelligent assistant specialized in the Skill Record system for the Technical College. You help students track activities, hours, and progress. Always respond in English.

Student Info:
- Name: ${user?.firstName || ""} ${user?.lastName || ""}
- Student ID: ${profile?.studentId || "Not set"}
- Major: ${profile?.major || "Not set"}
- Approved activities: ${approved.length}
- Total approved hours: ${approved.reduce((s: number, a: any) => s + a.hours, 0)}
- Enrolled courses: ${enrollmentsData.length}
- Completed courses: ${completedEnrollments.length}
- Certificates: ${certificatesData.length}

Required hours per category:
${Object.entries(ACTIVITY_MIN_HOURS).map(([type, req]) => `- ${type}: required ${req}h, achieved ${hoursByType[type] || 0}h`).join("\n")}

Categories needing more hours:
${neededTypes.length > 0 ? neededTypes.map(n => `- ${n.type}: needs ${n.remaining} more hours`).join("\n") : "None - all categories completed!"}

Available courses for enrollment:
${availableCourses.slice(0, 5).map((c: any) => `- ${c.titleEn || c.titleAr} (${c.duration} hours)`).join("\n") || "No courses available currently"}

Approved activities:
${approved.slice(0, 10).map((a: any) => `- ${a.nameEn || a.nameAr} (${a.type}, ${a.hours}h, ${a.organization})`).join("\n") || "No approved activities yet"}

Help the student with useful advice and suggestions to complete their skill record. Be friendly and concise.`;

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = await openai.chat.completions.create({
        model: "gpt-5-nano",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        stream: true,
        max_completion_tokens: 8192,
      });

      let fullResponse = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullResponse += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("AI chat error:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "AI error" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ message: "AI chat failed" });
      }
    }
  });

  return httpServer;
}
