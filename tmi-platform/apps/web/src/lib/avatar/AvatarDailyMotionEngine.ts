/**
 * AvatarDailyMotionEngine
 * Issues daily motion directives to all avatar instances.
 * Wraps AvatarBehaviorEngine + AvatarEmoteEngine into a date-refreshed directive system.
 * Ensures no avatar stays frozen or stale across sessions.
 */

import { startAvatarBehaviorEngine, type AvatarBehaviorMode } from "@/lib/avatar/AvatarBehaviorEngine";
import { avatarBehaviorEngine as learningAvatarBehaviorEngine } from "@/lib/learning/AvatarBehaviorEngine";
import { applySafeLearningMutation } from "@/lib/learning/LearningSafetyEngine";
import { platformLearningCore } from "@/lib/learning/PlatformLearningCore";

export type MotionDirectiveType =
  | "idle"
  | "walking"
  | "dancing"
  | "talking"
  | "lip-sync"
  | "blinking"
  | "eye-movement"
  | "head-turn"
  | "hand-gesture"
  | "crowd-react"
  | "happy"
  | "angry"
  | "surprised"
  | "stage-swagger"
  | "battle-stance"
  | "winner-celebration"
  | "pocket-pull"
  | "collectible-reveal";

export interface AvatarMotionDirective {
  motion: MotionDirectiveType;
  duration: number;
  loopable: boolean;
  priority: 1 | 2 | 3;
  fallback: MotionDirectiveType;
  lipSyncEnabled: boolean;
}

export interface DailyMotionBoard {
  date: string;
  defaultMotion: MotionDirectiveType;
  battleMotion: MotionDirectiveType;
  idleVariants: MotionDirectiveType[];
  reactionSet: MotionDirectiveType[];
  celebrationMotion: MotionDirectiveType;
  crowdMotion: MotionDirectiveType;
}

const IDLE_POOL: MotionDirectiveType[] = ["idle", "blinking", "eye-movement", "head-turn"];
const REACTION_POOL: MotionDirectiveType[] = ["happy", "surprised", "crowd-react", "hand-gesture"];
const CELEBRATION_POOL: MotionDirectiveType[] = ["winner-celebration", "dancing", "stage-swagger"];
const CROWD_POOL: MotionDirectiveType[] = ["crowd-react", "dancing", "hand-gesture", "clapping" as MotionDirectiveType];

function dayHash(): number {
  const today = new Date().toISOString().split("T")[0];
  return today.split("-").reduce((h, n) => (h * 31 + parseInt(n)) >>> 0, 0);
}

function pickFrom<T>(arr: T[], offset: number): T {
  return arr[(dayHash() + offset) % arr.length];
}

export function getDailyMotionBoard(): DailyMotionBoard {
  return {
    date: new Date().toISOString().split("T")[0],
    defaultMotion: pickFrom(IDLE_POOL, 0),
    battleMotion: pickFrom(["battle-stance", "stage-swagger"], 0) as MotionDirectiveType,
    idleVariants: [pickFrom(IDLE_POOL, 1), pickFrom(IDLE_POOL, 2), pickFrom(IDLE_POOL, 3)],
    reactionSet: [pickFrom(REACTION_POOL, 0), pickFrom(REACTION_POOL, 1)],
    celebrationMotion: pickFrom(CELEBRATION_POOL, 0),
    crowdMotion: pickFrom(CROWD_POOL, 0),
  };
}

