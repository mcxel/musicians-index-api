'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

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
 * Fetches /api/auth/session directly rather than trusting a cached client
 * value, since role gates are exactly the kind of check that must not be
 * spoofable/stale (e.g. a Fan momentarily seeing Performer-only avatar
 * controls because of stale local state).
 *
 * Renders nothing while the role is still resolving, to avoid a flash of
 * gated content before the check completes.
 */
export default function RoleGate({ allow, children, fallback = null }: RoleGateProps) {
  const [role, setRole] = useState<PlatformRole | null | 'loading'>('loading');

  useEffect(() => {
    let active = true;
    fetch('/api/auth/session', { cache: 'no-store', credentials: 'include' })
      .then((r) => r.json())
      .then((d: { role?: string | null }) => {
        if (active) setRole((d.role as PlatformRole | undefined) ?? null);
      })
      .catch(() => {
        if (active) setRole(null);
      });
    return () => {
      active = false;
    };
  }, []);

  if (role === 'loading') return null;
  if (!role || !allow.includes(role)) return <>{fallback}</>;
  return <>{children}</>;
}
