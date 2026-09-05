/**
 * composeBattleProgram — Phase 1 Battle world presentation (not cinematic Voltron).
 *
 * Composes production PROGRAM.BATTLE_COMPOSITE from existing Battle lifecycle
 * (BattleBroadcastStateMachine + optional WinnerStays / settled scores).
 * Does NOT mint a second LiveSession, WebRTC graph, or Universal Player runtime.
 * Never invents a second participant, score, or winner.
 */

import {
  battleBroadcastStateMachine,
  type BattleBroadcastEntry,
  type BattleBroadcastState,
} from "@/lib/competition/BattleBroadcastStateMachine";
import { assertPackAllowsComposition, getPresentationPack } from "./ExperiencePresentationDirector";
import {
  ExperienceSourceRegistry,
  type ExperienceDisplayTarget,
  type ExperienceSourceRecord,
} from "./ExperienceSourceRegistry";
import type { BroadcastCompositionLayout } from "./types";

/** Canonical PROGRAM source id (matrix + DNA). */
export const PROGRAM_BATTLE_COMPOSITE = "PROGRAM.BATTLE_COMPOSITE" as const;

export const ISO_CORNER_A = "ISO.CORNER_A" as const;
export const ISO_CORNER_B = "ISO.CORNER_B" as const;

export type BattleCornerParticipant = {
  id: string;
  displayName: string;
};

export type BattleScoreboard = {
  scoreA: number;
  scoreB: number;
};

export type BattleProgramComposition = {
  sessionId: string;
  battleId: string;
  roomId: string;
  packId: "Battle";
  composition: BroadcastCompositionLayout;
  broadcastState: BattleBroadcastState;
  programSourceId: typeof PROGRAM_BATTLE_COMPOSITE;
  cornerA: BattleCornerParticipant | null;
  cornerB: BattleCornerParticipant | null;
  dualOccupancy: boolean;
  /** Winner only when engine/broadcast authorizes — never invented. */
  winnerId: string | null;
  /** Scores only when caller supplies real ledger values — never invented. */
  scores: BattleScoreboard | null;
  surfaceKind: "production";
  sources: ExperienceSourceRecord[];
  jumbotronBound: boolean;
  composedAtMs: number;
};

let activeRegistry: ExperienceSourceRegistry | null = null;
let activeComposition: BattleProgramComposition | null = null;

function defaultTargets(bindJumbotron: boolean): ExperienceDisplayTarget[] {
  const targets: ExperienceDisplayTarget[] = [
    "UNIVERSAL_PLAYER_PRIMARY",
    "UNIVERSAL_PLAYER_SECONDARY",
  ];
  if (bindJumbotron) {
    targets.push("JUMBOTRON_IN_VENUE", "JUMBOTRON_DISCOVERY");
  }
  return targets;
}

function resolveComposition(
  dual: boolean,
  broadcastState: BattleBroadcastState,
  winnerId: string | null,
  cornerAId: string | null,
  cornerBId: string | null,
  preferred?: BroadcastCompositionLayout
): BroadcastCompositionLayout {
  if (preferred) return preferred;

  if (winnerId && dual) {
    if (cornerBId && winnerId === cornerBId) return "B_DOMINANT";
    if (cornerAId && winnerId === cornerAId) return "A_DOMINANT";
    return "DUAL";
  }

  switch (broadcastState) {
    case "SOLO_WAITING":
      return "A_DOMINANT";
    case "OPPONENT_JOINED":
    case "VS_REVEAL":
    case "BATTLE_LIVE":
    case "ROUND_BREAK":
      return dual ? "DUAL" : "A_DOMINANT";
    case "WINNER_REVEAL":
      if (cornerBId && winnerId === cornerBId) return "B_DOMINANT";
      return dual ? "A_DOMINANT" : "A_DOMINANT";
    default:
      return dual ? "DUAL" : "A_DOMINANT";
  }
}

function normalizeParticipant(
  id: string | undefined | null,
  displayName?: string | null
): BattleCornerParticipant | null {
  const trimmedId = id?.trim();
  if (!trimmedId) return null;
  const name = displayName?.trim() || trimmedId;
  return { id: trimmedId, displayName: name };
}

/**
 * Compose / refresh Battle PROGRAM for an existing battle session.
 * Idempotent for the same sessionId — rebinds targets without minting a new session.
 */
