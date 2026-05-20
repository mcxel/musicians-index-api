import { NextResponse } from "next/server";

interface LiveRoomMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderTier: "FREE" | "MEMBER" | "DIAMOND";
  content: string;
  type: "chat" | "tip" | "reaction" | "system";
  tipAmountUSD?: number;
  reactionEmoji?: string;
  sentAt: string;
}

const roomMessages = new Map<string, LiveRoomMessage[]>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get("roomId");
  const limit = Number(searchParams.get("limit") ?? "50");
  if (!roomId) return NextResponse.json({ error: "roomId required" }, { status: 400 });
  const messages = (roomMessages.get(roomId) ?? []).slice(-limit);
  return NextResponse.json({ messages, roomId });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      roomId: string;
      senderId: string;
      senderName?: string;
      senderTier?: "FREE" | "MEMBER" | "DIAMOND";
      content?: string;
      type?: "chat" | "tip" | "reaction" | "system";
      tipAmountUSD?: number;
      reactionEmoji?: string;
    };

    const { roomId, senderId, content, type = "chat" } = body;
    if (!roomId || !senderId) {
      return NextResponse.json({ error: "roomId and senderId required" }, { status: 400 });
    }
    if (type === "chat" && !content?.trim()) {
      return NextResponse.json({ error: "content required for chat messages" }, { status: 400 });
    }

    const message: LiveRoomMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      roomId,
      senderId,
      senderName: body.senderName ?? senderId,
      senderTier: body.senderTier ?? "FREE",
      content: content ?? "",
      type,
      tipAmountUSD: body.tipAmountUSD,
      reactionEmoji: body.reactionEmoji,
      sentAt: new Date().toISOString(),
    };

    const existing = roomMessages.get(roomId) ?? [];
    // Cap at 500 messages per room in memory
    const updated = existing.length >= 500 ? [...existing.slice(-499), message] : [...existing, message];
    roomMessages.set(roomId, updated);

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
