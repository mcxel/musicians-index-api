/**
 * Bebo Hook Engine v2 — Monday Night Stage Crowd Enforcer
 *
 * 5-stage state machine driven purely by audience vote ratios.
 * Bebo never judges performers on his own — he represents the crowd's decision.
 * He is a WARNING system, not an automatic elimination system.
 *
 * Stage flow:
 *
 *   OFFSTAGE ──(nay ≥ peek)──► PEEK ──(nay ≥ warning)──► ON_STAGE_WARNING
 *                                │                              │
 *                                │◄───(yay recovers)────────────┤
 *                                │                              │
 *                           OFFSTAGE ◄── RECOVERY_EXIT ◄────────┤
 *                                                               │
 *                                                    REMOVAL ◄──┘
 *                                                  (terminal)
 *
 * Each tick() call processes the latest vote counts and returns a
 * BeboStateTransition if the stage should change, or null if nothing changes.
 *
 * Callers (MondayNightStageEngine) receive the transition and can:
 *   - Play sound cue IDs via SoundManifest / playSound()
 *   - Pull dialogue from BeboDialogueEngine using the dialogueHint
 *   - Execute the panelAction (SLIDE_OFF / RESTORE) on the video panel
 */

import { BEBO_SOUND_CUES } from '@/lib/sound/BeboSoundCues';

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * OFFSTAGE       — Performance is going well. Bebo is not visible.
 * PEEK           — Nay votes are building. Bebo leans around the backstage curtain.
 * ON_STAGE_WARNING — Boo threshold hit. Bebo has walked onto the stage to deliver a warning.
 * RECOVERY_EXIT  — Crowd swung back to yay. Bebo raises his hook in a "well played" gesture and exits.
 * REMOVAL        — Crowd continued voting nay. Bebo closes the performance. Video panel slides off.
 */
export type BeboStage =
  | 'OFFSTAGE'
  | 'PEEK'
  | 'ON_STAGE_WARNING'
  | 'RECOVERY_EXIT'
  | 'REMOVAL';

export type BeboDialogueHint = 'peek' | 'warning' | 'recovery' | 'removal';

/** Action the caller should perform on the performer's video panel */
export type BeboPanelAction = 'SLIDE_OFF' | 'RESTORE' | null;

export interface BeboStateTransition {
  fromStage: BeboStage;
  toStage: BeboStage;
  /** Sound IDs to play in sequence — look up each via getSoundById() in SoundManifest */
  soundCueIds: readonly string[];
  /** Which BeboDialogueEngine function to call for this transition */
  dialogueHint: BeboDialogueHint | null;
  /** Video panel action for the current performer */
  panelAction: BeboPanelAction;
}

export interface BeboHookConfig {
  /** nay% to trigger PEEK from OFFSTAGE (default 0.30) */
  peekThreshold?: number;
  /** nay% to trigger ON_STAGE_WARNING from PEEK (default 0.55) */
  warningThreshold?: number;
  /** nay% that must be sustained to trigger REMOVAL (default 0.70) */
  removalThreshold?: number;
  /** yay% to trigger RECOVERY_EXIT from ON_STAGE_WARNING (default 0.55) */
  recoveryThreshold?: number;
  /**
   * Consecutive ticks at removalThreshold before REMOVAL fires.
   * Prevents 1-2 nay votes instantly removing someone. (default 2)
   */
  minSustainedTicks?: number;
  /** Minimum total votes before any threshold applies (default 10) */
  minVotesRequired?: number;
}

// ── Legacy type (kept for imports that use the old union) ─────────────────────
export type BeboAction = 'HOOK' | 'RETURN' | 'HOLD' | 'IDLE';

// ── Engine ────────────────────────────────────────────────────────────────────

export class BeboHookEngine {
  private stage: BeboStage = 'OFFSTAGE';
  private sustainedBooTicks = 0;

  private readonly peekThreshold: number;
  private readonly warningThreshold: number;
  private readonly removalThreshold: number;
  private readonly recoveryThreshold: number;
  private readonly minSustainedTicks: number;
  private readonly minVotesRequired: number;

  constructor(
    /** Legacy positional arg — maps to removalThreshold */
    legacyBooThreshold = 0.6,
    /** Legacy positional arg — maps to recoveryThreshold */
    legacyYayThreshold = 0.7,
    config: BeboHookConfig = {}
  ) {
    this.peekThreshold = config.peekThreshold ?? 0.30;
    this.warningThreshold = config.warningThreshold ?? 0.55;
    this.removalThreshold = config.removalThreshold ?? legacyBooThreshold;
    this.recoveryThreshold = config.recoveryThreshold ?? legacyYayThreshold;
    this.minSustainedTicks = config.minSustainedTicks ?? 2;
    this.minVotesRequired = config.minVotesRequired ?? 10;
  }

