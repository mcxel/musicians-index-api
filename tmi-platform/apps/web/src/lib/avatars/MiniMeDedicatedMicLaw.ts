/**
 * Mini-Me Dedicated Voice Interaction Law — companion mic ≠ TMI MIC ON / WebRTC / room chat.
 * First interaction: "Say Hello" → Stage 1 Mini-Speak + gesture (varied, not one fixed script).
 * PHYSICAL_VERIFIED=NO until Copilot certifies isolation on device.
 */

import type { MiniMeVocalStage } from "@/lib/avatars/MiniMeSlowGrowthLaw";
import type { MiniMeSpeechSurface } from "@/lib/avatars/MiniMeSpontaneousCallbackPolicy";

export const MINI_ME_DEDICATED_MIC_LAW_ID = "MINI_ME_DEDICATED_MIC_LAW_v1" as const;

/** Hard isolation locks — companion listen never implies broadcast publish. */
export const COMPANION_MIC_ACTIVATES_BROADCAST_MIC = 0 as const;
export const COMPANION_MIC_JOINS_VENUE_AUDIO = 0 as const;
export const COMPANION_MIC_AUTO_PUBLISHES_WEBRTC = 0 as const;
export const COMPANION_MIC_AUTO_ROOM_CHAT = 0 as const;
export const COMPANION_MIC_CONTINUOUS_BG_RECORD = 0 as const;
export const RAW_MIC_RECORDINGS_STORED_BY_DEFAULT = 0 as const;
export const NEW_COMPANION_STT_ENGINE = false as const;

export const FIRST_HELLO_PROMPT = 'Say "Hello" to your Mini-Me!' as const;
export const COMPANION_MIC_ICON_MARKER = "COMPANION_FACE" as const;

export type CompanionMicSurface =
  | "AVATAR_CREATION_CENTER"
  | "MINI_ME_CANISTER"
  | "QUICK_PANEL"
  | "FAN_AVATAR_LOBBY"
  | "VENUE_HUD_PERMITTED"
  | "MOBILE_TAP_TO_TALK"
  | "DESKTOP_CLICK_TO_TALK";

export type CompanionMicSessionState =
  | "IDLE"
  | "PROMPT_FIRST_HELLO"
  | "REQUESTING_PERMISSION"
  | "LISTENING"
  | "PROCESSING"
  | "RESPONDING"
  | "STOPPED"
  | "MUTED"
  | "ERROR_PERMISSION_DENIED"
  | "ERROR_ISOLATION";

export type CompanionMicSession = {
  sessionId: string;
  ownerUserId: string;
  companionId: string;
  surface: CompanionMicSurface;
  state: CompanionMicSessionState;
  firstHelloCompleted: boolean;
  /** Always false — companion session must never flip broadcast MIC ON. */
  broadcastMicArmed: false;
  webrtcPublishArmed: false;
  roomChatPublishArmed: false;
  listeningStartedAtMs: number | null;
  lastError: string | null;
};

export const COMPANION_MIC_SURFACES: readonly CompanionMicSurface[] = [
  "AVATAR_CREATION_CENTER",
  "MINI_ME_CANISTER",
  "QUICK_PANEL",
  "FAN_AVATAR_LOBBY",
  "VENUE_HUD_PERMITTED",
  "MOBILE_TAP_TO_TALK",
  "DESKTOP_CLICK_TO_TALK",
] as const;

export function createCompanionMicSession(input: {
  ownerUserId: string;
  companionId: string;
  surface: CompanionMicSurface;
  firstHelloCompleted: boolean;
  sessionId?: string;
}): CompanionMicSession {
  return {
    sessionId: input.sessionId ?? `mini-mic:${input.companionId}:${Date.now().toString(36)}`,
    ownerUserId: input.ownerUserId,
    companionId: input.companionId,
    surface: input.surface,
    state: input.firstHelloCompleted ? "IDLE" : "PROMPT_FIRST_HELLO",
    firstHelloCompleted: input.firstHelloCompleted,
    broadcastMicArmed: false,
    webrtcPublishArmed: false,
    roomChatPublishArmed: false,
    listeningStartedAtMs: null,
    lastError: null,
  };
}

/** Enter listening — never arms broadcast / WebRTC / room chat. */
export function beginCompanionListening(
  session: CompanionMicSession,
  atMs: number,
): CompanionMicSession {
  return {
    ...session,
    state: "LISTENING",
    listeningStartedAtMs: atMs,
    broadcastMicArmed: false,
    webrtcPublishArmed: false,
    roomChatPublishArmed: false,
    lastError: null,
  };
}

export function stopCompanionListening(session: CompanionMicSession): CompanionMicSession {
  return {
    ...session,
    state: "STOPPED",
    listeningStartedAtMs: null,
    broadcastMicArmed: false,
    webrtcPublishArmed: false,
    roomChatPublishArmed: false,
  };
}

export function assertCompanionMicIsolation(session: CompanionMicSession): {
  ok: boolean;
  reason: string;
} {
  if (session.broadcastMicArmed) return { ok: false, reason: "BROADCAST_MIC_ARMED" };
  if (session.webrtcPublishArmed) return { ok: false, reason: "WEBRTC_PUBLISH_ARMED" };
  if (session.roomChatPublishArmed) return { ok: false, reason: "ROOM_CHAT_PUBLISH_ARMED" };
  if (COMPANION_MIC_ACTIVATES_BROADCAST_MIC !== 0) {
    return { ok: false, reason: "ISOLATION_LOCK_BROKEN" };
  }
  return { ok: true, reason: "ISOLATED" };
}

