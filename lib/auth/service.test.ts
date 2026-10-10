import { describe, it, expect, vi } from "vitest";
import { hashOtp } from "@/lib/auth/service";

describe("lib/auth/service (core hashing logic)", () => {
  it("computes deterministic sha256 hash for 6-digit OTP", () => {
    const code = "123456";
    const hash1 = hashOtp(code);
    const hash2 = hashOtp(code);

    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64); // SHA-256 hex length
    expect(hashOtp("654321")).not.toBe(hash1);
  });

  it("handles non-string or falsy verifyOtp inputs safely without throwing", async () => {
    const { verifyOtp } = await import("@/lib/auth/service");
    // @ts-expect-error test runtime robustness
    expect(await verifyOtp("user-1", null)).toEqual({ success: false, reason: "incorrect" });
    // @ts-expect-error test runtime robustness
    expect(await verifyOtp("user-1", undefined)).toEqual({ success: false, reason: "incorrect" });
    // @ts-expect-error test runtime robustness
    expect(await verifyOtp("user-1", 123456)).toEqual({ success: false, reason: "incorrect" });
    expect(await verifyOtp("", "123456")).toEqual({ success: false, reason: "incorrect" });
  });

  it("handles non-string authenticateCredentials inputs safely without throwing", async () => {
    const { authenticateCredentials } = await import("@/lib/auth/service");
    // @ts-expect-error test runtime robustness
    expect(await authenticateCredentials(null, "pass")).toBeNull();
    // @ts-expect-error test runtime robustness
    expect(await authenticateCredentials("email@test.com", null)).toBeNull();
    // @ts-expect-error test runtime robustness
    expect(await authenticateCredentials(123, 456)).toBeNull();
  });

  it("enforces login rate limits per IP", async () => {
    const { checkLoginRateLimit } = await import("@/lib/auth/service");
    const testIp = "192.168.1.55";

    for (let i = 0; i < 5; i++) {
      expect(checkLoginRateLimit(testIp).allowed).toBe(true);
    }

    const blocked = checkLoginRateLimit(testIp);
    expect(blocked.allowed).toBe(false);
  });
});
