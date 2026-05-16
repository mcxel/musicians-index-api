export type ModerationSurface =
  | "public-room"
  | "lobby"
  | "concert"
  | "show"
  | "game"
  | "contest"
  | "cypher"
  | "battle"
  | "billboard"
  | "live-comment";

export type ModerationEventType =
  | "unsafe-content"
  | "harassment"
  | "spam"
  | "scam"
  | "impersonation"
  | "payout-abuse"
  | "rule-violation";

export type ModerationEvent = {
  id: string;
  surface: ModerationSurface;
  eventType: ModerationEventType;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  requiresLegalReview: boolean;
  requiresFinancialApproval: boolean;
  escalatedTo: Array<"marcel-root" | "big-ace" | "mc">;
  timestamp: number;
};

const moderationLog: ModerationEvent[] = [];

function detectEventType(input: string): ModerationEventType {
  const text = input.toLowerCase();
  if (/scam|phish|crypto giveaway/i.test(text)) return "scam";
  if (/impersonat|fake admin|fake mod/i.test(text)) return "impersonation";
  if (/abuse payout|cashout exploit|withdraw exploit/i.test(text)) return "payout-abuse";
  if (/spam|bot flood|repeat/i.test(text)) return "spam";
  if (/harass|threat|targeted abuse/i.test(text)) return "harassment";
  if (/nsfw|violent|illegal/i.test(text)) return "unsafe-content";
  return "rule-violation";
}

function severityForType(type: ModerationEventType): ModerationEvent["severity"] {
  if (type === "payout-abuse" || type === "scam" || type === "unsafe-content") return "critical";
  if (type === "impersonation" || type === "harassment") return "high";
  if (type === "spam") return "medium";
  return "low";
}

export function moderateSignal(surface: ModerationSurface, message: string): ModerationEvent {
  const eventType = detectEventType(message);
  const severity = severityForType(eventType);
  const requiresFinancialApproval = eventType === "payout-abuse";
  const requiresLegalReview = eventType === "scam" || eventType === "unsafe-content" || eventType === "impersonation";

  const escalatedTo: ModerationEvent["escalatedTo"] =
    severity === "high" || severity === "critical" ? ["marcel-root", "big-ace", "mc"] : ["big-ace", "mc"];

  const event: ModerationEvent = {
    id: `mod-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    surface,
    eventType,
    message,
    severity,
    requiresLegalReview,
    requiresFinancialApproval,
    escalatedTo,
    timestamp: Date.now(),
  };

  moderationLog.unshift(event);
  if (moderationLog.length > 500) {
    moderationLog.length = 500;
  }

  return event;
}

export function getModerationLog() {
  return [...moderationLog];
}
