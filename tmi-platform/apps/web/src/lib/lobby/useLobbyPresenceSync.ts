"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getLobbyPropDef } from "./LobbyPropRegistry";
import type { LobbyAvatarLocomotion } from "./FanLobbySeatAssigner";
import type { SeatAnchor } from "./FanLobbySkinRegistry";
import { packLobbyTheme, unpackLobbyTheme } from "./lobbySeatCodec";

const SYNC_INTERVAL_MS = 1500;

export { packLobbyTheme, unpackLobbyTheme } from "./lobbySeatCodec";

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
  isSeated: boolean;
  seatId: string | null;
  locomotion: LobbyAvatarLocomotion;
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
 *
 * Seating: isSeated/seatId packed into activeTheme (no schema migration).
 * Peer WebRTC video remains Phase B — only local cam bubble is real.
 */
export function useLobbyPresenceSync({ roomId, userId, userName, emoji, theme }: UseLobbyPresenceSyncArgs) {
  const [position, setPosition] = useState({ x: 50, y: 88 });
  const [propTrigger, setPropTrigger] = useState("none");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasCameraOn, setHasCameraOn] = useState(false);
  const [isSeated, setIsSeated] = useState(false);
  const [seatId, setSeatId] = useState<string | null>(null);
  const [locomotion, setLocomotion] = useState<LobbyAvatarLocomotion>("STANDING");
  const [participants, setParticipants] = useState<LobbyParticipant[]>([]);

  const latest = useRef({
    position,
    propTrigger,
    isSpeaking,
    hasCameraOn,
    theme,
    isSeated,
    seatId,
    locomotion,
  });
  latest.current = {
    position,
    propTrigger,
    isSpeaking,
    hasCameraOn,
    theme,
    isSeated,
    seatId,
    locomotion,
  };

  const propClearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const walkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sync = useCallback(async () => {
    try {
      const cur = latest.current;
      const packedTheme = packLobbyTheme(cur.theme, cur.isSeated ? cur.seatId : null);
      const res = await fetch("/api/rooms/lobby-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          userId,
          userName,
          emoji,
          x: cur.position.x,
          y: cur.position.y,
          propTrigger: cur.propTrigger,
          theme: packedTheme,
          isSpeaking: cur.isSpeaking,
          hasCameraOn: cur.hasCameraOn,
          isSeated: cur.isSeated,
          seatId: cur.seatId,
        }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.participants)) {
        setParticipants(
          data.participants
            .filter((p: LobbyParticipant) => p.userId !== userId)
            .map((p: LobbyParticipant & { activeTheme?: string }) => {
              const unpacked = unpackLobbyTheme(p.activeTheme ?? "");
              const seated = Boolean(p.isSeated ?? unpacked.isSeated);
              const sid = p.seatId ?? unpacked.seatId;
              return {
                ...p,
                activeTheme: unpacked.theme,
                isSeated: seated,
                seatId: sid,
                locomotion: (seated ? "SEATED" : "STANDING") as LobbyAvatarLocomotion,
              };
            }),
        );
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
    if (walkTimer.current) clearTimeout(walkTimer.current);
    setIsSeated(false);
    setSeatId(null);
    setLocomotion("WALKING");
    setPosition({ x: Math.max(4, Math.min(96, x)), y: Math.max(10, Math.min(92, y)) });
    walkTimer.current = setTimeout(() => {
      setLocomotion((prev) => (prev === "WALKING" ? "STANDING" : prev));
    }, 480);
  }, []);

  /** Snap/glide to a seat anchor and claim it locally + sync. */
  const sit = useCallback((anchor: SeatAnchor) => {
    if (walkTimer.current) clearTimeout(walkTimer.current);
    setLocomotion("WALKING");
    setPosition({ x: anchor.xPct, y: anchor.yPct });
    setSeatId(anchor.id);
    setIsSeated(true);
    walkTimer.current = setTimeout(() => {
      setLocomotion("SEATED");
      void sync();
    }, 320);
    void sync();
  }, [sync]);

  /** Free the seat and stand in place (or at entrance if provided). */
  const stand = useCallback((at?: { xPct: number; yPct: number }) => {
    if (walkTimer.current) clearTimeout(walkTimer.current);
    setIsSeated(false);
    setSeatId(null);
    setLocomotion("STANDING");
    if (at) {
      setPosition({ x: at.xPct, y: at.yPct });
    }
    void sync();
  }, [sync]);

  /** Instant local trigger + immediate sync push, self-clears after the prop's duration. */
  const triggerProp = useCallback((propId: string) => {
    const def = getLobbyPropDef(propId);
    if (!def) return;

    if (propClearTimer.current) clearTimeout(propClearTimer.current);
    setPropTrigger(propId);
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
    if (walkTimer.current) clearTimeout(walkTimer.current);
  }, []);

  return {
    position,
    move,
    sit,
    stand,
    propTrigger,
    triggerProp,
    releaseProp,
    isSpeaking,
    setIsSpeaking,
    hasCameraOn,
    setHasCameraOn,
    isSeated,
    seatId,
    locomotion,
    participants,
  };
}
