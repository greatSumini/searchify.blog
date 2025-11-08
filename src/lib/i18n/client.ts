"use client";
import { createI18nClient } from 'next-international/client';
import type React from 'react';

const client = createI18nClient({
  ko: () => import('./locales/ko'),
  en: () => import('./locales/en'),
});

export const I18nProvider = (client as any).I18nProviderClient as (props: { locale: string; fallback?: React.ReactNode; children: React.ReactNode }) => React.ReactElement;
export const useI18n: () => (key: string, params?: any) => string = () => (client as any).useI18n() as (key: string, params?: any) => string;
export const useScopedI18n: (scope: string) => (key: string, params?: any) => string = (scope: string) => (client as any).useScopedI18n(scope) as (key: string, params?: any) => string;
export const useChangeLocale: (config?: any) => (newLocale: string) => void = (config?: any) => {
  const change = (client as any).useChangeLocale(config) as (l: string) => void;
  return (l: string) => change(l);
};
export const useCurrentLocale: () => string = () => (client as any).useCurrentLocale() as string;

