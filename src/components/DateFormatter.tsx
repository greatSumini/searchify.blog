"use client";
import { useLocale } from 'next-intl';

export function DateFormatter({ date }: { date: Date }) {
  const locale = useLocale();
  const formattedDate = new Intl.DateTimeFormat(locale, {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date);

  return <span>{formattedDate}</span>;
}
