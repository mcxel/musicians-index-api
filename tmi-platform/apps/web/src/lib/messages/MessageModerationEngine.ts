/**
 * MessageModerationEngine
 * Spam detection, abuse flagging, user blocking, conversation muting.
 * Integrates with the safety violation logger.
 */

import { logSafetyViolation } from "@/lib/safety/safetyViolationLogger";
import { blockConversation, muteConversationForUser } from "./ConversationEngine";
import { deleteDirectMessage } from "./DirectMessageEngine";

export type ModerationVerdictType =
  | "clean"
  | "spam"
  | "abuse"
  | "hate-speech"
  | "unsolicited-commercial"
  | "minor-safety-risk";

export type ModerationAction =
  | "none"
  | "warn"
  | "delete-message"
  | "mute-sender"
  | "block-conversation"
  | "escalate";

export type MessageModerationFlag = {
  flagId: string;
  conversationId: string;
  messageId: string;
  reportedByUserId: string;
  suspectUserId: string;
  verdictType: ModerationVerdictType;
  action: ModerationAction;
  resolved: boolean;
  createdAtMs: number;
  resolvedAtMs?: number;
  notes?: string;
};

export type BlockRecord = {
  blockId: string;
  blockerId: string;
  blockedUserId: string;
  createdAtMs: number;
  reason?: string;
};

// --- spam signal patterns (simple keyword heuristics — not ML) ---
const SPAM_PATTERNS: RegExp[] = [
  /\bclick\s?here\b/i,
  /\bfree\s?money\b/i,
  /\bjoin\s?now\b/i,
  /\bwire\s?transfer\b/i,
  /\bcrypto\s?offer\b/i,
  /\bfollow\s?for\s?follow\b/i,
  /\binstagram\.com\/[^\s]{2,}/i,
  /\bwhatsapp\b/i,
  /http:\/\//i, // non-HTTPS links flagged
];

const ABUSE_PATTERNS: RegExp[] = [
  /\bkill\s?(your)?self\b/i,
  /\bi\s+will\s+(find|hurt|attack)\b/i,
  /\bdox(x)?ing\b/i,
  /\bswatt?ing\b/i,
];

// --- in-memory stores ---
const flags: MessageModerationFlag[] = [];
const blocks: BlockRecord[] = [];
const mutedSenders: Map<string, number> = new Map(); // userId → mutedUntilMs
let flagCounter = 0;
let blockCounter = 0;

// --- Spam / Abuse Detection ---

export type SpamCheckResult = {
  isSpam: boolean;
  isAbuse: boolean;
  verdict: ModerationVerdictType;
  matchedPattern?: string;
};

export function checkMessageContent(text: string): SpamCheckResult {
  for (const pattern of ABUSE_PATTERNS) {
    if (pattern.test(text)) {
      return {
        isSpam: false,
        isAbuse: true,
        verdict: "abuse",
        matchedPattern: pattern.source,
      };
    }
  }

  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(text)) {
      return {
        isSpam: true,
        isAbuse: false,
        verdict: "spam",
        matchedPattern: pattern.source,
      };
    }
  }

  return { isSpam: false, isAbuse: false, verdict: "clean" };
}

// --- Flag API ---

