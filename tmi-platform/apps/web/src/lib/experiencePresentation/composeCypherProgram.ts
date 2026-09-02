/**
 * composeCypherProgram — Phase 1 Cypher world presentation.
 *
 * Composes production PROGRAM.CYPHER_FOCUS from existing Cypher/Cipher lifecycle
 * (circle + mic handoff + rotation). Collaborative / sequential — NEVER Battle VS.
 * Does NOT mint a second LiveSession, WebRTC graph, or Universal Player runtime.
 * Never invents participants, winners, or scores (Rule 20).
 */

import type { CipherPresentationState } from "@/lib/cipher/CipherPresentationTypes";
import { assertPackAllowsComposition, getPresentationPack } from "./ExperiencePresentationDirector";
import {
  ExperienceSourceRegistry,
  type ExperienceDisplayTarget,
  type ExperienceSourceRecord,
} from "./ExperienceSourceRegistry";
import type { BroadcastCompositionLayout } from "./types";

/** Canonical PROGRAM source id (matrix + DNA). */
export const PROGRAM_CYPHER_FOCUS = "PROGRAM.CYPHER_FOCUS" as const;

export const ISO_ACTIVE_MIC = "ISO.ACTIVE_MIC" as const;
export const ISO_NEXT_UP = "ISO.NEXT_UP" as const;
export const ISO_CIRCLE_WIDE = "ISO.CIRCLE_WIDE" as const;

export type CypherCircleParticipant = {
  id: string;
  displayName: string;
};

/** Lifecycle phase alias — Cipher presentation states drive mic/circle layout. */
export type CypherLifecyclePhase = CipherPresentationState;

export type CypherProgramComposition = {
  sessionId: string;
  cypherId: string;
  roomId: string;
  packId: "Cypher";
  composition: BroadcastCompositionLayout;
  lifecyclePhase: CypherLifecyclePhase;
  programSourceId: typeof PROGRAM_CYPHER_FOCUS;
  /** Real circle members only — never invent. */
  circle: CypherCircleParticipant[];
  /** Current mic holder — null when waiting. */
  activeMic: CypherCircleParticipant | null;
  /** Next-up in rotation — null when none. */
  nextUp: CypherCircleParticipant | null;
  /** Always false for collaborative Cypher DNA — never surface VS dual. */
  dualOccupancy: false;
  /** Always null — Cypher pack forbids winner finale chrome. */
  winnerId: null;
  surfaceKind: "production";
  sources: ExperienceSourceRecord[];
  jumbotronBound: boolean;
  composedAtMs: number;
};

let activeRegistry: ExperienceSourceRegistry | null = null;
let activeComposition: CypherProgramComposition | null = null;

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

/**
 * Map Cipher/Cypher lifecycle → pack-allowed layout.
 * Hard law: never DUAL / A_DOMINANT / B_DOMINANT (Battle VS DNA).
 * SPLIT_CLASH and winner ceremony states still resolve to circle/mic focus —
 * collaborative Cypher does not present competitive ending chrome.
 */
export function mapCypherPhaseToComposition(
  phase: CypherLifecyclePhase,
  preferred?: BroadcastCompositionLayout
): BroadcastCompositionLayout {
  if (preferred) return preferred;

  switch (phase) {
    case "INTRO":
      return "HOST_CLOSE";
    case "PERFORMER_ENTRY":
    case "VERSE_ACTIVE":
    case "TIME_WARNING":
      return "HOST_CLOSE";
    case "MIC_PASS":
    case "NEXT_PERFORMER":
      return "CIRCLE_FOCUS";
    case "SPLIT_CLASH":
      // Faceoff may exist in legacy Cipher SM — presentation still refuses VS.
      return "CIRCLE_FOCUS";
    case "VOTING_OPEN":
    case "VOTING_LOCKING":
    case "RESULT_PROCESSING":
      return "PIP";
    case "WINNER_DECLARED":
    case "CEREMONY":
    case "REPLAY":
      // DNA: ignore competitive ending — stay collaborative circle.
      return "CIRCLE_FOCUS";
    case "LOBBY_OPEN":
    case "PARTICIPANTS_READY":
    case "NEXT_ROUND":
    case "EXIT":
    default:
      return "CIRCLE_FOCUS";
  }
}

