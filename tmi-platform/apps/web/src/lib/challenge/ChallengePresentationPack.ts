/**
 * ChallengePresentationPack.ts
 *
 * Phase 5.3 Lane C: Visual Choreography & Presentation Pack for Challenge
 *
 * Laws:
 * 1. Center of Gravity: Suspended Objective Contract between participants.
 * 2. Visual Style: Amber / Gold / Cyber Emerald lighting with mechanical contract locks.
 * 3. Accessibility / Device Modes: FULL (cinematic 3D), FAST, ACCESSIBLE (reduced motion).
 * 4. Single Audio Analysis Waveform: Visuals derive strictly from the canonical audio bus.
 */

import {
  ChallengeLifecyclePhase,
  ChallengeBroadcastComposition,
  AuthoritativeObjectiveContract,
  ChallengeJudgmentPolicy,
} from './ChallengeOperationalLifecycle';

export interface ChallengeCameraCue {
  target: 'CHALLENGER' | 'CHALLENGED' | 'OBJECTIVE_CONTRACT' | 'DUAL_STAGE' | 'ARENA_CROWD';
  fov: number;
  position: [number, number, number];
  transitionSec: number;
}

export interface ChallengeLightingCue {
  ambientColor: string;
  spotlightA: string;
  spotlightB: string;
  contractBacklight: string;
  intensity: number;
  strobeSpeedHz: number;
}

/** Intro packages + device pacing — aligned with ACGBR IntroPackageMode. */
export type ChallengePacingMode =
  | "FULL"
  | "FAST"
  | "RECONNECT"
  | "REDUCED_MOTION"
  | "LOW_DEVICE"
  /** @deprecated use REDUCED_MOTION — kept for Lane C cert compatibility */
  | "ACCESSIBLE";

export class ChallengePresentationPack {
  private pacingMode: ChallengePacingMode;

  constructor(pacingMode: ChallengePacingMode = "FULL") {
    this.pacingMode = pacingMode;
  }

  public setPacingMode(mode: ChallengePacingMode) {
    this.pacingMode = mode;
  }

  public getPacingMode() {
    return this.pacingMode;
  }

  private isReducedMotion(): boolean {
    return (
      this.pacingMode === "ACCESSIBLE" ||
      this.pacingMode === "REDUCED_MOTION" ||
      this.pacingMode === "LOW_DEVICE"
    );
  }

  private isFastPacing(): boolean {
    return this.pacingMode === "FAST" || this.pacingMode === "RECONNECT";
  }

  /**
   * Derives camera choreography for the current Challenge lifecycle phase and composition
   */
  public getCameraCue(
    phase: ChallengeLifecyclePhase,
    composition: ChallengeBroadcastComposition
  ): ChallengeCameraCue {
    if (this.isReducedMotion()) {
      return {
        target: "DUAL_STAGE",
        fov: 50,
        position: [0, 2, 8],
        transitionSec: 0,
      };
    }

    switch (composition) {
      case "CHALLENGER_DOMINANT":
        return {
          target: "CHALLENGER",
          fov: 40,
          position: [-2.5, 1.8, 5.0],
          transitionSec: this.isFastPacing() ? 0.3 : 0.8,
        };
      case "CHALLENGED_DOMINANT":
        return {
          target: "CHALLENGED",
          fov: 40,
          position: [2.5, 1.8, 5.0],
          transitionSec: this.isFastPacing() ? 0.3 : 0.8,
        };
      case "OBJECTIVE_FOCUS":
        return {
          target: "OBJECTIVE_CONTRACT",
          fov: 45,
          position: [0, 2.2, 4.2],
          transitionSec: this.isFastPacing() ? 0.4 : 1.0,
        };
      case 'ACTIVE_ATTEMPT':
        return {
          target: phase.includes('1') ? 'CHALLENGER' : 'CHALLENGED',
          fov: 38,
          position: [phase.includes('1') ? -1.5 : 1.5, 2.0, 4.5],
          transitionSec: 0.5,
        };
      case 'JUDGMENT_FOCUS':
        return {
          target: 'OBJECTIVE_CONTRACT',
          fov: 48,
          position: [0, 2.0, 5.5],
          transitionSec: 0.6,
        };
      case 'RESULT':
        return {
          target: 'DUAL_STAGE',
          fov: 55,
          position: [0, 2.5, 7.5],
          transitionSec: 1.2,
        };
      default:
        return {
          target: 'DUAL_STAGE',
          fov: 52,
          position: [0, 2.0, 6.5],
          transitionSec: 0.8,
        };
    }
  }

