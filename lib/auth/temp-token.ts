import { createHmac, timingSafeEqual } from "node:crypto";
import { OTP_EXPIRATION_MS } from "@/lib/auth/service";

export interface TempLoginPayload {
  userId: string;
  email: string;
  expiresAt: number; // Unix timestamp in ms
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str, "utf8").toString("base64url");
}

function base64UrlDecode(str: string): string {
  return Buffer.from(str, "base64url").toString("utf8");
}

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET must be configured and be at least 32 characters long",
    );
  }
  return secret;
}

/**
 * Menghasilkan token sementara (10 menit) untuk menghubungkan Login Step 1 dan Step 2 (FR-AUTH-2).
 * Stateless token mencegah query ekstra dan memastikan hanya pengguna yang lolos password
 * yang dapat melakukan request ke endpoint verifikasi OTP.
 */
export function createTempLoginToken(
  payload: Omit<TempLoginPayload, "expiresAt">,
  secret = getAuthSecret(),
): string {
  const fullPayload: TempLoginPayload = {
    ...payload,
    expiresAt: Date.now() + OTP_EXPIRATION_MS,
  };

  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = createHmac("sha256", secret)
    .update(`temp:${encodedPayload}`)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

/**
 * Memvalidasi integritas dan masa berlaku temporary token step 1.
 */
export function verifyTempLoginToken(
  token: string,
  secret = getAuthSecret(),
): TempLoginPayload | null {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [encodedPayload, providedSignature] = parts;

  const expectedSignature = createHmac("sha256", secret)
    .update(`temp:${encodedPayload}`)
    .digest("base64url");

  const providedBuf = Buffer.from(providedSignature);
  const expectedBuf = Buffer.from(expectedSignature);

  if (
    providedBuf.length !== expectedBuf.length ||
    !timingSafeEqual(providedBuf, expectedBuf)
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(base64UrlDecode(encodedPayload)) as TempLoginPayload;
    if (!parsed.userId || !parsed.email || !parsed.expiresAt) {
      return null;
    }

    if (Date.now() > parsed.expiresAt) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

/**
 * Menyamarkan alamat email untuk tampilan UI Step 2 (contoh: a***n@domain.com)
 * tanpa membocorkan identifier lengkap pengguna ke browser.
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return "***@***";
  const [local, domain] = email.split("@");
  if (!local || local.length === 0) {
    return `***@${domain}`;
  }
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}
