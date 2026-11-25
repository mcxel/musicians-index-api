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

import { triggerExpression, type AvatarExpression } from "./ExpressionEngine";
import {
  resolveProductionMotionPath,
  type AvatarPreviewAction,
} from "./AvatarPreviewActions";
import {
  createTouchEscalationState,
  recoverTouchEscalation,
  stepTouchEscalation,
  type AvatarBodyZone,
  type TouchEscalationState,
  type TouchEscalationTier,
} from "./AvatarTouchInteraction";

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
  | "DANCE_IDLE"
  | "GIGGLE"
  | "SQUIRM"
  | "DODGE"
  | "ARMS_CROSSED"
  | "SIDE_EYE"
  | "YAWN";

/** @deprecated Prefer AvatarBodyZone — kept for call-site compat. */
export type AvatarHitZone =
  | AvatarBodyZone
  | "face"
  | "head"
  | "shoulder"
  | "hand"
  | "torso"
  | "generic";

function normalizeHitZone(zone: AvatarHitZone): AvatarBodyZone {
  if (zone === "face") return "cheek";
  if (zone === "torso") return "belly";
  return zone as AvatarBodyZone;
}

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
  GIGGLE: "laughing",
  SQUIRM: "silly",
  DODGE: "surprised",
  ARMS_CROSSED: "focused",
  SIDE_EYE: "silly",
  YAWN: "neutral",
};

const REACTION_TO_MOTION: Partial<Record<LivingAvatarReaction, AvatarPreviewAction>> = {
  WAVE: "WAVE",
  CELEBRATE: "HYPE",
  DANCE_IDLE: "DANCE",
  LAUGH: "EMOTE",
  PLAYFUL: "EMOTE",
  EXCITED: "HYPE",
  GIGGLE: "EMOTE",
  SQUIRM: "EMOTE",
  DODGE: "WAVE",
  ARMS_CROSSED: "IDLE",
  SIDE_EYE: "EMOTE",
  YAWN: "IDLE",
};

const ZONE_DEFAULT_REACTION: Record<AvatarBodyZone, LivingAvatarReaction> = {
  head: "HEAD_TILT",
  cheek: "GIGGLE",
  nose: "SURPRISED",
  forehead: "HEAD_TILT",
  belly: "GIGGLE",
  torso: "GIGGLE",
  shoulder: "SHOULDER_SHRUG",
  arm: "SQUIRM",
  hand: "WAVE",
  leg: "SQUIRM",
  foot: "SURPRISED",
  generic: "CURIOUS",
};

const TIER_REACTION: Record<TouchEscalationTier, LivingAvatarReaction> = {
  TICKLED: "GIGGLE",
  PLAYFUL: "SQUIRM",
  DODGING: "DODGE",
  FRUSTRATED: "ARMS_CROSSED",
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
  zone?: AvatarBodyZone;
  escalationTier?: TouchEscalationTier;
  consecutivePokes?: number;
  /** Soft body squash target for mesh deformation (belly/cheek). */
  squashZone?: "belly" | "cheek" | "nose" | null;
}

type ListenerCallback = (update: Record<string, unknown>) => void;

class AvatarBehavioralDirectorSingleton {
  private listeners: ListenerCallback[] = [];
  private prefs: AvatarBehaviorPreferences = { ...DEFAULT_PREFS };
  private lastReactionAt = 0;
  private cooldownMs = 280;
  private context: AvatarWorldContext = "PROFILE";
  private touchState: TouchEscalationState = createTouchEscalationState();

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

  getTouchState(): TouchEscalationState {
    this.touchState = recoverTouchEscalation(this.touchState);
    return { ...this.touchState };
  }

  /**
   * Direct mesh poke — zone from raycast. Escalates with streak.
   * No HTML poke button. Cooldown is short so playful multi-tap works.
   */
  poke(zone: AvatarHitZone = "generic", userId?: string, roomId?: string): LivingReactionResult {
    const now = Date.now();
    this.touchState = recoverTouchEscalation(this.touchState, now);
    if (now - this.lastReactionAt < this.cooldownMs) {
      return {
        reaction: "RELAXED",
        expression: null,
        motion: null,
        cooldownMs: this.cooldownMs - (now - this.lastReactionAt),
        recoveryMs: 0,
        audioCue: null,
        zone: normalizeHitZone(zone),
        consecutivePokes: this.touchState.consecutivePokes,
        squashZone: null,
      };
    }
    this.lastReactionAt = now;
    const bodyZone = normalizeHitZone(zone);
    this.touchState = stepTouchEscalation(this.touchState, bodyZone, now);
    const tierReaction = TIER_REACTION[this.touchState.tier];
    const zoneReaction = ZONE_DEFAULT_REACTION[bodyZone] ?? "CURIOUS";
    const reaction =
      this.touchState.tier === "TICKLED"
        ? zoneReaction
        : this.touchState.tier === "FRUSTRATED"
          ? "ARMS_CROSSED"
          : tierReaction;
    const squashZone =
      bodyZone === "belly" || bodyZone === "torso"
        ? "belly"
        : bodyZone === "cheek" || bodyZone === "nose"
          ? bodyZone === "nose"
            ? "nose"
            : "cheek"
          : null;
    const result = this.playReaction(reaction, userId, roomId);
    result.zone = bodyZone;
    result.escalationTier = this.touchState.tier;
    result.consecutivePokes = this.touchState.consecutivePokes;
    result.squashZone = squashZone;
    if (reaction === "GIGGLE" || reaction === "LAUGH" || reaction === "SQUIRM") {
      result.audioCue = this.prefs.muteCharacterAudio ? null : "laugh";
    }
    this.emit({
      type: "POKE",
      zone: bodyZone,
      tier: this.touchState.tier,
      consecutivePokes: this.touchState.consecutivePokes,
      squashZone,
      ...result,
    });
    return result;
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
export { applyAvatarMoodPresentation, type AvatarMoodId } from "./AvatarMoodPresentation";