export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/auth/UserStore";
import {
  listConversationsForUser,
  getOrCreateConversation,
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
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const convos = await listConversationsForUser(user.id);
    const conversations = [];
    for (const c of convos) {
      const participants = await resolveParticipants(c.participantIds);
      const other = participants.find((p) => p.userId !== user.id);
      const msgsAsc = [...c.messages].reverse();
      const last = msgsAsc[msgsAsc.length - 1] ?? null;
      const unread = unreadCountForUser(c.messages, user.id);
      conversations.push({
        id: c.id,
        threadId: c.id,
        kind: c.kind,
        name: other?.displayName ?? participants.map((p) => p.displayName).join(", "),
        role: (other?.role ?? "user").toUpperCase(),
        participants,
        lastMessage: last?.body ?? "",
        lastMessageAt: last?.createdAt?.toISOString() ?? c.updatedAt.toISOString(),
        unread,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      });
    }
    return NextResponse.json({ conversations });
  } catch (err) {
    console.error("[api/messages/conversations GET]", err);
    return NextResponse.json({ error: "Unable to load conversations", conversations: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let body: { recipientId?: string; recipientName?: string; kind?: string } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    /* empty */
  }

  if (!body.recipientId) {
    return NextResponse.json({ error: "recipientId required" }, { status: 400 });
  }

  try {
    const convo = await getOrCreateConversation({
      userId: user.id,
      recipientId: body.recipientId,
      kind: body.kind ?? "fan-fan",
    });
    return NextResponse.json({ ok: true, threadId: convo.id, conversation: { id: convo.id } });
  } catch (err) {
    console.error("[api/messages/conversations POST]", err);
    return NextResponse.json({ error: "Unable to create conversation" }, { status: 500 });
  }
}
