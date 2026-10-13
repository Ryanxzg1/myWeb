import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { config, proxy } from "@/proxy";
import {
  ADMIN_BASE,
  ADMIN_LOGIN_PATH,
  isAdminLoginPath,
  isAdminPath,
  isSafeNextPath,
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

  it("tidak membebaskan subtree di bawah halaman login", () => {
    expect(isAdminLoginPath(`${ADMIN_LOGIN_PATH}/reset`)).toBe(false);
    expect(isAdminLoginPath(`${ADMIN_LOGIN_PATH}/x`)).toBe(false);
  });
});

describe("lib/auth/admin-path — validasi parameter ?next=", () => {
  it("menerima path internal absolut", () => {
    expect(isSafeNextPath(ADMIN_BASE)).toBe(true);
    expect(isSafeNextPath(`${ADMIN_BASE}/projects?page=2`)).toBe(true);
  });

  it("menolak target yang keluar dari situs", () => {
    expect(isSafeNextPath("https://jahat.example")).toBe(false);
    expect(isSafeNextPath("//jahat.example")).toBe(false);
    expect(isSafeNextPath("/\\jahat.example")).toBe(false);
    expect(isSafeNextPath("/admin\nLocation: https://jahat.example")).toBe(
      false,
    );
  });

  it("menolak nilai kosong atau path relatif", () => {
    expect(isSafeNextPath(undefined)).toBe(false);
    expect(isSafeNextPath(null)).toBe(false);
    expect(isSafeNextPath("")).toBe(false);
    expect(isSafeNextPath("admin")).toBe(false);
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

  it("matcher admin tidak memakai pengecualian path bertitik", () => {
    // Pola admin adalah path-to-regexp (`:path*`), bukan regex mentah. Yang
    // penting: ia tidak lagi memakai pengecualian `.*\..*` yang dulu membuat
    // `/admin/x.y` dilewati proxy dan berakhir 404.
    const [adminMatcher, i18nMatcher] = config.matcher;

    expect(adminMatcher).not.toContain("\\.");
    expect(i18nMatcher).toContain(".*\\..*");
  });

  it("guard admin tetap berlaku pada path bertitik", () => {
    expect(proxy(requestTo(`${ADMIN_BASE}/x.y`)).status).toBe(307);
    expect(proxy(requestTo(`${ADMIN_BASE}/projects/my.project`)).status).toBe(
      307,
    );
  });

  it("matcher i18n melewati API, aset internal, dan admin", () => {
    const [, i18nMatcher] = config.matcher;
    const re = new RegExp(`^${i18nMatcher}$`);

    expect(re.test("/api/contact")).toBe(false);
    expect(re.test("/_next/static/chunk.js")).toBe(false);
    expect(re.test("/favicon.ico")).toBe(false);
    // Admin sudah ditangani pola pertama; jangan diproses dua kali.
    expect(re.test(ADMIN_BASE)).toBe(false);

    expect(re.test("/")).toBe(true);
    expect(re.test("/en/projects")).toBe(true);
  });
});

describe("proxy — variasi cache locale", () => {
  it("menandai path tanpa prefix locale sebagai tidak cacheable", () => {
    const res = proxy(requestTo("/"));

    expect(res.headers.get("cache-control")).toBe("private, no-store");
  });

  it("membiarkan path berprefix locale tetap cacheable", () => {
    const res = proxy(requestTo("/en/projects"));

    expect(res.headers.get("cache-control") ?? "").not.toContain("no-store");
  });
});
