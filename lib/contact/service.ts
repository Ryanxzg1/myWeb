import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendContactNotification } from "@/lib/email/resend";
import { checkRateLimit, hashClientIp } from "@/lib/security/rate-limit";

// Batasan rate limit: maksimal 5 pengiriman pesan per 1 jam per IP (FR-CON-2)
const CONTACT_RATE_LIMIT = 5;
const CONTACT_WINDOW_MS = 60 * 60 * 1000;

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100, "Nama maksimal 100 karakter"),
  email: z.string().trim().email("Format email tidak valid").max(255),
  subject: z.string().trim().max(150, "Subjek maksimal 150 karakter").optional().nullable(),
  message: z.string().trim().min(10, "Pesan minimal 10 karakter").max(3000, "Pesan maksimal 3000 karakter"),
  honeypot: z.string().optional().nullable(), // Field jebakan bot (FR-CON-2)
  turnstileToken: z.string().min(1, "Verifikasi captcha wajib diselesaikan"),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

/**
 * Memverifikasi token Cloudflare Turnstile ke endpoint resmi (FR-CON-2).
 */
export async function verifyTurnstileToken(token: string, remoteIp?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  // Di development/test, izinkan bypass jika secret belum dikonfigurasi
  if (!secret) {
    if (process.env.NODE_ENV !== "production") {
      return true;
    }
    throw new Error("TURNSTILE_SECRET_KEY is not configured in production");
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secret);
    formData.append("response", token);
    if (remoteIp) {
      formData.append("remoteip", remoteIp);
    }

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(5000), // Timeout 5s mencegah serverless execution hang (REL-01)
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
    });

    const data = (await res.json()) as { success: boolean };
    return Boolean(data.success);
  } catch (err) {
    console.error("[TURNSTILE VERIFY ERROR]", err);
    return false;
  }
}

export type ContactErrorCode =
  | "RATE_LIMITED"
  | "VALIDATION_ERROR"
  | "TURNSTILE_FAILED";

export type SubmitContactResult =
  | { success: true; messageId: string }
  | {
      success: false;
      errorCode: ContactErrorCode;
      error: string;
      fieldErrors?: Record<string, string[]>;
      retryAfterSeconds?: number;
    };

/**
 * Memproses penyimpanan pesan kontak dengan proteksi spam berlapis (FR-CON-1 s/d FR-CON-6).
 */
export async function submitContactMessage(
  rawInput: unknown,
  remoteIp?: string,
): Promise<SubmitContactResult> {
  // Proteksi Rate Limiting per IP pengunjung (SEC-04 & FR-CON-2)
  const clientKey = `contact:${hashClientIp(remoteIp || "unknown-ip")}`;
  const rateLimit = checkRateLimit(clientKey, CONTACT_RATE_LIMIT, CONTACT_WINDOW_MS);
  if (!rateLimit.allowed) {
    return {
      success: false,
      errorCode: "RATE_LIMITED",
      error: "Terlalu banyak permintaan pengiriman pesan. Silakan coba lagi nanti.",
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
      ),
    };
  }

  const parsed = contactFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    const flattened = parsed.error.flatten().fieldErrors;
    return {
      success: false,
      errorCode: "VALIDATION_ERROR",
      error: "Data yang dimasukkan tidak valid",
      fieldErrors: flattened,
    };
  }

  const { name, email, subject, message, honeypot, turnstileToken } = parsed.data;

  // Proteksi Honeypot: Jika field tersembunyi ini terisi, bot berhasil dijebak.
  // Kembalikan sukses palsu (silent reject) agar bot tidak mencoba payload lain.
  if (honeypot && honeypot.trim() !== "") {
    return { success: true, messageId: "honeypot-dropped" };
  }

  // Verifikasi Turnstile
  const isTurnstileValid = await verifyTurnstileToken(turnstileToken, remoteIp);
  if (!isTurnstileValid) {
    return {
      success: false,
      errorCode: "TURNSTILE_FAILED",
      error: "Verifikasi anti-spam gagal. Silakan coba lagi.",
    };
  }

  // Simpan ke database PostgreSQL
  const saved = await prisma.contactMessage.create({
    data: {
      name,
      email,
      subject: subject || null,
      message,
    },
  });

  // Notifikasi email sinkron sesuai PRD FR-CON-4. Di serverless, promise tanpa await
  // berisiko di-terminate sebelum selesai sehingga notifikasi hilang.
  // Kegagalan email TIDAK menggagalkan penyimpanan pesan — hanya di-log dengan konteks.
  try {
    await sendContactNotification({
      name,
      email,
      subject,
      message,
    });
  } catch (err) {
    console.error("[CONTACT NOTIFICATION ERROR]", {
      messageId: saved.id,
      email,
      err,
    });
  }

  return { success: true, messageId: saved.id };
}
