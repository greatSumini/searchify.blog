"use client";

import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { OnboardingWizard } from "@/features/onboarding/components/onboarding-wizard";
import { createStyleGuide } from "@/features/onboarding/actions/create-style-guide";
import type { OnboardingFormData } from "@/features/onboarding/lib/onboarding-schema";
import { useI18n } from "@/lib/i18n/client";

type NewStyleGuidePageProps = {
  params: Promise<Record<string, never>>;
};

export default function NewStyleGuidePage({
  params,
}: NewStyleGuidePageProps) {
  void params;
  const router = useRouter();
  const { toast } = useToast();
  const t = useI18n();

  const handleComplete = async (data: OnboardingFormData) => {
    try {
      const result = await createStyleGuide(data);

      toast({
        title: t("common.success"),
        description: t("styleGuide.update.success.desc").replace("업데이트", "생성"),
      });

      // Redirect to style guides page
      router.push("/style-guides");
    } catch (error) {
      console.error("Failed to create style guide:", error);
      toast({
        title: t("common.error"),
        description:
          error instanceof Error
            ? error.message
            : t("styleGuide.update.error.desc").replace("업데이트", "생성"),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FCFCFD" }}>
      {/* 뒤로 버튼 */}
      <div className="container mx-auto max-w-4xl px-4 py-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("common.back")}
        </Button>
      </div>

      {/* 마법사 */}
      <OnboardingWizard onComplete={handleComplete} />
    </div>
  );
}
