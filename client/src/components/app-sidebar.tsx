import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import {
  LayoutDashboard, PlusCircle, ListChecks, BookOpen, ClipboardCheck,
  LogOut, GraduationCap, User, Award, FileText, Bot, BarChart3,
  Settings,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { StudentProfile } from "@shared/schema";

export function AppSidebar() {
  const { t, isRtl, lang } = useI18n();
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const { data: profile } = useQuery<StudentProfile>({
    queryKey: ["/api/profile"],
  });

  const role = profile?.role || "student";
  const isTrainerOrSupervisor = role === "trainer" || role === "supervisor";
  const isSupervisor = role === "supervisor";

  const studentItems = [
    { title: t("nav.dashboard"), url: "/dashboard", icon: LayoutDashboard },
    { title: t("nav.addActivity"), url: "/activities/new", icon: PlusCircle },
    { title: t("nav.activities"), url: "/activities", icon: ListChecks },
    { title: t("nav.courses"), url: "/courses", icon: BookOpen },
    { title: t("nav.certificates"), url: "/certificates", icon: Award },
    { title: t("nav.skillRecord"), url: "/skill-record", icon: FileText },
    { title: t("nav.aiAssistant"), url: "/ai-assistant", icon: Bot },
  ];

  const trainerItems = [
    { title: t("nav.trainerDashboard"), url: "/trainer", icon: Settings },
  ];

  const supervisorItems = [
    { title: t("review.title"), url: "/review", icon: ClipboardCheck },
    { title: t("nav.supervisorDashboard"), url: "/supervisor", icon: BarChart3 },
  ];

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`
    : "U";

  const roleBadgeText = role === "supervisor"
    ? (lang === "ar" ? "مشرف" : "Supervisor")
    : role === "trainer"
    ? (lang === "ar" ? "مدرب" : "Trainer")
    : (lang === "ar" ? "متدرب" : "Student");

  return (
    <Sidebar side={isRtl ? "right" : "left"}>
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2" data-testid="link-home">
          <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">{t("app.name")}</span>
            <span className="text-xs text-muted-foreground">{t("app.college")}</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{lang === "ar" ? "القائمة الرئيسية" : "Main Menu"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {studentItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild data-active={location === item.url}>
                    <Link href={item.url} data-testid={`link-${item.url.replace(/\//g, "-").slice(1)}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isTrainerOrSupervisor && (
          <SidebarGroup>
            <SidebarGroupLabel>{lang === "ar" ? "المدرب" : "Trainer"}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {trainerItems.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild data-active={location === item.url}>
                      <Link href={item.url} data-testid={`link-${item.url.replace(/\//g, "-").slice(1)}`}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {isSupervisor && (
          <SidebarGroup>
            <SidebarGroupLabel>{lang === "ar" ? "الإدارة" : "Administration"}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {supervisorItems.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild data-active={location === item.url}>
                      <Link href={item.url} data-testid={`link-${item.url.replace(/\//g, "-").slice(1)}`}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Link href="/profile">
          <div className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded-md p-1.5 -m-1.5 transition-colors" data-testid="link-profile">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.profileImageUrl || ""} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-medium truncate" data-testid="text-user-name">
                {user?.firstName} {user?.lastName}
              </span>
              <div className="flex items-center gap-1.5">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                  {roleBadgeText}
                </Badge>
              </div>
            </div>
            <SidebarMenuButton
              asChild
              className="w-auto p-1"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); logout(); }}
            >
              <button data-testid="button-logout" title={t("nav.logout")}>
                <LogOut className="h-4 w-4" />
              </button>
            </SidebarMenuButton>
          </div>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
