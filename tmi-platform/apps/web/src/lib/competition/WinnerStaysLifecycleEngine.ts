/**
 * WinnerStaysLifecycleEngine — ordinary battles keep the room open after a matchup.
 *
 * TMI Musical Logistics & Showcase Lifecycle (Step 2B.1)
 *
 * Sequence:
 *   ACTIVE_MATCH
 *     ↓ (Round ends)
 *   RESULT_PENDING (2.5s: Duck beat to 20%, trigger winner celebration fanfare)
 *     ↓
 *   BEAT_SHOWCASE (~60s target: Beat restored to 100%, winner celebrated, producer discovered, concurrent prep)
 *     ↓
 *   NEXT_CHALLENGER_LOCKED (2.0s: Challenger confirmed, next beat armed)
 *     ↓
 *   PRE_ROLL (2-bar / 3.0s count-in: Audio starts, competitive clock does NOT tick)
 *     ↓ (At pocket drop)
 *   ACTIVE_MATCH (Competitive round clock starts)
 */

import { challengeQueueEngine } from "@/lib/competition/ChallengeQueueEngine";
import { battleBroadcastStateMachine } from "@/lib/competition/BattleBroadcastStateMachine";
import { runCompetitionRestartLoop } from "@/lib/live/CompetitionRestartLoop";
import { eventAudioDuckingCoordinator } from "@/lib/audio/EventAudioDuckingCoordinator";
import { getCompetitionBeatRoom } from "@/lib/competition/CompetitionBeatRoomStore";
import {
  createAuthoritativeTimingContract,
  type AuthoritativeRoomTimingContract,
} from "@/lib/competition/AuthoritativeRoomTimingContract";
import type { PocketDropTier } from "@/lib/beats/BeatPocketDropAuthority";

const VALID_POCKET_DROP_TIERS: readonly PocketDropTier[] = [
  "PRODUCER_DECLARED",
  "VERIFIED_ANALYSIS",
  "TRUTHFUL_ZERO_FALLBACK",
];
function coercePocketDropTier(tier: string | undefined): PocketDropTier {
  return VALID_POCKET_DROP_TIERS.includes(tier as PocketDropTier)
    ? (tier as PocketDropTier)
    : "TRUTHFUL_ZERO_FALLBACK";
}

export type WinnerStaysPhase =
  | "ACTIVE_MATCH"
  | "RESULT_PENDING"
  | "BEAT_SHOWCASE"
  | "CHALLENGER_CALL"
  | "NEXT_CHALLENGER_LOCKED"
  | "PRE_ROLL"
  | "CHAMPION_CEREMONY"
  | "WIND_DOWN"
  | "CLOSED";

export type WinnerStaysConfig = {
  /** Challenger call window length in seconds (clamped 10–20). */
  challengerWindowSeconds: number;
  /** Beat showcase window length in seconds (target ~60s, clamped 45–75). */
  showcaseSeconds: number;
  /** Pre-roll duration before competitive clock starts (default 3s / 2 bars). */
  preRollSeconds: number;
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
  nextRoundReady?: boolean;
  /**
   * Authoritative musical timing contract for the CURRENT pre-roll/round, when
   * a real beat is attached to this room via CompetitionBeatRoomEngine. Built
   * from the beat's already-resolved BeatPocketDropAuthority cue — never a
   * second, competing cue/timing computation. Absent for acapella/no-beat
   * rooms (honest fallback to the flat config timers below, not a fabricated
   * musical assumption). `roundDurationSeconds` reflects
   * AuthoritativeRoomTimingContract's own documented default (60s) because no
   * production caller currently supplies the room's actual configured round
   * length — a real, separate gap (round-length plumbing), not fabricated
   * here. Late-joining clients should call deriveAuthoritativePlaybackPosition
   * against this contract rather than re-deriving position independently.
   */
  timingContract?: AuthoritativeRoomTimingContract;
  /** Set by interruptShowcase() when the showcase TARGET window ends early for a real reason. */
  lastInterruptionReason?:
    | "RIGHTS_ENDED"
    | "AUDIO_ENDED"
    | "PARTICIPANT_DISCONNECTED"
    | "EVENT_CANCELLED"
    | "NEXT_MATCHUP_INVALID";
};

type Listener = (session: WinnerStaysSession) => void;

const DEFAULT_CONFIG: WinnerStaysConfig = {
  challengerWindowSeconds: 15,
  showcaseSeconds: 60, // locked target ~60s
  preRollSeconds: 3,   // musical pre-roll count-in
  ceremonySeconds: 8,
  windDownSeconds: 6,
};

function clampWindow(seconds: number): number {
  return Math.min(20, Math.max(10, Math.round(seconds)));
}

function clampShowcase(seconds: number): number {
  return Math.min(75, Math.max(45, Math.round(seconds)));
}

export class WinnerStaysLifecycleEngine {
  private sessions = new Map<string, WinnerStaysSession>();
  private listeners = new Map<string, Set<Listener>>();
  private timers = new Map<string, ReturnType<typeof setTimeout>>();

