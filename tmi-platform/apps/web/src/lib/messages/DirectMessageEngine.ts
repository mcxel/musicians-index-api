/**
 * DirectMessageEngine
 * Core DM send/receive, message status lifecycle, and attachment metadata.
 * Wired into the safety layer — all sends are policy-checked.
 */

import { enforceAdultTeenContactBlock } from "@/lib/safety/AdultTeenContactBlocker";
import { checkMessageContent, flagMessage } from "@/lib/messages/MessageModerationEngine";
import { updateConversationLastMessage } from "@/lib/messages/ConversationEngine";
import { pushMessageNotification } from "@/lib/messages/MessageNotificationEngine";
import type { ContactActor, ContactTarget } from "@/lib/safety/TeenMessagingPolicyEngine";

export type DMStatus = "sent" | "delivered" | "read" | "failed" | "deleted";

export type DMAttachment = {
  attachmentId: string;
  mimeType: "image/jpeg" | "image/png" | "audio/mpeg" | "application/pdf" | "text/plain";
  url: string;
  fileSizeBytes: number;
  label?: string;
};

export type DirectMessage = {
  messageId: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  text: string;
  attachments: DMAttachment[];
  status: DMStatus;
  sentAtMs: number;
  deliveredAtMs?: number;
  readAtMs?: number;
  deletedAtMs?: number;
  replyToId?: string;
};

export type DMSendInput = {
  conversationId: string;
  senderId: string;
  senderDisplayName: string;
  recipientId: string;
  text: string;
  attachments?: DMAttachment[];
  replyToId?: string;
  senderActor: ContactActor;
  recipientTarget: ContactTarget;
};

// --- in-memory store ---
const messages: Map<string, DirectMessage[]> = new Map(); // keyed by conversationId
let messageCounter = 0;

function getConvoMessages(conversationId: string): DirectMessage[] {
  if (!messages.has(conversationId)) messages.set(conversationId, []);
  return messages.get(conversationId)!;
}

// --- Write API ---

export function sendDirectMessage(input: DMSendInput): DirectMessage {
  // 1. Safety policy check (teen/adult)
  const decision = enforceAdultTeenContactBlock({
    source: "DirectMessageEngine",
    channel: "dm",
    actor: input.senderActor,
    target: input.recipientTarget,
  });

  if (!decision.allowed) {
    const failed: DirectMessage = {
      messageId: `dm-failed-${++messageCounter}`,
      conversationId: input.conversationId,
      senderId: input.senderId,
      recipientId: input.recipientId,
      text: input.text,
      attachments: [],
      status: "failed",
      sentAtMs: Date.now(),
    };
    getConvoMessages(input.conversationId).push(failed);
    return failed;
  }

  // 2. Content moderation check
  const moderation = checkMessageContent(input.text);
  if (moderation.isSpam || moderation.isAbuse) {
    const failed: DirectMessage = {
      messageId: `dm-failed-${++messageCounter}`,
      conversationId: input.conversationId,
      senderId: input.senderId,
      recipientId: input.recipientId,
      text: input.text,
      attachments: [],
      status: "failed",
      sentAtMs: Date.now(),
    };
    getConvoMessages(input.conversationId).push(failed);

    flagMessage({
      conversationId: input.conversationId,
      messageId: failed.messageId,
      reportedByUserId: "system-auto-moderator",
      suspectUserId: input.senderId,
      verdictType: moderation.verdict,
      notes: `Matched pattern: ${moderation.matchedPattern}`,
    });
    return failed;
  }

  const msg: DirectMessage = {
    messageId: `dm-${++messageCounter}`,
    conversationId: input.conversationId,
    senderId: input.senderId,
    recipientId: input.recipientId,
    text: input.text.slice(0, 2000), // cap message length
    attachments: input.attachments ?? [],
    status: "sent",
    sentAtMs: Date.now(),
    replyToId: input.replyToId,
  };

  getConvoMessages(input.conversationId).unshift(msg);

  // 3. Update conversation metadata
  updateConversationLastMessage(input.conversationId, msg.text);

  // 4. Trigger notification for recipient
  pushMessageNotification({
    userId: input.recipientId,
    alertType: "new-message",
    conversationId: input.conversationId,
    fromUserId: input.senderId,
    fromDisplayName: input.senderDisplayName,
    preview: msg.text,
  });

  return msg;
}

export function markDelivered(conversationId: string, messageId: string): void {
  const msg = getConvoMessages(conversationId).find((m) => m.messageId === messageId);
  if (msg && msg.status === "sent") {
    msg.status = "delivered";
    msg.deliveredAtMs = Date.now();
  }
}

export function markRead(conversationId: string, messageId: string): void {
  const msg = getConvoMessages(conversationId).find((m) => m.messageId === messageId);
  if (msg && (msg.status === "sent" || msg.status === "delivered")) {
    msg.status = "read";
    msg.readAtMs = Date.now();
  }
}

export function markAllRead(conversationId: string, recipientId: string): void {
  const now = Date.now();
  for (const msg of getConvoMessages(conversationId)) {
    if (msg.recipientId === recipientId && msg.status !== "read" && msg.status !== "deleted") {
      msg.status = "read";
      msg.readAtMs = now;
    }
  }
}

export function deleteDirectMessage(conversationId: string, messageId: string, requesterId: string): void {
  const msg = getConvoMessages(conversationId).find((m) => m.messageId === messageId);
  if (msg && msg.senderId === requesterId && msg.status !== "deleted") {
    msg.status = "deleted";
    msg.deletedAtMs = Date.now();
    msg.text = "[message deleted]";
    msg.attachments = [];
  }
}

// --- Read API ---

export function getConversationMessages(
  conversationId: string,
  limit = 50,
  beforeMs?: number,
): DirectMessage[] {
  const all = getConvoMessages(conversationId)
    .filter((m) => m.status !== "deleted");
  const filtered = beforeMs ? all.filter((m) => m.sentAtMs < beforeMs) : all;
  return filtered.slice(0, Math.max(1, limit));
}

export function getUnreadCount(conversationId: string, recipientId: string): number {
  return getConvoMessages(conversationId).filter(
    (m) => m.recipientId === recipientId && m.status !== "read" && m.status !== "deleted",
  ).length;
}

export function getDirectMessage(conversationId: string, messageId: string): DirectMessage | undefined {
  return getConvoMessages(conversationId).find((m) => m.messageId === messageId);
}