function normalizeParticipant(
  id: string | undefined | null,
  displayName?: string | null
): CypherCircleParticipant | null {
  const trimmedId = id?.trim();
  if (!trimmedId) return null;
  const name = displayName?.trim() || trimmedId;
  return { id: trimmedId, displayName: name };
}

function normalizeCircle(
  members: Array<{ id: string; displayName?: string | null }> | null | undefined
): CypherCircleParticipant[] {
  if (!Array.isArray(members)) return [];
  const out: CypherCircleParticipant[] = [];
  const seen = new Set<string>();
  for (const m of members) {
    const p = normalizeParticipant(m?.id, m?.displayName);
    if (!p || seen.has(p.id)) continue;
    seen.add(p.id);
    out.push(p);
  }
  return out;
}

/**
 * Compose / refresh Cypher PROGRAM for an existing cypher session.
 * Idempotent for the same sessionId — rebinds targets without minting a new session.
 */
export function composeCypherProgram(opts: {
  sessionId: string;
  cypherId: string;
  roomId: string;
  /** Real circle participants only — omit empty rather than inventing. */
  circle?: Array<{ id: string; displayName?: string | null }> | null;
  /** Active mic holder — must match a circle member when set. */
  activeMicId?: string | null;
  activeMicDisplayName?: string | null;
  /** Next-up — must match a circle member when set; never invent. */
  nextUpId?: string | null;
  nextUpDisplayName?: string | null;
  lifecyclePhase?: CypherLifecyclePhase;
  /** Prefer CIRCLE_FOCUS (Cypher DNA). Never pass DUAL/A_DOMINANT/B_DOMINANT. */
  composition?: BroadcastCompositionLayout;
  bindJumbotron?: boolean;
}): CypherProgramComposition {
  const pack = getPresentationPack("Cypher");
  if (pack.allowsVsLayout) {
    throw new Error("Cypher pack must not allow VS layout");
  }
  if (pack.allowsWinnerFinale) {
    throw new Error("Cypher pack must not allow winner finale");
  }
  if (pack.allowsEliminationFinale) {
    throw new Error("Cypher pack must not allow elimination finale");
  }

  const circle = normalizeCircle(opts.circle);
  const circleById = new Map(circle.map((p) => [p.id, p]));

  // Active mic: only when id is real; prefer circle name when member.
  let activeMic: CypherCircleParticipant | null = null;
  const rawMicId = opts.activeMicId?.trim() || null;
  if (rawMicId) {
    activeMic =
      circleById.get(rawMicId) ??
      normalizeParticipant(rawMicId, opts.activeMicDisplayName);
    // If we have a circle and mic is not in it, drop invented stranger-as-mic.
    if (circle.length > 0 && !circleById.has(rawMicId)) {
      activeMic = null;
    }
  }

  let nextUp: CypherCircleParticipant | null = null;
  const rawNextId = opts.nextUpId?.trim() || null;
  if (rawNextId && rawNextId !== activeMic?.id) {
    nextUp =
      circleById.get(rawNextId) ??
      normalizeParticipant(rawNextId, opts.nextUpDisplayName);
    if (circle.length > 0 && !circleById.has(rawNextId)) {
      nextUp = null;
    }
  }

  // Derive next-up from circle rotation when mic is set but next omitted.
  if (activeMic && !nextUp && circle.length > 1) {
    const idx = circle.findIndex((p) => p.id === activeMic!.id);
    if (idx >= 0) {
      nextUp = circle[(idx + 1) % circle.length] ?? null;
      if (nextUp?.id === activeMic.id) nextUp = null;
    }
  }

  const lifecyclePhase: CypherLifecyclePhase =
    opts.lifecyclePhase ??
    (activeMic ? "VERSE_ACTIVE" : circle.length > 0 ? "PARTICIPANTS_READY" : "LOBBY_OPEN");

  const layout = mapCypherPhaseToComposition(lifecyclePhase, opts.composition);
  assertPackAllowsComposition("Cypher", layout);

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

  const micLabel = activeMic?.displayName ?? "Waiting for mic";
  activeRegistry.registerSource({
    sourceId: PROGRAM_CYPHER_FOCUS,
    kind: "PROGRAM",
    label: `Cypher · ${micLabel}`,
    decoderId: "universal-media-player",
    boundTargets: targets,
  });

  activeRegistry.registerSource({
    sourceId: ISO_CIRCLE_WIDE,
    kind: "ISO",
    label: `Circle · ${circle.length} in rotation`,
    decoderId: "cypher-circle",
    boundTargets: ["UNIVERSAL_PLAYER_PRIMARY"],
  });

  if (activeMic) {
    activeRegistry.registerSource({
      sourceId: ISO_ACTIVE_MIC,
      kind: "ISO",
      label: `On mic · ${activeMic.displayName}`,
      decoderId: "webrtc-active-mic",
      boundTargets: ["UNIVERSAL_PLAYER_PRIMARY"],
    });
  }

  if (nextUp) {
    activeRegistry.registerSource({
      sourceId: ISO_NEXT_UP,
      kind: "ISO",
      label: `Next up · ${nextUp.displayName}`,
      decoderId: "cypher-next-up",
      boundTargets: ["UNIVERSAL_PLAYER_SECONDARY"],
    });
  }

  if (bindJumbotron) {
    activeRegistry.registerSource({
      sourceId: "JUMBOTRON.CYPHER",
      kind: "JUMBOTRON",
      label: "In-venue Jumbotron · Cypher PROGRAM (mic + next-up)",
      decoderId: "jumbotron-surface",
      boundTargets: ["JUMBOTRON_IN_VENUE", "JUMBOTRON_DISCOVERY"],
    });
    activeRegistry.bindTarget(PROGRAM_CYPHER_FOCUS, "JUMBOTRON_IN_VENUE");
  }

  activeRegistry.bindTarget(PROGRAM_CYPHER_FOCUS, "UNIVERSAL_PLAYER_PRIMARY");
  activeRegistry.bindTarget(PROGRAM_CYPHER_FOCUS, "UNIVERSAL_PLAYER_SECONDARY");

  activeComposition = {
    sessionId: opts.sessionId,
    cypherId: opts.cypherId,
    roomId: opts.roomId,
    packId: "Cypher",
    composition: layout,
    lifecyclePhase,
    programSourceId: PROGRAM_CYPHER_FOCUS,
    circle,
    activeMic,
    nextUp,
    dualOccupancy: false,
    winnerId: null,
    surfaceKind: "production",
    sources: activeRegistry.listSources(),
    jumbotronBound: bindJumbotron,
    composedAtMs: Date.now(),
  };

  exposeProductionHook();
  return activeComposition;
}

