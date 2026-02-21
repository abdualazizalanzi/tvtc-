import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  Clock,
  CheckCircle2,
  Loader2,
  BookOpen,
  PlusCircle,
  ListChecks,
  TrendingUp,
  FileText,
  Bot,
  Award,
} from "lucide-react";
import type { Activity, CourseEnrollment } from "@shared/schema";

const activityTypeRequirements: Record<string, number> = {
  volunteer_work: 25,
  student_employment: 10,
  participation: 8,
  self_development: 3,
  awards: 1,
  student_activity: 20,
  professional_activity: 5,
  leadership_skills: 5,
};

function StatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  const variant =
    status === "approved"
      ? "default"
      : status === "rejected"
      ? "destructive"
      : "secondary";
  return <Badge variant={variant}>{t(`status.${status}`)}</Badge>;
}

export default function DashboardPage() {
  const { t, lang } = useI18n();
  const { user } = useAuth();

  const { data: activities, isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery<CourseEnrollment[]>({
    queryKey: ["/api/enrollments"],
  });

  const approved = activities?.filter((a) => a.status === "approved") || [];
  const pending = activities?.filter((a) => a.status === "submitted" || a.status === "under_review") || [];
  const totalHours = approved.reduce((sum, a) => sum + a.hours, 0);
  const completedCourses = enrollments?.filter((e) => e.isCompleted)?.length || 0;

  const hoursByType: Record<string, number> = {};
  approved.forEach((a) => {
    hoursByType[a.type] = (hoursByType[a.type] || 0) + a.hours;
  });

  const isLoading = activitiesLoading || enrollmentsLoading;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-dashboard-title">
            {t("dashboard.welcome")}
            {user?.firstName ? `, ${user.firstName}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === "ar" ? "نظرة عامة على سجلك المهاري" : "Overview of your skill record"}
          </p>
        </div>
        <Link href="/activities/new">
          <Button data-testid="button-add-activity">
            <PlusCircle className="h-4 w-4" />
            <span className="ms-1.5">{t("activity.addNew")}</span>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-20 mb-3" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{t("dashboard.totalHours")}</span>
                </div>
                <p className="text-3xl font-bold" data-testid="text-total-hours">{totalHours}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{t("dashboard.approvedActivities")}</span>
                </div>
                <p className="text-3xl font-bold" data-testid="text-approved-count">{approved.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4" />
                  <span>{t("dashboard.pendingActivities")}</span>
                </div>
                <p className="text-3xl font-bold" data-testid="text-pending-count">{pending.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span>{t("dashboard.completedCourses")}</span>
                </div>
                <p className="text-3xl font-bold" data-testid="text-courses-count">{completedCourses}</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-base">{t("dashboard.hoursByCategory")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-2.5 w-full" />
                  </div>
                ))
              ) : (
                Object.entries(activityTypeRequirements).map(([type, required]) => {
                  const current = hoursByType[type] || 0;
                  const pct = Math.min(100, (current / required) * 100);
                  return (
                    <div key={type} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-1 text-sm">
                        <span>{t(`activity.types.${type}`)}</span>
                        <span className="text-muted-foreground tabular-nums">
                          {current}/{required} {t("courses.hours")}
                        </span>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-base">{t("dashboard.recentActivities")}</CardTitle>
              <Link href="/activities">
                <Button variant="ghost" size="sm" data-testid="link-view-all-activities">
                  {t("common.viewAll")}
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded" />
                      <div className="flex-1">
                        <Skeleton className="h-3 w-40 mb-2" />
                        <Skeleton className="h-2 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activities && activities.length > 0 ? (
                <div className="space-y-3">
                  {activities.slice(0, 5).map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-3 py-2"
                      data-testid={`activity-item-${activity.id}`}
                    >
                      <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center shrink-0">
                        <ListChecks className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {lang === "ar" ? activity.nameAr : activity.nameEn || activity.nameAr}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.hours} {t("courses.hours")} - {activity.organization}
                        </p>
                      </div>
                      <StatusBadge status={activity.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ListChecks className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">{t("common.noData")}</p>
                  <Link href="/activities/new">
                    <Button variant="outline" size="sm" className="mt-3">
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span className="ms-1.5">{t("activity.addNew")}</span>
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t("dashboard.quickActions")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/activities/new">
                <Button variant="outline" className="w-full justify-start" data-testid="button-quick-add">
                  <PlusCircle className="h-4 w-4" />
                  <span className="ms-2">{t("activity.addNew")}</span>
                </Button>
              </Link>
              <Link href="/courses">
                <Button variant="outline" className="w-full justify-start" data-testid="button-quick-courses">
                  <BookOpen className="h-4 w-4" />
                  <span className="ms-2">{t("courses.title")}</span>
                </Button>
              </Link>
              <Link href="/activities">
                <Button variant="outline" className="w-full justify-start" data-testid="button-quick-activities">
                  <ListChecks className="h-4 w-4" />
                  <span className="ms-2">{t("activity.myActivities")}</span>
                </Button>
              </Link>
              <Link href="/skill-record">
                <Button variant="outline" className="w-full justify-start" data-testid="button-quick-pdf">
                  <FileText className="h-4 w-4" />
                  <span className="ms-2">{t("dashboard.downloadPdf")}</span>
                </Button>
              </Link>
              <Link href="/ai-assistant">
                <Button variant="outline" className="w-full justify-start" data-testid="button-quick-ai">
                  <Bot className="h-4 w-4" />
                  <span className="ms-2">{t("dashboard.askAi")}</span>
                </Button>
              </Link>
              <Link href="/certificates">
                <Button variant="outline" className="w-full justify-start" data-testid="button-quick-certificates">
                  <Award className="h-4 w-4" />
                  <span className="ms-2">{t("nav.certificates")}</span>
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                {t("dashboard.whatYouNeed")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {Object.entries(activityTypeRequirements)
                    .filter(([type, req]) => (hoursByType[type] || 0) < req)
                    .slice(0, 4)
                    .map(([type, req]) => {
                      const current = hoursByType[type] || 0;
                      const remaining = req - current;
                      return (
                        <div
                          key={type}
                          className="flex items-center justify-between gap-1 text-sm py-1"
                        >
                          <span className="text-muted-foreground truncate">
                            {t(`activity.types.${type}`)}
                          </span>
                          <Badge variant="secondary" className="shrink-0">
                            {remaining} {t("courses.hours")}
                          </Badge>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
