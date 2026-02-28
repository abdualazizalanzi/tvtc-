import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, X, Plus, Upload, Linkedin, Github, ExternalLink } from "lucide-react";
import type { StudentProfile } from "@shared/schema";

interface ProfileFormValues {
  studentId: string;
  trainingId: string;
  phone: string;
  major: string;
  bio: string;
  skills: string[];
  languages: { name: string; level: string }[];
  linkedIn: string;
  github: string;
  interests: string[];
  careerGoals: string;
}

export default function ProfilePage() {
  const { t, dir } = useI18n();
  const { user } = useAuth();
  const { toast } = useToast();
  const [newSkill, setNewSkill] = useState("");
  const [newInterest, setNewInterest] = useState("");

  const { data: profile, isLoading } = useQuery<StudentProfile>({
    queryKey: ["/api/profile"],
  });

  const form = useForm<ProfileFormValues>({
    defaultValues: {
      studentId: "",
      trainingId: "",
      phone: "",
      major: "",
      bio: "",
      skills: [],
      languages: [],
      linkedIn: "",
      github: "",
      interests: [],
      careerGoals: "",
    },
    values: profile
      ? {
          studentId: profile.studentId || "",
          trainingId: profile.trainingId || "",
          phone: profile.phone || "",
          major: profile.major || "",
          bio: profile.bio || "",
          skills: profile.skills || [],
          languages: profile.languages || [],
          linkedIn: profile.linkedIn || "",
          github: profile.github || "",
          interests: profile.interests || [],
          careerGoals: profile.careerGoals || "",
        }
      : undefined,
  });

  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
    control: form.control,
    name: "skills",
  });

  const { fields: languageFields, append: appendLanguage, remove: removeLanguage } = useFieldArray({
    control: form.control,
    name: "languages",
  });

  const { fields: interestFields, append: appendInterest, remove: removeInterest } = useFieldArray({
    control: form.control,
    name: "interests",
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

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      appendSkill(newSkill.trim());
      setNewSkill("");
    }
  };

  const handleAddInterest = () => {
    if (newInterest.trim()) {
      appendInterest(newInterest.trim());
      setNewInterest("");
    }
  };

  const initials =
    (user?.firstName?.[0] || "") + (user?.lastName?.[0] || "") || "U";

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-3xl mx-auto" dir={dir}>
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
              {Array.from({ length: 6 }).map((_, i) => (
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
                className="space-y-6"
                data-testid="form-profile"
              >
                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                </div>

                {/* Bio */}
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("profile.bio")}</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder={t("profile.bioPlaceholder")}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Skills */}
                <div>
                  <FormLabel>{t("profile.skills")}</FormLabel>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {skillFields.map((field, index) => (
                      <Badge key={field.id} variant="secondary" className="gap-1 pr-1">
                        {form.getValues("skills")[index]}
                        <button
                          type="button"
                          onClick={() => removeSkill(index)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                      placeholder={t("profile.skillsPlaceholder")}
                    />
                    <Button type="button" variant="outline" onClick={handleAddSkill}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <FormLabel>{t("profile.languages")}</FormLabel>
                  <div className="space-y-2 mb-2">
                    {languageFields.map((field, index) => (
                      <div key={field.id} className="flex gap-2 items-center">
                        <Input
                          {...form.register(`languages.${index}.name` as const)}
                          placeholder={t("profile.languageName")}
                          className="flex-1"
                        />
                        <Select
                          value={form.getValues("languages")?.[index]?.level || ""}
                          onValueChange={(value) => {
                            const languages = form.getValues("languages") || [];
                            languages[index] = { ...languages[index], level: value };
                            form.setValue("languages", languages);
                          }}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder={t("profile.languageLevel")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">{t("cv.languageLevel.beginner")}</SelectItem>
                            <SelectItem value="intermediate">{t("cv.languageLevel.intermediate")}</SelectItem>
                            <SelectItem value="advanced">{t("cv.languageLevel.advanced")}</SelectItem>
                            <SelectItem value="native">{t("cv.languageLevel.native")}</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeLanguage(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => appendLanguage({ name: "", level: "intermediate" })}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="ms-2">{t("profile.addLanguage")}</span>
                  </Button>
                </div>

                {/* Social Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="linkedIn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("profile.linkedIn")}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Linkedin className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              {...field}
                              className="ps-10"
                              placeholder={t("profile.linkedInPlaceholder")}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="github"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("profile.github")}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Github className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              {...field}
                              className="ps-10"
                              placeholder={t("profile.githubPlaceholder")}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Interests */}
                <div>
                  <FormLabel>{t("profile.interests")}</FormLabel>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {interestFields.map((field, index) => (
                      <Badge key={field.id} variant="outline" className="gap-1 pr-1">
                        {form.getValues("interests")[index]}
                        <button
                          type="button"
                          onClick={() => removeInterest(index)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddInterest();
                        }
                      }}
                      placeholder={t("profile.interestsPlaceholder")}
                    />
                    <Button type="button" variant="outline" onClick={handleAddInterest}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Career Goals */}
                <FormField
                  control={form.control}
                  name="careerGoals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("profile.careerGoals")}</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder={t("profile.careerGoalsPlaceholder")}
                          rows={3}
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

