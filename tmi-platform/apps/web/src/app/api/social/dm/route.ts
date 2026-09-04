/**
 * /api/social/dm — Direct Message API (legacy path)
 * Converged onto canonical startConversation + prisma message store.
 * Prefer /api/messages for new callers.
 *
 * GET  ?threadId=xxx  — list messages in thread
 * GET  ?inbox=1       — list all threads for current user
 * POST { toUserId, text }  — bootstrap + send via startConversation
 * POST { threadId, action:'read' } — mark thread as read
 */
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import {
  listConversationsForUser,
  getConversationForUser,
  sendMessage,
  markConversationRead,
  resolveParticipants,
  unreadCountForUser,
} from "@/lib/messaging/prismaMessageStore";
import { resolveMessagingUser } from "@/lib/messaging/resolveMessagingUser";
import {
  startConversation,
  startConversationHttpStatus,
} from "@/lib/messaging/startConversation";
import { youthSocialBlockPayload } from "@/lib/trustSafety/resolveYouthSocialSubject";

export async function GET(req: NextRequest) {
  const user = await resolveMessagingUser(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const url = new URL(req.url);
  const inbox = url.searchParams.get("inbox");
  const threadId = url.searchParams.get("threadId");

  if (inbox) {
    try {
      const convos = await listConversationsForUser(user.id);
      const threads = [];
      for (const c of convos) {
        const participants = await resolveParticipants(c.participantIds);
        const msgsAsc = [...c.messages].reverse();
        const last = msgsAsc[msgsAsc.length - 1] ?? null;
        threads.push({
          threadId: c.id,
          participants,
          lastMessage: last
            ? {
                messageId: last.id,
                senderId: last.senderId,
                body: last.body,
                createdAt: last.createdAt.toISOString(),
              }
            : null,
          unreadCount: unreadCountForUser(c.messages, user.id),
          updatedAt: c.updatedAt.toISOString(),
        });
      }
      return NextResponse.json({ threads });
    } catch (err) {
      console.error("[api/social/dm GET inbox]", err);
      return NextResponse.json({ error: "Unable to load inbox", threads: [] }, { status: 500 });
    }
  }

  if (threadId) {
    try {
      const thread = await getConversationForUser(threadId, user.id);
      if (!thread) return NextResponse.json({ error: "Thread not found" }, { status: 404 });
      await markConversationRead(threadId, user.id);
      return NextResponse.json({
        threadId: thread.id,
        messages: thread.messages.map((m) => ({
          id: m.id,
          fromId: m.senderId,
          fromName: m.senderName,
          text: m.body,
          timestamp: m.createdAt.getTime(),
        })),
      });
    } catch (err) {
      console.error("[api/social/dm GET thread]", err);
      return NextResponse.json({ error: "Unable to load messages" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Provide ?inbox=1 or ?threadId=xxx" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const user = await resolveMessagingUser(req);
  if (!user) return NextResponse.json({ error: "Not authenticated", code: "UNAUTHORIZED" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const { toUserId, text, threadId: incomingThreadId, action } = body;

  if (action === "read" && incomingThreadId) {
    await markConversationRead(incomingThreadId as string, user.id);
    return NextResponse.json({ ok: true });
  }

  if (!toUserId || !text) {
    return NextResponse.json({ error: "toUserId and text required", code: "MISSING_FIELDS" }, { status: 400 });
  }

  const bootstrap = await startConversation({
    senderId: user.id,
    recipientHandle: String(toUserId),
    previewBody: String(text),
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
      body: String(text).trim(),
      messageType: "text",
    });
    return NextResponse.json({
      ok: true,
      threadId: bootstrap.threadId,
      created: bootstrap.created,
      message: {
        id: msg.id,
        fromId: msg.senderId,
        text: msg.body,
        timestamp: msg.createdAt.getTime(),
        threadId: bootstrap.threadId,
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
    console.error("[api/social/dm POST]", err);
    return NextResponse.json({ error: "Unable to send message", code: "SEND_FAILED" }, { status: 500 });
  }
}
