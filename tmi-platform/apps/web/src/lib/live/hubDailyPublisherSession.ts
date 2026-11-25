/**
 * Hub Daily publisher session — canonical WebRTC publish for in-place GO LIVE.
 *
 * deferMedia hub path previously published LIVE_STATE without joining Daily,
 * so viewers could see discovery/session but never receive remote tracks.
 * This module mints/joins the SAME roomId used by GlobalLiveSessionRegistry
 * and LobbyPreviewBindRuntime (receive-only). Not a second media system.
 */

"use client";

import type { DailyCall } from "@daily-co/daily-js";
import {
  leaveLiveRoomMixer,
  syncDailyCallRemoteAudio,
} from "@/lib/audio/mixer/LiveRoomMixerBind";

let publisherCall: DailyCall | null = null;
let publisherRoomId: string | null = null;
let publisherRoomUrl: string | null = null;

export function getHubDailyPublisherRoomId(): string | null {
  return publisherRoomId;
}

export function getHubDailyPublisherRoomUrl(): string | null {
  return publisherRoomUrl;
}

export async function leaveHubDailyPublisher(): Promise<void> {
  leaveLiveRoomMixer();
  const call = publisherCall;
  publisherCall = null;
  publisherRoomId = null;
  publisherRoomUrl = null;
  if (!call) return;
  try {
    await call.leave();
  } catch {
    /* ignore */
  }
  try {
    call.destroy();
  } catch {
    /* ignore */
  }
}

/**
 * Mint (or reuse) Daily room named = registry roomId, join as owner, publish
 * existing hub preview tracks when present.
 */
export async function ensureHubDailyPublisher(opts: {
  roomId: string;
  userName: string;
  stream: MediaStream | null;
}): Promise<{ ok: boolean; roomUrl?: string; reason?: string }> {
  const roomId = opts.roomId.trim();
  if (!roomId) {
    return { ok: false, reason: "roomId required" };
  }

  if (publisherCall && publisherRoomId === roomId && publisherRoomUrl) {
    await syncLocalTracks(publisherCall, opts.stream);
    return { ok: true, roomUrl: publisherRoomUrl };
  }

  if (publisherCall) {
    await leaveHubDailyPublisher();
  }

  try {
    const res = await fetch("/api/video/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        userName: opts.userName,
        roomName: roomId,
        createIfMissing: true,
      }),
      signal: AbortSignal.timeout(12000),
    });
    const data = (await res.json()) as {
      roomId?: string;
      roomUrl?: string;
      token?: string;
      error?: string;
    };

    if (!res.ok || !data.roomUrl || !data.token) {
      return {
        ok: false,
        reason: data.error ?? `Daily mint failed (${res.status})`,
      };
    }

    const DailyIframe = (await import("@daily-co/daily-js")).default;
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

    const videoTrack = opts.stream?.getVideoTracks().find((t) => t.readyState === "live") ?? false;
    const audioTrack = opts.stream?.getAudioTracks().find((t) => t.readyState === "live") ?? false;

    const call = DailyIframe.createCallObject({
      videoSource: videoTrack || true,
      audioSource: audioTrack || true,
    });
    publisherCall = call;
    publisherRoomId = roomId;
    publisherRoomUrl = data.roomUrl;

    const syncMixer = () => {
      const local = call.participants().local;
      const localAudio =
        local?.tracks?.audio?.persistentTrack ?? local?.tracks?.audio?.track ?? null;
      const localPlayable =
        Boolean(localAudio) &&
        (local?.tracks?.audio?.state === "playable" ||
          local?.tracks?.audio?.state === "sendable");
      void syncDailyCallRemoteAudio(call, {
        roomId,
        liveSessionId: `hub:${roomId}`,
        experienceType: "LIVE",
        remoteRole: "audience",
        localMicAvailable: localPlayable,
      });
    };

    call.on("error", (e) => console.error("[HubDailyPublisher] call error", e));
    call.on("participant-joined", syncMixer);
    call.on("participant-updated", syncMixer);
    call.on("participant-left", syncMixer);
    call.on("track-started", syncMixer);
    call.on("track-stopped", syncMixer);
    call.on("left-meeting", () => {
      leaveLiveRoomMixer();
      if (publisherCall === call) {
        publisherCall = null;
        publisherRoomId = null;
        publisherRoomUrl = null;
      }
    });

    await call.join({
      url: data.roomUrl,
      token: data.token,
      userName: opts.userName,
      startVideoOff: !videoTrack,
      startAudioOff: !audioTrack,
    });

    await syncLocalTracks(call, opts.stream);
    syncMixer();

    return { ok: true, roomUrl: data.roomUrl };
  } catch (err) {
    await leaveHubDailyPublisher();
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "Daily publisher join failed",
    };
  }
}

async function syncLocalTracks(call: DailyCall, stream: MediaStream | null): Promise<void> {
  if (!stream) return;
  const video = stream.getVideoTracks().find((t) => t.readyState === "live");
  const audio = stream.getAudioTracks().find((t) => t.readyState === "live");
  try {
    if (video) {
      const startCamera = (
        call as DailyCall & { startCamera?: (o: unknown) => Promise<void> }
      ).startCamera;
      if (typeof startCamera === "function") {
        try {
          await startCamera({
            videoSource: video,
            audioSource: audio ?? false,
          });
          return;
        } catch {
          /* fall through */
        }
      }
      await call.setLocalVideo(true);
    }
    if (audio) await call.setLocalAudio(true);
  } catch {
    /* publish may already be live from join sources */
  }
}

/** Tear down publisher when hub ends LIVE (listens for livePrivacy clear). */
export function installHubDailyPublisherEndHook(): () => void {
  if (typeof window === "undefined") return () => {};
  const onEnd = () => {
    void leaveHubDailyPublisher();
  };
  window.addEventListener("tmi:endbroadcast", onEnd);
  return () => window.removeEventListener("tmi:endbroadcast", onEnd);
}
