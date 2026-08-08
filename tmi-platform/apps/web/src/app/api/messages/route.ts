export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import {
  listConversationsForUser,
  getOrCreateConversation,
  sendMessage,
  resolveParticipants,
  unreadCountForUser,
} from "@/lib/messaging/prismaMessageStore";
import {
  resolveMessagingUser,
  resolveRecipientId,
} from "@/lib/messaging/resolveMessagingUser";

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
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    recipientId?: string;
    recipientName?: string;
    recipientRole?: string;
    body?: string;
    kind?: string;
    type?: string;
    mediaUrl?: string;
    callId?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.recipientId || !body.body?.trim()) {
    return NextResponse.json({ error: "recipientId and body required" }, { status: 400 });
  }

  const recipient = await resolveRecipientId(body.recipientId);
  if (!recipient) {
    return NextResponse.json(
      { error: "Recipient not found. Use a real user id, email, or display name." },
      { status: 404 },
    );
  }

  if (recipient.id === user.id) {
    return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });
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

    const convo = await getOrCreateConversation({
      userId: user.id,
      recipientId: recipient.id,
      kind: body.kind ?? "fan-fan",
    });
    const message = await sendMessage({
      conversationId: convo.id,
      senderId: user.id,
      senderName: user.displayName,
      body: body.body.trim(),
      messageType: msgType,
      mediaUrl: mediaPayload,
    });
    return NextResponse.json({
      threadId: convo.id,
      message: {
        messageId: message.id,
        body: message.body,
        type: message.messageType,
        createdAt: message.createdAt.toISOString(),
      },
      recipient: {
        userId: recipient.id,
        displayName: recipient.displayName,
      },
    });
  } catch (err) {
    console.error("[api/messages POST]", err);
    return NextResponse.json({ error: "Unable to send message" }, { status: 500 });
  }
}
