import * as rootParams from "next/root-params";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

/**
 * Konfigurasi request next-intl.
 *
 * Segmen `[locale]` dibaca lewat `next/root-params` (Next.js 16.3+). Ini
 * menggantikan `requestLocale` yang sudah deprecated dan `setRequestLocale`
 * yang berstatus legacy, sekaligus membuat halaman tetap eligible untuk
 * static rendering di bawah `cacheComponents`.
 */
export default getRequestConfig(async ({ locale }) => {
  // Jalur override. `next/root-params` belum didukung di Route Handler dan
  // Server Action, jadi pemanggil dari sana boleh mengoper locale eksplisit.
  if (locale) {
    return resolveMessages(locale);
  }

  return resolveMessages(await rootParams.locale());
});

/**
 * Memvalidasi locale lalu memuat pesannya.
 *
 * Dua jalur masuk ke sini — root param dan override eksplisit — dan keduanya
 * berakhir di `import()` dinamis, jadi validasinya dijaga di satu tempat
 * dengan parameter bertipe `unknown`.
 *
 * Ini juga pengganti `dynamicParams = false`, yang tidak kompatibel dengan
 * Cache Components: tanpa validasi, `/apa-saja` ikut cocok sebagai locale.
 *
 * CATATAN FASE 6: `next/root-params` hanya punya nilai di dalam segmen
 * `[locale]`. Route di luar segmen itu — termasuk seluruh `/admin/*` — akan
 * menghasilkan `undefined` dan berakhir di `notFound()`. Kalau panel admin
 * butuh terjemahan, suplai pesannya secara eksplisit (mis. `messages` langsung
 * ke `NextIntlClientProvider`), jangan mengandalkan root param.
 */
export async function resolveMessages(locale: unknown) {
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = (await import(`../messages/${locale}.json`)).default;

  return { locale, messages };
}
