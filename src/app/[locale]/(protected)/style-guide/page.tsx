"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StyleGuideCard } from "@/features/onboarding/components/style-guide-card";
import { StyleGuidePreviewModal } from "@/features/onboarding/components/style-guide-preview-modal";
import type { StyleGuideResponse } from "@/features/onboarding/backend/schema";
import { getUserStyleGuide, deleteStyleGuideAction } from "@/features/articles/actions/article-actions";
import { useI18n } from "@/lib/i18n/client";
import { PageLayout } from "@/components/layout/page-layout";

type StyleGuidePageProps = {
  params: Promise<Record<string, never>>;
};

export default function StyleGuidePage({ params }: StyleGuidePageProps) {
  void params;
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const t = useI18n();

  const [previewGuide, setPreviewGuide] = useState<StyleGuideResponse | null>(
    null
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    const handleFocus = () => {
      queryClient.invalidateQueries({ queryKey: ["userStyleGuide"] });
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [queryClient]);

  const { data: guide, isLoading, isError, refetch } = useQuery<StyleGuideResponse | null>({
    queryKey: ["userStyleGuide"],
    queryFn: getUserStyleGuide,
    retry: false,
    gcTime: 0,
  });

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
      await deleteStyleGuideAction(id);
      toast({ title: t("common.success"), description: t("styleGuide.delete.success.desc") });
      await queryClient.invalidateQueries({ queryKey: ["userStyleGuide"] });
      await refetch();
    } catch (error) {
      toast({
        title: t("styleGuide.delete.error.title"),
        description: error instanceof Error ? error.message : t("styleGuide.delete.error.desc"),
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
        maxWidthClassName="max-w-4xl"
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
      <PageLayout
        title={title}
        description={description}
        actions={actions}
        maxWidthClassName="max-w-4xl"
      >
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-red-500">{t("styleGuide.error.load")}</p>
          <Button onClick={() => router.refresh()}>{t("styleGuide.retry")}</Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={title}
      description={description}
      actions={actions}
      maxWidthClassName="max-w-4xl"
    >
      {guide ? (
        <div className="space-y-4">
          <StyleGuideCard
            guide={guide}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPreview={handlePreview}
          />
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