export function flagMessage(input: {
  conversationId: string;
  messageId: string;
  reportedByUserId: string;
  suspectUserId: string;
  verdictType: ModerationVerdictType;
  notes?: string;
}): MessageModerationFlag {
  const action = resolveAutoAction(input.verdictType);

  const flag: MessageModerationFlag = {
    flagId: `msg-flag-${++flagCounter}`,
    conversationId: input.conversationId,
    messageId: input.messageId,
    reportedByUserId: input.reportedByUserId,
    suspectUserId: input.suspectUserId,
    verdictType: input.verdictType,
    action,
    resolved: false,
    createdAtMs: Date.now(),
    notes: input.notes,
  };

  flags.push(flag);

  // Auto-enforce actions
  if (action === "delete-message") {
    deleteDirectMessage(input.conversationId, input.messageId, input.suspectUserId);
  }
  if (action === "block-conversation") {
    blockConversation(input.conversationId);
    logSafetyViolation({
      source: "MessageModerationEngine",
      actorId: input.suspectUserId,
      actorAgeClass: "unknown",
      action: "dm",
      target: input.conversationId,
      reason: `Auto-blocked conversation: ${input.verdictType}`,
      blocked: true,
    });
  }
  if (action === "mute-sender") {
    mutedSenders.set(input.suspectUserId, Date.now() + 24 * 60 * 60 * 1000); // 24h
    muteConversationForUser(
      input.conversationId,
      input.suspectUserId,
      24 * 60 * 60 * 1000,
    );
  }

  return flag;
}

function resolveAutoAction(verdict: ModerationVerdictType): ModerationAction {
  switch (verdict) {
    case "clean": return "none";
    case "spam": return "delete-message";
    case "unsolicited-commercial": return "mute-sender";
    case "abuse": return "block-conversation";
    case "hate-speech": return "block-conversation";
    case "minor-safety-risk": return "escalate";
    default: return "warn";
  }
}

export function resolveFlag(flagId: string, notes?: string): void {
  const flag = flags.find((f) => f.flagId === flagId);
  if (flag && !flag.resolved) {
    flag.resolved = true;
    flag.resolvedAtMs = Date.now();
    if (notes) flag.notes = notes;
  }
}

// --- Block API ---

export function blockUser(
  blockerId: string,
  blockedUserId: string,
  reason?: string,
): BlockRecord {
  const existing = blocks.find(
    (b) => b.blockerId === blockerId && b.blockedUserId === blockedUserId,
  );
  if (existing) return existing;

  const record: BlockRecord = {
    blockId: `block-${++blockCounter}`,
    blockerId,
    blockedUserId,
    createdAtMs: Date.now(),
    reason,
  };
  blocks.push(record);
  return record;
}

export function unblockUser(blockerId: string, blockedUserId: string): void {
  const idx = blocks.findIndex(
    (b) => b.blockerId === blockerId && b.blockedUserId === blockedUserId,
  );
  if (idx !== -1) blocks.splice(idx, 1);
}

export function isUserBlocked(blockerId: string, blockedUserId: string): boolean {
  return blocks.some(
    (b) => b.blockerId === blockerId && b.blockedUserId === blockedUserId,
  );
}

export function isSenderMuted(userId: string): boolean {
  const mutedUntil = mutedSenders.get(userId);
  if (!mutedUntil) return false;
  if (mutedUntil <= Date.now()) {
    mutedSenders.delete(userId);
    return false;
  }
  return true;
}

// --- Read API ---

export function listUnresolvedFlags(): MessageModerationFlag[] {
  return flags.filter((f) => !f.resolved);
}

export function listFlagsForConversation(conversationId: string): MessageModerationFlag[] {
  return flags.filter((f) => f.conversationId === conversationId);
}

export function getBlockList(blockerId: string): BlockRecord[] {
  return blocks.filter((b) => b.blockerId === blockerId);
}

export function getModerationSummary(): {
  totalFlags: number;
  unresolvedFlags: number;
  totalBlocks: number;
  flagsByVerdict: Record<ModerationVerdictType, number>;
} {
  const flagsByVerdict: Record<ModerationVerdictType, number> = {
    clean: 0,
    spam: 0,
    abuse: 0,
    "hate-speech": 0,
    "unsolicited-commercial": 0,
    "minor-safety-risk": 0,
  };
  for (const f of flags) flagsByVerdict[f.verdictType]++;

  return {
    totalFlags: flags.length,
    unresolvedFlags: flags.filter((f) => !f.resolved).length,
    totalBlocks: blocks.length,
    flagsByVerdict,
  };
}
