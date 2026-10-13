import { defineRouting } from "next-intl/routing";
import { DEFAULT_LOCALE, LOCALES } from "@/lib/types";

/**
 * Konfigurasi routing dwibahasa (PRD FR-I18N-1).
 *
 * - `localePrefix: "as-needed"` → locale default (id) tidak memakai prefix,
 *   sehingga ID hidup di `/` dan EN di `/en`.
 * - `localeDetection: true` → pengunjung diarahkan otomatis berdasarkan
 *   cookie `NEXT_LOCALE` lebih dulu, lalu header `Accept-Language`.
 *   Prioritas lengkap ada di `proxy.ts`.
 */
export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "as-needed",
  localeDetection: true,
});

// Menyatukan tipe `Locale` aplikasi dengan tipe internal next-intl,
// supaya `useLocale()`, `getLocale()`, dan `Link` ikut type-safe.
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
  }
}
