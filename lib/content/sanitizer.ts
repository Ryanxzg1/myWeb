import DOMPurify from "isomorphic-dompurify";
import { revalidateTag } from "next/cache";

const ALLOWED_TAGS = [
  "p",
  "br",
  "b",
  "i",
  "strong",
  "em",
  "u",
  "s",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "a",
  "blockquote",
  "code",
  "pre",
  "hr",
  "span",
];

const ALLOWED_ATTR = ["href", "target", "rel", "title", "class"];

/**
 * Mensanitasi konten HTML rich text sebelum disimpan ke database (FR-ADM-12).
 * Alasan: Mencegah serangan Stored XSS dari input rich editor admin.
 */
export function sanitizeRichText(dirtyHtml: string): string {
  if (!dirtyHtml || typeof dirtyHtml !== "string") return "";

  return DOMPurify.sanitize(dirtyHtml, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ["target"], // izinkan target="_blank" untuk link eksternal
  });
}

/**
 * Memicu invalidasi on-demand cache ISR saat konten berubah (FR-ADM-10).
 * Menggunakan "max" profile sesuai konvensi Cache Components Next.js 16.
 */
export function triggerContentRevalidation(tag = "portfolio-content") {
  try {
    revalidateTag(tag, "max");
  } catch (err) {
    // Pada context unit testing atau non-request environment, revalidateTag dapat diabaikan
    if (process.env.NODE_ENV !== "test") {
      console.warn(`[CACHE REVALIDATION WARN] Failed to revalidate tag '${tag}':`, err);
    }
  }
}
