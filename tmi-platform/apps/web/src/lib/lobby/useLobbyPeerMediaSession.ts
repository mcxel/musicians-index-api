"use client";

/**
 * Phase B — Daily (or local fallback) media session for social lobbies.
 * Consumed by FanLobbyVenue → LobbyFreeRoamAvatars → AvatarHeadMediaSurface.
 * Maps Daily participants → FanLobbyPresence.userId. No parallel presence store.
 *
 * ## Two-peer test
 * 1. Set DAILY_API_KEY (+ DAILY_DOMAIN / NEXT_PUBLIC_DAILY_DOMAIN) in env; `pnpm dev` in apps/web.
 * 2. Browser A: open `/rooms/fan-lobby` (or `/rooms/playlist-lounge`) → Cam On + Mic On.
 * 3. Browser B (incognito / second profile): same route → Cam On.
 * 4. Expect: head panels above both avatars; near = FULL, far walk = COMPACT; mute badge when Mic Off.
 * 5. Without Daily key: local head panel still works; peers show truthful "NO PEER VIDEO" / status strip.
 * 6. Leave route → Daily leave+destroy; tracks stop (no leak).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { DailyCall, DailyParticipant } from "@daily-co/daily-js";
import {
  encodeLobbyMediaUserName,
  parseLobbyMediaUserId,
  type LobbyPeerMediaSnapshot,
  type LobbyPeerMediaTracks,
} from "./lobbyPeerMediaBinding";

export interface UseLobbyPeerMediaSessionOpts {
  roomId: string;
  userId: string;
  userName: string;
  cameraEnabled: boolean;
  micEnabled: boolean;
  /** When false, leave Daily / stop publishing (component unmount handles leave). */
  enabled?: boolean;
}

export interface LobbyPeerMediaSessionApi {
  snapshot: LobbyPeerMediaSnapshot;
  /** Local preview stream (Daily local video or getUserMedia fallback). */
  localPreviewStream: MediaStream | null;
  /** True when Daily joined; false = local-only / unavailable. */
  dailyJoined: boolean;
}

function tracksFromParticipant(p: DailyParticipant, userId: string): LobbyPeerMediaTracks {
  const videoTrack = p.tracks?.video?.persistentTrack ?? p.tracks?.video?.track ?? null;
  const audioTrack = p.tracks?.audio?.persistentTrack ?? p.tracks?.audio?.track ?? null;
  const videoState = p.tracks?.video?.state;
  const hasVideoTrack = Boolean(videoTrack && (videoState === "playable" || videoState === "loading" || videoState === "sendable"));
  return {
    userId,
    mediaParticipantId: p.session_id ?? null,
    videoTrack: videoTrack ?? null,
    audioTrack: audioTrack ?? null,
    hasVideoTrack,
  };
}

function buildSnapshot(
  call: DailyCall | null,
  unavailableReason: string | null,
): LobbyPeerMediaSnapshot {
  const byUserId = new Map<string, LobbyPeerMediaTracks>();
  if (!call) {
    return { sessionReady: false, unavailableReason, byUserId };
  }
  const participants = call.participants();
  for (const p of Object.values(participants)) {
    if (!p) continue;
    const uid = parseLobbyMediaUserId(p.user_id, p.user_name);
    if (!uid) continue;
    byUserId.set(uid, tracksFromParticipant(p, uid));
  }
  return {
    sessionReady: true,
    unavailableReason: null,
    byUserId,
  };
}

