import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/**
 * 404 di dalam segmen `[locale]`, dipakai saat `notFound()` dipanggil dari
 * halaman publik (mis. project berstatus draft — FR-PUB-4).
 */
export default function LocaleNotFound() {
  const t = useTranslations("notFound");

  return (
    <main className="flex flex-1 flex-col justify-center gap-4 px-6 py-24 sm:px-16">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">
        404
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="max-w-xl text-base leading-7 text-foreground/70">
        {t("body")}
      </p>
      <Link
        href="/"
        className="w-fit font-mono text-xs uppercase tracking-wider text-accent underline underline-offset-4"
      >
        {t("back")}
      </Link>
    </main>
  );
}
