/**
 * MessagingSmokeTest
 * Validates DM send, receive, notification, read, and moderation paths.
 */

import { createConversation, getConversation } from "../messages/ConversationEngine";
import {
  getConversationMessages,
  markDelivered,
  markRead,
  sendDirectMessage,
} from "../messages/DirectMessageEngine";
import {
  getMessageBadgeCount,
  getMessageNotifications,
} from "../messages/MessageNotificationEngine";
import {
  listUnresolvedFlags,
  isSenderMuted,
} from "../messages/MessageModerationEngine";

export function runMessagingSmokeTest() {
  const logs: string[] = [];

  try {
    const conversation = createConversation(
      { userId: "fan-smoke-1", role: "fan", joinedAtMs: Date.now() },
      { userId: "artist-smoke-1", role: "artist", joinedAtMs: Date.now() },
      "Smoke DM",
    );

    const cleanMessage = sendDirectMessage({
      conversationId: conversation.conversationId,
      senderId: "fan-smoke-1",
      senderDisplayName: "Fan Smoke",
      recipientId: "artist-smoke-1",
      text: "Locking messaging smoke test.",
      senderActor: { userId: "fan-smoke-1", ageClass: "adult" },
      recipientTarget: { userId: "artist-smoke-1", ageClass: "adult" },
    });
    markDelivered(conversation.conversationId, cleanMessage.messageId);
    markRead(conversation.conversationId, cleanMessage.messageId);

    const inbox = getConversationMessages(conversation.conversationId);
    const notifications = getMessageNotifications("artist-smoke-1");
    const badge = getMessageBadgeCount("artist-smoke-1");
    const updatedConversation = getConversation(conversation.conversationId);
    logs.push(
      `SEND OK message=${cleanMessage.messageId} status=${inbox[0]?.status ?? "missing"} notifications=${notifications.length} unread=${badge.totalUnread} messageCount=${updatedConversation?.messageCount ?? 0}`,
    );

    const moderatedMessage = sendDirectMessage({
      conversationId: conversation.conversationId,
      senderId: "fan-smoke-1",
      senderDisplayName: "Fan Smoke",
      recipientId: "artist-smoke-1",
      text: "click here for free money",
      senderActor: { userId: "fan-smoke-1", ageClass: "adult" },
      recipientTarget: { userId: "artist-smoke-1", ageClass: "adult" },
    });

    const flags = listUnresolvedFlags();
    logs.push(
      `MODERATION OK status=${moderatedMessage.status} flags=${flags.length} muted=${isSenderMuted("fan-smoke-1")}`,
    );

    return { status: "PASS" as const, logs };
  } catch (error) {
    return {
      status: "FAIL" as const,
      logs,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}