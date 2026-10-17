/**
 * AvatarBehavioralDirector — Living Avatar / playful interaction authority.
 *
 * Extends the existing crowd director. NOT a second skeleton/runtime.
 * Composes ExpressionEngine + AvatarPreviewRuntime action paths.
 *
 * Laws:
 * - FREE identity (skin/face/basic hair) never paywalled
 * - Paid layer = optional cosmetics only
 * - Learning = preference among CERTIFIED behaviors only (no self-modifying code)
 * - Reactions may only use original TMI semantic vocabulary
 */

import { triggerExpression, type AvatarExpression } from "@/lib/avatars/ExpressionEngine";
import {
  resolveProductionMotionPath,
  type AvatarPreviewAction,
} from "@/lib/avatars/AvatarPreviewActions";

/** Semantic reaction vocabulary — Animation Director picks certified clips/blends. */
export type LivingAvatarReaction =
  | "CURIOUS"
  | "SURPRISED"
  | "PLAYFUL"
  | "HAPPY"
  | "PROUD"
  | "SHY"
  | "EXCITED"
  | "CONFUSED"
  | "RELAXED"
  | "CELEBRATE"
  | "WAVE"
  | "LAUGH"
  | "LOOK_AT_USER"
  | "STRETCH"
  | "HEAD_TILT"
  | "SHOULDER_SHRUG"
  | "DANCE_IDLE";

export type AvatarHitZone = "head" | "face" | "shoulder" | "hand" | "torso" | "generic";

export type AvatarWorldContext =
  | "PROFILE"
  | "CREATION_CENTER"
  | "STORE"
  | "FAN_LOBBY"
  | "LOUNGE"
  | "VENUE_AUDIENCE"
  | "WORLD_DANCE_PARTY"
  | "GAME";

/** Free-forever identity controls — never monetize skin tone / core face match. */
export const FREE_AVATAR_IDENTITY_CONTROLS = [
  "skin_tone",
  "face_shape",
  "facial_proportions",
  "head_shape",
  "eyes",
  "nose",
  "mouth",
  "jaw",
  "cheeks",
  "brows",
  "basic_hair",
  "hair_color",
  "basic_body",
  "presentation_masc_fem_neutral",
] as const;

export type FreeAvatarIdentityControl = (typeof FREE_AVATAR_IDENTITY_CONTROLS)[number];

const REACTION_TO_EXPRESSION: Partial<Record<LivingAvatarReaction, AvatarExpression>> = {
  CURIOUS: "focused",
  SURPRISED: "surprised",
  PLAYFUL: "silly",
  HAPPY: "happy",
  PROUD: "happy",
  SHY: "neutral",
  EXCITED: "excited",
  CONFUSED: "focused",
  RELAXED: "neutral",
  CELEBRATE: "encore",
  WAVE: "happy",
  LAUGH: "laughing",
  LOOK_AT_USER: "focused",
  STRETCH: "neutral",
  HEAD_TILT: "silly",
  SHOULDER_SHRUG: "neutral",
  DANCE_IDLE: "excited",
};

const REACTION_TO_MOTION: Partial<Record<LivingAvatarReaction, AvatarPreviewAction>> = {
  WAVE: "WAVE",
  CELEBRATE: "HYPE",
  DANCE_IDLE: "DANCE",
  LAUGH: "EMOTE",
  PLAYFUL: "EMOTE",
  EXCITED: "HYPE",
};

const ZONE_DEFAULT_REACTION: Record<AvatarHitZone, LivingAvatarReaction> = {
  head: "HEAD_TILT",
  face: "SURPRISED",
  shoulder: "SHOULDER_SHRUG",
  hand: "WAVE",
  torso: "PLAYFUL",
  generic: "CURIOUS",
};

export interface CrowdBehaviorState {
  crowdEnergy: number;
  activeDancersCount: number;
  cheerIntensity: number;
}

export function evaluateCrowdBehavior(state: CrowdBehaviorState): LivingAvatarReaction {
  if (state.crowdEnergy >= 80 || state.cheerIntensity >= 0.7) return "CELEBRATE";
  if (state.activeDancersCount > 0) return "DANCE_IDLE";
  if (state.crowdEnergy >= 50) return "EXCITED";
  return "RELAXED";
}

export interface AvatarBehaviorPreferences {
  preferredIdleFamily: LivingAvatarReaction;
  favoriteEmotes: LivingAvatarReaction[];
  expressionIntensity: "low" | "medium" | "high";
  muteCharacterAudio: boolean;
  reducedMotion: boolean;
  disableAutonomousIdle: boolean;
}

const DEFAULT_PREFS: AvatarBehaviorPreferences = {
  preferredIdleFamily: "RELAXED",
  favoriteEmotes: ["WAVE", "HAPPY", "PLAYFUL"],
  expressionIntensity: "medium",
  muteCharacterAudio: false,
  reducedMotion: false,
  disableAutonomousIdle: false,
};

/**
 * How long a director reaction stays on the avatar before recovery to idle.
 * Shared by the Creation Center idle tick and poke so both use one clock.
 */
export const AVATAR_REACTION_PRESENTATION_MS = 2200;

