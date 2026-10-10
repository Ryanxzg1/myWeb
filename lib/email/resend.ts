import { Resend } from "resend";

function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (match) => {
    switch (match) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#039;";
      default:
        return match;
    }
  });
}

let resendInstance: Resend | null = null;

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!resendInstance) {
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

/**
 * Mengirimkan email kode verifikasi OTP (FR-AUTH-2).
 * Jika RESEND_API_KEY kosong di environment non-production, kode dicetak ke terminal
 * agar alur autentikasi lokal tetap bisa diuji tanpa hambatan.
 */
export async function sendOtpEmail(toEmail: string, otpCode: string): Promise<boolean> {
  const resend = getResendClient();

  if (!resend) {
    if (process.env.NODE_ENV !== "production") {
      console.log("\n==========================================");
      console.log(`[AUTH OTP DEV MODE] Target: ${toEmail}`);
      console.log(`[AUTH OTP DEV MODE] Kode Verifikasi: ${otpCode}`);
      console.log("==========================================\n");
      return true;
    }
    throw new Error("RESEND_API_KEY is not configured in production");
  }

  const from = process.env.MAIL_FROM || "onboarding@resend.dev";

  try {
    const { error } = await resend.emails.send({
      from,
      to: toEmail,
      subject: `Kode Verifikasi Login Admin: ${otpCode}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #1a1a1a;">Kode Login Admin</h2>
          <p style="color: #444;">Gunakan kode di bawah ini untuk menyelesaikan login panel admin. Kode ini berlaku selama 10 menit.</p>
          <div style="background-color: #f4f4f5; padding: 16px; font-size: 32px; letter-spacing: 6px; text-align: center; font-weight: bold; border-radius: 8px; margin: 24px 0;">
            ${otpCode}
          </div>
          <p style="color: #666; font-size: 13px;">Jika Anda tidak meminta kode ini, abaikan pesan ini.</p>
        </div>
      `,
    });

    if (error) {
      console.error("[RESEND ERROR]", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[EMAIL SEND FAILED]", err);
    return false;
  }
}

/**
 * Mengirimkan notifikasi pesan kontak baru ke email pemilik (FR-CON-4).
 * Desain: Kegagalan pengiriman tidak boleh menggagalkan simpan data kontak di database.
 */
export async function sendContactNotification(data: {
  name: string;
  email: string;
  subject?: string | null;
  message: string;
}): Promise<boolean> {
  const resend = getResendClient();
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.warn("[CONTACT NOTIFICATION] ADMIN_EMAIL not set, skipping notification");
    return false;
  }

  if (!resend) {
    if (process.env.NODE_ENV !== "production") {
      console.log("\n[CONTACT NOTIFICATION DEV MODE] Pesan kontak baru dari:", data.name, data.email);
      console.log("Isi:", data.message, "\n");
      return true;
    }
    return false;
  }

  const from = process.env.MAIL_FROM || "onboarding@resend.dev";
  const safeName = escapeHtml(data.name);
  const safeEmail = escapeHtml(data.email);
  const safeSubject = data.subject ? escapeHtml(data.subject) : null;
  const safeMessage = escapeHtml(data.message);

  try {
    const { error } = await resend.emails.send({
      from,
      to: adminEmail,
      subject: `Pesan Baru dari Portfolio: ${safeSubject || safeName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 540px; margin: 0 auto; padding: 20px;">
          <h2>Pesan Baru Diterima</h2>
          <p><strong>Pengirim:</strong> ${safeName} (&lt;${safeEmail}&gt;)</p>
          ${safeSubject ? `<p><strong>Subjek:</strong> ${safeSubject}</p>` : ""}
          <div style="background: #f8fafc; border-left: 4px solid #e8590c; padding: 14px; margin-top: 14px; white-space: pre-wrap;">
            ${safeMessage}
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("[CONTACT NOTIFICATION ERROR]", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[CONTACT NOTIFICATION FAILED]", err);
    return false;
  }
}
