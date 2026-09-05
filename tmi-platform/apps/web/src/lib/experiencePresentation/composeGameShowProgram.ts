/**
 * composeGameShowProgram — Phase 1 Official Game Show presentation.
 *
 * Composes production PROGRAM.GAME_SHOW from existing show lifecycle
 * (ShowRuntime / DealOrFeudEngine / HostShowAssignment) + optional real board/turn state.
 * Host + contestants + board/objective + timer + prize ledger view —
 * NEVER Battle VS corners, NEVER Cypher circle combat.
 * Official formats only (Deal or Feud, Name That Tune, Circle and Squares).
 * Does NOT mint a second LiveSession, WebRTC graph, or Universal Player runtime.
 * Never invents contestants, scores, boards, or prize winners (Rule 20).
 * Winner / prize only when caller supplies engine-authoritative ids.
 */

import { getShowHosts } from "@/lib/hosts/HostShowAssignmentEngine";
import { getHostById } from "@/lib/hosts/HostIdentityRegistry";
import { assertPackAllowsComposition, getPresentationPack } from "./ExperiencePresentationDirector";
import {
  ExperienceSourceRegistry,
  type ExperienceDisplayTarget,
  type ExperienceSourceRecord,
} from "./ExperienceSourceRegistry";
import type { BroadcastCompositionLayout, ExperiencePackId } from "./types";

/** Canonical PROGRAM source id (matrix + DNA). */
export const PROGRAM_GAME_SHOW = "PROGRAM.GAME_SHOW" as const;

export const ISO_GAME_HOST = "ISO.HOST" as const;
export const ISO_GAME_CONTESTANT = "ISO.CONTESTANT" as const;
export const ISO_GAME_BOARD = "ISO.BOARD" as const;
export const ISO_GAME_AUDIENCE = "ISO.AUDIENCE" as const;
export const ISO_GAME_PRIZE = "ISO.PRIZE" as const;

/** Official World flagship only — Game Shows are bot-hosted Official events (Rule 21). */
export type GameShowScope = "WORLD";

/** Official formats that already exist in engines/routes — never invent a new format. */
export type GameShowFormatId =
  | "DEAL_OR_FEUD"
  | "NAME_THAT_TUNE"
  | "CIRCLE_AND_SQUARES";

export type GameShowLifecyclePhase =
  | "PRESHOW"
  | "HOST_OPEN"
  | "BOARD_LIVE"
  | "CONTESTANT_TURN"
  | "REVEAL"
  | "PRIZE_LEDGER"
  | "WINNER_REVEAL"
  | "POST_SHOW";

export type GameShowHost = {
  id: string;
  displayName: string;
  /** True when host is a platform bot / system character. */
  isBot: boolean;
  role: "MAIN" | "CO_HOST" | "PRIZE_HOST";
};

export type GameShowContestantSnapshot = {
  id: string;
  displayName: string;
  /** Score from authoritative engine only — omitted/0 when unknown, never invented. */
  score: number;
};

export type GameShowBoardSnapshot = {
  category: string;
  /** Revealed answer count when known — never invent total. */
  revealedCount: number;
  answerCount: number;
};

export type GameShowPrizeSnapshot = {
  entryId: string;
  label: string;
  currencyKind: "XP" | "CREDIT" | "CASH_GATED";
  amount: number;
  /** Only set when authoritativeGrantId was supplied — never invent cash awards. */
  awardedToContestantId: string | null;
  authoritativeGrantId: string | null;
};