export interface LivingReactionResult {
  reaction: LivingAvatarReaction;
  expression: AvatarExpression | null;
  motion: AvatarPreviewAction | null;
  cooldownMs: number;
  /** Milliseconds until the presenter must return to idle. 0 = no pose change. */
  recoveryMs: number;
  audioCue: "ooh" | "hey" | "laugh" | "surprise" | "ack" | null;
}

type ListenerCallback = (update: Record<string, unknown>) => void;

class AvatarBehavioralDirectorSingleton {
  private listeners: ListenerCallback[] = [];
  private prefs: AvatarBehaviorPreferences = { ...DEFAULT_PREFS };
  private lastReactionAt = 0;
  private cooldownMs = 900;
  private context: AvatarWorldContext = "PROFILE";

  getSnapshot(): Record<string, unknown> {
    return {
      crowdEnergy: 0,
      vibeMode: this.prefs.preferredIdleFamily,
      context: this.context,
      freeIdentityControls: FREE_AVATAR_IDENTITY_CONTROLS,
      muteCharacterAudio: this.prefs.muteCharacterAudio,
      reducedMotion: this.prefs.reducedMotion,
    };
  }

  setContext(ctx: AvatarWorldContext): void {
    this.context = ctx;
    this.emit({ type: "CONTEXT", context: ctx });
  }

  getPreferences(): AvatarBehaviorPreferences {
    return { ...this.prefs };
  }

  updatePreferences(patch: Partial<AvatarBehaviorPreferences>): void {
    this.prefs = { ...this.prefs, ...patch };
    this.emit({ type: "PREFS", prefs: this.prefs });
  }

  /** Bounded learning: only records certified reaction preference, never invents actions. */
  rememberPreferredReaction(reaction: LivingAvatarReaction): void {
    const next = [reaction, ...this.prefs.favoriteEmotes.filter((r) => r !== reaction)].slice(0, 8);
    this.prefs.favoriteEmotes = next;
  }

  poke(zone: AvatarHitZone = "generic", userId?: string, roomId?: string): LivingReactionResult {
    const now = Date.now();
    if (now - this.lastReactionAt < this.cooldownMs) {
      return {
        reaction: "RELAXED",
        expression: null,
        motion: null,
        cooldownMs: this.cooldownMs - (now - this.lastReactionAt),
        recoveryMs: 0,
        audioCue: null,
      };
    }
    this.lastReactionAt = now;
    const reaction = ZONE_DEFAULT_REACTION[zone];
    return this.playReaction(reaction, userId, roomId);
  }

  playReaction(
    reaction: LivingAvatarReaction,
    userId?: string,
    roomId?: string,
  ): LivingReactionResult {
    if (this.prefs.reducedMotion && reaction === "DANCE_IDLE") {
      reaction = "RELAXED";
    }
    const expression = REACTION_TO_EXPRESSION[reaction] ?? null;
    const motionRaw = REACTION_TO_MOTION[reaction] ?? null;
    const motion = motionRaw ? resolveProductionMotionPath(motionRaw) : null;

    if (userId && expression) {
      triggerExpression(userId, expression, roomId);
    }
    this.rememberPreferredReaction(reaction);
    const audioCue = this.prefs.muteCharacterAudio
      ? null
      : reaction === "LAUGH"
        ? "laugh"
        : reaction === "SURPRISED"
          ? "surprise"
          : reaction === "WAVE"
            ? "hey"
            : reaction === "CURIOUS"
              ? "ooh"
              : "ack";

    const result: LivingReactionResult = {
      reaction,
      expression,
      motion,
      cooldownMs: this.cooldownMs,
      recoveryMs: motion ? AVATAR_REACTION_PRESENTATION_MS : 0,
      audioCue,
    };
    this.emit({ type: "REACTION", ...result, context: this.context });
    return result;
  }

  /** Idle life tick — picks among certified idles; never fabricates engagement. */
  tickIdle(): LivingReactionResult | null {
    if (this.prefs.disableAutonomousIdle || this.prefs.reducedMotion) return null;
    const pool: LivingAvatarReaction[] = [
      this.prefs.preferredIdleFamily,
      "LOOK_AT_USER",
      "STRETCH",
      "HEAD_TILT",
      "RELAXED",
    ];
    if (this.context === "WORLD_DANCE_PARTY") pool.push("DANCE_IDLE");
    if (this.context === "STORE" || this.context === "PROFILE") pool.push("PLAYFUL", "WAVE");
    const pick = pool[Math.floor(Math.random() * pool.length)]!;
    return this.playReaction(pick);
  }

  isIdentityControlFree(control: string): boolean {
    return (FREE_AVATAR_IDENTITY_CONTROLS as readonly string[]).includes(control);
  }

  registerListener(cb: ListenerCallback): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private emit(update: Record<string, unknown>): void {
    for (const cb of this.listeners) cb(update);
  }
}

export const avatarBehavioralDirector = new AvatarBehavioralDirectorSingleton();

/** Alias locked in Living Avatar addendum — same singleton, not a second engine. */
export const AvatarBehaviorDirector = avatarBehavioralDirector;
/** User-selected mood bridge — never inferred from biometrics. */
export { applyAvatarMoodPresentation, type AvatarMoodId } from "@/lib/avatars/AvatarMoodPresentation";