import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

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

async function isSupervisor(userId: string): Promise<boolean> {
  const profile = await storage.getStudentProfile(userId);
  return profile?.role === "supervisor" || profile?.role === "trainer";
}

async function isTrainer(userId: string): Promise<boolean> {
  const profile = await storage.getStudentProfile(userId);
  return profile?.role === "trainer" || profile?.role === "supervisor";
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

  return httpServer;
}
