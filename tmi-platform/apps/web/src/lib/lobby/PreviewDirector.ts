/**
 * PreviewDirector — camera intent for lobby wall preview tiles.
 * Points at active speaker / performer / gauntlet stage when signals exist.
 * Never fabricates a live performer from a frozen photo.
 */

export type PreviewCameraTarget =
  | "ACTIVE_SPEAKER"
  | "ACTIVE_PERFORMER"
  | "GAUNTLET_STAGE"
  | "WIDE_VENUE"
  | "READY_EMPTY";

export type PreviewDirectorCue = {
  roomId: string;
  target: PreviewCameraTarget;
  /** True only when a real live publish/presence signal exists. */
  hasLiveSignal: boolean;
  label: string;
};

export function directLobbyPreview(input: {
  roomId: string;
  isLive: boolean;
  hasActivePerformer: boolean;
  hasActiveSpeaker: boolean;
  isGauntlet?: boolean;
}): PreviewDirectorCue {
  if (!input.isLive) {
    return {
      roomId: input.roomId,
      target: "READY_EMPTY",
      hasLiveSignal: false,
      label: "Waiting for live preview",
    };
  }
  if (input.isGauntlet) {
    return {
      roomId: input.roomId,
      target: "GAUNTLET_STAGE",
      hasLiveSignal: true,
      label: "Gauntlet stage camera",
    };
  }
  if (input.hasActiveSpeaker) {
    return {
      roomId: input.roomId,
      target: "ACTIVE_SPEAKER",
      hasLiveSignal: true,
      label: "Active speaker",
    };
  }
  if (input.hasActivePerformer) {
    return {
      roomId: input.roomId,
      target: "ACTIVE_PERFORMER",
      hasLiveSignal: true,
      label: "Active performer",
    };
  }
  return {
    roomId: input.roomId,
    target: "WIDE_VENUE",
    hasLiveSignal: true,
    label: "Wide venue",
  };
}
