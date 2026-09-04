/**
 * BattleMomentumEngine.ts
 *
 * Real-time audience momentum & "On Fire" heat state engine.
 * Maps verified fan reaction signals to performer momentum levels:
 * NORMAL -> WARM -> HOT -> ON FIRE -> INFERNO.
 *
 * Features hysteresis and decay to prevent rapid state flickering.
 */

export type HeatLevel = "NORMAL" | "WARM" | "HOT" | "ON_FIRE" | "INFERNO";

export interface HeatState {
  level: HeatLevel;
  score: number; // 0..100
  label: string;
  particleColor: string;
  glowIntensity: number;
  decayRatePerSec: number;
}

export const HEAT_CONFIGS: Record<HeatLevel, HeatState> = {
  NORMAL: {
    level: "NORMAL",
    score: 0,
    label: "NORMAL",
    particleColor: "transparent",
    glowIntensity: 0,
    decayRatePerSec: 1.0,
  },
  WARM: {
    level: "WARM",
    score: 25,
    label: "WARM ⚡",
    particleColor: "#FFD700",
    glowIntensity: 0.25,
    decayRatePerSec: 1.5,
  },
  HOT: {
    level: "HOT",
    score: 45,
    label: "HOT 🔥",
    particleColor: "#FF8C00",
    glowIntensity: 0.55,
    decayRatePerSec: 2.0,
  },
  ON_FIRE: {
    level: "ON_FIRE",
    score: 65,
    label: "ON FIRE 🔥🔥",
    particleColor: "#FF4500",
    glowIntensity: 0.85,
    decayRatePerSec: 2.5,
  },
  INFERNO: {
    level: "INFERNO",
    score: 85,
    label: "INFERNO 💥🔥💥",
    particleColor: "#FF2DAA",
    glowIntensity: 1.0,
    decayRatePerSec: 3.0,
  },
};

export class BattleMomentumEngine {
  private currentScore = 0;
  private currentLevel: HeatLevel = "NORMAL";
  private lastUpdateTs = Date.now();

  constructor(initialScore = 0) {
    this.currentScore = Math.max(0, Math.min(100, initialScore));
    this.currentLevel = this.getBaseLevelForScore(this.currentScore);
  }

  public registerReaction(weight = 5): HeatState {
    this.applyDecay();
    this.currentScore = Math.min(100, this.currentScore + weight);
    this.currentLevel = this.evaluateLevel(this.currentScore, this.currentLevel);
    return this.getState();
  }

  public getState(): HeatState {
    this.applyDecay();
    return {
      ...HEAT_CONFIGS[this.currentLevel],
      score: Math.round(this.currentScore * 10) / 10,
    };
  }

  private applyDecay(): void {
    const now = Date.now();
    const elapsedSec = (now - this.lastUpdateTs) / 1000;
    this.lastUpdateTs = now;

    if (elapsedSec <= 0 || this.currentScore <= 0) return;

    const rate = HEAT_CONFIGS[this.currentLevel].decayRatePerSec;
    this.currentScore = Math.max(0, this.currentScore - rate * elapsedSec);
    this.currentLevel = this.evaluateLevel(this.currentScore, this.currentLevel);
  }

  private getBaseLevelForScore(score: number): HeatLevel {
    if (score >= 85) return "INFERNO";
    if (score >= 65) return "ON_FIRE";
    if (score >= 45) return "HOT";
    if (score >= 25) return "WARM";
    return "NORMAL";
  }

  private evaluateLevel(score: number, activeLevel: HeatLevel): HeatLevel {
    // Apply hysteresis: higher threshold to upgrade, lower threshold to downgrade
    if (activeLevel === "INFERNO") {
      if (score < 75) return "ON_FIRE";
      return "INFERNO";
    }
    if (activeLevel === "ON_FIRE") {
      if (score >= 85) return "INFERNO";
      if (score < 55) return "HOT";
      return "ON_FIRE";
    }
    if (activeLevel === "HOT") {
      if (score >= 65) return "ON_FIRE";
      if (score < 35) return "WARM";
      return "HOT";
    }
    if (activeLevel === "WARM") {
      if (score >= 45) return "HOT";
      if (score < 15) return "NORMAL";
      return "WARM";
    }
    // NORMAL
    return this.getBaseLevelForScore(score);
  }
}
