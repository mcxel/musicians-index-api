/**
 * Open Match / Cypher recruitment — GlobalLiveSessionRegistry clients only.
 */

import type { LiveSession, StreamCategory } from "@/lib/broadcast/globalLiveSessionStore";
import { getActiveSessions } from "@/lib/broadcast/GlobalLiveSessionRegistry";

const OPEN_MATCH_CATEGORIES: StreamCategory[] = ["battle", "cypher", "challenge"];

export function getOpenMatchLiveSessions(): LiveSession[] {
  const sessions = getActiveSessions();
  return sessions.filter(
    (s) =>
      OPEN_MATCH_CATEGORIES.includes(s.category) &&
      s.stageState === "live" &&
      s.privacy === "PUBLIC",
  );
}

export function pickPrimaryOpenMatchSession(sessions: LiveSession[]): LiveSession | null {
  if (sessions.length === 0) return null;
  return [...sessions].sort((a, b) => b.viewerCount - a.viewerCount)[0] ?? null;
}

export function openMatchRoomHref(session: LiveSession): string {
  return `/live/rooms/${encodeURIComponent(session.roomId)}`;
}
