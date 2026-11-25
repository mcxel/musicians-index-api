/**
 * Backstage / Green Room / Guest transport — server authority.
 *
 * SERVER-ONLY. Never import from client components.
 *
 * Owns the parts that must not be client-authoritative:
 *  - who the host is (live-session registry, not the request body)
 *  - durable guest invites (existing `room_invites` table, no new migration)
 *  - stage admission transitions (conditional updates — atomic per invite)
 *  - media rights: Daily meeting tokens for the PRIVATE backstage room and the stage room
 *
 * Whisper privacy is enforced by room isolation, not by mixer volume:
 * backstage audio lives in a separate private Daily room. Only BACKSTAGE guests
 * are ever issued a token for it. The stage performer (host) and the audience
 * never receive one, so they cannot join or subscribe to it.
 *
 * Promotion order (regular guest): backstage → live = conditional DB update →
 * eject from backstage room (whisper publication revoked) → guest then fetches a
 * stage token, which is only issued while status === "live".
 *
 * Policy remains Cursor's GuestAdmissionAuthority / BackstageGreenRoomAuthority;
 * this module is their durable, authenticated transport.
 */

import prisma from "@/lib/prisma";
import { ensureHydrated } from "@/lib/broadcast/GlobalLiveSessionRegistry.server";
import { getSessionByRoomId } from "@/lib/broadcast/globalLiveSessionStore";
import {
  createDailyRoom,
  createMeetingToken,
  deleteDailyRoom,
  ejectDailyParticipants,
  getDailyRoom,
} from "@/lib/video/DailyVideoEngine";
import { getOrCreateConversation, sendMessage } from "@/lib/messaging/prismaMessageStore";
import { backstageRightsFromQueue, isOnStageFromQueue } from "./ChallengerQueueService";
import { prismaQueueDb, resolveQueueRoomContext } from "./challengerQueueDb";

/** Guest camera consent (server-side). Any failure (incl. migration not applied) = no consent. */
async function guestCameraConsent(inviteId: string): Promise<boolean> {
  try {
    const rows = await prismaQueueDb.read.query<{ c: boolean }>(
      `SELECT camera_consent AS c FROM live_guest_media_consent WHERE invite_id = $1`,
      [inviteId],
    );
    return Boolean(rows[0]?.c);
  } catch {
    return false;
  }
}

/**
 * Guest records (or withdraws) camera consent. Withdrawal ejects the guest from
 * the backstage and stage calls so the reconnect token is audio-only.
 */
export async function setGuestCameraConsent(input: {
  callerId: string;
  inviteId: string;
  consent: boolean;
}): Promise<BackstageResult<{ inviteId: string; cameraConsent: boolean }>> {
  const inv = await loadInvite(input.inviteId);
  if (!inv) return fail("INVITE_NOT_FOUND");
  if (inv.recipientId !== input.callerId) return fail("NOT_RECIPIENT");
  if (inv.status !== "backstage" && inv.status !== "live") return fail("INVALID_STATE");
  try {
    await prismaQueueDb.read.query(
      `INSERT INTO live_guest_media_consent (invite_id, user_id, camera_consent, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (invite_id) DO UPDATE SET camera_consent = EXCLUDED.camera_consent, updated_at = NOW()`,
      [inv.id, inv.recipientId, input.consent],
    );
  } catch {
    return fail("MEDIA_UNAVAILABLE");
  }
  if (!input.consent) {
    await safeEject(backstageDailyRoomName(inv.roomId), [inv.recipientId]);
    if (inv.status === "live") await safeEject(inv.roomId, [inv.recipientId]);
  }
  return ok({ inviteId: inv.id, cameraConsent: input.consent });
}

/** Queue-derived media rights. Any failure (incl. migration not applied) = no rights. */
async function queueRightsFor(
  roomId: string,
  userId: string,
): Promise<{ backstageMember: boolean; cameraConsent: boolean; onStage: boolean }> {
  try {
    const ctx = await resolveQueueRoomContext(roomId);
    if (!ctx) return { backstageMember: false, cameraConsent: false, onStage: false };
    const [rights, onStage] = await Promise.all([
      backstageRightsFromQueue(prismaQueueDb.read, ctx, userId),
      isOnStageFromQueue(prismaQueueDb.read, ctx, userId),
    ]);
    return { backstageMember: rights.member, cameraConsent: rights.cameraConsent, onStage };
  } catch {
    return { backstageMember: false, cameraConsent: false, onStage: false };
  }
}

