import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { PlusCircle, ListChecks, Calendar, Building2, Clock } from "lucide-react";
import { useState } from "react";
import type { Activity } from "@shared/schema";

function StatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  const variant =
    status === "approved" ? "default" : status === "rejected" ? "destructive" : "secondary";
  return <Badge variant={variant}>{t(`status.${status}`)}</Badge>;
}

export default function ActivitiesPage() {
  const { t, lang } = useI18n();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const filtered = activities?.filter((a) => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (typeFilter !== "all" && a.type !== typeFilter) return false;
    return true;
  });

  const activityTypes = [
    "volunteer_work", "student_employment", "participation", "self_development",
    "awards", "student_activity", "professional_activity", "leadership_skills",
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t("activity.myActivities")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === "ar" ? "إدارة ومتابعة أنشطتك" : "Manage and track your activities"}
          </p>
        </div>
        <Link href="/activities/new">
          <Button data-testid="button-add-activity">
            <PlusCircle className="h-4 w-4" />
            <span className="ms-1.5">{t("activity.addNew")}</span>
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]" data-testid="select-status-filter">
            <SelectValue placeholder={t("activity.status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{lang === "ar" ? "جميع الحالات" : "All Statuses"}</SelectItem>
            <SelectItem value="submitted">{t("status.submitted")}</SelectItem>
            <SelectItem value="under_review">{t("status.under_review")}</SelectItem>
            <SelectItem value="approved">{t("status.approved")}</SelectItem>
            <SelectItem value="rejected">{t("status.rejected")}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[200px]" data-testid="select-type-filter">
            <SelectValue placeholder={t("activity.type")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{lang === "ar" ? "جميع الأنواع" : "All Types"}</SelectItem>
            {activityTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {t(`activity.types.${type}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-48 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((activity) => (
            <Card key={activity.id} className="hover-elevate" data-testid={`card-activity-${activity.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center shrink-0">
                    <ListChecks className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-sm">
                        {lang === "ar" ? activity.nameAr : activity.nameEn || activity.nameAr}
                      </h3>
                      <StatusBadge status={activity.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {activity.organization}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {activity.hours} {t("courses.hours")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {activity.startDate
                          ? new Date(activity.startDate).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US")
                          : ""}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {t(`activity.types.${activity.type}`)}
                    </Badge>
                    {activity.status === "rejected" && activity.rejectionReason && (
                      <p className="text-xs text-destructive mt-1">
                        {activity.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <ListChecks className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-40" />
            <h3 className="font-medium mb-1">{t("common.noData")}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {lang === "ar" ? "لم تقم بإضافة أي أنشطة بعد" : "You haven't added any activities yet"}
            </p>
            <Link href="/activities/new">
              <Button>
                <PlusCircle className="h-4 w-4" />
                <span className="ms-1.5">{t("activity.addNew")}</span>
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
