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
  BarChart3,
  Users,
  ClipboardCheck,
  BookOpen,
  TrendingUp,
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

  const role = profile?.role || "student";
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

  const streamAIResponse = async (userMessage: string, type?: ChatMessage["type"]) => {
    setIsAnalyzing(true);
    const msgId = Date.now().toString() + Math.random();
    setMessages((prev) => [
      ...prev,
      { id: msgId, role: "assistant", content: "", type: type || "text" },
    ]);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: userMessage, language: lang }),
      });

      if (!response.ok) throw new Error("AI request failed");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.content) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === msgId ? { ...m, content: m.content + event.content } : m
                )
              );
            }
            if (event.done) break;
            if (event.error) throw new Error(event.error);
          } catch (e) {
            if (!(e instanceof SyntaxError)) throw e;
          }
        }
      }
    } catch (error) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? {
                ...m,
                content:
                  lang === "ar"
                    ? "عذراً، حدث خطأ أثناء معالجة طلبك. حاول مرة أخرى."
                    : "Sorry, an error occurred while processing your request. Please try again.",
              }
            : m
        )
      );
    }
    setIsAnalyzing(false);
  };

  const handleSuggestActivities = async () => {
    const prompt = lang === "ar"
      ? "حلل سجلي المهاري واقترح الأنشطة التي أحتاجها لإكمال الساعات المطلوبة في كل فئة. اعطني اقتراحات عملية ومحددة."
      : "Analyze my skill record and suggest activities I need to complete the required hours in each category. Give me practical and specific suggestions.";
    addMessage("user", t("ai.suggestActivities"));
    await streamAIResponse(prompt, "activities");
  };

  const handleSuggestCourses = async () => {
    const prompt = lang === "ar"
      ? "اقترح لي دورات تدريبية مناسبة بناءً على تخصصي وسجلي المهاري الحالي. ما الدورات المتاحة التي يجب أن أسجل فيها؟"
      : "Suggest suitable training courses based on my major and current skill record. What available courses should I enroll in?";
    addMessage("user", t("ai.suggestCourses"));
    await streamAIResponse(prompt, "courses");
  };

  const handleGenerateCV = async () => {
    const prompt = lang === "ar"
      ? "أنشئ لي سيرة ذاتية مهنية مبنية على سجلي المهاري تشمل الأنشطة المعتمدة والدورات المكتملة والشهادات وملخص الساعات. رتبها بشكل احترافي."
      : "Generate a professional CV based on my skill record including approved activities, completed courses, certificates and hours summary. Format it professionally.";
    addMessage("user", t("ai.generateCV"));
    await streamAIResponse(prompt, "cv");
  };

  const handleAnalyzePlatform = async () => {
    const prompt = lang === "ar"
      ? "حلل أداء المنصة بشكل شامل. كم عدد المتدربين النشطين؟ ما نسبة الأنشطة المعتمدة؟ ما الدورات الأكثر إقبالاً؟ قدم توصيات لتحسين الأداء."
      : "Analyze the platform performance comprehensively. How many active students? What's the approval rate? Which courses are most popular? Provide recommendations for improvement.";
    addMessage("user", lang === "ar" ? "تحليل أداء المنصة" : "Platform Performance Analysis");
    await streamAIResponse(prompt);
  };

  const handleReviewInsights = async () => {
    const prompt = lang === "ar"
      ? "راجع الأنشطة المعلقة وقدم توصيات بشأن المراجعة. ما الأنماط الشائعة في الأنشطة المقدمة؟ هل هناك مجالات تحتاج اهتماماً خاصاً؟"
      : "Review pending activities and provide recommendations. What are common patterns in submitted activities? Are there areas needing special attention?";
    addMessage("user", lang === "ar" ? "تحليل المراجعات" : "Review Insights");
    await streamAIResponse(prompt);
  };

  const handleCourseImprovement = async () => {
    const prompt = lang === "ar"
      ? "حلل دوراتي التدريبية واقترح تحسينات. كيف أطور المحتوى؟ ما المواضيع الجديدة التي يجب إضافتها؟ كيف أزيد تفاعل المتدربين؟"
      : "Analyze my training courses and suggest improvements. How can I develop the content? What new topics should be added? How to increase student engagement?";
    addMessage("user", lang === "ar" ? "تحسين الدورات" : "Course Improvement");
    await streamAIResponse(prompt);
  };

  const handleNewCourseIdeas = async () => {
    const prompt = lang === "ar"
      ? "اقترح أفكار لدورات تدريبية جديدة بناءً على احتياجات المتدربين والفجوات في الدورات الحالية. ما المهارات المطلوبة في سوق العمل؟"
      : "Suggest new course ideas based on student needs and gaps in current courses. What skills are in demand in the job market?";
    addMessage("user", lang === "ar" ? "أفكار دورات جديدة" : "New Course Ideas");
    await streamAIResponse(prompt);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    addMessage("user", userMsg);
    await streamAIResponse(userMsg);
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
          <p className="text-sm text-muted-foreground">
            {role === "supervisor"
              ? (lang === "ar" ? "مساعدك الذكي لتحليل المنصة وإدارة المستخدمين والأنشطة" : "Your AI assistant for platform analytics, user & activity management")
              : role === "trainer"
              ? (lang === "ar" ? "مساعدك الذكي لتطوير الدورات وتحسين المحتوى التعليمي" : "Your AI assistant for course development and content improvement")
              : t("ai.suggest")}
          </p>
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
        {(role === "trainer" || role === "supervisor") && (
          <>
            <Button
              variant="outline"
              onClick={handleCourseImprovement}
              disabled={isAnalyzing}
              data-testid="button-course-improvement"
            >
              <BookOpen className="h-4 w-4" />
              <span className="ms-1.5">{lang === "ar" ? "تحسين الدورات" : "Improve Courses"}</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleNewCourseIdeas}
              disabled={isAnalyzing}
              data-testid="button-new-course-ideas"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="ms-1.5">{lang === "ar" ? "أفكار دورات جديدة" : "New Course Ideas"}</span>
            </Button>
          </>
        )}
        {role === "supervisor" && (
          <>
            <Button
              variant="outline"
              onClick={handleAnalyzePlatform}
              disabled={isAnalyzing}
              data-testid="button-analyze-platform"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="ms-1.5">{lang === "ar" ? "تحليل المنصة" : "Platform Analytics"}</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleReviewInsights}
              disabled={isAnalyzing}
              data-testid="button-review-insights"
            >
              <ClipboardCheck className="h-4 w-4" />
              <span className="ms-1.5">{lang === "ar" ? "تحليل المراجعات" : "Review Insights"}</span>
            </Button>
          </>
        )}
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