export function getActiveCypherProgram(): CypherProgramComposition | null {
  return activeComposition;
}

export function clearCypherProgram(reason?: string): void {
  activeRegistry = null;
  activeComposition = null;
  if (typeof window !== "undefined") {
    const w = window as unknown as {
      __TMI_CYPHER_PROGRAM__?: CypherProgramComposition | null;
    };
    w.__TMI_CYPHER_PROGRAM__ = null;
    void reason;
  }
}

function exposeProductionHook(): void {
  if (typeof window === "undefined") return;
  (
    window as unknown as { __TMI_CYPHER_PROGRAM__?: CypherProgramComposition | null }
  ).__TMI_CYPHER_PROGRAM__ = activeComposition;
}

/** Cert helper — production surface only (never green_debug). */
export function isCypherProgramProductionSurface(): boolean {
  return activeComposition?.surfaceKind === "production";
}

/** Honest: Cypher never presents as Battle VS / winner chrome. */
export function isCypherVsFree(program: CypherProgramComposition | null): boolean {
  if (!program) return true;
  return (
    program.packId === "Cypher" &&
    program.dualOccupancy === false &&
    program.winnerId === null &&
    program.composition !== "DUAL" &&
    program.composition !== "A_DOMINANT" &&
    program.composition !== "B_DOMINANT"
  );
}
