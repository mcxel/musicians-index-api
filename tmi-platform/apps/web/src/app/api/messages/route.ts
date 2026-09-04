export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import {
  listConversationsForUser,
  sendMessage,
  resolveParticipants,
  unreadCountForUser,
} from "@/lib/messaging/prismaMessageStore";
import {
  resolveMessagingUser,
} from "@/lib/messaging/resolveMessagingUser";
import {
  startConversation,
  startConversationHttpStatus,
} from "@/lib/messaging/startConversation";
import { youthSocialBlockPayload } from "@/lib/trustSafety/resolveYouthSocialSubject";

export async function GET(req: NextRequest) {
  const user = await resolveMessagingUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const convos = await listConversationsForUser(user.id);
    let unreadTotal = 0;
    const threads = [];
    for (const c of convos) {
      const participants = await resolveParticipants(c.participantIds);
      const msgsAsc = [...c.messages].reverse();
      const last = msgsAsc[msgsAsc.length - 1] ?? null;
      const unread = unreadCountForUser(c.messages, user.id);
      unreadTotal += unread;
      threads.push({
        threadId: c.id,
        kind: c.kind,
        participants,
        lastMessage: last
          ? {
              messageId: last.id,
              senderId: last.senderId,
              senderName: last.senderName,
              body: last.body,
              type: last.messageType,
              createdAt: last.createdAt.toISOString(),
            }
          : null,
        unreadCount: unread,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      });
    }
    return NextResponse.json({ threads, unreadTotal });
  } catch (err) {
    console.error("[api/messages GET]", err);
    return NextResponse.json({ error: "Unable to load messages", threads: [], unreadTotal: 0 }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await resolveMessagingUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });

  let body: {
    recipientId?: string;
    recipientName?: string;
    recipientRole?: string;
    body?: string;
    kind?: string;
    type?: string;
    mediaUrl?: string;
    callId?: string;
    bootstrapOnly?: boolean;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON", code: "INVALID_JSON" }, { status: 400 });
  }

  if (!body.recipientId) {
    return NextResponse.json({ error: "recipientId required", code: "MISSING_FIELDS" }, { status: 400 });
  }

  const bootstrap = await startConversation({
    senderId: user.id,
    recipientHandle: body.recipientId,
    kind: body.kind,
    previewBody: body.body,
  });

  if (!bootstrap.ok) {
    return NextResponse.json(
      {
        error: bootstrap.error,
        code: bootstrap.code,
        eligibilityState: bootstrap.eligibilityState,
        recipientEligibilityState: bootstrap.recipientEligibilityState,
      },
      { status: startConversationHttpStatus(bootstrap) },
    );
  }

  // Bootstrap-only (profiles / Message CTA) — create/open thread without requiring body
  if (body.bootstrapOnly || !body.body?.trim()) {
    return NextResponse.json({
      threadId: bootstrap.threadId,
      created: bootstrap.created,
      kind: bootstrap.kind,
      recipient: bootstrap.recipient,
    });
  }

  try {
    const allowedTypes = new Set([
      "text", "image", "audio", "tip", "gift", "system", "playlist", "yopho", "profile", "yopho_card",
      "video_invite", "link",
    ]);
    const msgType = body.type && allowedTypes.has(body.type) ? body.type : "text";

    const mediaPayload =
      msgType === "video_invite" && body.callId
        ? JSON.stringify({ callId: body.callId, mediaUrl: body.mediaUrl })
        : body.mediaUrl;

    const message = await sendMessage({
      conversationId: bootstrap.threadId,
      senderId: user.id,
      senderName: user.displayName,
      body: body.body.trim(),
      messageType: msgType,
      mediaUrl: mediaPayload,
    });
    return NextResponse.json({
      threadId: bootstrap.threadId,
      created: bootstrap.created,
      message: {
        messageId: message.id,
        body: message.body,
        type: message.messageType,
        createdAt: message.createdAt.toISOString(),
      },
      recipient: bootstrap.recipient,
    });
  } catch (err) {
    const blocked = youthSocialBlockPayload(err);
    if (blocked) {
      return NextResponse.json(
        { ...blocked, code: blocked.code === "YOUTH_SOCIAL_BLOCKED" ? "AGE_POLICY_RESTRICTED" : blocked.code },
        { status: 403 },
      );
    }
    console.error("[api/messages POST]", err);
    return NextResponse.json({ error: "Unable to send message", code: "SEND_FAILED" }, { status: 500 });
  }
}