/** Durable status vocabulary stored in room_invites.status (free-text column). */
export type BackstageInviteDbStatus =
  | "pending"
  | "pending_instant"
  | "backstage"
  | "live"
  | "declined"
  | "cancelled"
  | "expired"
  | "removed"
  | "left";

export const BACKSTAGE_ACTIVE_STATUSES: BackstageInviteDbStatus[] = [
  "pending",
  "pending_instant",
  "backstage",
  "live",
];

export const BACKSTAGE_LIMITS = {
  /** Simultaneous on-stage guests (excludes the host). */
  maxLiveGuests: 3,
  /** Pending + backstage + live per room. */
  maxActiveInvites: 12,
  inviteTtlMs: 30 * 60 * 1000,
  /**
   * Token lifetime. Not eject-on-expiry (that would drop an on-stage guest
   * mid-show). Revocation is immediate server ejection; removal also bans the
   * user_id from both rooms so a still-valid token cannot be reused.
   */
  mediaTokenMinutes: 180,
} as const;

export type BackstageError =
  | "UNAUTHENTICATED"
  | "NOT_LIVE"
  | "NOT_HOST"
  | "NOT_RECIPIENT"
  | "SELF_INVITE"
  | "NOT_FRIENDS"
  | "CONTACT_BLOCKED"
  | "ALREADY_INVITED"
  | "TOO_MANY_INVITES"
  | "INVITE_NOT_FOUND"
  | "INVALID_STATE"
  | "EXPIRED"
  | "CONSENT_REQUIRED"
  | "STAGE_FULL"
  | "ROOM_NOT_PERSISTED"
  | "MEDIA_UNAVAILABLE"
  | "NO_MEDIA_RIGHTS";

export type BackstageResult<T> = { ok: true; value: T } | { ok: false; error: BackstageError };

const ok = <T>(value: T): BackstageResult<T> => ({ ok: true, value });
const fail = <T = never>(error: BackstageError): BackstageResult<T> => ({ ok: false, error });

export type BackstageInviteView = {
  inviteId: string;
  roomId: string;
  hostUserId: string;
  guestUserId: string;
  status: BackstageInviteDbStatus;
  instantOnAccept: boolean;
  createdAt: string;
};

/** Daily room names: [A-Za-z0-9_-], kept short. Stage room name === registry roomId (existing convention). */
export function backstageDailyRoomName(roomId: string): string {
  const slug = roomId.replace(/[^A-Za-z0-9_-]/g, "-").slice(0, 96);
  return `${BACKSTAGE_ROOM_PREFIX}${slug}`;
}

function view(row: {
  id: string;
  roomId: string;
  senderId: string;
  recipientId: string;
  status: string;
  createdAt: Date;
}): BackstageInviteView {
  const status = row.status as BackstageInviteDbStatus;
  return {
    inviteId: row.id,
    roomId: row.roomId,
    hostUserId: row.senderId,
    guestUserId: row.recipientId,
    status,
    instantOnAccept: status === "pending_instant",
    createdAt: row.createdAt.toISOString(),
  };
}

/** Host = owner of the currently registered live session for this room. */
async function resolveLiveHost(roomId: string): Promise<string | null> {
  await ensureHydrated().catch(() => undefined);
  return getSessionByRoomId(roomId)?.userId ?? null;
}

async function areAcceptedFriends(a: string, b: string): Promise<boolean> {
  const row = await prisma.friendship.findFirst({
    where: {
      status: "accepted",
      OR: [
        { requesterId: a, addresseeId: b },
        { requesterId: b, addresseeId: a },
      ],
    },
    select: { id: true },
  });
  return Boolean(row);
}

async function loadInvite(inviteId: string) {
  return prisma.roomInvite.findUnique({ where: { id: inviteId } });
}

/** Atomic transition: only succeeds if the row is still in one of `from`. */
async function transition(
  inviteId: string,
  from: BackstageInviteDbStatus[],
  to: BackstageInviteDbStatus,
  extra?: { acceptedAt?: Date; respondedAt?: Date },
): Promise<boolean> {
  const res = await prisma.roomInvite.updateMany({
    where: { id: inviteId, status: { in: from } },
    data: { status: to, ...extra },
  });
  return res.count === 1;
}

async function safeEject(roomName: string, userIds: string[], ban = false): Promise<void> {
  if (!process.env.DAILY_API_KEY) return;
  try {
    await ejectDailyParticipants(roomName, userIds, { ban });
  } catch (err) {
    // Not fatal: tokens are short and every token request re-checks status.
    console.error("[backstage] eject failed", roomName, err instanceof Error ? err.message : err);
  }
}

