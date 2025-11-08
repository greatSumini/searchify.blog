"use client";

import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";
import type { ArticleFormData } from "../lib/article-form-schema";

interface ArticlePreviewProps {
  formData: ArticleFormData;
}

export function ArticlePreview({ formData }: ArticlePreviewProps) {
  const hasContent = formData.title || formData.content;

  return (
    <Card
      className="sticky top-4 h-fit overflow-hidden"
      style={{
        borderColor: "#E1E5EA",
        borderRadius: "12px",
      }}
    >
      <div
        className="border-b px-6 py-4"
        style={{ borderColor: "#E1E5EA", backgroundColor: "#F9FAFB" }}
      >
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <FileText className="h-5 w-5" style={{ color: "#3BA2F8" }} />
          미리보기
        </h3>
      </div>

      <div className="p-6">
        {!hasContent ? (
          <div
            className="flex min-h-[400px] items-center justify-center text-center"
            style={{ color: "#9CA3AF" }}
          >
            <div>
              <FileText className="mx-auto mb-3 h-12 w-12" />
              <p className="text-sm">
                글을 작성하면
                <br />
                미리보기가 표시됩니다
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Title */}
            {formData.title && (
              <div>
                <h1
                  className="text-3xl font-bold leading-tight"
                  style={{ color: "#1F2937" }}
                >
                  {formData.title}
                </h1>
              </div>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap gap-2">
              {formData.tone && (
                <span
                  className="rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    backgroundColor: "#EFF6FF",
                    color: "#3B82F6",
                  }}
                >
                  {formData.tone}
                </span>
              )}
              {formData.contentLength && (
                <span
                  className="rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    backgroundColor: "#F0FDF4",
                    color: "#10B981",
                  }}
                >
                  {formData.contentLength}
                </span>
              )}
              {formData.readingLevel && (
                <span
                  className="rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    backgroundColor: "#FEF3C7",
                    color: "#F59E0B",
                  }}
                >
                  {formData.readingLevel}
                </span>
              )}
            </div>

            {/* Keywords */}
            {formData.keywords && formData.keywords.length > 0 && (
              <div>
                <h4
                  className="mb-2 text-xs font-semibold uppercase"
                  style={{ color: "#6B7280" }}
                >
                  키워드
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {formData.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded px-2 py-0.5 text-xs"
                      style={{
                        backgroundColor: "#F3F4F6",
                        color: "#4B5563",
                      }}
                    >
                      #{keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {formData.description && (
              <div>
                <p
                  className="text-base leading-relaxed"
                  style={{ color: "#6B7280" }}
                >
                  {formData.description}
                </p>
              </div>
            )}

            {/* Content Preview */}
            {formData.content && (
              <div
                className="border-t pt-6"
                style={{ borderColor: "#E1E5EA" }}
              >
                <h4
                  className="mb-3 text-xs font-semibold uppercase"
                  style={{ color: "#6B7280" }}
                >
                  본문
                </h4>
                <div
                  className="prose prose-sm max-w-none"
                  style={{ color: "#374151" }}
                >
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {formData.content}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
