// ============================================================
// AVATAR BEHAVIOR PRESETS
// TMI Platform — The Musicians Index
// ============================================================

import type { AvatarRole, AvatarPoseState, AvatarExpressionState, AvatarBehaviorContext } from './types';

export interface BehaviorRule {
  id: string;
  label: string;
  trigger: string;
  condition?: (ctx: AvatarBehaviorContext) => boolean;
  resultPose: AvatarPoseState;
  resultExpression: AvatarExpressionState;
  priority: number;
  durationMs?: number;
}

export interface RoleBehaviorPreset {
  role: AvatarRole;
  label: string;
  rules: BehaviorRule[];
  idlePose: AvatarPoseState;
  idleExpression: AvatarExpressionState;
}

export const BEHAVIOR_PRESETS: Record<AvatarRole, RoleBehaviorPreset> = {
  host: {
    role: 'host',
    label: 'Host Behavior',
    idlePose: 'host-speaking',
    idleExpression: 'focused',
    rules: [
      {
        id: 'host-intro',
        label: 'Host Intro Walk',
        trigger: 'show-start',
        resultPose: 'intro-walk',
        resultExpression: 'excited',
        priority: 10,
        durationMs: 3000,
      },
      {
        id: 'host-applause',
        label: 'Host Reacts to Applause',
        trigger: 'applause',
        resultPose: 'reacting',
        resultExpression: 'happy',
        priority: 5,
        durationMs: 2000,
      },
      {
        id: 'host-camera',
        label: 'Host Camera Look',
        trigger: 'camera-cue',
        resultPose: 'camera-look',
        resultExpression: 'focused',
        priority: 7,
        durationMs: 2000,
      },
      {
        id: 'host-audience-left',
        label: 'Host Looks Audience Left',
        trigger: 'audience-cue-left',
        resultPose: 'audience-look-left',
        resultExpression: 'happy',
        priority: 4,
        durationMs: 1500,
      },
    ],
  },
  cohost: {
    role: 'cohost',
    label: 'Co-Host Behavior',
    idlePose: 'cohost-speaking',
    idleExpression: 'focused',
    rules: [
      {
        id: 'cohost-listen',
        label: 'Co-Host Listens to Host',
        trigger: 'host-speaking',
        resultPose: 'listening-left',
        resultExpression: 'nodding',
        priority: 6,
        durationMs: 0,
      },
      {
        id: 'cohost-react',
        label: 'Co-Host Reacts',
        trigger: 'big-moment',
        resultPose: 'reacting',
        resultExpression: 'excited',
        priority: 7,
        durationMs: 2000,
      },
    ],
  },
  guest: {
    role: 'guest',
    label: 'Guest Behavior',
    idlePose: 'idle',
    idleExpression: 'neutral',
    rules: [
      {
        id: 'guest-listen',
        label: 'Guest Listens',
        trigger: 'host-speaking',
        resultPose: 'listening-right',
        resultExpression: 'focused',
        priority: 5,
        durationMs: 0,
      },
      {
        id: 'guest-talk',
        label: 'Guest Talks',
        trigger: 'guest-cue',
        resultPose: 'talking',
        resultExpression: 'happy',
        priority: 8,
        durationMs: 0,
      },
    ],
  },
  artist: {
    role: 'artist',
    label: 'Artist Behavior',
    idlePose: 'mic-hold',
    idleExpression: 'focused',
    rules: [
      {
        id: 'artist-stage-entry',
        label: 'Artist Stage Entry',
        trigger: 'stage-entry',
        resultPose: 'stage-entry',
        resultExpression: 'excited',
        priority: 10,
        durationMs: 2000,
      },
      {
        id: 'artist-perform',
        label: 'Artist Performing',
        trigger: 'performance-start',
        resultPose: 'mic-hold',
        resultExpression: 'focused',
        priority: 9,
        durationMs: 0,
      },
      {
        id: 'artist-crowd-react',
        label: 'Artist Reacts to Crowd',
        trigger: 'applause',
        resultPose: 'reacting',
        resultExpression: 'hyped',
        priority: 6,
        durationMs: 2500,
      },
    ],
  },
  fan: {
    role: 'fan',
    label: 'Fan Behavior',
    idlePose: 'watching',
    idleExpression: 'happy',
    rules: [
      {
        id: 'fan-applause',
        label: 'Fan Claps',
        trigger: 'applause',
        resultPose: 'clapping',
        resultExpression: 'excited',
        priority: 5,
        durationMs: 2500,
      },
      {
        id: 'fan-hype',
        label: 'Fan Gets Hyped',
        trigger: 'crowd-peak',
        resultPose: 'cheering',
        resultExpression: 'hyped',
        priority: 7,
        durationMs: 3000,
      },
      {
        id: 'fan-dance',
        label: 'Fan Dances',
        trigger: 'drop-moment',
        resultPose: 'dance-loop',
        resultExpression: 'excited',
        priority: 6,
        durationMs: 0,
      },
      {
        id: 'fan-sway',
        label: 'Fan Sways',
        trigger: 'music-playing',
        resultPose: 'crowd-sway',
        resultExpression: 'happy',
        priority: 2,
        durationMs: 0,
      },
    ],
  },
  vip: {
    role: 'vip',
    label: 'VIP Behavior',
    idlePose: 'watching',
    idleExpression: 'proud',
    rules: [
      {
        id: 'vip-react',
        label: 'VIP Reacts',
        trigger: 'big-moment',
        resultPose: 'reacting',
        resultExpression: 'excited',
        priority: 5,
        durationMs: 2000,
      },
      {
        id: 'vip-clap',
        label: 'VIP Claps',
        trigger: 'applause',
        resultPose: 'clapping',
        resultExpression: 'happy',
        priority: 4,
        durationMs: 2000,
      },
    ],
  },
  audience: {
    role: 'audience',
    label: 'Audience Behavior',
    idlePose: 'crowd-sway',
    idleExpression: 'neutral',
    rules: [
      {
        id: 'audience-cheer',
        label: 'Audience Cheers',
        trigger: 'applause',
        resultPose: 'cheering',
        resultExpression: 'excited',
        priority: 5,
        durationMs: 3000,
      },
      {
        id: 'audience-dance',
        label: 'Audience Dances',
        trigger: 'drop-moment',
        resultPose: 'dance-loop',
        resultExpression: 'hyped',
        priority: 6,
        durationMs: 0,
      },
    ],
  },
  npc: {
    role: 'npc',
    label: 'NPC Crowd Behavior',
    idlePose: 'crowd-sway',
    idleExpression: 'neutral',
    rules: [
      {
        id: 'npc-mirror-crowd',
        label: 'NPC Mirrors Crowd',
        trigger: 'applause',
        resultPose: 'clapping',
        resultExpression: 'happy',
        priority: 3,
        durationMs: 2000,
      },
      {
        id: 'npc-sway',
        label: 'NPC Sways',
        trigger: 'music-playing',
        resultPose: 'crowd-sway',
        resultExpression: 'neutral',
        priority: 1,
        durationMs: 0,
      },
    ],
  },
};

export function resolveBehavior(
  role: AvatarRole,
  trigger: string,
  ctx: AvatarBehaviorContext
): { pose: AvatarPoseState; expression: AvatarExpressionState } | null {
  const preset = BEHAVIOR_PRESETS[role];
  if (!preset) return null;

  const matching = preset.rules
    .filter((r) => r.trigger === trigger && (!r.condition || r.condition(ctx)))
    .sort((a, b) => b.priority - a.priority);

  if (matching.length === 0) return null;
  return { pose: matching[0].resultPose, expression: matching[0].resultExpression };
}
