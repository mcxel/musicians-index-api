/**
 * ConversationEngine
 * Conversation lifecycle: create, archive, restore, lookup, history.
 * Conversations are the shared context container for DirectMessages.
 */

export type ParticipantRole =
  | "fan"
  | "artist"
  | "venue"
  | "sponsor"
  | "merchant"
  | "promoter"
  | "admin";

export type ConversationParticipant = {
  userId: string;
  role: ParticipantRole;
  joinedAtMs: number;
  lastReadAtMs?: number;
  mutedUntilMs?: number;
};

export type ConversationState = "active" | "archived" | "blocked";

export type ConversationRouteType =
  | "fan-fan"
  | "fan-artist"
  | "artist-venue"
  | "artist-sponsor"
  | "merchant-artist"
  | "promoter-venue"
  | "admin-any";

export type Conversation = {
  conversationId: string;
  routeType: ConversationRouteType;
  participants: ConversationParticipant[];
  subject?: string;
  state: ConversationState;
  createdAtMs: number;
  updatedAtMs: number;
  lastMessagePreview?: string;
  lastMessageAtMs?: number;
  messageCount: number;
};

// --- in-memory store ---
const conversations: Map<string, Conversation> = new Map();
let convCounter = 0;

function deriveRouteType(
  roleA: ParticipantRole,
  roleB: ParticipantRole,
): ConversationRouteType {
  const pair = [roleA, roleB].sort().join("-") as string;
  const routeMap: Record<string, ConversationRouteType> = {
    "artist-venue": "artist-venue",
    "artist-sponsor": "artist-sponsor",
    "artist-merchant": "merchant-artist",
    "artist-promoter": "promoter-venue",
    "fan-fan": "fan-fan",
    "artist-fan": "fan-artist",
    "fan-venue": "fan-artist", // fans reaching venue staff treated as fan-artist
    "admin-artist": "admin-any",
    "admin-fan": "admin-any",
    "admin-venue": "admin-any",
    "admin-sponsor": "admin-any",
    "admin-merchant": "admin-any",
    "admin-promoter": "admin-any",
    "merchant-promoter": "promoter-venue",
    "promoter-venue": "promoter-venue",
    "merchant-fan": "fan-artist",
    "fan-merchant": "fan-artist",
    "fan-promoter": "fan-artist",
    "fan-sponsor": "fan-artist",
    "merchant-sponsor": "merchant-artist",
    "merchant-venue": "merchant-artist",
    "promoter-sponsor": "promoter-venue",
    "sponsor-venue": "artist-venue",
  };
  return routeMap[pair] ?? "fan-fan";
}

// --- Write API ---

export function createConversation(
  participantA: ConversationParticipant,
  participantB: ConversationParticipant,
  subject?: string,
): Conversation {
  // Dedup: if an active conversation already exists between these two, return it
  for (const conv of conversations.values()) {
    if (
      conv.state === "active" &&
      conv.participants.some((p) => p.userId === participantA.userId) &&
      conv.participants.some((p) => p.userId === participantB.userId)
    ) {
      return conv;
    }
  }

  const conv: Conversation = {
    conversationId: `conv-${++convCounter}`,
    routeType: deriveRouteType(participantA.role, participantB.role),
    participants: [participantA, participantB],
    subject,
    state: "active",
    createdAtMs: Date.now(),
    updatedAtMs: Date.now(),
    messageCount: 0,
  };
  conversations.set(conv.conversationId, conv);
  return conv;
}

export function archiveConversation(conversationId: string, requesterId: string): void {
  const conv = conversations.get(conversationId);
  if (!conv) return;
  if (!conv.participants.some((p) => p.userId === requesterId)) return;
  conv.state = "archived";
  conv.updatedAtMs = Date.now();
}

export function restoreConversation(conversationId: string, requesterId: string): void {
  const conv = conversations.get(conversationId);
  if (!conv) return;
  if (!conv.participants.some((p) => p.userId === requesterId)) return;
  if (conv.state === "archived") {
    conv.state = "active";
    conv.updatedAtMs = Date.now();
  }
}

export function blockConversation(conversationId: string): void {
  const conv = conversations.get(conversationId);
  if (conv) {
    conv.state = "blocked";
    conv.updatedAtMs = Date.now();
  }
}

export function updateConversationLastMessage(
  conversationId: string,
  preview: string,
): void {
  const conv = conversations.get(conversationId);
  if (conv) {
    conv.lastMessagePreview = preview.slice(0, 80);
    conv.lastMessageAtMs = Date.now();
    conv.updatedAtMs = Date.now();
    conv.messageCount++;
  }
}

export function updateParticipantReadTs(conversationId: string, userId: string): void {
  const conv = conversations.get(conversationId);
  const participant = conv?.participants.find((p) => p.userId === userId);
  if (participant) participant.lastReadAtMs = Date.now();
}

export function muteConversationForUser(
  conversationId: string,
  userId: string,
  durationMs: number,
): void {
  const conv = conversations.get(conversationId);
  const participant = conv?.participants.find((p) => p.userId === userId);
  if (participant) {
    participant.mutedUntilMs = Date.now() + durationMs;
  }
}

// --- Read API ---

export function getConversation(conversationId: string): Conversation | undefined {
  return conversations.get(conversationId);
}

export function getConversationBetween(
  userIdA: string,
  userIdB: string,
): Conversation | undefined {
  for (const conv of conversations.values()) {
    if (
      conv.participants.some((p) => p.userId === userIdA) &&
      conv.participants.some((p) => p.userId === userIdB)
    ) {
      return conv;
    }
  }
  return undefined;
}

export function listConversationsForUser(
  userId: string,
  includeArchived = false,
): Conversation[] {
  return [...conversations.values()]
    .filter((c) => {
      if (!c.participants.some((p) => p.userId === userId)) return false;
      if (c.state === "blocked") return false;
      if (!includeArchived && c.state === "archived") return false;
      return true;
    })
    .sort((a, b) => (b.lastMessageAtMs ?? b.createdAtMs) - (a.lastMessageAtMs ?? a.createdAtMs));
}

export function isConversationMuted(conversationId: string, userId: string): boolean {
  const conv = conversations.get(conversationId);
  const participant = conv?.participants.find((p) => p.userId === userId);
  if (!participant?.mutedUntilMs) return false;
  return participant.mutedUntilMs > Date.now();
}
