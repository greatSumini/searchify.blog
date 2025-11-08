"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Pencil } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";

type Article = {
  id: string;
  title: string;
  status: "done" | "draft";
  createdAt: string;
};

const dummyArticles: Article[] = [
  {
    id: "1",
    title: "Next.js 15의 새로운 기능 살펴보기",
    status: "done",
    createdAt: "2025-11-05",
  },
  {
    id: "2",
    title: "AI를 활용한 콘텐츠 마케팅 전략",
    status: "done",
    createdAt: "2025-11-03",
  },
  {
    id: "3",
    title: "인디해커를 위한 SEO 최적화 가이드",
    status: "done",
    createdAt: "2025-11-01",
  },
  {
    id: "4",
    title: "SaaS 제품의 성장 해킹 전략",
    status: "draft",
    createdAt: "2025-10-28",
  },
];

export function RecentArticlesList() {
  const t = useI18n();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.recent.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("dashboard.recent.th.status")}</TableHead>
              <TableHead>{t("dashboard.recent.th.title")}</TableHead>
              <TableHead>{t("dashboard.recent.th.created_at")}</TableHead>
              <TableHead className="text-right">{t("dashboard.recent.th.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dummyArticles.map((article) => (
              <TableRow key={article.id}>
                <TableCell>
                  <Badge
                    variant={
                      article.status === "done" ? "default" : "secondary"
                    }
                  >
                    {article.status === "done" ? t("dashboard.status.done") : t("dashboard.status.draft")}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{article.title}</TableCell>
                <TableCell>{article.createdAt}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
