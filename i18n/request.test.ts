import { describe, expect, it, vi } from "vitest";
import { resolveMessages } from "@/i18n/request";

// `next/root-params` butuh konteks request Next.js, dan `next/navigation`
// melempar error internalnya sendiri saat `notFound()`. Keduanya diganti stub
// supaya `resolveMessages` bisa diuji sebagai fungsi murni.
vi.mock("next/root-params", () => ({
  locale: async () => "id",
}));

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

const NOT_FOUND = /NEXT_NOT_FOUND/;

describe("i18n/request — resolveMessages", () => {
  it("memuat pesan untuk locale yang didukung", async () => {
    const id = await resolveMessages("id");
    const en = await resolveMessages("en");

    expect(id.locale).toBe("id");
    expect(en.locale).toBe("en");
    expect(id.messages.metadata.title).toBe("Portofolio");
    expect(en.messages.metadata.title).toBe("Portfolio");
  });

  it("menolak locale yang tidak didukung dengan notFound()", async () => {
    await expect(resolveMessages("xx")).rejects.toThrow(NOT_FOUND);
    await expect(resolveMessages("apa-saja")).rejects.toThrow(NOT_FOUND);
    // Route di luar segmen `[locale]` (mis. admin) tidak punya root param.
    await expect(resolveMessages(undefined)).rejects.toThrow(NOT_FOUND);
    await expect(resolveMessages(null)).rejects.toThrow(NOT_FOUND);
    await expect(resolveMessages(123)).rejects.toThrow(NOT_FOUND);
  });

  it("tidak pernah mengevaluasi import() untuk nilai berbahaya", async () => {
    // Kalau validasi bocor, nilai ini akan dipakai menyusun specifier import().
    await expect(resolveMessages("../../etc/passwd")).rejects.toThrow(NOT_FOUND);
    await expect(resolveMessages("..\\..\\windows\\win.ini")).rejects.toThrow(
      NOT_FOUND,
    );
  });
});