export type GameShowProgramComposition = {
  sessionId: string;
  showId: string;
  roomId: string;
  formatId: GameShowFormatId;
  packId: Extract<ExperiencePackId, "GameShow">;
  scope: GameShowScope;
  /** Always 🌍 WORLD — Official Automated Event (Rule 21). */
  worldMiniBadge: "🌍 WORLD";
  composition: BroadcastCompositionLayout;
  lifecyclePhase: GameShowLifecyclePhase;
  programSourceId: typeof PROGRAM_GAME_SHOW;
  mainHost: GameShowHost | null;
  coHosts: GameShowHost[];
  prizeHost: GameShowHost | null;
  /** Real contestants only — empty when none supplied (honest empty). */
  contestants: GameShowContestantSnapshot[];
  /** Active contestant turn — null when none. */
  activeContestantId: string | null;
  /** Real board state only — null when none. */
  board: GameShowBoardSnapshot | null;
  /** Turn timer remaining ms when known — null when unknown (never invent). */
  turnRemainingMs: number | null;
  /** Round index when known — null when unknown. */
  roundIndex: number | null;
  /** Prize ledger entries — only real intents / authoritative awards. */
  prizeLedger: GameShowPrizeSnapshot[];
  /**
   * Winner only when engine-authoritative winnerId matches a supplied contestant.
   * null otherwise — never invent (Rule 20). Pack allows winner finale chrome when set.
   */
  winnerId: string | null;
  /**
   * Real audience/presence count when known from seat/presence engines.
   * null = unknown — never invent attendance (Rule 20).
   */
  audiencePresenceCount: number | null;
  /** Always false — Game Show DNA is not Battle VS. */
  dualOccupancy: false;
  /** Always false — Official Game Show ≠ Regular GO LIVE. */
  isRegularGoLive: false;
  surfaceKind: "production";
  sources: ExperienceSourceRecord[];
  jumbotronBound: boolean;
  composedAtMs: number;
};

let activeRegistry: ExperienceSourceRegistry | null = null;
let activeComposition: GameShowProgramComposition | null = null;

const FORMAT_TO_SHOW_ID: Record<GameShowFormatId, string> = {
  DEAL_OR_FEUD: "deal-or-feud",
  NAME_THAT_TUNE: "name-that-tune",
  CIRCLE_AND_SQUARES: "circle-squares",
};

const FORMAT_LABEL: Record<GameShowFormatId, string> = {
  DEAL_OR_FEUD: "Deal or Feud 1000",
  NAME_THAT_TUNE: "Name That Tune",
  CIRCLE_AND_SQUARES: "Circle and Squares",
};

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
 * Map game-show lifecycle → pack-allowed layout.
 * Hard law: never DUAL / A_DOMINANT / B_DOMINANT (Battle VS DNA).
 * Never CIRCLE_FOCUS (Cypher DNA). SPLIT allowed for host + board dual-panel.
 */
export function mapGameShowPhaseToComposition(
  phase: GameShowLifecyclePhase,
  preferred?: BroadcastCompositionLayout
): BroadcastCompositionLayout {
  if (preferred) return preferred;

  switch (phase) {
    case "PRESHOW":
    case "HOST_OPEN":
      return "HOST_CLOSE";
    case "BOARD_LIVE":
    case "REVEAL":
      return "GAME_BOARD";
    case "CONTESTANT_TURN":
      return "SPLIT";
    case "PRIZE_LEDGER":
      return "PIP";
    case "WINNER_REVEAL":
      return "HOST_CLOSE";
    case "POST_SHOW":
      return "HOST_CLOSE";
    default:
      return "GAME_BOARD";
  }
}

function normalizeContestants(
  items:
    | Array<{ id: string; displayName?: string | null; score?: number | null }>
    | null
    | undefined
): GameShowContestantSnapshot[] {
  if (!Array.isArray(items)) return [];
  const out: GameShowContestantSnapshot[] = [];
  const seen = new Set<string>();
  for (const c of items) {
    const id = c?.id?.trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const score =
      typeof c.score === "number" && Number.isFinite(c.score) && c.score >= 0
        ? Math.floor(c.score)
        : 0;
    out.push({
      id,
      displayName: c.displayName?.trim() || id,
      score,
    });
  }
  return out;
}

function normalizeBoard(
  board:
    | {
        category?: string | null;
        revealedCount?: number | null;
        answerCount?: number | null;
      }
    | null
    | undefined
): GameShowBoardSnapshot | null {
  const category = board?.category?.trim();
  if (!category) return null;
  const answerCount =
    typeof board?.answerCount === "number" &&
    Number.isFinite(board.answerCount) &&
    board.answerCount >= 0
      ? Math.floor(board.answerCount)
      : 0;
  const revealedCount =
    typeof board?.revealedCount === "number" &&
    Number.isFinite(board.revealedCount) &&
    board.revealedCount >= 0
      ? Math.min(Math.floor(board.revealedCount), answerCount || Math.floor(board.revealedCount))
      : 0;
  return { category, revealedCount, answerCount };
}

