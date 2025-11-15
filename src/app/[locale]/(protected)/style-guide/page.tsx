"use client";

import { useState, useEffect } from "react";
import { useRouter } from '@/i18n/navigation';
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Eye, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StyleGuidePreviewModal } from "@/features/onboarding/components/style-guide-preview-modal";
import type { StyleGuideResponse } from "@/features/onboarding/backend/schema";
import {
  useListStyleGuides,
  useDeleteStyleGuide,
} from "@/features/articles/hooks/useStyleGuideQuery";
import { useTranslations } from 'next-intl';
import { PageLayout } from "@/components/layout/page-layout";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

type StyleGuidePageProps = {
  params: Promise<Record<string, never>>;
};

export default function StyleGuidePage({ params }: StyleGuidePageProps) {
  void params;
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const t = useTranslations();

  const [previewGuide, setPreviewGuide] = useState<StyleGuideResponse | null>(
    null
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    const handleFocus = () => {
      queryClient.invalidateQueries({ queryKey: ["styleGuides"] });
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [queryClient]);

  const {
    data: guides = [],
    isLoading,
    isError,
  } = useListStyleGuides();

  const deleteStyleGuide = useDeleteStyleGuide();

  const handlePreview = (guide: StyleGuideResponse) => {
    setPreviewGuide(guide);
    setIsPreviewOpen(true);
  };

  const handleEdit = (guide: StyleGuideResponse) => {
    router.push(`/style-guides/${guide.id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t("styleGuide.delete.confirm"))) return;
    try {
      await deleteStyleGuide.mutateAsync(id);
      toast({
        title: t("common.success"),
        description: t("styleGuide.delete.success.desc"),
      });
    } catch (error) {
      toast({
        title: t("styleGuide.delete.error.title"),
        description:
          error instanceof Error
            ? error.message
            : t("styleGuide.delete.error.desc"),
        variant: "destructive",
      });
    }
  };

  const handleCreateNew = () => {
    router.push("/style-guides/new");
  };

  const title = t("styleGuide.title");
  const description = t("styleGuide.subtitle");
  const actions = (
    <Button onClick={handleCreateNew} size="lg">
      <Plus className="mr-2 h-4 w-4" />
      {t("styleGuide.create_new")}
    </Button>
  );

  if (isLoading) {
    return (
      <PageLayout
        title={title}
        description={description}
        actions={actions}
        maxWidthClassName="max-w-6xl"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">{t("styleGuide.loading")}</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (isError) {
    return (
      <PageLayout title={title} description={description} actions={actions}>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-red-500">{t("styleGuide.error.load")}</p>
          <Button onClick={() => router.refresh()}>
            {t("styleGuide.retry")}
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={title}
      description={description}
      actions={actions}
      maxWidthClassName="max-w-6xl"
    >
      {guides.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>브랜드명</TableHead>
                <TableHead>타겟 오디언스</TableHead>
                <TableHead>톤앤매너</TableHead>
                <TableHead>언어</TableHead>
                <TableHead>생성일</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guides.map((guide) => (
                <TableRow key={guide.id}>
                  <TableCell className="font-medium">
                    {guide.brandName}
                  </TableCell>
                  <TableCell>{guide.targetAudience}</TableCell>
                  <TableCell>
                    {guide.personality.slice(0, 2).join(", ")}
                    {guide.personality.length > 2 && "..."}
                  </TableCell>
                  <TableCell>
                    {guide.language === "ko" ? "한국어" : "English"}
                  </TableCell>
                  <TableCell>
                    {format(new Date(guide.createdAt), "PPP", { locale: ko })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreview(guide)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(guide)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(guide.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div
          className="rounded-lg border border-dashed p-12 text-center"
          style={{ borderColor: "#E1E5EA" }}
        >
          <p className="mb-4 text-muted-foreground">{t("styleGuide.empty")}</p>
          <Button onClick={handleCreateNew}>{t("styleGuide.create")}</Button>
        </div>
      )}

      <StyleGuidePreviewModal
        guide={previewGuide}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </PageLayout>
  );
}
