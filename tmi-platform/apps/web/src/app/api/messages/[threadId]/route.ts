export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import {
  getConversationForUser,
  sendMessage,
  markConversationRead,
  softDeleteMessage,
  resolveParticipants,
  encodeShareMeta,
  decodeShareMeta,
} from "@/lib/messaging/prismaMessageStore";
import { resolveMessagingUser } from "@/lib/messaging/resolveMessagingUser";

export async function GET(req: NextRequest, { params }: { params: { threadId: string } }) {
  const user = await resolveMessagingUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const thread = await getConversationForUser(params.threadId, user.id);
    if (!thread) return NextResponse.json({ error: "Thread not found" }, { status: 404 });

    await markConversationRead(params.threadId, user.id);
    const participants = await resolveParticipants(thread.participantIds);

    return NextResponse.json({
      threadId: thread.id,
      kind: thread.kind,
      participants,
      messages: thread.messages.map((m) => {
        const meta = decodeShareMeta(m.mediaUrl);
        let callId: string | undefined;
        if (m.messageType === "video_invite" && m.mediaUrl) {
          try {
            const parsed = JSON.parse(m.mediaUrl) as { callId?: string };
            callId = parsed.callId;
          } catch {
            callId = undefined;
          }
        }
        return {
          messageId: m.id,
          senderId: m.senderId,
          senderName: m.senderName,
          body: m.body,
          type: m.messageType,
          valueUsdCents: m.valueUsdCents ?? undefined,
          mediaUrl: meta.mediaUrl,
          playlistId: meta.playlistId,
          trackId: meta.trackId,
          shareSlug: meta.shareSlug,
          shareId: meta.shareId,
          cardId: meta.cardId,
          callId,
          createdAt: m.createdAt.toISOString(),
          editedAt: m.editedAt?.toISOString(),
          isOwn: m.senderId === user.id,
        };
      }),
    });
  } catch (err) {
    console.error("[api/messages/thread GET]", err);
    return NextResponse.json({ error: "Unable to load thread" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { threadId: string } }) {
  const user = await resolveMessagingUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const thread = await getConversationForUser(params.threadId, user.id);
    if (!thread) return NextResponse.json({ error: "Thread not found" }, { status: 404 });

    const body = (await req.json()) as {
      body?: string;
      type?: string;
      playlistId?: string;
      trackId?: string;
      shareSlug?: string;
      shareId?: string;
      cardId?: string;
      mediaUrl?: string;
      valueUsdCents?: number;
      callId?: string;
    };
    if (!body.body?.trim()) return NextResponse.json({ error: "Message body required" }, { status: 400 });

    const allowedTypes = new Set([
      "text", "image", "audio", "tip", "gift", "system", "playlist", "yopho", "profile", "yopho_card",
      "video_invite", "link",
    ]);
    const msgType = body.type && allowedTypes.has(body.type) ? body.type : "text";

    if (msgType === "playlist" && !body.playlistId?.trim()) {
      return NextResponse.json({ error: "playlistId required for playlist shares" }, { status: 400 });
    }
    if ((msgType === "yopho" || msgType === "profile") && !body.shareSlug?.trim()) {
      return NextResponse.json({ error: "shareSlug required for yopho/profile shares" }, { status: 400 });
    }
    if (msgType === "yopho_card" && !body.cardId?.trim() && !body.shareId?.trim()) {
      return NextResponse.json({ error: "cardId required for interactive YoPho card shares" }, { status: 400 });
    }
    if (msgType === "video_invite" && !body.callId?.trim()) {
      return NextResponse.json({ error: "callId required for video invites" }, { status: 400 });
    }
    if ((msgType === "image" || msgType === "link") && !body.mediaUrl?.trim() && !/^https?:\/\//i.test(body.body)) {
      // image prefers mediaUrl; link may be the body URL itself
    }

    let mediaUrl: string | undefined;
    if (msgType === "video_invite") {
      mediaUrl = JSON.stringify({ callId: body.callId, mediaUrl: body.mediaUrl });
    } else {
      mediaUrl = encodeShareMeta(
        {
          playlistId: body.playlistId?.trim(),
          trackId: body.trackId?.trim(),
          shareSlug: body.shareSlug?.trim(),
          shareId: body.shareId?.trim(),
          cardId: body.cardId?.trim() || body.shareId?.trim(),
        },
        body.mediaUrl,
      );
    }

    const message = await sendMessage({
      conversationId: params.threadId,
      senderId: user.id,
      senderName: user.displayName,
      body: body.body.trim(),
      messageType: msgType,
      mediaUrl,
      valueUsdCents: body.valueUsdCents,
    });

    const meta = decodeShareMeta(message.mediaUrl);
    return NextResponse.json({
      messageId: message.id,
      body: message.body,
      type: message.messageType,
      playlistId: meta.playlistId,
      trackId: meta.trackId,
      shareSlug: meta.shareSlug,
      shareId: meta.shareId,
      cardId: meta.cardId,
      callId: body.callId,
      mediaUrl: meta.mediaUrl ?? body.mediaUrl,
      createdAt: message.createdAt.toISOString(),
    });
  } catch (err) {
    console.error("[api/messages/thread POST]", err);
    return NextResponse.json({ error: "Could not send message" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { threadId: string } }) {
  const user = await resolveMessagingUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { messageId?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "messageId required" }, { status: 400 });
  }
  if (!body.messageId) return NextResponse.json({ error: "messageId required" }, { status: 400 });

  try {
    const ok = await softDeleteMessage(params.threadId, body.messageId, user.id);
    if (!ok) return NextResponse.json({ error: "Message not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/messages/thread DELETE]", err);
    return NextResponse.json({ error: "Unable to delete message" }, { status: 500 });
  }
}
