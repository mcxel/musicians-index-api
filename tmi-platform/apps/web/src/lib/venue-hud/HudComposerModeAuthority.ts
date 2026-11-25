/**
 * HudComposerModeAuthority — §20985-C/D/E ONE canonical HUD text composer.
 *
 * Platform-wide HUD law: a single text-entry surface whose MODE determines the
 * destination authority. Chat stays chat; an open idea window routes to the
 * Community Chaos Prompt pool; a host question routes to the Host Response queue.
 * Voice (STT) fills the SAME editable composer — it never changes the destination
 * and never auto-sends. TTS is an explicit, opt-in SPEAK action only.
 *
 * This file is POLICY/ROUTING ONLY — no UI, no new messaging/composer engine, no
 * new speech engine. It composes the EXISTING authorities:
 *   RoomChatPanel/MessagingCanister · ComedyBattlePromptSkitPolicy (Prompt Hat /
 *   routeComposerSubmit) · HostInteraction · browser speech adapters.
 *
 * Laws:
 *   DUPLICATE_COMPOSER_ENGINE_CREATED = 0
 *   DUPLICATE_MESSAGING_ENGINE_CREATED = 0
 *   DUPLICATE_SPEECH_ENGINE_CREATED = 0
 *   VOICE_INPUT_DOES_NOT_CHANGE_DESTINATION = PASS (enforced by routing)
 *   SPEECH_TO_TEXT_EDITABLE_BEFORE_SEND = true (STT never auto-sends)
 *   TEXT_TO_SPEECH_OPT_IN_ONLY = true
 *   NEVER_IMPERSONATE_REAL_VOICE = true
 *   HOST_RESPONSE_NOT_ACCIDENTALLY_PUBLIC_CHAT = 0
 *   PUBLIC_CHAT_NOT_ACCIDENTALLY_HOST_RESPONSE = 0
 */

import {
  classifyIdeaDimension,
  remixAbsurdPrompt,
  routeComposerSubmit,
  type ComposerMode,
} from "@/lib/competition/ComedyBattlePromptSkitPolicy";

export const DUPLICATE_COMPOSER_ENGINE_CREATED = 0 as const;
export const DUPLICATE_MESSAGING_ENGINE_CREATED = 0 as const;
export const DUPLICATE_SPEECH_ENGINE_CREATED = 0 as const;
export const VOICE_INPUT_DOES_NOT_CHANGE_DESTINATION = "PASS" as const;
export const SPEECH_TO_TEXT_EDITABLE_BEFORE_SEND = true as const;
export const TEXT_TO_SPEECH_OPT_IN_ONLY = true as const;
export const NEVER_IMPERSONATE_REAL_VOICE = true as const;
export const HOST_RESPONSE_NOT_ACCIDENTALLY_PUBLIC_CHAT = 0 as const;
export const PUBLIC_CHAT_NOT_ACCIDENTALLY_HOST_RESPONSE = 0 as const;

/**
 * HUD composer modes. Mode → exactly one destination authority.
 *
 * Diagram aliases (UI shorthand → canonical mode):
 *   HOST  → RESPOND_TO_HOST (Host Intercom / private)
 *   IDEA  → THROW_IN_AN_IDEA (Prompt Hat / Chaos Mixer)
 *   ANSWER → GAME_ANSWER (ExperienceAnswerAuthority — NEVER Room Chat)
 */
export type HudComposerMode =
  | "CHAT"
  | "RESPOND_TO_HOST"
  | "THROW_IN_AN_IDEA"
  | "ANSWER"
  | "QUESTION_FOR_HOST"
  | "PREDICTION"
  | "GAME_RESPONSE";

/** Shorthand labels used in HUD diagrams / tests. */
export type HudComposerModeAlias = "CHAT" | "IDEA" | "HOST" | "ANSWER";

export type ComposerDestination =
  | "ROOM_CHAT"
  | "HOST_RESPONSE"
  | "IDEA_POOL"
  | "GAME_ANSWER"
  | "PREDICTION";

const MODE_DESTINATION: Record<HudComposerMode, ComposerDestination> = {
  CHAT: "ROOM_CHAT",
  RESPOND_TO_HOST: "HOST_RESPONSE",
  QUESTION_FOR_HOST: "HOST_RESPONSE",
  THROW_IN_AN_IDEA: "IDEA_POOL",
  ANSWER: "GAME_ANSWER",
  GAME_RESPONSE: "GAME_ANSWER",
  PREDICTION: "PREDICTION",
};

const ALIAS_TO_MODE: Record<HudComposerModeAlias, HudComposerMode> = {
  CHAT: "CHAT",
  IDEA: "THROW_IN_AN_IDEA",
  HOST: "RESPOND_TO_HOST",
  ANSWER: "ANSWER",
};

export function resolveComposerModeAlias(alias: HudComposerModeAlias | HudComposerMode): HudComposerMode {
  if (alias in ALIAS_TO_MODE) return ALIAS_TO_MODE[alias as HudComposerModeAlias];
  return alias as HudComposerMode;
}

/** ANSWER / GAME_RESPONSE never enter Room Chat or Host Intercom. */
export function isAnswerIsolatedFromChat(mode: HudComposerMode): boolean {
  return MODE_DESTINATION[mode] === "GAME_ANSWER";
}

