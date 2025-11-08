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

  // Refetch on page focus to ensure fresh data
  useEffect(() => {
    const handleFocus = () => {
      queryClient.invalidateQueries({ queryKey: ["userStyleGuide"] });
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [queryClient]);

  // Fetch user's style guide
  const { data: guide, isLoading, isError, refetch } = useQuery<StyleGuideResponse | null>({
    queryKey: ["userStyleGuide"],
    queryFn: getUserStyleGuide,
    retry: false,
    gcTime: 0, // Disable cache
  });

  const handlePreview = (guide: StyleGuideResponse) => {
    setPreviewGuide(guide);
    setIsPreviewOpen(true);
  };

  const handleEdit = (guide: StyleGuideResponse) => {
    router.push(`/style-guides/${guide.id}/edit`);
  };

  const handleDelete = async (id: string) => {
    // Show confirmation dialog
    if (!window.confirm(t("styleGuide.delete.confirm"))) {
      return;
    }

    try {
      await deleteStyleGuideAction(id);
      toast({
        title: t("styleGuide.delete.success.title"),
        description: t("styleGuide.delete.success.desc"),
      });
      // Clear cache and refetch
      await queryClient.invalidateQueries({ queryKey: ["userStyleGuide"] });
      await refetch();
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

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#FCFCFD" }}>
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">{t("styleGuide.loading")}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#FCFCFD" }}>
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <p className="text-red-500">{t("styleGuide.error.load")}</p>
            <Button onClick={() => router.refresh()}>{t("styleGuide.retry")}</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FCFCFD" }}>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "#1F2937" }}>{t("styleGuide.title")}</h1>
            <p className="mt-2 text-muted-foreground">{t("styleGuide.subtitle")}</p>
          </div>
          <Button onClick={handleCreateNew} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            {t("styleGuide.create_new")}
          </Button>
        </div>

        {/* 가이드 목록 */}
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
      </div>

      {/* 미리보기 모달 */}
      <StyleGuidePreviewModal
        guide={previewGuide}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
}
