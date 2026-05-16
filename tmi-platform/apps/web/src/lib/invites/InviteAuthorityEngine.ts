import { InviteTokenEngine } from "@/lib/invites/InviteTokenEngine";
import type { GiftAccountRole, GiftTier, GiftSource } from "@/lib/subscriptions/GiftMembershipEngine";

export type InviteStatus = "pending" | "accepted" | "revoked" | "expired";

export interface InviteRecord {
  inviteId: string;
  recipientEmail: string;
  inviterId: string;
  role: GiftAccountRole;
  tier: GiftTier;
  source: GiftSource;
  status: InviteStatus;
  familyInvite: boolean;
  friendInvite: boolean;
  currentTokenIssuedAt: number;
  currentTokenExpiresAt: number;
  acceptedAt?: number;
  revokedAt?: number;
  accountId?: string;
  lastResentAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface InviteAuditEvent {
  inviteId: string;
  type: "created" | "resent" | "accepted" | "revoked" | "reissued";
  at: number;
  actorId?: string;
  detail?: string;
}

const inviteStore = new Map<string, InviteRecord>();
const inviteAuditStore: InviteAuditEvent[] = [];
let inviteCounter = 0;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function nextInviteId(): string {
  inviteCounter += 1;
  return `inv-${String(inviteCounter).padStart(6, "0")}`;
}

function resolveStatus(record: InviteRecord): InviteStatus {
  if (record.status === "accepted" || record.status === "revoked") return record.status;
  if (Date.now() > record.currentTokenExpiresAt) return "expired";
  return "pending";
}

function audit(event: InviteAuditEvent): void {
  inviteAuditStore.unshift(event);
  if (inviteAuditStore.length > 2000) inviteAuditStore.pop();
}

export class InviteAuthorityEngine {
  static createInvite(input: {
    recipientEmail: string;
    inviterId: string;
    role: GiftAccountRole;
    tier: GiftTier;
    source: GiftSource;
    familyInvite?: boolean;
    friendInvite?: boolean;
  }): { invite: InviteRecord; token: string } {
    const inviteId = nextInviteId();
    const tokenData = InviteTokenEngine.issueToken(inviteId);

    const invite: InviteRecord = {
      inviteId,
      recipientEmail: normalizeEmail(input.recipientEmail),
      inviterId: input.inviterId,
      role: input.role,
      tier: input.tier,
      source: input.source,
      status: "pending",
      familyInvite: Boolean(input.familyInvite),
      friendInvite: Boolean(input.friendInvite),
      currentTokenIssuedAt: Date.now(),
      currentTokenExpiresAt: tokenData.expiresAt,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    inviteStore.set(invite.inviteId, invite);
    audit({ inviteId, type: "created", at: Date.now(), actorId: input.inviterId });

    return { invite, token: tokenData.token };
  }

  static reissueInviteToken(inviteId: string, actorId: string, reason: string = "manual-resend"): { invite: InviteRecord; token: string } {
    const invite = inviteStore.get(inviteId);
    if (!invite) throw new Error(`Invite ${inviteId} not found`);

    const tokenData = InviteTokenEngine.issueReplacementToken(inviteId, reason);
    invite.currentTokenIssuedAt = Date.now();
    invite.currentTokenExpiresAt = tokenData.expiresAt;
    invite.lastResentAt = Date.now();
    invite.status = "pending";
    invite.updatedAt = Date.now();

    inviteStore.set(inviteId, invite);
    audit({ inviteId, type: "reissued", at: Date.now(), actorId, detail: reason });

    return { invite: { ...invite }, token: tokenData.token };
  }

  static acceptInvite(inviteId: string, accountId: string): InviteRecord {
    const invite = inviteStore.get(inviteId);
    if (!invite) throw new Error(`Invite ${inviteId} not found`);

    invite.status = "accepted";
    invite.acceptedAt = Date.now();
    invite.accountId = accountId;
    invite.updatedAt = Date.now();

    inviteStore.set(inviteId, invite);
    audit({ inviteId, type: "accepted", at: Date.now(), detail: accountId });
    return { ...invite };
  }

  static revokeInvite(inviteId: string, actorId: string, detail: string = "revoked-by-admin"): InviteRecord {
    const invite = inviteStore.get(inviteId);
    if (!invite) throw new Error(`Invite ${inviteId} not found`);

    InviteTokenEngine.revokeInviteTokens(inviteId, detail);
    invite.status = "revoked";
    invite.revokedAt = Date.now();
    invite.updatedAt = Date.now();
    inviteStore.set(inviteId, invite);
    audit({ inviteId, type: "revoked", at: Date.now(), actorId, detail });
    return { ...invite };
  }

  static getInviteById(inviteId: string): InviteRecord | null {
    const invite = inviteStore.get(inviteId);
    if (!invite) return null;
    return { ...invite, status: resolveStatus(invite) };
  }

  static getInviteByToken(token: string): { invite: InviteRecord | null; reason?: "invalid" | "expired" | "revoked" | "used" } {
    const validation = InviteTokenEngine.validateToken(token);
    if (!validation.ok || !validation.inviteId) return { invite: null, reason: validation.reason };

    const invite = this.getInviteById(validation.inviteId);
    if (!invite) return { invite: null, reason: "invalid" };
    return { invite };
  }

  static consumeToken(token: string): boolean {
    return InviteTokenEngine.markTokenUsed(token);
  }

  static listInvites(): InviteRecord[] {
    return Array.from(inviteStore.values())
      .map((item) => ({ ...item, status: resolveStatus(item) }))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  static listPendingInvites(): InviteRecord[] {
    return this.listInvites().filter((item) => item.status === "pending" || item.status === "expired");
  }

  static listAcceptedInvites(): InviteRecord[] {
    return this.listInvites().filter((item) => item.status === "accepted");
  }

  static listInvitesForEmail(email: string): InviteRecord[] {
    const normalized = normalizeEmail(email);
    return this.listInvites().filter((item) => item.recipientEmail === normalized);
  }

  static listAudit(): InviteAuditEvent[] {
    return [...inviteAuditStore];
  }
}

export default InviteAuthorityEngine;