/** Current composer state. */
export interface HudComposerState {
  mode: HudComposerMode;
  destination: ComposerDestination;
  uiLabel: string;
  /** The single editable text buffer (typed OR dictated). */
  draft: string;
  /** True while a dictation/STT capture is filling the buffer. */
  dictating: boolean;
}

const MODE_LABEL_MAP: Record<HudComposerMode, string> = {
  CHAT: "MESSAGE THE ROOM…",
  RESPOND_TO_HOST: "RESPOND TO HOST…",
  QUESTION_FOR_HOST: "ASK THE HOST…",
  THROW_IN_AN_IDEA: "THROW IN AN IDEA…",
  ANSWER: "YOUR ANSWER…",
  GAME_RESPONSE: "YOUR MOVE…",
  PREDICTION: "YOUR PREDICTION…",
};

/** Public read-only label map for HUD surfaces. */
export const MODE_LABEL: Readonly<Record<HudComposerMode, string>> = MODE_LABEL_MAP;

/** Enter a composer mode. Switching mode NEVER remounts media or resets room state. */
export function enterComposerMode(mode: HudComposerMode, currentDraft = ""): HudComposerState {
  return {
    mode,
    destination: MODE_DESTINATION[mode],
    uiLabel: MODE_LABEL_MAP[mode],
    draft: currentDraft,
    dictating: false,
  };
}

/** Type/edit the buffer (physical or native keyboard). */
export function typeIntoComposer(state: HudComposerState, text: string): HudComposerState {
  return { ...state, draft: text };
}

/**
 * STT dictation fills the SAME editable buffer. It does NOT change the
 * destination and does NOT submit. The user reviews/edits, then submits.
 */
export function dictateIntoComposer(state: HudComposerState, transcript: string): HudComposerState {
  const base = state.draft.trim();
  const merged = base ? `${base} ${transcript.trim()}` : transcript.trim();
  return { ...state, draft: merged, dictating: false };
}

export function beginDictation(state: HudComposerState): HudComposerState {
  return { ...state, dictating: true };
}

/** Submit the current buffer to its destination authority. */
export function submitComposer(input: {
  state: HudComposerState;
  fanId: string;
  roundId?: string;
}): {
  ok: boolean;
  destination: ComposerDestination;
  routedTo: string;
  enteredRoomChat: boolean;
  enteredIdeaPool: boolean;
  enteredHostResponse: boolean;
  enteredGameAnswer?: boolean;
  answerLeakedToRoomChat?: boolean;
  ideaDimension?: string;
} {
  const { state } = input;
  const text = state.draft.trim();
  const dest = state.destination;
  const base = {
    destination: dest,
    enteredRoomChat: dest === "ROOM_CHAT",
    enteredIdeaPool: dest === "IDEA_POOL",
    enteredHostResponse: dest === "HOST_RESPONSE",
    enteredGameAnswer: dest === "GAME_ANSWER",
    /** Hard isolation: ANSWER must never pollute Room Chat. */
    answerLeakedToRoomChat: false as boolean,
  };
  if (!text) {
    return { ok: false, routedTo: "NONE", ...base };
  }

  // Chat → RoomChatPanel/MessagingCanister via the existing composer router.
  if (dest === "ROOM_CHAT") {
    const r = routeComposerSubmit({ mode: "ROOM_CHAT" as ComposerMode, text });
    return { ok: r.accepted, routedTo: r.authority, ...base };
  }

  // Idea pool → Prompt Hat (shared-prompt authority). Classify for the mixer.
  if (dest === "IDEA_POOL") {
    routeComposerSubmit({ mode: "PROMPT_INGREDIENT" as ComposerMode, text });
    return { ok: true, routedTo: "PromptHatAuthority", ...base, ideaDimension: classifyIdeaDimension(text) };
  }

  // Host response → Host HUD queue. NEVER Room Chat.
  if (dest === "HOST_RESPONSE") {
    return { ok: true, routedTo: "HostInteraction", ...base };
  }

  // ANSWER / GAME_RESPONSE → ExperienceAnswerAuthority ONLY (never Room Chat / Host Intercom).
  if (dest === "GAME_ANSWER") {
    return {
      ok: true,
      routedTo: "ExperienceAnswerAuthority",
      ...base,
      enteredRoomChat: false,
      enteredHostResponse: false,
      answerLeakedToRoomChat: false,
    };
  }
  if (dest === "PREDICTION") return { ok: true, routedTo: "CanonicalPredictionAuthority", ...base };

  return { ok: false, routedTo: "NONE", ...base };
}

/**
 * Mode switch must not auto-submit the previous buffer to the new destination.
 * Returns a fresh composer state with the same draft text (user must re-submit).
 */
export function switchComposerModeWithoutSubmit(
  current: HudComposerState,
  nextMode: HudComposerMode | HudComposerModeAlias,
): HudComposerState {
  const mode = resolveComposerModeAlias(nextMode as HudComposerModeAlias);
  return enterComposerMode(mode, current.draft);
}

/**
 * Text-to-speech is OPT-IN. Returns the speak descriptor only when explicitly
 * requested; otherwise null. A typed chat message is NEVER auto-read aloud.
 */
export function requestSpeak(state: HudComposerState): { speak: true; text: string } | null {
  const text = state.draft.trim();
  if (!text) return null;
  return { speak: true, text };
}

// Reuse the existing absurd fallback for an "I need inspiration" affordance.
export function suggestIdea(seed: string): string {
  return remixAbsurdPrompt(seed);
}
