/**
 * MovementAuthority — server-validated avatar movement for Fan Avatar Lobbies and avatar-enabled
 * venues ONLY. In Lounges and Performer Lobbies EVERYONE (fans and performers) is a video panel
 * and moves through VideoPanelSpatialContract — never an avatar.
 *
 * Builds on SpatialZoneAuthority.validateMove (zones/membership) and adds: per-state speed limits,
 * teleport detection, update-rate cap, legal state transitions (no running while seated; sitting
 * only through SIT_DOWN at a real seat), and the network state every renderer reads
 * (isMoving, speed, isGrounded, activeEmote, activeProp, mood, talking).
 *
 * Remote smoothing (client): buffered interpolation ~100 ms behind, short extrapolation, and
 * reconciliation that snaps only when the error is large — server position always wins.
 */

import { validateMove, type RoomMembership, type VenueZoneMap } from "@/lib/venue/SpatialZoneAuthority";

export type LocomotionState =
  | "IDLE" | "WALK" | "RUN" | "SPRINT" | "JUMP" | "LAND" | "CROUCH" | "TURN"
  | "SIT_DOWN" | "SEATED" | "STAND_UP" | "DANCE" | "INTERACT" | "MAKE_ROOM";

export type AvatarNetState = {
  participantId: string;
  seq: number;
  tMs: number;
  pos: [number, number, number];
  yaw: number;
  state: LocomotionState;
  speed: number;
  isGrounded: boolean;
  seatId: string | null;
  activeEmote: string | null;
  activeProp: string | null;
  mood: string | null;
  talking: boolean;
};

/** Max horizontal speed per state (m/s). Targets for a 1.65 m Mini-Me; tuned with real clips later. */
export const MAX_SPEED: Readonly<Record<LocomotionState, number>> = Object.freeze({
  IDLE: 0.3, TURN: 0.3, WALK: 1.8, RUN: 4.2, SPRINT: 6.0, JUMP: 6.0, LAND: 2.0, CROUCH: 1.0,
  SIT_DOWN: 0.6, SEATED: 0.05, STAND_UP: 0.6, DANCE: 0.8, INTERACT: 0.6, MAKE_ROOM: 0.2,
});
export const SPEED_TOLERANCE = 1.25;
export const MIN_UPDATE_INTERVAL_MS = 66; // ≈15 Hz per participant

/** Legal transitions. Anything else is rejected (the client keeps its last authoritative state). */
export const TRANSITIONS: Readonly<Record<LocomotionState, readonly LocomotionState[]>> = Object.freeze({
  IDLE: ["IDLE", "WALK", "RUN", "SPRINT", "JUMP", "CROUCH", "TURN", "SIT_DOWN", "DANCE", "INTERACT"],
  TURN: ["IDLE", "WALK", "RUN", "TURN", "SIT_DOWN"],
  WALK: ["IDLE", "WALK", "RUN", "SPRINT", "JUMP", "TURN", "SIT_DOWN", "INTERACT", "CROUCH"],
  RUN: ["IDLE", "WALK", "RUN", "SPRINT", "JUMP", "TURN"],
  SPRINT: ["RUN", "WALK", "SPRINT", "JUMP", "IDLE"],
  JUMP: ["JUMP", "LAND"],
  LAND: ["IDLE", "WALK", "RUN", "LAND"],
  CROUCH: ["CROUCH", "IDLE", "WALK"],
  SIT_DOWN: ["SIT_DOWN", "SEATED"],
  SEATED: ["SEATED", "STAND_UP", "MAKE_ROOM", "DANCE", "INTERACT"],
  MAKE_ROOM: ["MAKE_ROOM", "SEATED"],
  STAND_UP: ["STAND_UP", "IDLE"],
  DANCE: ["DANCE", "IDLE", "SEATED", "WALK"],
  INTERACT: ["INTERACT", "IDLE", "SEATED"],
});

export type MoveVerdict =
  | { ok: true; state: AvatarNetState }
  | { ok: false; reason: "STALE" | "TOO_FREQUENT" | "ILLEGAL_TRANSITION" | "TOO_FAST" | "ZONE_DENIED" | "SEAT_REQUIRED" | "NOT_SELF"; corrected: AvatarNetState };

/**
 * Validate one movement update against the last authoritative state. On refusal the caller
 * broadcasts `corrected` (server position wins; the client reconciles to it).
 */
