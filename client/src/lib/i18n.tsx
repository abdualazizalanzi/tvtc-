import { createContext, useContext, useState, useCallback, useEffect } from "react";

type Language = "ar" | "en";

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  dir: "rtl" | "ltr";
  isRtl: boolean;
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    "app.name": "السجل المهاري",
    "app.tagline": "وثّق مهاراتك، ابنِ مستقبلك",
    "nav.home": "الرئيسية",
    "nav.about": "ما هو السجل المهاري",
    "nav.benefits": "الفوائد",
    "nav.howto": "كيفية الحصول عليه",
    "nav.dashboard": "لوحة التحكم",
    "nav.activities": "الأنشطة",
    "nav.addActivity": "إضافة نشاط",
    "nav.courses": "الدورات",
    "nav.review": "مراجعة الطلبات",
    "nav.login": "تسجيل الدخول",
    "nav.logout": "تسجيل الخروج",
    "nav.profile": "الملف الشخصي",
    "landing.hero.title": "السجل المهاري",
    "landing.hero.subtitle": "منصة متكاملة لتوثيق المهارات والأنشطة غير الأكاديمية لطلبة الجامعة",
    "landing.hero.cta": "ابدأ الآن",
    "landing.hero.learnMore": "اعرف المزيد",
    "landing.features.title": "لماذا السجل المهاري؟",
    "landing.features.doc.title": "توثيق شامل",
    "landing.features.doc.desc": "وثّق جميع أنشطتك التطوعية والمهنية والقيادية في مكان واحد",
    "landing.features.career.title": "فرص وظيفية",
    "landing.features.career.desc": "عزز فرصك الوظيفية بسجل مهاري موثّق ومعتمد من الجامعة",
    "landing.features.growth.title": "تطوير مستمر",
    "landing.features.growth.desc": "تابع تقدمك واكتشف المهارات التي تحتاج لتطويرها",
    "landing.about.title": "ما هو السجل المهاري؟",
    "landing.about.desc": "السجل المهاري هو وثيقة رسمية تصدر من الجامعة توثق جميع المهارات والأنشطة غير الأكاديمية التي اكتسبها الطالب خلال مسيرته الجامعية، بما في ذلك العمل التطوعي، والأنشطة الطلابية، والدورات التدريبية، والمهارات القيادية.",
    "landing.benefits.title": "فوائد السجل المهاري",
    "landing.benefits.university": "للجامعة",
    "landing.benefits.university.1": "زيادة التميز لمخرجات الجامعة",
    "landing.benefits.university.2": "توثيق الأنشطة الطلابية",
    "landing.benefits.university.3": "تطوير الحياة الجامعية",
    "landing.benefits.graduate": "للخريج",
    "landing.benefits.graduate.1": "توثيق المهارات غير الأكاديمية",
    "landing.benefits.graduate.2": "زيادة الفرص الوظيفية",
    "landing.benefits.graduate.3": "التحفيز على تطوير الذات",
    "landing.benefits.community": "للمجتمع",
    "landing.benefits.community.1": "تأثير إيجابي عبر الأنشطة المقدمة",
    "landing.howto.title": "كيفية الحصول على السجل المهاري",
    "landing.howto.step1": "سجّل حسابك وأكمل ملفك الشخصي",
    "landing.howto.step2": "أضف أنشطتك مع الإثباتات المطلوبة",
    "landing.howto.step3": "أكمل الساعات المطلوبة في كل فئة",
    "landing.howto.step4": "حمّل سجلك المهاري كملف PDF",
    "dashboard.welcome": "مرحباً",
    "dashboard.totalHours": "إجمالي الساعات",
    "dashboard.approvedActivities": "أنشطة معتمدة",
    "dashboard.pendingActivities": "طلبات قيد المراجعة",
    "dashboard.completedCourses": "دورات مكتملة",
    "dashboard.recentActivities": "أحدث الأنشطة",
    "dashboard.quickActions": "إجراءات سريعة",
    "dashboard.hoursByCategory": "الساعات حسب الفئة",
    "dashboard.whatYouNeed": "ما تحتاجه لإكمال السجل",
    "activity.type": "نوع النشاط",
    "activity.name": "اسم النشاط",
    "activity.organization": "الجهة",
    "activity.hours": "عدد الساعات",
    "activity.startDate": "تاريخ البداية",
    "activity.endDate": "تاريخ النهاية",
    "activity.description": "الوصف",
    "activity.proof": "الإثبات",
    "activity.status": "الحالة",
    "activity.submit": "إرسال الطلب",
    "activity.addNew": "إضافة نشاط جديد",
    "activity.myActivities": "أنشطتي",
    "activity.types.volunteer_work": "العمل التطوعي",
    "activity.types.student_employment": "التشغيل الطلابي",
    "activity.types.participation": "مشاركات وأنشطة",
    "activity.types.self_development": "تطوير الذات",
    "activity.types.awards": "جوائز",
    "activity.types.student_activity": "النشاط الطلابي",
    "activity.types.professional_activity": "أنشطة مهنية",
    "activity.types.leadership_skills": "مهارات قيادية",
    "status.draft": "مسودة",
    "status.submitted": "مرسل",
    "status.under_review": "قيد المراجعة",
    "status.approved": "معتمد",
    "status.rejected": "مرفوض",
    "review.title": "مراجعة الطلبات",
    "review.approve": "اعتماد",
    "review.reject": "رفض",
    "review.reason": "سبب الرفض",
    "review.noRequests": "لا توجد طلبات للمراجعة",
    "courses.title": "الدورات التدريبية",
    "courses.enroll": "التسجيل",
    "courses.enrolled": "مسجّل",
    "courses.hours": "ساعة",
    "courses.category": "التصنيف",
    "courses.search": "ابحث عن دورة...",
    "common.save": "حفظ",
    "common.cancel": "إلغاء",
    "common.edit": "تعديل",
    "common.delete": "حذف",
    "common.loading": "جاري التحميل...",
    "common.noData": "لا توجد بيانات",
    "common.success": "تم بنجاح",
    "common.error": "حدث خطأ",
    "common.viewAll": "عرض الكل",
    "common.back": "رجوع",
    "common.step": "الخطوة",
  },
  en: {
    "app.name": "Skill Record",
    "app.tagline": "Document your skills, build your future",
    "nav.home": "Home",
    "nav.about": "About",
    "nav.benefits": "Benefits",
    "nav.howto": "How to Get It",
    "nav.dashboard": "Dashboard",
    "nav.activities": "Activities",
    "nav.addActivity": "Add Activity",
    "nav.courses": "Courses",
    "nav.review": "Review Requests",
    "nav.login": "Login",
    "nav.logout": "Logout",
    "nav.profile": "Profile",
    "landing.hero.title": "Skill Record",
    "landing.hero.subtitle": "A comprehensive platform for documenting non-academic skills and activities for university students",
    "landing.hero.cta": "Get Started",
    "landing.hero.learnMore": "Learn More",
    "landing.features.title": "Why Skill Record?",
    "landing.features.doc.title": "Complete Documentation",
    "landing.features.doc.desc": "Document all your volunteer, professional, and leadership activities in one place",
    "landing.features.career.title": "Career Opportunities",
    "landing.features.career.desc": "Boost your career prospects with a certified and university-approved skill record",
    "landing.features.growth.title": "Continuous Growth",
    "landing.features.growth.desc": "Track your progress and discover skills you need to develop",
    "landing.about.title": "What is the Skill Record?",
    "landing.about.desc": "The Skill Record is an official document issued by the university that documents all non-academic skills and activities acquired by students during their university journey, including volunteer work, student activities, training courses, and leadership skills.",
    "landing.benefits.title": "Benefits of the Skill Record",
    "landing.benefits.university": "For the University",
    "landing.benefits.university.1": "Excellence in university outputs",
    "landing.benefits.university.2": "Documentation of student activities",
    "landing.benefits.university.3": "Enhancement of campus life",
    "landing.benefits.graduate": "For Graduates",
    "landing.benefits.graduate.1": "Documentation of non-academic skills",
    "landing.benefits.graduate.2": "Increased job opportunities",
    "landing.benefits.graduate.3": "Motivation for self-development",
    "landing.benefits.community": "For the Community",
    "landing.benefits.community.1": "Positive impact through student activities",
    "landing.howto.title": "How to Get the Skill Record",
    "landing.howto.step1": "Register your account and complete your profile",
    "landing.howto.step2": "Add your activities with required proof",
    "landing.howto.step3": "Complete the required hours in each category",
    "landing.howto.step4": "Download your Skill Record as PDF",
    "dashboard.welcome": "Welcome",
    "dashboard.totalHours": "Total Hours",
    "dashboard.approvedActivities": "Approved Activities",
    "dashboard.pendingActivities": "Pending Review",
    "dashboard.completedCourses": "Completed Courses",
    "dashboard.recentActivities": "Recent Activities",
    "dashboard.quickActions": "Quick Actions",
    "dashboard.hoursByCategory": "Hours by Category",
    "dashboard.whatYouNeed": "What You Need to Complete",
    "activity.type": "Activity Type",
    "activity.name": "Activity Name",
    "activity.organization": "Organization",
    "activity.hours": "Hours",
    "activity.startDate": "Start Date",
    "activity.endDate": "End Date",
    "activity.description": "Description",
    "activity.proof": "Proof",
    "activity.status": "Status",
    "activity.submit": "Submit Request",
    "activity.addNew": "Add New Activity",
    "activity.myActivities": "My Activities",
    "activity.types.volunteer_work": "Volunteer Work",
    "activity.types.student_employment": "Student Employment",
    "activity.types.participation": "Participation & Activities",
    "activity.types.self_development": "Self-Development",
    "activity.types.awards": "Awards",
    "activity.types.student_activity": "Student Activity",
    "activity.types.professional_activity": "Professional Activity",
    "activity.types.leadership_skills": "Leadership Skills",
    "status.draft": "Draft",
    "status.submitted": "Submitted",
    "status.under_review": "Under Review",
    "status.approved": "Approved",
    "status.rejected": "Rejected",
    "review.title": "Review Requests",
    "review.approve": "Approve",
    "review.reject": "Reject",
    "review.reason": "Rejection Reason",
    "review.noRequests": "No requests to review",
    "courses.title": "Training Courses",
    "courses.enroll": "Enroll",
    "courses.enrolled": "Enrolled",
    "courses.hours": "hours",
    "courses.category": "Category",
    "courses.search": "Search courses...",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.loading": "Loading...",
    "common.noData": "No data available",
    "common.success": "Success",
    "common.error": "An error occurred",
    "common.viewAll": "View All",
    "common.back": "Back",
    "common.step": "Step",
  },
};

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("lang") as Language) || "ar";
    }
    return "ar";
  });

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("lang", newLang);
  }, []);

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback(
    (key: string) => {
      return translations[lang][key] || key;
    },
    [lang]
  );

  return (
    <I18nContext.Provider
      value={{
        lang,
        setLang,
        t,
        dir: lang === "ar" ? "rtl" : "ltr",
        isRtl: lang === "ar",
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
