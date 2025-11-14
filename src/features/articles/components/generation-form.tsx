"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { KeywordPicker } from "@/features/keywords/components/KeywordPicker";
import { SuggestionsDialog } from "@/features/keywords/components/SuggestionsDialog";
import { Sparkles } from "lucide-react";

const GenerationFormSchema = z.object({
  topic: z
    .string()
    .min(2, "주제는 2자 이상이어야 합니다")
    .max(200, "주제는 200자 이내여야 합니다"),
  styleGuideId: z.string().uuid("유효한 스타일 가이드를 선택해주세요"),
  keywords: z.array(z.string()).optional(),
  additionalInstructions: z
    .string()
    .max(1000, "추가 요구사항은 1000자 이내여야 합니다")
    .optional(),
});

export type GenerationFormData = z.infer<typeof GenerationFormSchema>;

interface GenerationFormProps {
  styleGuides: Array<{ id: string; name: string }>;
  onSubmit: (data: GenerationFormData) => Promise<void>;
  isLoading?: boolean;
}

export function GenerationForm({
  styleGuides,
  onSubmit,
  isLoading,
}: GenerationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<GenerationFormData>({
    resolver: zodResolver(GenerationFormSchema),
    defaultValues: {
      topic: "",
      styleGuideId: styleGuides[0]?.id || "",
      keywords: [],
      additionalInstructions: "",
    },
  });

  const handleSubmit = async (data: GenerationFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold" style={{ color: "#1F2937" }}>
              AI로 글쓰기
            </h2>
            <p className="mt-2 text-base" style={{ color: "#6B7280" }}>
              주제를 입력하고 스타일 가이드를 선택하면 AI가 자동으로 글을 생성해줍니다
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-10">
                시스템 프롬프트
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>기본 시스템 프롬프트</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <p>
                  아래 원칙에 따라 블로그 글을 생성합니다. 사용자의
                  <strong> 추가 요구사항</strong>은 모든 규칙보다
                  <strong> 가장 높은 우선순위</strong>로 적용됩니다.
                </p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>SEO에 최적화된 제목 작성</li>
                  <li>본문은 Markdown 형식 (제목/소제목/목록/강조)</li>
                  <li>서론-본론-결론의 자연스러운 구조</li>
                  <li>실용적이고 실행 가능한 정보 제공</li>
                  <li>독자의 고민 해결에 집중</li>
                  <li>메타 설명은 160자 이내</li>
                  <li>주요 키워드를 자연스럽게 본문에 포함</li>
                  <li>소제목은 명확하고 구조적으로 구성</li>
                </ol>
                <p className="text-muted-foreground">
                  선택한 스타일 가이드(톤/길이/난이도/언어)와 키워드를 반영해 작성합니다.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Topic Input */}
        <FormField
          control={form.control}
          name="topic"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">
                글의 주제 <span style={{ color: "#DC2626" }}>*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="예: Next.js에서 Server Actions 사용하기"
                  disabled={isSubmitting || isLoading}
                  className="h-12 text-base"
                  style={{
                    borderColor: "#E1E5EA",
                    borderRadius: "8px",
                  }}
                />
              </FormControl>
              <FormDescription>
                작성하고 싶은 글의 주제나 키워드를 입력해주세요
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Style Guide Selection */}
        <FormField
          control={form.control}
          name="styleGuideId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">
                스타일 가이드 <span style={{ color: "#DC2626" }}>*</span>
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isSubmitting || isLoading}
              >
                <FormControl>
                  <SelectTrigger
                    className="h-12 text-base"
                    style={{
                      borderColor: "#E1E5EA",
                      borderRadius: "8px",
                    }}
                  >
                    <SelectValue placeholder="스타일 가이드를 선택하세요" />
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
                글의 톤, 길이, 난이도를 결정하는 기본 설정입니다
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Keywords (Optional) */}
        <FormField
          control={form.control}
          name="keywords"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">
                키워드 (선택사항)
              </FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <KeywordPicker
                    value={field.value || []}
                    onChange={field.onChange}
                    placeholder="저장된 키워드에서 선택..."
                    disabled={isSubmitting || isLoading}
                  />
                  <div className="flex justify-end">
                    <SuggestionsDialog
                      onKeywordsAdded={(added) => {
                        const current = field.value || [];
                        const merged = Array.from(new Set([...current, ...added]));
                        field.onChange(merged);
                      }}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isSubmitting || isLoading}
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        연관 검색어 찾기
                      </Button>
                    </SuggestionsDialog>
                  </div>
                </div>
              </FormControl>
              <FormDescription>
                키워드 관리에서 저장한 키워드(연관 검색어 포함)를 검색해 선택할 수 있어요
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Additional Instructions */}
        <FormField
          control={form.control}
          name="additionalInstructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">
                추가 요구사항 (선택사항)
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="예: 이 섹션은 반드시 포함하고, 예시는 한국 스타트업 사례로 작성해줘. 금지어는 사용하지 마."
                  disabled={isSubmitting || isLoading}
                  className="min-h-28"
                />
              </FormControl>
              <FormDescription>
                입력한 내용은 시스템 프롬프트에 전달되며, 모든 규칙보다
                가장 높은 우선순위로 고려됩니다.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={isSubmitting || isLoading || !form.formState.isValid}
            className="h-12 px-8"
            style={{
              backgroundColor: "#3BA2F8",
              borderRadius: "8px",
            }}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {isSubmitting ? "생성 중..." : "AI로 글 생성하기"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
