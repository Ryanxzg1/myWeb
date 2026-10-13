import { describe, expect, it } from "vitest";

/**
 * Memverifikasi bahwa penjaga di `vitest.setup.ts` benar-benar aktif.
 *
 * Kalau mock-nya berhenti berlaku (mis. `setupFiles` terhapus dari
 * `vitest.config.mts`), test ini gagal — dan tanpa sinyal ini, suite lain
 * kembali bisa menggantung menunggu koneksi database.
 */
describe("penjaga test: akses database", () => {
  it("melempar error instan saat Prisma diakses", async () => {
    const { prisma } = await import("@/lib/db");

    expect(() => (prisma as unknown as { user: unknown }).user).toThrow(
      /Prisma diakses di dalam test/,
    );
  });
});
