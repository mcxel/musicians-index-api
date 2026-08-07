/**
 * WinnerStaysLifecycleEngine — ordinary battles keep the room open after a matchup.
 *
 * Lifecycle:
 *   ACTIVE_MATCH → RESULT_PENDING → CHALLENGER_CALL (10–20s)
 *     → NEXT_CHALLENGER_LOCKED | CHAMPION_CEREMONY → WIND_DOWN → CLOSED
 *
 * Room does NOT close merely because a scheduled matchup ended.
 * Winner stays on stage; ChallengeQueueEngine handles eligibility during CHALLENGER_CALL.
 */

import { challengeQueueEngine } from "@/lib/competition/ChallengeQueueEngine";
import { battleBroadcastStateMachine } from "@/lib/competition/BattleBroadcastStateMachine";

export type WinnerStaysPhase =
  | "ACTIVE_MATCH"
  | "RESULT_PENDING"
  | "CHALLENGER_CALL"
  | "NEXT_CHALLENGER_LOCKED"
  | "CHAMPION_CEREMONY"
  | "WIND_DOWN"
  | "CLOSED";

export type WinnerStaysConfig = {
  /** Challenger call window length in seconds (clamped 10–20). */
  challengerWindowSeconds: number;
  ceremonySeconds: number;
  windDownSeconds: number;
};

export type WinnerStaysSession = {
  battleId: string;
  roomId: string;
  phase: WinnerStaysPhase;
  championId: string;
  championName: string;
  challengerId?: string;
  challengerName?: string;
  config: WinnerStaysConfig;
  phaseStartedAt: number;
  phaseEndsAt: number;
  callPrompt: "IS THERE ANOTHER CHALLENGER?" | "WHO WANTS THE CHAMP";
};

type Listener = (session: WinnerStaysSession) => void;

const DEFAULT_CONFIG: WinnerStaysConfig = {
  challengerWindowSeconds: 15,
  ceremonySeconds: 8,
  windDownSeconds: 6,
};

function clampWindow(seconds: number): number {
  return Math.min(20, Math.max(10, Math.round(seconds)));
}

export class WinnerStaysLifecycleEngine {
  private sessions = new Map<string, WinnerStaysSession>();
  private listeners = new Map<string, Set<Listener>>();
  private timers = new Map<string, ReturnType<typeof setTimeout>>();

  startMatch(battleId: string, roomId: string, championId = "", championName = ""): WinnerStaysSession {
    this.clearTimer(battleId);
    const session: WinnerStaysSession = {
      battleId,
      roomId,
      phase: "ACTIVE_MATCH",
      championId,
      championName,
      config: { ...DEFAULT_CONFIG },
      phaseStartedAt: Date.now(),
      phaseEndsAt: 0,
      callPrompt: "IS THERE ANOTHER CHALLENGER?",
    };
    this.sessions.set(battleId, session);
    this.emit(session);
    return session;
  }

  /** Configure the post-match challenger window (10–20s). */
  setChallengerWindow(battleId: string, seconds: number): WinnerStaysSession | null {
    const session = this.sessions.get(battleId);
    if (!session) return null;
    session.config.challengerWindowSeconds = clampWindow(seconds);
    this.emit(session);
    return session;
  }

  enterResultPending(battleId: string, winnerId: string, winnerName: string): WinnerStaysSession | null {
    const session = this.sessions.get(battleId);
    if (!session) return null;
    session.phase = "RESULT_PENDING";
    session.championId = winnerId;
    session.championName = winnerName;
    session.phaseStartedAt = Date.now();
    session.phaseEndsAt = Date.now() + 2500;
    battleBroadcastStateMachine.revealWinner(battleId, winnerId);
    this.emit(session);
    this.schedule(battleId, 2500, () => this.openChallengerCall(battleId));
    return session;
  }

  openChallengerCall(battleId: string): WinnerStaysSession | null {
    const session = this.sessions.get(battleId);
    if (!session || session.phase === "CLOSED") return null;
    const windowMs = clampWindow(session.config.challengerWindowSeconds) * 1000;
    session.phase = "CHALLENGER_CALL";
    // Alternate prompt by battle id hash — not fake live state, just copy rotation.
    const hash = battleId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    session.callPrompt =
      hash % 2 === 0 ? "WHO WANTS THE CHAMP" : "IS THERE ANOTHER CHALLENGER?";
    session.phaseStartedAt = Date.now();
    session.phaseEndsAt = Date.now() + windowMs;
    challengeQueueEngine.openWindow(battleId, session.championId, windowMs);
    this.emit(session);
    this.schedule(battleId, windowMs, () => this.resolveChallengerWindow(battleId));
    return session;
  }

