export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import {
  getAudienceSnapshot,
  getVenueOccupancy,
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
  assignNextSeat,
} from "@/lib/live/audienceRuntimeEngine";
import { isAnchorSlug } from "@/lib/live/AnchorRoomRegistry";
import {
  findOccupancySlugForUser,
  forgetAttendeePlacement,
  rebalanceParticipants,
  rememberAttendeePlacement,
  resolveJoinTarget,
} from "@/lib/live/ElasticRoomOrchestrator";
import { emitAdminLiveEvent } from "@/lib/admin/AdminLiveEventEngine";
import { participationEconomyEngine } from "@/lib/economy/ParticipationEconomyEngine";
import { prisma } from "@/lib/prisma";
import { getActiveSessions, updateViewerCount, endLiveSession } from "@/lib/broadcast/globalLiveSessionStore";
import { removeSessionNow, ensureHydrated } from "@/lib/broadcast/GlobalLiveSessionRegistry.server";
import type { AudienceMember } from "@/lib/live/audienceRuntimeEngine";
import { datingAccessPayload, isDatingExperience } from "@/lib/trustSafety/DatingExperiencePolicy";
import { evaluateDatingJoinForUserId } from "@/lib/trustSafety/datingExperienceGuard";
import { countHumanAttendance } from "@/lib/venues/venuePresenceMetrics";

// Bridge: audienceRuntimeEngine tracks real per-venue occupancy (joins/leaves),
// but GlobalLiveSessionRegistry — the source every discovery surface (Home 1/3,
// LiveLobbyWallCanister, MixedLobbyWall) reads viewerCount from — only changes
// when a session is explicitly pinged. Without this, a real audience join/leave
// never moves the viewer count shown anywhere on the platform. Match on
// roomId === venueSlug since both the ad-hoc go-live roomId and the fixed
// venue ids (cypher, battle-arena, etc.) are passed as venueSlug by callers.
//
// Rule 20 / DiscoveryPublisher contract: viewerCount === humans only.
// Seeded support bots must never inflate Lobby Wall / Home / media-player counts.
function humanPresentCount(occupancy: { members: AudienceMember[] }): number {
  return countHumanAttendance(occupancy.members.filter((m) => m.active));
}

function syncViewerCountToBroadcastRegistry(
  venueSlug: string,
  occupancy: { members: AudienceMember[] },
  aliasSlug?: string | null,
): void {
  const humans = humanPresentCount(occupancy);
  const slugs = new Set([venueSlug, aliasSlug].filter(Boolean) as string[]);
  for (const slug of slugs) {
    const session = getActiveSessions().find((s) => s.roomId === slug);
    if (session) updateViewerCount(session.userId, humans);
  }
}

function hasModeratorAccess(req: NextRequest): boolean {
  const role = (req.cookies.get('tmi_role')?.value ?? '').toLowerCase();
  return ['performer', 'artist', 'host', 'admin', 'superadmin', 'venue'].includes(role);
}

function actorId(req: NextRequest): string {
  const sid = req.cookies.get('tmi_session_id')?.value ?? 'unknown';
  return sid.slice(0, 8) || 'unknown';
}

