import crypto from "crypto";

export type InviteTokenStatus = "active" | "used" | "revoked" | "expired";

export interface InviteTokenRecord {
  inviteId: string;
  tokenHash: string;
  issuedAt: number;
  expiresAt: number;
  status: InviteTokenStatus;
  reason?: string;
}

export interface InviteTokenValidationResult {
  ok: boolean;
  inviteId?: string;
  reason?: "invalid" | "expired" | "revoked" | "used";
}

const DEFAULT_INVITE_TTL_MS = 24 * 60 * 60 * 1000;
const tokenStoreByInvite = new Map<string, InviteTokenRecord[]>();

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function now(): number {
  return Date.now();
}

function resolveStatus(record: InviteTokenRecord): InviteTokenStatus {
  if (record.status === "revoked" || record.status === "used") return record.status;
  if (now() > record.expiresAt) return "expired";
  return "active";
}

export class InviteTokenEngine {
  static issueToken(inviteId: string, ttlMs: number = DEFAULT_INVITE_TTL_MS): { token: string; expiresAt: number } {
    const token = crypto.randomBytes(24).toString("hex");
    const record: InviteTokenRecord = {
      inviteId,
      tokenHash: hashToken(token),
      issuedAt: now(),
      expiresAt: now() + ttlMs,
      status: "active",
    };

    const list = tokenStoreByInvite.get(inviteId) ?? [];
    tokenStoreByInvite.set(inviteId, [record, ...list].slice(0, 10));

    return { token, expiresAt: record.expiresAt };
  }

  static validateToken(token: string): InviteTokenValidationResult {
    const tokenHash = hashToken(token);

    for (const [inviteId, records] of tokenStoreByInvite.entries()) {
      const match = records.find((item) => item.tokenHash === tokenHash);
      if (!match) continue;

      const status = resolveStatus(match);
      if (status === "active") return { ok: true, inviteId };
      if (status === "expired") return { ok: false, reason: "expired" };
      if (status === "revoked") return { ok: false, reason: "revoked" };
      if (status === "used") return { ok: false, reason: "used" };
    }

    return { ok: false, reason: "invalid" };
  }

  static markTokenUsed(token: string): boolean {
    const tokenHash = hashToken(token);

    for (const records of tokenStoreByInvite.values()) {
      const match = records.find((item) => item.tokenHash === tokenHash);
      if (!match) continue;
      match.status = "used";
      return true;
    }

    return false;
  }

  static revokeInviteTokens(inviteId: string, reason: string = "reissued"): number {
    const records = tokenStoreByInvite.get(inviteId) ?? [];
    let count = 0;

    records.forEach((item) => {
      if (resolveStatus(item) === "active") {
        item.status = "revoked";
        item.reason = reason;
        count += 1;
      }
    });

    tokenStoreByInvite.set(inviteId, records);
    return count;
  }

  static issueReplacementToken(inviteId: string, reason: string = "reissue", ttlMs: number = DEFAULT_INVITE_TTL_MS): { token: string; expiresAt: number } {
    this.revokeInviteTokens(inviteId, reason);
    return this.issueToken(inviteId, ttlMs);
  }

  static getLatestTokenStatus(inviteId: string): InviteTokenStatus | "missing" {
    const records = tokenStoreByInvite.get(inviteId) ?? [];
    if (records.length === 0) return "missing";
    return resolveStatus(records[0]);
  }

  static getTokenAudit(inviteId: string): InviteTokenRecord[] {
    const records = tokenStoreByInvite.get(inviteId) ?? [];
    return records.map((item) => ({ ...item, status: resolveStatus(item) }));
  }
}

export default InviteTokenEngine;
