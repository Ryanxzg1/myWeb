import "../globals.css";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { RootShell } from "@/components/shell/root-shell";
import { routing } from "@/i18n/routing";

/**
 * Root layout untuk seluruh halaman publik.
 *
 * Berada di dalam segmen dinamis `[locale]`, sehingga `locale` menjadi root
 * parameter yang bisa dibaca dari Server Component mana pun di bawahnya.
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");

  return {
    title: t("title"),
    description: t("description"),
    // hreflang antar bahasa (FR-I18N-4)
    alternates: {
      languages: {
        ...Object.fromEntries(
          routing.locales.map((locale) => [
            locale,
            locale === routing.defaultLocale ? "/" : `/${locale}`,
          ]),
        ),
        "x-default": "/",
      },
    },
  };
}

export default async function LocaleLayout({
  children,
}: LayoutProps<"/[locale]">) {
  // Dibaca lewat `getLocale()` alih-alih `await params`, karena next-intl
  // sudah menyelesaikannya lewat `i18n/request.ts`.
  const locale = await getLocale();

  return (
    <RootShell lang={locale}>
      <NextIntlClientProvider>{children}</NextIntlClientProvider>
    </RootShell>
  );
}
