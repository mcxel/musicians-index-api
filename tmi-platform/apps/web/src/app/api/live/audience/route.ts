export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import {
  getAudienceSnapshot,
  joinAudience,
  leaveAudience,
  listAllOccupancies,
  getAudienceMessages,
  postAudienceMessage,
  setAudienceCaptureEnabled,
  updateAudienceViewpoint,
  validateAudienceMessage,
  setVenueSlowMode,
  muteAudienceMember,
  unmuteAudienceMember,
} from "@/lib/live/audienceRuntimeEngine";
import { emitAdminLiveEvent } from "@/lib/admin/AdminLiveEventEngine";
import type { AudienceMember } from "@/lib/live/audienceRuntimeEngine";

function hasModeratorAccess(req: NextRequest): boolean {
  const role = (req.cookies.get('tmi_role')?.value ?? '').toLowerCase();
  return ['performer', 'artist', 'host', 'admin', 'superadmin', 'venue'].includes(role);
}

function actorId(req: NextRequest): string {
  const sid = req.cookies.get('tmi_session_id')?.value ?? 'unknown';
  return sid.slice(0, 8) || 'unknown';
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const venue = searchParams.get("venue");
  const includeMessages = searchParams.get("messages") === "1";
  if (venue) {
    return NextResponse.json({
      ...getAudienceSnapshot(venue),
      messages: includeMessages ? getAudienceMessages(venue) : undefined,
    });
  }
  return NextResponse.json(listAllOccupancies());
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, venueSlug, member, userId, text, displayName, yaw, pitch, captureEnabled, slowModeSeconds, targetUserId } = body as {
      action: string;
      venueSlug: string;
      member?: Omit<AudienceMember, "joinedAt" | "active">;
      userId?: string;
      text?: string;
      displayName?: string;
      yaw?: number;
      pitch?: number;
      captureEnabled?: boolean;
      targetUserId?: string;
      slowModeSeconds?: number;
      moderationAction?: string;
    };

    if (!venueSlug) return NextResponse.json({ error: "venueSlug required" }, { status: 400 });

    switch (action) {
      case "join":
        if (!member) return NextResponse.json({ error: "member required" }, { status: 400 });
        return NextResponse.json(joinAudience(venueSlug, member));
      case "leave":
        if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
        return NextResponse.json(leaveAudience(venueSlug, userId));
      case "message":
        if (!userId || !text) return NextResponse.json({ error: "userId and text required" }, { status: 400 });
        const validation = validateAudienceMessage(venueSlug, userId, text);
        if (!validation.ok) {
          emitAdminLiveEvent({
            type: 'alert',
            message: `Arena chat blocked in ${venueSlug}: ${validation.reason ?? 'unknown reason'}`,
            meta: {
              venueSlug,
              userId,
              reason: validation.reason ?? 'unknown',
            },
          });
          const status = validation.reason === "Rate limit exceeded" ? 429 : 400;
          return NextResponse.json({ error: validation.reason }, { status });
        }
        return NextResponse.json({
          ok: true,
          messages: postAudienceMessage(venueSlug, {
            userId,
            displayName: displayName ?? userId,
            text: validation.cleanText,
          }),
        });
      case "viewpoint":
        if (!userId || typeof yaw !== "number" || typeof pitch !== "number") {
          return NextResponse.json({ error: "userId, yaw, pitch required" }, { status: 400 });
        }
        return NextResponse.json(updateAudienceViewpoint(venueSlug, userId, yaw, pitch));
      case "capture":
        if (!userId || typeof captureEnabled !== "boolean") {
          return NextResponse.json({ error: "userId and captureEnabled required" }, { status: 400 });
        }
        return NextResponse.json(setAudienceCaptureEnabled(venueSlug, userId, captureEnabled));
      case "moderation": {
        if (!hasModeratorAccess(req)) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        const moderationAction = typeof body.moderationAction === 'string' ? body.moderationAction : '';
        const role = (req.cookies.get('tmi_role')?.value ?? 'unknown').toLowerCase();
        const moderator = actorId(req);
        if (moderationAction === 'slow-mode') {
          const seconds = typeof slowModeSeconds === 'number' ? slowModeSeconds : 0;
          const policy = setVenueSlowMode(venueSlug, seconds * 1000);
          emitAdminLiveEvent({
            type: 'arena_moderation',
            message: `Slow mode updated to ${seconds}s in ${venueSlug}`,
            meta: {
              venueSlug,
              moderator,
              role,
              slowModeSeconds: seconds,
            },
          });
          return NextResponse.json(policy);
        }
        if (moderationAction === 'mute' && targetUserId) {
          const policy = muteAudienceMember(venueSlug, targetUserId);
          emitAdminLiveEvent({
            type: 'arena_moderation',
            message: `User ${targetUserId} muted in ${venueSlug}`,
            meta: {
              venueSlug,
              moderator,
              role,
              targetUserId,
              action: 'mute',
            },
          });
          return NextResponse.json(policy);
        }
        if (moderationAction === 'unmute' && targetUserId) {
          const policy = unmuteAudienceMember(venueSlug, targetUserId);
          emitAdminLiveEvent({
            type: 'arena_moderation',
            message: `User ${targetUserId} unmuted in ${venueSlug}`,
            meta: {
              venueSlug,
              moderator,
              role,
              targetUserId,
              action: 'unmute',
            },
          });
          return NextResponse.json(policy);
        }
        return NextResponse.json({ error: 'Invalid moderation action' }, { status: 400 });
      }
      default:
        return NextResponse.json({ error: "unknown action" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
}
