"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Info,
} from "lucide-react";
import type { ArticleFormData } from "../lib/article-form-schema";

interface SeoCheckItem {
  label: string;
  status: "pass" | "warning" | "fail" | "info";
  message: string;
}

interface SeoPanelProps {
  formData: ArticleFormData;
}

export function SeoPanel({ formData }: SeoPanelProps) {
  const checks: SeoCheckItem[] = [
    // Title checks
    {
      label: "제목 길이",
      status: formData.title
        ? formData.title.length >= 30 && formData.title.length <= 60
          ? "pass"
          : formData.title.length > 60
            ? "warning"
            : "info"
        : "info",
      message: formData.title
        ? `${formData.title.length}자 (권장: 30-60자)`
        : "제목을 입력하세요",
    },
    // Meta title
    {
      label: "Meta 제목",
      status: formData.metaTitle
        ? formData.metaTitle.length <= 60
          ? "pass"
          : "warning"
        : "info",
      message: formData.metaTitle
        ? `${formData.metaTitle.length}자 (최대: 60자)`
        : "Meta 제목을 입력하면 검색 결과에 표시됩니다",
    },
    // Meta description
    {
      label: "Meta 설명",
      status: formData.metaDescription
        ? formData.metaDescription.length >= 120 &&
          formData.metaDescription.length <= 160
          ? "pass"
          : formData.metaDescription.length > 160
            ? "warning"
            : "info"
        : "info",
      message: formData.metaDescription
        ? `${formData.metaDescription.length}자 (권장: 120-160자)`
        : "Meta 설명을 입력하면 검색 결과에 표시됩니다",
    },
    // Slug
    {
      label: "URL 슬러그",
      status: formData.slug
        ? /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug)
          ? "pass"
          : "fail"
        : "info",
      message: formData.slug
        ? /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug)
          ? "올바른 형식입니다"
          : "소문자, 숫자, 하이픈만 사용 가능합니다"
        : "URL 슬러그를 입력하세요",
    },
    // Keywords
    {
      label: "키워드",
      status:
        formData.keywords && formData.keywords.length > 0
          ? formData.keywords.length >= 3 && formData.keywords.length <= 10
            ? "pass"
            : "warning"
          : "info",
      message:
        formData.keywords && formData.keywords.length > 0
          ? `${formData.keywords.length}개 키워드 (권장: 3-10개)`
          : "키워드를 3-10개 추가하세요",
    },
    // Content length
    {
      label: "본문 길이",
      status: formData.content
        ? formData.content.length >= 300
          ? "pass"
          : "info"
        : "info",
      message: formData.content
        ? `${formData.content.length}자 (최소 권장: 300자)`
        : "본문을 입력하세요",
    },
  ];

  const passCount = checks.filter((c) => c.status === "pass").length;
  const totalCount = checks.length;
  const score = Math.round((passCount / totalCount) * 100);

  const getStatusIcon = (status: SeoCheckItem["status"]) => {
    switch (status) {
      case "pass":
        return <CheckCircle2 className="h-4 w-4" style={{ color: "#10B981" }} />;
      case "warning":
        return <AlertCircle className="h-4 w-4" style={{ color: "#F59E0B" }} />;
      case "fail":
        return <XCircle className="h-4 w-4" style={{ color: "#DC2626" }} />;
      case "info":
        return <Info className="h-4 w-4" style={{ color: "#6B7280" }} />;
    }
  };

  const getStatusColor = (status: SeoCheckItem["status"]) => {
    switch (status) {
      case "pass":
        return "#10B981";
      case "warning":
        return "#F59E0B";
      case "fail":
        return "#DC2626";
      case "info":
        return "#6B7280";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#10B981";
    if (score >= 50) return "#F59E0B";
    return "#DC2626";
  };

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
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Search className="h-5 w-5" style={{ color: "#3BA2F8" }} />
            SEO 점검
          </h3>
          <Badge
            variant="secondary"
            className="text-base font-bold"
            style={{
              backgroundColor: getScoreColor(score) + "20",
              color: getScoreColor(score),
            }}
          >
            {score}점
          </Badge>
        </div>
        <p className="mt-1 text-xs" style={{ color: "#6B7280" }}>
          {passCount}/{totalCount} 항목 통과
        </p>
      </div>

      <div className="divide-y" style={{ borderColor: "#E1E5EA" }}>
        {checks.map((check, index) => (
          <div key={index} className="px-6 py-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{getStatusIcon(check.status)}</div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4
                    className="text-sm font-medium"
                    style={{ color: "#374151" }}
                  >
                    {check.label}
                  </h4>
                </div>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: getStatusColor(check.status) }}
                >
                  {check.message}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        className="border-t px-6 py-4"
        style={{ borderColor: "#E1E5EA", backgroundColor: "#F9FAFB" }}
      >
        <div className="space-y-2">
          <h4
            className="text-xs font-semibold uppercase"
            style={{ color: "#6B7280" }}
          >
            SEO 개선 팁
          </h4>
          <ul
            className="space-y-1.5 text-xs leading-relaxed"
            style={{ color: "#6B7280" }}
          >
            <li>• 제목은 주요 키워드를 포함하고 30-60자로 작성</li>
            <li>• Meta 설명은 클릭을 유도하는 내용으로 120-160자</li>
            <li>• URL은 짧고 의미있는 키워드로 구성</li>
            <li>• 키워드는 자연스럽게 본문에 포함</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
