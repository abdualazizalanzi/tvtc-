import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import type { StudentProfile } from "@shared/schema";

interface ProfileFormValues {
  studentId: string;
  trainingId: string;
  phone: string;
  major: string;
}

export default function ProfilePage() {
  const { t, dir } = useI18n();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: profile, isLoading } = useQuery<StudentProfile>({
    queryKey: ["/api/profile"],
  });

  const form = useForm<ProfileFormValues>({
    defaultValues: {
      studentId: "",
      trainingId: "",
      phone: "",
      major: "",
    },
    values: profile
      ? {
          studentId: profile.studentId || "",
          trainingId: profile.trainingId || "",
          phone: profile.phone || "",
          major: profile.major || "",
        }
      : undefined,
  });

  const mutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      await apiRequest("POST", "/api/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({ title: t("common.success") });
    },
    onError: () => {
      toast({ title: t("common.error"), variant: "destructive" });
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    mutation.mutate(data);
  };

  const initials =
    (user?.firstName?.[0] || "") + (user?.lastName?.[0] || "") || "U";

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto" dir={dir}>
      <h1 className="text-2xl font-bold" data-testid="text-profile-title">
        {t("profile.title")}
      </h1>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={user?.profileImageUrl || undefined}
                alt={user?.firstName || ""}
                data-testid="img-avatar"
              />
              <AvatarFallback data-testid="text-avatar-fallback">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p
                className="text-lg font-semibold truncate"
                data-testid="text-user-name"
              >
                {[user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
                  "—"}
              </p>
              <p
                className="text-sm text-muted-foreground truncate"
                data-testid="text-user-email"
              >
                {user?.email || "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("profile.save")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-9 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
                data-testid="form-profile"
              >
                <FormField
                  control={form.control}
                  name="studentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("profile.studentId")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          data-testid="input-student-id"
                          placeholder={t("profile.studentId")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="trainingId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("profile.trainingId")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          data-testid="input-training-id"
                          placeholder={t("profile.trainingId")}
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
                      <FormLabel>{t("profile.phone")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          data-testid="input-phone"
                          placeholder={t("profile.phone")}
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
                      <FormLabel>{t("profile.major")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          data-testid="input-major"
                          placeholder={t("profile.major")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  data-testid="button-save-profile"
                >
                  {mutation.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  <span className="ms-1.5">{t("common.save")}</span>
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
