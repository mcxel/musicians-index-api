// TemporaryMembershipEngine: Handles temporary memberships granted via promo codes.
import { PromoTier, PromoRole, PromoDuration } from '../promos/PromoCodeEngine';

export interface TemporaryMembership {
  id: string;
  email: string;
  tier: PromoTier;
  role: PromoRole;
  duration: PromoDuration;
  grantedAt: Date;
  expiresAt: Date | 'lifetime';
  promoCode?: string;
  upgradedToPaid?: boolean;
}

export class TemporaryMembershipEngine {
  private static memberships: Map<string, TemporaryMembership> = new Map();

  static grant(
    email: string,
    tier: PromoTier,
    role: PromoRole,
    duration: PromoDuration,
    promoCode?: string
  ): string {
    const id = `${email}-${Date.now()}`;
    const grantedAt = new Date();
    let expiresAt: Date | 'lifetime';
    if (duration === 'lifetime') {
      expiresAt = 'lifetime';
    } else {
      expiresAt = new Date(grantedAt.getTime() + duration * 24 * 60 * 60 * 1000);
    }
    const membership: TemporaryMembership = {
      id,
      email,
      tier,
      role,
      duration,
      grantedAt,
      expiresAt,
      promoCode,
      upgradedToPaid: false,
    };
    this.memberships.set(id, membership);
    return id;
  }

  static upgradeToPaid(id: string) {
    const membership = this.memberships.get(id);
    if (membership) {
      membership.upgradedToPaid = true;
    }
  }

  static getMembershipsForEmail(email: string): TemporaryMembership[] {
    return Array.from(this.memberships.values()).filter(m => m.email === email);
  }

  static listAll(): TemporaryMembership[] {
    return Array.from(this.memberships.values());
  }
}