function normalizePrizeLedger(
  items:
    | Array<{
        entryId: string;
        label: string;
        currencyKind: "XP" | "CREDIT" | "CASH_GATED";
        amount: number;
        awardedToContestantId?: string | null;
        authoritativeGrantId?: string | null;
      }>
    | null
    | undefined
): GameShowPrizeSnapshot[] {
  if (!Array.isArray(items)) return [];
  const out: GameShowPrizeSnapshot[] = [];
  const seen = new Set<string>();
  for (const p of items) {
    const entryId = p?.entryId?.trim();
    const label = p?.label?.trim();
    if (!entryId || !label || seen.has(entryId)) continue;
    if (!["XP", "CREDIT", "CASH_GATED"].includes(p.currencyKind)) continue;
    if (typeof p.amount !== "number" || !Number.isFinite(p.amount) || p.amount < 0) continue;
    seen.add(entryId);
    const grant = p.authoritativeGrantId?.trim() || null;
    const awarded = grant ? p.awardedToContestantId?.trim() || null : null;
    out.push({
      entryId,
      label,
      currencyKind: p.currencyKind,
      amount: Math.floor(p.amount),
      awardedToContestantId: awarded,
      authoritativeGrantId: grant,
    });
  }
  return out;
}

function normalizeTurnRemainingMs(ms: number | null | undefined): number | null {
  if (typeof ms !== "number" || !Number.isFinite(ms) || ms < 0) return null;
  return Math.floor(ms);
}

function normalizeAudiencePresence(count: number | null | undefined): number | null {
  if (typeof count !== "number" || !Number.isFinite(count) || count < 0) return null;
  return Math.floor(count);
}

function resolveHostsFromRegistry(showId: string): {
  mainHost: GameShowHost | null;
  coHosts: GameShowHost[];
  prizeHost: GameShowHost | null;
} {
  const assignment = getShowHosts(showId);
  if (!assignment) {
    return { mainHost: null, coHosts: [], prizeHost: null };
  }

  const mainIdentity = getHostById(assignment.mainHostId);
  const mainHost: GameShowHost | null = assignment.mainHostId
    ? {
        id: assignment.mainHostId,
        displayName: mainIdentity?.name?.trim() || assignment.mainHostId,
        isBot: true,
        role: "MAIN",
      }
    : null;

  const coHosts: GameShowHost[] = [];
  for (const coId of assignment.coHostIds ?? []) {
    const trimmed = coId?.trim();
    if (!trimmed) continue;
    const identity = getHostById(trimmed);
    coHosts.push({
      id: trimmed,
      displayName: identity?.name?.trim() || trimmed,
      isBot: true,
      role: "CO_HOST",
    });
  }

  const prizeHostId = assignment.prizeHostId?.trim() || null;
  let prizeHost: GameShowHost | null = null;
  if (prizeHostId) {
    const identity = getHostById(prizeHostId);
    prizeHost = {
      id: prizeHostId,
      displayName: identity?.name?.trim() || prizeHostId,
      isBot: true,
      role: "PRIZE_HOST",
    };
  }

  return { mainHost, coHosts, prizeHost };
}

/**
 * Compose / refresh Game Show PROGRAM for an existing show session.
 * Idempotent for the same sessionId — rebinds targets without minting a new session.
 */
