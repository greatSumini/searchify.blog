"use client";

import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { useState } from "react";
import type { ArticleFormData } from "../lib/article-form-schema";
import { generateSlug } from "../lib/article-form-schema";

interface ArticleFormProps {
  form: UseFormReturn<ArticleFormData>;
  styleGuides?: Array<{ id: string; name: string }>;
  isLoading?: boolean;
}

export function ArticleForm({ form, styleGuides, isLoading }: ArticleFormProps) {
  const [keywordInput, setKeywordInput] = useState("");

  const handleAddKeyword = () => {
    const trimmed = keywordInput.trim();
    if (!trimmed) return;

    const currentKeywords = form.getValues("keywords") || [];
    if (!currentKeywords.includes(trimmed)) {
      form.setValue("keywords", [...currentKeywords, trimmed]);
    }
    setKeywordInput("");
  };

  const handleRemoveKeyword = (keyword: string) => {
    const currentKeywords = form.getValues("keywords") || [];
    form.setValue(
      "keywords",
      currentKeywords.filter((k) => k !== keyword)
    );
  };

  const handleTitleChange = (value: string) => {
    form.setValue("title", value);

    // Auto-generate slug if it's empty or was auto-generated
    const currentSlug = form.getValues("slug");
    if (!currentSlug || currentSlug === generateSlug(form.getValues("title"))) {
      const newSlug = generateSlug(value);
      form.setValue("slug", newSlug);
    }
  };

  const keywords = form.watch("keywords") || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: "#1F2937" }}>
          글 작성
        </h2>
        <p className="mt-1 text-sm" style={{ color: "#6B7280" }}>
          새로운 블로그 글을 작성해주세요
        </p>
      </div>

      {/* Title */}
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">
              제목 <span style={{ color: "#DC2626" }}>*</span>
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="글의 제목을 입력하세요"
                disabled={isLoading}
                className="h-12 text-base"
                style={{
                  borderColor: "#E1E5EA",
                  borderRadius: "8px",
                }}
              />
            </FormControl>
            <FormDescription>
              명확하고 간결한 제목을 입력해주세요
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Slug */}
      <FormField
        control={form.control}
        name="slug"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">
              URL 슬러그 <span style={{ color: "#DC2626" }}>*</span>
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="url-slug-example"
                disabled={isLoading}
                className="h-12 font-mono text-sm"
                style={{
                  borderColor: "#E1E5EA",
                  borderRadius: "8px",
                }}
              />
            </FormControl>
            <FormDescription>
              소문자, 숫자, 하이픈(-)만 사용 가능합니다
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Keywords */}
      <FormField
        control={form.control}
        name="keywords"
        render={() => (
          <FormItem>
            <FormLabel className="text-base font-semibold">키워드</FormLabel>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddKeyword();
                    }
                  }}
                  placeholder="키워드 입력 후 Enter"
                  disabled={isLoading}
                  className="h-10"
                  style={{
                    borderColor: "#E1E5EA",
                    borderRadius: "8px",
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAddKeyword}
                  disabled={isLoading}
                  className="h-10 w-10"
                  style={{
                    borderColor: "#E1E5EA",
                    borderRadius: "8px",
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword) => (
                    <Badge
                      key={keyword}
                      variant="secondary"
                      className="px-3 py-1.5 text-sm"
                      style={{
                        backgroundColor: "#F3F4F6",
                        color: "#374151",
                      }}
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(keyword)}
                        className="ml-2 hover:opacity-70"
                        disabled={isLoading}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <FormDescription>
              글의 주요 키워드를 입력해주세요
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Description */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">
              요약 설명
            </FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="글의 요약 설명을 입력하세요"
                disabled={isLoading}
                rows={3}
                className="resize-none"
                style={{
                  borderColor: "#E1E5EA",
                  borderRadius: "8px",
                }}
              />
            </FormControl>
            <FormDescription>
              최대 500자까지 입력 가능합니다
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Content */}
      <FormField
        control={form.control}
        name="content"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">
              본문 <span style={{ color: "#DC2626" }}>*</span>
            </FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="글의 본문을 입력하세요 (Markdown 지원)"
                disabled={isLoading}
                rows={12}
                className="resize-none font-mono text-sm"
                style={{
                  borderColor: "#E1E5EA",
                  borderRadius: "8px",
                }}
              />
            </FormControl>
            <FormDescription>
              Markdown 문법을 사용할 수 있습니다
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Style Guide */}
      {styleGuides && styleGuides.length > 0 && (
        <FormField
          control={form.control}
          name="styleGuideId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">
                스타일 가이드
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger
                    className="h-12"
                    style={{
                      borderColor: "#E1E5EA",
                      borderRadius: "8px",
                    }}
                  >
                    <SelectValue placeholder="스타일 가이드 선택 (선택사항)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {styleGuides.map((guide) => (
                    <SelectItem key={guide.id} value={guide.id}>
                      {guide.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                글 작성 시 참고할 스타일 가이드를 선택하세요
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Tone */}
      <FormField
        control={form.control}
        name="tone"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">톤</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value}
              disabled={isLoading}
            >
              <FormControl>
                <SelectTrigger
                  className="h-12"
                  style={{
                    borderColor: "#E1E5EA",
                    borderRadius: "8px",
                  }}
                >
                  <SelectValue placeholder="글의 톤을 선택하세요" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="professional">Professional (전문적)</SelectItem>
                <SelectItem value="friendly">Friendly (친근함)</SelectItem>
                <SelectItem value="inspirational">Inspirational (영감적)</SelectItem>
                <SelectItem value="educational">Educational (교육적)</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              글의 분위기와 스타일을 선택하세요
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Content Length */}
        <FormField
          control={form.control}
          name="contentLength"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">
                글 길이
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger
                    className="h-12"
                    style={{
                      borderColor: "#E1E5EA",
                      borderRadius: "8px",
                    }}
                  >
                    <SelectValue placeholder="선택" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="short">짧음 (Short)</SelectItem>
                  <SelectItem value="medium">중간 (Medium)</SelectItem>
                  <SelectItem value="long">김 (Long)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Reading Level */}
        <FormField
          control={form.control}
          name="readingLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">
                난이도
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger
                    className="h-12"
                    style={{
                      borderColor: "#E1E5EA",
                      borderRadius: "8px",
                    }}
                  >
                    <SelectValue placeholder="선택" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="beginner">초급 (Beginner)</SelectItem>
                  <SelectItem value="intermediate">중급 (Intermediate)</SelectItem>
                  <SelectItem value="advanced">고급 (Advanced)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
