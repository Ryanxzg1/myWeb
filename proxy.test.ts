import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { config, proxy } from "@/proxy";
import {
  ADMIN_BASE,
  ADMIN_LOGIN_PATH,
  isAdminLoginPath,
  isAdminPath,
} from "@/lib/auth/admin-path";
import { SESSION_COOKIE_NAME, createSessionToken } from "@/lib/auth/session";

const OTHER_SECRET = "another-secret-that-is-definitely-32-chars";

function requestTo(path: string, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers["cookie"] = `${SESSION_COOKIE_NAME}=${token}`;
  return new NextRequest(`http://localhost:3000${path}`, { headers });
}

describe("lib/auth/admin-path", () => {
  it("mengenali base admin dan sub-path-nya", () => {
    expect(isAdminPath(ADMIN_BASE)).toBe(true);
    expect(isAdminPath(`${ADMIN_BASE}/projects`)).toBe(true);
  });

  it("tidak salah mengenali path yang hanya berawalan sama", () => {
    expect(isAdminPath("/administrasi")).toBe(false);
    expect(isAdminPath("/")).toBe(false);
  });

  it("mengenali halaman login sebagai bagian dari admin", () => {
    expect(isAdminLoginPath(ADMIN_LOGIN_PATH)).toBe(true);
    expect(isAdminPath(ADMIN_LOGIN_PATH)).toBe(true);
    expect(isAdminLoginPath(ADMIN_BASE)).toBe(false);
  });
});

describe("proxy — guard admin", () => {
  it("mengalihkan ke login saat cookie sesi tidak ada", () => {
    const res = proxy(requestTo(ADMIN_BASE));

    expect(res.status).toBe(307);
    const location = new URL(res.headers.get("location") ?? "");
    expect(location.pathname).toBe(ADMIN_LOGIN_PATH);
    expect(location.searchParams.get("next")).toBe(ADMIN_BASE);
  });

  it("mengalihkan ke login saat token tidak berformat benar", () => {
    expect(proxy(requestTo(ADMIN_BASE, "not-a-valid-token")).status).toBe(307);
  });

  it("mengalihkan ke login saat tanda tangan token tidak cocok", () => {
    const forged = createSessionToken(
      { userId: "u1", email: "admin@example.com" },
      OTHER_SECRET,
    );

    expect(proxy(requestTo(ADMIN_BASE, forged)).status).toBe(307);
  });

  it("meloloskan request saat token sesi valid", () => {
    const valid = createSessionToken({
      userId: "u1",
      email: "admin@example.com",
    });

    expect(proxy(requestTo(ADMIN_BASE, valid)).status).toBe(200);
  });

  it("membiarkan halaman login diakses tanpa sesi", () => {
    expect(proxy(requestTo(ADMIN_LOGIN_PATH)).status).toBe(200);
  });

  it("tidak melempar 500 saat AUTH_SECRET tidak valid (regresi)", () => {
    const original = process.env.AUTH_SECRET;
    process.env.AUTH_SECRET = "too-short";

    try {
      // `verifySessionToken` melempar karena AUTH_SECRET tidak memenuhi syarat.
      // Proxy harus menelannya dan tetap mengalihkan ke login, bukan crash.
      expect(proxy(requestTo(ADMIN_BASE, "whatever")).status).toBe(307);
    } finally {
      process.env.AUTH_SECRET = original;
    }
  });
});

describe("proxy — delegasi ke i18n routing", () => {
  it("menyerahkan path non-admin ke middleware next-intl", () => {
    // next-intl membalas 200 dengan rewrite internal untuk /en/projects.
    expect(proxy(requestTo("/en/projects")).status).toBe(200);
  });

  it("matcher melewati API, aset internal, dan path berisi titik", () => {
    const [matcher] = config.matcher;
    const re = new RegExp(`^${matcher}$`);

    expect(re.test("/api/contact")).toBe(false);
    expect(re.test("/_next/static/chunk.js")).toBe(false);
    expect(re.test("/favicon.ico")).toBe(false);

    expect(re.test("/")).toBe(true);
    expect(re.test(ADMIN_BASE)).toBe(true);
  });
});
