"use client";

import type { ReactNode } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * `defaultTheme="system"` + `enableSystem` memenuhi FR-THEME-1: default
 * mengikuti preferensi OS, dan pilihan pengguna diingat.
 *
 * Tanpa-flash ditangani oleh script inline yang disuntikkan next-themes ke
 * `<head>` — script itu berjalan sebelum paint pertama, jadi tidak ada
 * kedipan tema terang saat halaman dibuka dalam mode gelap.
 *
 * `disableTransitionOnChange` mencegah animasi transisi warna ikut terpicu
 * saat tema berganti.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
