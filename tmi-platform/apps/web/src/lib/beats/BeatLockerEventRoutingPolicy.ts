/**
 * BeatLockerEventRoutingPolicy — §15058–§15127
 *
 * One canonical Beat in Beat Locker.
 * Event libraries are memberships (Assignment IDs), not audio copies.
 *
 * Submission drawer top tabs: STREAM & WIN | VIDEO SHUFFLE | EVENTS
 * EVENTS → BEAT / INSTRUMENTAL → Producer chooses BATTLE | CYPHER | WORLD DANCE PARTY
 * Slow Jam nests under World Dance Party (not a 4th primary destination).
 *
 * NEW_LOGISTICS_ENGINE_CREATED = NO — binds BeatLocker + BeatSubmissionRouter concepts.
 */

import { normalizeBeatTitle } from "@/lib/beats/BeatLockerTitleAuthority";

export const BEAT_LOCKER_EVENT_ROUTING_POLICY_ID = "BEAT_LOCKER_EVENT_ROUTING_POLICY_v1" as const;
export const NEW_LOGISTICS_ENGINE_CREATED = false as const;
export const NEW_BEAT_ENGINE_CREATED = false as const;

export const SUBMISSION_DRAWER_TOP_TABS = [
  "STREAM_AND_WIN",
  "VIDEO_SHUFFLE",
  "EVENTS",
] as const;

export type SubmissionDrawerTopTab = (typeof SUBMISSION_DRAWER_TOP_TABS)[number];

/** Primary Beat destinations — Slow Jam is NOT here (§15060–§15061). */
export const BEAT_PRIMARY_DESTINATIONS = ["BATTLE", "CYPHER", "WORLD_DANCE_PARTY"] as const;
export type BeatPrimaryDestination = (typeof BEAT_PRIMARY_DESTINATIONS)[number];

export type WorldDancePartyMode = "DANCE" | "SLOW_JAM";

export type BeatLicenseType = "EXCLUSIVE" | "NON_EXCLUSIVE";

export type BeatMasterRecord = {
  beatId: string; // TMI-BEAT-###### — system identity
  displayTitle: string; // producer-chosen human title
  normalizedTitle: string;
  producerId: string;
  genre: string;
  mediaUrl: string;
  priceCents: number | null;
  forSale: boolean;
  licenseType: BeatLicenseType | null;
  marketplaceFallback: boolean | null; // null until Producer answers
  createdAtMs: number;
};

export type BeatAssignmentStatus =
  | "SUBMITTED"
  | "IN_REVIEW"
  | "APPROVED"
  | "QUEUED"
  | "SCHEDULED"
  | "LIVE"
  | "PLAYED"
  | "REJECTED"
  | "UNSOLD_NOT_LISTED"
  | "MARKETPLACE_LISTED";

export type BeatAssignmentRecord = {
  assignmentId: string;
  beatId: string;
  destination: BeatPrimaryDestination;
  wdpMode?: WorldDancePartyMode;
  genre: string;
  status: BeatAssignmentStatus;
  createdAtMs: number;
  /** Never copies media — always references master */
  mediaRefBeatId: string;
};

export const EVENT_DESTINATION_AUTO_ASSIGNED = 0 as const;
export const SYSTEM_SECRETLY_CHANGES_EVENT = 0 as const;
export const SYSTEM_SECRETLY_CHANGES_WDP_MODE = 0 as const;
export const SECOND_EVENT_REQUIRES_REUPLOAD = 0 as const;
export const SECOND_EVENT_CREATES_DUPLICATE_BEAT = 0 as const;
export const EVENT_SUBMISSION_ROUTE_CHANGE = 0 as const;
export const SLOW_JAM_PRIMARY_DESTINATION = false as const;
export const PRODUCER_PRIMARY_EVENT_SELECTION = "USER_EXPLICIT" as const;

const masters = new Map<string, BeatMasterRecord>();
const assignments = new Map<string, BeatAssignmentRecord>();
const titlesByNorm = new Map<string, string>(); // normalizedTitle → beatId
let beatSeq = 4826;
let assignmentSeq = 0;

