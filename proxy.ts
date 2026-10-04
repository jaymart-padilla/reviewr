import { NextResponse, type NextRequest } from 'next/server';

import { updateSession } from '@/lib/supabase/middleware';
import { isGuestRoute, isPublicRoute } from '@/lib/supabase/auth-routes';
import { paths } from '@/lib/paths';

/**
 * copy any cookies Supabase refreshed during updateSession() onto a different
 * response (redirect, 401, ...). Without this the browser never receives the
 * new tokens and the session can end prematurely | refer: middleware.ts
 *
 * just a helper to copy refreshed cookies of supabaseResponse onto the next response (only being apply for redirection)
 */
function withSessionCookies(target: NextResponse, source: NextResponse) {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
  return target;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // refresh the session first, on every matched request
  const { supabaseResponse: response, claims } = await updateSession(request);

  // all access routes - let all users pass through
  if (isPublicRoute(pathname)) {
    return response;
  }

  // only guest routes
  if (isGuestRoute(pathname)) {
    if (!claims) return response;

    return withSessionCookies(
      NextResponse.redirect(new URL(paths.workspaces.url, request.url)),
      response
    );
  }

  // everything else requires a session/authentication
  if (claims) {
    return response;
  }

  // sends json response for unauthorized api request (instead of http redirection)
  if (pathname.startsWith('/api/')) {
    return withSessionCookies(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      response
    );
  }

  // redirect unauthorized attempts to login page
  const loginUrl = new URL(paths.auth.login.url, request.url);
  loginUrl.searchParams.set('next', `${pathname}${search}`);
  return withSessionCookies(NextResponse.redirect(loginUrl), response);
}
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static, _next/image
     * - favicon.ico
     * - common static asset extensions (images, fonts, css, js, maps, robots/sitemap, manifest)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpe?g|gif|webp|avif|ico|css|js|map|woff2?|txt|xml|json|webmanifest)$).*)',
  ],
};
