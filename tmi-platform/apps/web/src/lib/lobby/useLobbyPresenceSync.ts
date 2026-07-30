"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getLobbyPropDef } from "./LobbyPropRegistry";
import type { LobbyAvatarLocomotion } from "./FanLobbySeatAssigner";
import type { SeatAnchor } from "./FanLobbySkinRegistry";
import { packLobbyTheme } from "./lobbySeatCodec";
import {
  normalizeFanLobbyPresence,
  publishFanLobbyPresence,
  publishFanLobbyPresenceBatch,
  withLegacyAliases,
  type LobbyParticipant,
} from "./FanLobbyPresence";

const SYNC_INTERVAL_MS = 1500;

export { packLobbyTheme, unpackLobbyTheme } from "./lobbySeatCodec";
export type { FanLobbyPresence, LobbyParticipant } from "./FanLobbyPresence";
export { getFanLobbyPresence, listFanLobbyPresence } from "./FanLobbyPresence";

interface UseLobbyPresenceSyncArgs {
  roomId: string;
  /** Defaults to roomId — Fan Lobby venue identity for Phase B media bind. */
  venueId?: string;
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
 * Phase A.5: publishes certified FanLobbyPresence into the thin snapshot
 * (`getFanLobbyPresence`). Seating + mic + nav packed into activeTheme
 * (no schema migration). Peer WebRTC video remains Phase B — media binds
 * TO this presence, never invents a second presence model.
 */
export function useLobbyPresenceSync({
  roomId,
  venueId,
  userId,
  userName,
  emoji,
  theme,
}: UseLobbyPresenceSyncArgs) {
  const resolvedVenueId = venueId ?? roomId;
  const [position, setPosition] = useState({ x: 50, y: 88 });
  const [propTrigger, setPropTrigger] = useState("none");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasCameraOn, setHasCameraOn] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [isSeated, setIsSeated] = useState(false);
  const [seatId, setSeatId] = useState<string | null>(null);
  const [conversationGroupId, setConversationGroupId] = useState<string | null>(null);
  const [locomotion, setLocomotion] = useState<LobbyAvatarLocomotion>("STANDING");
  const [participants, setParticipants] = useState<LobbyParticipant[]>([]);

  const latest = useRef({
    position,
    propTrigger,
    isSpeaking,
    hasCameraOn,
    micEnabled,
    theme,
    isSeated,
    seatId,
    conversationGroupId,
    locomotion,
  });
  latest.current = {
    position,
    propTrigger,
    isSpeaking,
    hasCameraOn,
    micEnabled,
    theme,
    isSeated,
    seatId,
    conversationGroupId,
    locomotion,
  };

  const propClearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const walkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildSelfPresence = useCallback((): LobbyParticipant => {
    const cur = latest.current;
    return withLegacyAliases({
      venueId: resolvedVenueId,
      roomId,
      userId,
      avatarId: userId,
      userName,
      emoji,
      x: cur.position.x,
      y: cur.position.y,
      activeTheme: cur.theme,
      propTrigger: cur.propTrigger,
      seatAnchorId: cur.isSeated ? cur.seatId : null,
      navigationState: cur.locomotion,
      conversationGroupId: cur.isSeated ? cur.conversationGroupId : null,
      micEnabled: cur.micEnabled,
      cameraEnabled: cur.hasCameraOn,
      isSpeaking: cur.isSpeaking,
      activeSpeaker: cur.isSpeaking,
      loadoutId: null,
    });
  }, [resolvedVenueId, roomId, userId, userName, emoji]);

