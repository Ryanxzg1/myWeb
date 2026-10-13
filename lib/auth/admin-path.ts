/**
 * Sumber kebenaran tunggal untuk lokasi panel admin (FR-ADM-1).
 *
 * `proxy.ts` dan halaman admin harus sepakat soal path ini. Kalau nilainya
 * diubah lewat env `ADMIN_PATH`, keduanya ikut berubah tanpa saling
 * menyunting — asalkan `ADMIN_PATH` juga diset saat build.
 *
 * Catatan: matcher proxy bersifat statis, jadi `ADMIN_PATH` diperiksa di
 * dalam kode, bukan di matcher. Mengubah env ini butuh redeploy.
 */
function normalizeAdminPath(raw: string | undefined): string {
  const trimmed = (raw ?? "").trim().replace(/^\/+|\/+$/g, "");
  return trimmed || "admin";
}

export const ADMIN_PATH = normalizeAdminPath(process.env.ADMIN_PATH);

/** Contoh: `/admin` */
export const ADMIN_BASE = `/${ADMIN_PATH}`;

/** Contoh: `/admin/login` */
export const ADMIN_LOGIN_PATH = `${ADMIN_BASE}/login`;

export function isAdminPath(pathname: string): boolean {
  return pathname === ADMIN_BASE || pathname.startsWith(`${ADMIN_BASE}/`);
}

export function isAdminLoginPath(pathname: string): boolean {
  return (
    pathname === ADMIN_LOGIN_PATH || pathname.startsWith(`${ADMIN_LOGIN_PATH}/`)
  );
}
