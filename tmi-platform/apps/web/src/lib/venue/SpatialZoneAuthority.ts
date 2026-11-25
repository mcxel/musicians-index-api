/**
 * Spatial zone authority — owner decision 2026-11-18: HYBRID access control.
 *
 * Server decides who may enter each semantic zone (this module); the 3D client
 * adds physical edges/feedback. A decorative barrier is never the only control.
 *
 * Decisions are derived on EVERY call from durable room state (live-session host,
 * room_invites status, challenger-queue ON_STAGE) — so a host revoking access
 * (remove / return backstage) takes effect on the next move with no extra plumbing.
 * Being a performer ACCOUNT grants nothing: access is per room/session.
 *
 * Coordinates are glTF/runtime (Y-up, metres), matching the served venue GLBs.
 */

export type ZoneKind = "PUBLIC_AUDIENCE" | "PUBLIC_AISLE" | "STAGE" | "BACKSTAGE" | "PERFORMER_SPAWN" | "RESTRICTED_ROOM";

export type ZoneBox = {
  zoneId: string;
  kind: ZoneKind;
  /** Axis-aligned box in runtime coords. */
  min: [number, number, number];
  max: [number, number, number];
};

export type VenueZoneMap = {
  blueprintId: string;
  zones: ZoneBox[];
  /** Where a participant is routed when they lose access (canonical anchor position). */
  safeReturn: [number, number, number];
};

/**
 * Monday Night Stage v2 — derived from the real GLB (2026-11-18):
 * Stage mesh x ±3.5, z −14..−10, top 0.9; access steps x ±0.7, z −8.1..−6.9;
 * Backstage_Entry/Exit at (±8, 0, −13) on the open floor (no backstage room exists);
 * Spawn_Performer (−4, 0, −7); Spawn_Host / Host_Anchor (0, 1.2, −11) on stage;
 * safe return = Spawn_Fan (0, 2.24, 15) on the rear landing.
 * NOTE: Stage_Left/Right anchors (±4, 1.2, −12) sit OFF the 7 m stage (inherited defect).
 */
export const MNS_V2_ZONES: VenueZoneMap = {
  blueprintId: "monday-night-stage-arch-v2",
  safeReturn: [0, 2.24, 15],
  zones: [
    { zoneId: "stage_deck", kind: "STAGE", min: [-3.6, 0, -14.1], max: [3.6, 4, -9.9] },
    { zoneId: "stage_steps", kind: "STAGE", min: [-0.8, 0, -8.2], max: [0.8, 4, -6.8] },
    // Stage_Left/Right marks are on the floor beside the deck; the wings are stage area.
    { zoneId: "stage_wing_left", kind: "STAGE", min: [-5.2, 0, -14.1], max: [-3.6, 4, -9.9] },
    { zoneId: "stage_wing_right", kind: "STAGE", min: [3.6, 0, -14.1], max: [5.2, 4, -9.9] },
    { zoneId: "backstage_left", kind: "BACKSTAGE", min: [-9.6, 0, -14.6], max: [-6.4, 4, -11.4] },
    { zoneId: "backstage_right", kind: "BACKSTAGE", min: [6.4, 0, -14.6], max: [9.6, 4, -11.4] },
    { zoneId: "performer_spawn", kind: "PERFORMER_SPAWN", min: [-5, 0, -8], max: [-3, 4, -6] },
  ],
};

export const VENUE_ZONE_MAPS: Record<string, VenueZoneMap> = {
  [MNS_V2_ZONES.blueprintId]: MNS_V2_ZONES,
};

/** Most restrictive zone containing the point; default PUBLIC_AUDIENCE. */
export function resolveZone(map: VenueZoneMap, p: [number, number, number]): ZoneBox | null {
  const rank: Record<ZoneKind, number> = {
    PUBLIC_AUDIENCE: 0, PUBLIC_AISLE: 0, STAGE: 2, BACKSTAGE: 3, PERFORMER_SPAWN: 4, RESTRICTED_ROOM: 5,
  };
  let hit: ZoneBox | null = null;
  for (const z of map.zones) {
    const inside = p.every((v, i) => v >= z.min[i] && v <= z.max[i]);
    if (inside && (!hit || rank[z.kind] > rank[hit.kind])) hit = z;
  }
  return hit;
}

/** Durable per-room membership facts (resolved server-side; never from the client). */
export type RoomMembership = {
  /** Owner of the room's live session. */
  isHost: boolean;
  /** room_invites status for this user in this room ("backstage" | "live" | null). */
  guestStatus: "backstage" | "live" | null;
  /** Challenger-queue status for this user in this room. */
  queueStatus: "QUEUED" | "CALLED" | "ON_STAGE" | null;
  /** Platform operator (ADMIN/STAFF) — moderation access. */
  isOperator: boolean;
};

export type ZoneDecision = { allowed: boolean; reason: string };

