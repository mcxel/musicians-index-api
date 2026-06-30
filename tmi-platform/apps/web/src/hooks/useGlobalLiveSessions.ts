'use client';

import { useEffect, useState } from 'react';
import {
  getActiveSessions,
  onSessionsChanged,
  type LiveSession,
  type StreamCategory,
} from '@/lib/broadcast/GlobalLiveSessionRegistry';

/**
 * Real-time subscription to live sessions from GlobalLiveSessionRegistry.
 * Automatically syncs when sessions change (Go Live, End Stream, etc).
 *
 * @param category - optional filter to a specific category (battle/cypher/concert/etc)
 * @returns live sessions, updated in real-time
 */
export function useGlobalLiveSessions(category?: StreamCategory): LiveSession[] {
  const [sessions, setSessions] = useState<LiveSession[]>(() => {
    const active = getActiveSessions();
    return category ? active.filter((s) => s.category === category) : active;
  });

  useEffect(() => {
    const unsubscribe = onSessionsChanged((allSessions) => {
      const filtered = category ? allSessions.filter((s) => s.category === category) : allSessions;
      setSessions(filtered);
    });
    return () => unsubscribe();
  }, [category]);

  return sessions;
}
