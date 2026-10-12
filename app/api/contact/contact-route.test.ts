import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as contactHandler } from "@/app/api/contact/route";
import * as contactService from "@/lib/contact/service";

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 400 when body is invalid JSON", async () => {
    const req = new NextRequest("http://localhost:3000/api/contact", {
      method: "POST",
      body: "not-json",
      headers: { "content-type": "application/json" },
    });

    const res = await contactHandler(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });

  it("returns 429 when rate limit is exceeded", async () => {
    vi.spyOn(contactService, "submitContactMessage").mockResolvedValueOnce({
      success: false,
      errorCode: "RATE_LIMITED",
      error: "Terlalu banyak permintaan pengiriman pesan. Silakan coba lagi nanti.",
      retryAfterSeconds: 120,
    });

    const req = new NextRequest("http://localhost:3000/api/contact", {
      method: "POST",
      body: JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        message: "Hello world testing 123",
        turnstileToken: "tok_123",
      }),
      headers: { "content-type": "application/json" },
    });

    const res = await contactHandler(req);
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("120");
    const json = await res.json();
    expect(json.error).toContain("Terlalu banyak permintaan");
  });

  it("returns 400 with fieldErrors when schema validation fails", async () => {
    vi.spyOn(contactService, "submitContactMessage").mockResolvedValueOnce({
      success: false,
      errorCode: "VALIDATION_ERROR",
      error: "Data yang dimasukkan tidak valid",
      fieldErrors: { email: ["Format email tidak valid"] },
    });

    const req = new NextRequest("http://localhost:3000/api/contact", {
      method: "POST",
      body: JSON.stringify({
        name: "Test User",
        email: "bad-email",
        message: "Hello world testing 123",
        turnstileToken: "tok_123",
      }),
      headers: { "content-type": "application/json" },
    });

    const res = await contactHandler(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.fieldErrors).toBeDefined();
  });

  it("returns 200 when message is submitted successfully", async () => {
    vi.spyOn(contactService, "submitContactMessage").mockResolvedValueOnce({
      success: true,
      messageId: "msg_123",
    });

    const req = new NextRequest("http://localhost:3000/api/contact", {
      method: "POST",
      body: JSON.stringify({
        name: "Budi Santoso",
        email: "budi@example.com",
        message: "Saya ingin mendiskusikan peluang proyek web personal.",
        turnstileToken: "tok_123",
      }),
      headers: { "content-type": "application/json" },
    });

    const res = await contactHandler(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.message).toContain("berhasil dikirim");
  });
});
