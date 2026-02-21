import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Users,
  FileText,
  CheckCircle,
  BookOpen,
  BarChart3,
  Clock,
  GraduationCap,
  ScrollText,
} from "lucide-react";
import { Link } from "wouter";
import type { Activity } from "@shared/schema";

interface Stats {
  totalStudents: number;
  totalActivities: number;
  totalApproved: number;
  totalCourses: number;
}

interface HoursByStudent {
  userId: string;
  userName: string;
  major: string;
  totalHours: number;
  approvedActivities: number;
}

interface StudentsByMajor {
  major: string;
  count: number;
}

interface CompletedCourse {
  courseId: string;
  courseName: string;
  completedCount: number;
}

interface ApprovedActivity {
  type: string;
  count: number;
  totalHours: number;
}

interface AuditLogEntry {
  id: string;
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  details: any;
  createdAt: string;
  actorName?: string;
}

type TabType = "overview" | "reports" | "audit";

export default function SupervisorDashboardPage() {
  const { t, lang, dir } = useI18n();
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  const { data: allActivities, isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities/all"],
  });

  const { data: hoursByStudent } = useQuery<HoursByStudent[]>({
    queryKey: ["/api/reports/hours-by-student"],
    enabled: activeTab === "reports",
  });

  const { data: studentsByMajor } = useQuery<StudentsByMajor[]>({
    queryKey: ["/api/reports/students-by-major"],
    enabled: activeTab === "reports",
  });

  const { data: completedCourses } = useQuery<CompletedCourse[]>({
    queryKey: ["/api/reports/completed-courses"],
    enabled: activeTab === "reports",
  });

  const { data: approvedActivities } = useQuery<ApprovedActivity[]>({
    queryKey: ["/api/reports/approved-activities"],
    enabled: activeTab === "reports",
  });

  const { data: auditLogs } = useQuery<AuditLogEntry[]>({
    queryKey: ["/api/audit-logs"],
    enabled: activeTab === "audit",
  });

  const isLoading = statsLoading || activitiesLoading;

  const typeBreakdown: Record<string, number> = {};
  const statusBreakdown: Record<string, number> = {
    approved: 0,
    submitted: 0,
    under_review: 0,
    rejected: 0,
  };

  if (allActivities) {
    allActivities.forEach((a) => {
      typeBreakdown[a.type] = (typeBreakdown[a.type] || 0) + 1;
      if (statusBreakdown[a.status] !== undefined) {
        statusBreakdown[a.status]++;
      }
    });
  }

  const maxTypeCount = Math.max(...Object.values(typeBreakdown), 1);

  const statCards = [
    { key: "totalStudents", label: t("supervisor.totalStudents"), value: stats?.totalStudents ?? 0, icon: Users },
    { key: "totalActivities", label: t("supervisor.totalActivities"), value: stats?.totalActivities ?? 0, icon: FileText },
    { key: "totalApproved", label: t("supervisor.totalApproved"), value: stats?.totalApproved ?? 0, icon: CheckCircle },
    { key: "totalCourses", label: t("supervisor.totalCourses"), value: stats?.totalCourses ?? 0, icon: BookOpen },
  ];

  const pendingCount = (statusBreakdown["submitted"] || 0) + (statusBreakdown["under_review"] || 0);
  const totalStatusCount = (statusBreakdown["approved"] || 0) + pendingCount + (statusBreakdown["rejected"] || 0);

  const tabs: { key: TabType; label: string; icon: any }[] = [
    { key: "overview", label: lang === "ar" ? "نظرة عامة" : "Overview", icon: BarChart3 },
    { key: "reports", label: lang === "ar" ? "التقارير" : "Reports", icon: FileText },
    { key: "audit", label: lang === "ar" ? "سجل التدقيق" : "Audit Log", icon: ScrollText },
  ];

  const actionLabels: Record<string, { ar: string; en: string }> = {
    profile_update: { ar: "تحديث الملف الشخصي", en: "Profile Update" },
    activity_approve: { ar: "اعتماد نشاط", en: "Activity Approved" },
    activity_reject: { ar: "رفض نشاط", en: "Activity Rejected" },
    course_completed: { ar: "إتمام دورة", en: "Course Completed" },
    certificate_issued: { ar: "إصدار شهادة", en: "Certificate Issued" },
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto" dir={dir}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6" />
          <h1 className="text-2xl font-bold" data-testid="text-supervisor-title">
            {t("supervisor.title")}
          </h1>
        </div>
        <Link href="/review">
          <Button data-testid="link-review">
            <FileText className="h-4 w-4" />
            <span className="ms-1.5">{t("review.title")}</span>
          </Button>
        </Link>
      </div>

      <div className="flex gap-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            data-testid={`tab-${tab.key}`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-20 mb-3" />
                      <Skeleton className="h-8 w-16" />
                    </CardContent>
                  </Card>
                ))
              : statCards.map((s) => (
                  <Card key={s.key} data-testid={`card-stat-${s.key}`}>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <s.icon className="h-4 w-4" />
                        <span>{s.label}</span>
                      </div>
                      <p className="text-3xl font-bold" data-testid={`text-stat-${s.key}`}>
                        {s.value}
                      </p>
                    </CardContent>
                  </Card>
                ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  {lang === "ar" ? "توزيع الأنشطة حسب النوع" : "Activities by Type"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="space-y-1">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-5 w-full" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3" data-testid="chart-type-breakdown">
                    {Object.entries(typeBreakdown).map(([type, cnt]) => (
                      <div key={type} className="space-y-1">
                        <div className="flex items-center justify-between gap-1 text-sm">
                          <span>{t(`activity.types.${type}`)}</span>
                          <span className="text-muted-foreground tabular-nums">{cnt}</span>
                        </div>
                        <div className="h-5 w-full bg-muted rounded-md overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-md transition-all"
                            style={{ width: `${(cnt / maxTypeCount) * 100}%` }}
                            data-testid={`bar-type-${type}`}
                          />
                        </div>
                      </div>
                    ))}
                    {Object.keys(typeBreakdown).length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        {lang === "ar" ? "لا توجد بيانات" : "No data"}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  {lang === "ar" ? "توزيع الأنشطة حسب الحالة" : "Activities by Status"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="space-y-1">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-2.5 w-full" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4" data-testid="chart-status-breakdown">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-1 text-sm">
                        <Badge variant="default">{t("status.approved")}</Badge>
                        <span className="text-muted-foreground tabular-nums" data-testid="text-status-approved">
                          {statusBreakdown["approved"]}
                        </span>
                      </div>
                      <Progress value={totalStatusCount ? (statusBreakdown["approved"] / totalStatusCount) * 100 : 0} className="h-2" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-1 text-sm">
                        <Badge variant="secondary">{lang === "ar" ? "قيد المراجعة" : "Pending"}</Badge>
                        <span className="text-muted-foreground tabular-nums" data-testid="text-status-pending">{pendingCount}</span>
                      </div>
                      <Progress value={totalStatusCount ? (pendingCount / totalStatusCount) * 100 : 0} className="h-2" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-1 text-sm">
                        <Badge variant="destructive">{t("status.rejected")}</Badge>
                        <span className="text-muted-foreground tabular-nums" data-testid="text-status-rejected">{statusBreakdown["rejected"]}</span>
                      </div>
                      <Progress value={totalStatusCount ? (statusBreakdown["rejected"] / totalStatusCount) * 100 : 0} className="h-2" />
                    </div>
                    {totalStatusCount === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        {lang === "ar" ? "لا توجد بيانات" : "No data"}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {activeTab === "reports" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {lang === "ar" ? "تقرير الساعات حسب المتدرب" : "Hours Report by Student"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!hoursByStudent ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : hoursByStudent.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">{lang === "ar" ? "لا توجد بيانات" : "No data"}</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table data-testid="table-hours-by-student">
                    <TableHeader>
                      <TableRow>
                        <TableHead>{lang === "ar" ? "المتدرب" : "Student"}</TableHead>
                        <TableHead>{lang === "ar" ? "التخصص" : "Major"}</TableHead>
                        <TableHead>{lang === "ar" ? "إجمالي الساعات" : "Total Hours"}</TableHead>
                        <TableHead>{lang === "ar" ? "الأنشطة المعتمدة" : "Approved Activities"}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hoursByStudent.map((row) => (
                        <TableRow key={row.userId}>
                          <TableCell className="font-medium">{row.userName}</TableCell>
                          <TableCell>{row.major}</TableCell>
                          <TableCell className="tabular-nums">{row.totalHours}</TableCell>
                          <TableCell className="tabular-nums">{row.approvedActivities}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  {lang === "ar" ? "تقرير الأنشطة المعتمدة" : "Approved Activities Report"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!approvedActivities ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                  </div>
                ) : approvedActivities.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">{lang === "ar" ? "لا توجد بيانات" : "No data"}</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table data-testid="table-approved-activities">
                      <TableHeader>
                        <TableRow>
                          <TableHead>{lang === "ar" ? "نوع النشاط" : "Activity Type"}</TableHead>
                          <TableHead>{lang === "ar" ? "العدد" : "Count"}</TableHead>
                          <TableHead>{lang === "ar" ? "إجمالي الساعات" : "Total Hours"}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {approvedActivities.map((row) => (
                          <TableRow key={row.type}>
                            <TableCell>{t(`activity.types.${row.type}`)}</TableCell>
                            <TableCell className="tabular-nums">{row.count}</TableCell>
                            <TableCell className="tabular-nums">{row.totalHours}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {lang === "ar" ? "المتدربون حسب التخصص" : "Students by Major"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!studentsByMajor ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                  </div>
                ) : studentsByMajor.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">{lang === "ar" ? "لا توجد بيانات" : "No data"}</p>
                ) : (
                  <div className="space-y-3" data-testid="chart-students-by-major">
                    {studentsByMajor.map((row) => {
                      const maxCount = Math.max(...studentsByMajor.map((r) => r.count), 1);
                      return (
                        <div key={row.major} className="space-y-1">
                          <div className="flex items-center justify-between gap-1 text-sm">
                            <span>{row.major}</span>
                            <span className="text-muted-foreground tabular-nums">{row.count}</span>
                          </div>
                          <div className="h-5 w-full bg-muted rounded-md overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-md transition-all" style={{ width: `${(row.count / maxCount) * 100}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                {lang === "ar" ? "تقرير الدورات المكتملة" : "Completed Courses Report"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!completedCourses ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : completedCourses.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">{lang === "ar" ? "لا توجد بيانات" : "No data"}</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table data-testid="table-completed-courses">
                    <TableHeader>
                      <TableRow>
                        <TableHead>{lang === "ar" ? "الدورة" : "Course"}</TableHead>
                        <TableHead>{lang === "ar" ? "عدد المتدربين المكتملين" : "Completed Students"}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completedCourses.map((row) => (
                        <TableRow key={row.courseId}>
                          <TableCell className="font-medium">{row.courseName}</TableCell>
                          <TableCell className="tabular-nums">{row.completedCount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "audit" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ScrollText className="h-4 w-4" />
              {lang === "ar" ? "سجل التدقيق" : "Audit Log"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!auditLogs ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : auditLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">{lang === "ar" ? "لا توجد سجلات بعد" : "No audit logs yet"}</p>
            ) : (
              <div className="overflow-x-auto">
                <Table data-testid="table-audit-logs">
                  <TableHeader>
                    <TableRow>
                      <TableHead>{lang === "ar" ? "التاريخ" : "Date"}</TableHead>
                      <TableHead>{lang === "ar" ? "المستخدم" : "User"}</TableHead>
                      <TableHead>{lang === "ar" ? "الإجراء" : "Action"}</TableHead>
                      <TableHead>{lang === "ar" ? "النوع" : "Entity"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString(lang === "ar" ? "ar-SA" : "en-US")}
                        </TableCell>
                        <TableCell className="font-medium">{log.actorName || log.actorUserId}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {actionLabels[log.action]?.[lang] || log.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{log.entityType}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
