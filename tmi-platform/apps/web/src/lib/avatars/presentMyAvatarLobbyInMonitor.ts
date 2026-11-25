/**
 * presentMyAvatarLobbyInMonitor — MY AVATAR LOBBY entry authority.
 *
 * Law: world runs inside WORKSPACE → MONITOR → COMPOSITION → PANEL → WORLD RUNTIME.
 * No page navigation. No drawer-hosted 3D runtime. Equipped avatar auto-spawns via FanLobbyVenue.
 * GO LIVE publishes the same running room (FanAvatarLobbyStore.goPublic).
 */

import { useFanAvatarLobbyStore } from "@/lib/avatars/FanAvatarLobbyStore";
import { useCanonicalMediaPlayerRuntime } from "@/lib/media/canonicalMediaPlayerRuntime";
import { useGoLiveTransition } from "@/lib/live/goLiveTransitionStore";
import { DEFAULT_MONITOR_A, DEFAULT_MONITOR_B, type MonitorTarget } from "@/lib/personal-media/types";
import { inputControlMapper } from "@/lib/devices/InputControlMapper";

export const MY_AVATAR_LOBBY_CATEGORY = "fan-avatar-lobby";

export type PresentMyAvatarLobbyResult = {
  ok: true;
  roomId: string;
  frameId: "a" | "b";
  monitor: MonitorTarget;
} | {
  ok: false;
  reason: "BLOCKED_PROTECTED_SESSION" | "MISSING_USER";
};

function resolveFrame(preferred?: "a" | "b"): { frameId: "a" | "b"; monitor: MonitorTarget } {
  const media = useCanonicalMediaPlayerRuntime.getState();
  const prefer = preferred ?? "a";
  const other: "a" | "b" = prefer === "a" ? "b" : "a";

  const preferSource = media.frames[prefer]?.source ?? null;
  // Do not silently destroy camera / live / call feeds on the preferred monitor.
  const preferBusy =
    preferSource === "SELF_CAMERA" ||
    preferSource === "PERFORMER_FEED" ||
    preferSource === "SCREEN_SHARE" ||
    Boolean(media.frames[prefer]?.peerCallStream);

  if (!preferBusy) {
    return {
      frameId: prefer,
      monitor: prefer === "a" ? DEFAULT_MONITOR_A : DEFAULT_MONITOR_B,
    };
  }

  const otherSource = media.frames[other]?.source ?? null;
  const otherBusy =
    otherSource === "SELF_CAMERA" ||
    otherSource === "PERFORMER_FEED" ||
    otherSource === "SCREEN_SHARE" ||
    Boolean(media.frames[other]?.peerCallStream);

  if (!otherBusy) {
    return {
      frameId: other,
      monitor: other === "a" ? DEFAULT_MONITOR_A : DEFAULT_MONITOR_B,
    };
  }

  // Both busy — still mount on preferred (user explicitly asked for lobby); do not remount WebRTC tracks.
  return {
    frameId: prefer,
    monitor: prefer === "a" ? DEFAULT_MONITOR_A : DEFAULT_MONITOR_B,
  };
}

/**
 * Mount / reuse the personal Avatar Lobby inside a canonical media monitor.
 * Safe to call repeatedly — same roomId reuses the session (no remount of room identity).
 */
export function presentMyAvatarLobbyInMonitor(opts: {
  userId: string;
  displayName?: string;
  preferredFrame?: "a" | "b";
  /** When true, force preferred frame even if another media source is active. */
  forcePreferred?: boolean;
}): PresentMyAvatarLobbyResult {
  const userId = opts.userId?.trim();
  if (!userId) return { ok: false, reason: "MISSING_USER" };

  const roomId = `fan-lobby-${userId}`;
  const { frameId, monitor } = opts.forcePreferred
    ? {
        frameId: (opts.preferredFrame ?? "a") as "a" | "b",
        monitor: (opts.preferredFrame ?? "a") === "b" ? DEFAULT_MONITOR_B : DEFAULT_MONITOR_A,
      }
    : resolveFrame(opts.preferredFrame);

  const lobby = useFanAvatarLobbyStore.getState();
  if (lobby.lobbySessionState !== "ACTIVE" || lobby.activeRoomId !== roomId) {
    lobby.startAvatarLobby(userId, { roomId });
  }

  const media = useCanonicalMediaPlayerRuntime.getState();
  if (!media.roomId) {
    media.setRoomId(roomId);
  } else if (media.roomId !== roomId && media.frames[frameId]?.source !== "AVATAR_LOBBY") {
    // Room id already bound to another session — assign source only; keep WebRTC room id intact.
  }

  media.assignSource(frameId, "AVATAR_LOBBY");
  if (media.layout === "SINGLE" && typeof window !== "undefined" && window.innerWidth >= 900) {
    media.setLayout("SPLIT_2");
  }

  useGoLiveTransition.getState().bindInPlace(
    {
      roomId,
      category: MY_AVATAR_LOBBY_CATEGORY,
      privacy: "private",
      href: undefined,
      roomUrl: null,
      venueEnvironment: "indoor",
    },
    monitor,
  );

  inputControlMapper.setContextMode("WORLD");

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("tmi:my-avatar-lobby:presented", {
        detail: { roomId, frameId, userId, displayName: opts.displayName ?? null },
      }),
    );
  }

  return { ok: true, roomId, frameId, monitor };
}

/** Clear AVATAR_LOBBY source without ending the lobby session (return to normal media). */
export function clearMyAvatarLobbyFromMonitor(frameId: "a" | "b" = "a"): void {
  const media = useCanonicalMediaPlayerRuntime.getState();
  if (media.frames[frameId]?.source === "AVATAR_LOBBY") {
    media.assignSource(frameId, frameId === "a" ? "SELF_CAMERA" : "AUDIENCE_VIEW");
  }
}