/** Map companion mic surface → spontaneous speech surface for response routing. */
export function companionMicToSpeechSurface(
  surface: CompanionMicSurface,
): MiniMeSpeechSurface {
  if (surface === "AVATAR_CREATION_CENTER") return "AVATAR_CREATION_CENTER";
  if (surface === "MINI_ME_CANISTER") return "MINI_ME_CANISTER";
  if (surface === "QUICK_PANEL") return "QUICK_PANEL";
  if (surface === "FAN_AVATAR_LOBBY") return "FAN_AVATAR_LOBBY";
  return "PERFORMER_VENUE_PRIVATE";
}

/**
 * Stage-1 Mini-Speak reply candidates for first Hello / early greetings.
 * Illustrative variety — production must bind JOB vocal assets, not invent new packs.
 */
export const STAGE1_HELLO_MINI_SPEAK_VARIANTS = [
  "Boo-bah! Mee-mee-dah!",
  "Hee-loo! Bah-bah-dee!",
  "Mee-mee! Woo-lah!",
  "Bah-doo! Giggle-mee!",
  "Loo-loo? Dee-bah!",
] as const;

export type CompanionUtteranceIntent =
  | "GREETING_HELLO"
  | "CONFUSION"
  | "PLAY"
  | "AFFIRMATION"
  | "UNKNOWN";

export function classifyCompanionUtteranceIntent(raw: string): CompanionUtteranceIntent {
  const t = raw.trim().toLowerCase();
  if (!t) return "UNKNOWN";
  if (/\b(hello|hi|hey|hola|yo)\b/.test(t)) return "GREETING_HELLO";
  if (/\b(what|huh|say that|pardon)\b/.test(t)) return "CONFUSION";
  if (/\b(dance|play|funny|joke)\b/.test(t)) return "PLAY";
  if (/\b(yes|yeah|good|love you)\b/.test(t)) return "AFFIRMATION";
  return "UNKNOWN";
}

export type CompanionVoiceReply = {
  text: string;
  stage: MiniMeVocalStage;
  usesMiniSpeak: boolean;
  gestureHint: "GIGGLE_TILT" | "CURIOUS_LOOK" | "EXCITED_BOUNCE" | "SOFT_NOD" | "IDLE_BREATHE";
  lipSyncHint: "ARKIT_52_BABBLE" | "ARKIT_52_PARTIAL" | "ARKIT_52_CLEAR";
  firstHelloMilestone: boolean;
};

/**
 * Immediate reaction selection — recognition may succeed while pronunciation stays Mini-Speak.
 * Does not advance vocal stage. Varied by seed so first demo is not one fixed recording forever.
 */
export function selectImmediateCompanionReply(input: {
  intent: CompanionUtteranceIntent;
  stage: MiniMeVocalStage;
  firstHelloCompleted: boolean;
  /** 0..n deterministic picker */
  variantIndex: number;
}): CompanionVoiceReply {
  const stage = input.stage;
  const baby = stage === "STAGE_1_BABY_MINI_SPEAK";
  const firstHello =
    !input.firstHelloCompleted && input.intent === "GREETING_HELLO";

  if (baby || stage === "STAGE_2_FIRST_WORDS") {
    const variants = STAGE1_HELLO_MINI_SPEAK_VARIANTS;
    const text = variants[Math.abs(input.variantIndex) % variants.length]!;
    let gesture: CompanionVoiceReply["gestureHint"] = "CURIOUS_LOOK";
    if (input.intent === "GREETING_HELLO" || firstHello) gesture = "EXCITED_BOUNCE";
    if (input.intent === "CONFUSION") gesture = "GIGGLE_TILT";
    if (input.intent === "AFFIRMATION") gesture = "SOFT_NOD";
    if (input.intent === "PLAY") gesture = "EXCITED_BOUNCE";
    return {
      text,
      stage,
      usesMiniSpeak: true,
      gestureHint: gesture,
      lipSyncHint: baby ? "ARKIT_52_BABBLE" : "ARKIT_52_PARTIAL",
      firstHelloMilestone: firstHello,
    };
  }

  // Later stages may mix Mini-Speak (permanent personality) with clearer fragments.
  if (input.intent === "GREETING_HELLO") {
    return {
      text: input.variantIndex % 2 === 0 ? "Hello… mee-mee!" : "Hee-loo!",
      stage,
      usesMiniSpeak: true,
      gestureHint: "EXCITED_BOUNCE",
      lipSyncHint: "ARKIT_52_PARTIAL",
      firstHelloMilestone: firstHello,
    };
  }
  return {
    text: "Bah-doo? … okay!",
    stage,
    usesMiniSpeak: true,
    gestureHint: "CURIOUS_LOOK",
    lipSyncHint: "ARKIT_52_PARTIAL",
    firstHelloMilestone: false,
  };
}

export function markFirstHelloCompleted(session: CompanionMicSession): CompanionMicSession {
  return {
    ...session,
    firstHelloCompleted: true,
    state: session.state === "PROMPT_FIRST_HELLO" ? "IDLE" : session.state,
  };
}

export function miniMeDedicatedMicLocks() {
  return {
    COMPANION_MIC_ACTIVATES_BROADCAST_MIC,
    COMPANION_MIC_JOINS_VENUE_AUDIO,
    COMPANION_MIC_AUTO_PUBLISHES_WEBRTC,
    COMPANION_MIC_AUTO_ROOM_CHAT,
    COMPANION_MIC_CONTINUOUS_BG_RECORD,
    RAW_MIC_RECORDINGS_STORED_BY_DEFAULT,
    NEW_COMPANION_STT_ENGINE,
    COMPANION_MIC_ICON_MARKER,
    FIRST_HELLO_PROMPT,
  } as const;
}
