import { useI18n } from "@/lib/i18n";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Clock, Search, GraduationCap, CheckCircle2, Play } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import type { Course, CourseEnrollment } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/auth-utils";

export default function CoursesPage() {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { data: enrollments } = useQuery<CourseEnrollment[]>({
    queryKey: ["/api/enrollments"],
  });

  const enrollMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const res = await apiRequest("POST", "/api/enrollments", { courseId });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: lang === "ar" ? "تم التسجيل في الدورة" : "Enrolled in course",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "Logging in again...", variant: "destructive" });
        setTimeout(() => { window.location.href = "/auth"; }, 500);
        return;
      }
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const enrolledCourseIds = new Set(enrollments?.map((e) => e.courseId) || []);

  const filtered = courses?.filter((c) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      c.titleAr?.toLowerCase().includes(searchLower) ||
      c.titleEn?.toLowerCase().includes(searchLower) ||
      c.category?.toLowerCase().includes(searchLower)
    );
  });

  const categories = Array.from(new Set(courses?.map((c) => c.category) || []));

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">{t("courses.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === "ar" ? "اكتشف الدورات وسجّل فيها" : "Discover and enroll in courses"}
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("courses.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ps-9"
          data-testid="input-course-search"
        />
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => setSearch(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-0">
                <Skeleton className="h-40 w-full rounded-t-lg" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-8 w-24 mt-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((course) => {
            const isEnrolled = enrolledCourseIds.has(course.id);
            return (
              <Card key={course.id} className="hover-elevate" data-testid={`card-course-${course.id}`}>
                <CardContent className="p-0">
                  <div className="h-36 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-t-lg flex items-center justify-center">
                    <BookOpen className="h-10 w-10 text-primary/50" />
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-sm line-clamp-2">
                        {lang === "ar" ? course.titleAr : course.titleEn || course.titleAr}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {lang === "ar" ? course.descriptionAr : course.descriptionEn || course.descriptionAr}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {course.duration} {t("courses.hours")}
                      </span>
                      <Badge variant="secondary" className="text-xs">{course.category}</Badge>
                    </div>
                    {isEnrolled ? (
                      <Link href={`/courses/${course.id}`}>
                        <Button variant="secondary" size="sm" className="w-full" data-testid={`button-view-course-${course.id}`}>
                          <Play className="h-3.5 w-3.5" />
                          <span className="ms-1.5">{t("courses.viewCourse")}</span>
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => enrollMutation.mutate(course.id)}
                        disabled={enrollMutation.isPending}
                        data-testid={`button-enroll-${course.id}`}
                      >
                        <GraduationCap className="h-3.5 w-3.5" />
                        <span className="ms-1.5">{t("courses.enroll")}</span>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-40" />
            <h3 className="font-medium mb-1">{t("common.noData")}</h3>
            <p className="text-sm text-muted-foreground">
              {lang === "ar" ? "لا توجد دورات متاحة حالياً" : "No courses available at the moment"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
