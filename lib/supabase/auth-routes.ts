import { paths } from '@/lib/paths';

export const PUBLIC_ROUTES: string[] = [paths.home.url, '/auth/confirm', paths.auth.error.url];
export const GUEST_ROUTES = [
  paths.auth.login.url,
  paths.auth.signup.url,
  paths.auth.forgotPassword.url,
];

export function isPublicRoute(pathname: string) {
  const normalizedPath = pathname.toLowerCase();
  const normalizedPublicRoutes = PUBLIC_ROUTES.map((route) => route.toLowerCase());

  if (normalizedPublicRoutes.includes(normalizedPath)) return true;

  // if (normalizedPath.startsWith('/public/')) return true;

  return false;
}

export function isGuestRoute(pathname: string) {
  const normalizedPath = pathname.toLowerCase();
  const normalizedPublicRoutes = GUEST_ROUTES.map((route) => route.toLowerCase());

  return normalizedPublicRoutes.some((route) => normalizedPath.startsWith(route));
}
