import { defineConfig } from "vitest/config";
import path from "node:path";
import { config } from "dotenv";

// Muat .env.local untuk environment testing
config({ path: ".env.local" });

export default defineConfig({
  test: {
    environment: "node",
    env: {
      DATABASE_URL:
        process.env.DATABASE_URL ||
        "postgresql://test:test@localhost:5432/test?sslmode=require",
      AUTH_SECRET:
        process.env.AUTH_SECRET ||
        "super-secret-test-key-at-least-32-chars-long",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./"),
    },
  },
});
