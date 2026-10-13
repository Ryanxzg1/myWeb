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

/**
 * Domain publik situs. Tanpa `metadataBase`, hreflang dan canonical dikirim
 * sebagai URL relatif, sehingga HTML dan header `Link` tidak konsisten dan
 * crawler bisa salah menyimpulkan versi bahasa mana yang kanonik.
 *
 * Fallback hanya berguna di lokal. Produksi WAJIB mengisi
 * `NEXT_PUBLIC_SITE_URL` (lihat `.env.example`).
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");

  return {
    metadataBase: new URL(SITE_URL),
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
