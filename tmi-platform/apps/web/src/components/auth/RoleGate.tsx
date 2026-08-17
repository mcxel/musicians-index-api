'use client';

import type { ReactNode } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';

// Mirrors packages/db/prisma/schema.prisma's Role enum. Deliberately not
// importing the separate lib/auth/roles.ts TMIRole type — that's a legacy,
// narrower permission-matrix type (uses "MEMBER" instead of "FAN", has no
// BAND/WRITER/PROMOTER/JUDGE) that doesn't match what's actually stored on
// the session/cookie. /api/auth/session's `role` field returns the real
// Prisma enum value, so RoleGate checks against that directly.
export type PlatformRole =
  | 'USER' | 'FAN' | 'ARTIST' | 'PERFORMER' | 'BAND'
  | 'SPONSOR' | 'ADVERTISER' | 'VENUE' | 'WRITER'
  | 'PROMOTER' | 'STAFF' | 'ADMIN' | 'JUDGE';

interface RoleGateProps {
  allow: PlatformRole[];
  children: ReactNode;
  /** Rendered while role is unresolved or the user doesn't match `allow`. Defaults to nothing. */
  fallback?: ReactNode;
}

/**
 * Conditionally renders children based on the signed-in user's role.
 * Reads the canonical useAuth() session (single shared fetch/cache backed
 * by /api/auth/session — see lib/hooks/useAuth.ts) rather than running its
 * own independent fetch. Role gates are exactly the kind of check that must
 * not be spoofable/stale, and a second, uncoordinated auth-adjacent fetch
 * here was itself a source of divergence from whatever the rest of the
 * shell already resolved (see the Canister Canonical Auth Hydration Fix).
 *
 * Renders nothing while the role is still resolving, to avoid a flash of
 * gated content before the check completes.
 */
export default function RoleGate({ allow, children, fallback = null }: RoleGateProps) {
  const { isLoading, role } = useAuth();

  if (isLoading) return null;
  if (!role || !allow.includes(role as PlatformRole)) return <>{fallback}</>;
  return <>{children}</>;
}
