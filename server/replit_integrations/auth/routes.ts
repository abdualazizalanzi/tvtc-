import type { Express } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./replitAuth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { storage } from "../../storage";

export function registerAuthRoutes(app: Express): void {
  app.post("/api/auth/register", async (req: any, res) => {
    try {
      const schema = z.object({
        email: z.string().email(),
        password: z.string().min(6),
        firstName: z.string().min(1),
        lastName: z.string().min(1),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "بيانات غير صالحة / Invalid data", errors: parsed.error.flatten() });
      }

      const existing = await authStorage.getUserByEmail(parsed.data.email);
      if (existing) {
        return res.status(409).json({ message: "البريد الإلكتروني مسجل بالفعل / Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(parsed.data.password, 10);
      const user = await authStorage.upsertUser({
        email: parsed.data.email,
        password: hashedPassword,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
      });

      await storage.upsertStudentProfile({
        userId: user.id,
        role: "student",
      });

      req.session.userId = user.id;
      req.session.save(() => {
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ message: "فشل التسجيل / Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req: any, res) => {
    try {
      const schema = z.object({
        email: z.string().email(),
        password: z.string().min(1),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "بيانات غير صالحة / Invalid data" });
      }

      const user = await authStorage.getUserByEmail(parsed.data.email);
      if (!user || !user.password) {
        return res.status(401).json({ message: "البريد أو كلمة المرور غير صحيحة / Invalid email or password" });
      }

      const valid = await bcrypt.compare(parsed.data.password, user.password);
      if (!valid) {
        return res.status(401).json({ message: "البريد أو كلمة المرور غير صحيحة / Invalid email or password" });
      }

      req.session.userId = user.id;
      req.session.save(() => {
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "فشل تسجيل الدخول / Login failed" });
    }
  });

  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await authStorage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/auth/logout", (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "فشل تسجيل الخروج / Logout failed" });
      }
      res.clearCookie("sejali.sid");
      res.json({ message: "تم تسجيل الخروج / Logged out" });
    });
  });
}
