export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/auth/UserStore";
import {
  getConversationForUser,
  sendMessage,
  markConversationRead,
} from "@/lib/messaging/prismaMessageStore";

function getUserFromRequest(req: NextRequest) {
  const email = req.cookies.get("tmi_user_email")?.value ?? "";
  if (!email) return null;
  return getUserByEmail(email);
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const convo = await getConversationForUser(params.id, user.id);
    if (!convo) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await markConversationRead(params.id, user.id);
    const messages = convo.messages.map((m) => ({
      id: m.id,
      from: m.senderName,
      text: m.body,
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
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let body: { text?: string } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    /* empty */
  }

  try {
    const convo = await getConversationForUser(params.id, user.id);
    if (!convo) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const created = await sendMessage({
      conversationId: params.id,
      senderId: user.id,
      senderName: user.displayName,
      body: (body.text ?? "").trim() || "(empty)",
      messageType: "text",
    });
    const msg = {
      id: created.id,
      from: "You",
      text: created.body,
      mine: true,
      ts: created.createdAt.getTime(),
    };
    return NextResponse.json({ ok: true, message: msg });
  } catch (err) {
    console.error("[api/messages/conversations/id POST]", err);
    return NextResponse.json({ error: "Unable to send message" }, { status: 500 });
  }
}