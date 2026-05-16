// PromoAuditEngine: Tracks and audits all promo code actions for admin review.
import { PromoCodeEngine, PromoCode } from './PromoCodeEngine';

export interface PromoAuditLog {
  action: string;
  code: string;
  actor: string;
  timestamp: Date;
  details?: any;
}

export class PromoAuditEngine {
  private static logs: PromoAuditLog[] = [];

  static log(action: string, code: string, actor: string, details?: any) {
    this.logs.push({ action, code, actor, timestamp: new Date(), details });
  }

  static getLogs(): PromoAuditLog[] {
    return this.logs;
  }

  static getLogsForCode(code: string): PromoAuditLog[] {
    return this.logs.filter(log => log.code === code);
  }
}
