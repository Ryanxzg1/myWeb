import { createHash } from "node:crypto";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory sliding window store untuk rate limiting per instance serverless / local
const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Menghasilkan hash SHA-256 dari IP pengunjung (FR-CON-2 & PRD Bagian 8).
 * Alasan: Mematuhi prinsip privasi data agar alamat IP asli tidak pernah disimpan mentah.
 */
export function hashClientIp(rawIp: string): string {
  const salt = process.env.AUTH_SECRET || "default-rate-limit-salt";
  return createHash("sha256").update(`${rawIp}:${salt}`).digest("hex");
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Memeriksa dan membatasi frekuensi request berdasarkan kunci pengenal (sliding window).
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  // Jika belum ada record atau window sebelumnya sudah kadaluarsa
  if (!record || now > record.resetAt) {
    const resetAt = now + windowMs;
    rateLimitStore.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: limit - 1,
      resetAt,
    };
  }

  // Jika kuota sudah habis dalam rentang window yang aktif
  if (record.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  // Kuota masih ada, tambahkan hitungan
  record.count += 1;
  return {
    allowed: true,
    remaining: limit - record.count,
    resetAt: record.resetAt,
  };
}

/**
 * Membersihkan record rate limit yang sudah kadaluarsa (mencegah memory leak).
 */
export function sweepRateLimitStore(): void {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}
