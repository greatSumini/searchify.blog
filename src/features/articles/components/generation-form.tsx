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
import { KeywordPicker } from "@/features/keywords/components/KeywordPicker";
import { Sparkles } from "lucide-react";

const GenerationFormSchema = z.object({
  topic: z
    .string()
    .min(2, "주제는 2자 이상이어야 합니다")
    .max(200, "주제는 200자 이내여야 합니다"),
  styleGuideId: z.string().uuid("유효한 스타일 가이드를 선택해주세요"),
  keywords: z.array(z.string()).optional(),
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
        <div>
          <h2 className="text-3xl font-bold" style={{ color: "#1F2937" }}>
            AI로 글쓰기
          </h2>
          <p className="mt-2 text-base" style={{ color: "#6B7280" }}>
            주제를 입력하고 스타일 가이드를 선택하면 AI가 자동으로 글을 생성해줍니다
          </p>
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
                <KeywordPicker
                  value={field.value || []}
                  onChange={field.onChange}
                  placeholder="저장된 키워드에서 선택..."
                  disabled={isSubmitting || isLoading}
                />
              </FormControl>
              <FormDescription>
                저장된 키워드 중에서 선택하거나 검색하여 추가하세요
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