function isExpired(createdAt: Date, now: number): boolean {
  return now - createdAt.getTime() > BACKSTAGE_LIMITS.inviteTtlMs;
}

// ── Host actions ─────────────────────────────────────────────────────────────

export async function inviteGuest(input: {
  callerId: string;
  callerName: string;
  roomId: string;
  guestUserId: string;
  instantOnAccept: boolean;
}): Promise<BackstageResult<BackstageInviteView>> {
  const host = await resolveLiveHost(input.roomId);
  if (!host) return fail("NOT_LIVE");
  if (host !== input.callerId) return fail("NOT_HOST");
  if (input.guestUserId === input.callerId) return fail("SELF_INVITE");
  if (!(await areAcceptedFriends(input.callerId, input.guestUserId))) return fail("NOT_FRIENDS");

  const room = await prisma.room.findUnique({ where: { id: input.roomId }, select: { id: true } });
  if (!room) return fail("ROOM_NOT_PERSISTED");

  const active = await prisma.roomInvite.findMany({
    where: { roomId: input.roomId, senderId: host, status: { in: BACKSTAGE_ACTIVE_STATUSES } },
    select: { id: true, recipientId: true, status: true, createdAt: true },
  });
  const now = Date.now();
  const live = active.filter(
    (r) => !((r.status === "pending" || r.status === "pending_instant") && isExpired(r.createdAt, now)),
  );
  if (live.some((r) => r.recipientId === input.guestUserId)) return fail("ALREADY_INVITED");
  if (live.length >= BACKSTAGE_LIMITS.maxActiveInvites) return fail("TOO_MANY_INVITES");

  // Canonical messaging safety (blocks, teen/adult contact rules) gates the invite itself.
  let conversationId: string;
  try {
    const convo = await getOrCreateConversation({ userId: host, recipientId: input.guestUserId });
    conversationId = convo.id;
  } catch {
    return fail("CONTACT_BLOCKED");
  }

  const row = await prisma.roomInvite.create({
    data: {
      roomId: input.roomId,
      senderId: host,
      recipientId: input.guestUserId,
      status: input.instantOnAccept ? "pending_instant" : "pending",
    },
  });

  try {
    await sendMessage({
      conversationId,
      senderId: host,
      senderName: input.callerName,
      body: input.instantOnAccept
        ? "I'm live — accept to join me on stage."
        : "I'm live — accept to wait backstage and I'll bring you in.",
      messageType: "live_guest_invite",
      mediaUrl: `/live/rooms/${encodeURIComponent(input.roomId)}?guestInvite=${encodeURIComponent(row.id)}`,
    });
  } catch (err) {
    // The invite record is the source of truth; the DM is the delivery channel.
    console.error("[backstage] invite DM failed", err instanceof Error ? err.message : err);
  }

  return ok(view(row));
}

export async function cancelInvite(input: { callerId: string; inviteId: string }) {
  const inv = await loadInvite(input.inviteId);
  if (!inv) return fail("INVITE_NOT_FOUND");
  if (inv.senderId !== input.callerId) return fail("NOT_HOST");
  const moved = await transition(inv.id, ["pending", "pending_instant"], "cancelled", { respondedAt: new Date() });
  return moved ? ok({ inviteId: inv.id, status: "cancelled" as const }) : fail("INVALID_STATE");
}

async function countLiveGuests(roomId: string, hostId: string): Promise<number> {
  return prisma.roomInvite.count({ where: { roomId, senderId: hostId, status: "live" } });
}

/**
 * Bring a backstage guest on stage. Capacity is checked, then the conditional
 * update claims the slot; if a concurrent admit overfilled it, roll back.
 */
async function admitToStage(inv: { id: string; roomId: string; senderId: string; recipientId: string }) {
  if ((await countLiveGuests(inv.roomId, inv.senderId)) >= BACKSTAGE_LIMITS.maxLiveGuests) {
    return fail("STAGE_FULL");
  }
  const moved = await transition(inv.id, ["backstage"], "live");
  if (!moved) return fail("INVALID_STATE");
  if ((await countLiveGuests(inv.roomId, inv.senderId)) > BACKSTAGE_LIMITS.maxLiveGuests) {
    await transition(inv.id, ["live"], "backstage");
    return fail("STAGE_FULL");
  }
  // Revoke whisper publication before any stage token can be minted.
  await safeEject(backstageDailyRoomName(inv.roomId), [inv.recipientId]);
  return ok({ inviteId: inv.id, status: "live" as const, entranceCue: "REGULAR_GUEST" as const });
}

