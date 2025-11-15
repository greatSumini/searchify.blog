"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Clock, Loader2 } from "lucide-react";
import { useTranslations } from 'next-intl';
import { useDashboardStats } from "@/features/articles/hooks/useDashboardStats";

export function StatsCards() {
  const t = useTranslations('dashboard.stats');
  const { data, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            {t("dashboard.stats.error") || "통계를 불러오는 중 오류가 발생했습니다"}
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = data;
  const monthlyArticles = stats?.monthlyArticles ?? 0;
  const monthlyGoal = 10; // This can be made configurable in the future
  const savedHours = stats?.savedHours ?? 0;
  const achievementRate = monthlyGoal > 0 ? Math.round((monthlyArticles / monthlyGoal) * 100) : 0;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("monthly_articles_title")}</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {monthlyArticles} / {monthlyGoal}{t("monthly_articles_suffix")}
          </div>
          <CardDescription className="mt-1">
            {t("goal_achievement", { rate: achievementRate })}
          </CardDescription>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("saved_time_title")}</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{savedHours} {t("saved_time_suffix")}</div>
          <CardDescription className="mt-1">
            {t("saved_time_desc")}
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
