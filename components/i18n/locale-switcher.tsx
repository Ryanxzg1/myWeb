"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/**
 * Toggle bahasa di header (FR-I18N-2).
 *
 * `usePathname` dari `i18n/navigation` mengembalikan path tanpa prefix locale,
 * jadi tujuannya selalu halaman yang sedang dibuka, hanya berganti bahasa.
 * Pilihannya diingat lewat cookie `NEXT_LOCALE` yang diset middleware next-intl.
 */
export function LocaleSwitcher() {
  const t = useTranslations("localeSwitcher");
  const activeLocale = useLocale();
  const pathname = usePathname();

  return (
    <nav aria-label={t("label")} className="flex items-center gap-2">
      {routing.locales.map((locale) => {
        const isActive = locale === activeLocale;

        return (
          <Link
            key={locale}
            href={pathname}
            locale={locale}
            aria-current={isActive ? "true" : undefined}
            className={`font-mono text-[11px] uppercase tracking-wider transition-colors hover:text-accent ${
              isActive ? "text-accent" : "text-foreground/60"
            }`}
          >
            {t(locale)}
          </Link>
        );
      })}
    </nav>
  );
}
