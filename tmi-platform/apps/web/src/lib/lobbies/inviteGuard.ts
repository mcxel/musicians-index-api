// ── Invite Guard — anti-abuse rules for lobby invite queue ───────────────────

import { enforceAdultTeenContactBlock } from "@/lib/safety/AdultTeenContactBlocker";
import type { SafetyAgeClass } from "@/lib/safety/TeenMessagingPolicyEngine";

export type InviteRole = "fan" | "performer" | "host" | "vip";

export type InviteRecord = {
  id: string;
  roomId: string;
  senderId: string;
  recipientId: string;
  recipientName: string;
  role: InviteRole;
  sentAt: number;
  status: "pending" | "accepted" | "declined" | "expired";
};

export type InviteGuardResult = {
  allowed: boolean;
  reason: string;
};

// ── Config ────────────────────────────────────────────────────────────────────
const MAX_PENDING_PER_SENDER = 10;
const INVITE_COOLDOWN_MS = 30_000;           // 30s between invites (non-host)
const HOST_COOLDOWN_MS = 0;                  // hosts have no cooldown
const INVITE_EXPIRY_MS = 30 * 60_000;        // invites expire after 30 min
const VIP_HOST_ONLY = true;                  // VIP role invites require host

// ── In-memory stores ──────────────────────────────────────────────────────────
// inviteStore: roomId → InviteRecord[]
const inviteStore = new Map<string, InviteRecord[]>();

// lastInviteTime: `${roomId}:${senderId}` → timestamp
const lastInviteTime = new Map<string, number>();

// hostRegistry: `${roomId}:${userId}` → true
const hostRegistry = new Set<string>();

// ── Host management ───────────────────────────────────────────────────────────
export function registerHost(roomId: string, userId: string): void {
  hostRegistry.add(`${roomId}:${userId}`);
}

export function isHost(roomId: string, userId: string): boolean {
  return hostRegistry.has(`${roomId}:${userId}`);
}

// ── Internal helpers ──────────────────────────────────────────────────────────
function getRoomInvites(roomId: string): InviteRecord[] {
  if (!inviteStore.has(roomId)) inviteStore.set(roomId, []);
  return inviteStore.get(roomId)!;
}

function pruneExpiredInvites(roomId: string): void {
  const now = Date.now();
  const invites = getRoomInvites(roomId);
  const pruned = invites.map((inv) =>
    inv.status === "pending" && now - inv.sentAt > INVITE_EXPIRY_MS
      ? { ...inv, status: "expired" as const }
      : inv,
  );
  inviteStore.set(roomId, pruned);
}

// ── Core guard ────────────────────────────────────────────────────────────────

/**
 * Check whether a sender is allowed to send an invite.
 * Enforces: cooldown, max-pending, duplicate, VIP-host-only.
 */
export function checkInviteAllowed(
  roomId: string,
  senderId: string,
  recipientId: string,
  role: InviteRole,
  actorAgeClass: SafetyAgeClass = "unknown",
  targetAgeClass: SafetyAgeClass = "unknown",
): InviteGuardResult {
  pruneExpiredInvites(roomId);

  const safety = enforceAdultTeenContactBlock({
    source: `invite-guard:${roomId}`,
    channel: "party_invite",
    actor: {
      userId: senderId,
      ageClass: actorAgeClass,
      familyVerified: true,
      guardianApproved: true,
    },
    target: {
      userId: recipientId,
      ageClass: targetAgeClass,
      familyMember: true,
      guardianLink: true,
    },
  });

  if (!safety.allowed) {
    return { allowed: false, reason: safety.reason };
  }

  const host = isHost(roomId, senderId);
  const now = Date.now();

  // VIP invites require host authority
  if (role === "vip" && VIP_HOST_ONLY && !host) {
    return { allowed: false, reason: "Only hosts can invite users as VIP" };
  }

  // Cooldown check (hosts bypass)
  const cooldown = host ? HOST_COOLDOWN_MS : INVITE_COOLDOWN_MS;
  if (cooldown > 0) {
    const lastSent = lastInviteTime.get(`${roomId}:${senderId}`) ?? 0;
    const elapsed = now - lastSent;
    if (elapsed < cooldown) {
      const remaining = Math.ceil((cooldown - elapsed) / 1000);
      return { allowed: false, reason: `Cooldown active — wait ${remaining}s before sending another invite` };
    }
  }

  const invites = getRoomInvites(roomId);
  const pending = invites.filter((i) => i.senderId === senderId && i.status === "pending");

  // Max pending invites per sender
  if (pending.length >= MAX_PENDING_PER_SENDER) {
    return { allowed: false, reason: `Maximum ${MAX_PENDING_PER_SENDER} pending invites reached — wait for responses` };
  }

  // Duplicate prevention: recipient already has a pending invite from this sender
  const duplicate = pending.find((i) => i.recipientId === recipientId);
  if (duplicate) {
    return { allowed: false, reason: `${recipientId} already has a pending invite from you` };
  }

  return { allowed: true, reason: "Invite allowed" };
}

