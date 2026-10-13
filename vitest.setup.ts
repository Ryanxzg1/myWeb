import { vi } from "vitest";

/**
 * Penjaga I/O untuk seluruh suite.
 *
 * `DATABASE_URL` di `vitest.config.mts` menunjuk host yang tidak ada. Tanpa
 * penjagaan ini, satu panggilan Prisma yang tidak sengaja akan menggantung
 * sampai `testTimeout` dan membuat suite flaky — persis yang terjadi pada
 * Fase 4 di `app/api/auth/auth-routes.test.ts`.
 *
 * Mock ini mengubahnya menjadi kegagalan instan yang menyebut penyebabnya.
 * Test yang memang perlu menguji jalur database harus meng-mock modul
 * pemanggilnya (mis. `vi.spyOn(authService, "cleanupExpiredCodes")`), bukan
 * membuka koneksi sungguhan.
 */
vi.mock("@/lib/db", () => ({
  prisma: new Proxy(
    {},
    {
      get(_target, property) {
        throw new Error(
          `Prisma diakses di dalam test (properti: ${String(property)}). ` +
            "Mock modul pemanggilnya; jangan memakai database sungguhan.",
        );
      },
    },
  ),
}));
