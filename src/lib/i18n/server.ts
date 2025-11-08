import { createI18nServer } from 'next-international/server';

const server = createI18nServer({
  ko: () => import('./locales/ko'),
  en: () => import('./locales/en'),
});

export const getI18n: () => Promise<(key: string, params?: any) => string> = async () => {
  const t = await (server as any).getI18n();
  return t as (key: string, params?: any) => string;
};
export const getScopedI18n: (scope: string) => Promise<(key: string, params?: any) => string> = async (scope: string) => {
  const t = await (server as any).getScopedI18n(scope);
  return t as (key: string, params?: any) => string;
};
export const { getCurrentLocale } = server as any;

