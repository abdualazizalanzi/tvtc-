import { useState, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  FileText,
  Download,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  Award,
  BookOpen,
  Briefcase,
  Languages,
  Star,
  ExternalLink,
  Calendar,
} from "lucide-react";
import {
  type Activity,
  type Course,
  type CourseEnrollment,
  type Certificate,
  type StudentProfile,
} from "@shared/schema";

export default function CVGeneratorPage() {
  const { t, lang, isRtl } = useI18n();
  const { user } = useAuth();
  const cvRef = useRef<HTMLDivElement>(null);
  const [cvLang, setCvLang] = useState<"ar" | "en">("ar");

  const { data: profile } = useQuery<StudentProfile>({
    queryKey: ["/api/profile"],
  });

  const { data: activities } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const { data: enrollments } = useQuery<CourseEnrollment[]>({
    queryKey: ["/api/enrollments"],
  });

  const { data: courses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { data: certificates } = useQuery<Certificate[]>({
    queryKey: ["/api/certificates"],
  });

  const approvedActivities = activities?.filter((a) => a.status === "approved") || [];
  const completedEnrollments = enrollments?.filter((e) => e.isCompleted) || [];
  const completedCourses = courses?.filter((c) => 
    completedEnrollments.some((e) => e.courseId === c.id)
  ) || [];

  const fullName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "";

  const handleDownload = async () => {
    // For now, we'll just show an alert - in production, you'd use html2pdf or similar
    if (cvRef.current) {
      const content = cvRef.current.innerHTML;
      const blob = new Blob([content], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fullName.replace(/\s+/g, "_")}_CV_${cvLang}.html`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString(cvLang === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "short",
    });
  };

  const getLanguageLevelLabel = (level: string) => {
    const levels: Record<string, Record<string, string>> = {
      beginner: { ar: "مبتدئ", en: "Beginner" },
      intermediate: { ar: "متوسط", en: "Intermediate" },
      advanced: { ar: "متقدم", en: "Advanced" },
      native: { ar: "اللغة الأم", en: "Native" },
    };
    return levels[level]?.[cvLang] || level;
  };

  const skills = profile?.skills || [];
  const languages = profile?.languages || [];
  const interests = profile?.interests || [];

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto" dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{t("cv.title")}</h1>
            <p className="text-sm text-muted-foreground">
              {fullName || t("cv.create")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={cvLang === "ar" ? "default" : "outline"}
            size="sm"
            onClick={() => setCvLang("ar")}
          >
            {t("cv.arabic")}
          </Button>
          <Button
            variant={cvLang === "en" ? "default" : "outline"}
            size="sm"
            onClick={() => setCvLang("en")}
          >
            {t("cv.english")}
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4" />
            <span className="ms-2">{t("cv.download")}</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="preview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="preview">{t("cv.preview")}</TabsTrigger>
        </TabsList>

        <TabsContent value="preview">
          <div className="bg-gray-100 p-4 sm:p-8 rounded-lg overflow-auto">
            <div
              ref={cvRef}
              className="bg-white shadow-lg p-6 sm:p-8 max-w-[210mm] mx-auto"
              style={{ minHeight: "297mm", fontFamily: cvLang === "ar" ? "Tahoma, Arial" : "Arial, sans-serif" }}
              dir={cvLang === "ar" ? "rtl" : "ltr"}
            >
              {/* Header */}
              <div className={`flex gap-4 mb-6 ${cvLang === "en" ? "flex-row" : "flex-row-reverse"}`}>
                <Avatar className="h-24 w-24 border-2 border-gray-200">
                  <AvatarImage src={user?.profileImageUrl || profile?.skills?.[0] as any} />
                  <AvatarFallback className="text-2xl">
                    {fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className={cvLang === "ar" ? "text-right" : "text-left"}>
                  <h1 className="text-2xl font-bold text-gray-800">{fullName}</h1>
                  <p className="text-lg text-gray-600">{profile?.major || "—"}</p>
                  {(profile?.studentId || profile?.trainingId) && (
                    <p className="text-sm text-gray-500">
                      {profile?.studentId && `${t("profile.studentId")}: ${profile.studentId}`}
                    </p>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className={`mb-6 p-4 bg-gray-50 rounded-lg ${cvLang === "ar" ? "text-right" : "text-left"}`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {user?.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{user.email}</span>
                    </div>
                  )}
                  {profile?.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                  {profile?.linkedIn && (
                    <div className="flex items-center gap-2 text-sm">
                      <Linkedin className="h-4 w-4 text-gray-500" />
                      <span>{profile.linkedIn}</span>
                    </div>
                  )}
                  {profile?.github && (
                    <div className="flex items-center gap-2 text-sm">
                      <Github className="h-4 w-4 text-gray-500" />
                      <span>{profile.github}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio / Summary */}
              {profile?.bio && (
                <div className="mb-6">
                  <h2 className={`text-lg font-bold text-gray-800 mb-2 pb-1 border-b ${cvLang === "ar" ? "text-right" : "text-left"}`}>
                    {cvLang === "ar" ? "نبذة عني" : "About Me"}
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {profile.bio}
                  </p>
                </div>
              )}

              {/* Skills */}
              {skills.length > 0 && (
                <div className="mb-6">
                  <h2 className={`text-lg font-bold text-gray-800 mb-2 pb-1 border-b ${cvLang === "ar" ? "text-right" : "text-left"}`}>
                    {t("cv.skills")}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {languages.length > 0 && (
                <div className="mb-6">
                  <h2 className={`text-lg font-bold text-gray-800 mb-2 pb-1 border-b ${cvLang === "ar" ? "text-right" : "text-left"}`}>
                    {t("cv.languages")}
                  </h2>
                  <div className="flex flex-wrap gap-4">
                    {languages.map((langItem, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Languages className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          {langItem.name} - {getLanguageLevelLabel(langItem.level)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Career Goals */}
              {profile?.careerGoals && (
                <div className="mb-6">
                  <h2 className={`text-lg font-bold text-gray-800 mb-2 pb-1 border-b ${cvLang === "ar" ? "text-right" : "text-left"}`}>
                    {t("cv.careerGoals")}
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {profile.careerGoals}
                  </p>
                </div>
              )}

              {/* Interests */}
              {interests.length > 0 && (
                <div className="mb-6">
                  <h2 className={`text-lg font-bold text-gray-800 mb-2 pb-1 border-b ${cvLang === "ar" ? "text-right" : "text-left"}`}>
                    {t("cv.interests")}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {interests.map((interest, index) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Approved Activities / Experience */}
              {approvedActivities.length > 0 && (
                <div className="mb-6">
                  <h2 className={`text-lg font-bold text-gray-800 mb-2 pb-1 border-b ${cvLang === "ar" ? "text-right" : "text-left"}`}>
                    {t("cv.workExperience")}
                  </h2>
                  <div className="space-y-4">
                    {approvedActivities.slice(0, 5).map((activity) => (
                      <div key={activity.id} className={cvLang === "ar" ? "text-right" : "text-left"}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-800">
                              {cvLang === "ar" ? activity.nameAr : (activity.nameEn || activity.nameAr)}
                            </h3>
                            <p className="text-sm text-gray-600">{activity.organization}</p>
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(activity.startDate)}
                            {activity.endDate && ` - ${formatDate(activity.endDate)}`}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {cvLang === "ar" ? activity.descriptionAr : (activity.descriptionEn || activity.descriptionAr)}
                        </p>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {activity.hours} {cvLang === "ar" ? "ساعة" : "hours"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Courses / Education */}
              {completedCourses.length > 0 && (
                <div className="mb-6">
                  <h2 className={`text-lg font-bold text-gray-800 mb-2 pb-1 border-b ${cvLang === "ar" ? "text-right" : "text-left"}`}>
                    {t("cv.education")}
                  </h2>
                  <div className="space-y-3">
                    {completedCourses.map((course) => (
                      <div key={course.id} className={cvLang === "ar" ? "text-right" : "text-left"}>
                        <h3 className="font-semibold text-gray-800">
                          {cvLang === "ar" ? course.titleAr : (course.titleEn || course.titleAr)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {course.duration} {cvLang === "ar" ? "ساعة تدريبية" : "training hours"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certificates */}
              {certificates && certificates.length > 0 && (
                <div className="mb-6">
                  <h2 className={`text-lg font-bold text-gray-800 mb-2 pb-1 border-b ${cvLang === "ar" ? "text-right" : "text-left"}`}>
                    {t("cv.certifications")}
                  </h2>
                  <div className="space-y-3">
                    {certificates.slice(0, 5).map((cert) => (
                      <div key={cert.id} className={`flex items-start gap-2 ${cvLang === "ar" ? "flex-row-reverse" : ""}`}>
                        <Award className="h-4 w-4 text-yellow-500 mt-1" />
                        <div className={cvLang === "ar" ? "text-right" : "text-left"}>
                          <h3 className="font-semibold text-gray-800 text-sm">
                            {cvLang === "ar" ? cert.titleAr : (cert.titleEn || cert.titleAr)}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {formatDate(cert.issuedAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total Hours Summary */}
              <div className="mt-8 p-4 bg-primary/5 rounded-lg">
                <h3 className={`font-semibold text-gray-800 mb-2 ${cvLang === "ar" ? "text-right" : "text-left"}`}>
                  {t("skillRecord.totalHours")}: {approvedActivities.reduce((sum, a) => sum + a.hours, 0)} {cvLang === "ar" ? "ساعة" : "hours"}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(
                    approvedActivities.reduce((acc, a) => {
                      acc[a.type] = (acc[a.type] || 0) + a.hours;
                      return acc;
                    }, {} as Record<string, number>)
                  ).slice(0, 4).map(([type, hours]) => (
                    <div key={type} className="text-center p-2 bg-white rounded">
                      <p className="text-lg font-bold text-primary">{hours}</p>
                      <p className="text-xs text-gray-500">
                        {cvLang === "ar" 
                          ? (type === "volunteer_work" ? "تطوعي" : type === "student_employment" ? "طلابي" : type === "self_development" ? "تطوير ذات" : type === "leadership_skills" ? "قيادي" : type)
                          : type.replace(/_/g, " ")
                        }
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-4 border-t text-center text-xs text-gray-400">
                <p>
                  {cvLang === "ar" 
                    ? `سجل مهاري - تم إنشاء هذه السيرة الذاتية في ${new Date().toLocaleDateString("ar-SA")}`
                    : `Skill Record - CV generated on ${new Date().toLocaleDateString("en-US")}`
                  }
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

