"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
      <div className="w-full max-w-3xl space-y-8 px-4">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            3분만에 완성하는 고품질 컨텐츠
          </h1>
          <p className="text-lg text-gray-600">
            SEO 최적화된, 사람이 쓴 것 같은 컨텐츠를 생성해보세요
          </p>
        </div>

        {/* Main Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Textarea with Style Guide Selector */}
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Textarea
                        {...field}
                        placeholder="작성할 컨텐츠를 설명해주세요"
                        disabled={isSubmitting || isLoading}
                        rows={4}
                        className="resize-none rounded-2xl border-gray-200 px-6 py-5 text-base shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                      {/* Style Guide Selector - Absolute positioned inside textarea */}
                      <div className="absolute bottom-3 left-4">
                        <FormField
                          control={form.control}
                          name="styleGuideId"
                          render={({ field: selectField }) => (
                            <FormItem>
                              <Select
                                onValueChange={selectField.onChange}
                                defaultValue={selectField.value}
                                disabled={isSubmitting || isLoading}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-8 w-[180px] rounded-lg border-gray-300 bg-white/90 backdrop-blur-sm text-sm shadow-sm hover:bg-white">
                                    <SelectValue placeholder="스타일 가이드" />
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
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      {/* Submit Button - Absolute positioned bottom right */}
                      <div className="absolute bottom-3 right-4">
                        <Button
                          type="submit"
                          disabled={
                            isSubmitting || isLoading || !form.formState.isValid
                          }
                          className="h-8 rounded-lg bg-blue-500 px-5 text-sm font-medium shadow-sm hover:bg-blue-600 transition-colors"
                        >
                          <Sparkles className="mr-2 h-4 w-4" />
                          {isSubmitting ? "생성 중..." : "생성하기"}
                        </Button>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    </div>
  );
}