  const sync = useCallback(async () => {
    try {
      const cur = latest.current;
      const packedTheme = packLobbyTheme({
        skinId: cur.theme,
        seatId: cur.isSeated ? cur.seatId : null,
        navigationState: cur.locomotion,
        micEnabled: cur.micEnabled,
        conversationGroupId: cur.isSeated ? cur.conversationGroupId : null,
      });
      const res = await fetch("/api/rooms/lobby-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          venueId: resolvedVenueId,
          userId,
          avatarId: userId,
          userName,
          emoji,
          x: cur.position.x,
          y: cur.position.y,
          propTrigger: cur.propTrigger,
          theme: packedTheme,
          isSpeaking: cur.isSpeaking,
          hasCameraOn: cur.hasCameraOn,
          cameraEnabled: cur.hasCameraOn,
          micEnabled: cur.micEnabled,
          isSeated: cur.isSeated,
          seatId: cur.seatId,
          seatAnchorId: cur.isSeated ? cur.seatId : null,
          navigationState: cur.locomotion,
          locomotion: cur.locomotion,
          conversationGroupId: cur.isSeated ? cur.conversationGroupId : null,
          activeSpeaker: cur.isSpeaking,
        }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.participants)) {
        // API returns Phase A.5 certified fields; normalize fills legacy aliases.
        const peers = (data.participants as FanLobbyPresenceWireRow[])
          .filter((p) => p.userId !== userId)
          .map((p) =>
            normalizeFanLobbyPresence(
              {
                ...p,
                seatAnchorId: p.seatAnchorId ?? p.seatId ?? null,
                cameraEnabled: p.cameraEnabled ?? p.hasCameraOn,
                navigationState: p.navigationState ?? p.locomotion,
                roomId: p.roomId ?? roomId,
                venueId: p.venueId ?? resolvedVenueId,
              },
              { roomId, venueId: resolvedVenueId },
            ),
          );
        setParticipants(peers);
        const self = buildSelfPresence();
        publishFanLobbyPresence(self);
        publishFanLobbyPresenceBatch(peers);
      }
    } catch {
      // Best-effort - next interval tick retries. No fabricated fallback state.
    }
  }, [roomId, resolvedVenueId, userId, userName, emoji, buildSelfPresence]);

  useEffect(() => {
    sync();
    const id = setInterval(sync, SYNC_INTERVAL_MS);
    return () => clearInterval(id);
  }, [sync]);

  // Keep self presence snapshot fresh for getFanLobbyPresence(self) between polls.
  useEffect(() => {
    publishFanLobbyPresence(buildSelfPresence());
  }, [
    buildSelfPresence,
    position,
    propTrigger,
    isSpeaking,
    hasCameraOn,
    micEnabled,
    isSeated,
    seatId,
    conversationGroupId,
    locomotion,
    theme,
  ]);

  const move = useCallback((x: number, y: number) => {
    if (walkTimer.current) clearTimeout(walkTimer.current);
    setIsSeated(false);
    setSeatId(null);
    setConversationGroupId(null);
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
    setConversationGroupId(anchor.conversationGroupId ?? null);
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
    setConversationGroupId(null);
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
    micEnabled,
    setMicEnabled,
    isSeated,
    seatId,
    seatAnchorId: seatId,
    conversationGroupId,
    locomotion,
    navigationState: locomotion,
    participants,
    /** Certified self presence (snapshot also via getFanLobbyPresence). */
    selfPresence: buildSelfPresence(),
  };
}

/** Loose wire row from lobby-sync JSON. */
type FanLobbyPresenceWireRow = {
  userId: string;
  userName?: string;
  emoji?: string;
  x?: number;
  y?: number;
  propTrigger?: string;
  activeTheme?: string;
  isSpeaking?: boolean;
  hasCameraOn?: boolean;
  cameraEnabled?: boolean;
  micEnabled?: boolean;
  isSeated?: boolean;
  seatId?: string | null;
  seatAnchorId?: string | null;
  locomotion?: LobbyAvatarLocomotion;
  navigationState?: LobbyAvatarLocomotion;
  conversationGroupId?: string | null;
  roomId?: string;
  venueId?: string;
  avatarId?: string;
  activeSpeaker?: boolean;
  loadoutId?: string | null;
};
