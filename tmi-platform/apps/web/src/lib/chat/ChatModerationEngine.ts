import type { RoomChatMessage } from "./RoomChatEngine";

export type ModerationAction =
  | "allow"
  | "flag-review"
  | "drop-threat"
  | "drop-hate"
  | "mute-user"
  | "timeout-user";

export type ModerationResult = {
  messageId: string;
  action: ModerationAction;
  reasons: string[];
  safeText: string;
  reportable: boolean;
  muted: boolean;
  timeoutMs: number;
};

export type ModerationConfig = {
  allowMildProfanity: boolean;
  spamBurstThreshold: number;
  timeoutDurationMs: number;
};

const DEFAULT_MODERATION: ModerationConfig = {
  allowMildProfanity: true,
  spamBurstThreshold: 5,
  timeoutDurationMs: 120000,
};

const BLOCK_TERMS_THREAT = ["kill you", "i will kill", "bomb", "shoot you", "stab you", "swat you"];
const BLOCK_TERMS_HATE = ["nigger", "kike", "chink", "spic", "faggot", "raghead", "white power"];
const BLOCK_TERMS_DOXX = ["your address is", "phone number is", "leaked your address", "dox"];

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function containsAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term));
}

export function moderateMessage(
  message: RoomChatMessage,
  recentFromUser: RoomChatMessage[],
  config?: Partial<ModerationConfig>,
): ModerationResult {
  const rules = { ...DEFAULT_MODERATION, ...(config ?? {}) };
  const normalized = normalize(message.text);
  const reasons: string[] = [];

  if (containsAny(normalized, BLOCK_TERMS_THREAT) || containsAny(normalized, BLOCK_TERMS_DOXX)) {
    reasons.push("threat_or_doxxing_detected");
    return {
      messageId: message.id,
      action: "drop-threat",
      reasons,
      safeText: "",
      reportable: true,
      muted: false,
      timeoutMs: rules.timeoutDurationMs,
    };
  }

  if (containsAny(normalized, BLOCK_TERMS_HATE)) {
    reasons.push("racial_or_hate_slur_detected");
    return {
      messageId: message.id,
      action: "drop-hate",
      reasons,
      safeText: "",
      reportable: true,
      muted: true,
      timeoutMs: rules.timeoutDurationMs,
    };
  }

  // Spam burst protection
  const recentBurst = recentFromUser.filter((m) => message.timestampMs - m.timestampMs <= 15000);
  if (recentBurst.length >= rules.spamBurstThreshold) {
    reasons.push("spam_burst_detected");
    return {
      messageId: message.id,
      action: "timeout-user",
      reasons,
      safeText: "",
      reportable: true,
      muted: false,
      timeoutMs: rules.timeoutDurationMs,
    };
  }

  // Mild profanity is allowed by policy.
  return {
    messageId: message.id,
    action: "allow",
    reasons,
    safeText: message.text,
    reportable: false,
    muted: false,
    timeoutMs: 0,
  };
}

export type UserModerationState = {
  userId: string;
  mutedUntilMs?: number;
  timeoutUntilMs?: number;
};

export function isUserMuted(state: UserModerationState, nowMs: number): boolean {
  return !!state.mutedUntilMs && state.mutedUntilMs > nowMs;
}

export function isUserTimedOut(state: UserModerationState, nowMs: number): boolean {
  return !!state.timeoutUntilMs && state.timeoutUntilMs > nowMs;
}
