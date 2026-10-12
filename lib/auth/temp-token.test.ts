import { describe, it, expect, vi } from "vitest";
import {
  createTempLoginToken,
  verifyTempLoginToken,
  maskEmail,
} from "@/lib/auth/temp-token";

describe("lib/auth/temp-token", () => {
  it("creates and verifies a valid temporary login token", () => {
    const payload = { userId: "user-abc", email: "admin@example.com" };
    const token = createTempLoginToken(payload);

    expect(typeof token).toBe("string");
    expect(token.includes(".")).toBe(true);

    const verified = verifyTempLoginToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe(payload.userId);
    expect(verified?.email).toBe(payload.email);
    expect(verified?.expiresAt).toBeGreaterThan(Date.now());
  });

  it("rejects tampered or forged tokens", () => {
    const payload = { userId: "user-abc", email: "admin@example.com" };
    const token = createTempLoginToken(payload);

    const [body, sig] = token.split(".");
    const tamperedToken = `${body}.${sig}tampered`;

    expect(verifyTempLoginToken(tamperedToken)).toBeNull();
  });

  it("rejects expired tokens", () => {
    vi.useFakeTimers();
    try {
      const payload = { userId: "user-abc", email: "admin@example.com" };
      const token = createTempLoginToken(payload);

      // Lewati waktu 11 menit (melebihi limit 10 menit OTP_EXPIRATION_MS)
      vi.advanceTimersByTime(11 * 60 * 1000);

      expect(verifyTempLoginToken(token)).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it("handles non-string or malformed inputs safely", () => {
    // @ts-expect-error test runtime boundary
    expect(verifyTempLoginToken(null)).toBeNull();
    // @ts-expect-error test runtime boundary
    expect(verifyTempLoginToken(undefined)).toBeNull();
    expect(verifyTempLoginToken("not-a-valid-token")).toBeNull();
  });

  it("masks email addresses correctly", () => {
    expect(maskEmail("husyenrafi@gmail.com")).toBe("h***i@gmail.com");
    expect(maskEmail("al@domain.com")).toBe("a***@domain.com");
    expect(maskEmail("invalid-email")).toBe("***@***");
  });

  it("never leaks undefined when local part is empty (QE-07)", () => {
    expect(maskEmail("@domain.com")).toBe("***@domain.com");
    expect(maskEmail("@domain.com")).not.toContain("undefined");
  });
});
