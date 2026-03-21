import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'kz_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30日間

export async function POST(request: NextRequest) {
  const { pin } = await request.json();

  const correctPin  = process.env.APP_PIN           ?? '1234';
  const sessionToken = process.env.APP_SESSION_TOKEN ?? 'kozukai_default_token';

  if (pin !== correctPin) {
    return NextResponse.json({ error: 'PINが違います' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