export function authorizeZone(kind: ZoneKind, m: RoomMembership): ZoneDecision {
  if (kind === "PUBLIC_AUDIENCE" || kind === "PUBLIC_AISLE") return { allowed: true, reason: "public" };
  if (m.isHost || m.isOperator) return { allowed: true, reason: m.isHost ? "host" : "operator" };
  const onStage = m.guestStatus === "live" || m.queueStatus === "ON_STAGE";
  switch (kind) {
    case "STAGE":
      // Invited fans/guests (host Bring In) and the called-up challenger.
      return onStage ? { allowed: true, reason: "invited_on_stage" } : { allowed: false, reason: "stage_requires_invitation" };
    case "BACKSTAGE":
      // Guests waiting to go on, and challengers in the line, may use backstage.
      return onStage || m.guestStatus === "backstage" || m.queueStatus === "QUEUED" || m.queueStatus === "CALLED"
        ? { allowed: true, reason: "backstage_member" }
        : { allowed: false, reason: "backstage_restricted" };
    case "PERFORMER_SPAWN":
      return { allowed: false, reason: "performer_spawn_host_only" };
    case "RESTRICTED_ROOM":
    default:
      return { allowed: false, reason: "restricted" };
  }
}

export type MoveDecision =
  | { accepted: true; position: [number, number, number] }
  | { accepted: false; position: [number, number, number]; reason: string; routedToSafeReturn: boolean };

/**
 * Authoritative movement check. A rejected move keeps the participant at their
 * last authorized position; if that position itself is no longer authorized
 * (access was revoked while standing there) they are routed to the safe return.
 * Media/WebRTC sessions are untouched — this only decides spatial position.
 */
export function validateMove(
  map: VenueZoneMap,
  m: RoomMembership,
  from: [number, number, number],
  to: [number, number, number],
): MoveDecision {
  const target = resolveZone(map, to);
  const targetOk = authorizeZone(target?.kind ?? "PUBLIC_AUDIENCE", m);
  if (targetOk.allowed) return { accepted: true, position: to };
  const here = resolveZone(map, from);
  const hereOk = authorizeZone(here?.kind ?? "PUBLIC_AUDIENCE", m);
  return hereOk.allowed
    ? { accepted: false, position: from, reason: targetOk.reason, routedToSafeReturn: false }
    : { accepted: false, position: map.safeReturn, reason: targetOk.reason, routedToSafeReturn: true };
}

// ── Admin Room Editor: zone configuration (structural; recertify after change) ──
const ZONE_KINDS: ZoneKind[] = ["PUBLIC_AUDIENCE", "PUBLIC_AISLE", "STAGE", "BACKSTAGE", "PERFORMER_SPAWN", "RESTRICTED_ROOM"];

export type ZoneMapIssue = { path: string; code: string };

/**
 * Validate an editor-submitted zone map. Only platform operators (ADMIN/STAFF)
 * may configure zones. A restricted zone may never cover a public point
 * (seat anchors, audience doors, fan spawn) — that would silently lock fans out
 * of their seats. Any accepted change requires navigation recertification
 * (certifyVenueNavigation.py --zones) before it goes live.
 */
export function validateZoneMap(
  input: unknown,
  ctx: { editorRole: string | null | undefined; halfExtentM: number; publicPoints: Array<{ node: string; position: [number, number, number] }> },
): { ok: true; map: VenueZoneMap; requiresRecertification: true } | { ok: false; issues: ZoneMapIssue[] } {
  const issues: ZoneMapIssue[] = [];
  if (ctx.editorRole !== "ADMIN" && ctx.editorRole !== "STAFF") return { ok: false, issues: [{ path: "$", code: "OPERATOR_ONLY" }] };
  const m = input as Partial<VenueZoneMap> | null;
  if (!m || typeof m !== "object" || !Array.isArray(m.zones)) return { ok: false, issues: [{ path: "zones", code: "REQUIRED" }] };
  const finite3 = (v: unknown): v is [number, number, number] =>
    Array.isArray(v) && v.length === 3 && v.every((x) => typeof x === "number" && Number.isFinite(x) && Math.abs(x) <= ctx.halfExtentM);
  if (!finite3(m.safeReturn)) issues.push({ path: "safeReturn", code: "BAD_POSITION" });
  const ids = new Set<string>();
  m.zones.forEach((z, i) => {
    const at = `zones[${i}]`;
    if (!z || typeof z.zoneId !== "string" || !z.zoneId || ids.has(z.zoneId)) issues.push({ path: at, code: "BAD_OR_DUPLICATE_ID" });
    else ids.add(z.zoneId);
    if (!ZONE_KINDS.includes(z?.kind)) issues.push({ path: `${at}.kind`, code: "UNKNOWN_KIND" });
    if (!finite3(z?.min) || !finite3(z?.max) || z.min.some((v, k) => v >= z.max[k])) issues.push({ path: at, code: "BAD_BOX" });
  });
  if (issues.length) return { ok: false, issues };
  const map = m as VenueZoneMap;
  const pub = { isHost: false, guestStatus: null, queueStatus: null, isOperator: false } as RoomMembership;
  for (const p of ctx.publicPoints) {
    const z = resolveZone(map, p.position);
    if (z && !authorizeZone(z.kind, pub).allowed) issues.push({ path: z.zoneId, code: `COVERS_PUBLIC_POINT:${p.node}` });
  }
  const sr = resolveZone(map, map.safeReturn);
  if (sr && !authorizeZone(sr.kind, pub).allowed) issues.push({ path: "safeReturn", code: "SAFE_RETURN_RESTRICTED" });
  return issues.length ? { ok: false, issues } : { ok: true, map, requiresRecertification: true };
}