  startMatch(
    battleId: string,
    roomId: string,
    championId = "",
    championName = ""
  ): WinnerStaysSession {
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
      nextRoundReady: false,
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

  /** Configure the beat showcase target window (45–75s, target 60s). */
  setShowcaseWindow(battleId: string, seconds: number): WinnerStaysSession | null {
    const session = this.sessions.get(battleId);
    if (!session) return null;
    session.config.showcaseSeconds = clampShowcase(seconds);
    this.emit(session);
    return session;
  }

  /**
   * Enters the result pending phase:
   * 1. Ducks background beat to 20%.
   * 2. Plays winner celebration stinger/fanfare.
   * 3. Reveals winner in broadcast machine.
   * 4. Automatically transitions into ~60s beat showcase after 2,500ms.
   */
  enterResultPending(
    battleId: string,
    winnerId: string,
    winnerName: string
  ): WinnerStaysSession | null {
    const session = this.sessions.get(battleId);
    if (!session) return null;

    session.phase = "RESULT_PENDING";
    session.championId = winnerId;
    session.championName = winnerName;
    session.phaseStartedAt = Date.now();
    session.phaseEndsAt = Date.now() + 2500;
    session.nextRoundReady = false;

    // Controlled audio ducking: lower beat volume, trigger celebration stinger
    eventAudioDuckingCoordinator.triggerWinnerCelebration(2500);
    battleBroadcastStateMachine.revealWinner(battleId, winnerId);

    this.emit(session);
    this.schedule(battleId, 2500, () => this.enterBeatShowcase(battleId));
    return session;
  }

  /**
   * Enters the ~60-second target beat showcase window:
   * 1. Restores background beat smoothly to 100% volume.
   * 2. Displays winner + producer discovery.
   * 3. Concurrently prepares next participants and next beat behind the scenes.
   */
  enterBeatShowcase(battleId: string): WinnerStaysSession | null {
    const session = this.sessions.get(battleId);
    if (!session || session.phase === "CLOSED") return null;

    const showcaseMs = clampShowcase(session.config.showcaseSeconds) * 1000;
    session.phase = "BEAT_SHOWCASE";

    // Restore beat to full volume for showcase
    eventAudioDuckingCoordinator.restoreBeatVolume();

    const hash = battleId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    session.callPrompt =
      hash % 2 === 0 ? "WHO WANTS THE CHAMP" : "IS THERE ANOTHER CHALLENGER?";

    session.phaseStartedAt = Date.now();
    session.phaseEndsAt = Date.now() + showcaseMs;

    // Concurrent participant queuing during showcase
    challengeQueueEngine.openWindow(battleId, session.championId, showcaseMs);

    this.emit(session);
    this.schedule(battleId, showcaseMs, () => this.resolveShowcaseToNextRound(battleId));
    return session;
  }

  openChallengerCall(battleId: string): WinnerStaysSession | null {
    return this.enterBeatShowcase(battleId);
  }

  /**
   * Locks the next challenger. Can occur during or at the end of the showcase.
   */
  lockNextChallenger(
    battleId: string,
    challengerId: string,
    challengerName: string
  ): WinnerStaysSession | null {
    const session = this.sessions.get(battleId);
    if (!session || (session.phase !== "CHALLENGER_CALL" && session.phase !== "BEAT_SHOWCASE")) {
      return null;
    }

    const claimed = challengeQueueEngine.claimChallenger(battleId, challengerId);
    if (!claimed.ok) return null;

    this.clearTimer(battleId);
    session.phase = "NEXT_CHALLENGER_LOCKED";
    session.challengerId = challengerId;
    session.challengerName = challengerName;
    session.phaseStartedAt = Date.now();
    session.phaseEndsAt = Date.now() + 2000;
    session.nextRoundReady = true;

    this.emit(session);
    this.schedule(battleId, 2000, () => this.beginPreRoll(battleId));
    return session;
  }

  /**
   * Pre-roll phase: Audio starts playing, count-in runs.
   * INVARIANT: Competitive round clock MUST NOT tick during pre-roll.
   *
   * Pre-roll duration is derived from the AuthoritativeRoomTimingContract
   * (built from the room's real attached beat via CompetitionBeatRoomEngine)
   * whenever a beat is attached — never the flat config fallback in that
   * case. This closes the Step 2B.1 closure-pass finding that the canonical
   * timing authority existed but was never consulted by the production
   * winner-stays lifecycle.
   */
  beginPreRoll(battleId: string): WinnerStaysSession | null {
    const session = this.sessions.get(battleId);
    if (!session) return null;

    const contract = this.buildTimingContractIfBeatAttached(session);
    session.timingContract = contract ?? undefined;

    const preRollMs = contract ? contract.preRollDurationMs : session.config.preRollSeconds * 1000;
    session.phase = "PRE_ROLL";
    session.phaseStartedAt = Date.now();
    session.phaseEndsAt = Date.now() + preRollMs;

    this.emit(session);
    this.schedule(battleId, preRollMs, () => this.beginNextMatch(battleId));
    return session;
  }

  /**
   * Builds a real AuthoritativeRoomTimingContract from the beat currently
   * attached to this room, if any. Reuses CompetitionBeatRoomEngine's
   * already-resolved BeatPocketDropAuthority result (cueOffsetMs/tier/loop
   * bounds) rather than re-resolving the cue independently — one authority,
   * not a second cue resolver. Returns null (never a fabricated contract)
   * when no beat is attached, matching the acapella/no-beat room case.
   */
  private buildTimingContractIfBeatAttached(
    session: WinnerStaysSession
  ): AuthoritativeRoomTimingContract | null {
    const room = getCompetitionBeatRoom(session.roomId);
    const attached = room?.attached;
    if (!attached) return null;

    return createAuthoritativeTimingContract({
      roomId: session.roomId,
      battleId: session.battleId,
      beatId: attached.beatId,
      dropResolution: {
        beatId: attached.beatId,
        cueOffsetMs: attached.cueOffsetMs ?? 0,
        cueOffsetSeconds: attached.cueOffsetSeconds ?? 0,
        tier: coercePocketDropTier(attached.dropTier),
        isSafeLoopable: attached.isSafeLoopable ?? false,
        loopStartMs: attached.loopStartMs,
        loopEndMs: attached.loopEndMs,
        rationale: `Reused from CompetitionBeatRoomEngine attachment (tier: ${attached.dropTier ?? "unknown"})`,
      },
      bpm: attached.bpm ?? null,
      showcaseDurationSeconds: session.config.showcaseSeconds,
      playbackStartEpoch: Date.now(),
    });
  }

  private beginNextMatch(battleId: string): WinnerStaysSession | null {
    const session = this.sessions.get(battleId);
    if (!session) return null;

    // Winner stays — room remains open; new ACTIVE_MATCH at pocket drop
    session.phase = "ACTIVE_MATCH";
    session.phaseStartedAt = Date.now();
    session.phaseEndsAt = 0;
    session.nextRoundReady = false;

    if (session.challengerId) {
      battleBroadcastStateMachine.competitorBJoins(battleId, session.challengerId);
    }

    this.emit(session);
    return session;
  }

  /**
   * Explicit, testable interruption path for the ~60s showcase TARGET window.
   * Marcel's Step 2B.1 closure directive requires proof that the showcase
   * never becomes an unconditional hard-coded wait when rights end, the
   * audio source ends, the room closes, the next matchup cannot proceed, a
   * participant disconnects, or the event is cancelled. `close()` already
   * cancels any pending scheduled transition via clearTimer regardless of
   * phase (so a stray resolveShowcaseToNextRound/beginNextMatch can never
   * fire after it), but that fully terminates the room. This method covers
   * the narrower case: showcase must end early WITHOUT the competitive round
   * clock ever restarting, while still reaching a safe, real terminal state
   * (champion ceremony) rather than silently hanging or auto-advancing to a
   * challenger that may no longer be valid.
   */
  interruptShowcase(
    battleId: string,
    reason: "RIGHTS_ENDED" | "AUDIO_ENDED" | "PARTICIPANT_DISCONNECTED" | "EVENT_CANCELLED" | "NEXT_MATCHUP_INVALID"
  ): WinnerStaysSession | null {
    const session = this.sessions.get(battleId);
    if (!session) return null;
    if (session.phase !== "BEAT_SHOWCASE" && session.phase !== "CHALLENGER_CALL") {
      // Not in an interruptible showcase phase — no-op, never force a phase
      // change from an unrelated state (e.g. mid-ACTIVE_MATCH).
      return session;
    }

    this.clearTimer(battleId);
    challengeQueueEngine.closeWindow(battleId);
    session.lastInterruptionReason = reason;
    session.nextRoundReady = false;
    // Competitive clock lives in ACTIVE_MATCH externally and is never
    // re-entered from here — routing straight to ceremony/wind-down is the
    // one safe exit, not a resumed or fabricated next round.
    this.emit(session);
    return this.startChampionCeremony(battleId);
  }

  private resolveShowcaseToNextRound(battleId: string): void {
    const session = this.sessions.get(battleId);
    if (!session || session.phase !== "BEAT_SHOWCASE") return;

    const next = challengeQueueEngine.popNext(battleId);
    if (next) {
      this.lockNextChallenger(battleId, next.challenger.userId, next.challenger.displayName);
      return;
    }

    // No challenger queued -> transition to champion ceremony
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
    this.schedule(battleId, session.config.ceremonySeconds * 1000, () =>
      this.windDown(battleId)
    );
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
    runCompetitionRestartLoop({
      venueSlug: session.roomId || battleId,
      roomKind: "battle",
      afterResultReveal: true,
    });
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
    const phase = this.sessions.get(battleId)?.phase;
    return phase === "CHALLENGER_CALL" || phase === "BEAT_SHOWCASE";
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
