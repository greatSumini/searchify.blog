import "./globals.css";
import Providers from "./providers";
import { getCurrentLocale } from "@/lib/i18n/server";
import { I18nProvider } from "@/lib/i18n/client";

/**
 * Root Layout
 *
 * This layout provides the base HTML structure and global styles.
 * It does NOT include ClerkProvider or authentication logic.
 *
 * Authentication is handled in the (protected) sub-layout to ensure:
 * - 404 pages and error routes work without Clerk context
 * - Static asset requests don't trigger Clerk middleware errors
 * - Clerk only runs on authenticated routes matched by middleware
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getCurrentLocale().catch(() => "ko");
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className="antialiased font-sans">
        <I18nProvider locale={locale}>
          <Providers>{children}</Providers>
        </I18nProvider>
      </body>
    </html>
  );
}
