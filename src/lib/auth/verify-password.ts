import bcrypt from "bcryptjs";

const ITERATIONS = 100_000;
const KEY_LENGTH = 32;

function toBase64Url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(value.length + ((4 - (value.length % 4)) % 4), "=");
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

async function deriveFindyPassword(
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    keyMaterial,
    KEY_LENGTH * 8,
  );
  return new Uint8Array(bits);
}

/** Matches findy-core PBKDF2 format: `{iterations}${salt}${hash}` */
async function verifyFindyPassword(password: string, stored: string): Promise<boolean> {
  const [iterationsRaw, saltB64, hashB64] = stored.split("$");
  const iterations = Number(iterationsRaw);
  if (!iterations || !saltB64 || !hashB64) return false;

  const salt = fromBase64Url(saltB64);
  const expected = fromBase64Url(hashB64);
  const derived = await deriveFindyPassword(password, salt, iterations);
  if (derived.length !== expected.length) return false;

  let diff = 0;
  for (let i = 0; i < derived.length; i++) diff |= derived[i] ^ expected[i];
  return diff === 0;
}

/** Shared DB: frontend legacy bcrypt + findy-core PBKDF2 hashes. */
export async function verifyUserPassword(
  password: string,
  stored: string | null | undefined,
): Promise<boolean> {
  if (!stored) return false;
  if (stored.startsWith("$2")) {
    return bcrypt.compare(password, stored);
  }
  return verifyFindyPassword(password, stored);
}
