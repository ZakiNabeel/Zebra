/**
 * Parent PIN hashing for local mode. This is a parental gate (keep kids out),
 * not account security — real authentication arrives with Supabase Auth.
 * Works in browsers and Node 20+ (globalThis.crypto).
 */

export const PIN_LENGTH = 4;

export function isValidPin(pin: string): boolean {
  return new RegExp(`^\\d{${PIN_LENGTH}}$`).test(pin);
}

export function makeSalt(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return toHex(bytes);
}

export async function hashPin(pin: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`zebra:${salt}:${pin}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(new Uint8Array(digest));
}

export async function verifyPin(pin: string, salt: string, expectedHash: string): Promise<boolean> {
  if (!isValidPin(pin)) return false;
  const hash = await hashPin(pin, salt);
  return timingSafeEqualHex(hash, expectedHash);
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
