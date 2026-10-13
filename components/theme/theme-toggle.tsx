"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

// Urutan siklus saat tombol diklik: terang -> gelap -> ikut sistem.
const NEXT_THEME: Record<string, string> = {
  light: "dark",
  dark: "system",
  system: "light",
};

export function ThemeToggle() {
  const t = useTranslations("theme");
  const { theme, setTheme } = useTheme();

  // Tema baru diketahui setelah mount karena dibaca dari localStorage.
  // Merender label sebelum itu memicu hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const current = mounted ? (theme ?? "system") : "system";
  const label =
    current === "light"
      ? t("light")
      : current === "dark"
        ? t("dark")
        : t("system");

  return (
    <button
      type="button"
      onClick={() => setTheme(NEXT_THEME[current] ?? "light")}
      aria-label={`${t("label")}: ${label}`}
      title={`${t("label")}: ${label}`}
      className="border border-foreground/20 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors hover:border-accent hover:text-accent"
    >
      {label}
    </button>
  );
}
