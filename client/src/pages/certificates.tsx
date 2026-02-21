import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, Copy, ExternalLink, Eye, X } from "lucide-react";
import { Link } from "wouter";
import type { Certificate } from "@shared/schema";
import CertificateView from "@/components/certificate-view";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function CertificatesPage() {
  const { t, lang, dir } = useI18n();
  const { toast } = useToast();
  const [selectedCertId, setSelectedCertId] = useState<string | null>(null);

  const { data: certificates, isLoading } = useQuery<Certificate[]>({
    queryKey: ["/api/certificates"],
  });

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: t("common.success") });
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto" dir={dir}>
      <div className="flex items-center gap-3">
        <Award className="h-6 w-6" />
        <h1 className="text-2xl font-bold" data-testid="text-certificates-title">
          {t("certificate.title")}
        </h1>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-9 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : certificates && certificates.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {certificates.map((cert) => (
            <Card key={cert.id} data-testid={`card-certificate-${cert.id}`} className="group hover:border-primary/40 transition-colors">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <p
                      className="font-semibold truncate group-hover:text-primary transition-colors"
                      data-testid={`text-cert-title-${cert.id}`}
                    >
                      {lang === "ar"
                        ? cert.titleAr
                        : cert.titleEn || cert.titleAr}
                    </p>
                    <Badge variant="secondary" className="mt-1">
                      {t("certificate.completion")}
                    </Badge>
                  </div>
                  <Award className="h-5 w-5 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                </div>

                <div className="text-sm text-muted-foreground space-y-1">
                  {(cert as any).certificateNumber && (
                    <p data-testid={`text-cert-number-${cert.id}`}>
                      {lang === "ar" ? "رقم الشهادة:" : "Certificate No:"}{" "}
                      <span className="font-mono text-foreground">{String((cert as any).certificateNumber).padStart(6, "0")}</span>
                    </p>
                  )}
                  <p data-testid={`text-cert-issued-${cert.id}`}>
                    {t("certificate.issuedAt")}:{" "}
                    {cert.issuedAt
                      ? new Date(cert.issuedAt).toLocaleDateString(
                          lang === "ar" ? "ar-SA" : "en-US"
                        )
                      : "—"}
                  </p>
                  <p data-testid={`text-cert-code-${cert.id}`}>
                    {t("certificate.verificationCode")}:{" "}
                    <span className="font-mono text-foreground">
                      {cert.verificationCode || "—"}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => setSelectedCertId(cert.id)}
                  >
                    <Eye className="h-3.5 w-3.5 me-1.5" />
                    {lang === "ar" ? "عرض الشهادة" : "View Certificate"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8"
                    onClick={() => copyCode(cert.verificationCode || "")}
                    data-testid={`button-copy-code-${cert.id}`}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8"
                    onClick={() => window.open(`/verify/${cert.verificationCode}`, '_blank')}
                    data-testid={`link-verify-${cert.id}`}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-40" />
            <p
              className="text-muted-foreground"
              data-testid="text-no-certificates"
            >
              {lang === "ar"
                ? "لا توجد شهادات بعد"
                : "No certificates yet"}
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!selectedCertId} onOpenChange={(open) => !open && setSelectedCertId(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-5xl p-0 overflow-hidden border-none bg-transparent shadow-none">
          <DialogHeader className="sr-only">
            <DialogTitle>View Certificate</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-4 top-4 z-50 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white print:hidden"
              onClick={() => setSelectedCertId(null)}
            >
              <X className="h-5 w-5" />
            </Button>
            {selectedCertId && <CertificateView certificateId={selectedCertId} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

