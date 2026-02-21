import { useI18n } from "@/lib/i18n";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Send, Upload, Info } from "lucide-react";
import { isUnauthorizedError } from "@/lib/auth-utils";
import { ACTIVITY_MIN_HOURS } from "@shared/schema";
import { useState, useRef } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const activityFormSchema = z.object({
  type: z.enum([
    "volunteer_work", "student_employment", "participation", "self_development",
    "awards", "student_activity", "professional_activity", "leadership_skills",
  ]),
  nameAr: z.string().min(2),
  nameEn: z.string().optional(),
  organization: z.string().min(2),
  hours: z.coerce.number().min(1).max(500),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  descriptionAr: z.string().optional(),
  descriptionEn: z.string().optional(),
});

type ActivityFormData = z.infer<typeof activityFormSchema>;

export default function AddActivityPage() {
  const { t, lang, isRtl } = useI18n();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ActivityFormData>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      type: "volunteer_work",
      nameAr: "",
      nameEn: "",
      organization: "",
      hours: 1,
      startDate: "",
      endDate: "",
      descriptionAr: "",
      descriptionEn: "",
    },
  });

  const selectedType = form.watch("type");
  const minHours = ACTIVITY_MIN_HOURS[selectedType] || 1;

  const mutation = useMutation({
    mutationFn: async (data: ActivityFormData) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (key === "startDate" || key === "endDate") {
            formData.append(key, new Date(value as string).toISOString());
          } else {
            formData.append(key, String(value));
          }
        }
      });
      if (certificateFile) {
        formData.append("certificate", certificateFile);
      }
      const res = await fetch("/api/activities", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status}: ${text}`);
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: lang === "ar" ? "تم إرسال النشاط للمراجعة" : "Activity submitted for review",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      setLocation("/activities");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "Logging in again...", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
    },
  });

  const activityTypes = [
    "volunteer_work", "student_employment", "participation", "self_development",
    "awards", "student_activity", "professional_activity", "leadership_skills",
  ] as const;

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/activities")} data-testid="button-back">
          <BackArrow className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{t("activity.addNew")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {lang === "ar" ? "أضف نشاطك للسجل المهاري" : "Add your activity to the skill record"}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-5">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("activity.type")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-activity-type">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activityTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {t(`activity.types.${type}`)} ({ACTIVITY_MIN_HOURS[type]} {t("courses.hours")})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {lang === "ar"
                    ? `الحد الأدنى لهذا النوع: ${minHours} ساعة`
                    : `Minimum hours for this type: ${minHours} hours`}
                </AlertDescription>
              </Alert>

              <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nameAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("activity.nameAr")}</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-name-ar" dir="rtl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nameEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("activity.nameEn")}</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-name-en" dir="ltr" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="organization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("activity.organization")}</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-organization" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("activity.hours")}</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} data-testid="input-hours" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("activity.startDate")}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-start-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("activity.endDate")}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-end-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">{t("activity.certificate")}</label>
                <div
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="upload-certificate"
                >
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {certificateFile ? certificateFile.name : t("activity.certificateHint")}
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    className="hidden"
                    onChange={(e) => setCertificateFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="descriptionAr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("activity.description")} ({lang === "ar" ? "عربي" : "Arabic"})</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} data-testid="input-description-ar" dir="rtl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="descriptionEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("activity.description")} ({lang === "ar" ? "إنجليزي" : "English"})</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} data-testid="input-description-en" dir="ltr" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setLocation("/activities")} data-testid="button-cancel">
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={mutation.isPending} data-testid="button-submit">
                  <Send className="h-4 w-4" />
                  <span className="ms-1.5">{mutation.isPending ? t("common.loading") : t("activity.submit")}</span>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
