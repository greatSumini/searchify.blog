import { createI18nClient } from 'next-international/client';
import { createI18nServer } from 'next-international/server';
export { createI18nMiddleware } from 'next-international/middleware';
import type React from 'react';

const client = createI18nClient({
  ko: () => import('./locales/ko'),
  en: () => import('./locales/en'),
});

const server = createI18nServer({
  ko: () => import('./locales/ko'),
  en: () => import('./locales/en'),
});

export const useI18n: () => (key: string, params?: any) => string = () => (client as any).useI18n() as (key: string, params?: any) => string;
export const useScopedI18n: (scope: string) => (key: string, params?: any) => string = (scope: string) => (client as any).useScopedI18n(scope) as (key: string, params?: any) => string;
// Relax types for app usage to avoid over-constrained generics
export const useChangeLocale: (config?: any) => (newLocale: string) => void = (config?: any) => {
  const change = (client as any).useChangeLocale(config) as (l: string) => void;
  return (l: string) => change(l);
};
export const useCurrentLocale: () => string = () => (client as any).useCurrentLocale() as string;
export const I18nProvider = (client as any).I18nProviderClient as (props: { locale: string; fallback?: React.ReactNode; children: React.ReactNode }) => React.ReactElement;

export const getI18n: () => Promise<(key: string, params?: any) => string> = async () => {
  const t = await (server as any).getI18n();
  return t as (key: string, params?: any) => string;
};
export const getScopedI18n: (scope: string) => Promise<(key: string, params?: any) => string> = async (scope: string) => {
  const t = await (server as any).getScopedI18n(scope);
  return t as (key: string, params?: any) => string;
};
export const { getCurrentLocale } = server;
