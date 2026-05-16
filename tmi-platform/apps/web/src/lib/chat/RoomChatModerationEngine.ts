import type { RoomChatMessage } from "./RoomChatEngine";
import { moderateMessage, type ModerationResult } from "./ChatModerationEngine";

export type BubbleDisplayPolicy = "display" | "redacted" | "removed" | "flagged" | "reported";

export type BubbleModerationResult = {
  messageId: string;
  policy: BubbleDisplayPolicy;
  displayText: string;
  isBlocked: boolean;
  isFlagged: boolean;
  reasons: string[];
  shouldReport: boolean;
};

const REDACTION_PLACEHOLDER = "[Message removed by moderation]";
const FLAGGED_PLACEHOLDER = "[Content flagged for review]";

function shouldRemoveMessage(baseResult: ModerationResult): boolean {
  return (
    baseResult.action === "drop-threat" ||
    baseResult.action === "drop-hate" ||
    baseResult.action === "mute-user" ||
    baseResult.action === "timeout-user"
  );
}

function shouldFlagForReview(baseResult: ModerationResult): boolean {
  return baseResult.action === "flag-review" || baseResult.reportable;
}

function determineBubblePolicy(baseResult: ModerationResult): BubbleDisplayPolicy {
  if (baseResult.action === "drop-threat" || baseResult.action === "drop-hate") {
    return "removed";
  }
  if (baseResult.action === "flag-review" || baseResult.reportable) {
    return "flagged";
  }
  if (baseResult.action === "allow") {
    return "display";
  }
  return "redacted";
}

function getDisplayTextForPolicy(policy: BubbleDisplayPolicy, baseResult: ModerationResult): string {
  if (policy === "removed" || policy === "redacted") {
    return REDACTION_PLACEHOLDER;
  }
  if (policy === "flagged") {
    return FLAGGED_PLACEHOLDER;
  }
  return baseResult.safeText || "";
}

export function moderateBubbleMessage(
  message: RoomChatMessage,
  recentFromUser: RoomChatMessage[],
): BubbleModerationResult {
  const baseResult = moderateMessage(message, recentFromUser, {
    allowMildProfanity: true,
    spamBurstThreshold: 5,
    timeoutDurationMs: 120000,
  });

  const policy = determineBubblePolicy(baseResult);
  const displayText = getDisplayTextForPolicy(policy, baseResult);

  return {
    messageId: message.id,
    policy,
    displayText,
    isBlocked: shouldRemoveMessage(baseResult),
    isFlagged: shouldFlagForReview(baseResult),
    reasons: baseResult.reasons,
    shouldReport: baseResult.reportable,
  };
}

export function filterBubblesForDisplay(
  messages: RoomChatMessage[],
  userHistories: Map<string, RoomChatMessage[]>,
): { visible: RoomChatMessage[]; results: Map<string, BubbleModerationResult> } {
  const visible: RoomChatMessage[] = [];
  const results = new Map<string, BubbleModerationResult>();

  for (const message of messages) {
    const history = userHistories.get(message.userId) || [];
    const modResult = moderateBubbleMessage(message, history);

    results.set(message.id, modResult);

    if (modResult.policy === "display" || modResult.policy === "flagged") {
      visible.push(message);
    }
  }

  return { visible, results };
}

export function buildModerationSummary(results: Map<string, BubbleModerationResult>): {
  totalMessages: number;
  displayed: number;
  flagged: number;
  blocked: number;
  reportable: number;
  threats: number;
  hateSpeech: number;
} {
  const summary = {
    totalMessages: results.size,
    displayed: 0,
    flagged: 0,
    blocked: 0,
    reportable: 0,
    threats: 0,
    hateSpeech: 0,
  };

  for (const result of results.values()) {
    if (result.policy === "display") {
      summary.displayed += 1;
    } else if (result.policy === "flagged") {
      summary.flagged += 1;
    } else if (result.policy === "removed" || result.policy === "redacted") {
      summary.blocked += 1;
    }

    if (result.shouldReport) {
      summary.reportable += 1;
    }

    for (const reason of result.reasons) {
      if (reason.includes("threat") || reason.includes("doxx")) {
        summary.threats += 1;
        break;
      }
      if (reason.includes("hate") || reason.includes("slur")) {
        summary.hateSpeech += 1;
        break;
      }
    }
  }

  return summary;
}

export function getBlockedTermsForBubble(message: RoomChatMessage): string[] {
  const threats = ["kill you", "i will kill", "bomb", "shoot you", "stab you", "swat you"];
  const hate = ["nigger", "kike", "chink", "spic", "faggot", "raghead", "white power"];
  const doxx = ["your address is", "phone number is", "leaked your address", "dox"];

  const normalized = message.text.toLowerCase();
  const found: string[] = [];

  for (const term of [...threats, ...hate, ...doxx]) {
    if (normalized.includes(term)) {
      found.push(term);
    }
  }

  return found;
}

export class RoomChatModerationEngine {
  private readonly userMessageHistory: Map<string, RoomChatMessage[]> = new Map();
  private readonly maxHistoryPerUser: number = 100;

  addToHistory(message: RoomChatMessage): void {
    let history = this.userMessageHistory.get(message.userId);
    if (!history) {
      history = [];
      this.userMessageHistory.set(message.userId, history);
    }

    history.push(message);
    if (history.length > this.maxHistoryPerUser) {
      history.shift();
    }
  }

  getHistoryForUser(userId: string): RoomChatMessage[] {
    return this.userMessageHistory.get(userId) || [];
  }

  moderateMessage(message: RoomChatMessage): BubbleModerationResult {
    const history = this.getHistoryForUser(message.userId);
    const result = moderateBubbleMessage(message, history);
    this.addToHistory(message);
    return result;
  }

  moderateMessages(messages: RoomChatMessage[]): Map<string, BubbleModerationResult> {
    const results = new Map<string, BubbleModerationResult>();

    for (const message of messages) {
      results.set(message.id, this.moderateMessage(message));
    }

    return results;
  }

  clearHistory(): void {
    this.userMessageHistory.clear();
  }

  getStats(): {
    usersTracked: number;
    totalHistoryMessages: number;
  } {
    let totalMessages = 0;
    for (const history of this.userMessageHistory.values()) {
      totalMessages += history.length;
    }

    return {
      usersTracked: this.userMessageHistory.size,
      totalHistoryMessages: totalMessages,
    };
  }
}

export const roomChatModerationEngine = new RoomChatModerationEngine();
