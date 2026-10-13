import { describe, expect, it } from "vitest";
import { routing } from "@/i18n/routing";

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
