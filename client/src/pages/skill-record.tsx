import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Download,
  FileText,
  Award,
  Clock,
  CheckCircle,
  QrCode,
  Stamp,
} from "lucide-react";
import type {
  Activity,
  CourseEnrollment,
  Course,
  Certificate,
  StudentProfile,
} from "@shared/schema";
import { ACTIVITY_MIN_HOURS } from "@shared/schema";
import collegeStamp from "@/assets/images/college-stamp.png";

export default function SkillRecordPage() {
  const { t, lang } = useI18n();
  const { user } = useAuth();

  const { data: activities, isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery<CourseEnrollment[]>({
    queryKey: ["/api/enrollments"],
  });

  const { data: courses, isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { data: certificates, isLoading: certificatesLoading } = useQuery<Certificate[]>({
    queryKey: ["/api/certificates"],
  });

  const { data: profile, isLoading: profileLoading } = useQuery<StudentProfile>({
    queryKey: ["/api/profile"],
  });

  const isLoading =
    activitiesLoading || enrollmentsLoading || coursesLoading || certificatesLoading || profileLoading;

  const approved = activities?.filter((a) => a.status === "approved") || [];
  const totalHours = approved.reduce((sum, a) => sum + a.hours, 0);
  const completedEnrollments = enrollments?.filter((e) => e.isCompleted) || [];
  const certificateCount = certificates?.length || 0;

  const hoursByType: Record<string, number> = {};
  approved.forEach((a) => {
    hoursByType[a.type] = (hoursByType[a.type] || 0) + a.hours;
  });

  const activitiesByType: Record<string, Activity[]> = {};
  approved.forEach((a) => {
    if (!activitiesByType[a.type]) activitiesByType[a.type] = [];
    activitiesByType[a.type].push(a);
  });

  const coursesMap: Record<string, Course> = {};
  courses?.forEach((c) => {
    coursesMap[c.id] = c;
  });

  const verificationCode =
    certificates && certificates.length > 0
      ? certificates[0].verificationCode
      : user?.id?.slice(0, 8)?.toUpperCase() || "N/A";

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-20 mb-3" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-content, .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            inset-inline-start: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
          .print-header {
            display: flex !important;
          }
          [data-sidebar], header, nav {
            display: none !important;
          }
        }
      `}</style>

      <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto print-content" data-testid="skill-record-page">
        <div
          className="hidden items-center justify-center gap-3 mb-6 pb-4 border-b print-header"
          data-testid="print-header"
        >
          <FileText className="h-8 w-8" />
          <div className="text-center">
            <h2 className="text-xl font-bold">{t("app.college")}</h2>
            <p className="text-sm text-muted-foreground">{t("app.name")}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-2xl font-bold" data-testid="text-skill-record-title">
            {t("skillRecord.title")}
          </h1>
          <Button onClick={handlePrint} className="no-print" data-testid="button-download-pdf">
            <Download className="h-4 w-4" />
            <span className="ms-1.5">{t("skillRecord.download")}</span>
          </Button>
        </div>

        <Card data-testid="card-student-info">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t("skillRecord.studentInfo")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex flex-wrap gap-1">
                <span className="text-muted-foreground">{t("activity.name")}:</span>
                <span className="font-medium" data-testid="text-student-name">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                <span className="text-muted-foreground">{t("profile.studentId")}:</span>
                <span className="font-medium" data-testid="text-student-id">
                  {profile?.studentId || "-"}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                <span className="text-muted-foreground">{t("profile.major")}:</span>
                <span className="font-medium" data-testid="text-student-major">
                  {profile?.major || "-"}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                <span className="text-muted-foreground">{t("profile.trainingId")}:</span>
                <span className="font-medium" data-testid="text-training-id">
                  {profile?.trainingId || "-"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card data-testid="card-total-hours">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{t("skillRecord.totalHours")}</span>
              </div>
              <p className="text-3xl font-bold" data-testid="text-total-approved-hours">
                {totalHours}
              </p>
            </CardContent>
          </Card>
          <Card data-testid="card-approved-activities">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4" />
                <span>{t("skillRecord.approvedActivities")}</span>
              </div>
              <p className="text-3xl font-bold" data-testid="text-approved-activities-count">
                {approved.length}
              </p>
            </CardContent>
          </Card>
          <Card data-testid="card-completed-courses">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>{t("skillRecord.completedCourses")}</span>
              </div>
              <p className="text-3xl font-bold" data-testid="text-completed-courses-count">
                {completedEnrollments.length}
              </p>
            </CardContent>
          </Card>
          <Card data-testid="card-certificates">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Award className="h-4 w-4" />
                <span>{t("certificate.title")}</span>
              </div>
              <p className="text-3xl font-bold" data-testid="text-certificates-count">
                {certificateCount}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card data-testid="card-hours-progress">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t("dashboard.hoursByCategory")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(ACTIVITY_MIN_HOURS).map(([type, required]) => {
              const current = hoursByType[type] || 0;
              const pct = Math.min(100, (current / required) * 100);
              return (
                <div key={type} className="space-y-1.5" data-testid={`progress-${type}`}>
                  <div className="flex items-center justify-between gap-1 text-sm">
                    <span>{t(`activity.types.${type}`)}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {current}/{required} {t("courses.hours")}
                    </span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card data-testid="card-approved-activities-table">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t("skillRecord.approvedActivities")}</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(activitiesByType).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(activitiesByType).map(([type, acts]) => (
                  <div key={type} data-testid={`activity-group-${type}`}>
                    <h3 className="text-sm font-semibold mb-2">{t(`activity.types.${type}`)}</h3>
                    <div className="rounded-md border overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("activity.name")}</TableHead>
                            <TableHead>{t("activity.organization")}</TableHead>
                            <TableHead>{t("activity.hours")}</TableHead>
                            <TableHead>{t("activity.startDate")}</TableHead>
                            <TableHead>{t("activity.status")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {acts.map((activity) => (
                            <TableRow key={activity.id} data-testid={`activity-row-${activity.id}`}>
                              <TableCell className="font-medium">
                                {lang === "ar" ? activity.nameAr : activity.nameEn || activity.nameAr}
                              </TableCell>
                              <TableCell>{activity.organization}</TableCell>
                              <TableCell>{activity.hours}</TableCell>
                              <TableCell>
                                {activity.startDate
                                  ? new Date(activity.startDate).toLocaleDateString(
                                      lang === "ar" ? "ar-SA" : "en-US"
                                    )
                                  : "-"}
                              </TableCell>
                              <TableCell>
                                <Badge variant="default" data-testid={`badge-status-${activity.id}`}>
                                  {t(`status.${activity.status}`)}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6" data-testid="text-no-activities">
                {t("common.noData")}
              </p>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-completed-courses-list">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t("skillRecord.completedCourses")}</CardTitle>
          </CardHeader>
          <CardContent>
            {completedEnrollments.length > 0 ? (
              <div className="space-y-3">
                {completedEnrollments.map((enrollment) => {
                  const course = coursesMap[enrollment.courseId];
                  const cert = certificates?.find((c) => c.courseId === enrollment.courseId);
                  return (
                    <div
                      key={enrollment.id}
                      className="flex items-center justify-between gap-2 py-2 border-b last:border-0"
                      data-testid={`course-row-${enrollment.id}`}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {course
                            ? lang === "ar"
                              ? course.titleAr
                              : course.titleEn || course.titleAr
                            : "-"}
                        </p>
                        {cert && (
                          <p className="text-xs text-muted-foreground">
                            {t("certificate.completion")} - {t("certificate.verificationCode")}:{" "}
                            {cert.verificationCode}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {cert && (
                          <Badge variant="secondary" data-testid={`badge-cert-${enrollment.id}`}>
                            <Award className="h-3 w-3 me-1" />
                            {t("certificate.completion")}
                          </Badge>
                        )}
                        <Badge variant="default" data-testid={`badge-completed-${enrollment.id}`}>
                          {t("courses.completed")}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6" data-testid="text-no-courses">
                {t("common.noData")}
              </p>
            )}
          </CardContent>
        </Card>

        {certificates && certificates.length > 0 && (
          <Card data-testid="card-certificates-list">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="h-4 w-4" />
                {lang === "ar" ? "الشهادات" : "Certificates"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{lang === "ar" ? "الشهادة" : "Certificate"}</TableHead>
                      <TableHead>{lang === "ar" ? "النوع" : "Type"}</TableHead>
                      <TableHead>{lang === "ar" ? "تاريخ الإصدار" : "Issue Date"}</TableHead>
                      <TableHead>{lang === "ar" ? "رمز التحقق" : "Verification Code"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificates.map((cert) => (
                      <TableRow key={cert.id} data-testid={`cert-row-${cert.id}`}>
                        <TableCell className="font-medium">
                          {lang === "ar" ? cert.titleAr : cert.titleEn || cert.titleAr}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {cert.type === "course_completion"
                              ? lang === "ar" ? "إتمام دورة" : "Course Completion"
                              : lang === "ar" ? "نشاط" : "Activity"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {cert.issuedAt
                            ? new Date(cert.issuedAt).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US")
                            : "-"}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{cert.verificationCode}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        <Card data-testid="card-qr-verification">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              {t("skillRecord.qrVerify")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-around gap-6 py-4 flex-wrap">
              <div className="flex flex-col items-center gap-3">
                <div className="w-32 h-32 border-2 border-dashed rounded-md flex items-center justify-center bg-muted/50">
                  <QrCode className="h-16 w-16 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground" data-testid="text-verification-code">
                  {t("certificate.verificationCode")}: <span className="font-mono font-semibold">{verificationCode}</span>
                </p>
              </div>
              <div className="flex flex-col items-center gap-3" data-testid="electronic-stamp">
                <img src={collegeStamp} alt={lang === "ar" ? "الختم الإلكتروني" : "Electronic Stamp"} className="w-28 h-28 opacity-80" />
                <p className="text-xs text-muted-foreground font-medium">
                  {lang === "ar" ? "ختم إلكتروني رسمي" : "Official Electronic Stamp"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-muted-foreground py-4 border-t" data-testid="text-footer">
          <p>{lang === "ar" ? "هذه الوثيقة صادرة إلكترونياً من نظام السجل المهاري - الكلية التقنية" : "This document is electronically issued from the Skill Record System - Technical College"}</p>
          <p className="mt-1">{lang === "ar" ? "يمكن التحقق من صحة الوثيقة عبر رمز QR أعلاه" : "Verify document authenticity via the QR code above"}</p>
        </div>
      </div>
    </>
  );
}
