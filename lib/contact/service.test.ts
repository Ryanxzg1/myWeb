import { describe, it, expect } from "vitest";
import { contactFormSchema } from "@/lib/contact/service";

describe("lib/contact/service (validation & spam filtering)", () => {
  it("validates valid contact form input", () => {
    const input = {
      name: "John Doe",
      email: "john@example.com",
      subject: "Project Inquiry",
      message: "Halo, saya tertarik bekerja sama membangun aplikasi web.",
      turnstileToken: "dummy-token",
    };

    const res = contactFormSchema.safeParse(input);
    expect(res.success).toBe(true);
  });

  it("rejects input with invalid email format", () => {
    const input = {
      name: "John Doe",
      email: "not-an-email",
      message: "Halo, saya tertarik bekerja sama membangun aplikasi web.",
      turnstileToken: "dummy-token",
    };

    const res = contactFormSchema.safeParse(input);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.flatten().fieldErrors.email).toBeDefined();
    }
  });

  it("rejects message that is too short", () => {
    const input = {
      name: "John Doe",
      email: "john@example.com",
      message: "Pendek",
      turnstileToken: "dummy-token",
    };

    const res = contactFormSchema.safeParse(input);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.flatten().fieldErrors.message).toBeDefined();
    }
  });

  it("drops honeypot submissions silently without database write", async () => {
    const { submitContactMessage } = await import("@/lib/contact/service");
    const res = await submitContactMessage({
      name: "Bot User",
      email: "bot@example.com",
      message: "Spam message bla bla bla long enough",
      honeypot: "i am a bot",
      turnstileToken: "dummy",
    });

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.messageId).toBe("honeypot-dropped");
    }
  });

  it("blocks requests when rate limit is exceeded for the same IP", async () => {
    const { submitContactMessage } = await import("@/lib/contact/service");
    const ip = "10.0.0.99";

    // Trigger honeypot requests to consume rate limit without DB writes
    for (let i = 0; i < 5; i++) {
      const res = await submitContactMessage(
        {
          name: "User",
          email: "user@example.com",
          message: "Valid test message longer than 10",
          honeypot: "bot-trap",
          turnstileToken: "dummy",
        },
        ip,
      );
      expect(res.success).toBe(true);
    }

    // Request ke-6 harus diblokir oleh rate limiter
    const blocked = await submitContactMessage(
      {
        name: "User",
        email: "user@example.com",
        message: "Valid test message longer than 10",
        honeypot: "bot-trap",
        turnstileToken: "dummy",
      },
      ip,
    );

    expect(blocked.success).toBe(false);
    if (!blocked.success) {
      expect(blocked.error).toContain("Terlalu banyak permintaan");
    }
  });
});
