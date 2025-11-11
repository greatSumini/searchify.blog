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
import { Eye, Pencil, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { useListArticles } from "@/features/articles/hooks/useListArticles";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useRouter } from "next/navigation";

export function RecentArticlesList() {
  const t = useI18n();
  const router = useRouter();
  const { data, isLoading, error } = useListArticles({
    query: {
      limit: 5,
      sortBy: "created_at",
      sortOrder: "desc",
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.recent.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.recent.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            {t("dashboard.recent.error") || "글 목록을 불러오는 중 오류가 발생했습니다"}
          </div>
        </CardContent>
      </Card>
    );
  }

  const articles = data?.articles || [];

  const handleView = (articleId: string) => {
    // TODO: Implement article view page
    router.push(`/articles/${articleId}`);
  };

  const handleEdit = (articleId: string) => {
    router.push(`/articles/${articleId}/edit`);
  };

  if (articles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.recent.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            {t("dashboard.recent.empty") || "아직 작성한 글이 없습니다"}
          </div>
        </CardContent>
      </Card>
    );
  }

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
            {articles.map((article) => (
              <TableRow key={article.id}>
                <TableCell>
                  <Badge
                    variant={
                      article.status === "published" ? "default" : "secondary"
                    }
                  >
                    {article.status === "published" ? t("dashboard.status.done") : t("dashboard.status.draft")}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{article.title}</TableCell>
                <TableCell>
                  {format(new Date(article.createdAt), "yyyy-MM-dd", { locale: ko })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleView(article.id)}
                      title={t("dashboard.recent.actions.view") || "보기"}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(article.id)}
                      title={t("dashboard.recent.actions.edit") || "수정"}
                    >
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
