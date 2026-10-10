import { describe, it, expect, beforeEach } from "vitest";
import {
  checkRateLimit,
  hashClientIp,
  sweepRateLimitStore,
} from "@/lib/security/rate-limit";

describe("lib/security/rate-limit", () => {
  beforeEach(() => {
    sweepRateLimitStore();
  });

  it("hashes IP consistently without exposing raw address", () => {
    const rawIp = "192.168.1.100";
    const hash1 = hashClientIp(rawIp);
    const hash2 = hashClientIp(rawIp);

    expect(hash1).toBe(hash2);
    expect(hash1).not.toContain(rawIp);
    expect(hash1.length).toBe(64);
  });

  it("allows requests within quota and blocks when limit exceeded", () => {
    const key = "test-client-1";
    const limit = 3;
    const windowMs = 5000;

    expect(checkRateLimit(key, limit, windowMs).allowed).toBe(true);
    expect(checkRateLimit(key, limit, windowMs).allowed).toBe(true);
    expect(checkRateLimit(key, limit, windowMs).allowed).toBe(true);

    const blocked = checkRateLimit(key, limit, windowMs);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });
});