  /** Lock next challenger from ChallengeQueueEngine during CHALLENGER_CALL. */
  lockNextChallenger(
    battleId: string,
    challengerId: string,
    challengerName: string,
  ): WinnerStaysSession | null {
    const session = this.sessions.get(battleId);
    if (!session || session.phase !== "CHALLENGER_CALL") return null;
    const claimed = challengeQueueEngine.claimChallenger(battleId, challengerId);
    if (!claimed.ok) return null;
    this.clearTimer(battleId);
    session.phase = "NEXT_CHALLENGER_LOCKED";
    session.challengerId = challengerId;
    session.challengerName = challengerName;
    session.phaseStartedAt = Date.now();
    session.phaseEndsAt = Date.now() + 2000;
    this.emit(session);
    this.schedule(battleId, 2000, () => this.beginNextMatch(battleId));
    return session;
  }

  private beginNextMatch(battleId: string): WinnerStaysSession | null {
    const session = this.sessions.get(battleId);
    if (!session) return null;
    // Winner stays — room remains open; new ACTIVE_MATCH with same champion.
    session.phase = "ACTIVE_MATCH";
    session.phaseStartedAt = Date.now();
    session.phaseEndsAt = 0;
    if (session.challengerId) {
      battleBroadcastStateMachine.competitorBJoins(battleId, session.challengerId);
    }
    this.emit(session);
    return session;
  }

  private resolveChallengerWindow(battleId: string): void {
    const session = this.sessions.get(battleId);
    if (!session || session.phase !== "CHALLENGER_CALL") return;
    const next = challengeQueueEngine.popNext(battleId);
    if (next) {
      this.lockNextChallenger(battleId, next.challenger.userId, next.challenger.displayName);
      return;
    }
    this.startChampionCeremony(battleId);
  }

  startChampionCeremony(battleId: string): WinnerStaysSession | null {
    const session = this.sessions.get(battleId);
    if (!session) return null;
    challengeQueueEngine.closeWindow(battleId);
    session.phase = "CHAMPION_CEREMONY";
    session.phaseStartedAt = Date.now();
    session.phaseEndsAt = Date.now() + session.config.ceremonySeconds * 1000;
    this.emit(session);
    this.schedule(battleId, session.config.ceremonySeconds * 1000, () => this.windDown(battleId));
    return session;
  }

  windDown(battleId: string): WinnerStaysSession | null {
    const session = this.sessions.get(battleId);
    if (!session) return null;
    session.phase = "WIND_DOWN";
    session.phaseStartedAt = Date.now();
    session.phaseEndsAt = Date.now() + session.config.windDownSeconds * 1000;
    this.emit(session);
    this.schedule(battleId, session.config.windDownSeconds * 1000, () => this.close(battleId));
    return session;
  }

  /** Explicit close only — never auto-close solely because scheduled matchup ended. */
  close(battleId: string): WinnerStaysSession | null {
    const session = this.sessions.get(battleId);
    if (!session) return null;
    this.clearTimer(battleId);
    challengeQueueEngine.closeWindow(battleId);
    session.phase = "CLOSED";
    session.phaseStartedAt = Date.now();
    session.phaseEndsAt = Date.now();
    this.emit(session);
    return session;
  }

  getSession(battleId: string): WinnerStaysSession | null {
    return this.sessions.get(battleId) ?? null;
  }

  getRemainingSeconds(battleId: string): number {
    const session = this.sessions.get(battleId);
    if (!session || !session.phaseEndsAt) return 0;
    return Math.max(0, Math.ceil((session.phaseEndsAt - Date.now()) / 1000));
  }

  isChallengeOpen(battleId: string): boolean {
    return this.sessions.get(battleId)?.phase === "CHALLENGER_CALL";
  }

  subscribe(battleId: string, listener: Listener): () => void {
    if (!this.listeners.has(battleId)) this.listeners.set(battleId, new Set());
    this.listeners.get(battleId)!.add(listener);
    const current = this.sessions.get(battleId);
    if (current) listener(current);
    return () => this.listeners.get(battleId)?.delete(listener);
  }

  private emit(session: WinnerStaysSession) {
    this.sessions.set(session.battleId, session);
    this.listeners.get(session.battleId)?.forEach((fn) => fn({ ...session }));
  }

  private schedule(battleId: string, ms: number, fn: () => void) {
    this.clearTimer(battleId);
    this.timers.set(battleId, setTimeout(fn, ms));
  }

  private clearTimer(battleId: string) {
    const t = this.timers.get(battleId);
    if (t) clearTimeout(t);
    this.timers.delete(battleId);
  }
}

export const winnerStaysLifecycleEngine = new WinnerStaysLifecycleEngine();