export function composeBattleProgram(opts: {
  sessionId: string;
  battleId: string;
  roomId: string;
  /** Authoritative corner A — if omitted, read from broadcast machine when present. */
  cornerA?: { id: string; displayName?: string | null } | null;
  cornerB?: { id: string; displayName?: string | null } | null;
  /** Optional real scores only — omit or null rather than inventing. */
  scores?: BattleScoreboard | null;
  /** Prefer DUAL when dual occupancy (Battle DNA); SPLIT allowed as single-screen fallback. */
  composition?: BroadcastCompositionLayout;
  bindJumbotron?: boolean;
  /** Optional broadcast override for tests — defaults to battleBroadcastStateMachine. */
  broadcastEntry?: BattleBroadcastEntry | null;
}): BattleProgramComposition {
  const pack = getPresentationPack("Battle");
  if (!pack.allowsVsLayout) {
    throw new Error("Battle pack must allow VS");
  }

  const broadcast =
    opts.broadcastEntry ?? battleBroadcastStateMachine.getState(opts.battleId) ?? null;

  const cornerA =
    normalizeParticipant(opts.cornerA?.id, opts.cornerA?.displayName) ??
    normalizeParticipant(broadcast?.competitorAId) ??
    null;

  const cornerB =
    normalizeParticipant(opts.cornerB?.id, opts.cornerB?.displayName) ??
    normalizeParticipant(broadcast?.competitorBId) ??
    null;

  const dualOccupancy = Boolean(cornerA && cornerB);

  // Winner: broadcast machine only when it matches a known corner — never invent.
  // Settled engine winners should be pushed into battleBroadcastStateMachine.revealWinner first.
  const rawWinner = broadcast?.winnerId?.trim() || null;
  const authorizedWinner =
    rawWinner &&
    (rawWinner === cornerA?.id || rawWinner === cornerB?.id)
      ? rawWinner
      : null;

  // Read-only on broadcast machine — compose never schedules VS timers.
  const broadcastState: BattleBroadcastState =
    broadcast?.state ??
    (authorizedWinner
      ? "WINNER_REVEAL"
      : dualOccupancy
        ? "BATTLE_LIVE"
        : "SOLO_WAITING");

  const layout = resolveComposition(
    dualOccupancy,
    broadcastState,
    authorizedWinner,
    cornerA?.id ?? null,
    cornerB?.id ?? null,
    opts.composition
  );
  assertPackAllowsComposition("Battle", layout);

  // Scores: only when explicitly provided with finite numbers — never fabricate.
  const scores =
    opts.scores &&
    Number.isFinite(opts.scores.scoreA) &&
    Number.isFinite(opts.scores.scoreB)
      ? { scoreA: opts.scores.scoreA, scoreB: opts.scores.scoreB }
      : null;

  if (activeRegistry && activeRegistry.getSessionId() !== opts.sessionId) {
    activeRegistry = null;
    activeComposition = null;
  }

  if (!activeRegistry) {
    activeRegistry = new ExperienceSourceRegistry(opts.sessionId);
  } else {
    activeRegistry.assertSameSession(opts.sessionId);
  }

  const bindJumbotron = opts.bindJumbotron ?? true;
  const targets = defaultTargets(bindJumbotron);

  activeRegistry.registerSource({
    sourceId: PROGRAM_BATTLE_COMPOSITE,
    kind: "PROGRAM",
    label: dualOccupancy
      ? `Battle · ${cornerA!.displayName} VS ${cornerB!.displayName}`
      : `Battle · ${cornerA?.displayName ?? "Waiting"}`,
    decoderId: "universal-media-player",
    boundTargets: targets,
  });

  if (cornerA) {
    activeRegistry.registerSource({
      sourceId: ISO_CORNER_A,
      kind: "ISO",
      label: `Corner A · ${cornerA.displayName}`,
      decoderId: "webrtc-corner-a",
      boundTargets: ["UNIVERSAL_PLAYER_PRIMARY"],
    });
  }

  if (cornerB) {
    activeRegistry.registerSource({
      sourceId: ISO_CORNER_B,
      kind: "ISO",
      label: `Corner B · ${cornerB.displayName}`,
      decoderId: "webrtc-corner-b",
      boundTargets: ["UNIVERSAL_PLAYER_SECONDARY"],
    });
  }

  if (bindJumbotron) {
    activeRegistry.registerSource({
      sourceId: "JUMBOTRON.BATTLE",
      kind: "JUMBOTRON",
      label: "In-venue Jumbotron · Battle PROGRAM (P2 show-critical)",
      decoderId: "jumbotron-surface",
      boundTargets: ["JUMBOTRON_IN_VENUE", "JUMBOTRON_DISCOVERY"],
    });
    activeRegistry.bindTarget(PROGRAM_BATTLE_COMPOSITE, "JUMBOTRON_IN_VENUE");
  }

  activeRegistry.bindTarget(PROGRAM_BATTLE_COMPOSITE, "UNIVERSAL_PLAYER_PRIMARY");
  activeRegistry.bindTarget(PROGRAM_BATTLE_COMPOSITE, "UNIVERSAL_PLAYER_SECONDARY");

  activeComposition = {
    sessionId: opts.sessionId,
    battleId: opts.battleId,
    roomId: opts.roomId,
    packId: "Battle",
    composition: layout,
    broadcastState,
    programSourceId: PROGRAM_BATTLE_COMPOSITE,
    cornerA,
    cornerB,
    dualOccupancy,
    winnerId: authorizedWinner,
    scores,
    surfaceKind: "production",
    sources: activeRegistry.listSources(),
    jumbotronBound: bindJumbotron,
    composedAtMs: Date.now(),
  };

  exposeProductionHook();
  return activeComposition;
}

export function getActiveBattleProgram(): BattleProgramComposition | null {
  return activeComposition;
}

export function clearBattleProgram(reason?: string): void {
  activeRegistry = null;
  activeComposition = null;
  if (typeof window !== "undefined") {
    const w = window as unknown as {
      __TMI_BATTLE_PROGRAM__?: BattleProgramComposition | null;
    };
    w.__TMI_BATTLE_PROGRAM__ = null;
    void reason;
  }
}

function exposeProductionHook(): void {
  if (typeof window === "undefined") return;
  (window as unknown as { __TMI_BATTLE_PROGRAM__?: BattleProgramComposition | null }).__TMI_BATTLE_PROGRAM__ =
    activeComposition;
}

/** Cert helper — production surface only (never green_debug). */
export function isBattleProgramProductionSurface(): boolean {
  return activeComposition?.surfaceKind === "production";
}

/** Honest dual check — both corners required; never invent B. */
export function hasRealDualOccupancy(program: BattleProgramComposition | null): boolean {
  return Boolean(program?.dualOccupancy && program.cornerA && program.cornerB);
}
