import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type NotificationType =
  | 'system' | 'room_joined' | 'room_started' | 'battle_result' | 'battle_invite'
  | 'tip_received' | 'tip_sent' | 'achievement' | 'follower' | 'mention'
  | 'ticket_confirmed' | 'payout' | 'subscription' | 'magazine_drop'
  | 'nft_sale' | 'beat_purchase' | 'moderation' | 'bot_alert';

interface TMINotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  ts: number;
  href?: string;
  emoji?: string;
}

// In-memory store per-process (replaces on next deploy; use DB for persistence)
const userNotifications = new Map<string, TMINotification[]>();

function getUserId(req: NextRequest): string {
  return req.cookies.get('tmi_session_id')?.value?.substring(0, 16) ?? 'guest';
}

function getOrInit(userId: string): TMINotification[] {
  if (!userNotifications.has(userId)) {
    // Seed with platform welcome notification
    userNotifications.set(userId, [
      {
        id: `notif-welcome-${userId}`,
        type: 'system',
        title: 'Welcome to TMI',
        body: 'Your account is active. Explore live rooms, join cyphers, and start earning.',
        priority: 'medium',
        read: false,
        ts: Date.now() - 60_000,
        href: '/home/1',
        emoji: '🎵',
      },
    ]);
  }
  return userNotifications.get(userId)!;
}

// GET /api/notifications — list notifications for current user
export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  const notifications = getOrInit(userId);
  const unreadCount = notifications.filter(n => !n.read).length;
  return NextResponse.json({ notifications, unreadCount });
}

// POST /api/notifications — push a new notification (internal use) or mark read
export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const action = body.action as string | undefined;

  if (action === 'mark_read') {
    const id = body.id as string;
    const store = getOrInit(userId);
    const n = store.find(x => x.id === id);
    if (n) n.read = true;
    return NextResponse.json({ ok: true });
  }

  if (action === 'mark_all_read') {
    const store = getOrInit(userId);
    store.forEach(n => { n.read = true; });
    return NextResponse.json({ ok: true });
  }

  if (action === 'push') {
    const store = getOrInit(userId);
    const newNotif: TMINotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: (body.type as NotificationType) ?? 'system',
      title: (body.title as string) ?? 'Notification',
      body: (body.body as string) ?? '',
      priority: (body.priority as TMINotification['priority']) ?? 'medium',
      read: false,
      ts: Date.now(),
      href: body.href as string | undefined,
      emoji: body.emoji as string | undefined,
    };
    store.unshift(newNotif);
    if (store.length > 200) store.length = 200;
    return NextResponse.json({ ok: true, notification: newNotif });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}

// DELETE /api/notifications — clear all notifications
export async function DELETE(req: NextRequest) {
  const userId = getUserId(req);
  userNotifications.set(userId, []);
  return NextResponse.json({ ok: true });
}
