import EmailIntentDetectionEngine from "@/lib/email/EmailIntentDetectionEngine";
import type {
  BusinessCommsLane,
  BusinessCommsPriority,
  BusinessMessage,
  BusinessMessageIntent,
} from "./types";

function nextId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function mapLegacyIntent(
  legacy: ReturnType<typeof EmailIntentDetectionEngine.detectIntent>,
): BusinessMessageIntent {
  switch (legacy) {
    case "billing-issue":
      return "billing_issue";
    case "support-request":
    case "login-issue":
    case "ticket-issue":
    case "promo-issue":
    case "security-alert":
      return "support_request";
    default:
      return "unknown";
  }
}

function detectBusinessIntent(subject: string, body: string): BusinessMessageIntent {
  const text = `${subject} ${body}`.toLowerCase();
  if (
    text.includes("sponsor") ||
    text.includes("partnership") ||
    text.includes("brand deal") ||
    text.includes("placement")
  ) {
    return "sponsor_inquiry";
  }
  if (text.includes("advertis") || text.includes("ad slot") || text.includes("campaign")) {
    return "advertiser_inquiry";
  }
  if (text.includes("book") && (text.includes("performer") || text.includes("artist") || text.includes("show"))) {
    return "booking_inquiry";
  }
  if (text.includes("renew") || text.includes("extension")) {
    return "renewal";
  }
  if (text.includes("invoice") || text.includes("past due") || text.includes("collections")) {
    return "collections";
  }
  if (text.includes("legal") || text.includes("subpoena") || text.includes("dmca")) {
    return "legal_notice";
  }
  return mapLegacyIntent(EmailIntentDetectionEngine.detectIntent({ subject, body }));
}

function laneForIntent(intent: BusinessMessageIntent): BusinessCommsLane {
  switch (intent) {
    case "sponsor_inquiry":
      return "sponsor_acquisition";
    case "advertiser_inquiry":
      return "advertiser_sales";
    case "booking_inquiry":
      return "booking";
    case "renewal":
      return "renewal";
    case "collections":
      return "collections";
    case "legal_notice":
      return "relationship_intelligence";
    default:
      return "relationship_intelligence";
  }
}

function priorityForIntent(intent: BusinessMessageIntent, body: string): BusinessCommsPriority {
  const lower = body.toLowerCase();
  if (intent === "legal_notice" || lower.includes("urgent") || lower.includes("asap")) {
    return "P0";
  }
  if (intent === "sponsor_inquiry" || intent === "advertiser_inquiry" || intent === "booking_inquiry") {
    return "P1";
  }
  if (intent === "billing_issue" || intent === "collections") {
    return "P2";
  }
  return "P3";
}

export function triageRawMessage(input: {
  mailboxIdentity: string;
  from: string;
  to?: string[];
  subject: string;
  body: string;
  threadId?: string;
  receivedAt?: number;
}): BusinessMessage {
  const intent = detectBusinessIntent(input.subject, input.body);
  const lane = laneForIntent(intent);
  const priority = priorityForIntent(intent, input.body);
  const preview = input.body.trim().slice(0, 280);

  const triageNotes: string[] = [`intent=${intent}`, `lane=${lane}`];
  if (intent === "legal_notice") {
    triageNotes.push("route_to_legal_command_center");
  }

  return {
    id: nextId("bmsg"),
    threadId: input.threadId ?? nextId("bthread"),
    mailboxIdentity: input.mailboxIdentity,
    direction: "inbound",
    from: input.from.trim().toLowerCase(),
    to: (input.to ?? [input.mailboxIdentity]).map((a) => a.toLowerCase()),
    subject: input.subject.trim(),
    bodyPreview: preview,
    receivedAt: input.receivedAt ?? Date.now(),
    intent,
    priority,
    lane,
    triageNotes,
    requiresHuman: intent === "legal_notice" || priority === "P0",
  };
}

const inboundQueue: BusinessMessage[] = [];

export function enqueueTriagedMessage(message: BusinessMessage): void {
  inboundQueue.unshift(message);
  if (inboundQueue.length > 500) inboundQueue.length = 500;
}

export function listWorkQueue(filter?: {
  priority?: BusinessCommsPriority;
  lane?: BusinessCommsLane;
  limit?: number;
}): BusinessMessage[] {
  let rows = [...inboundQueue];
  if (filter?.priority) rows = rows.filter((m) => m.priority === filter.priority);
  if (filter?.lane) rows = rows.filter((m) => m.lane === filter.lane);
  const limit = filter?.limit ?? 50;
  return rows.slice(0, limit);
}

export function attachRelationshipToMessage(messageId: string, relationshipId: string): void {
  const row = inboundQueue.find((m) => m.id === messageId);
  if (row) row.relationshipId = relationshipId;
}
