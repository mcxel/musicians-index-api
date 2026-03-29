// ============================================================
// AVATAR EXPRESSION REGISTRY
// TMI Platform — The Musicians Index
// ============================================================

import type { AvatarExpressionState, AvatarPoseState } from './types';

export interface ExpressionDefinition {
  id: AvatarExpressionState;
  label: string;
  intensity: 'subtle' | 'moderate' | 'strong';
  durationMs: number;
  triggeredBy: string[];
  pairedPoses: AvatarPoseState[];
  autoRevert: boolean;
  revertToExpression: AvatarExpressionState;
}

export const EXPRESSION_REGISTRY: Record<AvatarExpressionState, ExpressionDefinition> = {
  neutral: {
    id: 'neutral',
    label: 'Neutral',
    intensity: 'subtle',
    durationMs: 0,
    triggeredBy: ['default', 'idle', 'reset'],
    pairedPoses: ['idle', 'watching', 'crowd-sway'],
    autoRevert: false,
    revertToExpression: 'neutral',
  },
  happy: {
    id: 'happy',
    label: 'Happy',
    intensity: 'moderate',
    durationMs: 3000,
    triggeredBy: ['applause', 'tip-received', 'win', 'join-room'],
    pairedPoses: ['watching', 'clapping', 'idle'],
    autoRevert: true,
    revertToExpression: 'neutral',
  },
  excited: {
    id: 'excited',
    label: 'Excited',
    intensity: 'strong',
    durationMs: 2500,
    triggeredBy: ['stage-entry', 'big-moment', 'contest-win', 'crowd-hype'],
    pairedPoses: ['cheering', 'clapping', 'dance-loop'],
    autoRevert: true,
    revertToExpression: 'happy',
  },
  focused: {
    id: 'focused',
    label: 'Focused',
    intensity: 'subtle',
    durationMs: 0,
    triggeredBy: ['host-speaking', 'performance-start', 'contest-entry'],
    pairedPoses: ['watching', 'listening-left', 'listening-right'],
    autoRevert: false,
    revertToExpression: 'neutral',
  },
  surprised: {
    id: 'surprised',
    label: 'Surprised',
    intensity: 'strong',
    durationMs: 1500,
    triggeredBy: ['unexpected-event', 'loud-sound', 'winner-announced'],
    pairedPoses: ['surprised', 'reacting'],
    autoRevert: true,
    revertToExpression: 'neutral',
  },
  laughing: {
    id: 'laughing',
    label: 'Laughing',
    intensity: 'strong',
    durationMs: 2000,
    triggeredBy: ['joke-moment', 'funny-event', 'host-humor'],
    pairedPoses: ['laughing', 'reacting'],
    autoRevert: true,
    revertToExpression: 'happy',
  },
  thinking: {
    id: 'thinking',
    label: 'Thinking',
    intensity: 'subtle',
    durationMs: 2000,
    triggeredBy: ['question-asked', 'poll-active', 'decision-moment'],
    pairedPoses: ['leaning-in', 'idle'],
    autoRevert: true,
    revertToExpression: 'focused',
  },
  nodding: {
    id: 'nodding',
    label: 'Nodding',
    intensity: 'subtle',
    durationMs: 1500,
    triggeredBy: ['agreement', 'listening-active', 'beat-drop'],
    pairedPoses: ['listening-left', 'listening-right', 'watching'],
    autoRevert: true,
    revertToExpression: 'neutral',
  },
  skeptical: {
    id: 'skeptical',
    label: 'Skeptical',
    intensity: 'moderate',
    durationMs: 2000,
    triggeredBy: ['controversial-moment', 'booing-active'],
    pairedPoses: ['watching', 'idle'],
    autoRevert: true,
    revertToExpression: 'neutral',
  },
  proud: {
    id: 'proud',
    label: 'Proud',
    intensity: 'moderate',
    durationMs: 3000,
    triggeredBy: ['achievement-unlocked', 'tier-upgrade', 'contest-placed'],
    pairedPoses: ['idle', 'watching'],
    autoRevert: true,
    revertToExpression: 'happy',
  },
  hyped: {
    id: 'hyped',
    label: 'Hyped',
    intensity: 'strong',
    durationMs: 4000,
    triggeredBy: ['crowd-peak', 'drop-moment', 'applause-wave', 'winner-reveal'],
    pairedPoses: ['cheering', 'dance-loop', 'clapping'],
    autoRevert: true,
    revertToExpression: 'excited',
  },
};

export function getExpressionForTrigger(trigger: string): AvatarExpressionState {
  for (const expr of Object.values(EXPRESSION_REGISTRY)) {
    if (expr.triggeredBy.includes(trigger)) return expr.id;
  }
  return 'neutral';
}

export function getExpressionsForPose(pose: AvatarPoseState): AvatarExpressionState[] {
  return Object.values(EXPRESSION_REGISTRY)
    .filter((e) => e.pairedPoses.includes(pose))
    .map((e) => e.id);
}