export function useLobbyPeerMediaSession(opts: UseLobbyPeerMediaSessionOpts): LobbyPeerMediaSessionApi {
  const { roomId, userId, userName, cameraEnabled, micEnabled, enabled = true } = opts;
  const callRef = useRef<DailyCall | null>(null);
  const localFallbackRef = useRef<MediaStream | null>(null);
  const audioElsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const [snapshot, setSnapshot] = useState<LobbyPeerMediaSnapshot>({
    sessionReady: false,
    unavailableReason: null,
    byUserId: new Map(),
  });
  const [localPreviewStream, setLocalPreviewStream] = useState<MediaStream | null>(null);
  const [dailyJoined, setDailyJoined] = useState(false);
  const lobbyMediaBlockedRef = useRef(false);

  useEffect(() => {
    lobbyMediaBlockedRef.current = false;
  }, [roomId, userId]);

  const refreshSnapshot = useCallback((reason?: string | null) => {
    setSnapshot(buildSnapshot(callRef.current, reason ?? null));
  }, []);

  const syncRemoteAudio = useCallback((call: DailyCall, selfId: string) => {
    const participants = call.participants();
    const keep = new Set<string>();
    for (const p of Object.values(participants)) {
      if (!p || p.local) continue;
      const uid = parseLobbyMediaUserId(p.user_id, p.user_name);
      if (!uid || uid === selfId) continue;
      const track = p.tracks?.audio?.persistentTrack ?? p.tracks?.audio?.track;
      if (!track || p.tracks?.audio?.state !== "playable") continue;
      keep.add(uid);
      let el = audioElsRef.current.get(uid);
      if (!el) {
        el = new Audio();
        el.autoplay = true;
        audioElsRef.current.set(uid, el);
      }
      const stream = el.srcObject instanceof MediaStream ? el.srcObject : new MediaStream();
      const existing = stream.getAudioTracks()[0];
      if (existing?.id !== track.id) {
        stream.getTracks().forEach((t) => stream.removeTrack(t));
        stream.addTrack(track);
        el.srcObject = stream;
        void el.play().catch(() => {});
      }
    }
    for (const [uid, el] of audioElsRef.current) {
      if (!keep.has(uid)) {
        el.pause();
        el.srcObject = null;
        audioElsRef.current.delete(uid);
      }
    }
  }, []);

  const cleanupAudio = useCallback(() => {
    for (const el of audioElsRef.current.values()) {
      el.pause();
      el.srcObject = null;
    }
    audioElsRef.current.clear();
  }, []);

  // Join / leave Daily for this lobby room.
  useEffect(() => {
    if (!enabled || !roomId || !userId) return;
    let cancelled = false;
    let call: DailyCall | null = null;

    (async () => {
      try {
        if (lobbyMediaBlockedRef.current) return;
        const res = await fetch("/api/rooms/lobby-media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomId,
            userId,
            userName: encodeLobbyMediaUserName(userName, userId),
            startVideoOff: !cameraEnabled,
            startAudioOff: !micEnabled,
          }),
        });
        const data = (await res.json()) as {
          available?: boolean;
          roomUrl?: string;
          token?: string;
          reason?: string;
          error?: string;
        };

        if (cancelled) return;

        if (!res.ok || !data.available || !data.roomUrl) {
          const reason =
            data.reason ?? data.error ?? "Peer video unavailable — local camera only.";
          lobbyMediaBlockedRef.current = true;
          setDailyJoined(false);
          callRef.current = null;
          setSnapshot({
            sessionReady: false,
            unavailableReason: reason,
            byUserId: new Map(),
          });
          return;
        }

        const DailyIframe = (await import("@daily-co/daily-js")).default;
        // Destroy any stale singleton so lobby rooms don't collide with arena calls.
        const existing = DailyIframe.getCallInstance?.();
        if (existing) {
          try {
            await existing.leave();
          } catch {
            /* ignore */
          }
          try {
            existing.destroy();
          } catch {
            /* ignore */
          }
        }

        call = DailyIframe.createCallObject({
          videoSource: cameraEnabled,
          audioSource: micEnabled,
        });
        callRef.current = call;

        const onPart = () => {
          refreshSnapshot(null);
          if (callRef.current) syncRemoteAudio(callRef.current, userId);
        };

        call.on("participant-joined", onPart);
        call.on("participant-updated", onPart);
        call.on("participant-left", onPart);
        call.on("track-started", onPart);
        call.on("track-stopped", onPart);
        call.on("left-meeting", () => {
          setDailyJoined(false);
          cleanupAudio();
        });

        await call.join({
          url: data.roomUrl,
          token: data.token,
          userName: encodeLobbyMediaUserName(userName, userId),
          startVideoOff: !cameraEnabled,
          startAudioOff: !micEnabled,
        });

        if (cancelled) {
          await call.leave().catch(() => {});
          call.destroy();
          return;
        }

        setDailyJoined(true);
        refreshSnapshot(null);
        syncRemoteAudio(call, userId);

        // Mirror local Daily video into preview stream.
        const local = call.participants().local;
        const vTrack = local?.tracks?.video?.persistentTrack ?? local?.tracks?.video?.track;
        if (vTrack) {
          setLocalPreviewStream(new MediaStream([vTrack]));
        }
      } catch (err) {
        if (cancelled) return;
        const reason = err instanceof Error ? err.message : "Peer video session failed";
        setDailyJoined(false);
        callRef.current = null;
        setSnapshot({
          sessionReady: false,
          unavailableReason: reason,
          byUserId: new Map(),
        });
      }
    })();

    return () => {
      cancelled = true;
      cleanupAudio();
      const c = callRef.current ?? call;
      callRef.current = null;
      setDailyJoined(false);
      if (c) {
        void c
          .leave()
          .catch(() => {})
          .finally(() => {
            try {
              c.destroy();
            } catch {
              /* ignore */
            }
          });
      }
    };
    // Join once per room/user — cam/mic toggles sync in separate effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, roomId, userId]);

  // Sync cam/mic toggles → Daily (presence remains source of intent).
  useEffect(() => {
    const call = callRef.current;
    if (!call || !dailyJoined) return;
    void call.setLocalVideo(cameraEnabled);
    void call.setLocalAudio(micEnabled);
    const local = call.participants().local;
    const vTrack = local?.tracks?.video?.persistentTrack ?? local?.tracks?.video?.track;
    if (cameraEnabled && vTrack) {
      setLocalPreviewStream(new MediaStream([vTrack]));
    } else if (!cameraEnabled && dailyJoined) {
      // Keep preview cleared when cam off in Daily mode; local fallback effect may refill if Daily left.
      setLocalPreviewStream(null);
    }
    refreshSnapshot(null);
  }, [cameraEnabled, micEnabled, dailyJoined, refreshSnapshot]);

  // Local getUserMedia fallback when Daily not joined (Rule 20: local panel still works).
  useEffect(() => {
    if (dailyJoined) {
      // Daily owns camera — stop any leftover fallback tracks.
      localFallbackRef.current?.getTracks().forEach((t) => t.stop());
      localFallbackRef.current = null;
      return;
    }
    if (!cameraEnabled) {
      localFallbackRef.current?.getTracks().forEach((t) => t.stop());
      localFallbackRef.current = null;
      setLocalPreviewStream(null);
      return;
    }
    let cancelled = false;
    navigator.mediaDevices
      ?.getUserMedia({ video: true, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        localFallbackRef.current = stream;
        setLocalPreviewStream(stream);
      })
      .catch(() => {
        if (!cancelled) setLocalPreviewStream(null);
      });
    return () => {
      cancelled = true;
      localFallbackRef.current?.getTracks().forEach((t) => t.stop());
      localFallbackRef.current = null;
    };
  }, [cameraEnabled, dailyJoined]);

  // Inject local fallback into snapshot map so self head panel can bind by userId.
  useEffect(() => {
    if (dailyJoined) return;
    setSnapshot((prev) => {
      const byUserId = new Map(prev.byUserId);
      if (localPreviewStream && cameraEnabled) {
        const v = localPreviewStream.getVideoTracks()[0] ?? null;
        byUserId.set(userId, {
          userId,
          mediaParticipantId: null,
          videoTrack: v,
          audioTrack: null,
          hasVideoTrack: Boolean(v),
        });
      } else {
        byUserId.delete(userId);
      }
      return {
        sessionReady: false,
        unavailableReason: prev.unavailableReason ?? "Peer video unavailable — local camera only.",
        byUserId,
      };
    });
  }, [localPreviewStream, cameraEnabled, userId, dailyJoined]);

  return { snapshot, localPreviewStream, dailyJoined };
}
