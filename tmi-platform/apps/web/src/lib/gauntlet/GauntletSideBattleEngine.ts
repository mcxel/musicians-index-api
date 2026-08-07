/**
 * GauntletSideBattleEngine — SEQUENCED side-battle window between main rounds.
 *
 * Eliminated competitors wait in a queue during main performance.
 * Side battles only go LIVE during SIDE_BATTLE_WINDOW (survivors REST).
 * Visible to audience (wall / jumbotron / PiP) — not hidden background noise,
 * and never simultaneous with ROUND_ACTIVE main performances.
 */

export type SideBattleStatus = "QUEUED" | "LIVE" | "COMPLETE";

export type GauntletSideBattle = {
  sideBattleId: string;
  roomId: string;
  runId: string;
  competitorAId: string;
  competitorBId: string | null;
  status: SideBattleStatus;
  /** Visible secondary stage — sequenced between main rounds. */
  stage: "SIDE";
  windowOpen: boolean;
  createdAt: number;
  updatedAt: number;
  winnerId: string | null;
};

export type SideBattleWindow = {
  roomId: string;
  runId: string;
  open: boolean;
  opensAt: number;
  closesAt: number;
};

const eligibleByRoom = new Map<string, string[]>();
const battlesByRoom = new Map<string, GauntletSideBattle[]>();
const windowsByRun = new Map<string, SideBattleWindow>();

/** Queue eliminated player — do NOT start fighting during main ROUND_ACTIVE. */
export function enqueueSideBattleEligible(
  roomId: string,
  runId: string,
  userId: string,
): void {
  const list = eligibleByRoom.get(roomId) ?? [];
  if (!list.includes(userId)) list.push(userId);
  eligibleByRoom.set(roomId, list);
  // Pair into QUEUED battles only; go LIVE when window opens.
  pairQueued(roomId, runId);
}

function pairQueued(roomId: string, runId: string): void {
  const list = eligibleByRoom.get(roomId) ?? [];
  const window = windowsByRun.get(runId);
  const goLive = Boolean(window?.open);

  while (list.length >= 2) {
    const a = list.shift()!;
    const b = list.shift()!;
    const battle: GauntletSideBattle = {
      sideBattleId: `gsb-${roomId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      roomId,
      runId,
      competitorAId: a,
      competitorBId: b,
      status: goLive ? "LIVE" : "QUEUED",
      stage: "SIDE",
      windowOpen: goLive,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      winnerId: null,
    };
    const battles = battlesByRoom.get(roomId) ?? [];
    battles.unshift(battle);
    battlesByRoom.set(roomId, battles.slice(0, 40));
  }
  eligibleByRoom.set(roomId, list);
}

/** Open the between-rounds side-battle window — survivors are resting. */
export function openSideBattleWindow(input: {
  roomId: string;
  runId: string;
  durationSeconds: number;
}): SideBattleWindow {
  const now = Date.now();
  const window: SideBattleWindow = {
    roomId: input.roomId,
    runId: input.runId,
    open: true,
    opensAt: now,
    closesAt: now + Math.max(10, input.durationSeconds) * 1000,
  };
  windowsByRun.set(input.runId, window);
  pairQueued(input.roomId, input.runId);
  // Promote any still-QUEUED battles for this run to LIVE.
  const battles = battlesByRoom.get(input.roomId) ?? [];
  for (const b of battles) {
    if (b.runId === input.runId && b.status === "QUEUED") {
      b.status = "LIVE";
      b.windowOpen = true;
      b.updatedAt = Date.now();
    }
  }
  return window;
}

export function closeSideBattleWindow(runId: string): SideBattleWindow | null {
  const w = windowsByRun.get(runId);
  if (!w) return null;
  w.open = false;
  w.closesAt = Math.min(w.closesAt, Date.now());
  const battles = battlesByRoom.get(w.roomId) ?? [];
  for (const b of battles) {
    if (b.runId === runId && b.status === "LIVE") {
      // Auto-complete unresolved side battles when window closes (no fabricated winner).
      b.status = "COMPLETE";
      b.windowOpen = false;
      b.updatedAt = Date.now();
    }
  }
  return w;
}

export function isSideBattleWindowOpen(runId: string): boolean {
  const w = windowsByRun.get(runId);
  if (!w || !w.open) return false;
  if (Date.now() > w.closesAt) {
    closeSideBattleWindow(runId);
    return false;
  }
  return true;
}

export function getSideBattleWindow(runId: string): SideBattleWindow | null {
  return windowsByRun.get(runId) ?? null;
}

export function getSideBattleEligible(roomId: string): string[] {
  return [...(eligibleByRoom.get(roomId) ?? [])];
}

export function listSideBattles(roomId: string): GauntletSideBattle[] {
  return [...(battlesByRoom.get(roomId) ?? [])];
}

export function getActiveSideBattles(roomId: string): GauntletSideBattle[] {
  return listSideBattles(roomId).filter((b) => b.status === "LIVE" || b.status === "QUEUED");
}

export function getVisibleSideBattles(roomId: string): GauntletSideBattle[] {
  // Audience can always see queued + live side cards (PiP / jumbotron).
  return getActiveSideBattles(roomId);
}

export function hasActiveSideStage(roomId: string): boolean {
  return getActiveSideBattles(roomId).length > 0 || getSideBattleEligible(roomId).length > 0;
}

/** Resolve a side battle winner — does not affect main Gauntlet alive set. */
export function completeSideBattle(
  roomId: string,
  sideBattleId: string,
  winnerId: string,
): GauntletSideBattle | null {
  const battles = battlesByRoom.get(roomId) ?? [];
  const battle = battles.find((b) => b.sideBattleId === sideBattleId);
  if (!battle) return null;
  if (!battle.windowOpen && battle.status !== "LIVE") {
    return null;
  }
  battle.status = "COMPLETE";
  battle.winnerId = winnerId;
  battle.updatedAt = Date.now();
  return battle;
}

export function getSideStageSummary(roomId: string): {
  activeCount: number;
  queuedEligible: number;
  queuedBattles: number;
  liveBattles: number;
  windowOpen: boolean;
  latestLabel: string | null;
} {
  const battles = getActiveSideBattles(roomId);
  const live = battles.filter((b) => b.status === "LIVE");
  const queuedB = battles.filter((b) => b.status === "QUEUED");
  const queued = getSideBattleEligible(roomId).length;
  const latest = live[0] ?? queuedB[0];
  const windowOpen = battles.some((b) => b.windowOpen);
  return {
    activeCount: battles.length,
    queuedEligible: queued,
    queuedBattles: queuedB.length,
    liveBattles: live.length,
    windowOpen,
    latestLabel: latest
      ? `${latest.status === "LIVE" ? "LIVE" : "QUEUED"} ${latest.competitorAId.slice(0, 6)} vs ${latest.competitorBId?.slice(0, 6) ?? "…"}`
      : queued > 0
        ? `${queued} waiting for side-battle window`
        : null,
  };
}
