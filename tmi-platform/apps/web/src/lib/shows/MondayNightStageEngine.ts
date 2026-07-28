/**
 * Monday Night Stage Engine
 * Combines ShowRuntimeEngine + BeboHookEngine (v2) + KiraWalkaroundEngine.
 * Imports BeboDialogueEngine + KiraSpotlightEngine for host dialogue.
 */
import { ShowRuntimeEngine } from './ShowRuntimeEngine';
import { BeboHookEngine } from './BeboHookEngine';
import { KiraWalkaroundEngine } from './KiraWalkaroundEngine';
import {
  beboPeekFromBackstage,
  beboOnStageWarning,
  beboRecoveryExit,
  beboHookCommentary,
  beboActTransition,
  beboCallNextPerformer,
  beboShowOpen,
  beboCatchphrase,
  type BeboDialogue,
} from './BeboDialogueEngine';
import {
  kiraAskQuestion,
  kiraSpotlightSet,
  kiraAudiencePrompt,
  kiraActIntro,
  kiraReturningPerformer,
  type KiraDialogue,
  type KiraReturnContext,
} from './KiraSpotlightEngine';

// ── Event types emitted by processCrowdVote() ─────────────────────────────────

export type MondayNightStageEventType =
  | 'PLAY_SOUND'       // play a sound from SoundManifest by ID
  | 'BEBO_DIALOGUE'    // render a Bebo dialogue line
  | 'KIRA_DIALOGUE'    // render a Kira dialogue line
  | 'PANEL_SLIDE_OFF'  // animate the performer's video panel off stage
  | 'PANEL_RESTORE';   // restore the panel (crowd recovery)

export interface MondayNightStageEvent {
  type: MondayNightStageEventType;
  soundId?: string;
  beboDialogue?: BeboDialogue;
  kiraDialogue?: KiraDialogue;
  contestantId?: string;
}

export interface MondayNightStageState {
  show: ReturnType<ShowRuntimeEngine['getState']>;
  bebo: ReturnType<BeboHookEngine['getState']>;
  kira: ReturnType<KiraWalkaroundEngine['getState']>;
  panelVisible: boolean;
  panelContestantId: string | null;
}

export class MondayNightStageEngine {
  readonly show: ShowRuntimeEngine;
  readonly bebo: BeboHookEngine;
  readonly kira: KiraWalkaroundEngine;

  private panelVisible = false;
  private panelContestantId: string | null = null;
  private _seed = 0;

  constructor() {
    this.show = new ShowRuntimeEngine('monday-night-stage', 3);
    this.bebo = new BeboHookEngine(0.6, 0.7);
    this.kira = new KiraWalkaroundEngine();
  }

  startShow(): MondayNightStageEvent[] {
    this.show.startShow();
    this.kira.moveTo('entrance', 'IDLE_WALK');
    const events: MondayNightStageEvent[] = [];
    events.push({ type: 'BEBO_DIALOGUE', beboDialogue: beboShowOpen(this._tick()) });
    return events;
  }

  presentContestant(contestantId: string, performerName = 'Performer'): MondayNightStageEvent[] {
    this.panelContestantId = contestantId;
    this.panelVisible = true;
    this.bebo.reset();

    const events: MondayNightStageEvent[] = [];
    const seed = this._tick();

    // Kira intros the act
    this.kira.introAct(contestantId);
    const kiraLine = kiraActIntro(performerName, '', seed);
    events.push({ type: 'KIRA_DIALOGUE', kiraDialogue: kiraLine });

    // Open crowd vote
    this.show.openCrowdVote();
    return events;
  }

  /**
   * Process the latest vote counts. Returns an array of events the caller
   * should act on (sounds, dialogue, panel animations).
   * Call this on every vote batch (recommended: debounced every 3–5 seconds).
   */
  processCrowdVote(): MondayNightStageEvent[] {
    const state = this.show.getState();
    const { crowdBooCount: booCount, crowdYayCount: yayCount } = state;
    const transition = this.bebo.tick(booCount, yayCount);
    if (!transition) return [];

    const events: MondayNightStageEvent[] = [];
    const seed = this._tick();
    const performerName = this.panelContestantId ?? 'Performer';

    // 1. Emit all sound cues in order
    for (const soundId of transition.soundCueIds) {
      events.push({ type: 'PLAY_SOUND', soundId });
    }

    // 2. Emit the appropriate Bebo dialogue line
    if (transition.dialogueHint === 'peek') {
      events.push({
        type: 'BEBO_DIALOGUE',
        beboDialogue: beboPeekFromBackstage(seed, performerName),
      });
    } else if (transition.dialogueHint === 'warning') {
      events.push({
        type: 'BEBO_DIALOGUE',
        beboDialogue: beboOnStageWarning(seed, performerName),
      });
    } else if (transition.dialogueHint === 'recovery') {
      events.push({
        type: 'BEBO_DIALOGUE',
        beboDialogue: beboRecoveryExit(seed, performerName),
      });
    } else if (transition.dialogueHint === 'removal') {
      events.push({
        type: 'BEBO_DIALOGUE',
        beboDialogue: beboHookCommentary('aftermath', seed, performerName),
      });
    }

    // 3. Execute panel action
    if (transition.panelAction === 'SLIDE_OFF' && this.panelContestantId) {
      this.show.eliminateContestant(this.panelContestantId);
      this.panelVisible = false;
      events.push({
        type: 'PANEL_SLIDE_OFF',
        contestantId: this.panelContestantId,
      });
      this.show.closeCrowdVote();
    } else if (transition.panelAction === 'RESTORE') {
      events.push({ type: 'PANEL_RESTORE', contestantId: this.panelContestantId ?? undefined });
    }

    return events;
  }

  /** Ask Kira to do a pre-performance spotlight */
  getKiraSpotlight(performerName: string): KiraDialogue[] {
    const seed = this._tick();
    return kiraSpotlightSet(['beginning', 'funny_random'], seed, performerName);
  }

  /** Ask Kira for a post-performance question */
  getKiraPostPerformance(performerName: string): KiraDialogue {
    return kiraAskQuestion('ending', this._tick(), performerName);
  }

  /** Ask Kira to prompt audience reactions */
  getKiraAudiencePrompt(performerName: string): KiraDialogue {
    return kiraAudiencePrompt(this._tick(), performerName);
  }

  /** Kira recognises a returning performer */
  getKiraReturningPerformer(context: KiraReturnContext): KiraDialogue {
    return kiraReturningPerformer(context);
  }

  /** Act transition — Bebo between performers */
  getActTransition(): BeboDialogue {
    return beboActTransition(this._tick());
  }

  /** Bebo calls the next performer to the stage */
  callNextPerformer(performerName: string): BeboDialogue {
    return beboCallNextPerformer(performerName, this._tick());
  }

  /** Random Bebo catchphrase — use sparingly between acts */
  getBeboCatchphrase(): BeboDialogue {
    return beboCatchphrase(this._tick());
  }

  getFullState(): MondayNightStageState {
    return {
      show: this.show.getState(),
      bebo: this.bebo.getState(),
      kira: this.kira.getState(),
      panelVisible: this.panelVisible,
      panelContestantId: this.panelContestantId,
    };
  }

  /** Simple ever-incrementing seed so each call picks a different line */
  private _tick(): number {
    this._seed = (this._seed + 1) % 997; // prime modulo keeps it varied
    return this._seed;
  }
}
