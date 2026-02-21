import { db } from "./db";
import { courses } from "@shared/schema";
import { sql } from "drizzle-orm";

export async function seedDatabase() {
  try {
    const existing = await db.select({ count: sql<number>`count(*)` }).from(courses);
    if (existing[0].count > 0) {
      console.log("Database already seeded, skipping...");
      return;
    }

    await db.insert(courses).values([
      {
        titleAr: "مقدمة في البرمجة بلغة بايثون",
        titleEn: "Introduction to Python Programming",
        descriptionAr: "تعلم أساسيات البرمجة باستخدام لغة بايثون من الصفر. يشمل المتغيرات، الحلقات، الدوال، والتعامل مع الملفات.",
        descriptionEn: "Learn programming fundamentals using Python from scratch. Covers variables, loops, functions, and file handling.",
        category: "Programming",
        duration: 20,
        isPublished: true,
      },
      {
        titleAr: "تطوير تطبيقات الويب",
        titleEn: "Web Development Fundamentals",
        descriptionAr: "تعلم تطوير مواقع الويب باستخدام HTML وCSS وJavaScript. بناء مشاريع عملية وتعلم أساسيات التصميم المتجاوب.",
        descriptionEn: "Learn web development using HTML, CSS, and JavaScript. Build practical projects and learn responsive design basics.",
        category: "Web Development",
        duration: 30,
        isPublished: true,
      },
      {
        titleAr: "تحليل البيانات والذكاء الاصطناعي",
        titleEn: "Data Analysis & AI",
        descriptionAr: "مقدمة في تحليل البيانات باستخدام بايثون والمكتبات الشائعة. تعلم أساسيات التعلم الآلي وتطبيقاته العملية.",
        descriptionEn: "Introduction to data analysis using Python and popular libraries. Learn machine learning basics and practical applications.",
        category: "Data Science",
        duration: 25,
        isPublished: true,
      },
      {
        titleAr: "القيادة وإدارة الفرق",
        titleEn: "Leadership & Team Management",
        descriptionAr: "تطوير المهارات القيادية وتعلم أساليب إدارة الفرق الفعّالة. يشمل التواصل، التخطيط، وحل المشكلات.",
        descriptionEn: "Develop leadership skills and learn effective team management methods. Includes communication, planning, and problem-solving.",
        category: "Leadership",
        duration: 15,
        isPublished: true,
      },
      {
        titleAr: "ريادة الأعمال والابتكار",
        titleEn: "Entrepreneurship & Innovation",
        descriptionAr: "تعلم كيفية تحويل الأفكار إلى مشاريع ناجحة. يشمل دراسة الجدوى، خطة العمل، والتمويل.",
        descriptionEn: "Learn how to turn ideas into successful projects. Covers feasibility studies, business plans, and funding.",
        category: "Business",
        duration: 18,
        isPublished: true,
      },
      {
        titleAr: "مهارات التواصل والعرض",
        titleEn: "Communication & Presentation Skills",
        descriptionAr: "تعلم فن التواصل الفعّال ومهارات العرض التقديمي. يشمل التحدث أمام الجمهور والكتابة المهنية.",
        descriptionEn: "Master effective communication and presentation skills. Includes public speaking and professional writing.",
        category: "Soft Skills",
        duration: 10,
        isPublished: true,
      },
    ]);

    console.log("Database seeded successfully with courses");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
