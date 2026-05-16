export type LifetimeTier = 'diamond';
export type LifetimeStatus = 'active' | 'revoked';

export interface LifetimeEntitlement {
  id: string;
  userId: string;
  email: string;
  tier: LifetimeTier;
  grantSource: string;
  activationDate: number;
  status: LifetimeStatus;
  revokedAt?: number;
  revokedBy?: string;
}

const lifetimeEntitlements = new Map<string, LifetimeEntitlement>();

function nextEntitlementId(): string {
  return `lifetime-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export class LifetimeEntitlementEngine {
  static grantLifetime(input: {
    userId: string;
    email: string;
    tier?: LifetimeTier;
    grantSource: string;
  }): LifetimeEntitlement {
    const existing = lifetimeEntitlements.get(input.userId);
    if (existing && existing.status === 'active') return existing;

    const record: LifetimeEntitlement = {
      id: existing?.id ?? nextEntitlementId(),
      userId: input.userId,
      email: normalizeEmail(input.email),
      tier: input.tier ?? 'diamond',
      grantSource: input.grantSource,
      activationDate: existing?.activationDate ?? Date.now(),
      status: 'active',
    };

    lifetimeEntitlements.set(input.userId, record);
    return record;
  }

  static hasActiveLifetime(userId: string): boolean {
    return lifetimeEntitlements.get(userId)?.status === 'active';
  }

  static protectFromDowngrade(
    userId: string,
    requestedTier: string
  ): { allowed: boolean; enforcedTier: string } {
    const existing = lifetimeEntitlements.get(userId);
    if (existing?.status === 'active') {
      return { allowed: false, enforcedTier: existing.tier };
    }

    return { allowed: true, enforcedTier: requestedTier };
  }

  static revokeLifetime(input: { userId: string; revokedBy: string }): LifetimeEntitlement | null {
    const existing = lifetimeEntitlements.get(input.userId);
    if (!existing) return null;

    const revoked: LifetimeEntitlement = {
      ...existing,
      status: 'revoked',
      revokedAt: Date.now(),
      revokedBy: input.revokedBy,
    };
    lifetimeEntitlements.set(input.userId, revoked);
    return revoked;
  }

  static listLifetimes(): LifetimeEntitlement[] {
    return Array.from(lifetimeEntitlements.values());
  }
}

export default LifetimeEntitlementEngine;
