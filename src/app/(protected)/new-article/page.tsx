"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { GenerationForm } from "@/features/articles/components/generation-form";
import { GenerationProgress } from "@/features/articles/components/generation-progress";
import { useStyleGuide } from "@/features/articles/hooks/useStyleGuide";
import { useState } from "react";
import type { GenerationFormData } from "@/features/articles/components/generation-form";
import { useI18n } from "@/lib/i18n/client";

type NewArticlePageProps = {
  params: Promise<Record<string, never>>;
};

export default function NewArticlePage({ params }: NewArticlePageProps) {
  void params;
  const t = useI18n();

  const router = useRouter();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: styleGuideData, isLoading: isLoadingStyleGuide } =
    useStyleGuide();

  const styleGuides = styleGuideData
    ? [
        {
          id: styleGuideData.id,
          name: t("newArticle.default_style_guide"),
        },
      ]
    : [];

  const handleBack = () => {
    router.back();
  };

  const handleGenerateSubmit = async (data: GenerationFormData) => {
    setIsGenerating(true);

    try {
      const keywords = data.keywords || [];

      const response = await fetch("/api/articles/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: data.topic,
          styleGuideId: data.styleGuideId,
          keywords,
          additionalInstructions: undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || t("newArticle.toast.error.desc")
        );
      }

      const result = await response.json();
      const articleId = result?.data?.article?.id;

      if (!articleId) {
        throw new Error("글 생성에 성공했지만 ID를 받지 못했습니다");
      }

      toast({
        title: t("newArticle.toast.success.title"),
        description: t("newArticle.toast.success.desc", {
          title: result?.data?.article?.title || "새 글",
        }),
      });

      // Redirect to edit page
      router.push(`/articles/${articleId}/edit`);
    } catch (error) {
      console.error("Failed to generate article:", error);
      toast({
        title: "생성 실패",
        description:
          error instanceof Error
            ? error.message
            : t("newArticle.toast.error.desc"),
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  };


  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FCFCFD" }}>
      <div className="container mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-4 -ml-2"
            style={{ color: "#6B7280" }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("newArticle.back")}
          </Button>
        </div>

        {/* Main Card */}
        <Card
          className="p-8"
          style={{
            borderColor: "#E1E5EA",
            borderRadius: "12px",
          }}
        >
          {isGenerating ? (
            <GenerationProgress
              isGenerating={true}
              error={null}
              onCancel={() => {
                setIsGenerating(false);
              }}
              onRetry={() => {
                setIsGenerating(false);
              }}
            />
          ) : (
            <GenerationForm
              styleGuides={styleGuides}
              onSubmit={handleGenerateSubmit}
              isLoading={isLoadingStyleGuide}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