  /**
   * Process current running vote counts.
   * Returns a BeboStateTransition if Bebo's stage should change, otherwise null.
   * Call this on every vote update (debounce as needed — ideally every 3–5 seconds).
   */
  tick(booCount: number, yayCount: number): BeboStateTransition | null {
    const total = booCount + yayCount;
    if (total < this.minVotesRequired) return null;
    if (this.stage === 'REMOVAL') return null; // terminal — call reset() for next performer

    const nayRatio = booCount / total;
    const yayRatio = yayCount / total;

    switch (this.stage) {
      case 'OFFSTAGE':
        if (nayRatio >= this.peekThreshold) {
          return this._advance('OFFSTAGE', 'PEEK', BEBO_SOUND_CUES.BEBO_PEEK, 'peek', null);
        }
        break;

      case 'PEEK':
        if (yayRatio >= this.recoveryThreshold) {
          // Crowd swung back before Bebo hit the stage — he quietly retreats
          return this._advance('PEEK', 'OFFSTAGE', BEBO_SOUND_CUES.BEBO_SILENT_RETREAT, null, null);
        }
        if (nayRatio >= this.warningThreshold) {
          this.sustainedBooTicks = 0;
          return this._advance('PEEK', 'ON_STAGE_WARNING', BEBO_SOUND_CUES.BEBO_WARNING, 'warning', null);
        }
        break;

      case 'ON_STAGE_WARNING':
        if (yayRatio >= this.recoveryThreshold) {
          this.sustainedBooTicks = 0;
          return this._advance(
            'ON_STAGE_WARNING',
            'RECOVERY_EXIT',
            BEBO_SOUND_CUES.BEBO_RECOVERY,
            'recovery',
            'RESTORE'
          );
        }
        if (nayRatio >= this.removalThreshold) {
          this.sustainedBooTicks++;
          if (this.sustainedBooTicks >= this.minSustainedTicks) {
            return this._advance(
              'ON_STAGE_WARNING',
              'REMOVAL',
              BEBO_SOUND_CUES.BEBO_REMOVAL,
              'removal',
              'SLIDE_OFF'
            );
          }
        } else {
          // nay is present but below removal threshold — hold the warning stage
          this.sustainedBooTicks = 0;
        }
        break;

      case 'RECOVERY_EXIT':
        // Auto-resolve back to OFFSTAGE after one tick (caller already got the transition)
        this.stage = 'OFFSTAGE';
        break;
    }

    return null;
  }

  getStage(): BeboStage {
    return this.stage;
  }

  /** Call this when a new performer takes the stage */
  reset(): void {
    this.stage = 'OFFSTAGE';
    this.sustainedBooTicks = 0;
  }

  getState() {
    return {
      stage: this.stage,
      sustainedBooTicks: this.sustainedBooTicks,
      peekThreshold: this.peekThreshold,
      warningThreshold: this.warningThreshold,
      removalThreshold: this.removalThreshold,
      recoveryThreshold: this.recoveryThreshold,
      minSustainedTicks: this.minSustainedTicks,
    };
  }

  // ── Legacy API (backward compat for any callers using the v1 interface) ──────

  /** @deprecated Use tick() — returns HOOK / RETURN for legacy callers */
  checkCrowdVote(booCount: number, yayCount: number): BeboAction | null {
    const total = booCount + yayCount;
    if (total === 0) return null;
    if (booCount / total >= this.removalThreshold) return 'HOOK';
    if (
      yayCount / total >= this.recoveryThreshold &&
      (this.stage === 'ON_STAGE_WARNING' || this.stage === 'REMOVAL')
    ) {
      return 'RETURN';
    }
    return null;
  }

  /** @deprecated Use tick() */
  hookPerformer(_contestantId: string, _crowdBooPercent: number): void {
    this.stage = 'REMOVAL';
  }

  /** @deprecated Use tick() */
  returnPerformer(_contestantId: string, _crowdYayPercent: number): void {
    this.stage = 'RECOVERY_EXIT';
  }

  // ── Private ──────────────────────────────────────────────────────────────────

  private _advance(
    from: BeboStage,
    to: BeboStage,
    soundCueIds: readonly string[],
    dialogueHint: BeboDialogueHint | null,
    panelAction: BeboPanelAction
  ): BeboStateTransition {
    this.stage = to;
    return { fromStage: from, toStage: to, soundCueIds, dialogueHint, panelAction };
  }
}
