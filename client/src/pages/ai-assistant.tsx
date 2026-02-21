import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bot,
  Sparkles,
  FileText,
  Brain,
  MessageSquare,
  Lightbulb,
  GraduationCap,
  Send,
} from "lucide-react";
import {
  ACTIVITY_MIN_HOURS,
  type Activity,
  type Course,
  type CourseEnrollment,
  type Certificate,
  type StudentProfile,
} from "@shared/schema";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "text" | "activities" | "courses" | "cv";
}

export default function AIAssistantPage() {
  const { t, lang, isRtl } = useI18n();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { data: activities, isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery<CourseEnrollment[]>({
    queryKey: ["/api/enrollments"],
  });

  const { data: courses, isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { data: profile, isLoading: profileLoading } = useQuery<StudentProfile>({
    queryKey: ["/api/profile"],
  });

  const { data: certificates, isLoading: certificatesLoading } = useQuery<Certificate[]>({
    queryKey: ["/api/certificates"],
  });

  const isLoading = activitiesLoading || enrollmentsLoading || coursesLoading || profileLoading || certificatesLoading;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const approved = activities?.filter((a) => a.status === "approved") || [];
  const hoursByType: Record<string, number> = {};
  approved.forEach((a) => {
    hoursByType[a.type] = (hoursByType[a.type] || 0) + a.hours;
  });

  const addMessage = (role: "user" | "assistant", content: string, type?: ChatMessage["type"]) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString() + Math.random(), role, content, type: type || "text" },
    ]);
  };

  const simulateDelay = () => new Promise((resolve) => setTimeout(resolve, 800));

  const handleSuggestActivities = async () => {
    addMessage("user", t("ai.suggestActivities"));
    setIsAnalyzing(true);
    await simulateDelay();

    const neededTypes = Object.entries(ACTIVITY_MIN_HOURS)
      .map(([type, required]) => {
        const current = hoursByType[type] || 0;
        const remaining = required - current;
        return { type, required, current, remaining };
      })
      .filter((item) => item.remaining > 0)
      .sort((a, b) => b.remaining - a.remaining);

    let response = "";
    if (neededTypes.length === 0) {
      response = lang === "ar"
        ? "تهانينا! لقد أكملت جميع الساعات المطلوبة في كل الفئات. سجلك المهاري مكتمل."
        : "Congratulations! You have completed all required hours in every category. Your skill record is complete.";
    } else {
      const header = lang === "ar"
        ? "بناءً على تحليل سجلك المهاري، تحتاج إلى مزيد من الساعات في الفئات التالية:\n\n"
        : "Based on your skill record analysis, you need more hours in the following categories:\n\n";

      const items = neededTypes.map((item) => {
        const typeName = t(`activity.types.${item.type}`);
        const hoursWord = t("courses.hours");
        if (lang === "ar") {
          return `• ${typeName}: تحتاج ${item.remaining} ${hoursWord} إضافية (لديك ${item.current} من أصل ${item.required})`;
        }
        return `• ${typeName}: Need ${item.remaining} more ${hoursWord} (${item.current}/${item.required})`;
      });

      const suggestions = lang === "ar"
        ? "\n\nاقتراحات:\n" + neededTypes.slice(0, 3).map((item) => {
            const typeName = t(`activity.types.${item.type}`);
            return `💡 ابحث عن فرص في مجال "${typeName}" لإكمال ساعاتك المتبقية`;
          }).join("\n")
        : "\n\nSuggestions:\n" + neededTypes.slice(0, 3).map((item) => {
            const typeName = t(`activity.types.${item.type}`);
            return `💡 Look for opportunities in "${typeName}" to complete your remaining hours`;
          }).join("\n");

      response = header + items.join("\n") + suggestions;
    }

    addMessage("assistant", response, "activities");
    setIsAnalyzing(false);
  };

  const handleSuggestCourses = async () => {
    addMessage("user", t("ai.suggestCourses"));
    setIsAnalyzing(true);
    await simulateDelay();

    const enrolledCourseIds = new Set(enrollments?.map((e) => e.courseId) || []);
    const availableCourses = courses?.filter((c) => c.isPublished && !enrolledCourseIds.has(c.id)) || [];

    let response = "";
    if (availableCourses.length === 0) {
      response = lang === "ar"
        ? "أنت مسجّل في جميع الدورات المتاحة حالياً. استمر في إكمال دوراتك الحالية!"
        : "You're enrolled in all available courses. Keep completing your current ones!";
    } else {
      const header = lang === "ar"
        ? `بناءً على ملفك الشخصي${profile?.major ? ` (تخصص: ${profile.major})` : ""}، إليك الدورات المقترحة:\n\n`
        : `Based on your profile${profile?.major ? ` (Major: ${profile.major})` : ""}, here are suggested courses:\n\n`;

      const courseItems = availableCourses.slice(0, 5).map((course) => {
        const title = lang === "ar" ? course.titleAr : (course.titleEn || course.titleAr);
        const desc = lang === "ar" ? (course.descriptionAr || "") : (course.descriptionEn || course.descriptionAr || "");
        const duration = course.duration;
        const hoursWord = t("courses.hours");
        return `📚 ${title} (${duration} ${hoursWord})\n   ${desc ? desc.substring(0, 80) + (desc.length > 80 ? "..." : "") : ""}`;
      });

      const footer = lang === "ar"
        ? "\n\nيمكنك التسجيل في أي من هذه الدورات من صفحة الدورات التدريبية."
        : "\n\nYou can enroll in any of these courses from the Training Courses page.";

      response = header + courseItems.join("\n\n") + footer;
    }

    addMessage("assistant", response, "courses");
    setIsAnalyzing(false);
  };

  const handleGenerateCV = async () => {
    addMessage("user", t("ai.generateCV"));
    setIsAnalyzing(true);
    await simulateDelay();

    const completedEnrollments = enrollments?.filter((e) => e.isCompleted) || [];
    const completedCourseIds = new Set(completedEnrollments.map((e) => e.courseId));
    const completedCourseDetails = courses?.filter((c) => completedCourseIds.has(c.id)) || [];

    const divider = "━".repeat(40);

    let cv = "";
    if (lang === "ar") {
      cv = `${divider}\n`;
      cv += `السيرة الذاتية - السجل المهاري\n`;
      cv += `${divider}\n\n`;
      cv += `الاسم: ${user?.firstName || ""} ${user?.lastName || ""}\n`;
      if (profile?.studentId) cv += `الرقم التدريبي: ${profile.studentId}\n`;
      if (profile?.major) cv += `التخصص: ${profile.major}\n`;
      if (profile?.phone) cv += `الجوال: ${profile.phone}\n`;
      cv += `\n${divider}\n`;
      cv += `الأنشطة المعتمدة (${approved.length})\n`;
      cv += `${divider}\n\n`;
      if (approved.length > 0) {
        approved.forEach((a) => {
          cv += `• ${a.nameAr}\n`;
          cv += `  الجهة: ${a.organization} | الساعات: ${a.hours} | النوع: ${t(`activity.types.${a.type}`)}\n\n`;
        });
      } else {
        cv += `لا توجد أنشطة معتمدة بعد.\n\n`;
      }

      cv += `${divider}\n`;
      cv += `الدورات المكتملة (${completedCourseDetails.length})\n`;
      cv += `${divider}\n\n`;
      if (completedCourseDetails.length > 0) {
        completedCourseDetails.forEach((c) => {
          cv += `• ${c.titleAr} (${c.duration} ${t("courses.hours")})\n`;
        });
      } else {
        cv += `لا توجد دورات مكتملة بعد.\n\n`;
      }

      if (certificates && certificates.length > 0) {
        cv += `\n${divider}\n`;
        cv += `الشهادات (${certificates.length})\n`;
        cv += `${divider}\n\n`;
        certificates.forEach((cert) => {
          cv += `• ${cert.titleAr}\n`;
          if (cert.verificationCode) cv += `  رمز التحقق: ${cert.verificationCode}\n`;
        });
      }

      cv += `\n${divider}\n`;
      cv += `ملخص الساعات\n`;
      cv += `${divider}\n\n`;
      Object.entries(ACTIVITY_MIN_HOURS).forEach(([type, required]) => {
        const current = hoursByType[type] || 0;
        const status = current >= required ? "✓" : `${current}/${required}`;
        cv += `${t(`activity.types.${type}`)}: ${status}\n`;
      });
    } else {
      cv = `${divider}\n`;
      cv += `CURRICULUM VITAE - Skill Record\n`;
      cv += `${divider}\n\n`;
      cv += `Name: ${user?.firstName || ""} ${user?.lastName || ""}\n`;
      if (profile?.studentId) cv += `Student ID: ${profile.studentId}\n`;
      if (profile?.major) cv += `Major: ${profile.major}\n`;
      if (profile?.phone) cv += `Phone: ${profile.phone}\n`;
      cv += `\n${divider}\n`;
      cv += `APPROVED ACTIVITIES (${approved.length})\n`;
      cv += `${divider}\n\n`;
      if (approved.length > 0) {
        approved.forEach((a) => {
          cv += `• ${a.nameEn || a.nameAr}\n`;
          cv += `  Organization: ${a.organization} | Hours: ${a.hours} | Type: ${t(`activity.types.${a.type}`)}\n\n`;
        });
      } else {
        cv += `No approved activities yet.\n\n`;
      }

      cv += `${divider}\n`;
      cv += `COMPLETED COURSES (${completedCourseDetails.length})\n`;
      cv += `${divider}\n\n`;
      if (completedCourseDetails.length > 0) {
        completedCourseDetails.forEach((c) => {
          cv += `• ${c.titleEn || c.titleAr} (${c.duration} ${t("courses.hours")})\n`;
        });
      } else {
        cv += `No completed courses yet.\n\n`;
      }

      if (certificates && certificates.length > 0) {
        cv += `\n${divider}\n`;
        cv += `CERTIFICATES (${certificates.length})\n`;
        cv += `${divider}\n\n`;
        certificates.forEach((cert) => {
          cv += `• ${cert.titleEn || cert.titleAr}\n`;
          if (cert.verificationCode) cv += `  Verification: ${cert.verificationCode}\n`;
        });
      }

      cv += `\n${divider}\n`;
      cv += `HOURS SUMMARY\n`;
      cv += `${divider}\n\n`;
      Object.entries(ACTIVITY_MIN_HOURS).forEach(([type, required]) => {
        const current = hoursByType[type] || 0;
        const status = current >= required ? "✓" : `${current}/${required}`;
        cv += `${t(`activity.types.${type}`)}: ${status}\n`;
      });
    }

    addMessage("assistant", cv, "cv");
    setIsAnalyzing(false);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    addMessage("user", userMsg);
    setIsAnalyzing(true);
    await simulateDelay();

    const lowerMsg = userMsg.toLowerCase();
    const totalApprovedHours = approved.reduce((sum, a) => sum + a.hours, 0);
    const completedCount = enrollments?.filter((e) => e.isCompleted)?.length || 0;

    let response = "";
    if (lowerMsg.includes("نشاط") || lowerMsg.includes("activit") || lowerMsg.includes("ساعات") || lowerMsg.includes("hours")) {
      const neededTypes = Object.entries(ACTIVITY_MIN_HOURS)
        .filter(([type]) => (hoursByType[type] || 0) < ACTIVITY_MIN_HOURS[type])
        .map(([type]) => t(`activity.types.${type}`));

      response = lang === "ar"
        ? `لديك حالياً ${totalApprovedHours} ساعة معتمدة و${approved.length} نشاط معتمد.${neededTypes.length > 0 ? ` تحتاج إلى إكمال ساعات في: ${neededTypes.join("، ")}.` : " أنت أكملت جميع الفئات!"}`
        : `You currently have ${totalApprovedHours} approved hours and ${approved.length} approved activities.${neededTypes.length > 0 ? ` You need to complete hours in: ${neededTypes.join(", ")}.` : " You've completed all categories!"}`;
    } else if (lowerMsg.includes("دورة") || lowerMsg.includes("دورات") || lowerMsg.includes("course")) {
      const enrolledCount = enrollments?.length || 0;
      response = lang === "ar"
        ? `أنت مسجّل في ${enrolledCount} دورة، منها ${completedCount} مكتملة. يمكنك تصفح المزيد من الدورات من صفحة الدورات التدريبية.`
        : `You're enrolled in ${enrolledCount} courses, ${completedCount} completed. Browse more courses on the Training Courses page.`;
    } else if (lowerMsg.includes("تخصص") || lowerMsg.includes("major") || lowerMsg.includes("مناسب") || lowerMsg.includes("suit")) {
      response = lang === "ar"
        ? `تخصصك هو: ${profile?.major || "غير محدد"}. ننصحك بالبحث عن أنشطة مهنية تخصصية وتطوير ذات تتعلق بتخصصك لتعزيز سجلك المهاري.`
        : `Your major is: ${profile?.major || "Not specified"}. We recommend looking for professional activities and self-development opportunities related to your major to enhance your skill record.`;
    } else if (lowerMsg.includes("سجل") || lowerMsg.includes("record") || lowerMsg.includes("cv") || lowerMsg.includes("سيرة")) {
      const totalRequired = Object.values(ACTIVITY_MIN_HOURS).reduce((s, v) => s + v, 0);
      const totalAchieved = Object.entries(ACTIVITY_MIN_HOURS).reduce((s, [type, req]) => s + Math.min(hoursByType[type] || 0, req), 0);
      const pct = totalRequired > 0 ? Math.round((totalAchieved / totalRequired) * 100) : 0;
      response = lang === "ar"
        ? `تقدمك في السجل المهاري: ${pct}%. لديك ${totalApprovedHours} ساعة معتمدة و${completedCount} دورة مكتملة و${certificates?.length || 0} شهادة.`
        : `Your skill record progress: ${pct}%. You have ${totalApprovedHours} approved hours, ${completedCount} completed courses, and ${certificates?.length || 0} certificates.`;
    } else {
      response = lang === "ar"
        ? `مرحباً! يمكنني مساعدتك في:\n• تحليل أنشطتك واقتراح ما تحتاجه\n• اقتراح دورات مناسبة لك\n• إنشاء سيرة ذاتية من سجلك المهاري\n\nاستخدم الأزرار أدناه أو اسألني عن أنشطتك، دوراتك، أو تخصصك.`
        : `Hello! I can help you with:\n• Analyzing your activities and suggesting what you need\n• Suggesting relevant courses for you\n• Generating a CV from your skill record\n\nUse the buttons below or ask me about your activities, courses, or major.`;
    }

    addMessage("assistant", response);
    setIsAnalyzing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4" data-testid="ai-loading">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto flex flex-col h-[calc(100vh-4rem)]" data-testid="ai-assistant-page">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
          <Bot className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold" data-testid="text-ai-title">{t("ai.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("ai.suggest")}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant="outline"
          onClick={handleSuggestActivities}
          disabled={isAnalyzing}
          data-testid="button-suggest-activities"
        >
          <Lightbulb className="h-4 w-4" />
          <span className="ms-1.5">{t("ai.suggestActivities")}</span>
        </Button>
        <Button
          variant="outline"
          onClick={handleSuggestCourses}
          disabled={isAnalyzing}
          data-testid="button-suggest-courses"
        >
          <GraduationCap className="h-4 w-4" />
          <span className="ms-1.5">{t("ai.suggestCourses")}</span>
        </Button>
        <Button
          variant="outline"
          onClick={handleGenerateCV}
          disabled={isAnalyzing}
          data-testid="button-generate-cv"
        >
          <FileText className="h-4 w-4" />
          <span className="ms-1.5">{t("ai.generateCV")}</span>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-0" data-testid="chat-messages">
        {messages.length === 0 && (
          <Card className="border-dashed" data-testid="chat-empty-state">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Brain className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm max-w-sm">
                {t("ai.askQuestion")}
              </p>
              <p className="text-muted-foreground/60 text-xs mt-2">
                {t("ai.placeholder")}
              </p>
            </CardContent>
          </Card>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? (isRtl ? "justify-start" : "justify-end") : (isRtl ? "justify-end" : "justify-start")} gap-2`}
            data-testid={`chat-message-${msg.role}-${msg.id}`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                {msg.type === "activities" ? <Lightbulb className="h-4 w-4 text-primary" /> :
                 msg.type === "courses" ? <GraduationCap className="h-4 w-4 text-primary" /> :
                 msg.type === "cv" ? <FileText className="h-4 w-4 text-primary" /> :
                 <Sparkles className="h-4 w-4 text-primary" />}
              </div>
            )}
            <Card className={`max-w-[85%] ${msg.role === "user" ? "bg-primary text-primary-foreground" : ""}`}>
              <CardContent className="p-3">
                <pre
                  className={`text-sm whitespace-pre-wrap font-sans leading-relaxed ${msg.role === "user" ? "text-primary-foreground" : ""}`}
                  data-testid={`text-message-content-${msg.id}`}
                >
                  {msg.content}
                </pre>
                {msg.type === "cv" && msg.role === "assistant" && (
                  <div className="mt-3 pt-2 border-t">
                    <Badge variant="secondary" data-testid="badge-cv-generated">
                      <FileText className="h-3 w-3" />
                      <span className="ms-1">{t("ai.generateCV")}</span>
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0 mt-1">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}

        {isAnalyzing && (
          <div className={`flex ${isRtl ? "justify-end" : "justify-start"} gap-2`} data-testid="ai-analyzing">
            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-1">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            </div>
            <Card>
              <CardContent className="p-3">
                <p className="text-sm text-muted-foreground animate-pulse">{t("ai.analyzing")}</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div className="flex gap-2 items-end" data-testid="chat-input-area">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("ai.placeholder")}
          className="resize-none text-sm min-h-[2.5rem] max-h-32"
          rows={1}
          disabled={isAnalyzing}
          data-testid="input-chat-message"
        />
        <Button
          size="icon"
          onClick={handleSendMessage}
          disabled={isAnalyzing || !input.trim()}
          data-testid="button-send-message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
