import type { NextRequest } from "next/server";

/**
 * Ekstraksi IP klien terpusat untuk keperluan rate limiting (FR-AUTH-4, FR-CON-2).
 *
 * Urutan prioritas:
 * 1. `x-real-ip` — ditetapkan oleh edge network (Vercel) dan tidak dapat dipalsukan client.
 * 2. Elemen pertama `x-forwarded-for` — dipakai saat self-host/behind proxy.
 * 3. Fallback aman agar tidak pernah mengembalikan string kosong.
 *
 * Catatan keamanan: `x-forwarded-for` dapat dikirim client. Jika di-deploy di luar
 * platform yang menimpa header ini, gunakan `x-real-ip` atau tambahkan trusted proxy check.
 */
export function getClientIp(req: NextRequest): string {
  const realIp = req.headers.get("x-real-ip");
  if (realIp && realIp.trim() !== "") {
    return realIp.trim();
  }

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  return "127.0.0.1";
}
