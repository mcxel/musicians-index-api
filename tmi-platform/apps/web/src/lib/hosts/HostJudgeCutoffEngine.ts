/**
 * Host Judge Cutoff Engine
 * Handles Monthly Idol cutoff logic: detects when performance meter
 * crosses the cutoff threshold and generates the host interrupt event.
 */
import { HostJudgeMeterEngine, CUTOFF_SCORE_LIMIT, type JudgeMeterState } from './HostJudgeMeterEngine';
import { HostSarcasmEngine } from './HostSarcasmEngine';
import { HostEmotionReactionEngine, type HostEmotionalReaction } from './HostEmotionReactionEngine';
import { HostSpeechTimingEngine } from './HostSpeechTimingEngine';

export interface CutoffEvent {
  hostId: string;
  contestantId: string;
  score: number;
  interruptLine: string;
  durationMs: number;
  emotion: HostEmotionalReaction;
  triggeredAt: number;
}

export class HostJudgeCutoffEngine {
  /**
   * Evaluate a contestant's meter state.
   * Returns a CutoffEvent if the performance triggers a cutoff, null otherwise.
   */
  static evaluate(
    hostId: string,
    contestantId: string,
    score: number,
  ): CutoffEvent | null {
    const state: JudgeMeterState = HostJudgeMeterEngine.buildState(hostId, score);

    if (!HostJudgeMeterEngine.isCutoff(state)) return null;

    const interruptLine = HostSarcasmEngine.generateEliminationLine();
    return {
      hostId,
      contestantId,
      score,
      interruptLine,
      durationMs: HostSpeechTimingEngine.calculateDurationMs(interruptLine),
      emotion: HostEmotionReactionEngine.getReactionForEvent('cutoff_trigger'),
      triggeredAt: Date.now(),
    };
  }

  /**
   * Force a cutoff event regardless of score (e.g. time-limit exceeded).
   */
  static forceInterrupt(hostId: string, contestantId: string): CutoffEvent {
    const interruptLine = HostSarcasmEngine.generateEliminationLine();
    return {
      hostId,
      contestantId,
      score: 0,
      interruptLine,
      durationMs: HostSpeechTimingEngine.calculateDurationMs(interruptLine),
      emotion: HostEmotionReactionEngine.getReactionForEvent('cutoff_trigger'),
      triggeredAt: Date.now(),
    };
  }

  /** Minimum score required to avoid cutoff. */
  static get minimumSafeScore(): number {
    return CUTOFF_SCORE_LIMIT;
  }
}
