import { useI18n } from "@/lib/i18n";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClipboardCheck, CheckCircle2, XCircle, Building2, Clock, Calendar, User } from "lucide-react";
import { useState } from "react";
import { isUnauthorizedError } from "@/lib/auth-utils";

interface ActivityWithUser {
  id: string;
  userId: string;
  type: string;
  nameAr: string;
  nameEn: string | null;
  organization: string;
  hours: number;
  startDate: string;
  endDate: string | null;
  descriptionAr: string | null;
  descriptionEn: string | null;
  status: string;
  createdAt: string;
  userName?: string;
  userEmail?: string;
}

export default function ReviewPage() {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("submitted");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityWithUser | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: allActivities, isLoading } = useQuery<ActivityWithUser[]>({
    queryKey: ["/api/activities/all"],
  });

  const reviewMutation = useMutation({
    mutationFn: async ({
      activityId,
      action,
      reason,
    }: {
      activityId: string;
      action: "approve" | "reject";
      reason?: string;
    }) => {
      const res = await apiRequest("POST", `/api/activities/${activityId}/review`, {
        action,
        rejectionReason: reason,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: lang === "ar" ? "تم تحديث حالة الطلب" : "Request status updated",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/activities/all"] });
      setRejectDialogOpen(false);
      setRejectionReason("");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "Logging in again...", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filtered = allActivities?.filter((a) => {
    if (statusFilter === "all") return true;
    return a.status === statusFilter;
  });

  function StatusBadge({ status }: { status: string }) {
    const variant =
      status === "approved" ? "default" : status === "rejected" ? "destructive" : "secondary";
    return <Badge variant={variant}>{t(`status.${status}`)}</Badge>;
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">{t("review.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === "ar" ? "مراجعة واعتماد أنشطة الطلاب" : "Review and approve student activities"}
        </p>
      </div>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[180px]" data-testid="select-review-filter">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{lang === "ar" ? "جميع الحالات" : "All Statuses"}</SelectItem>
          <SelectItem value="submitted">{t("status.submitted")}</SelectItem>
          <SelectItem value="under_review">{t("status.under_review")}</SelectItem>
          <SelectItem value="approved">{t("status.approved")}</SelectItem>
          <SelectItem value="rejected">{t("status.rejected")}</SelectItem>
        </SelectContent>
      </Select>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((activity) => (
            <Card key={activity.id} data-testid={`card-review-${activity.id}`}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <h3 className="font-medium text-sm">
                        {lang === "ar" ? activity.nameAr : activity.nameEn || activity.nameAr}
                      </h3>
                      {activity.userName && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {activity.userName} ({activity.userEmail})
                        </p>
                      )}
                    </div>
                    <StatusBadge status={activity.status} />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">
                      {t(`activity.types.${activity.type}`)}
                    </Badge>
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

                  {(activity.descriptionAr || activity.descriptionEn) && (
                    <p className="text-xs text-muted-foreground">
                      {lang === "ar" ? activity.descriptionAr : activity.descriptionEn || activity.descriptionAr}
                    </p>
                  )}

                  {activity.status === "submitted" && (
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        size="sm"
                        onClick={() =>
                          reviewMutation.mutate({ activityId: activity.id, action: "approve" })
                        }
                        disabled={reviewMutation.isPending}
                        data-testid={`button-approve-${activity.id}`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span className="ms-1.5">{t("review.approve")}</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedActivity(activity);
                          setRejectDialogOpen(true);
                        }}
                        disabled={reviewMutation.isPending}
                        data-testid={`button-reject-${activity.id}`}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span className="ms-1.5">{t("review.reject")}</span>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <ClipboardCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-40" />
            <h3 className="font-medium mb-1">{t("review.noRequests")}</h3>
          </CardContent>
        </Card>
      )}

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("review.reject")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {lang === "ar"
                ? `رفض: ${selectedActivity?.nameAr}`
                : `Rejecting: ${selectedActivity?.nameEn || selectedActivity?.nameAr}`}
            </p>
            <Textarea
              placeholder={t("review.reason")}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              data-testid="input-rejection-reason"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedActivity) {
                  reviewMutation.mutate({
                    activityId: selectedActivity.id,
                    action: "reject",
                    reason: rejectionReason,
                  });
                }
              }}
              disabled={reviewMutation.isPending}
              data-testid="button-confirm-reject"
            >
              {t("review.reject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
