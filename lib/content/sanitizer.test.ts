import { describe, it, expect } from "vitest";
import { sanitizeRichText } from "@/lib/content/sanitizer";

describe("lib/content/sanitizer", () => {
  it("preserves safe html tags and formatting", () => {
    const safeHtml =
      "<h2>Judul Proyek</h2><p>Deskripsi dengan <strong>tebal</strong> dan <em>miring</em>.</p>";
    expect(sanitizeRichText(safeHtml)).toBe(safeHtml);
  });

  it("strips malicious script tags and inline event handlers", () => {
    const malicious =
      '<p>Halo</p><script>alert("hacked")</script><img src="x" onerror="alert(1)" /><button onclick="evil()">Click</button>';
    const cleaned = sanitizeRichText(malicious);

    expect(cleaned).not.toContain("<script>");
    expect(cleaned).not.toContain("alert");
    expect(cleaned).not.toContain("onerror");
    expect(cleaned).not.toContain("onclick");
    expect(cleaned).toContain("<p>Halo</p>");
  });

  it("strips javascript: pseudo-protocol in links", () => {
    const maliciousLink = '<a href="javascript:alert(1)">Link Bahaya</a>';
    const cleaned = sanitizeRichText(maliciousLink);

    expect(cleaned).not.toContain("javascript:");
  });

  it("handles non-string or falsy input gracefully", () => {
    // @ts-expect-error test runtime robustness
    expect(sanitizeRichText(null)).toBe("");
    expect(sanitizeRichText("")).toBe("");
  });
});
