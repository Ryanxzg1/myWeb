import { createHmac, timingSafeEqual } from "node:crypto";

export interface SessionPayload {
  userId: string;
  email: string;
  expiresAt: number; // Unix timestamp in ms
}

export const SESSION_COOKIE_NAME = "admin_session";
// Durasi idle session 2 jam sesuai kesepakatan spesifikasi PRD FR-AUTH-6
export const SESSION_DURATION_MS = 2 * 60 * 60 * 1000;

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
 * Membuat token sesi bertanda tangan digital (HMAC-SHA256).
 * Alasan: Stateless token menghindari overhead query database pada setiap request admin.
 */
export function createSessionToken(
  payload: Omit<SessionPayload, "expiresAt">,
  secret = getAuthSecret(),
): string {
  const fullPayload: SessionPayload = {
    ...payload,
    expiresAt: Date.now() + SESSION_DURATION_MS,
  };

  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

/**
 * Memvalidasi integritas dan masa berlaku token sesi admin.
 * Memakai timingSafeEqual untuk mengeliminasi timing attack.
 */
export function verifySessionToken(
  token: string,
  secret = getAuthSecret(),
): SessionPayload | null {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [encodedPayload, providedSignature] = parts;

  const expectedSignature = createHmac("sha256", secret)
    .update(encodedPayload)
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
    const parsed = JSON.parse(base64UrlDecode(encodedPayload)) as SessionPayload;
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
