/**
 * /api/social/dm — Direct Message API
 * GET  ?threadId=xxx  — list messages in thread
 * GET  ?inbox=1       — list all threads for current user
 * POST { toUserId, text }  — send a message
 * POST { threadId, action:'read' } — mark thread as read
 */
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import MessagePersistenceEngine from '@/lib/social/MessagePersistenceEngine';

export async function GET(req: NextRequest) {
  const userId = req.cookies.get('tmi_session_id')?.value?.substring(0, 16);
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const url = new URL(req.url);
  const inbox = url.searchParams.get('inbox');
  const threadId = url.searchParams.get('threadId');

  if (inbox) {
    const threads = await MessagePersistenceEngine.getInbox(userId);
    return NextResponse.json({ threads });
  }

  if (threadId) {
    const messages = await MessagePersistenceEngine.getMessages(threadId, 50);
    await MessagePersistenceEngine.markThreadAsRead(threadId, userId);
    return NextResponse.json({ messages, threadId });
  }

  return NextResponse.json({ error: 'Provide ?inbox=1 or ?threadId=xxx' }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const fromUserId = req.cookies.get('tmi_session_id')?.value?.substring(0, 16);
  if (!fromUserId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const { toUserId, text, threadId: incomingThreadId, action } = body;

  if (action === 'read' && incomingThreadId) {
    await MessagePersistenceEngine.markThreadAsRead(incomingThreadId as string, fromUserId);
    return NextResponse.json({ ok: true });
  }

  if (!toUserId || !text) {
    return NextResponse.json({ error: 'toUserId and text required' }, { status: 400 });
  }

  const msg = await MessagePersistenceEngine.sendMessage(fromUserId, toUserId as string, text as string);

  return NextResponse.json({ ok: true, message: msg, threadId: msg.threadId });
}
