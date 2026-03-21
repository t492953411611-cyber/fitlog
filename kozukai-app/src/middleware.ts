import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'kz_session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 認証不要のパスをスキップ
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname === '/login' ||
    pathname === '/api/auth'
  ) {
    return NextResponse.next();
  }

  // セッションクッキーを確認
  const session = request.cookies.get(SESSION_COOKIE)?.value;
  const validToken = process.env.APP_SESSION_TOKEN ?? 'kozukai_default_token';

  if (session === validToken) {
    return NextResponse.next();
  }

  // 未認証 → ログイン画面へ
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
