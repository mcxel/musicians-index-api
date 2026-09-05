/**
 * Legacy alias: /api/social/messages/[userId]
 * Proxies to canonical /api/messages startConversation + thread send/load.
 */
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import {
  getConversationForUser,
  sendMessage,
  markConversationRead,
} from "@/lib/messaging/prismaMessageStore";
import { resolveMessagingUser } from "@/lib/messaging/resolveMessagingUser";
import {
  startConversation,
  startConversationHttpStatus,
} from "@/lib/messaging/startConversation";
import { youthSocialBlockPayload } from "@/lib/trustSafety/resolveYouthSocialSubject";

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } },
) {
  const user = await resolveMessagingUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });

  const bootstrap = await startConversation({
    senderId: user.id,
    recipientHandle: params.userId,
  });
  if (!bootstrap.ok) {
    return NextResponse.json(
      {
        error: bootstrap.error,
        code: bootstrap.code,
        eligibilityState: bootstrap.eligibilityState,
        recipientEligibilityState: bootstrap.recipientEligibilityState,
        messages: [],
      },
      { status: startConversationHttpStatus(bootstrap) },
    );
  }

  try {
    const thread = await getConversationForUser(bootstrap.threadId, user.id);
    if (!thread) return NextResponse.json({ messages: [], threadId: bootstrap.threadId });
    await markConversationRead(bootstrap.threadId, user.id);
    return NextResponse.json({
      threadId: bootstrap.threadId,
      messages: thread.messages.map((m) => ({
        id: m.id,
        fromId: m.senderId,
        fromName: m.senderName,
        text: m.body,
        timestamp: m.createdAt.getTime(),
      })),
    });
  } catch (err) {
    console.error("[api/social/messages GET]", err);
    return NextResponse.json({ error: "Unable to load messages", messages: [] }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string } },
) {
  const user = await resolveMessagingUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { text?: string; body?: string };
  const text = (body.text ?? body.body ?? "").trim();
  if (!text) {
    return NextResponse.json({ error: "text required", code: "MISSING_FIELDS" }, { status: 400 });
  }

  const bootstrap = await startConversation({
    senderId: user.id,
    recipientHandle: params.userId,
    previewBody: text,
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

  try {
    const msg = await sendMessage({
      conversationId: bootstrap.threadId,
      senderId: user.id,
      senderName: user.displayName,
      body: text,
      messageType: "text",
    });
    return NextResponse.json({
      ok: true,
      threadId: bootstrap.threadId,
      message: {
        id: msg.id,
        fromId: msg.senderId,
        text: msg.body,
        timestamp: msg.createdAt.getTime(),
      },
    });
  } catch (err) {
    const blocked = youthSocialBlockPayload(err);
    if (blocked) {
      return NextResponse.json(
        {
          ...blocked,
          code: blocked.code === "YOUTH_SOCIAL_BLOCKED" ? "AGE_POLICY_RESTRICTED" : blocked.code,
        },
        { status: 403 },
      );
    }
    console.error("[api/social/messages POST]", err);
    return NextResponse.json({ error: "Unable to send message", code: "SEND_FAILED" }, { status: 500 });
  }
}
