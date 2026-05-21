// PromoCodeEngine: Handles creation, validation, and management of promo codes for all membership types and durations.
export type PromoCodeType =
  | 'free_trial'
  | 'discount'
  | 'temporary_membership'
  | 'lifetime_grant'
  | 'founder_grant'
  | 'artist_invite'
  | 'fan_invite'
  | 'performer_invite';

export type PromoTier = 'free' | 'pro' | 'bronze' | 'gold' | 'platinum' | 'diamond';
export type PromoRole = 'fan' | 'artist' | 'performer' | 'producer' | 'venue' | 'sponsor' | 'advertiser';
export type PromoDuration = 7 | 30 | 60 | 90 | 'lifetime';

export interface PromoCode {
  code: string;
  type: PromoCodeType;
  tier: PromoTier;
  role: PromoRole;
  duration: PromoDuration;
  emails?: string[];
  redemptionLimit?: number;
  expirationDate?: Date;
  createdBy: string;
  createdAt: Date;
  revoked?: boolean;
  revokedAt?: Date;
  redemptions: PromoRedemption[];
}

export interface PromoRedemption {
  email: string;
  redeemedAt: Date;
  membershipId?: string;
}

export class PromoCodeEngine {
  private static codes: Map<string, PromoCode> = new Map();

  static createCode(data: Omit<PromoCode, 'createdAt' | 'revoked' | 'revokedAt' | 'redemptions'>): PromoCode {
    const code: PromoCode = {
      ...data,
      createdAt: new Date(),
      revoked: false,
      redemptions: [],
    };
    this.codes.set(code.code, code);
    return code;
  }

  static revokeCode(code: string) {
    const promo = this.codes.get(code);
    if (promo) {
      promo.revoked = true;
      promo.revokedAt = new Date();
    }
  }

  static getCode(code: string): PromoCode | undefined {
    return this.codes.get(code);
  }

  static listCodes(): PromoCode[] {
    return Array.from(this.codes.values());
  }

  static trackRedemption(code: string, redemption: PromoRedemption) {
    const promo = this.codes.get(code);
    if (promo) {
      promo.redemptions.push(redemption);
    }
  }

  static resendCode(code: string) {
    // Placeholder for email resend logic
  }
}
