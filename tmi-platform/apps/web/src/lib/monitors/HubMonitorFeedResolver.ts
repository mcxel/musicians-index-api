/**
 * HubMonitorFeedResolver — canonical monitor source resolution for Fan/Performer Hub.
 * Truthful priority: user-selected real feed → live room → performance → media → honest ambient.
 */

import type { CommandCenterMediaSlot, CommandCenterPlaylistCast } from "@/components/commandCenter/CommandCenterMediaStack";

export type HubMonitorTarget = "A" | "B";

export type HubMonitorFeedKind =
  | "live_camera"
  | "live_venue"
  | "playlist"
  | "video_url"
  | "image"
  | "ambient_idle";

export type HubMonitorFeedResolution = {
  kind: HubMonitorFeedKind;
  monitorTarget: HubMonitorTarget;
  sourceId: string | null;
  available: boolean;
  fallbackReason: string | null;
};

export type ResolveHubMonitorFeedInput = {
  slot: CommandCenterMediaSlot;
  monitorTarget: HubMonitorTarget;
  hubLiveRoomId: string | null;
  goLiveBootActive: boolean;
  playlistCast?: CommandCenterPlaylistCast | null;
};

function hasPlaylistVideo(cast: CommandCenterPlaylistCast | null | undefined): boolean {
  return Boolean(cast?.videoUrl?.trim());
}

/**
 * Resolve which feed kind a hub monitor cell should render.
 * Does not fabricate feeds — ambient_idle is explicit honest fallback only.
 */
export function resolveHubMonitorFeed(input: ResolveHubMonitorFeedInput): HubMonitorFeedResolution {
  const { slot, monitorTarget, hubLiveRoomId, goLiveBootActive, playlistCast } = input;
  const cast = playlistCast ?? slot.playlistCast ?? null;
  const videoSrc = slot.videoUrl?.trim() || "";
  const hasLiveRoom = Boolean(hubLiveRoomId);

  if (slot.kind === "playlist" && cast && hasPlaylistVideo(cast)) {
    return {
      kind: "playlist",
      monitorTarget,
      sourceId: cast.playlistId ?? slot.id,
      available: true,
      fallbackReason: null,
    };
  }

  if (videoSrc) {
    return {
      kind: "video_url",
      monitorTarget,
      sourceId: videoSrc,
      available: true,
      fallbackReason: null,
    };
  }

  if (monitorTarget === "A" && (hasLiveRoom || goLiveBootActive)) {
    return {
      kind: "live_camera",
      monitorTarget,
      sourceId: hubLiveRoomId,
      available: true,
      fallbackReason: null,
    };
  }

  if (monitorTarget === "B" && hasLiveRoom) {
    return {
      kind: "live_venue",
      monitorTarget,
      sourceId: hubLiveRoomId,
      available: true,
      fallbackReason: null,
    };
  }

  if (slot.imageUrl?.trim()) {
    return {
      kind: "image",
      monitorTarget,
      sourceId: slot.imageUrl,
      available: true,
      fallbackReason: null,
    };
  }

  return {
    kind: "ambient_idle",
    monitorTarget,
    sourceId: null,
    available: false,
    fallbackReason: hasLiveRoom
      ? `no_binding_for_monitor_${monitorTarget}`
      : "no_active_live_session",
  };
}

/** Map slot id (mon-a / mon-b) to monitor target letter. */
export function hubSlotMonitorTarget(slotId: string): HubMonitorTarget {
  return slotId.toLowerCase().includes("b") ? "B" : "A";
}
