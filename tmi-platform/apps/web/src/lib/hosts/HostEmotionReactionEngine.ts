/**
 * Host Emotion Reaction Engine
 * Maps show events to host emotional states and reaction payloads.
 */

export type HostEmotionalState =
  | 'neutral'
  | 'smirk'
  | 'laugh'
  | 'shock'
  | 'serious'
  | 'celebrate'
  | 'disappointed';

export interface HostEmotionalReaction {
  state: HostEmotionalState;
  intensityMs: number;
  facialCode: string;
  gestureCode: string;
}

export type ReactionEvent =
  | 'bad_score'
  | 'okay_score'
  | 'hot_score'
  | 'elite_score'
  | 'cutoff_trigger'
  | 'casual_banter'
  | 'contestant_enter'
  | 'crowd_hype'
  | 'prize_announce'
  | 'sponsor_read';

const REACTION_MAP: Record<ReactionEvent, HostEmotionalReaction> = {
  bad_score: {
    state: 'disappointed',
    intensityMs: 2400,
    facialCode: 'face-disappointed-slow-shake',
    gestureCode: 'gesture-slow-exhale',
  },
  okay_score: {
    state: 'neutral',
    intensityMs: 1600,
    facialCode: 'face-neutral-eyebrow-lift',
    gestureCode: 'gesture-shrug-one-shoulder',
  },
  hot_score: {
    state: 'smirk',
    intensityMs: 2000,
    facialCode: 'face-smirk-nod',
    gestureCode: 'gesture-point-approval',
  },
  elite_score: {
    state: 'celebrate',
    intensityMs: 3200,
    facialCode: 'face-wide-smile-clap',
    gestureCode: 'gesture-arms-raise-celebrate',
  },
  cutoff_trigger: {
    state: 'serious',
    intensityMs: 3600,
    facialCode: 'face-dead-serious-stare',
    gestureCode: 'gesture-cutoff-hand-slash',
  },
  casual_banter: {
    state: 'smirk',
    intensityMs: 1200,
    facialCode: 'face-smirk-glance',
    gestureCode: 'gesture-mic-tap',
  },
  contestant_enter: {
    state: 'neutral',
    intensityMs: 1400,
    facialCode: 'face-assess-squint',
    gestureCode: 'gesture-slow-look-up',
  },
  crowd_hype: {
    state: 'laugh',
    intensityMs: 2800,
    facialCode: 'face-open-laugh-crowd',
    gestureCode: 'gesture-arms-spread-crowd',
  },
  prize_announce: {
    state: 'celebrate',
    intensityMs: 4000,
    facialCode: 'face-wide-grin-point',
    gestureCode: 'gesture-prize-reveal-point',
  },
  sponsor_read: {
    state: 'serious',
    intensityMs: 2000,
    facialCode: 'face-composed-presenter',
    gestureCode: 'gesture-open-palm-present',
  },
};

export class HostEmotionReactionEngine {
  static getReactionForEvent(event: ReactionEvent): HostEmotionalReaction {
    return REACTION_MAP[event];
  }

  static getState(event: ReactionEvent): HostEmotionalState {
    return REACTION_MAP[event].state;
  }
}
