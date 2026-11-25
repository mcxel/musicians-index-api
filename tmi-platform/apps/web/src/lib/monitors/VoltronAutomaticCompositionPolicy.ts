/**
 * Voltron Automatic Composition & Live Show Director Law (Cursor contract).
 *
 * Reuses AdaptiveVoltronPresentationDirector + canonicalMediaPlayerRuntime.
 * NO second media / WebRTC / composition engine.
 *
 * One Media Workspace → Monitors → Voltron Composition → up to 16 panels → sources.
 * Layout change ≠ session change. Incoming ring ≠ camera/mic publish.
 */

import type { VoltronCompositionFamily } from "@/lib/monitors/AdaptiveVoltronPresentationDirector";
import type { LayoutMode } from "@/lib/media/canonicalMediaPlayerRuntime";
import {
  MAX_VOLTRON_REFERENCE_SLOTS,
  MAX_INTERACTIVE_ROOM_MEMBERS,
} from "@/lib/live/InteractiveRoomCapacityPolicy";

export const VOLTRON_AUTOMATIC_COMPOSITION_POLICY_ID =
  "VOLTRON_AUTOMATIC_COMPOSITION_v1" as const;

export const NEW_VOLTRON_COMPOSITION_ENGINE = false as const;
export const NEW_SHOW_DIRECTOR_ENGINE = false as const;
export const LAYOUT_CHANGE_REMOUNTS_WEBRTC = 0 as const;
export const INCOMING_CALL_AUTO_PUBLISHES_CAMERA = 0 as const;
export const PRIVATE_CALL_MIXES_INTO_PROGRAM = 0 as const;

export type FanViewingMode =
  | "DIRECTED_SHOW"
  | "VOLTRON_MULTIVIEW"
  | "FOCUS"
  | "CYPHER";

/** Required three-way panels inside one continuous experience. */
export type VoltronThreeWayPanelId = "MY_CAMERA" | "PERFORMER" | "AUDIENCE";

export const VOLTRON_THREE_WAY_PANELS: Record<
  VoltronThreeWayPanelId,
  {
    label: string;
    /** Local self-preview never authorizes stage publish. */
    grantsStagePublish: false;
    canonicalDefaultFrame: "a" | "b" | "c";
  }
> = {
  MY_CAMERA: { label: "MY CAMERA", grantsStagePublish: false, canonicalDefaultFrame: "a" },
  PERFORMER: { label: "PERFORMER", grantsStagePublish: false, canonicalDefaultFrame: "b" },
  AUDIENCE: { label: "AUDIENCE", grantsStagePublish: false, canonicalDefaultFrame: "c" },
};

export type AutoCompositionEvent =
  | "SHOW_ONLY"
  | "FRIEND_CALL_ACCEPTED"
  | "FRIEND_JOINED"
  | "FRIEND_LEFT"
  | "ALL_CALLS_ENDED"
  | "BATTLE_ACTIVE"
  | "CYPHER_ACTIVE"
  | "AUDIENCE_FEATURE"
  | "VOTING"
  | "WINNER"
  | "NEXT_CHALLENGER"
  | "USER_PINNED";

export type AutoCompositionPlan = {
  event: AutoCompositionEvent;
  voltronFamily: VoltronCompositionFamily;
  canonicalLayout: LayoutMode;
  remountWebRtc: false;
  autoPublishCamera: false;
  reason: string;
};

/**
 * Pure auto-reflow: show shrinks beside accepted call; restores when calls end.
 * Friend count = accepted call participants (not ringing previews).
 */
