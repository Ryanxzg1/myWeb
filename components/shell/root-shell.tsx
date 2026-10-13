import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Cangkang root layout bersama untuk `app/[locale]/layout.tsx` dan
 * `app/admin/layout.tsx`.
 *
 * Next.js mewajibkan setiap root layout mendefinisikan `<html>` dan `<body>`,
 * jadi bagian yang identik diekstrak ke sini alih-alih disalin dua kali.
 */
export function RootShell({
  lang,
  children,
}: {
  lang: string;
  children: ReactNode;
}) {
  return (
    <html
      lang={lang}
      // next-themes menulis atribut tema ke <html> sebelum hydration. Tanpa ini,
      // React melaporkan hydration mismatch di setiap muat halaman.
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
