import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const KEY_LEN = 64;

/** Format: `scrypt$<saltHex>$<hashHex>`. Pakai scrypt stdlib (tanpa dependency). */
export async function hashPassword(password: string): Promise<string> {
  if (!password || typeof password !== "string") {
    throw new Error("Password must be a non-empty string");
  }

  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, KEY_LEN)) as Buffer;
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  // Guard terhadap input falsy atau malformed agar tidak memicu unhandled TypeError
  if (
    !password ||
    typeof password !== "string" ||
    !stored ||
    typeof stored !== "string"
  ) {
    return false;
  }

  const parts = stored.split("$");
  if (parts.length !== 3) return false;

  const [scheme, salt, hash] = parts;
  if (scheme !== "scrypt" || !salt || !hash || hash.length !== KEY_LEN * 2) {
    return false;
  }

  const derived = (await scryptAsync(password, salt, KEY_LEN)) as Buffer;
  const expected = Buffer.from(hash, "hex");
  return (
    expected.length === derived.length && timingSafeEqual(expected, derived)
  );
}
