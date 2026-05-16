// PromoExpirationEngine: Handles expiration and cleanup of promo codes.
import { PromoCodeEngine } from './PromoCodeEngine';

export class PromoExpirationEngine {
  static expireCodes() {
    const now = new Date();
    PromoCodeEngine.listCodes().forEach(code => {
      if (code.expirationDate && code.expirationDate < now && !code.revoked) {
        PromoCodeEngine.revokeCode(code.code);
      }
    });
  }
}
