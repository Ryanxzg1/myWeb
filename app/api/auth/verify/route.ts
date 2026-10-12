import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  checkVerifyRateLimit,
  cleanupExpiredCodes,
  verifyOtp,
} from "@/lib/auth/service";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_MS,
} from "@/lib/auth/session";
import { verifyTempLoginToken } from "@/lib/auth/temp-token";
import { getClientIp } from "@/lib/security/ip";

const verifySchema = z.object({
  tempToken: z.string().min(1, "Token sesi login tahap 1 wajib disertakan"),
  // Regex 6 digit angka: mencegah typo huruf ikut membakar kuota percobaan OTP di database (QE-03)
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Kode verifikasi harus berupa 6 digit angka"),
});

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);

    // Rate limit verifikasi OTP dengan namespace terpisah dari login kredensial (QE-02)
    const rateLimit = checkVerifyRateLimit(clientIp);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error:
            "Terlalu banyak percobaan. Silakan coba lagi beberapa saat lagi.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.max(1, Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
            ),
          },
        },
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Payload request tidak valid" },
        { status: 400 },
      );
    }

    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Data yang dimasukkan tidak valid",
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { tempToken, code } = parsed.data;

    // Verifikasi validitas dan masa berlaku temporary token step 1
    const tempPayload = verifyTempLoginToken(tempToken);
    if (!tempPayload) {
      return NextResponse.json(
        {
          error:
            "Sesi verifikasi tidak valid atau telah kedaluwarsa. Silakan lakukan login ulang.",
        },
        { status: 401 },
      );
    }

    // Verifikasi kode OTP tahap 2 (FR-AUTH-2 & FR-AUTH-3)
    const result = await verifyOtp(tempPayload.userId, code);
    if (!result.success) {
      if (result.reason === "locked") {
        return NextResponse.json(
          {
            error:
              "Kode verifikasi telah dikunci karena terlalu banyak percobaan salah. Silakan login ulang.",
          },
          { status: 423 },
        );
      }

      if (result.reason === "expired_or_invalid") {
        return NextResponse.json(
          {
            error:
              "Kode verifikasi telah kedaluwarsa atau tidak aktif. Silakan minta kode baru.",
          },
          { status: 400 },
        );
      }

      return NextResponse.json(
        { error: "Kode verifikasi tidak sesuai" },
        { status: 401 },
      );
    }

    // Buat signed session token HMAC (FR-AUTH-6)
    const sessionToken = createSessionToken({
      userId: tempPayload.userId,
      email: tempPayload.email,
    });

    // Inisialisasi response dan sematkan cookie httpOnly
    const response = NextResponse.json({ success: true }, { status: 200 });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: Math.floor(SESSION_DURATION_MS / 1000), // 7200 detik (2 jam)
    });

    // Pembersihan kode kadaluwarsa secara berkala (FR-AUTH-3).
    // Di serverless, promise tanpa await berisiko di-terminate sebelum selesai (QE-04).
    // Kegagalan cleanup tidak boleh menggagalkan login — cukup di-log.
    try {
      await cleanupExpiredCodes();
    } catch (err) {
      console.error("[OTP CLEANUP ERROR]", err);
    }

    return response;
  } catch (error) {
    console.error("[VERIFY ROUTE ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server" },
      { status: 500 },
    );
  }
}
