/**
 * Host Judge Meter Engine
 * Tracks the performance meter for Monthly Idol judging.
 * Drives cutoff detection when the meter crosses threshold limits.
 */

export type JudgeThreshold = 'bad' | 'okay' | 'hot' | 'elite';

export interface JudgeMeterState {
  hostId: string;
  currentScore: number; // 0–100
  threshold: JudgeThreshold;
  isCutoffTriggered: boolean;
  lastUpdatedAt: number;
}

const THRESHOLD_BANDS: { max: number; label: JudgeThreshold }[] = [
  { max: 25, label: 'bad' },
  { max: 55, label: 'okay' },
  { max: 80, label: 'hot' },
  { max: 100, label: 'elite' },
];

export const CUTOFF_SCORE_LIMIT = 20; // score below this during active judging triggers cutoff

export class HostJudgeMeterEngine {
  static resolveThreshold(score: number): JudgeThreshold {
    for (const band of THRESHOLD_BANDS) {
      if (score <= band.max) return band.label;
    }
    return 'elite';
  }

  static buildState(hostId: string, score: number): JudgeMeterState {
    const threshold = HostJudgeMeterEngine.resolveThreshold(score);
    return {
      hostId,
      currentScore: score,
      threshold,
      isCutoffTriggered: score < CUTOFF_SCORE_LIMIT,
      lastUpdatedAt: Date.now(),
    };
  }

  static isCutoff(state: JudgeMeterState): boolean {
    return state.isCutoffTriggered;
  }
}
