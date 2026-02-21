import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/auth-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  FileUp,
  PlayCircle,
  Trophy,
  Upload,
} from "lucide-react";
import type {
  Course,
  CourseLesson,
  CourseQuiz,
  QuizQuestion,
  QuizAttempt,
  ProjectSubmission,
  LessonProgress as LessonProgressType,
} from "@shared/schema";

export default function CoursePlayerPage() {
  const [, params] = useRoute("/courses/:id");
  const courseId = params?.id;
  const { t, lang, isRtl } = useI18n();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("lessons");
  const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number[]>>({});
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectFile, setProjectFile] = useState<File | null>(null);

  const { data: course, isLoading: courseLoading } = useQuery<Course>({
    queryKey: ["/api/courses", courseId],
    enabled: !!courseId,
  });

  const { data: lessons } = useQuery<CourseLesson[]>({
    queryKey: ["/api/courses", courseId, "lessons"],
    enabled: !!courseId,
  });

  const { data: quizzes } = useQuery<CourseQuiz[]>({
    queryKey: ["/api/courses", courseId, "quizzes"],
    enabled: !!courseId,
  });

  const { data: progressData } = useQuery<LessonProgressType[]>({
    queryKey: ["/api/courses", courseId, "progress"],
    enabled: !!courseId,
  });

  const { data: projects } = useQuery<ProjectSubmission[]>({
    queryKey: ["/api/courses", courseId, "projects"],
    enabled: !!courseId,
  });

  const finalQuiz = quizzes?.find((q) => q.type === "final");

  const { data: finalQuizAttempts } = useQuery<QuizAttempt[]>({
    queryKey: ["/api/quizzes", finalQuiz?.id, "attempts"],
    enabled: !!finalQuiz?.id,
  });

  const finalQuizPassed = finalQuizAttempts?.some((a) => a.passed) ?? false;

  const completedLessonIds = new Set(
    progressData?.filter((p) => p.completed).map((p) => p.lessonId) || []
  );

  const totalLessons = lessons?.length || 0;
  const completedCount = completedLessonIds.size;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const handleAuthError = (error: Error) => {
    if (isUnauthorizedError(error)) {
      toast({ title: "Unauthorized", description: "Logging in again...", variant: "destructive" });
      setTimeout(() => { window.location.href = "/api/login"; }, 500);
      return true;
    }
    return false;
  };

  const markCompleteMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      const res = await apiRequest("POST", `/api/lessons/${lessonId}/complete`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: t("common.success") });
      queryClient.invalidateQueries({ queryKey: ["/api/courses", courseId, "progress"] });
    },
    onError: (error: Error) => {
      if (!handleAuthError(error)) {
        toast({ title: t("common.error"), description: error.message, variant: "destructive" });
      }
    },
  });

  const submitQuizMutation = useMutation({
    mutationFn: async ({ quizId, answers }: { quizId: string; answers: number[] }) => {
      const res = await apiRequest("POST", `/api/quizzes/${quizId}/attempt`, { answers });
      return res.json();
    },
    onSuccess: (data: { score: number; passed: boolean }, variables) => {
      toast({
        title: data.passed ? t("quiz.passed") : t("quiz.failed"),
        description: `${t("quiz.score")}: ${data.score}%`,
        variant: data.passed ? "default" : "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes", variables.quizId, "attempts"] });
    },
    onError: (error: Error) => {
      if (!handleAuthError(error)) {
        toast({ title: t("common.error"), description: error.message, variant: "destructive" });
      }
    },
  });

  const submitProjectMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("titleAr", projectTitle);
      formData.append("descriptionAr", projectDescription);
      if (projectFile) formData.append("project", projectFile);
      const res = await fetch(`/api/courses/${courseId}/projects`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      toast({ title: t("common.success") });
      setProjectTitle("");
      setProjectDescription("");
      setProjectFile(null);
      queryClient.invalidateQueries({ queryKey: ["/api/courses", courseId, "projects"] });
    },
    onError: (error: Error) => {
      if (!handleAuthError(error)) {
        toast({ title: t("common.error"), description: error.message, variant: "destructive" });
      }
    },
  });

  const completCourseMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/courses/${courseId}/complete`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: t("courses.completed"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses", courseId] });
    },
    onError: (error: Error) => {
      if (!handleAuthError(error)) {
        toast({ title: t("common.error"), description: error.message, variant: "destructive" });
      }
    },
  });

  const allLessonsComplete = totalLessons > 0 && completedCount >= totalLessons;
  const canComplete = allLessonsComplete && (!finalQuiz || finalQuizPassed);

  function getYouTubeEmbedUrl(url: string) {
    try {
      const parsed = new URL(url);
      let videoId = "";
      if (parsed.hostname.includes("youtube.com")) {
        videoId = parsed.searchParams.get("v") || "";
      } else if (parsed.hostname.includes("youtu.be")) {
        videoId = parsed.pathname.slice(1);
      }
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    } catch {}
    return url;
  }

  if (courseLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto text-center py-16">
        <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-40" />
        <p className="text-muted-foreground">{t("common.noData")}</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto" data-testid="course-player">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/courses")}
        data-testid="button-back"
      >
        {isRtl ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
        <span className="ms-1">{t("common.back")}</span>
      </Button>

      <Card data-testid="course-header">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold" data-testid="text-course-title">
              {lang === "ar" ? course.titleAr : course.titleEn || course.titleAr}
            </h1>
            <p className="text-sm text-muted-foreground mt-1" data-testid="text-course-description">
              {lang === "ar" ? course.descriptionAr : course.descriptionEn || course.descriptionAr}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="text-muted-foreground">{t("courses.progress")}</span>
              <span className="font-medium" data-testid="text-progress-percent">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} data-testid="progress-course" />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="secondary">
              <Clock className="h-3 w-3 me-1" />
              {course.duration} {t("courses.hours")}
            </Badge>
            <Badge variant="secondary">{course.category}</Badge>
            {allLessonsComplete && (
              <Badge variant="default">
                <CheckCircle2 className="h-3 w-3 me-1" />
                {t("courses.completed")}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="tabs-course">
        <TabsList className="w-full">
          <TabsTrigger value="lessons" className="flex-1" data-testid="tab-lessons">
            <BookOpen className="h-4 w-4 me-1.5" />
            {t("courses.lessons")}
          </TabsTrigger>
          <TabsTrigger value="quizzes" className="flex-1" data-testid="tab-quizzes">
            <Trophy className="h-4 w-4 me-1.5" />
            {t("courses.quizzes")}
          </TabsTrigger>
          <TabsTrigger value="project" className="flex-1" data-testid="tab-project">
            <FileUp className="h-4 w-4 me-1.5" />
            {t("courses.project")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lessons" className="space-y-4 mt-4">
          <LessonsTab
            lessons={lessons || []}
            completedLessonIds={completedLessonIds}
            lang={lang}
            t={t}
            onMarkComplete={(id) => markCompleteMutation.mutate(id)}
            isPending={markCompleteMutation.isPending}
            getYouTubeEmbedUrl={getYouTubeEmbedUrl}
          />
        </TabsContent>

        <TabsContent value="quizzes" className="space-y-4 mt-4">
          <QuizzesTab
            quizzes={quizzes || []}
            expandedQuiz={expandedQuiz}
            setExpandedQuiz={setExpandedQuiz}
            quizAnswers={quizAnswers}
            setQuizAnswers={setQuizAnswers}
            lang={lang}
            t={t}
            onSubmitQuiz={(quizId, answers) => submitQuizMutation.mutate({ quizId, answers })}
            isPending={submitQuizMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="project" className="space-y-4 mt-4">
          <ProjectTab
            projects={projects || []}
            projectTitle={projectTitle}
            setProjectTitle={setProjectTitle}
            projectDescription={projectDescription}
            setProjectDescription={setProjectDescription}
            projectFile={projectFile}
            setProjectFile={setProjectFile}
            lang={lang}
            t={t}
            onSubmit={() => submitProjectMutation.mutate()}
            isPending={submitProjectMutation.isPending}
          />
        </TabsContent>
      </Tabs>

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={() => completCourseMutation.mutate()}
          disabled={!canComplete || completCourseMutation.isPending}
          data-testid="button-complete-course"
        >
          <CheckCircle2 className="h-4 w-4 me-2" />
          {t("courses.complete")}
        </Button>
      </div>
    </div>
  );
}

function LessonsTab({
  lessons,
  completedLessonIds,
  lang,
  t,
  onMarkComplete,
  isPending,
  getYouTubeEmbedUrl,
}: {
  lessons: CourseLesson[];
  completedLessonIds: Set<string>;
  lang: string;
  t: (key: string) => string;
  onMarkComplete: (id: string) => void;
  isPending: boolean;
  getYouTubeEmbedUrl: (url: string) => string;
}) {
  if (lessons.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BookOpen className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" />
          <p className="text-muted-foreground">{t("common.noData")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {lessons
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((lesson, index) => {
          const isComplete = completedLessonIds.has(lesson.id);
          return (
            <Card key={lesson.id} data-testid={`card-lesson-${lesson.id}`}>
              <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                      {index + 1}
                    </span>
                    <h3 className="font-semibold" data-testid={`text-lesson-title-${lesson.id}`}>
                      {lang === "ar" ? lesson.titleAr : lesson.titleEn || lesson.titleAr}
                    </h3>
                  </div>
                  {isComplete ? (
                    <Badge variant="default" data-testid={`badge-lesson-complete-${lesson.id}`}>
                      <CheckCircle2 className="h-3 w-3 me-1" />
                      {t("courses.completed")}
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onMarkComplete(lesson.id)}
                      disabled={isPending}
                      data-testid={`button-mark-complete-${lesson.id}`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 me-1" />
                      {t("courses.complete")}
                    </Button>
                  )}
                </div>

                {lesson.videoUrl && (
                  <div className="aspect-video rounded-md overflow-hidden bg-muted" data-testid={`video-lesson-${lesson.id}`}>
                    <iframe
                      src={getYouTubeEmbedUrl(lesson.videoUrl)}
                      title={lang === "ar" ? lesson.titleAr : lesson.titleEn || lesson.titleAr}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                )}

                {(lang === "ar" ? lesson.contentAr : lesson.contentEn || lesson.contentAr) && (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap" data-testid={`text-lesson-content-${lesson.id}`}>
                    {lang === "ar" ? lesson.contentAr : lesson.contentEn || lesson.contentAr}
                  </p>
                )}

                {lesson.durationMinutes && lesson.durationMinutes > 0 && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{lesson.durationMinutes} min</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
    </>
  );
}

function QuizzesTab({
  quizzes,
  expandedQuiz,
  setExpandedQuiz,
  quizAnswers,
  setQuizAnswers,
  lang,
  t,
  onSubmitQuiz,
  isPending,
}: {
  quizzes: CourseQuiz[];
  expandedQuiz: string | null;
  setExpandedQuiz: (id: string | null) => void;
  quizAnswers: Record<string, number[]>;
  setQuizAnswers: (answers: Record<string, number[]>) => void;
  lang: string;
  t: (key: string) => string;
  onSubmitQuiz: (quizId: string, answers: number[]) => void;
  isPending: boolean;
}) {
  if (quizzes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Trophy className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" />
          <p className="text-muted-foreground">{t("common.noData")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {quizzes
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((quiz) => (
          <QuizCard
            key={quiz.id}
            quiz={quiz}
            isExpanded={expandedQuiz === quiz.id}
            onToggle={() => setExpandedQuiz(expandedQuiz === quiz.id ? null : quiz.id)}
            answers={quizAnswers[quiz.id] || []}
            setAnswers={(answers) => setQuizAnswers({ ...quizAnswers, [quiz.id]: answers })}
            lang={lang}
            t={t}
            onSubmit={(answers) => onSubmitQuiz(quiz.id, answers)}
            isPending={isPending}
          />
        ))}
    </>
  );
}

function QuizCard({
  quiz,
  isExpanded,
  onToggle,
  answers,
  setAnswers,
  lang,
  t,
  onSubmit,
  isPending,
}: {
  quiz: CourseQuiz;
  isExpanded: boolean;
  onToggle: () => void;
  answers: number[];
  setAnswers: (answers: number[]) => void;
  lang: string;
  t: (key: string) => string;
  onSubmit: (answers: number[]) => void;
  isPending: boolean;
}) {
  const { data: questions } = useQuery<QuizQuestion[]>({
    queryKey: ["/api/quizzes", quiz.id, "questions"],
    enabled: isExpanded,
  });

  const { data: attempts } = useQuery<QuizAttempt[]>({
    queryKey: ["/api/quizzes", quiz.id, "attempts"],
  });

  const bestAttempt = attempts?.reduce<QuizAttempt | null>(
    (best, a) => (!best || a.score > best.score ? a : best),
    null
  );

  const hasPassed = attempts?.some((a) => a.passed);

  return (
    <Card data-testid={`card-quiz-${quiz.id}`}>
      <CardContent className="p-0">
        <button
          className="w-full p-4 sm:p-6 flex items-center justify-between gap-2 text-start"
          onClick={onToggle}
          data-testid={`button-toggle-quiz-${quiz.id}`}
        >
          <div className="flex items-center gap-3">
            <PlayCircle className="h-5 w-5 text-primary shrink-0" />
            <div>
              <h3 className="font-semibold text-sm">
                {lang === "ar" ? quiz.titleAr : quiz.titleEn || quiz.titleAr}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {quiz.type === "final" ? t("quiz.final") : t("quiz.intermediate")}
                {" · "}
                {t("quiz.passingScore")}: {quiz.passingScore}%
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasPassed && (
              <Badge variant="default" data-testid={`badge-quiz-passed-${quiz.id}`}>
                <CheckCircle2 className="h-3 w-3 me-1" />
                {t("quiz.passed")}
              </Badge>
            )}
            {bestAttempt && !hasPassed && (
              <Badge variant="destructive" data-testid={`badge-quiz-score-${quiz.id}`}>
                {t("quiz.score")}: {bestAttempt.score}%
              </Badge>
            )}
          </div>
        </button>

        {isExpanded && questions && (
          <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-6 border-t pt-4">
            {questions
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((question, qIndex) => {
                const options = (question.options as string[]) || [];
                return (
                  <div key={question.id} className="space-y-3" data-testid={`question-${question.id}`}>
                    <p className="font-medium text-sm">
                      {qIndex + 1}. {lang === "ar" ? question.questionAr : question.questionEn || question.questionAr}
                    </p>
                    <RadioGroup
                      value={answers[qIndex]?.toString() ?? ""}
                      onValueChange={(val) => {
                        const newAnswers = [...answers];
                        newAnswers[qIndex] = parseInt(val);
                        setAnswers(newAnswers);
                      }}
                      data-testid={`radio-group-${question.id}`}
                    >
                      {options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2">
                          <RadioGroupItem
                            value={oIndex.toString()}
                            id={`q-${question.id}-${oIndex}`}
                            data-testid={`radio-${question.id}-${oIndex}`}
                          />
                          <Label htmlFor={`q-${question.id}-${oIndex}`} className="text-sm cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                );
              })}

            <Button
              onClick={() => onSubmit(answers)}
              disabled={isPending || !questions || answers.length < questions.length || answers.some((a) => a === undefined)}
              data-testid={`button-submit-quiz-${quiz.id}`}
            >
              {t("quiz.submit")}
            </Button>

            {attempts && attempts.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  {lang === "ar" ? "المحاولات السابقة" : "Previous Attempts"}
                </p>
                {attempts.map((attempt, i) => (
                  <div key={attempt.id} className="flex items-center gap-2 text-xs" data-testid={`attempt-${attempt.id}`}>
                    <span className="text-muted-foreground">#{i + 1}</span>
                    <span className="font-medium">{t("quiz.score")}: {attempt.score}%</span>
                    <Badge variant={attempt.passed ? "default" : "destructive"} className="text-xs">
                      {attempt.passed ? t("quiz.passed") : t("quiz.failed")}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ProjectTab({
  projects,
  projectTitle,
  setProjectTitle,
  projectDescription,
  setProjectDescription,
  projectFile,
  setProjectFile,
  lang,
  t,
  onSubmit,
  isPending,
}: {
  projects: ProjectSubmission[];
  projectTitle: string;
  setProjectTitle: (v: string) => void;
  projectDescription: string;
  setProjectDescription: (v: string) => void;
  projectFile: File | null;
  setProjectFile: (f: File | null) => void;
  lang: string;
  t: (key: string) => string;
  onSubmit: () => void;
  isPending: boolean;
}) {
  const latestProject = projects.length > 0 ? projects[projects.length - 1] : null;

  return (
    <div className="space-y-4">
      {latestProject && (
        <Card data-testid="card-project-submission">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm">{t("project.title")}</CardTitle>
            <Badge variant={latestProject.grade !== null ? "default" : "secondary"}>
              {latestProject.grade !== null ? t("project.graded") : t("project.pending")}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm font-medium" data-testid="text-project-title">
              {lang === "ar" ? latestProject.titleAr : latestProject.titleEn || latestProject.titleAr}
            </p>
            <p className="text-sm text-muted-foreground" data-testid="text-project-description">
              {lang === "ar" ? latestProject.descriptionAr : latestProject.descriptionEn || latestProject.descriptionAr}
            </p>
            {latestProject.grade !== null && (
              <div className="flex items-center gap-2" data-testid="text-project-grade">
                <span className="text-sm font-medium">{t("trainer.grade")}:</span>
                <span className="text-sm">{latestProject.grade}%</span>
              </div>
            )}
            {latestProject.feedback && (
              <div data-testid="text-project-feedback">
                <span className="text-sm font-medium">{t("trainer.feedback")}:</span>
                <p className="text-sm text-muted-foreground">{latestProject.feedback}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card data-testid="card-project-form">
        <CardHeader>
          <CardTitle className="text-sm">{t("project.submit")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-title">{t("project.title")}</Label>
            <Input
              id="project-title"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              data-testid="input-project-title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-desc">{t("project.description")}</Label>
            <Textarea
              id="project-desc"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              rows={4}
              data-testid="input-project-description"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-file">{t("project.file")}</Label>
            <Input
              id="project-file"
              type="file"
              onChange={(e) => setProjectFile(e.target.files?.[0] || null)}
              data-testid="input-project-file"
            />
          </div>
          <Button
            onClick={onSubmit}
            disabled={isPending || !projectTitle.trim()}
            data-testid="button-submit-project"
          >
            <Upload className="h-4 w-4 me-1.5" />
            {t("project.submit")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
