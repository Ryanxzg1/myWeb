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
    return handleI18nRouting(request);
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
  // Lewati API, aset internal Next.js, dan path berisi titik (mis. favicon.ico).
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
