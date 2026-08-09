export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendMessage } from "@/lib/messaging/prismaMessageStore";
import { resolveMessagingUser } from "@/lib/messaging/resolveMessagingUser";
import { getOrCreateCommunityConversation } from "@/lib/messaging/communityConversation";

/**
 * GET/POST /api/community/messages — the single platform-wide community feed.
 * Unlike /api/messages/conversations/[id], there is no participantIds gate:
 * any authenticated user may read and post here.
 */

export async function GET(req: NextRequest) {
  const user = await resolveMessagingUser(req);
  if (!user) return NextResponse.json({ error: "Not authenticated", messages: [] }, { status: 401 });

  try {
    const conversationId = await getOrCreateCommunityConversation();
    const rows = await prisma.message.findMany({
      where: { conversationId, isDeleted: false },
      orderBy: { createdAt: "asc" },
      take: 200,
    });
    const senderIds = [...new Set(rows.map((m) => m.senderId))];
    const senders = senderIds.length
      ? await prisma.user.findMany({
          where: { id: { in: senderIds } },
          select: { id: true, image: true },
        })
      : [];
    const imageBySender = new Map(senders.map((s) => [s.id, s.image]));
    const messages = rows.map((m) => ({
      id: m.id,
      senderId: m.senderId,
      senderName: m.senderName,
      senderImage: imageBySender.get(m.senderId) ?? null,
      text: m.body,
      mine: m.senderId === user.id,
      ts: m.createdAt.getTime(),
    }));
    return NextResponse.json({ messages });
  } catch (err) {
    console.error("[api/community/messages GET]", err);
    return NextResponse.json({ error: "Unable to load messages", messages: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await resolveMessagingUser(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let body: { text?: string } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    /* empty */
  }
  const text = (body.text ?? "").trim();
  if (!text) return NextResponse.json({ error: "text required" }, { status: 400 });
  if (text.length > 2000) return NextResponse.json({ error: "message too long" }, { status: 400 });

  try {
    const conversationId = await getOrCreateCommunityConversation();
    const [created, senderRow] = await Promise.all([
      sendMessage({
        conversationId,
        senderId: user.id,
        senderName: user.displayName,
        body: text,
      }),
      prisma.user.findUnique({ where: { id: user.id }, select: { image: true } }),
    ]);
    const message = {
      id: created.id,
      senderId: user.id,
      senderName: user.displayName,
      senderImage: senderRow?.image ?? null,
      text: created.body,
      mine: true,
      ts: created.createdAt.getTime(),
    };
    return NextResponse.json({ ok: true, message });
  } catch (err) {
    console.error("[api/community/messages POST]", err);
    return NextResponse.json({ error: "Unable to send message" }, { status: 500 });
  }
}
