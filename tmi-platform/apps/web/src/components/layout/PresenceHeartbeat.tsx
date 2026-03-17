// tmi-platform/apps/web/src/components/layout/PresenceHeartbeat.tsx
'use client';

import { useSession } from 'next-auth/react';
import { usePresence } from '../../hooks/use-presence';

/**
 * This client component activates the presence heartbeat when a user session is active.
 * It should be placed in the root layout to ensure it's always mounted.
 */
export function PresenceHeartbeat() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  // The usePresence hook handles the interval logic.
  // We just need to tell it whether to be active or not.
  usePresence(isAuthenticated);

  // This component renders nothing to the DOM.
  return null;
}
