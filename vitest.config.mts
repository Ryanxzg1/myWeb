import { defineConfig } from "vitest/config";
import path from "node:path";
import { config } from "dotenv";

// Muat .env.local untuk environment testing
config({ path: ".env.local" });

export default defineConfig({
  test: {
    environment: "node",
    // Menjaga test agar tidak pernah menyentuh database sungguhan.
    setupFiles: ["./vitest.setup.ts"],
    env: {
      DATABASE_URL:
        process.env.DATABASE_URL ||
        "postgresql://test:test@localhost:5432/test?sslmode=require",
      AUTH_SECRET:
        process.env.AUTH_SECRET ||
        "super-secret-test-key-at-least-32-chars-long",
    },
    server: {
      deps: {
        // next-intl dikirim sebagai ESM yang mengimpor `next/server` tanpa
        // ekstensi. Node tidak bisa me-resolve-nya karena paket `next` tidak
        // punya exports map. Inline agar Vite yang menangani resolusi.
        inline: [/next-intl/, /use-intl/],
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./"),
      "next/server": path.resolve(
        import.meta.dirname,
        "node_modules/next/server.js",
      ),
    },
  },
});
