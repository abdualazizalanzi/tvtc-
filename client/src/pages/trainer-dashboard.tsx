import { useI18n } from "@/lib/i18n";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  BookOpen,
  Video,
  ClipboardCheck,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  FileText,
  HelpCircle,
} from "lucide-react";
import { useState } from "react";
import type {
  Course,
  CourseLesson,
  CourseQuiz,
  QuizQuestion,
  ProjectSubmission,
} from "@shared/schema";
import { isUnauthorizedError } from "@/lib/auth-utils";

interface QuizWithQuestions extends CourseQuiz {
  questions?: QuizQuestion[];
}

export default function TrainerDashboard() {
  const { t, lang, isRtl } = useI18n();
  const { toast } = useToast();

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<CourseQuiz | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectSubmission | null>(null);

  const [courseForm, setCourseForm] = useState({
    titleAr: "",
    titleEn: "",
    descriptionAr: "",
    descriptionEn: "",
    category: "",
    duration: 0,
  });

  const [lessonForm, setLessonForm] = useState({
    titleAr: "",
    titleEn: "",
    videoUrl: "",
    contentAr: "",
    contentEn: "",
    orderIndex: 0,
    durationMinutes: 0,
  });

  const [quizForm, setQuizForm] = useState({
    titleAr: "",
    titleEn: "",
    type: "intermediate" as "intermediate" | "final",
    passingScore: 60,
  });

  const [questionForm, setQuestionForm] = useState({
    questionAr: "",
    questionEn: "",
    options: [
      { textAr: "", textEn: "" },
      { textAr: "", textEn: "" },
      { textAr: "", textEn: "" },
      { textAr: "", textEn: "" },
    ],
    correctAnswer: 0,
  });

  const [gradeForm, setGradeForm] = useState({ grade: 0, feedback: "" });

  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses/all"],
  });

  const { data: lessons } = useQuery<CourseLesson[]>({
    queryKey: ["/api/courses", selectedCourse?.id, "lessons"],
    enabled: !!selectedCourse,
  });

  const { data: quizzes } = useQuery<QuizWithQuestions[]>({
    queryKey: ["/api/courses", selectedCourse?.id, "quizzes"],
    enabled: !!selectedCourse,
  });

  const { data: projects } = useQuery<ProjectSubmission[]>({
    queryKey: ["/api/courses", selectedCourse?.id, "projects"],
    enabled: !!selectedCourse,
  });

  function handleAuthError(error: Error) {
    if (isUnauthorizedError(error)) {
      toast({ title: "Unauthorized", description: "Logging in again...", variant: "destructive" });
      setTimeout(() => { window.location.href = "/auth"; }, 500);
      return true;
    }
    return false;
  }

  const createCourseMutation = useMutation({
    mutationFn: async (data: typeof courseForm) => {
      const res = await apiRequest("POST", "/api/courses", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: t("common.success") });
      queryClient.invalidateQueries({ queryKey: ["/api/courses/all"] });
      setCourseDialogOpen(false);
      setCourseForm({ titleAr: "", titleEn: "", descriptionAr: "", descriptionEn: "", category: "", duration: 0 });
    },
    onError: (error: Error) => {
      if (!handleAuthError(error)) {
        toast({ title: t("common.error"), description: error.message, variant: "destructive" });
      }
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, isPublished }: { id: string; isPublished: boolean }) => {
      const res = await apiRequest("PATCH", `/api/courses/${id}`, { isPublished });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: t("common.success") });
      queryClient.invalidateQueries({ queryKey: ["/api/courses/all"] });
    },
    onError: (error: Error) => {
      if (!handleAuthError(error)) {
        toast({ title: t("common.error"), description: error.message, variant: "destructive" });
      }
    },
  });

  const addLessonMutation = useMutation({
    mutationFn: async (data: typeof lessonForm) => {
      const res = await apiRequest("POST", `/api/courses/${selectedCourse!.id}/lessons`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: t("common.success") });
      queryClient.invalidateQueries({ queryKey: ["/api/courses", selectedCourse?.id, "lessons"] });
      setLessonDialogOpen(false);
      setLessonForm({ titleAr: "", titleEn: "", videoUrl: "", contentAr: "", contentEn: "", orderIndex: 0, durationMinutes: 0 });
    },
    onError: (error: Error) => {
      if (!handleAuthError(error)) {
        toast({ title: t("common.error"), description: error.message, variant: "destructive" });
      }
    },
  });

  const addQuizMutation = useMutation({
    mutationFn: async (data: typeof quizForm) => {
      const res = await apiRequest("POST", `/api/courses/${selectedCourse!.id}/quizzes`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: t("common.success") });
      queryClient.invalidateQueries({ queryKey: ["/api/courses", selectedCourse?.id, "quizzes"] });
      setQuizDialogOpen(false);
      setQuizForm({ titleAr: "", titleEn: "", type: "intermediate", passingScore: 60 });
    },
    onError: (error: Error) => {
      if (!handleAuthError(error)) {
        toast({ title: t("common.error"), description: error.message, variant: "destructive" });
      }
    },
  });

  const addQuestionMutation = useMutation({
    mutationFn: async (data: typeof questionForm) => {
      const res = await apiRequest("POST", `/api/quizzes/${selectedQuiz!.id}/questions`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: t("common.success") });
      queryClient.invalidateQueries({ queryKey: ["/api/courses", selectedCourse?.id, "quizzes"] });
      setQuestionDialogOpen(false);
      setQuestionForm({
        questionAr: "", questionEn: "",
        options: [{ textAr: "", textEn: "" }, { textAr: "", textEn: "" }, { textAr: "", textEn: "" }, { textAr: "", textEn: "" }],
        correctAnswer: 0,
      });
    },
    onError: (error: Error) => {
      if (!handleAuthError(error)) {
        toast({ title: t("common.error"), description: error.message, variant: "destructive" });
      }
    },
  });

  const gradeProjectMutation = useMutation({
    mutationFn: async ({ id, grade, feedback }: { id: string; grade: number; feedback: string }) => {
      const res = await apiRequest("POST", `/api/projects/${id}/grade`, { grade, feedback });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: t("common.success") });
      queryClient.invalidateQueries({ queryKey: ["/api/courses", selectedCourse?.id, "projects"] });
      setGradeDialogOpen(false);
      setGradeForm({ grade: 0, feedback: "" });
    },
    onError: (error: Error) => {
      if (!handleAuthError(error)) {
        toast({ title: t("common.error"), description: error.message, variant: "destructive" });
      }
    },
  });

  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  if (selectedCourse) {
    return (
      <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedCourse(null)}
            data-testid="button-back-to-courses"
          >
            <BackArrow className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold truncate">
              {lang === "ar" ? selectedCourse.titleAr : selectedCourse.titleEn || selectedCourse.titleAr}
            </h1>
          </div>
          <Button
            variant={selectedCourse.isPublished ? "outline" : "default"}
            size="sm"
            onClick={() =>
              togglePublishMutation.mutate({
                id: selectedCourse.id,
                isPublished: !selectedCourse.isPublished,
              })
            }
            disabled={togglePublishMutation.isPending}
            data-testid="button-toggle-publish"
          >
            {selectedCourse.isPublished ? (
              <>
                <EyeOff className="h-3.5 w-3.5" />
                <span className="ms-1.5">{t("common.unpublish")}</span>
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5" />
                <span className="ms-1.5">{t("common.publish")}</span>
              </>
            )}
          </Button>
        </div>

        <Tabs defaultValue="lessons">
          <TabsList data-testid="tabs-course-management">
            <TabsTrigger value="lessons" data-testid="tab-lessons">
              <Video className="h-3.5 w-3.5 me-1.5" />
              {t("courses.lessons")}
            </TabsTrigger>
            <TabsTrigger value="quizzes" data-testid="tab-quizzes">
              <HelpCircle className="h-3.5 w-3.5 me-1.5" />
              {t("courses.quizzes")}
            </TabsTrigger>
            <TabsTrigger value="projects" data-testid="tab-projects">
              <FileText className="h-3.5 w-3.5 me-1.5" />
              {t("courses.project")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lessons" className="space-y-4 mt-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h2 className="text-lg font-semibold">{t("trainer.manageLessons")}</h2>
              <Button
                size="sm"
                onClick={() => {
                  setLessonForm((prev) => ({
                    ...prev,
                    orderIndex: (lessons?.length || 0) + 1,
                  }));
                  setLessonDialogOpen(true);
                }}
                data-testid="button-add-lesson"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="ms-1.5">{t("courses.addLesson")}</span>
              </Button>
            </div>

            {lessons && lessons.length > 0 ? (
              <div className="space-y-3">
                {lessons
                  .sort((a, b) => a.orderIndex - b.orderIndex)
                  .map((lesson, idx) => (
                    <Card key={lesson.id} data-testid={`card-lesson-${lesson.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10 text-primary text-sm font-medium shrink-0">
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <h3 className="font-medium text-sm">
                              {lang === "ar" ? lesson.titleAr : lesson.titleEn || lesson.titleAr}
                            </h3>
                            {lesson.videoUrl && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                                <Video className="h-3 w-3 shrink-0" />
                                {lesson.videoUrl}
                              </p>
                            )}
                            {lesson.durationMinutes ? (
                              <Badge variant="secondary" className="text-xs">
                                {lesson.durationMinutes} {t("courses.duration")}
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Video className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" />
                  <p className="text-sm text-muted-foreground">{t("common.noData")}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-4 mt-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h2 className="text-lg font-semibold">{t("trainer.manageQuizzes")}</h2>
              <Button
                size="sm"
                onClick={() => setQuizDialogOpen(true)}
                data-testid="button-add-quiz"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="ms-1.5">{t("courses.addQuiz")}</span>
              </Button>
            </div>

            {quizzes && quizzes.length > 0 ? (
              <div className="space-y-3">
                {quizzes.map((quiz) => (
                  <Card key={quiz.id} data-testid={`card-quiz-${quiz.id}`}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="space-y-1">
                          <h3 className="font-medium text-sm">
                            {lang === "ar" ? quiz.titleAr : quiz.titleEn || quiz.titleAr}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="text-xs">
                              {quiz.type === "final" ? t("quiz.final") : t("quiz.intermediate")}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {t("quiz.passingScore")}: {quiz.passingScore}%
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedQuiz(quiz);
                            setQuestionDialogOpen(true);
                          }}
                          data-testid={`button-add-question-${quiz.id}`}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span className="ms-1.5">{t("quiz.addQuestion")}</span>
                        </Button>
                      </div>

                      {quiz.questions && quiz.questions.length > 0 && (
                        <div className="space-y-2 pt-2 border-t">
                          {quiz.questions.map((q, qIdx) => (
                            <div key={q.id} className="text-sm space-y-1" data-testid={`question-${q.id}`}>
                              <p className="font-medium text-xs">
                                {qIdx + 1}. {lang === "ar" ? q.questionAr : q.questionEn || q.questionAr}
                              </p>
                              <div className="grid grid-cols-2 gap-1 ps-4">
                                {(q.options as Array<{ textAr: string; textEn: string }>).map(
                                  (opt, optIdx) => (
                                    <span
                                      key={optIdx}
                                      className={`text-xs ${
                                        optIdx === q.correctAnswer
                                          ? "text-green-600 dark:text-green-400 font-medium"
                                          : "text-muted-foreground"
                                      }`}
                                    >
                                      {String.fromCharCode(65 + optIdx)}.{" "}
                                      {lang === "ar" ? opt.textAr : opt.textEn || opt.textAr}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <HelpCircle className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" />
                  <p className="text-sm text-muted-foreground">{t("common.noData")}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="projects" className="space-y-4 mt-4">
            <h2 className="text-lg font-semibold">{t("trainer.reviewProjects")}</h2>

            {projects && projects.length > 0 ? (
              <div className="space-y-3">
                {projects.map((project) => (
                  <Card key={project.id} data-testid={`card-project-${project.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="space-y-1 flex-1 min-w-0">
                          <h3 className="font-medium text-sm">
                            {lang === "ar" ? project.titleAr : project.titleEn || project.titleAr}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {lang === "ar"
                              ? project.descriptionAr
                              : project.descriptionEn || project.descriptionAr}
                          </p>
                          {project.fileUrl && (
                            <a
                              href={project.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary underline"
                              data-testid={`link-project-file-${project.id}`}
                            >
                              {lang === "ar" ? "عرض الملف" : "View File"}
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {project.grade !== null && project.grade !== undefined ? (
                            <Badge variant="default" data-testid={`badge-grade-${project.id}`}>
                              {project.grade}/100
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedProject(project);
                                setGradeForm({ grade: 0, feedback: "" });
                                setGradeDialogOpen(true);
                              }}
                              data-testid={`button-grade-project-${project.id}`}
                            >
                              <ClipboardCheck className="h-3.5 w-3.5" />
                              <span className="ms-1.5">{t("trainer.gradeProject")}</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" />
                  <p className="text-sm text-muted-foreground">{t("common.noData")}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("courses.addLesson")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                placeholder={lang === "ar" ? "عنوان الدرس (عربي)" : "Lesson Title (Arabic)"}
                value={lessonForm.titleAr}
                onChange={(e) => setLessonForm((f) => ({ ...f, titleAr: e.target.value }))}
                data-testid="input-lesson-title-ar"
              />
              <Input
                placeholder={lang === "ar" ? "عنوان الدرس (إنجليزي)" : "Lesson Title (English)"}
                value={lessonForm.titleEn}
                onChange={(e) => setLessonForm((f) => ({ ...f, titleEn: e.target.value }))}
                data-testid="input-lesson-title-en"
              />
              <Input
                placeholder={t("courses.videoUrl")}
                value={lessonForm.videoUrl}
                onChange={(e) => setLessonForm((f) => ({ ...f, videoUrl: e.target.value }))}
                data-testid="input-lesson-video-url"
              />
              <Textarea
                placeholder={lang === "ar" ? "المحتوى (عربي)" : "Content (Arabic)"}
                value={lessonForm.contentAr}
                onChange={(e) => setLessonForm((f) => ({ ...f, contentAr: e.target.value }))}
                rows={3}
                data-testid="input-lesson-content-ar"
              />
              <Textarea
                placeholder={lang === "ar" ? "المحتوى (إنجليزي)" : "Content (English)"}
                value={lessonForm.contentEn}
                onChange={(e) => setLessonForm((f) => ({ ...f, contentEn: e.target.value }))}
                rows={3}
                data-testid="input-lesson-content-en"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  placeholder={lang === "ar" ? "الترتيب" : "Order"}
                  value={lessonForm.orderIndex || ""}
                  onChange={(e) =>
                    setLessonForm((f) => ({ ...f, orderIndex: parseInt(e.target.value) || 0 }))
                  }
                  data-testid="input-lesson-order"
                />
                <Input
                  type="number"
                  placeholder={t("courses.duration")}
                  value={lessonForm.durationMinutes || ""}
                  onChange={(e) =>
                    setLessonForm((f) => ({ ...f, durationMinutes: parseInt(e.target.value) || 0 }))
                  }
                  data-testid="input-lesson-duration"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setLessonDialogOpen(false)} data-testid="button-cancel-lesson">
                {t("common.cancel")}
              </Button>
              <Button
                onClick={() => addLessonMutation.mutate(lessonForm)}
                disabled={!lessonForm.titleAr || addLessonMutation.isPending}
                data-testid="button-save-lesson"
              >
                {t("common.save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={quizDialogOpen} onOpenChange={setQuizDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("courses.addQuiz")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                placeholder={lang === "ar" ? "عنوان الاختبار (عربي)" : "Quiz Title (Arabic)"}
                value={quizForm.titleAr}
                onChange={(e) => setQuizForm((f) => ({ ...f, titleAr: e.target.value }))}
                data-testid="input-quiz-title-ar"
              />
              <Input
                placeholder={lang === "ar" ? "عنوان الاختبار (إنجليزي)" : "Quiz Title (English)"}
                value={quizForm.titleEn}
                onChange={(e) => setQuizForm((f) => ({ ...f, titleEn: e.target.value }))}
                data-testid="input-quiz-title-en"
              />
              <Select
                value={quizForm.type}
                onValueChange={(val) => setQuizForm((f) => ({ ...f, type: val as "intermediate" | "final" }))}
              >
                <SelectTrigger data-testid="select-quiz-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intermediate">{t("quiz.intermediate")}</SelectItem>
                  <SelectItem value="final">{t("quiz.final")}</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder={t("quiz.passingScore")}
                value={quizForm.passingScore || ""}
                onChange={(e) =>
                  setQuizForm((f) => ({ ...f, passingScore: parseInt(e.target.value) || 0 }))
                }
                data-testid="input-quiz-passing-score"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setQuizDialogOpen(false)} data-testid="button-cancel-quiz">
                {t("common.cancel")}
              </Button>
              <Button
                onClick={() => addQuizMutation.mutate(quizForm)}
                disabled={!quizForm.titleAr || addQuizMutation.isPending}
                data-testid="button-save-quiz"
              >
                {t("common.save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("quiz.addQuestion")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Textarea
                placeholder={lang === "ar" ? "السؤال (عربي)" : "Question (Arabic)"}
                value={questionForm.questionAr}
                onChange={(e) => setQuestionForm((f) => ({ ...f, questionAr: e.target.value }))}
                rows={2}
                data-testid="input-question-ar"
              />
              <Textarea
                placeholder={lang === "ar" ? "السؤال (إنجليزي)" : "Question (English)"}
                value={questionForm.questionEn}
                onChange={(e) => setQuestionForm((f) => ({ ...f, questionEn: e.target.value }))}
                rows={2}
                data-testid="input-question-en"
              />
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("quiz.options")}</label>
                {questionForm.options.map((opt, i) => (
                  <div key={i} className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder={`${String.fromCharCode(65 + i)} - ${lang === "ar" ? "عربي" : "Arabic"}`}
                      value={opt.textAr}
                      onChange={(e) => {
                        const newOpts = [...questionForm.options];
                        newOpts[i] = { ...newOpts[i], textAr: e.target.value };
                        setQuestionForm((f) => ({ ...f, options: newOpts }));
                      }}
                      data-testid={`input-option-ar-${i}`}
                    />
                    <Input
                      placeholder={`${String.fromCharCode(65 + i)} - ${lang === "ar" ? "إنجليزي" : "English"}`}
                      value={opt.textEn}
                      onChange={(e) => {
                        const newOpts = [...questionForm.options];
                        newOpts[i] = { ...newOpts[i], textEn: e.target.value };
                        setQuestionForm((f) => ({ ...f, options: newOpts }));
                      }}
                      data-testid={`input-option-en-${i}`}
                    />
                  </div>
                ))}
              </div>
              <Select
                value={String(questionForm.correctAnswer)}
                onValueChange={(val) =>
                  setQuestionForm((f) => ({ ...f, correctAnswer: parseInt(val) }))
                }
              >
                <SelectTrigger data-testid="select-correct-answer">
                  <SelectValue placeholder={t("quiz.correctAnswer")} />
                </SelectTrigger>
                <SelectContent>
                  {questionForm.options.map((_, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {String.fromCharCode(65 + i)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setQuestionDialogOpen(false)} data-testid="button-cancel-question">
                {t("common.cancel")}
              </Button>
              <Button
                onClick={() => addQuestionMutation.mutate(questionForm)}
                disabled={!questionForm.questionAr || addQuestionMutation.isPending}
                data-testid="button-save-question"
              >
                {t("common.save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={gradeDialogOpen} onOpenChange={setGradeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("trainer.gradeProject")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">{t("trainer.grade")} (0-100)</label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={gradeForm.grade || ""}
                  onChange={(e) =>
                    setGradeForm((f) => ({ ...f, grade: parseInt(e.target.value) || 0 }))
                  }
                  data-testid="input-grade"
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t("trainer.feedback")}</label>
                <Textarea
                  value={gradeForm.feedback}
                  onChange={(e) => setGradeForm((f) => ({ ...f, feedback: e.target.value }))}
                  rows={3}
                  data-testid="input-feedback"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setGradeDialogOpen(false)} data-testid="button-cancel-grade">
                {t("common.cancel")}
              </Button>
              <Button
                onClick={() => {
                  if (selectedProject) {
                    gradeProjectMutation.mutate({
                      id: selectedProject.id,
                      grade: gradeForm.grade,
                      feedback: gradeForm.feedback,
                    });
                  }
                }}
                disabled={gradeProjectMutation.isPending}
                data-testid="button-save-grade"
              >
                {t("common.save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-trainer-title">
            {t("trainer.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === "ar" ? "إنشاء وإدارة الدورات التدريبية" : "Create and manage training courses"}
          </p>
        </div>
        <Button
          onClick={() => setCourseDialogOpen(true)}
          data-testid="button-create-course"
        >
          <Plus className="h-4 w-4" />
          <span className="ms-1.5">{t("trainer.createCourse")}</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : courses && courses.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="hover-elevate cursor-pointer"
              onClick={() => setSelectedCourse(course)}
              data-testid={`card-trainer-course-${course.id}`}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="font-semibold text-sm truncate">
                      {lang === "ar" ? course.titleAr : course.titleEn || course.titleAr}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {lang === "ar"
                        ? course.descriptionAr
                        : course.descriptionEn || course.descriptionAr}
                    </p>
                  </div>
                  <Badge
                    variant={course.isPublished ? "default" : "secondary"}
                    data-testid={`badge-publish-status-${course.id}`}
                  >
                    {course.isPublished ? t("common.publish") : t("common.unpublish")}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                  <Badge variant="secondary" className="text-xs">{course.category}</Badge>
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {course.duration} {t("courses.hours")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-40" />
            <h3 className="font-medium mb-1">{t("common.noData")}</h3>
            <p className="text-sm text-muted-foreground">
              {lang === "ar" ? "لم يتم إنشاء أي دورة بعد" : "No courses created yet"}
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("trainer.createCourse")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder={lang === "ar" ? "عنوان الدورة (عربي)" : "Course Title (Arabic)"}
              value={courseForm.titleAr}
              onChange={(e) => setCourseForm((f) => ({ ...f, titleAr: e.target.value }))}
              data-testid="input-course-title-ar"
            />
            <Input
              placeholder={lang === "ar" ? "عنوان الدورة (إنجليزي)" : "Course Title (English)"}
              value={courseForm.titleEn}
              onChange={(e) => setCourseForm((f) => ({ ...f, titleEn: e.target.value }))}
              data-testid="input-course-title-en"
            />
            <Textarea
              placeholder={lang === "ar" ? "وصف الدورة (عربي)" : "Description (Arabic)"}
              value={courseForm.descriptionAr}
              onChange={(e) => setCourseForm((f) => ({ ...f, descriptionAr: e.target.value }))}
              rows={3}
              data-testid="input-course-desc-ar"
            />
            <Textarea
              placeholder={lang === "ar" ? "وصف الدورة (إنجليزي)" : "Description (English)"}
              value={courseForm.descriptionEn}
              onChange={(e) => setCourseForm((f) => ({ ...f, descriptionEn: e.target.value }))}
              rows={3}
              data-testid="input-course-desc-en"
            />
            <Input
              placeholder={lang === "ar" ? "التصنيف" : "Category"}
              value={courseForm.category}
              onChange={(e) => setCourseForm((f) => ({ ...f, category: e.target.value }))}
              data-testid="input-course-category"
            />
            <Input
              type="number"
              placeholder={t("courses.duration")}
              value={courseForm.duration || ""}
              onChange={(e) =>
                setCourseForm((f) => ({ ...f, duration: parseInt(e.target.value) || 0 }))
              }
              data-testid="input-course-duration"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCourseDialogOpen(false)} data-testid="button-cancel-course">
              {t("common.cancel")}
            </Button>
            <Button
              onClick={() => createCourseMutation.mutate(courseForm)}
              disabled={!courseForm.titleAr || !courseForm.category || createCourseMutation.isPending}
              data-testid="button-save-course"
            >
              {t("common.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
