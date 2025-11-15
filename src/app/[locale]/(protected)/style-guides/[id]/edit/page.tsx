"use client";

import { use } from "react";
import { useRouter } from '@/i18n/navigation';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { OnboardingWizard } from "@/features/onboarding/components/onboarding-wizard";
import type { OnboardingFormData } from "@/features/onboarding/lib/onboarding-schema";
import {
  useStyleGuide,
  useUpdateStyleGuide,
} from "@/features/articles/hooks/useStyleGuideQuery";
import { useTranslations } from 'next-intl';
import { PageLayout } from "@/components/layout/page-layout";

type EditStyleGuidePageProps = {
  params: Promise<{ id: string }>;
};

export default function EditStyleGuidePage({ params }: EditStyleGuidePageProps) {
  const resolvedParams = use(params);
  const guideId = resolvedParams.id;
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations();

  const { data: guide, isLoading, isError } = useStyleGuide(guideId);
  const updateStyleGuide = useUpdateStyleGuide();

  const handleComplete = async (data: OnboardingFormData) => {
    try {
      await updateStyleGuide.mutateAsync({ guideId, data });
      toast({
        title: t("common.success"),
        description: t("styleGuide.update.success.desc"),
      });
      router.push("/style-guide");
    } catch (error) {
      toast({
        title: t("common.error"),
        description:
          error instanceof Error
            ? error.message
            : t("styleGuide.update.error.desc"),
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <PageLayout
        title={t("styleGuide.edit.title")}
        description={t("styleGuide.edit.hint")}
        maxWidthClassName="max-w-4xl"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">{t("styleGuide.loading")}</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (isError || !guide) {
    return (
      <PageLayout
        title={t("styleGuide.edit.title")}
        description={t("styleGuide.edit.hint")}
        maxWidthClassName="max-w-4xl"
      >
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-red-500">{t("styleGuide.error.load")}</p>
          <Button onClick={() => router.back()}>{t("common.back")}</Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={t("styleGuide.edit.title")}
      description={t("styleGuide.edit.hint")}
      maxWidthClassName="max-w-4xl"
      actions={
        <div className="flex gap-2">
          <Button onClick={() => router.push("/style-guides/new")}>
            {t("styleGuide.create_new")}
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            {t("styleGuide.cancel")}
          </Button>
        </div>
      }
    >
      <div className="mb-4">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("common.back")}
        </Button>
      </div>
      {/* TODO: 스타일 가이드 편집 폼/위저드 추가 예정 */}
    </PageLayout>
  );
}
