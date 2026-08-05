import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';

// Node-only (uses `crypto` scrypt) — do NOT import this from middleware.ts
// (edge runtime). Only the login API route needs it.

const KEY_LENGTH = 64;

/** Hash a plaintext password into a `salt:hash` string suitable for storing in an env var. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, KEY_LENGTH).toString('hex');
  return `${salt}:${hash}`;
}

/** Verify a plaintext password against a `salt:hash` string, in constant time. */
export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = (stored || '').split(':');
  if (!salt || !hash) return false;

  try {
    const hashBuffer = Buffer.from(hash, 'hex');
    const suppliedBuffer = scryptSync(password, salt, KEY_LENGTH);
    if (hashBuffer.length !== suppliedBuffer.length) return false;
    return timingSafeEqual(hashBuffer, suppliedBuffer);
  } catch {
    return false;
  }
}