export async function bringGuestIn(input: { callerId: string; inviteId: string }) {
  const inv = await loadInvite(input.inviteId);
  if (!inv) return fail("INVITE_NOT_FOUND");
  const host = await resolveLiveHost(inv.roomId);
  if (!host) return fail("NOT_LIVE");
  if (host !== input.callerId || inv.senderId !== host) return fail("NOT_HOST");
  return admitToStage(inv);
}

export async function returnGuestBackstage(input: { callerId: string; inviteId: string }) {
  const inv = await loadInvite(input.inviteId);
  if (!inv) return fail("INVITE_NOT_FOUND");
  if (inv.senderId !== input.callerId) return fail("NOT_HOST");
  const moved = await transition(inv.id, ["live"], "backstage");
  if (!moved) return fail("INVALID_STATE");
  // Stage publication revoked; guest re-requests a backstage token.
  await safeEject(inv.roomId, [inv.recipientId]);
  return ok({ inviteId: inv.id, status: "backstage" as const });
}

export async function removeGuest(input: { callerId: string; inviteId: string }) {
  const inv = await loadInvite(input.inviteId);
  if (!inv) return fail("INVITE_NOT_FOUND");
  if (inv.senderId !== input.callerId) return fail("NOT_HOST");
  const moved = await transition(inv.id, ["pending", "pending_instant", "backstage", "live"], "removed", {
    respondedAt: new Date(),
  });
  if (!moved) return fail("INVALID_STATE");
  await safeEject(inv.roomId, [inv.recipientId], true);
  await safeEject(backstageDailyRoomName(inv.roomId), [inv.recipientId], true);
  return ok({ inviteId: inv.id, status: "removed" as const });
}

// ── Guest actions ────────────────────────────────────────────────────────────

export async function acceptInvite(input: {
  callerId: string;
  inviteId: string;
  /** Explicit consent to appear publicly. Required for instant admission. */
  consentToBroadcast: boolean;
}): Promise<BackstageResult<{ inviteId: string; status: "backstage" | "live"; instant: boolean }>> {
  const inv = await loadInvite(input.inviteId);
  if (!inv) return fail("INVITE_NOT_FOUND");
  if (inv.recipientId !== input.callerId) return fail("NOT_RECIPIENT");
  const host = await resolveLiveHost(inv.roomId);
  if (!host || host !== inv.senderId) return fail("NOT_LIVE");
  if (isExpired(inv.createdAt, Date.now())) {
    await transition(inv.id, ["pending", "pending_instant"], "expired");
    return fail("EXPIRED");
  }
  const wasInstant = inv.status === "pending_instant";
  const now = new Date();
  const moved = await transition(inv.id, ["pending", "pending_instant"], "backstage", {
    acceptedAt: now,
    respondedAt: now,
  });
  if (!moved) return fail("INVALID_STATE");

  // Instant admission never skips consent: without it the guest stays backstage.
  if (wasInstant && input.consentToBroadcast) {
    const admitted = await admitToStage(inv);
    if (admitted.ok) return ok({ inviteId: inv.id, status: "live" as const, instant: true });
    // Stage full → remain backstage, host can bring them in later.
  }
  return ok({ inviteId: inv.id, status: "backstage" as const, instant: false });
}

export async function declineInvite(input: { callerId: string; inviteId: string }) {
  const inv = await loadInvite(input.inviteId);
  if (!inv) return fail("INVITE_NOT_FOUND");
  if (inv.recipientId !== input.callerId) return fail("NOT_RECIPIENT");
  const moved = await transition(inv.id, ["pending", "pending_instant"], "declined", { respondedAt: new Date() });
  return moved ? ok({ inviteId: inv.id, status: "declined" as const }) : fail("INVALID_STATE");
}

export async function leaveAsGuest(input: { callerId: string; inviteId: string }) {
  const inv = await loadInvite(input.inviteId);
  if (!inv) return fail("INVITE_NOT_FOUND");
  if (inv.recipientId !== input.callerId) return fail("NOT_RECIPIENT");
  const moved = await transition(inv.id, ["backstage", "live"], "left", { respondedAt: new Date() });
  if (!moved) return fail("INVALID_STATE");
  await safeEject(inv.roomId, [inv.recipientId]);
  await safeEject(backstageDailyRoomName(inv.roomId), [inv.recipientId]);
  return ok({ inviteId: inv.id, status: "left" as const });
}