export function validateMovementUpdate(input: {
  actorId: string;
  prev: AvatarNetState;
  next: AvatarNetState;
  zoneMap: VenueZoneMap | null;
  membership: RoomMembership;
  /** Seat the server has reserved for this actor (seat occupancy authority). */
  reservedSeatId: string | null;
}): MoveVerdict {
  const { prev, next } = input;
  const reject = (reason: Exclude<MoveVerdict, { ok: true }>["reason"], corrected: AvatarNetState = prev) => ({ ok: false as const, reason, corrected });
  if (next.participantId !== input.actorId || prev.participantId !== input.actorId) return reject("NOT_SELF");
  if (next.seq <= prev.seq || next.tMs <= prev.tMs) return reject("STALE");
  if (next.tMs - prev.tMs < MIN_UPDATE_INTERVAL_MS) return reject("TOO_FREQUENT");
  if (!TRANSITIONS[prev.state].includes(next.state)) return reject("ILLEGAL_TRANSITION");
  if ((next.state === "SIT_DOWN" || next.state === "SEATED") && (!next.seatId || next.seatId !== input.reservedSeatId)) return reject("SEAT_REQUIRED");
  const dt = (next.tMs - prev.tMs) / 1000;
  const dist = Math.hypot(next.pos[0] - prev.pos[0], next.pos[2] - prev.pos[2]);
  const limit = Math.max(MAX_SPEED[prev.state], MAX_SPEED[next.state]) * SPEED_TOLERANCE;
  if (dist / dt > limit) return reject("TOO_FAST");
  if (input.zoneMap) {
    const z = validateMove(input.zoneMap, input.membership, prev.pos, next.pos);
    if (!z.accepted) return reject("ZONE_DENIED", { ...prev, pos: z.position, seq: next.seq, tMs: next.tMs, state: "IDLE", speed: 0 });
  }
  const isMoving = dist > 0.01;
  return { ok: true, state: { ...next, speed: isMoving ? dist / dt : 0, isGrounded: next.state !== "JUMP" } };
}

// ─── Client-side smoothing for REMOTE avatars (presentation only) ─────────────

export const INTERPOLATION_DELAY_MS = 100;
export const MAX_EXTRAPOLATION_MS = 200;
export const SNAP_ERROR_M = 2;

/** Position to draw a remote avatar at `renderTimeMs`, from its buffered authoritative states. */
export function interpolateRemote(buffer: readonly AvatarNetState[], renderTimeMs: number): { pos: [number, number, number]; yaw: number; extrapolated: boolean } | null {
  if (buffer.length === 0) return null;
  const t = renderTimeMs - INTERPOLATION_DELAY_MS;
  const sorted = [...buffer].sort((a, b) => a.tMs - b.tMs);
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i]!;
    const b = sorted[i + 1]!;
    if (t >= a.tMs && t <= b.tMs) {
      const k = (t - a.tMs) / (b.tMs - a.tMs);
      return { pos: [a.pos[0] + (b.pos[0] - a.pos[0]) * k, a.pos[1] + (b.pos[1] - a.pos[1]) * k, a.pos[2] + (b.pos[2] - a.pos[2]) * k], yaw: a.yaw + (b.yaw - a.yaw) * k, extrapolated: false };
    }
  }
  const last = sorted[sorted.length - 1]!;
  if (t <= sorted[0]!.tMs) return { pos: [...sorted[0]!.pos], yaw: sorted[0]!.yaw, extrapolated: false };
  // Past the newest packet: extrapolate a little along the last velocity, then hold.
  const prev = sorted[sorted.length - 2];
  const ahead = Math.min(t - last.tMs, MAX_EXTRAPOLATION_MS) / 1000;
  if (!prev || ahead <= 0) return { pos: [...last.pos], yaw: last.yaw, extrapolated: false };
  const dt = (last.tMs - prev.tMs) / 1000 || 1;
  return {
    pos: [last.pos[0] + ((last.pos[0] - prev.pos[0]) / dt) * ahead, last.pos[1], last.pos[2] + ((last.pos[2] - prev.pos[2]) / dt) * ahead],
    yaw: last.yaw,
    extrapolated: true,
  };
}

/** Reconcile the drawn position to an authoritative correction: blend small errors, snap big ones. */
export function reconcile(drawn: [number, number, number], authoritative: [number, number, number], blend = 0.2): { pos: [number, number, number]; snapped: boolean } {
  const err = Math.hypot(drawn[0] - authoritative[0], drawn[1] - authoritative[1], drawn[2] - authoritative[2]);
  if (err > SNAP_ERROR_M) return { pos: [...authoritative], snapped: true };
  return { pos: [drawn[0] + (authoritative[0] - drawn[0]) * blend, drawn[1] + (authoritative[1] - drawn[1]) * blend, drawn[2] + (authoritative[2] - drawn[2]) * blend], snapped: false };
}
