/**
 * AvatarExpressionDirectiveEngine
 * Issues daily expression directives to avatar instances.
 * Controls facial state, brow position, eye shape, mouth curve.
 * Integrates with AvatarEmoteEngine for triggered reactions.
 */

import { startAvatarEmoteEngine, type AvatarReactionState } from "@/lib/avatar/AvatarEmoteEngine";
import { emoteLearningEngine } from "@/lib/learning/EmoteLearningEngine";
import { applySafeLearningMutation } from "@/lib/learning/LearningSafetyEngine";

export type ExpressionType =
  | "neutral"
  | "smile"
  | "smirk"
  | "grin"
  | "scowl"
  | "raised-brow"
  | "wide-eyes"
  | "squint"
  | "wink"
  | "pout"
  | "jaw-drop"
  | "confident"
  | "focused"
  | "disgusted"
  | "shocked";

export interface ExpressionConfig {
  expression: ExpressionType;
  browPosition: "raised" | "furrowed" | "neutral";
  eyeShape: "wide" | "squint" | "normal" | "closed-half";
  mouthCurve: "up" | "down" | "neutral" | "open";
  intensity: 0 | 1 | 2 | 3;
  holdMs: number;
  transitionMs: number;
  reactionState: AvatarReactionState;
}

export interface DailyExpressionBoard {
  date: string;
  defaultExpression: ExpressionType;
  crowdExpression: ExpressionType;
  battleExpression: ExpressionType;
  celebrationExpression: ExpressionType;
  idleVariants: ExpressionType[];
}

const EXPRESSION_CONFIGS: Record<ExpressionType, ExpressionConfig> = {
  "neutral":      { expression: "neutral",     browPosition: "neutral",  eyeShape: "normal",      mouthCurve: "neutral", intensity: 0, holdMs: 6000, transitionMs: 400, reactionState: "neutral"     },
  "smile":        { expression: "smile",       browPosition: "raised",   eyeShape: "normal",      mouthCurve: "up",      intensity: 1, holdMs: 3000, transitionMs: 300, reactionState: "happy"       },
  "smirk":        { expression: "smirk",       browPosition: "neutral",  eyeShape: "squint",      mouthCurve: "up",      intensity: 1, holdMs: 2000, transitionMs: 250, reactionState: "focused"     },
  "grin":         { expression: "grin",        browPosition: "raised",   eyeShape: "wide",        mouthCurve: "up",      intensity: 2, holdMs: 2500, transitionMs: 300, reactionState: "hyped"       },
  "scowl":        { expression: "scowl",       browPosition: "furrowed", eyeShape: "squint",      mouthCurve: "down",    intensity: 2, holdMs: 2000, transitionMs: 350, reactionState: "focused"     },
  "raised-brow":  { expression: "raised-brow", browPosition: "raised",   eyeShape: "wide",        mouthCurve: "neutral", intensity: 1, holdMs: 1500, transitionMs: 200, reactionState: "neutral"     },
  "wide-eyes":    { expression: "wide-eyes",   browPosition: "raised",   eyeShape: "wide",        mouthCurve: "open",    intensity: 2, holdMs: 1200, transitionMs: 150, reactionState: "hyped"       },
  "squint":       { expression: "squint",      browPosition: "furrowed", eyeShape: "squint",      mouthCurve: "neutral", intensity: 1, holdMs: 1500, transitionMs: 200, reactionState: "focused"     },
  "wink":         { expression: "wink",        browPosition: "raised",   eyeShape: "closed-half", mouthCurve: "up",      intensity: 1, holdMs: 600,  transitionMs: 100, reactionState: "happy"       },
  "pout":         { expression: "pout",        browPosition: "neutral",  eyeShape: "normal",      mouthCurve: "down",    intensity: 1, holdMs: 1800, transitionMs: 300, reactionState: "neutral"     },
  "jaw-drop":     { expression: "jaw-drop",    browPosition: "raised",   eyeShape: "wide",        mouthCurve: "open",    intensity: 3, holdMs: 1000, transitionMs: 100, reactionState: "hyped"       },
  "confident":    { expression: "confident",   browPosition: "neutral",  eyeShape: "squint",      mouthCurve: "up",      intensity: 2, holdMs: 4000, transitionMs: 400, reactionState: "focused"     },
  "focused":      { expression: "focused",     browPosition: "furrowed", eyeShape: "squint",      mouthCurve: "neutral", intensity: 2, holdMs: 5000, transitionMs: 500, reactionState: "focused"     },
  "disgusted":    { expression: "disgusted",   browPosition: "furrowed", eyeShape: "squint",      mouthCurve: "down",    intensity: 2, holdMs: 1500, transitionMs: 300, reactionState: "neutral"     },
  "shocked":      { expression: "shocked",     browPosition: "raised",   eyeShape: "wide",        mouthCurve: "open",    intensity: 3, holdMs: 1200, transitionMs: 120, reactionState: "hyped"       },
};

