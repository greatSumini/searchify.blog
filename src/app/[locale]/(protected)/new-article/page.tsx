"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { GenerationForm } from "@/features/articles/components/generation-form";
import { GenerationProgress } from "@/features/articles/components/generation-progress";
import { useStyleGuide } from "@/features/articles/hooks/useStyleGuide";
import type { GenerationFormData } from "@/features/articles/components/generation-form";
import { useI18n } from "@/lib/i18n/client";
import { useCompletion } from "@ai-sdk/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { parseGeneratedText, parseStreamingTextToJson, type ParsedAIArticle } from "@/features/articles/lib/ai-parse";
import { generateUniqueSlug } from "@/lib/slug";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageLayout } from "@/components/layout/page-layout";

type NewArticlePageProps = {
  params: Promise<Record<string, never>>;
};

export default function NewArticlePage({ params }: NewArticlePageProps) {
  void params;
  const t = useI18n();

  const router = useRouter();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [localError, setLocalError] = useState<Error | null>(null);
  const [mode, setMode] = useState<"form" | "generating" | "complete">("form");
  const [parsed, setParsed] = useState<ParsedAIArticle | null>(null);
  const [lastRequest, setLastRequest] = useState<{
    topic: string;
    styleGuideId?: string;
    keywords: string[];
  } | null>(null);

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
    setLocalError(null);
    setIsGenerating(true);
    setMode("generating");
    setParsed(null);
    setLastRequest({
      topic: data.topic,
      styleGuideId: data.styleGuideId,
      keywords: data.keywords || [],
    });

    try {
      await complete(data.topic, {
        body: {
          topic: data.topic,
          styleGuideId: data.styleGuideId,
          keywords: data.keywords || [],
          additionalInstructions: data.additionalInstructions || undefined,
        },
      });
    } catch (error) {
      console.error("Failed to generate article:", error);
      const message =
        error instanceof Error ? error.message : t("newArticle.toast.error.desc");
      setLocalError(new Error(message));
      toast({
        title: t("newArticle.toast.error.title"),
        description: message,
        variant: "destructive",
      });
      setIsGenerating(false);
      setMode("form");
    }
  };

  const { completion, complete, stop, isLoading } = useCompletion({
    api: "/api/articles/generate",
  });

  // 스트리밍이 끝나면 진행 UI 숨김
  useEffect(() => {
    if (!isLoading && isGenerating) {
      setIsGenerating(false);
      if (completion) {
        try {
          const p = parseGeneratedText(completion);
          setParsed(p);
          setMode("complete");
          toast({
            title: t("newArticle.toast.success.title"),
            description: t("newArticle.toast.success.desc", { title: p.title || "AI 생성 글" }),
          });
        } catch {
          setMode("complete");
        }
      } else {
        setMode("form");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const { user } = useCurrentUser();

  const handleSave = async () => {
    if (!parsed) return;
    if (!user?.id) {
      toast({ title: "로그인이 필요합니다", variant: "destructive" });
      return;
    }

    try {
      const payload = {
        title: parsed.title,
        slug: generateUniqueSlug(parsed.title),
        keywords: parsed.keywords ?? [],
        description: parsed.metaDescription ?? undefined,
        content: parsed.content,
        styleGuideId: lastRequest?.styleGuideId,
        metaTitle: parsed.title,
        metaDescription: parsed.metaDescription ?? undefined,
      };

      const res = await fetch("/api/articles/draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-clerk-user-id": user.id,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any));
        throw new Error(err?.error?.message || "글 저장에 실패했습니다");
      }

      const article = await res.json();
      toast({ title: "저장 완료", description: `"${article.title}" 초안이 저장되었습니다.` });
      router.push(`/articles/${article.id}/edit`);
    } catch (e) {
      const message = e instanceof Error ? e.message : "글 저장 중 오류가 발생했습니다";
      toast({ title: "저장 실패", description: message, variant: "destructive" });
    }
  };

  const generatingPreview = useMemo(() => completion, [completion]);
  const generatingParsed = useMemo(() => parseStreamingTextToJson(generatingPreview || ""), [generatingPreview]);

  return (
    <PageLayout
      title="새 글 생성"
      description="AI를 활용해 블로그 글 초안을 빠르게 만들어보세요."
      maxWidthClassName="max-w-2xl"
    >
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="-ml-2"
          style={{ color: "#6B7280" }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("newArticle.back")}
        </Button>
      </div>

      <Card
        className="p-8"
        style={{
          borderColor: "#E1E5EA",
          borderRadius: "12px",
        }}
      >
        {mode === "form" && (
          <GenerationForm
            styleGuides={styleGuides}
            onSubmit={handleGenerateSubmit}
            isLoading={isLoadingStyleGuide}
          />
        )}

        {mode === "generating" && (
          <div className="space-y-6">
            <div
              className="rounded-lg border p-4"
              style={{ borderColor: "#E1E5EA" }}
            >
              <p className="mb-3 text-sm" style={{ color: "#6B7280" }}>
                AI가 글을 작성하고 있습니다. 잠시만 기다려주세요.
              </p>
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-32">항목</TableHead>
                      <TableHead>값</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>제목</TableCell>
                      <TableCell>
                        {generatingParsed.title || "(분석 중...)"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>메타 설명</TableCell>
                      <TableCell>
                        {(generatingParsed.metaDescription || "").slice(
                          0,
                          160,
                        ) || "(분석 중...)"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>키워드</TableCell>
                      <TableCell>
                        {generatingParsed.keywords &&
                        generatingParsed.keywords.length > 0
                          ? generatingParsed.keywords
                              .slice(0, 10)
                              .join(", ")
                          : "(분석 중...)"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>소제목</TableCell>
                      <TableCell>
                        {generatingParsed.headings &&
                        generatingParsed.headings.length > 0
                          ? generatingParsed.headings
                              .slice(0, 5)
                              .join(" / ")
                          : "(분석 중...)"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>본문 미리보기</TableCell>
                      <TableCell>
                        <div className="whitespace-pre-wrap">
                          {(
                            generatingParsed.content ||
                            generatingPreview ||
                            ""
                          ).slice(0, 300)}
                          {((generatingParsed.content ||
                            generatingPreview ||
                            "").length ?? 0) > 300
                            ? "..."
                            : ""}
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}

        {mode === "complete" && parsed && (
          <div className="space-y-6">
            <div>
              <h2 className="mb-2 text-2xl font-bold">{parsed.title}</h2>
              {parsed.metaDescription && (
                <p className="text-sm" style={{ color: "#6B7280" }}>
                  {parsed.metaDescription}
                </p>
              )}
            </div>
            <div className="prose prose-neutral max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {parsed.content}
              </ReactMarkdown>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setMode("form");
                  setParsed(null);
                }}
                style={{ borderRadius: "8px" }}
              >
                다시하기
              </Button>
              <Button
                onClick={handleSave}
                className="px-6"
                style={{ backgroundColor: "#3BA2F8", borderRadius: "8px" }}
              >
                저장하기
              </Button>
            </div>
          </div>
        )}
      </Card>
    </PageLayout>
  );
}
