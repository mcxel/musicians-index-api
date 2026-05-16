import type { SubscriptionTier } from "@/lib/subscriptions/SubscriptionPricingEngine";

export type GiftAccountRole = "artist" | "fan" | "venue" | "producer" | "sponsor" | "advertiser";
export type GiftTier = SubscriptionTier;
export type GiftSource = "admin" | "friend" | "family";
export type GiftGrantStatus = "pending" | "active" | "revoked";

export interface GiftMembershipGrant {
  giftId: string;
  inviteId?: string;
  recipientEmail: string;
  role: GiftAccountRole;
  tier: GiftTier;
  source: GiftSource;
  grantedByAdminId?: string;
  grantedAt: number;
  activatedAt?: number;
  accountId?: string;
  revokedAt?: number;
  revokedReason?: string;
}

export interface GiftedAccountRecord {
  accountId: string;
  email: string;
  role: GiftAccountRole;
  tier: GiftTier;
  source: GiftSource;
  giftId: string;
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

const grantStore = new Map<string, GiftMembershipGrant>();
const giftedAccountStore = new Map<string, GiftedAccountRecord>();
let giftCounter = 0;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function nextGiftId(): string {
  giftCounter += 1;
  return `gift-${String(giftCounter).padStart(6, "0")}`;
}

function nextAccountId(email: string): string {
  return `acct-${email.replace(/[^a-z0-9]/gi, "-")}-${Date.now().toString(36)}`;
}

export class GiftMembershipEngine {
  static grantMembership(input: {
    recipientEmail: string;
    role: GiftAccountRole;
    tier: GiftTier;
    source: GiftSource;
    inviteId?: string;
    grantedByAdminId?: string;
  }): GiftMembershipGrant {
    const grant: GiftMembershipGrant = {
      giftId: nextGiftId(),
      inviteId: input.inviteId,
      recipientEmail: normalizeEmail(input.recipientEmail),
      role: input.role,
      tier: input.tier,
      source: input.source,
      grantedByAdminId: input.grantedByAdminId,
      grantedAt: Date.now(),
    };

    grantStore.set(grant.giftId, grant);
    return grant;
  }

  static activateGiftMembership(input: {
    giftId: string;
    email: string;
    accountId?: string;
  }): GiftedAccountRecord {
    const grant = grantStore.get(input.giftId);
    if (!grant) throw new Error(`Gift ${input.giftId} not found`);
    if (grant.revokedAt) throw new Error(`Gift ${input.giftId} was revoked`);

    const email = normalizeEmail(input.email);
    const accountId = input.accountId ?? nextAccountId(email);

    grant.accountId = accountId;
    grant.activatedAt = Date.now();

    const existing = giftedAccountStore.get(accountId);
    const base: GiftedAccountRecord = existing ?? {
      accountId,
      email,
      role: grant.role,
      tier: grant.tier,
      source: grant.source,
      giftId: grant.giftId,
      active: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const record: GiftedAccountRecord = {
      ...base,
      email,
      role: grant.role,
      tier: grant.tier,
      giftId: grant.giftId,
      active: true,
      updatedAt: Date.now(),
    };

    giftedAccountStore.set(accountId, record);
    grantStore.set(grant.giftId, grant);
    return record;
  }

  static revokeGiftMembership(input: { giftId?: string; accountId?: string; reason: string }): boolean {
    if (input.giftId) {
      const grant = grantStore.get(input.giftId);
      if (!grant) return false;
      grant.revokedAt = Date.now();
      grant.revokedReason = input.reason;
      grantStore.set(grant.giftId, grant);
      if (grant.accountId) {
        const account = giftedAccountStore.get(grant.accountId);
        if (account) {
          account.active = false;
          account.updatedAt = Date.now();
          giftedAccountStore.set(account.accountId, account);
        }
      }
      return true;
    }

    if (input.accountId) {
      const account = giftedAccountStore.get(input.accountId);
      if (!account) return false;
      account.active = false;
      account.updatedAt = Date.now();
      giftedAccountStore.set(account.accountId, account);
      return true;
    }

    return false;
  }

  static upgradeGiftMembership(accountId: string, tier: GiftTier): GiftedAccountRecord {
    const account = giftedAccountStore.get(accountId);
    if (!account) throw new Error(`Gifted account ${accountId} not found`);
    account.tier = tier;
    account.updatedAt = Date.now();
    giftedAccountStore.set(account.accountId, account);
    return account;
  }

  static findPendingGrantByInviteId(inviteId: string): GiftMembershipGrant | null {
    const grants = Array.from(grantStore.values());
    return grants.find((grant) => grant.inviteId === inviteId && !grant.activatedAt && !grant.revokedAt) ?? null;
  }

  static getGrant(giftId: string): GiftMembershipGrant | null {
    return grantStore.get(giftId) ?? null;
  }

  static listGiftedAccounts(): GiftedAccountRecord[] {
    return Array.from(giftedAccountStore.values()).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  static listGiftGrants(): GiftMembershipGrant[] {
    return Array.from(grantStore.values()).sort((a, b) => b.grantedAt - a.grantedAt);
  }

  static listPendingGrants(): GiftMembershipGrant[] {
    return this.listGiftGrants().filter((item) => !item.activatedAt && !item.revokedAt);
  }
}

export default GiftMembershipEngine;
