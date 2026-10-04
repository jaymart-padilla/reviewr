'use client';

import { createContext, useContext } from 'react';
import type { UserProfile } from '@/lib/auth/get-user';

const AuthContext = createContext<UserProfile | undefined>(undefined);

/**
 * Provides auth state to any client component subtree.
 * Hydrate this once at a layout boundary with data fetched server-side.
 *
 * Usage:
 *   // In a Server Component layout:
 *   const user = await getUser();
 *   <AuthProvider user={user}>{children}</AuthProvider>
 */
export function AuthProvider({
  user,
  children,
}: {
  user: UserProfile;
  children: React.ReactNode;
}) {
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

/**
 * Returns the current user profile inside any Client Component.
 * Must be used inside an <AuthProvider>.
 *
 * Usage:
 *   const user = useAuth();
 *   if (!user) // unauthenticated
 */
export function useAuth(): UserProfile {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth() must be used within an <AuthProvider>');
  }
  return ctx;
}
