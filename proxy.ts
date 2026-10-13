import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import {
  ADMIN_LOGIN_PATH,
  isAdminLoginPath,
  isAdminPath,
} from "@/lib/auth/admin-path";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

const handleI18nRouting = createMiddleware(routing);

/**
 * Proxy (dulu bernama `middleware` di Next.js < 16).
 *
 * Dua tanggung jawab:
 * 1. Panel admin — redirect optimistis ke halaman login kalau cookie sesi
 *    tidak ada atau tidak valid.
 * 2. Sisanya — delegasikan ke middleware next-intl untuk penentuan locale.
 *
 * PENTING: ini hanya *optimistic check*. Dokumentasi Next.js menegaskan proxy
 * tidak boleh jadi satu-satunya penjaga. Setiap Server Component dan Server
 * Action di bawah `/admin` WAJIB memverifikasi sesi sendiri sebelum membaca
 * atau menulis data.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isAdminPath(pathname)) {
    return withLocaleCacheHeaders(request, pathname);
  }

  if (isAdminLoginPath(pathname)) {
    return NextResponse.next();
  }

  if (isSessionTokenValid(request.cookies.get(SESSION_COOKIE_NAME)?.value)) {
    return NextResponse.next();
  }

  const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
  // Dipakai untuk kembali ke halaman yang dituju setelah login berhasil.
  // Halaman login WAJIB memvalidasi parameter ini sebelum mengarahkan balik,
  // kalau tidak ini jadi celah open redirect.
  loginUrl.searchParams.set("next", pathname);

  return NextResponse.redirect(loginUrl);
}

/**
 * Menjalankan routing i18n lalu menandai respons yang isinya bergantung pada
 * header permintaan agar tidak masuk cache bersama.
 *
 * Path tanpa prefix locale (mis. `/`) ditentukan oleh cookie `NEXT_LOCALE` dan
 * header `Accept-Language` — lihat `localeDetection` di `i18n/routing.ts`.
 * Tanpa penandaan ini, respons 200 hasil rewrite ke `/id` tetap membawa
 * `Cache-Control: s-maxage=...` dari halaman statis, sehingga cache bersama
 * bisa menyajikan HTML versi ID lengkap dengan `Set-Cookie: NEXT_LOCALE=id`
 * kepada pengunjung berbahasa Inggris dan memakunya ke ID.
 *
 * `no-store` dipakai sebagai ganti `Vary: Accept-Language` karena Next.js
 * menimpa header `Vary` yang disetel di sini saat menyusun respons akhir
 * (terverifikasi: nilainya hilang di respons `/`). Selama responsnya tidak
 * disimpan cache mana pun, deklarasi varian tidak lagi relevan.
 *
 * Path yang sudah berprefix locale bersifat deterministik per URL, jadi
 * caching-nya dibiarkan seperti semula.
 */
function withLocaleCacheHeaders(request: NextRequest, pathname: string) {
  const response = handleI18nRouting(request);

  if (!hasLocalePrefix(pathname)) {
    response.headers.set("Cache-Control", "private, no-store");
  }

  return response;
}

/** `true` kalau segmen pertama pathname adalah salah satu locale yang didukung. */
function hasLocalePrefix(pathname: string): boolean {
  return routing.locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
}

/**
 * `verifySessionToken` melempar error kalau `AUTH_SECRET` absen atau terlalu
 * pendek. Tanpa penjagaan ini, setiap request admin akan berakhir 500 alih-alih
 * dialihkan ke halaman login.
 */
function isSessionTokenValid(token: string | undefined): boolean {
  if (!token) return false;

  try {
    return verifySessionToken(token) !== null;
  } catch {
    return false;
  }
}

export const config = {
  // Dua pola, bukan satu: pola pertama menjaga `/admin` secara utuh, pola kedua
  // melewati API, aset internal Next.js, dan path berisi titik (mis.
  // favicon.ico).
  //
  // Sebelumnya pengecualian `.*\..*` ikut berlaku untuk `/admin`, sehingga
  // `/admin/x.y` tidak pernah masuk ke guard dan berakhir 404 alih-alih
  // dialihkan ke login. Pola pertama tidak memakai pengecualian itu.
  //
  // Catatan: pola pertama masih terikat pada path `admin` literal karena
  // matcher bersifat statis. Kalau `ADMIN_PATH` diganti lewat env, guard tetap
  // bekerja lewat pola kedua (path itu tidak cocok dengan daftar pengecualian),
  // tapi kembali rentan terhadap pengecualian titik.
  matcher: [
    "/admin/:path*",
    "/((?!api|trpc|_next|_vercel|admin|.*\\..*).*)",
  ],
};
