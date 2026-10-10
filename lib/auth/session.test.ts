import { describe, it, expect } from "vitest";
import {
  createSessionToken,
  verifySessionToken,
  SESSION_DURATION_MS,
} from "@/lib/auth/session";

const TEST_SECRET = "super-secret-test-key-at-least-32-chars-long";

describe("lib/auth/session", () => {
  it("creates and verifies valid session token", () => {
    const payload = { userId: "user-123", email: "admin@test.com" };
    const token = createSessionToken(payload, TEST_SECRET);

    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(2);

    const verified = verifySessionToken(token, TEST_SECRET);
    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe(payload.userId);
    expect(verified?.email).toBe(payload.email);
    expect(verified?.expiresAt).toBeGreaterThan(Date.now());
  });

  it("rejects token with invalid signature or modified payload", () => {
    const token = createSessionToken(
      { userId: "user-123", email: "admin@test.com" },
      TEST_SECRET,
    );
    const [payloadPart] = token.split(".");
    const tamperedToken = `${payloadPart}.tamperedsignature123`;

    expect(verifySessionToken(tamperedToken, TEST_SECRET)).toBeNull();
    expect(verifySessionToken(token, "wrong-secret-key-that-is-also-32-chars!")).toBeNull();
  });

  it("rejects expired token", () => {
    const payload = {
      userId: "user-123",
      email: "admin@test.com",
      expiresAt: Date.now() - 1000, // sudah kadaluarsa
    };
    // encode manual payload kadaluarsa
    const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const { createHmac } = require("node:crypto");
    const sig = createHmac("sha256", TEST_SECRET).update(encoded).digest("base64url");
    const expiredToken = `${encoded}.${sig}`;

    expect(verifySessionToken(expiredToken, TEST_SECRET)).toBeNull();
  });

  it("handles empty or malformed tokens safely without crashing", () => {
    expect(verifySessionToken("", TEST_SECRET)).toBeNull();
    expect(verifySessionToken("not-a-token", TEST_SECRET)).toBeNull();
    expect(verifySessionToken("a.b.c", TEST_SECRET)).toBeNull();
  });
});
