import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { GraduationCap, CheckCircle2, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const profileSchema = z.object({
  studentId: z.string().min(3, { message: "مطلوب" }),
  trainingId: z.string().optional(),
  phone: z.string().optional(),
  major: z.string().min(1, { message: "مطلوب" }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const majors = [
  { ar: "تقنية الحاسب", en: "Computer Technology" },
  { ar: "تقنية الشبكات", en: "Network Technology" },
  { ar: "تقنية البرمجيات", en: "Software Technology" },
  { ar: "الدعم الفني", en: "Technical Support" },
  { ar: "إدارة الأعمال", en: "Business Administration" },
  { ar: "المحاسبة", en: "Accounting" },
  { ar: "التسويق", en: "Marketing" },
  { ar: "تقنية إلكترونية", en: "Electronic Technology" },
  { ar: "تقنية كهربائية", en: "Electrical Technology" },
  { ar: "تقنية ميكانيكية", en: "Mechanical Technology" },
  { ar: "أخرى", en: "Other" },
];

export default function CompleteProfilePage() {
  const { t, lang, isRtl } = useI18n();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      studentId: "",
      trainingId: "",
      phone: "",
      major: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      await apiRequest("POST", "/api/profile", data);
    },
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: lang === "ar" ? "تم حفظ بياناتك بنجاح" : "Your profile has been saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      setLocation("/dashboard");
    },
    onError: () => {
      toast({ title: t("common.error"), variant: "destructive" });
    },
  });

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`
    : "U";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir={isRtl ? "rtl" : "ltr"}>
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold font-serif">{t("app.name")}</h1>
          <p className="text-muted-foreground">
            {lang === "ar" ? "أكمل بياناتك للبدء" : "Complete your information to get started"}
          </p>
        </div>

        <Card className="border-2">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user?.profileImageUrl || ""} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium" data-testid="text-user-name">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-muted-foreground" data-testid="text-user-email">
                  {user?.email}
                </p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-500 ms-auto" />
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="studentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{lang === "ar" ? "الرقم التدريبي *" : "Student ID *"}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={lang === "ar" ? "مثال: 123456789" : "e.g., 123456789"}
                          {...field}
                          data-testid="input-student-id"
                        />
                      </FormControl>
                      <FormDescription>
                        {lang === "ar" ? "رقم المتدرب في الكلية التقنية" : "Your student number at the Technical College"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="trainingId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{lang === "ar" ? "رقم التدريب" : "Training ID"}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={lang === "ar" ? "مثال: TR-2024-001" : "e.g., TR-2024-001"}
                          {...field}
                          data-testid="input-training-id"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{lang === "ar" ? "رقم الجوال" : "Phone Number"}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={lang === "ar" ? "05XXXXXXXX" : "05XXXXXXXX"}
                          {...field}
                          data-testid="input-phone"
                          dir="ltr"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="major"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{lang === "ar" ? "التخصص *" : "Major *"}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-major">
                            <SelectValue placeholder={lang === "ar" ? "اختر تخصصك" : "Select your major"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {majors.map((m) => (
                            <SelectItem key={m.en} value={m.en}>
                              {lang === "ar" ? m.ar : m.en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-11 text-base mt-2"
                  disabled={mutation.isPending}
                  data-testid="button-save-profile"
                >
                  {mutation.isPending
                    ? (lang === "ar" ? "جاري الحفظ..." : "Saving...")
                    : (lang === "ar" ? "حفظ البيانات والمتابعة" : "Save & Continue")}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          {lang === "ar"
            ? "بياناتك محمية ولن يتم مشاركتها مع أطراف خارجية"
            : "Your data is protected and will not be shared with third parties"}
        </p>
      </div>
    </div>
  );
}
