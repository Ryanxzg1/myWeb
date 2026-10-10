import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { sendOtpEmail } from "@/lib/email/resend";
import { checkRateLimit, hashClientIp } from "@/lib/security/rate-limit";

export const OTP_EXPIRATION_MS = 10 * 60 * 1000; // 10 menit (FR-AUTH-3)
export const MAX_OTP_ATTEMPTS = 5; // batas percobaan gagal sebelum dikunci (FR-AUTH-3)

// Kuota rate limit login: 5 percobaan per 15 menit per IP (FR-AUTH-4)
export const LOGIN_RATE_LIMIT = 5;
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export function checkLoginRateLimit(rawIp: string) {
  const key = `login:${hashClientIp(rawIp || "unknown-ip")}`;
  return checkRateLimit(key, LOGIN_RATE_LIMIT, LOGIN_WINDOW_MS);
}

export function hashOtp(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

/**
 * Memvalidasi kredensial login tahap 1 (Email + Password).
 */
export async function authenticateCredentials(email: string, password: string) {
  // Defensive guard terhadap input non-string atau kosong (CODE-04)
  if (
    !email ||
    typeof email !== "string" ||
    !password ||
    typeof password !== "string"
  ) {
    return null;
  }

  const normalizedEmail = email.toLowerCase().trim();
  if (!normalizedEmail) return null;

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) return null;

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

/**
 * Menghasilkan kode OTP 6 digit acak, menyimpannya dalam bentuk hash, dan mengirimkannya ke email.
 */
export async function generateAndSendOtp(userId: string, email: string) {
  const code = randomInt(100000, 1000000).toString();
  const codeHash = hashOtp(code);
  const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MS);

  // Invalidate kode lama yang belum terpakai untuk user ini agar hanya ada 1 kode aktif
  await prisma.loginCode.updateMany({
    where: {
      userId,
      usedAt: null,
    },
    data: {
      usedAt: new Date(),
    },
  });

  await prisma.loginCode.create({
    data: {
      userId,
      codeHash,
      expiresAt,
      attempts: 0,
    },
  });

  const emailSent = await sendOtpEmail(email, code);
  return { success: emailSent };
}

export type VerifyOtpResult =
  | { success: true }
  | { success: false; reason: "expired_or_invalid" | "locked" | "incorrect" };

/**
 * Memvalidasi kode OTP tahap 2 dengan proteksi brute-force (maksimal 5x percobaan).
 */
export async function verifyOtp(
  userId: string,
  code: string,
): Promise<VerifyOtpResult> {
  // Defensive guard terhadap input undefined/null/non-string (CODE-03)
  if (
    !userId ||
    typeof userId !== "string" ||
    !code ||
    typeof code !== "string"
  ) {
    return { success: false, reason: "incorrect" };
  }

  const trimmedCode = code.trim();
  if (trimmedCode.length !== 6) {
    return { success: false, reason: "incorrect" };
  }

  const activeRecord = await prisma.loginCode.findFirst({
    where: {
      userId,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!activeRecord) {
    return { success: false, reason: "expired_or_invalid" };
  }

  // Jika sudah melebihi kuota percobaan, hanguskan kode
  if (activeRecord.attempts >= MAX_OTP_ATTEMPTS) {
    await prisma.loginCode.update({
      where: { id: activeRecord.id },
      data: { usedAt: new Date() },
    });
    return { success: false, reason: "locked" };
  }

  const candidateHash = hashOtp(trimmedCode);
  const candidateBuf = Buffer.from(candidateHash);
  const storedBuf = Buffer.from(activeRecord.codeHash);

  const isMatch =
    candidateBuf.length === storedBuf.length &&
    timingSafeEqual(candidateBuf, storedBuf);

  if (!isMatch) {
    const updatedAttempts = activeRecord.attempts + 1;
    await prisma.loginCode.update({
      where: { id: activeRecord.id },
      data: {
        attempts: updatedAttempts,
        // Kunci langsung jika mencapai threshold percobaan
        usedAt: updatedAttempts >= MAX_OTP_ATTEMPTS ? new Date() : null,
      },
    });

    if (updatedAttempts >= MAX_OTP_ATTEMPTS) {
      return { success: false, reason: "locked" };
    }

    return { success: false, reason: "incorrect" };
  }

  // Sukses: tandai sudah terpakai
  await prisma.loginCode.update({
    where: { id: activeRecord.id },
    data: { usedAt: new Date() },
  });

  return { success: true };
}

/**
 * Membersihkan baris login code yang telah kedaluwarsa atau sudah terpakai (FR-AUTH-3).
 */
export async function cleanupExpiredCodes() {
  return prisma.loginCode.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { usedAt: { not: null } },
      ],
    },
  });
}
