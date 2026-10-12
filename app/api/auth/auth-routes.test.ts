import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as loginHandler } from "@/app/api/auth/login/route";
import { POST as verifyHandler } from "@/app/api/auth/verify/route";
import { POST as logoutHandler } from "@/app/api/auth/logout/route";
import * as authService from "@/lib/auth/service";
import * as tempTokenHelper from "@/lib/auth/temp-token";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";

describe("Auth API Routes", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Default rate limit bypass untuk pengujian fungsional terisolasi
    vi.spyOn(authService, "checkLoginRateLimit").mockReturnValue({
      allowed: true,
      remaining: 5,
      resetAt: Date.now() + 60000,
    });
    vi.spyOn(authService, "checkVerifyRateLimit").mockReturnValue({
      allowed: true,
      remaining: 10,
      resetAt: Date.now() + 60000,
    });
  });

  describe("POST /api/auth/login", () => {
    it("returns 429 when IP rate limit is exceeded", async () => {
      vi.spyOn(authService, "checkLoginRateLimit").mockReturnValueOnce({
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + 60000,
      });

      const req = new NextRequest("http://localhost:3000/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "admin@test.com", password: "secret" }),
        headers: { "content-type": "application/json" },
      });

      const res = await loginHandler(req);
      expect(res.status).toBe(429);
      const json = await res.json();
      expect(json.error).toContain("Terlalu banyak percobaan");
    });

    it("returns 400 when body is invalid JSON or missing fields", async () => {
      const req = new NextRequest("http://localhost:3000/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "invalid-email" }),
        headers: { "content-type": "application/json" },
      });

      const res = await loginHandler(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBeDefined();
    });

    it("returns 401 when credentials do not match", async () => {
      vi.spyOn(authService, "authenticateCredentials").mockResolvedValueOnce(null);

      const req = new NextRequest("http://localhost:3000/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: "admin@test.com",
          password: "wrongpassword",
        }),
        headers: { "content-type": "application/json" },
      });

      const res = await loginHandler(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Email atau password tidak sesuai");
    });

    it("returns 200 with tempToken and masked email when credentials are valid", async () => {
      vi.spyOn(authService, "authenticateCredentials").mockResolvedValueOnce({
        id: "user-123",
        email: "admin@example.com",
        name: "Admin User",
      });
      vi.spyOn(authService, "generateAndSendOtp").mockResolvedValueOnce({
        success: true,
      });

      const req = new NextRequest("http://localhost:3000/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: "admin@example.com",
          password: "correctpassword",
        }),
        headers: { "content-type": "application/json" },
      });

      const res = await loginHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.tempToken).toBeDefined();
      expect(json.maskedEmail).toBe("a***n@example.com");
    });
  });

  describe("POST /api/auth/verify", () => {
    it("returns 400 when OTP code is not 6 digits", async () => {
      const req = new NextRequest("http://localhost:3000/api/auth/verify", {
        method: "POST",
        body: JSON.stringify({ tempToken: "some-token", code: "12" }),
        headers: { "content-type": "application/json" },
      });

      const res = await verifyHandler(req);
      expect(res.status).toBe(400);
    });

    it("rejects non-digit OTP code at validation boundary without consuming DB quota (QE-03)", async () => {
      const verifyOtpSpy = vi.spyOn(authService, "verifyOtp");

      const req = new NextRequest("http://localhost:3000/api/auth/verify", {
        method: "POST",
        body: JSON.stringify({ tempToken: "some-token", code: "12345o" }),
        headers: { "content-type": "application/json" },
      });

      const res = await verifyHandler(req);
      expect(res.status).toBe(400);
      expect(verifyOtpSpy).not.toHaveBeenCalled();
    });

    it("returns 429 with Retry-After header when verify rate limit is exceeded (QE-02)", async () => {
      vi.spyOn(authService, "checkVerifyRateLimit").mockReturnValueOnce({
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + 30000,
      });

      const req = new NextRequest("http://localhost:3000/api/auth/verify", {
        method: "POST",
        body: JSON.stringify({ tempToken: "some-token", code: "123456" }),
        headers: { "content-type": "application/json" },
      });

      const res = await verifyHandler(req);
      expect(res.status).toBe(429);
      expect(res.headers.get("Retry-After")).toBeDefined();
    });

    it("returns 401 when tempToken is invalid", async () => {
      vi.spyOn(tempTokenHelper, "verifyTempLoginToken").mockReturnValueOnce(null);

      const req = new NextRequest("http://localhost:3000/api/auth/verify", {
        method: "POST",
        body: JSON.stringify({ tempToken: "fake-token", code: "123456" }),
        headers: { "content-type": "application/json" },
      });

      const res = await verifyHandler(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toContain("Sesi verifikasi tidak valid");
    });

    it("returns 423 when OTP is locked due to too many failed attempts", async () => {
      vi.spyOn(tempTokenHelper, "verifyTempLoginToken").mockReturnValueOnce({
        userId: "user-123",
        email: "admin@example.com",
        expiresAt: Date.now() + 600000,
      });
      vi.spyOn(authService, "verifyOtp").mockResolvedValueOnce({
        success: false,
        reason: "locked",
      });

      const req = new NextRequest("http://localhost:3000/api/auth/verify", {
        method: "POST",
        body: JSON.stringify({ tempToken: "valid-temp-token", code: "123456" }),
        headers: { "content-type": "application/json" },
      });

      const res = await verifyHandler(req);
      expect(res.status).toBe(423);
      const json = await res.json();
      expect(json.error).toContain("dikunci");
    });

    it("returns 200 and sets httpOnly session cookie when OTP is correct", async () => {
      vi.spyOn(tempTokenHelper, "verifyTempLoginToken").mockReturnValueOnce({
        userId: "user-123",
        email: "admin@example.com",
        expiresAt: Date.now() + 600000,
      });
      vi.spyOn(authService, "verifyOtp").mockResolvedValueOnce({
        success: true,
      });

      const req = new NextRequest("http://localhost:3000/api/auth/verify", {
        method: "POST",
        body: JSON.stringify({ tempToken: "valid-temp-token", code: "654321" }),
        headers: { "content-type": "application/json" },
      });

      const res = await verifyHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);

      const cookieHeader = res.headers.get("set-cookie");
      expect(cookieHeader).toBeDefined();
      expect(cookieHeader).toContain(SESSION_COOKIE_NAME);
      expect(cookieHeader?.toLowerCase()).toContain("httponly");
    });
  });

  describe("POST /api/auth/logout", () => {
    it("clears the session cookie with max-age: 0", async () => {
      const res = await logoutHandler();
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);

      const cookieHeader = res.headers.get("set-cookie");
      expect(cookieHeader).toBeDefined();
      expect(cookieHeader).toContain(SESSION_COOKIE_NAME);
      expect(cookieHeader?.toLowerCase()).toContain("max-age=0");
    });
  });
});
