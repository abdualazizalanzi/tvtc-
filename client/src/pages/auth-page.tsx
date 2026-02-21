import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { GraduationCap, LogIn, UserPlus, Loader2 } from "lucide-react";

export default function AuthPage() {
  const { t, lang, isRtl } = useI18n();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("student");

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/login", { email, password });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: lang === "ar" ? "خطأ" : "Error",
        description: error.message.includes("401")
          ? (lang === "ar" ? "البريد أو كلمة المرور غير صحيحة" : "Invalid email or password")
          : (lang === "ar" ? "حدث خطأ أثناء تسجيل الدخول" : "Login failed"),
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/register", { email, password, firstName, lastName, role });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: lang === "ar" ? "خطأ" : "Error",
        description: error.message.includes("409")
          ? (lang === "ar" ? "البريد الإلكتروني مسجل بالفعل" : "Email already registered")
          : (lang === "ar" ? "حدث خطأ أثناء التسجيل" : "Registration failed"),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && password !== confirmPassword) {
      toast({
        title: lang === "ar" ? "خطأ" : "Error",
        description: t("auth.passwordMismatch"),
        variant: "destructive",
      });
      return;
    }
    if (isLogin) {
      loginMutation.mutate();
    } else {
      registerMutation.mutate();
    }
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen bg-background flex" dir={isRtl ? "rtl" : "ltr"}>
      <div className="absolute top-4 end-4 flex items-center gap-1 z-10">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold font-serif" data-testid="text-auth-title">
              {t("app.name")}
            </h1>
            <p className="text-sm text-muted-foreground">{t("app.college")}</p>
          </div>

          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="text-center space-y-1">
                <h2 className="text-xl font-semibold" data-testid="text-form-title">
                  {isLogin ? t("auth.welcomeBack") : t("auth.createAccount")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isLogin ? t("auth.welcomeBackDesc") : t("auth.createAccountDesc")}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName">{t("auth.firstName")}</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required={!isLogin}
                        data-testid="input-first-name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lastName">{t("auth.lastName")}</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required={!isLogin}
                        data-testid="input-last-name"
                      />
                    </div>
                  </div>
                )}

                {!isLogin && (
                  <div className="space-y-1.5">
                    <Label>{t("auth.role")}</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger data-testid="select-role">
                        <SelectValue placeholder={t("auth.role.desc")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">{t("auth.role.student")}</SelectItem>
                        <SelectItem value="trainer">{t("auth.role.trainer")}</SelectItem>
                        <SelectItem value="supervisor">{t("auth.role.supervisor")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email">{t("auth.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    data-testid="input-email"
                    placeholder={lang === "ar" ? "example@email.com" : "example@email.com"}
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">{t("auth.password")}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    data-testid="input-password"
                    dir="ltr"
                  />
                </div>

                {!isLogin && (
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required={!isLogin}
                      minLength={6}
                      data-testid="input-confirm-password"
                      dir="ltr"
                    />
                  </div>
                )}

                <Button type="submit" className="w-full h-11" disabled={isPending} data-testid="button-submit-auth">
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isLogin ? (
                    <>
                      <LogIn className="h-4 w-4" />
                      <span className="ms-2">{t("auth.loginBtn")}</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      <span className="ms-2">{t("auth.registerBtn")}</span>
                    </>
                  )}
                </Button>
              </form>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">
                  {isLogin ? t("auth.noAccount") : t("auth.haveAccount")}
                </span>{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary font-medium hover:underline"
                  data-testid="button-toggle-auth"
                >
                  {isLogin ? t("auth.register") : t("auth.login")}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 items-center justify-center bg-primary/5 p-12">
        <div className="max-w-md space-y-6 text-center">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            <GraduationCap className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-3xl font-bold font-serif">
            {t("landing.hero.title")}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {t("landing.hero.subtitle")}
          </p>
        </div>
      </div>
    </div>
  );
}