export function getMotionDirective(motion: MotionDirectiveType, avatarId?: string): AvatarMotionDirective {
  const DIRECTIVES: Record<MotionDirectiveType, AvatarMotionDirective> = {
    "idle":               { motion: "idle",               duration: 8000,  loopable: true,  priority: 3, fallback: "blinking",          lipSyncEnabled: false },
    "walking":            { motion: "walking",            duration: 3000,  loopable: true,  priority: 2, fallback: "idle",              lipSyncEnabled: false },
    "dancing":            { motion: "dancing",            duration: 6000,  loopable: true,  priority: 2, fallback: "stage-swagger",     lipSyncEnabled: false },
    "talking":            { motion: "talking",            duration: 4000,  loopable: false, priority: 1, fallback: "idle",              lipSyncEnabled: true  },
    "lip-sync":           { motion: "lip-sync",           duration: 0,     loopable: true,  priority: 1, fallback: "talking",           lipSyncEnabled: true  },
    "blinking":           { motion: "blinking",           duration: 200,   loopable: true,  priority: 3, fallback: "idle",              lipSyncEnabled: false },
    "eye-movement":       { motion: "eye-movement",       duration: 1500,  loopable: true,  priority: 3, fallback: "blinking",          lipSyncEnabled: false },
    "head-turn":          { motion: "head-turn",          duration: 800,   loopable: false, priority: 3, fallback: "idle",              lipSyncEnabled: false },
    "hand-gesture":       { motion: "hand-gesture",       duration: 1200,  loopable: false, priority: 2, fallback: "idle",              lipSyncEnabled: false },
    "crowd-react":        { motion: "crowd-react",        duration: 2000,  loopable: false, priority: 2, fallback: "happy",             lipSyncEnabled: false },
    "happy":              { motion: "happy",              duration: 1800,  loopable: false, priority: 2, fallback: "idle",              lipSyncEnabled: false },
    "angry":              { motion: "angry",              duration: 1500,  loopable: false, priority: 1, fallback: "idle",              lipSyncEnabled: false },
    "surprised":          { motion: "surprised",          duration: 1200,  loopable: false, priority: 2, fallback: "happy",             lipSyncEnabled: false },
    "stage-swagger":      { motion: "stage-swagger",      duration: 5000,  loopable: true,  priority: 2, fallback: "dancing",           lipSyncEnabled: false },
    "battle-stance":      { motion: "battle-stance",      duration: 3000,  loopable: true,  priority: 1, fallback: "stage-swagger",     lipSyncEnabled: false },
    "winner-celebration": { motion: "winner-celebration", duration: 6000,  loopable: false, priority: 1, fallback: "dancing",           lipSyncEnabled: false },
    "pocket-pull":        { motion: "pocket-pull",        duration: 2000,  loopable: false, priority: 1, fallback: "hand-gesture",      lipSyncEnabled: false },
    "collectible-reveal": { motion: "collectible-reveal", duration: 3500,  loopable: false, priority: 1, fallback: "winner-celebration", lipSyncEnabled: false },
  };
  const base = DIRECTIVES[motion];
  if (!avatarId) {
    return base;
  }

  const signal = learningAvatarBehaviorEngine
    .getAvatarSignals(40)
    .find((item) => item.avatarId === avatarId.toLowerCase());
  const requestedDuration = base.duration + Math.round((signal?.engagementScore ?? 0) * 12);
  const mutation = applySafeLearningMutation({
    engine: 'AvatarDailyMotionEngine',
    targetId: avatarId.toLowerCase(),
    metric: 'motion-duration-ms',
    beforeValue: base.duration,
    requestedValue: requestedDuration,
    minValue: 200,
    maxValue: 12000,
    confidence: signal ? 0.71 : 0.52,
    reason: 'adapt motion timing from avatar engagement patterns',
  });

  return {
    ...base,
    duration: mutation.appliedValue,
  };
}

export function applyDailyDirectiveToAvatar(avatarId: string): AvatarBehaviorMode {
  const board = getDailyMotionBoard();
  const signal = learningAvatarBehaviorEngine
    .getAvatarSignals(40)
    .find((item) => item.avatarId === avatarId.toLowerCase());
  const modeMap: Record<MotionDirectiveType, AvatarBehaviorMode> = {
    "idle":               "idle",
    "walking":            "room",
    "dancing":            "stage",
    "talking":            "room",
    "lip-sync":           "stage",
    "blinking":           "idle",
    "eye-movement":       "idle",
    "head-turn":          "idle",
    "hand-gesture":       "room",
    "crowd-react":        "venue",
    "happy":              "room",
    "angry":              "battle",
    "surprised":          "room",
    "stage-swagger":      "stage",
    "battle-stance":      "battle",
    "winner-celebration": "stage",
    "pocket-pull":        "room",
    "collectible-reveal": "room",
  };

  const selectedMotion = (signal?.engagementScore ?? 0) > 14 ? board.battleMotion : board.defaultMotion;
  const mode = modeMap[selectedMotion] ?? "idle";
  startAvatarBehaviorEngine(avatarId);

  platformLearningCore.ingestEvent({
    type: 'avatar_action',
    userId: avatarId.toLowerCase(),
    targetId: selectedMotion,
    context: {
      mode,
      crowdMotion: board.crowdMotion,
      learnedBattleBias: (signal?.engagementScore ?? 0) > 14,
    },
  });

  return mode;
}
