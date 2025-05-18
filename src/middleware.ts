import { type NextRequest, NextResponse } from 'next/server';

import { getToken } from 'next-auth/jwt';

export { default } from 'next-auth/middleware';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });

  if (!token) {
    return NextResponse.redirect(new URL(`/signin?error=Unauthorized`, request.nextUrl));
  }

  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: ['/api/courses/create', '/api/review/create', '/api/profile', '/profile']
};