async function resolveAuthedUserId(req: NextRequest): Promise<string | null> {
  const email = req.cookies.get('tmi_user_email')?.value;
  if (email) {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } }).catch(() => null);
    if (user?.id) return user.id;
  }

  const sid = req.cookies.get('tmi_session_id')?.value;
  return sid ? sid.slice(0, 8) : null;
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
      case "join": {
        if (!member) return NextResponse.json({ error: "member required" }, { status: 400 });
        const datingRef = { slug: venueSlug, id: venueSlug, roomId: venueSlug };
        if (isDatingExperience(datingRef)) {
          const datingUserId = await resolveAuthedUserId(req);
          const decision = await evaluateDatingJoinForUserId(datingUserId ?? "", datingRef);
          if (!decision.allowed) {
            return NextResponse.json(datingAccessPayload(decision), { status: 403 });
          }
        }
        let joinSlug = venueSlug;
        let meshKey: string | null = null;
        let isOverflow = false;
        let parentAnchorSlug: string | null = null;
        try {
          const target = resolveJoinTarget(venueSlug);
          joinSlug = target.slug;
          meshKey = target.meshKey;
          isOverflow = target.isOverflow;
          parentAnchorSlug = target.parentAnchorSlug;
        } catch {
          /* keep requested slug if orchestrator cannot resolve */
        }
        const assignedSeatId = member.seatId ?? assignNextSeat(joinSlug, member.groupId ?? null);
        const occupancy = joinAudience(joinSlug, { ...member, seatId: assignedSeatId });
        syncViewerCountToBroadcastRegistry(joinSlug, occupancy, venueSlug !== joinSlug ? venueSlug : null);

        const placement = rememberAttendeePlacement({
          userId: member.userId,
          slug: joinSlug,
          seatId: assignedSeatId,
          meshKey,
          parentAnchorSlug,
        });

        // Dual overflow systems: Elastic handles AnchorRoomRegistry slugs.
        // AnchorRoomNetwork still covers its own roomId scheme only.
        try {
          const { maybeSpawnOverflowRoom, isAnchorRoomId } = await import(
            "@/lib/live/AnchorRoomNetwork"
          );
          if (!isAnchorSlug(venueSlug) && isAnchorRoomId(venueSlug)) {
            maybeSpawnOverflowRoom(venueSlug);
          }
        } catch {
          /* non-fatal */
        }

        const authedUserId = await resolveAuthedUserId(req);
        if (authedUserId) {
          const role = (req.cookies.get('tmi_role')?.value ?? '').toLowerCase();
          if (role === 'performer' || role === 'artist') {
            participationEconomyEngine.earn(authedUserId, 'performer', 'audience_engagement', {
              venueSlug: joinSlug,
              seatId: assignedSeatId,
            });
          } else {
            participationEconomyEngine.earn(authedUserId, 'fan', 'join_live_room', {
              venueSlug: joinSlug,
              seatId: assignedSeatId,
            });
          }
        }

        return NextResponse.json({
          ...occupancy,
          assignedSeatId,
          assignedSlug: joinSlug,
          meshKey,
          meshSeatId: meshKey ? `${meshKey}:${assignedSeatId}` : assignedSeatId,
          isOverflow,
          parentAnchorSlug,
          attendeeIdentity: {
            eventId: placement.eventId,
            meshId: placement.meshId,
            environmentId: placement.environmentId,
            clusterId: placement.clusterId,
            auditoriumId: placement.auditoriumId,
            sectionOrZone: placement.sectionOrZone,
            seat: placement.seatId,
          },
        });
      }
      case "leave": {
        if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

        const leaveSlug = findOccupancySlugForUser(userId, venueSlug);
        const occupancyBeforeLeave = getVenueOccupancy(leaveSlug);
        const leavingMember = occupancyBeforeLeave.members.find((m) => m.userId === userId);
        const leavingRole = leavingMember?.role ?? "fan";

        const afterLeave = leaveAudience(leaveSlug, userId);
        syncViewerCountToBroadcastRegistry(leaveSlug, afterLeave, venueSlug !== leaveSlug ? venueSlug : null);
        forgetAttendeePlacement(userId);

        try {
          rebalanceParticipants();
        } catch {
          /* non-fatal */
        }

        try {
          const { coolEmptyOverflowRooms } = await import("@/lib/live/AnchorRoomNetwork");
          coolEmptyOverflowRooms();
        } catch {
          /* non-fatal */
        }

        // Auto-close only when the published host/artist leaves occupancy.
        // Empty audience must NOT end a GO LIVE registry session — host ends via
        // END LIVE / DELETE /api/live/go (media-player host may never sit in audience).
        const performerLeft = leavingRole === "artist" || leavingRole === "host";

        let sessionEnded = false;
        if (performerLeft) {
          await ensureHydrated();
          const matchedSession = getActiveSessions().find((s) => s.userId === userId);
          if (matchedSession) {
            endLiveSession(matchedSession.userId);
            await removeSessionNow(matchedSession.userId).catch(() => {});
            sessionEnded = true;
          }
        }

        return NextResponse.json({
          ...afterLeave,
          sessionEnded,
          leftSlug: leaveSlug,
        });
      }
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