export function composeGameShowProgram(opts: {
  sessionId: string;
  formatId?: GameShowFormatId;
  showId?: string;
  roomId: string;
  /** Real contestants only — omit rather than invent. */
  contestants?: Array<{
    id: string;
    displayName?: string | null;
    score?: number | null;
  }> | null;
  /** Active turn contestant id — must match a supplied contestant. */
  activeContestantId?: string | null;
  /** Real board snapshot only — omit rather than invent. */
  board?: {
    category?: string | null;
    revealedCount?: number | null;
    answerCount?: number | null;
  } | null;
  turnRemainingMs?: number | null;
  roundIndex?: number | null;
  /** Prize intents / awards — awards require authoritativeGrantId. */
  prizeLedger?: Array<{
    entryId: string;
    label: string;
    currencyKind: "XP" | "CREDIT" | "CASH_GATED";
    amount: number;
    awardedToContestantId?: string | null;
    authoritativeGrantId?: string | null;
  }> | null;
  /**
   * Engine-authoritative winner only — must match a supplied contestant.
   * Never invent (Rule 20).
   */
  winnerId?: string | null;
  /** Real audience occupancy only — null when unknown. */
  audiencePresenceCount?: number | null;
  lifecyclePhase?: GameShowLifecyclePhase;
  /** Prefer GAME_BOARD / HOST_CLOSE / SPLIT / PIP. Never pass DUAL/A_DOMINANT/B_DOMINANT/CIRCLE_FOCUS. */
  composition?: BroadcastCompositionLayout;
  bindJumbotron?: boolean;
}): GameShowProgramComposition {
  const packId = "GameShow" as const;
  const pack = getPresentationPack(packId);

  if (pack.isRegularGoLive) {
    throw new Error(`${packId} pack must not alias Regular GO LIVE`);
  }
  if (pack.allowsVsLayout) {
    throw new Error(`${packId} pack must not allow VS layout`);
  }

  const formatId: GameShowFormatId = opts.formatId ?? "DEAL_OR_FEUD";
  const showId = opts.showId?.trim() || FORMAT_TO_SHOW_ID[formatId];
  const { mainHost, coHosts, prizeHost } = resolveHostsFromRegistry(showId);

  const contestants = normalizeContestants(opts.contestants);
  const contestantIds = new Set(contestants.map((c) => c.id));

  const activeRaw = opts.activeContestantId?.trim() || null;
  const activeContestantId =
    activeRaw && contestantIds.has(activeRaw) ? activeRaw : null;

  const board = normalizeBoard(opts.board);
  const turnRemainingMs = normalizeTurnRemainingMs(opts.turnRemainingMs);
  const roundIndex =
    typeof opts.roundIndex === "number" &&
    Number.isFinite(opts.roundIndex) &&
    opts.roundIndex >= 0
      ? Math.floor(opts.roundIndex)
      : null;

  const prizeLedger = normalizePrizeLedger(opts.prizeLedger);

  const winnerRaw = opts.winnerId?.trim() || null;
  const winnerId =
    pack.allowsWinnerFinale && winnerRaw && contestantIds.has(winnerRaw)
      ? winnerRaw
      : null;

  const audiencePresenceCount = normalizeAudiencePresence(opts.audiencePresenceCount);

  const lifecyclePhase: GameShowLifecyclePhase =
    opts.lifecyclePhase ??
    (winnerId
      ? "WINNER_REVEAL"
      : activeContestantId
        ? "CONTESTANT_TURN"
        : board
          ? "BOARD_LIVE"
          : mainHost
            ? "HOST_OPEN"
            : "PRESHOW");

  const layout = mapGameShowPhaseToComposition(lifecyclePhase, opts.composition);
  assertPackAllowsComposition(packId, layout);

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
  const formatLabel = FORMAT_LABEL[formatId];
  const hostLabel = mainHost?.displayName ?? "Waiting for host";
  const activeName =
    contestants.find((c) => c.id === activeContestantId)?.displayName ?? null;

  activeRegistry.registerSource({
    sourceId: PROGRAM_GAME_SHOW,
    kind: "PROGRAM",
    label: `🌍 WORLD ${formatLabel} · ${activeName ?? (board ? board.category : hostLabel)}`,
    decoderId: "universal-media-player",
    boundTargets: targets,
  });

  activeRegistry.registerSource({
    sourceId: ISO_GAME_HOST,
    kind: "ISO",
    label: mainHost ? `Host · ${mainHost.displayName}` : "Host desk · empty",
    decoderId: "webrtc-host-cam",
    boundTargets: ["UNIVERSAL_PLAYER_PRIMARY"],
  });

  if (activeContestantId && activeName) {
    activeRegistry.registerSource({
      sourceId: ISO_GAME_CONTESTANT,
      kind: "ISO",
      label: `Contestant · ${activeName}`,
      decoderId: "webrtc-contestant-cam",
      boundTargets: ["UNIVERSAL_PLAYER_PRIMARY"],
    });
  }

  if (board) {
    activeRegistry.registerSource({
      sourceId: ISO_GAME_BOARD,
      kind: "ISO",
      label: `Board · ${board.category}`,
      decoderId: "game-board-surface",
      boundTargets: ["UNIVERSAL_PLAYER_SECONDARY"],
    });
  }

  if (audiencePresenceCount !== null) {
    activeRegistry.registerSource({
      sourceId: ISO_GAME_AUDIENCE,
      kind: "ISO",
      label: `Audience presence · ${audiencePresenceCount}`,
      decoderId: "audience-presence",
      boundTargets: ["UNIVERSAL_PLAYER_SECONDARY"],
    });
  }

  if (prizeLedger.length > 0) {
    activeRegistry.registerSource({
      sourceId: ISO_GAME_PRIZE,
      kind: "ISO",
      label: `Prize ledger · ${prizeLedger.length} entr${prizeLedger.length === 1 ? "y" : "ies"}`,
      decoderId: "prize-ledger",
      boundTargets: ["UNIVERSAL_PLAYER_SECONDARY"],
    });
  }

  if (bindJumbotron) {
    activeRegistry.registerSource({
      sourceId: "JUMBOTRON.GAME_SHOW",
      kind: "JUMBOTRON",
      label: `In-venue Jumbotron · 🌍 WORLD ${formatLabel} PROGRAM`,
      decoderId: "jumbotron-surface",
      boundTargets: ["JUMBOTRON_IN_VENUE", "JUMBOTRON_DISCOVERY"],
    });
    activeRegistry.bindTarget(PROGRAM_GAME_SHOW, "JUMBOTRON_IN_VENUE");
  }

  activeRegistry.bindTarget(PROGRAM_GAME_SHOW, "UNIVERSAL_PLAYER_PRIMARY");
  activeRegistry.bindTarget(PROGRAM_GAME_SHOW, "UNIVERSAL_PLAYER_SECONDARY");

  activeComposition = {
    sessionId: opts.sessionId,
    showId,
    roomId: opts.roomId,
    formatId,
    packId,
    scope: "WORLD",
    worldMiniBadge: "🌍 WORLD",
    composition: layout,
    lifecyclePhase,
    programSourceId: PROGRAM_GAME_SHOW,
    mainHost,
    coHosts,
    prizeHost,
    contestants,
    activeContestantId,
    board,
    turnRemainingMs,
    roundIndex,
    prizeLedger,
    winnerId,
    audiencePresenceCount,
    dualOccupancy: false,
    isRegularGoLive: false,
    surfaceKind: "production",
    sources: activeRegistry.listSources(),
    jumbotronBound: bindJumbotron,
    composedAtMs: Date.now(),
  };

  exposeProductionHook();
  return activeComposition;
}

