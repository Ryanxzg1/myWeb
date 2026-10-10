import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("lib/auth/password", () => {
  it("hashes password and verifies correctly", async () => {
    const raw = "super-secret-123";
    const hashed = await hashPassword(raw);

    expect(hashed).toMatch(/^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$/);
    expect(await verifyPassword(raw, hashed)).toBe(true);
    expect(await verifyPassword("wrong-password", hashed)).toBe(false);
  });

  it("handles falsy and malformed stored hash safely without throwing", async () => {
    // @ts-expect-error testing runtime falsy
    expect(await verifyPassword("pass", null)).toBe(false);
    // @ts-expect-error testing runtime falsy
    expect(await verifyPassword("pass", undefined)).toBe(false);
    expect(await verifyPassword("pass", "")).toBe(false);
    expect(await verifyPassword("pass", "invalid$format")).toBe(false);
    expect(await verifyPassword("pass", "scrypt$salt$short")).toBe(false);
    expect(await verifyPassword("", "scrypt$salt$hash")).toBe(false);
  });

  it("throws error when hashing empty or invalid password", async () => {
    await expect(hashPassword("")).rejects.toThrow(
      "Password must be a non-empty string",
    );
  });
});
