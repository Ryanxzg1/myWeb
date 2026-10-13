import "./globals.css";
import type { Metadata } from "next";
import { RootShell } from "@/components/shell/root-shell";

export const metadata: Metadata = {
  title: "404",
  robots: { index: false, follow: false },
};

/**
 * 404 untuk URL yang tidak cocok dengan route mana pun.
 *
 * Aplikasi ini punya dua root layout (`[locale]` dan `admin`), sehingga tidak
 * ada satu layout pun yang bisa dipakai menyusun 404 global. File ini
 * melewati seluruh layout aplikasi, jadi ia mengimpor style dan font sendiri.
 *
 * next-intl tidak bisa dipakai di sini karena tidak ada konteks locale, jadi
 * teksnya ditulis dwibahasa langsung.
 */
export default function GlobalNotFound() {
  return (
    <RootShell lang="id">
      <main className="flex flex-1 flex-col justify-center gap-4 px-6 py-24 sm:px-16">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">
          404
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Halaman tidak ditemukan
        </h1>
        <p className="max-w-xl text-base leading-7 text-foreground/70">
          Page not found. Alamat yang kamu buka tidak ada atau sudah dipindahkan.
        </p>
        <a
          href="/"
          className="w-fit font-mono text-xs uppercase tracking-wider text-accent underline underline-offset-4"
        >
          Kembali ke beranda / Back to home
        </a>
      </main>
    </RootShell>
  );
}