const IDLE_EXPRESSIONS: ExpressionType[] = ["neutral", "smile", "smirk", "raised-brow", "squint"];
const CROWD_EXPRESSIONS: ExpressionType[] = ["grin", "wide-eyes", "jaw-drop", "shocked", "wink"];
const BATTLE_EXPRESSIONS: ExpressionType[] = ["scowl", "focused", "confident", "squint"];
const CELEBRATION_EXPRESSIONS: ExpressionType[] = ["grin", "jaw-drop", "wide-eyes", "shocked", "smile"];

function dayHash(): number {
  const today = new Date().toISOString().split("T")[0];
  return today.split("-").reduce((h, n) => (h * 31 + parseInt(n)) >>> 0, 0);
}

function pickFrom<T>(arr: T[], offset: number): T {
  return arr[(dayHash() + offset) % arr.length];
}

export function getDailyExpressionBoard(): DailyExpressionBoard {
  return {
    date: new Date().toISOString().split("T")[0],
    defaultExpression: pickFrom(IDLE_EXPRESSIONS, 0),
    crowdExpression: pickFrom(CROWD_EXPRESSIONS, 1),
    battleExpression: pickFrom(BATTLE_EXPRESSIONS, 2),
    celebrationExpression: pickFrom(CELEBRATION_EXPRESSIONS, 3),
    idleVariants: [
      pickFrom(IDLE_EXPRESSIONS, 1),
      pickFrom(IDLE_EXPRESSIONS, 2),
      pickFrom(IDLE_EXPRESSIONS, 3),
    ],
  };
}

export function getExpressionConfig(expression: ExpressionType): ExpressionConfig {
  return EXPRESSION_CONFIGS[expression];
}

export function applyDailyExpressionToAvatar(avatarId: string): ExpressionConfig {
  const board = getDailyExpressionBoard();
  const emoteSignal = emoteLearningEngine.getTopEmotes(20)[0];
  const preferredExpression: ExpressionType =
    emoteSignal && emoteSignal.responseScore > 70 ? board.celebrationExpression : board.defaultExpression;
  const base = EXPRESSION_CONFIGS[preferredExpression];
  const intensityMutation = applySafeLearningMutation({
    engine: 'AvatarExpressionDirectiveEngine',
    targetId: avatarId.toLowerCase(),
    metric: 'expression-intensity',
    beforeValue: base.intensity,
    requestedValue: base.intensity + (emoteSignal ? 1 : 0),
    minValue: 0,
    maxValue: 3,
    confidence: emoteSignal ? 0.72 : 0.48,
    reason: 'expression selection adapts from emote response performance',
  });

  const config: ExpressionConfig = {
    ...base,
    intensity: intensityMutation.appliedValue as 0 | 1 | 2 | 3,
  };
  startAvatarEmoteEngine(avatarId);
  return config;
}

export function getExpressionForContext(
  context: "idle" | "crowd" | "battle" | "celebration"
): ExpressionConfig {
  const board = getDailyExpressionBoard();
  const map: Record<string, ExpressionType> = {
    idle:        board.defaultExpression,
    crowd:       board.crowdExpression,
    battle:      board.battleExpression,
    celebration: board.celebrationExpression,
  };
  return EXPRESSION_CONFIGS[map[context] ?? "neutral"];
}

export function getExpressionSequence(count: number): ExpressionConfig[] {
  const board = getDailyExpressionBoard();
  const all: ExpressionType[] = [
    board.defaultExpression,
    ...board.idleVariants,
    board.crowdExpression,
  ];
  return all.slice(0, count).map(e => EXPRESSION_CONFIGS[e]);
}
