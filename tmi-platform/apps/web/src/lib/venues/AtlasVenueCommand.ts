/**
 * AtlasVenueCommand — thin Autonomous Venue Operations Coordinator scaffold.
 *
 * Hierarchy (documented — do not collapse Big Ace into this system):
 *   Marcel
 *     → Big Ace (personal/executive master assistant — NOT venue visit scheduler)
 *       → Michael Charlie (Platform Operations Director — policy/escalations)
 *         → Atlas Venue Command (this module — continuous ops loop)
 *           → Helper bots + Verifier bots
 *
 * Loop (scaffold only — deepen FUTURE):
 *   OBSERVE → DISCOVER → VERIFY → PRIORITIZE → ASSIGN → EXECUTE
 *   → RE-VERIFY → CERTIFY/ESCALATE → RECORD → CONTINUE
 *
 * No fake "100 consecutive" achievements. Missions are honest logs.
 */

export type VenueMissionPhase =
  | "OBSERVE"
  | "DISCOVER"
  | "VERIFY"
  | "PRIORITIZE"
  | "ASSIGN"
  | "EXECUTE"
  | "RE_VERIFY"
  | "CERTIFY"
  | "ESCALATE"
  | "RECORD"
  | "CONTINUE";

export type VenueMissionStatus =
  | "queued"
  | "assigned"
  | "executing"
  | "verified"
  | "certified"
  | "escalated"
  | "cancelled";

export type VenueMissionKind =
  | "sound_check"
  | "environment_verify"
  | "chat_probe"
  | "prop_test"
  | "seat_sample"
  | "network_probe"
  | "device_assist"
  | "first_session_welcome_ops";

export interface VenueOperationsMission {
  id: string;
  roomId: string;
  kind: VenueMissionKind;
  phase: VenueMissionPhase;
  status: VenueMissionStatus;
  assignedAgentId?: string;
  assignedAgentLabel?: string;
  signal?: string;
  note?: string;
  createdAt: number;
  updatedAt: number;
  /** Escalation target when CERTIFY fails — Michael Charlie / Big Ace path */
  escalateTo?: "michael-charlie" | "big-ace" | "marcel";
}

export const ATLAS_HIERARCHY = {
  owner: "Marcel",
  executiveMasterAssistant: "Big Ace",
  platformOperationsDirector: "Michael Charlie",
  venueOperationsCoordinator: "Atlas Venue Command",
  note:
    "Big Ace is the personal/executive master assistant across the BerntoutGlobal portfolio — not a venue visit scheduler. Atlas owns continuous venue ops. Support bots never affect rankings or humanViewer counts.",
} as const;

const missions: VenueOperationsMission[] = [];
let missionSeq = 1;

function emit(detail: VenueOperationsMission) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("tmi:atlas-mission", { detail }));
}

export function createVenueMission(input: {
  roomId: string;
  kind: VenueMissionKind;
  signal?: string;
  note?: string;
}): VenueOperationsMission {
  const now = Date.now();
  const mission: VenueOperationsMission = {
    id: `atlas-m-${missionSeq++}-${now.toString(36)}`,
    roomId: input.roomId,
    kind: input.kind,
    phase: "OBSERVE",
    status: "queued",
    signal: input.signal,
    note: input.note,
    createdAt: now,
    updatedAt: now,
  };
  missions.push(mission);
  emit(mission);
  return mission;
}

export function assignVenueMission(
  missionId: string,
  agentId: string,
  agentLabel: string,
): VenueOperationsMission | null {
  const m = missions.find((x) => x.id === missionId);
  if (!m) return null;
  m.assignedAgentId = agentId;
  m.assignedAgentLabel = agentLabel;
  m.phase = "ASSIGN";
  m.status = "assigned";
  m.updatedAt = Date.now();
  emit(m);
  return m;
}

export function advanceVenueMission(
  missionId: string,
  phase: VenueMissionPhase,
  status?: VenueMissionStatus,
): VenueOperationsMission | null {
  const m = missions.find((x) => x.id === missionId);
  if (!m) return null;
  m.phase = phase;
  if (status) m.status = status;
  else if (phase === "EXECUTE") m.status = "executing";
  else if (phase === "RE_VERIFY" || phase === "VERIFY") m.status = "verified";
  else if (phase === "CERTIFY") m.status = "certified";
  else if (phase === "ESCALATE") {
    m.status = "escalated";
    m.escalateTo = m.escalateTo ?? "michael-charlie";
  }
  m.updatedAt = Date.now();
  emit(m);
  return m;
}

export function listVenueMissions(roomId?: string): VenueOperationsMission[] {
  if (!roomId) return [...missions];
  return missions.filter((m) => m.roomId === roomId);
}

export function getAtlasHierarchyDoc(): typeof ATLAS_HIERARCHY {
  return ATLAS_HIERARCHY;
}
