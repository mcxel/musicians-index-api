'use client';

/**
 * WatchSessionContext — P0 of the Universal Presence System (locked
 * 2026-06-19 by Marcel Dickens): "the user should never feel like they left
 * the world." Tracks which live room a fan/performer is currently attending
 * so that opening a hub panel (messages, inventory, avatar builder...) never
 * drops them out of the room — it minimizes into a persistent mini player
 * instead.
 *
 * Scope note: this tracks ROOM identity + minimized state, persisted across
 * navigation and reloads via localStorage. It does NOT yet restore exact
 * seat position or camera angle inside AudienceScene — that needs the seat
 * assignment in UniversalLobbyEntry/AudienceScene lifted into shared state,
 * which is a separate follow-on, not done here.
 */

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export interface WatchSession {
  roomId: string;
  title: string;
  accentColor: string;
  viewers: number;
  venueIndex?: number;
  /** Real seat assigned via assignNextSeat()/the /api/live/audience join action — never fabricated. */
  seatId?: string;
}

interface WatchSessionState {
  current: WatchSession | null;
  minimized: boolean;
  recentRooms: WatchSession[];
  startWatching: (session: WatchSession) => void;
  stopWatching: () => void;
  minimize: () => void;
  restore: () => void;
}

const STORAGE_KEY = 'tmi_watch_session';
const RECENT_KEY = 'tmi_recent_rooms';
const MAX_RECENT = 8;

const WatchSessionCtx = createContext<WatchSessionState | null>(null);

export function WatchSessionProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<WatchSession | null>(null);
  const [minimized, setMinimized] = useState(false);
  const [recentRooms, setRecentRooms] = useState<WatchSession[]>([]);

  // Hydrate from localStorage once on mount (survives a page reload).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { session: WatchSession; minimized: boolean };
        setCurrent(parsed.session);
        setMinimized(parsed.minimized);
      }
      const rawRecent = window.localStorage.getItem(RECENT_KEY);
      if (rawRecent) setRecentRooms(JSON.parse(rawRecent) as WatchSession[]);
    } catch { /* corrupt/missing storage — start fresh */ }
  }, []);

  const persist = useCallback((session: WatchSession | null, min: boolean) => {
    try {
      if (session) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ session, minimized: min }));
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch { /* storage unavailable — in-memory state still works for this tab */ }
  }, []);

  const startWatching = useCallback((session: WatchSession) => {
    setCurrent(session);
    setMinimized(false);
    persist(session, false);
    setRecentRooms((prev) => {
      const next = [session, ...prev.filter((r) => r.roomId !== session.roomId)].slice(0, MAX_RECENT);
      try { window.localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch { /* storage unavailable */ }
      return next;
    });
  }, [persist]);

  const stopWatching = useCallback(() => {
    setCurrent(null);
    setMinimized(false);
    persist(null, false);
  }, [persist]);

  const minimize = useCallback(() => {
    setMinimized(true);
    setCurrent((cur) => { persist(cur, true); return cur; });
  }, [persist]);

  const restore = useCallback(() => {
    setMinimized(false);
    setCurrent((cur) => { persist(cur, false); return cur; });
  }, [persist]);

  return (
    <WatchSessionCtx.Provider value={{ current, minimized, recentRooms, startWatching, stopWatching, minimize, restore }}>
      {children}
    </WatchSessionCtx.Provider>
  );
}

export function useWatchSession(): WatchSessionState {
  const ctx = useContext(WatchSessionCtx);
  if (!ctx) {
    // Never throw for a missing provider — presence is an enhancement, not
    // a hard dependency. Callers get a harmless no-op session.
    return { current: null, minimized: false, recentRooms: [], startWatching: () => {}, stopWatching: () => {}, minimize: () => {}, restore: () => {} };
  }
  return ctx;
}
