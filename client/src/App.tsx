import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { ThemeProvider, ThemeToggle } from "@/components/theme-provider";
import { LanguageToggle } from "@/components/language-toggle";
import { useAuth } from "@/hooks/use-auth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import LandingPage from "@/pages/landing";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard";
import ActivitiesPage from "@/pages/activities";
import AddActivityPage from "@/pages/add-activity";
import CoursesPage from "@/pages/courses";
import ReviewPage from "@/pages/review";
import CoursePlayerPage from "@/pages/course-player";
import AIAssistantPage from "@/pages/ai-assistant";
import SkillRecordPage from "@/pages/skill-record";
import TrainerDashboardPage from "@/pages/trainer-dashboard";
import SupervisorDashboardPage from "@/pages/supervisor-dashboard";
import ProfilePage from "@/pages/profile";
import CertificatesPage from "@/pages/certificates";
import VerifyCertificatePage from "@/pages/verify-certificate";
import CompleteProfilePage from "@/pages/complete-profile";
import AdminUsersPage from "@/pages/admin-users";
import NotFound from "@/pages/not-found";
import CareerGuidancePage from "@/pages/career-guidance";
import CVGeneratorPage from "@/pages/cv-generator";
import { Skeleton } from "@/components/ui/skeleton";
import type { StudentProfile } from "@shared/schema";

function AuthenticatedLayout() {
  const { isRtl } = useI18n();

  const style = {
    "--sidebar-width": "17rem",
    "--sidebar-width-icon": "3.5rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex min-h-screen w-full" dir={isRtl ? "rtl" : "ltr"}>
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between gap-1 p-2 border-b sticky top-0 z-40 bg-background/80 backdrop-blur-md">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-1">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto">
            <Switch>
              <Route path="/" component={DashboardPage} />
              <Route path="/dashboard" component={DashboardPage} />
              <Route path="/activities/new" component={AddActivityPage} />
              <Route path="/activities" component={ActivitiesPage} />
              <Route path="/courses/:id" component={CoursePlayerPage} />
              <Route path="/courses" component={CoursesPage} />
              <Route path="/review" component={ReviewPage} />
              <Route path="/trainer" component={TrainerDashboardPage} />
              <Route path="/supervisor" component={SupervisorDashboardPage} />
              <Route path="/admin/users" component={AdminUsersPage} />
              <Route path="/profile" component={ProfilePage} />
              <Route path="/certificates" component={CertificatesPage} />
              <Route path="/verify/:code" component={VerifyCertificatePage} />
              <Route path="/ai-assistant" component={AIAssistantPage} />
              <Route path="/skill-record" component={SkillRecordPage} />
              <Route path="/career-guidance" component={CareerGuidancePage} />
              <Route path="/cv-generator" component={CVGeneratorPage} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();

  const { data: profile, isLoading: profileLoading } = useQuery<StudentProfile>({
    queryKey: ["/api/profile"],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 text-center">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route path="/" component={LandingPage} />
        <Route component={LandingPage} />
      </Switch>
    );
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 text-center">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (!profile || !profile.studentId || !profile.major) {
    return <CompleteProfilePage />;
  }

  return <AuthenticatedLayout />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <I18nProvider>
          <TooltipProvider>
            <Toaster />
            <AppContent />
          </TooltipProvider>
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
