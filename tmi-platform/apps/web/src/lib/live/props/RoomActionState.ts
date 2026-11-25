/**
 * RoomActionState — pure fold of the ordered room action log (client + server, same answer).
 *
 *  - Per actor, one active action per SLOT (hand / body / wrist / participation / select):
 *    an emote never knocks a lighter out of a hand.
 *  - Moments: one open moment per kind (latest MOMENT event wins; STOP closes it).
 *  - Tallies are REAL distinct actors only, inside the moment window. Nothing is padded,
 *    bots never count (callers pass human events only), crowd support is never a vote.
 */

import { roomActionPolicy, type MomentKind, type RoomActionSlot } from "./RoomActionCatalog";
import type { RoomPropEvent } from "./RoomPropEventModel";

export type RoomActionEvent = RoomPropEvent & { targetId?: string | null };

export type ActiveRoomAction = {
  actorId: string;
  actionId: string;
  slot: RoomActionSlot;
  eventId: string;
  seq: number;
  startAtMs: number;
  endsAtMs: number;
  seed: number;
  targetId: string | null;
};

const ordered = (events: readonly RoomActionEvent[]) => [...events].sort((a, b) => a.seq - b.seq);

function toActive(e: RoomActionEvent, slot: RoomActionSlot): ActiveRoomAction {
  return {
    actorId: e.actorId,
    actionId: e.propId,
    slot,
    eventId: e.eventId,
    seq: e.seq,
    startAtMs: e.startAtMs,
    endsAtMs: e.startAtMs + e.durationMs,
    seed: e.seed,
    targetId: e.targetId ?? null,
  };
}

/** actorId → slot → active action (stage/moment slots excluded; see foldOpenMoments/foldStageEffects). */
export function foldActorActions(events: readonly RoomActionEvent[], nowMs: number): Map<string, Map<RoomActionSlot, ActiveRoomAction>> {
  const last = new Map<string, { e: RoomActionEvent; slot: RoomActionSlot }>();
  for (const e of ordered(events)) {
    const p = roomActionPolicy(e.propId);
    if (!p || p.slot === "stage" || p.slot === "moment") continue;
    // STOP clears the slot it was aimed at; ACTIVATE replaces whatever was in that slot.
    last.set(`${e.actorId}\u0000${p.slot}`, { e, slot: p.slot });
  }
  const out = new Map<string, Map<RoomActionSlot, ActiveRoomAction>>();
  for (const { e, slot } of last.values()) {
    if (e.action !== "ACTIVATE" || e.startAtMs + e.durationMs <= nowMs) continue;
    const m = out.get(e.actorId) ?? new Map<RoomActionSlot, ActiveRoomAction>();
    m.set(slot, toActive(e, slot));
    out.set(e.actorId, m);
  }
  return out;
}

/** Currently playing host stage effects (several can overlap). */
export function foldStageEffects(events: readonly RoomActionEvent[], nowMs: number): ActiveRoomAction[] {
  return ordered(events)
    .filter((e) => e.action === "ACTIVATE" && roomActionPolicy(e.propId)?.slot === "stage" && e.startAtMs + e.durationMs > nowMs)
    .map((e) => toActive(e, "stage"));
}

/** momentKind → the open moment (latest per kind; STOP or expiry closes it). */
export function foldOpenMoments(events: readonly RoomActionEvent[], nowMs: number): Map<MomentKind, ActiveRoomAction> {
  const last = new Map<MomentKind, RoomActionEvent>();
  for (const e of ordered(events)) {
    const k = roomActionPolicy(e.propId)?.opensMoment;
    if (k) last.set(k, e);
  }
  const out = new Map<MomentKind, ActiveRoomAction>();
  for (const [k, e] of last) {
    if (e.action === "ACTIVATE" && e.startAtMs + e.durationMs > nowMs) out.set(k, toActive(e, "moment"));
  }
  return out;
}

export type MomentTally = {
  kind: MomentKind;
  momentEventId: string;
  /** Distinct real participants (opted in during this moment). */
  participants: number;
  /** For choice moments (crowd colour, team sections): latest choice per actor. */
  choices: Record<string, number>;
  /** Spotlight / dance cam: actors who consented and whose consent is still active. */
  consentedActorIds: string[];
};

/**
 * Real participation for an open moment. Only events AFTER the moment opened and before it
 * ends count; each actor counts once; for choice groups an actor's latest choice wins.
 */
export function tallyMoment(events: readonly RoomActionEvent[], kind: MomentKind, nowMs: number): MomentTally | null {
  const open = foldOpenMoments(events, nowMs).get(kind);
  if (!open) return null;
  const windowEvents = ordered(events).filter((e) => e.seq > open.seq && e.startAtMs < open.endsAtMs);
  const inWindow = windowEvents.filter((e) => e.action === "ACTIVATE");
  const participants = new Set<string>();
  const choiceByActor = new Map<string, string>();
  const consent = new Map<string, RoomActionEvent>();
  for (const e of inWindow) {
    const p = roomActionPolicy(e.propId);
    if (!p) continue;
    const qualifies =
      (kind === "raise_your_lights" && p.isConcertLight === true) ||
      (p.countsToward === kind) ||
      (p.kind === "PARTICIPATION" && p.requiresMoment === kind);
    if (!qualifies) continue;
    participants.add(e.actorId);
    if (p.choiceGroup) choiceByActor.set(e.actorId, p.id);
  }
  // Consent = each fan's LATEST consent event (a STOP withdraws it immediately).
  for (const e of windowEvents) {
    const p = roomActionPolicy(e.propId);
    if (p?.kind === "PARTICIPATION" && p.requiresMoment === kind && (kind === "spotlight" || kind === "dance_cam")) consent.set(e.actorId, e);
  }
  const choices: Record<string, number> = {};
  for (const c of choiceByActor.values()) choices[c] = (choices[c] ?? 0) + 1;
  const consentedActorIds = [...consent.values()]
    .filter((e) => e.action === "ACTIVATE" && e.startAtMs + e.durationMs > nowMs)
    .map((e) => e.actorId);
  return { kind, momentEventId: open.eventId, participants: participants.size, choices, consentedActorIds };
}
