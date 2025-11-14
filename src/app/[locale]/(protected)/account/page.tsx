"use client";

import { useI18n } from "@/lib/i18n/client";
import { PageLayout } from "@/components/layout/page-layout";

type AccountPageProps = {
  params: Promise<Record<string, never>>;
};

export default function AccountPage({ params }: AccountPageProps) {
  void params;
  const t = useI18n();

  return (
    <PageLayout
      title={t("common.account_management")}
      description={t("common.coming_soon")}
      maxWidthClassName="max-w-3xl"
    >
      <></>
    </PageLayout>
  );
}
