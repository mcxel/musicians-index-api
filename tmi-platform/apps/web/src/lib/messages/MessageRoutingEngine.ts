/**
 * MessageRoutingEngine
 * Route resolution for all messaging participant pairs.
 * Defines allowed channels, permissions, and conversation route builders
 * for: fan↔fan, fan↔artist, artist↔venue, artist↔sponsor,
 *      merchant↔artist, promoter↔venue.
 */

import {
  createConversation,
  getConversationBetween,
  type ConversationParticipant,
  type ConversationRouteType,
  type Conversation,
} from "./ConversationEngine";

import type { ContactActor, ContactTarget } from "@/lib/safety/TeenMessagingPolicyEngine";

export type MessageRouteParty = {
  userId: string;
  displayName: string;
  role: ConversationParticipant["role"];
  ageClass: ContactActor["ageClass"];
};

export type MessageRouteResolution = {
  conversationId: string;
  routeType: ConversationRouteType;
  allowed: boolean;
  reason: string;
  conversation?: Conversation;
};

// Channel rules — which pairs can initiate conversations
const ALLOWED_ROUTE_PAIRS: Array<[ConversationParticipant["role"], ConversationParticipant["role"]]> = [
  ["fan", "fan"],
  ["fan", "artist"],
  ["artist", "venue"],
  ["artist", "sponsor"],
  ["merchant", "artist"],
  ["promoter", "venue"],
  ["admin", "fan"],
  ["admin", "artist"],
  ["admin", "venue"],
  ["admin", "sponsor"],
  ["admin", "merchant"],
  ["admin", "promoter"],
];

function isRouteAllowed(
  roleA: ConversationParticipant["role"],
  roleB: ConversationParticipant["role"],
): boolean {
  return ALLOWED_ROUTE_PAIRS.some(
    ([a, b]) => (a === roleA && b === roleB) || (a === roleB && b === roleA),
  );
}

export function resolveMessageRoute(
  sender: MessageRouteParty,
  recipient: MessageRouteParty,
): MessageRouteResolution {
  if (!isRouteAllowed(sender.role, recipient.role)) {
    return {
      conversationId: "",
      routeType: "fan-fan",
      allowed: false,
      reason: `Messaging between '${sender.role}' and '${recipient.role}' is not permitted`,
    };
  }

  const senderParticipant: ConversationParticipant = {
    userId: sender.userId,
    role: sender.role,
    joinedAtMs: Date.now(),
  };

  const recipientParticipant: ConversationParticipant = {
    userId: recipient.userId,
    role: recipient.role,
    joinedAtMs: Date.now(),
  };

  const conversation = createConversation(senderParticipant, recipientParticipant);

  return {
    conversationId: conversation.conversationId,
    routeType: conversation.routeType,
    allowed: true,
    reason: "Route resolved",
    conversation,
  };
}

export function lookupExistingRoute(
  userIdA: string,
  userIdB: string,
): Conversation | undefined {
  return getConversationBetween(userIdA, userIdB);
}

export function buildInboxRoute(userId: string): string {
  return `/messages/${userId}/inbox`;
}

export function buildConversationRoute(conversationId: string): string {
  return `/messages/conversation/${conversationId}`;
}

export function buildNewMessageRoute(
  senderRole: ConversationParticipant["role"],
  recipientId: string,
): string {
  return `/messages/new/${senderRole}/${recipientId}`;
}

export type MessageRouteManifest = {
  inboxRoute: string;
  newFanMessageRoute: (recipientId: string) => string;
  newArtistMessageRoute: (recipientId: string) => string;
  newVenueMessageRoute: (recipientId: string) => string;
  newSponsorMessageRoute: (recipientId: string) => string;
  conversationRoute: (conversationId: string) => string;
};

export function buildMessageRouteManifest(userId: string): MessageRouteManifest {
  return {
    inboxRoute: buildInboxRoute(userId),
    newFanMessageRoute: (recipientId) => buildNewMessageRoute("fan", recipientId),
    newArtistMessageRoute: (recipientId) => buildNewMessageRoute("artist", recipientId),
    newVenueMessageRoute: (recipientId) => buildNewMessageRoute("venue", recipientId),
    newSponsorMessageRoute: (recipientId) => buildNewMessageRoute("sponsor", recipientId),
    conversationRoute: (conversationId) => buildConversationRoute(conversationId),
  };
}

// Resolve contact actors from route parties (for safety layer integration)
export function toContactActor(party: MessageRouteParty): ContactActor {
  return {
    userId: party.userId,
    ageClass: party.ageClass,
  };
}

export function toContactTarget(party: MessageRouteParty): ContactTarget {
  return {
    userId: party.userId,
    ageClass: party.ageClass,
  };
}
