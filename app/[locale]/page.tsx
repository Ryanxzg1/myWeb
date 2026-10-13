import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { ThemeToggle } from "@/components/theme/theme-toggle";

/**
 * Placeholder Fase 5. Isi sebenarnya (Hero, About, Pengalaman, Project, Skill,
 * Kontak) dibangun pada Fase 6 mengikuti artboard di `docs/generated-uiux/`.
 */
export default function HomePage() {
  const t = useTranslations();

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-foreground/10 px-6 py-4">
        <span className="font-mono text-xs uppercase tracking-widest text-accent">
          {t("metadata.title")}
        </span>
        <div className="flex items-center gap-4">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex flex-1 flex-col justify-center gap-4 px-6 py-24 sm:px-16">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">
          {t("home.phaseLabel")}
        </p>
        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("home.title")}
        </h1>
        <p className="max-w-xl text-base leading-7 text-foreground/70">
          {t("home.body")}
        </p>
      </main>
    </div>
  );
}
