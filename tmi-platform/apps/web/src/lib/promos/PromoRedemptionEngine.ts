// PromoRedemptionEngine: Handles redemption logic for promo codes, including validation and membership assignment.
import { PromoCodeEngine, PromoRedemption } from './PromoCodeEngine';
import { TemporaryMembershipEngine } from '../subscriptions/TemporaryMembershipEngine';

export class PromoRedemptionEngine {
  static redeem(code: string, email: string): boolean {
    const promo = PromoCodeEngine.getCode(code);
    if (!promo || promo.revoked) return false;
    if (promo.expirationDate && promo.expirationDate < new Date()) return false;
    if (promo.redemptionLimit && promo.redemptions.length >= promo.redemptionLimit) return false;
    if (promo.emails && !promo.emails.includes(email)) return false;
    if (promo.redemptions.some(r => r.email === email)) return false;
    // Grant membership
    const membershipId = TemporaryMembershipEngine.grant(
      email,
      promo.tier,
      promo.role,
      promo.duration,
      code
    );
    PromoCodeEngine.trackRedemption(code, { email, redeemedAt: new Date(), membershipId });
    return true;
  }
}
