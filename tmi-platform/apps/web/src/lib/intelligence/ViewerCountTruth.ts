/**
 * ViewerCountTruth — human-only viewer honesty for Intelligence + Mosaic.
 * BOT != HUMAN. Preview != room viewer. Analytics never fabricates engagement.
 * Paid exposure increases discovery placement — NEVER manufactured viewers.
 */

export type PresenceParticipantKind = "HUMAN" | "BOT" | "PREVIEW" | "TEST" | "SYSTEM_HOST";

export type PresenceSignal = {
  participantId: string;
  kind: PresenceParticipantKind;
  connected: boolean;
};

/** Qualifying human room viewers only — bots/preview/test/system never count. */
export function countQualifyingHumanViewers(signals: readonly PresenceSignal[]): number {
  let n = 0;
  for (const s of signals) {
    if (!s.connected) continue;
    if (s.kind !== "HUMAN") continue;
    n += 1;
  }
  return n;
}

export function paidBoostIncreasesViewerCount(): false {
  return false;
}

export function analyticsMayFabricateEngagement(): false {
  return false;
}

export function previewCountsAsRoomViewer(): false {
  return false;
}

export function botCountsAsHumanViewer(): false {
  return false;
}

/**
 * Apply a paid visibility boost effect honestly:
 * exposure/placement may change; humanRoomViewers must stay unchanged by boost alone.
 */
export function applyBoostExposureEffect(input: {
  humanRoomViewers: number;
  boostActive: boolean;
}): { humanRoomViewers: number; exposureClass: "ORGANIC" | "PROMOTED" } {
  return {
    humanRoomViewers: input.humanRoomViewers,
    exposureClass: input.boostActive ? "PROMOTED" : "ORGANIC",
  };
}
