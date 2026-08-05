import { SignJWT, jwtVerify } from 'jose';

// Edge-compatible (uses `jose`, not `crypto`) — safe to import from middleware.ts.

export const ADMIN_COOKIE_NAME = 'bas_admin_session';
export const ADMIN_SESSION_SECONDS = 60 * 60 * 8; // 8 hours

function getSecretKey(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      'ADMIN_SESSION_SECRET is not set (or too short). Set a long random string in your environment variables.'
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signAdminSession(username: string): Promise<string> {
  return await new SignJWT({ username, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_SESSION_SECONDS}s`)
    .sign(getSecretKey());
}

export interface AdminSessionPayload {
  username: string;
  role: string;
}

/** Returns the decoded session payload, or null if missing/invalid/expired. */
export async function verifyAdminSession(token: string | undefined | null): Promise<AdminSessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (payload.role !== 'admin' || typeof payload.username !== 'string') return null;
    return { username: payload.username, role: payload.role };
  } catch {
    return null;
  }
}
