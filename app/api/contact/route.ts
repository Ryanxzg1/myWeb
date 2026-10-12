import { NextRequest, NextResponse } from "next/server";
import { submitContactMessage } from "@/lib/contact/service";
import { getClientIp } from "@/lib/security/ip";

/**
 * Route handler untuk form kontak publik (FR-CON-1 s/d FR-CON-6).
 * Menerima submission, memvalidasi input, honeypot, Turnstile, rate limit,
 * serta menyimpan pesan dan mengirim notifikasi email admin secara sinkron.
 */
export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Payload request tidak valid" },
        { status: 400 },
      );
    }

    const result = await submitContactMessage(body, clientIp);

    if (!result.success) {
      // Mapping memakai machine-readable errorCode, bukan pencocokan string (QE-05)
      if (result.errorCode === "RATE_LIMITED") {
        const headers: Record<string, string> = {};
        if (result.retryAfterSeconds) {
          headers["Retry-After"] = String(result.retryAfterSeconds);
        }
        return NextResponse.json(
          { error: result.error },
          { status: 429, headers },
        );
      }

      return NextResponse.json(
        {
          error: result.error,
          fieldErrors: result.fieldErrors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Pesan Anda telah berhasil dikirim. Terima kasih!",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[CONTACT ROUTE ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal saat memproses pesan kontak" },
      { status: 500 },
    );
  }
}