function nextBeatId(): string {
  beatSeq += 1;
  return `TMI-BEAT-${String(beatSeq).padStart(6, "0")}`;
}

function nextAssignmentId(beatId: string): string {
  assignmentSeq += 1;
  return `ASN-${beatId}-${assignmentSeq}`;
}

export function resetBeatLockerEventRoutingForTests(): void {
  masters.clear();
  assignments.clear();
  titlesByNorm.clear();
  beatSeq = 4826;
  assignmentSeq = 0;
}

export function listBeatEventChooserCards(): Array<{
  id: BeatPrimaryDestination;
  label: string;
  blurb: string;
}> {
  return [
    {
      id: "BATTLE",
      label: "BATTLE",
      blurb: "Submit Beats for two-Performer Battle matchups.",
    },
    {
      id: "CYPHER",
      label: "CYPHER",
      blurb: "Submit Beats for continuous Cypher rotations.",
    },
    {
      id: "WORLD_DANCE_PARTY",
      label: "WORLD DANCE PARTY",
      blurb: "Submit music for Dance Party or Slow Jam programming.",
    },
  ];
}

export function listWorldDancePartyModes(): Array<{
  id: WorldDancePartyMode;
  label: string;
}> {
  return [
    { id: "DANCE", label: "DANCE" },
    { id: "SLOW_JAM", label: "SLOW JAM" },
  ];
}

export type CreateBeatSubmissionInput = {
  producerId: string;
  displayTitle: string;
  genre: string;
  mediaUrl: string;
  destination: BeatPrimaryDestination;
  wdpMode?: WorldDancePartyMode;
  priceCents?: number | null;
  forSale?: boolean;
  licenseType?: BeatLicenseType | null;
  marketplaceFallback?: boolean | null;
  nowMs?: number;
};

export type CreateBeatSubmissionResult =
  | {
      ok: true;
      beat: BeatMasterRecord;
      assignment: BeatAssignmentRecord;
      EVENT_DESTINATION_AUTO_ASSIGNED: 0;
      SECOND_EVENT_CREATES_DUPLICATE_BEAT: 0;
    }
  | {
      ok: false;
      code:
        | "TITLE_CONFLICT"
        | "DESTINATION_REQUIRED"
        | "WDP_MODE_REQUIRED"
        | "MARKETPLACE_FALLBACK_UNRESOLVED"
        | "INVALID_TITLE"
        | "MEDIA_REQUIRED";
      message: string;
    };

/**
 * Producer chooses destination first, then details (§15066).
 * Creates ONE master Beat + ONE assignment. Never auto-picks event.
 */
export function submitBeatToEvent(input: CreateBeatSubmissionInput): CreateBeatSubmissionResult {
  if (!input.destination) {
    return { ok: false, code: "DESTINATION_REQUIRED", message: "Choose Battle, Cypher, or World Dance Party." };
  }
  if (input.destination === "WORLD_DANCE_PARTY" && !input.wdpMode) {
    return {
      ok: false,
      code: "WDP_MODE_REQUIRED",
      message: "Choose Dance or Slow Jam inside World Dance Party.",
    };
  }
  if (!input.mediaUrl?.trim()) {
    return { ok: false, code: "MEDIA_REQUIRED", message: "Audio is required." };
  }
  const displayTitle = input.displayTitle?.trim() ?? "";
  if (!displayTitle) {
    return { ok: false, code: "INVALID_TITLE", message: "Name your track." };
  }
  const normalizedTitle = normalizeBeatTitle(displayTitle);
  if (!normalizedTitle) {
    return { ok: false, code: "INVALID_TITLE", message: "Name your track." };
  }
  if (titlesByNorm.has(normalizedTitle)) {
    return {
      ok: false,
      code: "TITLE_CONFLICT",
      message: "Only one Beat Locker track can own this title while active.",
    };
  }
  // Marketplace fallback must be explicit when sale-enabled for Battle/Cypher (§14575)
  if (
    input.forSale &&
    (input.destination === "BATTLE" || input.destination === "CYPHER") &&
    input.marketplaceFallback == null
  ) {
    return {
      ok: false,
      code: "MARKETPLACE_FALLBACK_UNRESOLVED",
      message: "Choose whether unsold Beats list in the Marketplace.",
    };
  }

  const nowMs = input.nowMs ?? Date.now();
  const beatId = nextBeatId();
  const beat: BeatMasterRecord = {
    beatId,
    displayTitle,
    normalizedTitle,
    producerId: input.producerId,
    genre: input.genre,
    mediaUrl: input.mediaUrl,
    priceCents: input.forSale ? input.priceCents ?? null : null,
    forSale: Boolean(input.forSale),
    licenseType: input.forSale ? input.licenseType ?? null : null,
    marketplaceFallback: input.forSale ? input.marketplaceFallback ?? null : null,
    createdAtMs: nowMs,
  };
  masters.set(beatId, beat);
  titlesByNorm.set(normalizedTitle, beatId);

  const assignment = createAssignment({
    beatId,
    destination: input.destination,
    wdpMode: input.wdpMode,
    genre: input.genre,
    nowMs,
  });

  return {
    ok: true,
    beat,
    assignment,
    EVENT_DESTINATION_AUTO_ASSIGNED: 0,
    SECOND_EVENT_CREATES_DUPLICATE_BEAT: 0,
  };
}

