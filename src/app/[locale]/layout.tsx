import type { Metadata } from "next";
import "../globals.css";
import Providers from "../providers";
import { I18nProvider } from "@/lib/i18n/client";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  void (await params);
  const t = await getI18n();
  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  return (
    <I18nProvider locale={locale}>
      <Providers>{children}</Providers>
    </I18nProvider>
  );
}
