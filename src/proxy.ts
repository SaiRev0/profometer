import { type NextRequest, NextResponse } from 'next/server';

import { getToken } from 'next-auth/jwt';

export default async function proxy(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Check if user is authenticated
  if (!token) {
    return NextResponse.redirect(new URL(`/signin?error=Unauthorized`, request.nextUrl));
  }

  // Check if authenticated user needs to set up their username
  // usernameSetAt being null means the user hasn't finalized their username yet
  const needsUsernameSetup = !token.usernameSetAt;

  // If user needs username setup and is not already on the setup page
  if (needsUsernameSetup && pathname !== '/setup-username') {
    // Allow API calls for username generation/confirmation
    if (pathname.startsWith('/api/username/')) {
      return NextResponse.next();
    }
    // Redirect to username setup page
    return NextResponse.redirect(new URL('/setup-username', request.nextUrl));
  }

  // If user has already set up username but is trying to access setup page, redirect to home
  if (!needsUsernameSetup && pathname === '/setup-username') {
    return NextResponse.redirect(new URL('/', request.nextUrl));
  }

  return NextResponse.next();
}

// Configure which routes the proxy should run on
export const config = {
  matcher: [
    // Protected API routes
    '/api/courses/create',
    '/api/profile',
    '/api/review/create',
    '/api/review/delete/:path*',
    '/api/review/edit',
    '/api/review/report',
    '/api/review/vote',
    '/api/comment/create',
    '/api/comment/vote',
    '/api/comment/delete/:path*',
    '/api/comment/edit',
    '/api/comment/report',
    '/api/username/:path*',
    // Protected pages
    '/profile',
    '/setup-username'
  ]
};
