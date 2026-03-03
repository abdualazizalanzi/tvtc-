import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Download,
  File,
  FileIcon,
  Edit3,
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
  Upload,
  Save,
  X,
  Check,
  Loader2,
} from "lucide-react";
import {
  type Activity,
  type Course,
  type CourseEnrollment,
  type Certificate,
  type StudentProfile,
} from "@shared/schema";

// Types for editable data
interface EditableProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  major: string;
  studentId: string;
  trainingId: string;
  bio: string;
  skills: string[];
  languages: { name: string; level: string }[];
  interests: string[];
  careerGoals: string;
  linkedIn: string;
  github: string;
}

export default function CVGeneratorPage() {
  const { t, lang, isRtl } = useI18n();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const cvRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cvLang, setCvLang] = useState<"ar" | "en">("ar");
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Editable data state
  const [editableData, setEditableData] = useState<EditableProfile>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    major: "",
    studentId: "",
    trainingId: "",
    bio: "",
    skills: [],
    languages: [],
    interests: [],
    careerGoals: "",
    linkedIn: "",
    github: "",
  });

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

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<StudentProfile>) => {
      const response = await apiRequest("POST", "/api/profile", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: lang === "ar" ? "تم الحفظ بنجاح" : "Saved successfully",
        description: lang === "ar" ? "تم تحديث ملفك الشخصي" : "Your profile has been updated",
      });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: lang === "ar" ? "خطأ في الحفظ" : "Save error",
        description: lang === "ar" ? "حدث خطأ أثناء حفظ البيانات" : "Error saving data",
        variant: "destructive",
      });
    },
  });

  // Upload profile image mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch("/api/upload/profile-image", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Update user profile with new image URL
      updateProfileMutation.mutate({ profileImageUrl: data.url });
    },
    onError: () => {
      toast({
        title: lang === "ar" ? "خطأ في رفع الصورة" : "Upload error",
        description: lang === "ar" ? "حدث خطأ أثناء رفع الصورة" : "Error uploading image",
        variant: "destructive",
      });
    },
  });

  // Update editable data when profile/user loads
  useEffect(() => {
    if (user || profile) {
      setEditableData(prev => ({
        ...prev,
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
        phone: profile?.phone || "",
        major: profile?.major || "",
        studentId: profile?.studentId || "",
        trainingId: profile?.trainingId || "",
        bio: profile?.bio || "",
        skills: typeof profile?.skills === 'string' ? JSON.parse(profile.skills) : (profile?.skills || []),
        languages: typeof profile?.languages === 'string' ? JSON.parse(profile.languages) : (profile?.languages || []),
        interests: typeof profile?.interests === 'string' ? JSON.parse(profile.interests) : (profile?.interests || []),
        careerGoals: profile?.careerGoals || "",
        linkedIn: profile?.linkedIn || "",
        github: profile?.github || "",
      }));
    }
  }, [user, profile]);

  const approvedActivities = activities?.filter((a) => a.status === "approved") || [];
  const completedEnrollments = enrollments?.filter((e) => e.isCompleted) || [];
  const completedCourses = courses?.filter((c) =>
    completedEnrollments.some((e) => e.courseId === c.id)
  ) || [];

  const fullName = `${editableData.firstName || ""} ${editableData.lastName || ""}`.trim();

  const handleEditSave = () => {
    // Save all editable data to profile
    updateProfileMutation.mutate({
      phone: editableData.phone,
      major: editableData.major,
      studentId: editableData.studentId,
      trainingId: editableData.trainingId,
      bio: editableData.bio,
      skills: editableData.skills,
      languages: editableData.languages,
      interests: editableData.interests,
      careerGoals: editableData.careerGoals,
      linkedIn: editableData.linkedIn,
      github: editableData.github,
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file
      if (!file.type.startsWith("image/")) {
        toast({
          title: lang === "ar" ? "خطأ" : "Error",
          description: lang === "ar" ? "يرجى اختيار صورة" : "Please select an image",
          variant: "destructive",
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: lang === "ar" ? "خطأ" : "Error",
          description: lang === "ar" ? "حجم الصورة يجب أن يكون أقل من 5 ميجابايت" : "Image size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setIsUploading(true);
      uploadImageMutation.mutate(file);
    }
  };

  const handleDownloadPDF = async () => {
    if (!cvRef.current) return;
    setIsGenerating(true);
    
    try {
      // Dynamic import html2pdf
      const html2pdf = (await import("html2pdf.js")).default;
      
      const element = cvRef.current;
      const opt = {
        margin: [5, 5, 5, 5],
        filename: `${fullName.replace(/\s+/g, "_")}_CV_${cvLang}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { 
          scale: 3, 
          useCORS: true,
          letterRendering: true,
          logging: false,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      };
      
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: lang === "ar" ? "خطأ" : "Error",
        description: lang === "ar" ? "حدث خطأ في إنشاء PDF" : "Error generating PDF",
        variant: "destructive",
      });
    }
    setIsGenerating(false);
  };

  const handleDownloadWord = async () => {
    setIsGenerating(true);
    
    try {
      // Dynamic import docx
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import("docx");
      
      // Prepare data
      const name = fullName;
      const title = editableData.major;
      const contactInfo = [
        editableData.email,
        editableData.phone,
        editableData.linkedIn,
        editableData.github,
      ].filter(Boolean);
      
      // Create document sections
      const children = [];
      
      // Name and Title
      children.push(
        new Paragraph({
          text: name,
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        })
      );
      
      if (title) {
        children.push(
          new Paragraph({
            text: title,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          })
        );
      }
      
      // Contact Info
      if (contactInfo.length > 0) {
        children.push(
          new Paragraph({
            text: contactInfo.join(" | "),
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          })
        );
      }
      
      // Bio/Summary
      if (editableData.bio) {
        children.push(
          new Paragraph({
            text: cvLang === "ar" ? "نبذة عني" : "Summary",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          })
        );
        children.push(
          new Paragraph({
            text: editableData.bio,
            spacing: { after: 400 },
          })
        );
      }
      
      // Skills
      if (editableData.skills.length > 0) {
        children.push(
          new Paragraph({
            text: cvLang === "ar" ? "المهارات" : "Skills",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          })
        );
        children.push(
          new Paragraph({
            text: editableData.skills.join(", "),
            spacing: { after: 400 },
          })
        );
      }
      
      // Work Experience
      if (approvedActivities.length > 0) {
        children.push(
          new Paragraph({
            text: cvLang === "ar" ? "الخبرات والأنشطة" : "Experience",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          })
        );
        
        for (const activity of approvedActivities.slice(0, 5)) {
          children.push(
            new Paragraph({
              text: cvLang === "ar" ? activity.nameAr : (activity.nameEn || activity.nameAr),
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 },
            })
          );
          children.push(
            new Paragraph({
              text: `${activity.organization} - ${activity.hours} ${cvLang === "ar" ? "ساعة" : "hours"}`,
              spacing: { after: 200 },
            })
          );
        }
      }
      
      // Education/Courses
      if (completedCourses.length > 0) {
        children.push(
          new Paragraph({
            text: cvLang === "ar" ? "التعليم والدورات" : "Education & Courses",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          })
        );
        
        for (const course of completedCourses) {
          children.push(
            new Paragraph({
              text: cvLang === "ar" ? course.titleAr : (course.titleEn || course.titleAr),
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 },
            })
          );
          children.push(
            new Paragraph({
              text: `${course.duration} ${cvLang === "ar" ? "ساعة تدريبية" : "training hours"}`,
              spacing: { after: 200 },
            })
          );
        }
      }
      
      // Certificates
      if (certificates && certificates.length > 0) {
        children.push(
          new Paragraph({
            text: cvLang === "ar" ? "الشهادات" : "Certificates",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          })
        );
        
        for (const cert of certificates.slice(0, 5)) {
          children.push(
            new Paragraph({
              text: cvLang === "ar" ? cert.titleAr : (cert.titleEn || cert.titleAr),
              heading: HeadingLevel.HEADING_2,
              spacing: { after: 200 },
            })
          );
        }
      }
      
      // Create document
      const doc = new Document({
        sections: [{
          properties: {},
          children,
        }],
      });
      
      // Generate and download
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fullName.replace(/\s+/g, "_")}_CV_${cvLang}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Word generation error:", error);
      toast({
        title: lang === "ar" ? "خطأ" : "Error",
        description: lang === "ar" ? "حدث خطأ في إنشاء Word" : "Error generating Word document",
        variant: "destructive",
      });
    }
    setIsGenerating(false);
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

  const skills = editableData.skills || [];
  const languages = editableData.languages || [];
  const interests = editableData.interests || [];

  // Get profile image URL
  const profileImageUrl = user?.profileImageUrl || profile?.profileImageUrl || "";

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

        <div className="flex items-center gap-2 flex-wrap">
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
          
          <Button 
            onClick={handleDownloadPDF} 
            disabled={isGenerating}
            variant="secondary"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <File className="h-4 w-4" />
            )}
            <span className="ms-2">{lang === "ar" ? "تحميل PDF" : "PDF"}</span>
          </Button>
          
          <Button 
            onClick={handleDownloadWord} 
            disabled={isGenerating}
            variant="secondary"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileIcon className="h-4 w-4" />
            )}
            <span className="ms-2">{lang === "ar" ? "تحميل Word" : "Word"}</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="preview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="preview">{t("cv.preview")}</TabsTrigger>
          <TabsTrigger value="edit">
            <Edit3 className="h-4 w-4 me-1" />
            {lang === "ar" ? "تعديل البيانات" : "Edit Data"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview">
          <div className="bg-gray-100 p-4 sm:p-8 rounded-lg overflow-auto">
            <div
              ref={cvRef}
              className="bg-white shadow-lg p-6 sm:p-8 max-w-[210mm] mx-auto"
              style={{ minHeight: "297mm", fontFamily: cvLang === "ar" ? "Tahoma, Arial" : "Arial, sans-serif" }}
              dir={cvLang === "ar" ? "rtl" : "ltr"}
            >
              {/* Header - Professional Design */}
              <div className={`flex gap-6 mb-6 pb-6 border-b-2 border-primary ${cvLang === "en" ? "flex-row" : "flex-row-reverse"}`}>
                <div className="relative">
                  <Avatar className="h-28 w-28 border-4 border-primary/20">
                    <AvatarImage src={profileImageUrl} />
                    <AvatarFallback className="text-3xl bg-primary/10">
                      {fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">{fullName}</h1>
                  <p className="text-xl text-primary font-medium">{editableData.major || "—"}</p>
                  {(editableData.studentId || editableData.trainingId) && (
                    <p className="text-sm text-gray-500 mt-1">
                      {editableData.studentId && `${t("profile.studentId")}: ${editableData.studentId}`}
                      {editableData.studentId && editableData.trainingId && " | "}
                      {editableData.trainingId && `${lang === "ar" ? "التدريب" : "Training"}: ${editableData.trainingId}`}
                    </p>
                  )}
                </div>
              </div>

              {/* Contact Info - Compact */}
              {(editableData.email || editableData.phone || editableData.linkedIn || editableData.github) && (
                <div className={`mb-6 p-4 bg-gray-50 rounded-lg ${cvLang === "ar" ? "text-right" : "text-left"}`}>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {editableData.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-primary" />
                        <span className="truncate">{editableData.email}</span>
                      </div>
                    )}
                    {editableData.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-primary" />
                        <span>{editableData.phone}</span>
                      </div>
                    )}
                    {editableData.linkedIn && (
                      <div className="flex items-center gap-2 text-sm">
                        <Linkedin className="h-4 w-4 text-primary" />
                        <span className="truncate">{editableData.linkedIn.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//i, "")}</span>
                      </div>
                    )}
                    {editableData.github && (
                      <div className="flex items-center gap-2 text-sm">
                        <Github className="h-4 w-4 text-primary" />
                        <span className="truncate">{editableData.github.replace(/https?:\/\/(www\.)?github\.com\//i, "")}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bio / Summary */}
              {editableData.bio && (
                <div className="mb-6">
                  <h2 className={`text-lg font-bold text-primary mb-2 pb-1 border-b border-primary/20 ${cvLang === "ar" ? "text-right" : "text-left"}`}>
                    {cvLang === "ar" ? "نبذة عني" : "About Me"}
                  </h2>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {editableData.bio}
                  </p>
                </div>
              )}

              {/* Skills */}
              {skills.length > 0 && (
                <div className="mb-6">
                  <h2 className={`text-lg font-bold text-primary mb-2 pb-1 border-b border-primary/20 ${cvLang === "ar" ? "text-right" : "text-left"}`}>
                    {t("cv.skills")}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-sm bg-primary/10 text-primary border-primary/20">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {languages.length > 0 && (
                <div className="mb-6">
                  <h2 className={`text-lg font-bold text-primary mb-2 pb-1 border-b border-primary/20 ${cvLang === "ar" ? "text-right" : "text-left"}`}>
                    {t("cv.languages")}
                  </h2>
                  <div className="flex flex-wrap gap-4">
                    {languages.map((langItem, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Languages className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">
                          {langItem.name}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {getLanguageLevelLabel(langItem.level)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Career Goals */}
              {editableData.careerGoals && (
                <div className="mb-6">
                  <h2 className={`text-lg font-bold text-primary mb-2 pb-1 border-b border-primary/20 ${cvLang === "ar" ? "text-right" : "text-left"}`}>
                    {t("cv.careerGoals")}
                  </h2>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {editableData.careerGoals}
                  </p>
                </div>
              )}

              {/* Interests */}
              {interests.length > 0 && (
                <div className="mb-6">
                  <h2 className={`text-lg font-bold text-primary mb-2 pb-1 border-b border-primary/20 ${cvLang === "ar" ? "text-right" : "text-left"}`}>
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
                  <h2 className={`text-lg font-bold text-primary mb-2 pb-1 border-b border-primary/20 ${cvLang === "ar" ? "text-right" : "text-left"}`}>
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
                  <h2 className={`text-lg font-bold text-primary mb-2 pb-1 border-b border-primary/20 ${cvLang === "ar" ? "text-right" : "text-left"}`}>
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
                  <h2 className={`text-lg font-bold text-primary mb-2 pb-1 border-b border-primary/20 ${cvLang === "ar" ? "text-right" : "text-left"}`}>
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
              {approvedActivities.length > 0 && (
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
              )}

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

        {/* Edit Tab */}
        <TabsContent value="edit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                {lang === "ar" ? "تعديل البيانات الشخصية" : "Edit Personal Information"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Image Upload */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profileImageUrl} />
                    <AvatarFallback className="text-2xl">
                      {fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Upload className="h-4 w-4 me-2" />
                    {lang === "ar" ? "تغيير الصورة" : "Change Photo"}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    {lang === "ar" ? "JPG, PNG - max 5MB" : "JPG, PNG - max 5MB"}
                  </p>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">
                    {lang === "ar" ? "الاسم الأول" : "First Name"}
                  </Label>
                  <Input
                    id="firstName"
                    value={editableData.firstName}
                    onChange={(e) => setEditableData({...editableData, firstName: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">
                    {lang === "ar" ? "اسم العائلة" : "Last Name"}
                  </Label>
                  <Input
                    id="lastName"
                    value={editableData.lastName}
                    onChange={(e) => setEditableData({...editableData, lastName: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">
                    {lang === "ar" ? "البريد الإلكتروني" : "Email"}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={editableData.email}
                    onChange={(e) => setEditableData({...editableData, email: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">
                    {lang === "ar" ? "رقم الهاتف" : "Phone"}
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={editableData.phone}
                    onChange={(e) => setEditableData({...editableData, phone: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="major">
                    {lang === "ar" ? "التخصص" : "Major"}
                  </Label>
                  <Input
                    id="major"
                    value={editableData.major}
                    onChange={(e) => setEditableData({...editableData, major: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="studentId">
                    {lang === "ar" ? "الرقم التدريبي" : "Student ID"}
                  </Label>
                  <Input
                    id="studentId"
                    value={editableData.studentId}
                    onChange={(e) => setEditableData({...editableData, studentId: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="trainingId">
                    {lang === "ar" ? "رقم التدريب" : "Training ID"}
                  </Label>
                  <Input
                    id="trainingId"
                    value={editableData.trainingId}
                    onChange={(e) => setEditableData({...editableData, trainingId: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="linkedIn">
                    LinkedIn
                  </Label>
                  <Input
                    id="linkedIn"
                    placeholder="https://linkedin.com/in/..."
                    value={editableData.linkedIn}
                    onChange={(e) => setEditableData({...editableData, linkedIn: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="github">
                    GitHub
                  </Label>
                  <Input
                    id="github"
                    placeholder="https://github.com/..."
                    value={editableData.github}
                    onChange={(e) => setEditableData({...editableData, github: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="bio">
                  {lang === "ar" ? "نبذة شخصية" : "Bio"}
                </Label>
                <Textarea
                  id="bio"
                  value={editableData.bio}
                  onChange={(e) => setEditableData({...editableData, bio: e.target.value})}
                  rows={3}
                  className="mt-1"
                  placeholder={lang === "ar" ? "اكتب نبذة عن نفسك..." : "Write a brief about yourself..."}
                />
              </div>
              
              <div>
                <Label htmlFor="careerGoals">
                  {lang === "ar" ? "أهداف مهنية" : "Career Goals"}
                </Label>
                <Textarea
                  id="careerGoals"
                  value={editableData.careerGoals}
                  onChange={(e) => setEditableData({...editableData, careerGoals: e.target.value})}
                  rows={2}
                  className="mt-1"
                  placeholder={lang === "ar" ? "ما هي أهدافك المهنية؟" : "What are your career goals?"}
                />
              </div>
              
              <div>
                <Label htmlFor="skills">
                  {lang === "ar" ? "المهارات (افصل بفواصل)" : "Skills (comma separated)"}
                </Label>
                <Input
                  id="skills"
                  value={editableData.skills.join(", ")}
                  onChange={(e) => setEditableData({
                    ...editableData, 
                    skills: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                  })}
                  className="mt-1"
                  placeholder={lang === "ar" ? "البرمجة, التصميم, التواصل" : "Programming, Design, Communication"}
                />
              </div>
              
              <div>
                <Label htmlFor="interests">
                  {lang === "ar" ? "الاهتمامات (افصل بفواصل)" : "Interests (comma separated)"}
                </Label>
                <Input
                  id="interests"
                  value={editableData.interests.join(", ")}
                  onChange={(e) => setEditableData({
                    ...editableData, 
                    interests: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                  })}
                  className="mt-1"
                  placeholder={lang === "ar" ? "القراءة, السفر, التكنولوجيا" : "Reading, Travel, Technology"}
                />
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  onClick={handleEditSave}
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? (
                    <Loader2 className="h-4 w-4 me-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 me-2" />
                  )}
                  {lang === "ar" ? "حفظ التغييرات" : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4 me-2" />
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

