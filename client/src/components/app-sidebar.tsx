import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import {
  LayoutDashboard,
  PlusCircle,
  ListChecks,
  BookOpen,
  ClipboardCheck,
  LogOut,
  GraduationCap,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AppSidebar() {
  const { t, isRtl } = useI18n();
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const studentItems = [
    { title: t("nav.dashboard"), url: "/dashboard", icon: LayoutDashboard },
    { title: t("nav.addActivity"), url: "/activities/new", icon: PlusCircle },
    { title: t("nav.activities"), url: "/activities", icon: ListChecks },
    { title: t("nav.courses"), url: "/courses", icon: BookOpen },
  ];

  const supervisorItems = [
    { title: t("review.title"), url: "/review", icon: ClipboardCheck },
  ];

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`
    : "U";

  return (
    <Sidebar side={isRtl ? "right" : "left"}>
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2" data-testid="link-home">
          <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">{t("app.name")}</span>
            <span className="text-xs text-muted-foreground">{t("app.tagline")}</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("nav.dashboard")}</SidebarGroupLabel>
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

        <SidebarGroup>
          <SidebarGroupLabel>{t("review.title")}</SidebarGroupLabel>
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
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.profileImageUrl || ""} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-medium truncate" data-testid="text-user-name">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {user?.email}
            </span>
          </div>
          <SidebarMenuButton
            asChild
            className="w-auto p-1"
            onClick={() => logout()}
          >
            <button data-testid="button-logout" title={t("nav.logout")}>
              <LogOut className="h-4 w-4" />
            </button>
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