  /**
   * Derives stage lighting cues according to Challenge state
   */
  public getLightingCue(phase: ChallengeLifecyclePhase): ChallengeLightingCue {
    switch (phase) {
      case 'OBJECTIVE_CONTRACT_ASSEMBLY':
      case 'RULES_LOCK':
      case 'JUDGMENT_POLICY_LOCK':
        return {
          ambientColor: '#050714',
          spotlightA: '#FFD700',
          spotlightB: '#00FFFF',
          contractBacklight: '#FFD700',
          intensity: 1.2,
          strobeSpeedHz: 0,
        };
      case 'ATTEMPT_1_ACTIVE':
      case 'ATTEMPT_2_ACTIVE':
        return {
          ambientColor: '#08081a',
          spotlightA: phase === 'ATTEMPT_1_ACTIVE' ? '#00FFFF' : '#222',
          spotlightB: phase === 'ATTEMPT_2_ACTIVE' ? '#FF2DAA' : '#222',
          contractBacklight: '#FFD700',
          intensity: 1.4,
          strobeSpeedHz: 0,
        };
      case 'JUDGMENT_OPEN':
        return {
          ambientColor: '#0f0520',
          spotlightA: '#AA2DFF',
          spotlightB: '#AA2DFF',
          contractBacklight: '#00FFFF',
          intensity: 1.5,
          strobeSpeedHz: 1.5,
        };
      case 'RESULT_FINALIZED':
      case 'RESULT_PRESENTATION':
        return {
          ambientColor: '#041014',
          spotlightA: '#FFD700',
          spotlightB: '#FFD700',
          contractBacklight: '#FFD700',
          intensity: 1.8,
          strobeSpeedHz: 0,
        };
      default:
        return {
          ambientColor: '#050510',
          spotlightA: '#00FFFF',
          spotlightB: '#FF2DAA',
          contractBacklight: 'rgba(255,215,0,0.3)',
          intensity: 1.0,
          strobeSpeedHz: 0,
        };
    }
  }

  /**
   * Format the objective contract presentation payload
   */
  public formatContractCard(contract: AuthoritativeObjectiveContract) {
    const policyBadge =
      contract.judgingPolicy === 'AUDIENCE_VOTE'
        ? '👥 AUDIENCE VOTE'
        : contract.judgingPolicy === 'AUTHORIZED_JUDGES'
        ? '⚖️ VERIFIED JUDGES PANEL'
        : '📊 MEASURABLE BENCHMARK';

    const stakeDisplay =
      contract.realStakeOrReward === 'NONE'
        ? 'STAKE: NONE (HONOR / XP)'
        : `STAKE: ${contract.realStakeOrReward}`;

    return {
      title: contract.objective.toUpperCase(),
      category: contract.category.toUpperCase(),
      policyBadge,
      timeLimit: `${contract.timeLimitSec}s PER ATTEMPT`,
      attempts: `${contract.attemptCount} ATTEMPTS EACH`,
      stake: stakeDisplay,
      rules: contract.qualificationRules,
    };
  }

  /**
   * Derive procedural waveform bars from canonical audio level
   */
  public deriveWaveformBars(canonicalAudioLevel: number, barCount = 16): number[] {
    const bars: number[] = [];
    for (let i = 0; i < barCount; i++) {
      const centerFactor = 1.0 - Math.abs(i - barCount / 2) / (barCount / 2);
      const wave = Math.sin(i * 0.8 + Date.now() * 0.005) * 0.2;
      const height = Math.min(1.0, Math.max(0.08, canonicalAudioLevel * centerFactor + wave));
      bars.push(Number(height.toFixed(2)));
    }
    return bars;
  }
}
