import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Download, Share2, CheckCircle2, ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import type { Certificate, Course, User } from "@shared/schema";

interface CertificateViewProps {
  certificateId: string;
}

export default function CertificateView({ certificateId }: CertificateViewProps) {
  const { t, lang } = useI18n();

  const { data: certificate, isLoading: certLoading } = useQuery<Certificate>({
    queryKey: ["/api/certificates", certificateId],
    queryFn: async () => {
      const res = await fetch(`/api/certificates`);
      const certs = await res.json();
      return certs.find((c: Certificate) => c.id === certificateId);
    }
  });

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/admin/users", certificate?.userId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/users`);
      const users = await res.json();
      return users.find((u: User) => u.id === certificate?.userId);
    },
    enabled: !!certificate?.userId,
  });

  const { data: course, isLoading: courseLoading } = useQuery<Course>({
    queryKey: ["/api/courses", certificate?.courseId],
    enabled: !!certificate?.courseId,
  });

  if (certLoading || courseLoading || userLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Skeleton className="w-full max-w-3xl aspect-[1.414/1] rounded-xl" />
      </div>
    );
  }

  if (!certificate) return <div>Certificate not found</div>;

  const studentName = user ? `${user.firstName} ${user.lastName}` : (lang === "ar" ? "الطالب" : "Student");

  return (
    <div className="space-y-8 p-4 max-w-5xl mx-auto">
      <div className="flex justify-end gap-2 print:hidden">
        <Button variant="outline" onClick={() => window.print()}>
          <Download className="h-4 w-4 me-2" />
          {lang === "ar" ? "تحميل PDF" : "Download PDF"}
        </Button>
      </div>

      <Card className="relative overflow-hidden border-[12px] border-primary/20 bg-white dark:bg-slate-950 aspect-[1.414/1] shadow-2xl print:shadow-none print:border-primary">
        {/* Decorative corner patterns */}
        <div className="absolute top-0 left-0 w-32 h-32 border-t-8 border-l-8 border-primary/30 rounded-tl-lg" />
        <div className="absolute top-0 right-0 w-32 h-32 border-t-8 border-r-8 border-primary/30 rounded-tr-lg" />
        <div className="absolute bottom-0 left-0 w-32 h-32 border-b-8 border-l-8 border-primary/30 rounded-bl-lg" />
        <div className="absolute bottom-0 right-0 w-32 h-32 border-b-8 border-r-8 border-primary/30 rounded-br-lg" />

        <CardContent className="h-full flex flex-col items-center justify-between p-12 sm:p-20 text-center relative z-10">
          <div className="space-y-4">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 animate-pulse bg-primary/20 rounded-full blur-xl" />
                <Award className="h-20 w-20 text-primary relative" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold font-serif text-primary tracking-tight">
              {lang === "ar" ? "شهادة إنجاز" : "Certificate of Achievement"}
            </h1>
            <div className="h-1 w-40 bg-primary/30 mx-auto rounded-full" />
          </div>

          <div className="space-y-6">
            <p className="text-xl sm:text-2xl text-muted-foreground italic font-serif">
              {lang === "ar" ? "نقر بأن" : "This is to certify that"}
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 underline decoration-primary/40 underline-offset-8">
              {studentName}
            </h2>
            <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-serif">
              {lang === "ar" 
                ? `قد أتم بنجاح متطلبات الدورة التدريبية بعنوان:` 
                : `has successfully completed the requirements for the course titled:`}
              <br />
              <span className="text-primary font-bold not-italic text-2xl sm:text-3xl block mt-4">
                " {lang === "ar" ? certificate.titleAr : certificate.titleEn || certificate.titleAr} "
              </span>
            </p>
          </div>

          <div className="w-full flex justify-between items-end mt-12">
            <div className="text-start space-y-2 border-t-2 border-slate-200 dark:border-slate-800 pt-4 w-48">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("certificate.issuedAt")}</p>
              <p className="font-bold">
                {certificate.issuedAt ? new Date(certificate.issuedAt).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US") : "---"}
              </p>
            </div>

            <div className="relative flex flex-col items-center">
              <div className="absolute -top-12 opacity-10">
                <ShieldCheck className="h-32 w-32 text-primary" />
              </div>
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 backdrop-blur-sm">
                 <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-widest text-center">Verification Code</p>
                 <p className="font-mono font-bold text-primary text-sm tracking-tighter">{certificate.verificationCode}</p>
              </div>
            </div>

            <div className="text-end space-y-2 border-t-2 border-slate-200 dark:border-slate-800 pt-4 w-48">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{lang === "ar" ? "ختم الكلية" : "College Seal"}</p>
              <div className="flex justify-end">
                <CheckCircle2 className="h-10 w-10 text-primary opacity-60" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-primary/5 p-6 rounded-xl border border-primary/10 flex items-start gap-4 print:hidden">
        <div className="bg-primary/10 p-2 rounded-lg">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-primary">{lang === "ar" ? "شهادة موثقة" : "Verified Certificate"}</h4>
          <p className="text-sm text-muted-foreground">
            {lang === "ar" 
              ? "هذه الشهادة رسمية وموثقة برمز تحقق فريد. يمكن لأي جهة التحقق من صحتها عبر مسح الرمز أو إدخاله في صفحة التحقق."
              : "This certificate is official and verified with a unique code. Any organization can verify its authenticity by scanning the code or entering it on the verification page."}
          </p>
        </div>
      </div>
    </div>
  );
}
