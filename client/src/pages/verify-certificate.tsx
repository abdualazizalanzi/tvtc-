import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, XCircle, ArrowLeft, Loader2 } from "lucide-react";
import CertificateView from "@/components/certificate-view";
import type { Certificate } from "@shared/schema";

export default function VerifyCertificatePage() {
  const { code } = useParams<{ code: string }>();
  const { t, lang } = useI18n();

  const { data: certificate, isLoading, isError } = useQuery<Certificate>({
    queryKey: ["/api/certificates/verify", code],
    queryFn: async () => {
      const res = await fetch(`/api/certificates/verify/${code}`);
      if (!res.ok) throw new Error("Certificate not found");
      return res.json();
    },
    enabled: !!code,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">{lang === "ar" ? "جاري التحقق من الشهادة..." : "Verifying certificate..."}</p>
      </div>
    );
  }

  if (isError || !certificate) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-destructive/10 p-6 rounded-full mb-6">
          <XCircle className="h-16 w-16 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold mb-2">{lang === "ar" ? "شهادة غير صالحة" : "Invalid Certificate"}</h1>
        <p className="text-muted-foreground max-w-md mb-8">
          {lang === "ar" 
            ? "عذراً، لم نتمكن من العثور على شهادة بهذا الرمز. يرجى التأكد من صحة الرمز والمحاولة مرة أخرى."
            : "Sorry, we couldn't find a certificate with this code. Please make sure the code is correct and try again."}
        </p>
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 me-2" />
            {lang === "ar" ? "العودة للرئيسية" : "Back to Home"}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-12">
      <header className="bg-white dark:bg-slate-950 border-b p-4 mb-8 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-sm leading-tight">{lang === "ar" ? "نظام التحقق" : "Verification System"}</h2>
              <p className="text-[10px] text-muted-foreground">{lang === "ar" ? "شهادة موثقة" : "Verified Certificate"}</p>
            </div>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm">
              {lang === "ar" ? "الرئيسية" : "Home"}
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8 text-center sm:text-start">
          <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold mb-4">
            <ShieldCheck className="h-3.5 w-3.5" />
            {lang === "ar" ? "تم التحقق من صحة هذه الشهادة بنجاح" : "This certificate has been successfully verified"}
          </div>
          <h1 className="text-3xl font-bold">{lang === "ar" ? "تفاصيل الشهادة" : "Certificate Details"}</h1>
        </div>

        <CertificateView certificateId={certificate.id} />
      </div>
    </div>
  );
}
