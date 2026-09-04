import { NextRequest, NextResponse } from "next/server";
import {
  clearNotifications,
  getOrInitNotifications,
  pushStoredNotification,
  type NotificationType,
} from "@/lib/notifications/notificationStore";

export const dynamic = "force-dynamic";

function getUserId(req: NextRequest): string {
  const internal = req.headers.get("x-tmi-internal-user")?.trim();
  if (internal) return internal;
  // tmi_session_id is the durable user id (see /api/auth/session) — do not truncate
  return req.cookies.get("tmi_session_id")?.value ?? "guest";
}

function resolveStoreKey(req: NextRequest, bodyUserId?: unknown): string {
  if (typeof bodyUserId === "string" && bodyUserId.trim()) {
    return bodyUserId.trim();
  }
  return getUserId(req);
}

export async function GET(req: NextRequest) {
  const userId = resolveStoreKey(req, req.nextUrl.searchParams.get("userId"));
  const notifications = getOrInitNotifications(userId);
  const unreadCount = notifications.filter((n) => !n.seen).length;
  return NextResponse.json({ notifications, unreadCount });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const action = body.action as string | undefined;
  const userId = resolveStoreKey(req, body.targetUserId);

  if (action === "mark_read") {
    const id = body.id as string;
    const store = getOrInitNotifications(userId);
    const n = store.find((x) => x.id === id);
    if (n) {
      n.read = true;
      n.seen = true;
    }
    return NextResponse.json({ ok: true });
  }

  if (action === "mark_all_seen") {
    getOrInitNotifications(userId).forEach((n) => {
      n.seen = true;
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "mark_all_read") {
    getOrInitNotifications(userId).forEach((n) => {
      n.read = true;
      n.seen = true;
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "push") {
    try {
      const notification = pushStoredNotification(userId, {
        type: (body.type as NotificationType) ?? "system",
        title: (body.title as string) ?? "Notification",
        body: (body.body as string) ?? "",
        priority: (body.priority as "low" | "medium" | "high" | "critical") ?? "medium",
        href: body.href as string | undefined,
        emoji: body.emoji as string | undefined,
      });
      return NextResponse.json({ ok: true, notification });
    } catch (err) {
      return NextResponse.json(
        { ok: false, error: err instanceof Error ? err.message : "push failed" },
        { status: 400 },
      );
    }
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  const userId = getUserId(req);
  clearNotifications(userId);
  return NextResponse.json({ ok: true });
}