// ── Listing ──────────────────────────────────────────────────────────────────

export async function listInvites(input: { callerId: string; roomId: string }) {
  const host = await resolveLiveHost(input.roomId);
  if (!host) return fail("NOT_LIVE");
  const isHost = host === input.callerId;
  const rows = await prisma.roomInvite.findMany({
    where: {
      roomId: input.roomId,
      senderId: host,
      status: { in: BACKSTAGE_ACTIVE_STATUSES },
      ...(isHost ? {} : { recipientId: input.callerId }),
    },
    orderBy: { createdAt: "asc" },
  });
  const now = Date.now();
  return ok({
    isHost,
    invites: rows
      .filter((r) => !((r.status === "pending" || r.status === "pending_instant") && isExpired(r.createdAt, now)))
      .map(view),
  });
}

// ── Media rights (Daily tokens) ──────────────────────────────────────────────

export type BackstageMediaGrant = {
  kind: "backstage" | "stage";
  roomName: string;
  roomUrl: string;
  token: string;
};

/** Reserved prefix — /api/video/rooms refuses to create rooms under it. */
export const BACKSTAGE_ROOM_PREFIX = "tmi-bs-";

/**
 * The backstage room must be private. A same-named room that is not private
 * (e.g. pre-created by someone else) is deleted — ejecting anyone in it — and
 * recreated private, so whisper can never land in an attacker-owned room.
 */
async function ensurePrivateRoom(name: string): Promise<{ url: string } | null> {
  const existing = await getDailyRoom(name);
  if (existing && existing.privacy === "private") return existing;
  if (existing) await deleteDailyRoom(name);
  try {
    return await createDailyRoom({ name, privacy: "private", maxParticipants: 16, expiresInMinutes: 12 * 60 });
  } catch {
    return getDailyRoom(name);
  }
}

/**
 * Issue a media token. The ONLY path by which a guest gets send rights:
 *  - kind "backstage": caller's invite must be `backstage`. The host is refused
 *    (the stage performer must never hear whisper).
 *  - kind "stage": caller's invite must be `live`.
 * Called again on reconnect; status is re-checked every time.
 */
export async function issueMediaToken(input: {
  callerId: string;
  callerName: string;
  roomId: string;
  kind: "backstage" | "stage";
}): Promise<BackstageResult<BackstageMediaGrant>> {
  const host = await resolveLiveHost(input.roomId);
  if (!host) return fail("NOT_LIVE");
  if (input.callerId === host) return fail("NO_MEDIA_RIGHTS");

  // Rights come from exactly two durable sources: a guest invite, or challenger
  // queue membership. Performer role alone never grants backstage or stage media.
  const required: BackstageInviteDbStatus = input.kind === "backstage" ? "backstage" : "live";
  const inv = await prisma.roomInvite.findFirst({
    where: { roomId: input.roomId, senderId: host, recipientId: input.callerId, status: required },
    select: { id: true },
  });

  // Video requires durable camera consent for guests too — never a browser checkbox alone.
  let canSend: Array<"audio" | "video"> | null = inv
    ? (await guestCameraConsent(inv.id))
      ? ["audio", "video"]
      : ["audio"]
    : null;
  if (!canSend) {
    const queue = await queueRightsFor(input.roomId, input.callerId);
    if (input.kind === "backstage" && queue.backstageMember) {
      // Camera consent is enforced at the SFU: without it the token cannot send video.
      canSend = queue.cameraConsent ? ["audio", "video"] : ["audio"];
    } else if (input.kind === "stage" && queue.onStage) {
      canSend = ["audio", "video"];
    }
  }
  if (!canSend) return fail("NO_MEDIA_RIGHTS");
  if (!process.env.DAILY_API_KEY) return fail("MEDIA_UNAVAILABLE");

  const roomName = input.kind === "backstage" ? backstageDailyRoomName(input.roomId) : input.roomId;
  const room = input.kind === "backstage" ? await ensurePrivateRoom(roomName) : await getDailyRoom(roomName);
  if (!room) return fail("MEDIA_UNAVAILABLE");

  const token = await createMeetingToken(roomName, {
    userId: input.callerId,
    userName: input.callerName,
    isOwner: false,
    canSend,
    // Camera and mic start off; the client turns them on only after consent.
    startVideoOff: true,
    startAudioOff: true,
    expiresInMinutes: BACKSTAGE_LIMITS.mediaTokenMinutes,
  });
  return ok({ kind: input.kind, roomName, roomUrl: room.url, token: token.token });
}