function createAssignment(input: {
  beatId: string;
  destination: BeatPrimaryDestination;
  wdpMode?: WorldDancePartyMode;
  genre: string;
  nowMs: number;
}): BeatAssignmentRecord {
  const assignment: BeatAssignmentRecord = {
    assignmentId: nextAssignmentId(input.beatId),
    beatId: input.beatId,
    destination: input.destination,
    wdpMode: input.destination === "WORLD_DANCE_PARTY" ? input.wdpMode : undefined,
    genre: input.genre,
    status: "SUBMITTED",
    createdAtMs: input.nowMs,
    mediaRefBeatId: input.beatId,
  };
  assignments.set(assignment.assignmentId, assignment);
  return { ...assignment };
}

/**
 * SUBMIT TO ANOTHER EVENT — same Beat ID, new Assignment ID, no reupload (§15073–§15075).
 */
export function submitExistingBeatToAnotherEvent(input: {
  beatId: string;
  producerId: string;
  destination: BeatPrimaryDestination;
  wdpMode?: WorldDancePartyMode;
  nowMs?: number;
}):
  | {
      ok: true;
      beat: BeatMasterRecord;
      assignment: BeatAssignmentRecord;
      SECOND_EVENT_REQUIRES_REUPLOAD: 0;
      SECOND_EVENT_CREATES_DUPLICATE_BEAT: 0;
      mediaUrlUnchanged: true;
    }
  | { ok: false; code: "BEAT_NOT_FOUND" | "NOT_OWNER" | "WDP_MODE_REQUIRED" | "ALREADY_ACTIVE"; message: string } {
  const beat = masters.get(input.beatId);
  if (!beat) return { ok: false, code: "BEAT_NOT_FOUND", message: "Beat not in Locker." };
  if (beat.producerId !== input.producerId) {
    return { ok: false, code: "NOT_OWNER", message: "Only the Producer can submit this Beat elsewhere." };
  }
  if (input.destination === "WORLD_DANCE_PARTY" && !input.wdpMode) {
    return { ok: false, code: "WDP_MODE_REQUIRED", message: "Choose Dance or Slow Jam." };
  }

  const activeSame = [...assignments.values()].some(
    (a) =>
      a.beatId === input.beatId &&
      a.destination === input.destination &&
      (input.destination !== "WORLD_DANCE_PARTY" || a.wdpMode === input.wdpMode) &&
      a.status !== "REJECTED" &&
      a.status !== "PLAYED",
  );
  if (activeSame) {
    return {
      ok: false,
      code: "ALREADY_ACTIVE",
      message: "This Beat already has an active submission for that destination.",
    };
  }

  const assignment = createAssignment({
    beatId: input.beatId,
    destination: input.destination,
    wdpMode: input.wdpMode,
    genre: beat.genre,
    nowMs: input.nowMs ?? Date.now(),
  });

  return {
    ok: true,
    beat: { ...beat },
    assignment,
    SECOND_EVENT_REQUIRES_REUPLOAD: 0,
    SECOND_EVENT_CREATES_DUPLICATE_BEAT: 0,
    mediaUrlUnchanged: true,
  };
}