/**
 * Send an invite after guard check passes.
 * Returns the new InviteRecord or throws if guard rejected.
 */
export function sendInvite(
  roomId: string,
  senderId: string,
  recipientId: string,
  recipientName: string,
  role: InviteRole,
  actorAgeClass: SafetyAgeClass = "unknown",
  targetAgeClass: SafetyAgeClass = "unknown",
): InviteRecord {
  const guard = checkInviteAllowed(roomId, senderId, recipientId, role, actorAgeClass, targetAgeClass);
  if (!guard.allowed) throw new Error(guard.reason);

  const invite: InviteRecord = {
    id: `inv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    roomId,
    senderId,
    recipientId,
    recipientName,
    role,
    sentAt: Date.now(),
    status: "pending",
  };

  const invites = getRoomInvites(roomId);
  invites.push(invite);
  lastInviteTime.set(`${roomId}:${senderId}`, Date.now());

  return invite;
}

/** Accept an invite by its ID. */
export function acceptInvite(roomId: string, inviteId: string, userId: string): boolean {
  const invites = getRoomInvites(roomId);
  const invite = invites.find((i) => i.id === inviteId && i.recipientId === userId && i.status === "pending");
  if (!invite) return false;
  invite.status = "accepted";
  return true;
}

/** Decline an invite by its ID. */
export function declineInvite(roomId: string, inviteId: string, userId: string): boolean {
  const invites = getRoomInvites(roomId);
  const invite = invites.find((i) => i.id === inviteId && i.recipientId === userId && i.status === "pending");
  if (!invite) return false;
  invite.status = "declined";
  return true;
}

/** Get all pending invites for a room (host view). */
export function getRoomPendingInvites(roomId: string): InviteRecord[] {
  pruneExpiredInvites(roomId);
  return getRoomInvites(roomId).filter((i) => i.status === "pending");
}

/** Get pending invites for a specific recipient. */
export function getInvitesForRecipient(roomId: string, userId: string): InviteRecord[] {
  pruneExpiredInvites(roomId);
  return getRoomInvites(roomId).filter((i) => i.recipientId === userId && i.status === "pending");
}

/** Host can revoke any pending invite. */
export function revokeInvite(roomId: string, inviteId: string, revokedBy: string): boolean {
  if (!isHost(roomId, revokedBy)) return false;
  const invites = getRoomInvites(roomId);
  const invite = invites.find((i) => i.id === inviteId && i.status === "pending");
  if (!invite) return false;
  invite.status = "declined";
  return true;
}

/** Get invite stats for a room (for host dashboard). */
export function getRoomInviteStats(roomId: string): {
  pending: number;
  accepted: number;
  declined: number;
  expired: number;
} {
  pruneExpiredInvites(roomId);
  const invites = getRoomInvites(roomId);
  return {
    pending: invites.filter((i) => i.status === "pending").length,
    accepted: invites.filter((i) => i.status === "accepted").length,
    declined: invites.filter((i) => i.status === "declined").length,
    expired: invites.filter((i) => i.status === "expired").length,
  };
}
