export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/auth/UserStore";
import {
  listConversationsForUser,
  getOrCreateConversation,
  sendMessage,
  resolveParticipants,
  unreadCountForUser,
} from "@/lib/messaging/prismaMessageStore";

function getUserFromRequest(req: NextRequest) {
  const email = req.cookies.get("tmi_user_email")?.value ?? "";
  if (!email) return null;
  return getUserByEmail(email);
}

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
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
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    recipientId?: string;
    recipientName?: string;
    recipientRole?: string;
    body?: string;
    kind?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.recipientId || !body.body?.trim()) {
    return NextResponse.json({ error: "recipientId and body required" }, { status: 400 });
  }

  try {
    const convo = await getOrCreateConversation({
      userId: user.id,
      recipientId: body.recipientId,
      kind: body.kind ?? "fan-fan",
    });
    const message = await sendMessage({
      conversationId: convo.id,
      senderId: user.id,
      senderName: user.displayName,
      body: body.body.trim(),
      messageType: "text",
    });
    return NextResponse.json({
      threadId: convo.id,
      message: { messageId: message.id, body: message.body, createdAt: message.createdAt.toISOString() },
    });
  } catch (err) {
    console.error("[api/messages POST]", err);
    return NextResponse.json({ error: "Unable to send message" }, { status: 500 });
  }
}