/** Soft compatibility suggestion — never secretly switches (§15086–§15087). */
export function suggestWdpModeAlternative(input: {
  selected: WorldDancePartyMode;
  bpm?: number;
  energy?: "low" | "mid" | "high";
}): {
  suggestion: WorldDancePartyMode | null;
  SYSTEM_SECRETLY_CHANGES_WDP_MODE: 0;
} {
  if (input.selected === "DANCE" && (input.bpm != null && input.bpm < 85 || input.energy === "low")) {
    return { suggestion: "SLOW_JAM", SYSTEM_SECRETLY_CHANGES_WDP_MODE: 0 };
  }
  if (input.selected === "SLOW_JAM" && input.bpm != null && input.bpm >= 120) {
    return { suggestion: "DANCE", SYSTEM_SECRETLY_CHANGES_WDP_MODE: 0 };
  }
  return { suggestion: null, SYSTEM_SECRETLY_CHANGES_WDP_MODE: 0 };
}

export function getBeatMaster(beatId: string): BeatMasterRecord | null {
  const b = masters.get(beatId);
  return b ? { ...b } : null;
}

export function listAssignmentsForBeat(beatId: string): BeatAssignmentRecord[] {
  return [...assignments.values()]
    .filter((a) => a.beatId === beatId)
    .map((a) => ({ ...a }));
}

export function listLibraryPool(
  destination: BeatPrimaryDestination,
  opts?: { wdpMode?: WorldDancePartyMode; genre?: string },
): BeatAssignmentRecord[] {
  return [...assignments.values()]
    .filter((a) => {
      if (a.destination !== destination) return false;
      if (destination === "WORLD_DANCE_PARTY" && opts?.wdpMode && a.wdpMode !== opts.wdpMode) {
        return false;
      }
      if (opts?.genre && a.genre.toLowerCase() !== opts.genre.toLowerCase()) return false;
      return a.status !== "REJECTED";
    })
    .map((a) => ({ ...a }));
}

export function beatDetailMemberships(beatId: string): {
  beatId: string;
  displayTitle: string;
  memberships: Array<{
    destination: BeatPrimaryDestination;
    wdpMode?: WorldDancePartyMode;
    status: BeatAssignmentStatus;
    assignmentId: string;
  }>;
} | null {
  const beat = masters.get(beatId);
  if (!beat) return null;
  return {
    beatId,
    displayTitle: beat.displayTitle,
    memberships: listAssignmentsForBeat(beatId).map((a) => ({
      destination: a.destination,
      wdpMode: a.wdpMode,
      status: a.status,
      assignmentId: a.assignmentId,
    })),
  };
}

export function beatLockerEventRoutingBoundaryLocks() {
  return {
    NEW_LOGISTICS_ENGINE_CREATED,
    NEW_BEAT_ENGINE_CREATED,
    SUBMISSION_DRAWER_TOP_TABS,
    BEAT_EVENT_CHOOSER: true as const,
    BATTLE_DESTINATION: true as const,
    CYPHER_DESTINATION: true as const,
    WORLD_DANCE_PARTY_DESTINATION: true as const,
    SLOW_JAM_PRIMARY_DESTINATION,
    WORLD_DANCE_PARTY_SLOW_JAM_MODE: true as const,
    PRODUCER_PRIMARY_EVENT_SELECTION,
    EVENT_DESTINATION_AUTO_ASSIGNED,
    SYSTEM_SECRETLY_CHANGES_EVENT,
    SYSTEM_SECRETLY_CHANGES_WDP_MODE,
    SECOND_EVENT_REQUIRES_REUPLOAD,
    SECOND_EVENT_CREATES_DUPLICATE_BEAT,
    EVENT_SUBMISSION_ROUTE_CHANGE,
  } as const;
}
