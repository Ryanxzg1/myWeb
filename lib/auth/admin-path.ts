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
// Karakter yang diizinkan sengaja sempit. `ADMIN_PATH` menentukan path mana
// yang dianggap panel admin, jadi nilai yang aneh (mis. `..`, `admin/../public`,
// atau berisi `?`/`#`) bisa membuat guard menjaga path yang salah. Lebih baik
// gagal saat boot daripada diam-diam salah jaga.
const ADMIN_PATH_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

function normalizeAdminPath(raw: string | undefined): string {
  const trimmed = (raw ?? "").trim().replace(/^\/+|\/+$/g, "");
  if (!trimmed) return "admin";

  if (!ADMIN_PATH_PATTERN.test(trimmed)) {
    throw new Error(
      `ADMIN_PATH tidak valid: ${JSON.stringify(raw)}. ` +
        "Gunakan huruf kecil, angka, dan tanda hubung (contoh: admin).",
    );
  }

  return trimmed;
}

export const ADMIN_PATH = normalizeAdminPath(process.env.ADMIN_PATH);

/** Contoh: `/admin` */
export const ADMIN_BASE = `/${ADMIN_PATH}`;

/** Contoh: `/admin/login` */
export const ADMIN_LOGIN_PATH = `${ADMIN_BASE}/login`;

export function isAdminPath(pathname: string): boolean {
  return pathname === ADMIN_BASE || pathname.startsWith(`${ADMIN_BASE}/`);
}

/**
 * Hanya halaman login itu sendiri yang boleh diakses tanpa sesi.
 *
 * Versi sebelumnya memakai `startsWith`, sehingga seluruh subtree
 * `/admin/login/*` ikut bebas guard. Setiap halaman publik baru di bawah admin
 * harus ditulis satu per satu di sini, bukan diwarisi diam-diam oleh prefix.
 */
export function isAdminLoginPath(pathname: string): boolean {
  return pathname === ADMIN_LOGIN_PATH;
}

/**
 * Memvalidasi parameter `?next=` dari `proxy.ts` sebelum dipakai untuk redirect
 * balik setelah login berhasil.
 *
 * Hanya menerima path internal absolut. Nilai seperti `https://jahat.example`,
 * `//jahat.example` (protocol-relative), atau `/\jahat.example` ditolak —
 * semuanya bisa membawa pengguna keluar dari situs (open redirect).
 */
export function isSafeNextPath(
  value: string | null | undefined,
): value is string {
  if (!value) return false;
  if (!value.startsWith("/")) return false;
  if (value.startsWith("//") || value.startsWith("/\\")) return false;
  if (value.includes("\\")) return false;
  // Karakter kontrol bisa dipakai menyusun nilai Location yang menyesatkan.
  if (/[\u0000-\u001f\u007f]/.test(value)) return false;

  return true;
}
