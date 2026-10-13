import { describe, expect, it } from "vitest";
import { routing } from "@/i18n/routing";
import idMessages from "@/messages/id.json";
import enMessages from "@/messages/en.json";

describe("i18n routing config (FR-I18N)", () => {
  it("mendukung ID dan EN dengan ID sebagai default (FR-I18N-1)", () => {
    expect([...routing.locales]).toEqual(["id", "en"]);
    expect(routing.defaultLocale).toBe("id");
  });

  it("menghilangkan prefix locale untuk bahasa default (FR-I18N-1)", () => {
    // `localePrefix` boleh berupa string atau objek { mode, prefixes }.
    const prefix = routing.localePrefix;
    const mode = typeof prefix === "string" ? prefix : prefix?.mode;

    expect(mode).toBe("as-needed");
  });

  it("mengaktifkan deteksi locale otomatis (keputusan Opsi A)", () => {
    expect(routing.localeDetection).toBe(true);
  });
});

/** Mengumpulkan seluruh jalur key bertitik, mis. `home.title`. */
function keyPaths(value: unknown, prefix = ""): string[] {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return [prefix];
  }

  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    keyPaths(child, prefix ? `${prefix}.${key}` : key),
  );
}

function leafAt(messages: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (acc, key) => (acc as Record<string, unknown>)[key],
      messages,
    );
}

describe("paritas katalog pesan ID vs EN (FR-I18N-3)", () => {
  it("punya jalur key yang identik", () => {
    // Tanpa penjagaan ini, key yang lupa diterjemahkan hanya ketahuan saat
    // halaman dibuka — dan `Messages` yang di-augmentasi di `i18n/routing.ts`
    // membuat typecheck lolos karena katalog ID dianggap bentuk kanonik.
    expect(keyPaths(enMessages).sort()).toEqual(keyPaths(idMessages).sort());
  });

  it("tidak meninggalkan nilai kosong di kedua bahasa", () => {
    const catalogs = [
      ["id", idMessages],
      ["en", enMessages],
    ] as const;

    for (const [locale, messages] of catalogs) {
      for (const path of keyPaths(messages)) {
        const leaf = leafAt(messages, path);

        expect(typeof leaf, `${locale}:${path}`).toBe("string");
        expect((leaf as string).trim(), `${locale}:${path}`).not.toBe("");
      }
    }
  });
});