export function getActiveGameShowProgram(): GameShowProgramComposition | null {
  return activeComposition;
}

export function clearGameShowProgram(reason?: string): void {
  activeRegistry = null;
  activeComposition = null;
  if (typeof window !== "undefined") {
    const w = window as unknown as {
      __TMI_GAME_SHOW_PROGRAM__?: GameShowProgramComposition | null;
    };
    w.__TMI_GAME_SHOW_PROGRAM__ = null;
    void reason;
  }
}

function exposeProductionHook(): void {
  if (typeof window === "undefined") return;
  (
    window as unknown as { __TMI_GAME_SHOW_PROGRAM__?: GameShowProgramComposition | null }
  ).__TMI_GAME_SHOW_PROGRAM__ = activeComposition;
}

/** Cert helper — production surface only (never green_debug). */
export function isGameShowProgramProductionSurface(): boolean {
  return activeComposition?.surfaceKind === "production";
}

/** Honest: Game Show never presents as Battle VS / Cypher circle / Regular GO LIVE. */
export function isGameShowVsFree(program: GameShowProgramComposition | null): boolean {
  if (!program) return true;
  return (
    program.packId === "GameShow" &&
    program.dualOccupancy === false &&
    program.isRegularGoLive === false &&
    program.composition !== "DUAL" &&
    program.composition !== "A_DOMINANT" &&
    program.composition !== "B_DOMINANT" &&
    program.composition !== "CIRCLE_FOCUS"
  );
}
