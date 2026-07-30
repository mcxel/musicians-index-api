"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getLobbyPropDef } from "./LobbyPropRegistry";

const SYNC_INTERVAL_MS = 1500;

export interface LobbyParticipant {
  userId: string;
  userName: string;
  emoji: string;
  x: number;
  y: number;
  propTrigger: string;
  activeTheme: string;
  isSpeaking: boolean;
  hasCameraOn: boolean;
}

interface UseLobbyPresenceSyncArgs {
  roomId: string;
  userId: string;
  userName: string;
  emoji: string;
  theme: string;
}

/**
 * Polling bridge to /api/rooms/lobby-sync (Postgres-backed - no WebSocket
 * transport exists in this stack). Local state renders instantly on press;
 * the network round-trip only decides when OTHER clients see it, honestly
 * bounded by this interval, not pretended to be push-instant.
 */
export function useLobbyPresenceSync({ roomId, userId, userName, emoji, theme }: UseLobbyPresenceSyncArgs) {
  const [position, setPosition] = useState({ x: 50, y: 70 });
  const [propTrigger, setPropTrigger] = useState("none");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasCameraOn, setHasCameraOn] = useState(false);
  const [participants, setParticipants] = useState<LobbyParticipant[]>([]);

  const latest = useRef({ position, propTrigger, isSpeaking, hasCameraOn, theme });
  latest.current = { position, propTrigger, isSpeaking, hasCameraOn, theme };

  const propClearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sync = useCallback(async () => {
    try {
      const { position, propTrigger, isSpeaking, hasCameraOn, theme } = latest.current;
      const res = await fetch("/api/rooms/lobby-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          userId,
          userName,
          emoji,
          x: position.x,
          y: position.y,
          propTrigger,
          theme,
          isSpeaking,
          hasCameraOn,
        }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.participants)) {
        setParticipants(data.participants.filter((p: LobbyParticipant) => p.userId !== userId));
      }
    } catch {
      // Best-effort - next interval tick retries. No fabricated fallback state.
    }
  }, [roomId, userId, userName, emoji]);

  useEffect(() => {
    sync();
    const id = setInterval(sync, SYNC_INTERVAL_MS);
    return () => clearInterval(id);
  }, [sync]);

  const move = useCallback((x: number, y: number) => {
    setPosition({ x: Math.max(4, Math.min(96, x)), y: Math.max(10, Math.min(92, y)) });
  }, []);

  /** Instant local trigger + immediate sync push, self-clears after the prop's duration. */
  const triggerProp = useCallback((propId: string) => {
    const def = getLobbyPropDef(propId);
    if (!def) return;

    if (propClearTimer.current) clearTimeout(propClearTimer.current);
    setPropTrigger(propId);
    // Fire-and-forget immediate push so this doesn't wait for the next poll tick.
    void sync();

    propClearTimer.current = setTimeout(() => {
      setPropTrigger("none");
      void sync();
    }, def.durationMs);
  }, [sync]);

  const releaseProp = useCallback(() => {
    if (propClearTimer.current) clearTimeout(propClearTimer.current);
    setPropTrigger("none");
    void sync();
  }, [sync]);

  useEffect(() => () => {
    if (propClearTimer.current) clearTimeout(propClearTimer.current);
  }, []);

  return {
    position,
    move,
    propTrigger,
    triggerProp,
    releaseProp,
    isSpeaking,
    setIsSpeaking,
    hasCameraOn,
    setHasCameraOn,
    participants,
  };
}
