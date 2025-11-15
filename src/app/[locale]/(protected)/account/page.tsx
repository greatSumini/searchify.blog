"use client";

import { useTranslations } from 'next-intl';
import { PageLayout } from "@/components/layout/page-layout";

type AccountPageProps = {
  params: Promise<Record<string, never>>;
};

export default function AccountPage({ params }: AccountPageProps) {
  void params;
  const t = useTranslations();

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
