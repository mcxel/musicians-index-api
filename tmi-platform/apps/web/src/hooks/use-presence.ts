// tmi-platform/apps/web/src/hooks/use-presence.ts
'use client';

import { useEffect } from 'react';

const HEARTBEAT_INTERVAL_MS = 30000; // 30 seconds

async function sendHeartbeat() {
  try {
    // In a real app, the CSRF token would be handled by a shared fetch instance.
    // For this example, we assume it's handled or not required for this endpoint.
    await fetch('/api/presence/heartbeat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.warn('Presence heartbeat failed:', error);
  }
}

/**
 * This hook is responsible for sending periodic heartbeats to the backend
 * to signal that the user is active.
 *
 * It should be used once in a global layout component for a logged-in user.
 *
 * @param isEnabled - A boolean to control whether the heartbeat is active.
 *                    This should be true only if a user is authenticated.
 */
export function usePresence(isEnabled: boolean) {
  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    // Send the first heartbeat immediately on mount
    sendHeartbeat();

    const intervalId = setInterval(() => {
      sendHeartbeat();
    }, HEARTBEAT_INTERVAL_MS);

    // Clear the interval when the component unmounts or the user logs out
    return () => {
      clearInterval(intervalId);
    };
  }, [isEnabled]);
}
