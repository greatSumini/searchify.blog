"use client";
import { useCurrentLocale } from "@/lib/i18n/client";

export function DateFormatter({ date }: { date: Date }) {
  const locale = useCurrentLocale();
  const formattedDate = new Intl.DateTimeFormat(locale, {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date);

  return <span>{formattedDate}</span>;
}
