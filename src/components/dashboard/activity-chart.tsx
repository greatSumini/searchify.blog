"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from 'next-intl';

export function ActivityChart() {
  const t = useTranslations();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.activity.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25">
          <p className="text-sm text-muted-foreground">{t("dashboard.activity.placeholder")}</p>
        </div>
      </CardContent>
    </Card>
  );
}
