export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import {
  getConversationForUser,
  sendMessage,
  markConversationRead,
} from "@/lib/messaging/prismaMessageStore";
import { resolveMessagingUser } from "@/lib/messaging/resolveMessagingUser";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await resolveMessagingUser(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const convo = await getConversationForUser(params.id, user.id);
    if (!convo) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await markConversationRead(params.id, user.id);
    const messages = convo.messages.map((m) => ({
      id: m.id,
      from: m.senderName,
      senderId: m.senderId,
      text: m.body,
      type: m.messageType,
      mediaUrl: m.mediaUrl,
      mine: m.senderId === user.id,
      ts: m.createdAt.getTime(),
    }));
    return NextResponse.json({ messages });
  } catch (err) {
    console.error("[api/messages/conversations/id GET]", err);
    return NextResponse.json({ error: "Unable to load messages", messages: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await resolveMessagingUser(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let body: { text?: string; body?: string; type?: string; mediaUrl?: string } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    /* empty */
  }

  const text = (body.text ?? body.body ?? "").trim();
  if (!text) {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }

  try {
    const convo = await getConversationForUser(params.id, user.id);
    if (!convo) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const created = await sendMessage({
      conversationId: params.id,
      senderId: user.id,
      senderName: user.displayName,
      body: text,
      messageType: body.type ?? "text",
      mediaUrl: body.mediaUrl,
    });
    const msg = {
      id: created.id,
      from: "You",
      senderId: user.id,
      text: created.body,
      type: created.messageType,
      mine: true,
      ts: created.createdAt.getTime(),
    };
    return NextResponse.json({ ok: true, message: msg });
  } catch (err) {
    console.error("[api/messages/conversations/id POST]", err);
    return NextResponse.json({ error: "Unable to send message" }, { status: 500 });
  }
}
