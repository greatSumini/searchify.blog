"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateKeyword } from "@/features/keywords/hooks/useKeywordQuery";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

const formSchema = z.object({
  phrase: z
    .string()
    .min(1, "키워드를 입력해주세요")
    .max(100, "키워드는 100자 이내여야 합니다"),
});

type FormValues = z.infer<typeof formSchema>;

interface KeywordCreateDialogProps {
  children?: React.ReactNode;
}

export function KeywordCreateDialog({ children }: KeywordCreateDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createMutation = useCreateKeyword();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phrase: "",
    },
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      await createMutation.mutateAsync(values.phrase);
      toast({
        title: "키워드 생성 완료",
        description: `"${values.phrase}" 키워드가 생성되었습니다.`,
      });
      form.reset();
      setOpen(false);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.message ||
        "키워드 생성에 실패했습니다";
      toast({
        title: "생성 실패",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            새 키워드
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>새 키워드 추가</DialogTitle>
          <DialogDescription>
            저장하고 싶은 키워드를 입력해주세요.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="phrase"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>키워드</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="키워드를 입력하세요"
                      disabled={createMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createMutation.isPending}
              >
                취소
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "저장 중..." : "저장"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
