import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/password';
import { signAdminSession, ADMIN_COOKIE_NAME, ADMIN_SESSION_SECONDS } from '@/lib/admin-auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = checkRateLimit(`admin-login:${ip}`, 8, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many login attempts. Please try again in a few minutes.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    const expectedUsername = process.env.ADMIN_USERNAME || 'Admin';
    const passwordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!passwordHash) {
      console.error('ADMIN_PASSWORD_HASH is not configured.');
      return NextResponse.json({ success: false, error: 'Server misconfigured.' }, { status: 500 });
    }

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Username and password are required.' }, { status: 400 });
    }

    const validUsername = username === expectedUsername;
    const validPassword = verifyPassword(password, passwordHash);

    if (!validUsername || !validPassword) {
      return NextResponse.json({ success: false, error: 'Invalid username or password.' }, { status: 401 });
    }

    const token = await signAdminSession(expectedUsername);
    const res = NextResponse.json({ success: true });
    res.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ADMIN_SESSION_SECONDS,
    });
    return res;
  } catch (err) {
    console.error('Admin login error:', err);
    return NextResponse.json({ success: false, error: 'Something went wrong.' }, { status: 500 });
  }
}