export function resolveAutomaticVoltronComposition(input: {
  event: AutoCompositionEvent;
  acceptedFriendCount: number;
  pinned?: boolean;
  fanMode?: FanViewingMode;
}): AutoCompositionPlan {
  const base = {
    remountWebRtc: false as const,
    autoPublishCamera: false as const,
  };

  if (input.pinned || input.event === "USER_PINNED") {
    return {
      ...base,
      event: "USER_PINNED",
      voltronFamily: "PRIMARY_PLUS_STRIP",
      canonicalLayout: "SPLIT_2",
      reason: "User pinned layout — auto reflow paused",
    };
  }

  if (input.fanMode === "DIRECTED_SHOW") {
    return {
      ...base,
      event: input.event,
      voltronFamily: "FULL_FRAME",
      canonicalLayout: "SINGLE",
      reason: "Directed Show — one continuous program feed",
    };
  }

  if (input.fanMode === "CYPHER" || input.event === "CYPHER_ACTIVE") {
    return {
      ...base,
      event: "CYPHER_ACTIVE",
      voltronFamily: "DIAMOND_VOLTRON",
      canonicalLayout: "GRID_6",
      reason: "Cypher mosaic — existing multi-performer layout",
    };
  }

  if (input.event === "BATTLE_ACTIVE") {
    return {
      ...base,
      event: "BATTLE_ACTIVE",
      voltronFamily: "LEFT_RIGHT",
      canonicalLayout: "SPLIT_2",
      reason: "Battle — performer / challenger split",
    };
  }

  if (input.event === "AUDIENCE_FEATURE") {
    return {
      ...base,
      event: "AUDIENCE_FEATURE",
      voltronFamily: "STAGE_AND_AUDIENCE",
      canonicalLayout: "SPLIT_2",
      reason: "Authorized audience feature panel",
    };
  }

  if (input.event === "VOTING" || input.event === "WINNER" || input.event === "NEXT_CHALLENGER") {
    return {
      ...base,
      event: input.event,
      voltronFamily: "CANDIDATE_PLUS_PANEL",
      canonicalLayout: "SPLIT_3",
      reason: "Show-director competition beat — overlays on existing sources",
    };
  }

  const n = Math.max(0, input.acceptedFriendCount);

  if (input.event === "ALL_CALLS_ENDED" || n === 0) {
    return {
      ...base,
      event: n === 0 ? "SHOW_ONLY" : input.event,
      voltronFamily: "FULL_FRAME",
      canonicalLayout: "SINGLE",
      reason: "Full-screen show — no accepted call panels",
    };
  }

  if (n === 1) {
    return {
      ...base,
      event: "FRIEND_CALL_ACCEPTED",
      voltronFamily: "LEFT_RIGHT",
      canonicalLayout: "SPLIT_2",
      reason: "Show + first friend — sibling panel, show not remounted",
    };
  }

  if (n <= 3) {
    return {
      ...base,
      event: "FRIEND_JOINED",
      voltronFamily: "PRIMARY_PLUS_STRIP",
      canonicalLayout: "SPLIT_3",
      reason: "Adaptive 3–4 panel reflow",
    };
  }

  if (n <= 5) {
    return {
      ...base,
      event: "FRIEND_JOINED",
      voltronFamily: "GRID_4",
      canonicalLayout: "SPLIT_4",
      reason: "Friend mosaic reflow",
    };
  }

  return {
    ...base,
    event: "FRIEND_JOINED",
    voltronFamily: "GRID_8",
    canonicalLayout: n >= 8 ? "GRID_8" : "GRID_6",
    reason: "Dense mosaic — references may park; sessions stay connected",
  };
}

/** Three-way Voltron inside one monitor (MY / PERFORMER / AUDIENCE). */
export function resolveThreeWayVoltronPlan(): AutoCompositionPlan {
  return {
    event: "SHOW_ONLY",
    voltronFamily: "PRIMARY_PLUS_STRIP",
    canonicalLayout: "SPLIT_3",
    remountWebRtc: false,
    autoPublishCamera: false,
    reason: "Voltron 3-way: MY CAMERA | PERFORMER | AUDIENCE in one monitor",
  };
}

export function capacityVsReferenceLocks() {
  return {
    MAX_INTERACTIVE_ROOM_MEMBERS,
    MAX_VOLTRON_REFERENCE_SLOTS,
    REFERENCE_SLOTS_INCREASE_ROOM_CAPACITY: 0 as const,
    NEW_VOLTRON_COMPOSITION_ENGINE,
    NEW_SHOW_DIRECTOR_ENGINE,
    LAYOUT_CHANGE_REMOUNTS_WEBRTC,
    INCOMING_CALL_AUTO_PUBLISHES_CAMERA,
    PRIVATE_CALL_MIXES_INTO_PROGRAM,
  };
}
