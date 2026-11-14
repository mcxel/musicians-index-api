/**
 * AvatarMoodPresentation — REGULAR / HAPPY / SAD / SILLY on the SAME digital self.
 *
 * Mood is presentation, not identity. Never replaces face-scan morphology.
 * Never infers real emotion from camera/voice/messages.
 * User-selected or legitimate game-event driven only.
 */

import { triggerExpression, type AvatarExpression } from "@/lib/avatars/ExpressionEngine";
import type { AvatarPreviewAction } from "@/lib/avatars/AvatarPreviewActions";
/** Mirrors AvatarLobbyCanvas AvatarMoodFoundryExpression — avoid lib→3d import. */
export type AvatarMoodFoundryExpression = "neutral" | "smile" | "hype";

export type AvatarMoodId = "REGULAR" | "HAPPY" | "SAD" | "SILLY";

export type SillySubstyle =
  | "SILLY_GOOFY"
  | "SILLY_DRAMATIC"
  | "SILLY_HYPE"
  | "SILLY_DANCE"
  | "SILLY_SHOCKED"
  | "SILLY_BOBBLE"
  | "SILLY_VICTORY"
  | "SILLY_OOPS";

export type AvatarMoodSpec = {
  moodId: AvatarMoodId;
  label: string;
  /** Maps to Foundry ARKit expression id on AvatarRig */
  foundryExpression: AvatarMoodFoundryExpression;
  /** Maps to ExpressionEngine room entity expression */
  roomExpression: AvatarExpression;
  previewAction: AvatarPreviewAction;
  bobbleIntensity: number;
  energy: "low" | "medium" | "high";
  description: string;
};

export const AVATAR_MOOD_SPECS: Record<AvatarMoodId, AvatarMoodSpec> = {
  REGULAR: {
    moodId: "REGULAR",
    label: "Regular",
    foundryExpression: "neutral",
    roomExpression: "neutral",
    previewAction: "IDLE",
    bobbleIntensity: 0.15,
    energy: "low",
    description: "Natural digital-self — blink, breathe, subtle life.",
  },
  HAPPY: {
    moodId: "HAPPY",
    label: "Happy",
    foundryExpression: "smile",
    roomExpression: "happy",
    previewAction: "WAVE",
    bobbleIntensity: 0.35,
    energy: "medium",
    description: "Positive expression + body energy. Same face morphology.",
  },
  SAD: {
    moodId: "SAD",
    label: "Sad",
    foundryExpression: "neutral",
    roomExpression: "emotional",
    previewAction: "IDLE",
    bobbleIntensity: 0.08,
    energy: "low",
    description: "Subdued presentation — never grotesque. Same person.",
  },
  SILLY: {
    moodId: "SILLY",
    label: "Silly",
    foundryExpression: "hype",
    roomExpression: "silly",
    previewAction: "HYPE",
    bobbleIntensity: 0.85,
    energy: "high",
    description: "Funny exaggerated performance of the SAME high-fidelity self.",
  },
};

export const SILLY_SUBSTYLES: SillySubstyle[] = [
  "SILLY_GOOFY",
  "SILLY_DRAMATIC",
  "SILLY_HYPE",
  "SILLY_DANCE",
  "SILLY_SHOCKED",
  "SILLY_BOBBLE",
  "SILLY_VICTORY",
  "SILLY_OOPS",
];

const MOOD_STORAGE_KEY = "tmi_avatar_mood_presentation";
let memoryMood: AvatarMoodId = "REGULAR";
let memorySilly: SillySubstyle = "SILLY_GOOFY";

export function readPersistedAvatarMood(): AvatarMoodId {
  if (typeof window === "undefined") return memoryMood;
  try {
    const raw = window.sessionStorage.getItem(MOOD_STORAGE_KEY);
    if (raw && raw in AVATAR_MOOD_SPECS) return raw as AvatarMoodId;
  } catch { /* ignore */ }
  return memoryMood;
}

export function persistAvatarMood(mood: AvatarMoodId): void {
  memoryMood = mood;
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(MOOD_STORAGE_KEY, mood);
  } catch { /* ignore */ }
}

export function getAvatarMoodSpec(mood: AvatarMoodId = readPersistedAvatarMood()): AvatarMoodSpec {
  return AVATAR_MOOD_SPECS[mood];
}

/**
 * Apply mood as presentation only — does not mutate face identity / draft morphology.
 * Optionally triggers ExpressionEngine for room entities (user-authorized).
 */
export function applyAvatarMoodPresentation(opts: {
  mood: AvatarMoodId;
  userId?: string;
  roomId?: string;
  sillySubstyle?: SillySubstyle;
  persist?: boolean;
}): AvatarMoodSpec {
  const spec = AVATAR_MOOD_SPECS[opts.mood];
  if (opts.persist !== false) persistAvatarMood(opts.mood);
  if (opts.sillySubstyle) memorySilly = opts.sillySubstyle;
  if (opts.userId && spec.roomExpression !== "neutral") {
    triggerExpression(opts.userId, spec.roomExpression, opts.roomId);
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("tmi:avatar:mood", {
        detail: {
          mood: opts.mood,
          sillySubstyle: opts.mood === "SILLY" ? (opts.sillySubstyle ?? memorySilly) : null,
          foundryExpression: spec.foundryExpression,
          previewAction: spec.previewAction,
          bobbleIntensity: spec.bobbleIntensity,
          identityUnchanged: true,
        },
      }),
    );
  }
  return spec;
}

export function pickBoundedSillySubstyle(seed?: number): SillySubstyle {
  const i = Math.abs(seed ?? Date.now()) % SILLY_SUBSTYLES.length;
  return SILLY_SUBSTYLES[i]!;
}

/** Law: never auto-infer mood from biometrics / camera / messages. */
export const MOOD_INFERENCE_FORBIDDEN = true as const;
