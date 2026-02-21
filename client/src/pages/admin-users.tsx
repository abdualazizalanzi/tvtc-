import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Users, UserPlus, Shield, GraduationCap, BookOpen, Loader2, Award, KeyRound } from "lucide-react";

interface AdminUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  createdAt: string | null;
  role: string | null;
  studentId: string | null;
  major: string | null;
  phone: string | null;
}

export default function AdminUsersPage() {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newRole, setNewRole] = useState<string>("student");

  const { data: users = [], isLoading } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/users", {
        email: newEmail,
        password: newPassword,
        firstName: newFirstName,
        lastName: newLastName,
        role: newRole,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: t("admin.users.createSuccess") });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setCreateOpen(false);
      setNewEmail("");
      setNewPassword("");
      setNewFirstName("");
      setNewLastName("");
      setNewRole("student");
    },
    onError: (error: Error) => {
      toast({
        title: lang === "ar" ? "خطأ" : "Error",
        description: error.message.includes("409")
          ? (lang === "ar" ? "البريد مسجل بالفعل" : "Email already registered")
          : (lang === "ar" ? "فشل إنشاء الحساب" : "Failed to create account"),
        variant: "destructive",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: string; newPassword: string }) => {
      const res = await apiRequest("POST", `/api/admin/users/${userId}/reset-password`, { newPassword });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: lang === "ar" ? "تم تغيير كلمة المرور بنجاح" : "Password reset successfully" });
    },
    onError: () => {
      toast({ title: lang === "ar" ? "فشل تغيير كلمة المرور" : "Failed to reset password", variant: "destructive" });
    },
  });

  const roleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${userId}/role`, { role });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: t("admin.users.roleChanged") });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: () => {
      toast({ title: lang === "ar" ? "خطأ" : "Error", variant: "destructive" });
    },
  });

  const roleLabel = (role: string | null) => {
    if (role === "supervisor") return lang === "ar" ? "مشرف" : "Supervisor";
    if (role === "trainer") return lang === "ar" ? "مدرب" : "Trainer";
    return lang === "ar" ? "متدرب" : "Student";
  };

  const roleBadgeVariant = (role: string | null) => {
    if (role === "supervisor") return "destructive" as const;
    if (role === "trainer") return "default" as const;
    return "secondary" as const;
  };

  const roleIcon = (role: string | null) => {
    if (role === "supervisor") return <Shield className="h-3 w-3" />;
    if (role === "trainer") return <BookOpen className="h-3 w-3" />;
    return <GraduationCap className="h-3 w-3" />;
  };

  const studentCount = users.filter(u => (u.role || "student") === "student").length;
  const trainerCount = users.filter(u => u.role === "trainer").length;
  const supervisorCount = users.filter(u => u.role === "supervisor").length;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif" data-testid="text-page-title">
            {t("admin.users.title")}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t("admin.users.totalUsers")}: {users.length}
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-user">
              <UserPlus className="h-4 w-4 me-2" />
              {t("admin.users.create")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("admin.users.create")}</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{t("auth.firstName")}</Label>
                  <Input
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    required
                    data-testid="input-new-first-name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("auth.lastName")}</Label>
                  <Input
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    required
                    data-testid="input-new-last-name"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>{t("admin.users.email")}</Label>
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  dir="ltr"
                  data-testid="input-new-email"
                />
              </div>

              <div className="space-y-1.5">
                <Label>{t("admin.users.password")}</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  dir="ltr"
                  data-testid="input-new-password"
                />
              </div>

              <div className="space-y-1.5">
                <Label>{t("admin.users.role")}</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger data-testid="select-new-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">{t("auth.role.student")}</SelectItem>
                    <SelectItem value="trainer">{t("auth.role.trainer")}</SelectItem>
                    <SelectItem value="supervisor">{t("auth.role.supervisor")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={createMutation.isPending}
                data-testid="button-submit-create-user"
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 me-2" />
                    {t("admin.users.create")}
                  </>
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-md bg-blue-500/10">
              <GraduationCap className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold" data-testid="text-student-count">{studentCount}</p>
              <p className="text-xs text-muted-foreground">{t("auth.role.student")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-md bg-green-500/10">
              <BookOpen className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold" data-testid="text-trainer-count">{trainerCount}</p>
              <p className="text-xs text-muted-foreground">{t("auth.role.trainer")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-md bg-red-500/10">
              <Shield className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold" data-testid="text-supervisor-count">{supervisorCount}</p>
              <p className="text-xs text-muted-foreground">{t("auth.role.supervisor")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t("admin.users.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{t("admin.users.noUsers")}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("admin.users.name")}</TableHead>
                    <TableHead>{t("admin.users.email")}</TableHead>
                    <TableHead>{t("admin.users.role")}</TableHead>
                    <TableHead>{t("admin.users.created")}</TableHead>
                    <TableHead>{t("admin.users.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id} data-testid={`row-user-${u.id}`}>
                      <TableCell>
                        <span className="font-medium">
                          {u.firstName} {u.lastName}
                        </span>
                        {u.studentId && (
                          <span className="text-xs text-muted-foreground block">
                            ID: {u.studentId}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm" dir="ltr">{u.email}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={roleBadgeVariant(u.role)} className="gap-1">
                          {roleIcon(u.role)}
                          {roleLabel(u.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US") : "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs"
                            data-testid={`button-reset-password-${u.id}`}
                            onClick={() => {
                              const newPassword = prompt(lang === "ar" ? "أدخل كلمة المرور الجديدة (6 أحرف على الأقل):" : "Enter new password (min 6 chars):");
                              if (newPassword && newPassword.length >= 6) {
                                resetPasswordMutation.mutate({ userId: u.id, newPassword });
                              } else if (newPassword) {
                                toast({
                                  title: lang === "ar" ? "خطأ" : "Error",
                                  description: lang === "ar" ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل" : "Password must be at least 6 characters",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            <KeyRound className="h-3.5 w-3.5 me-1" />
                            {lang === "ar" ? "تغيير كلمة المرور" : "Reset Password"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs"
                            onClick={() => {
                              const courseId = prompt(lang === "ar" ? "أدخل رقم الدورة (ID):" : "Enter Course ID:");
                              if (courseId) {
                                apiRequest("POST", "/api/admin/issue-certificate", { userId: u.id, courseId })
                                  .then(() => {
                                    toast({
                                      title: lang === "ar" ? "تم بنجاح" : "Success",
                                      description: lang === "ar" ? "تم إصدار الشهادة بنجاح" : "Certificate issued successfully",
                                    });
                                    queryClient.invalidateQueries({ queryKey: ["/api/certificates"] });
                                  })
                                  .catch((err) => {
                                    toast({
                                      title: lang === "ar" ? "خطأ" : "Error",
                                      description: err.message,
                                      variant: "destructive",
                                    });
                                  });
                              }
                            }}
                          >
                            <Award className="h-3.5 w-3.5 me-1" />
                            {lang === "ar" ? "إصدار شهادة" : "Issue Cert"}
                          </Button>
                          <Select
                            value={u.role || "student"}
                            onValueChange={(role) => roleMutation.mutate({ userId: u.id, role })}
                          >
                            <SelectTrigger className="w-32 h-8 text-xs" data-testid={`select-role-${u.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="student">{t("auth.role.student")}</SelectItem>
                              <SelectItem value="trainer">{t("auth.role.trainer")}</SelectItem>
                              <SelectItem value="supervisor">{t("auth.role.supervisor")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
