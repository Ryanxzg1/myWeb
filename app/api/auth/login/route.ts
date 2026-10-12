import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  authenticateCredentials,
  checkLoginRateLimit,
  generateAndSendOtp,
} from "@/lib/auth/service";
import { createTempLoginToken, maskEmail } from "@/lib/auth/temp-token";
import { getClientIp } from "@/lib/security/ip";

const loginSchema = z.object({
  email: z.string().trim().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);

    // Proteksi Rate Limiting per IP (FR-AUTH-4)
    const rateLimit = checkLoginRateLimit(clientIp);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error:
            "Terlalu banyak percobaan login. Silakan coba lagi beberapa saat lagi.",
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

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Data yang dimasukkan tidak valid",
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;

    // Verifikasi kredensial tahap 1 (FR-AUTH-1)
    const user = await authenticateCredentials(email, password);
    if (!user) {
      // Respons netral anti user enumeration (PRD FR-AUTH-5)
      return NextResponse.json(
        { error: "Email atau password tidak sesuai" },
        { status: 401 },
      );
    }

    // Generate dan kirimkan kode OTP 6-digit via email (FR-AUTH-2)
    const otpResult = await generateAndSendOtp(user.id, user.email);
    if (!otpResult.success) {
      return NextResponse.json(
        { error: "Gagal mengirimkan kode verifikasi. Silakan coba lagi." },
        { status: 500 },
      );
    }

    // Buat temporary token untuk otorisasi verifikasi OTP tahap 2
    const tempToken = createTempLoginToken({
      userId: user.id,
      email: user.email,
    });

    return NextResponse.json(
      {
        success: true,
        maskedEmail: maskEmail(user.email),
        tempToken,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[LOGIN ROUTE ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server" },
      { status: 500 },
    );
  }
}
