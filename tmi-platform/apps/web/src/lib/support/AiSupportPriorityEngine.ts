import type { SupportCategory } from '@/lib/support/AiSupportClassificationEngine';

export type SupportPriority = 'low' | 'medium' | 'high' | 'critical';

export class AiSupportPriorityEngine {
  static score(input: {
    category: SupportCategory;
    message: string;
    hasPaymentFailure?: boolean;
    hasSecurityRisk?: boolean;
  }): { priority: SupportPriority; score: number } {
    const baseByCategory: Record<SupportCategory, number> = {
      billing: 72,
      login: 65,
      tickets: 70,
      promo: 42,
      artist: 48,
      fan: 45,
      venue: 52,
      technical: 50,
      appeals: 68,
      reports: 84,
      refund: 75,
    };

    let score = baseByCategory[input.category];
    if (input.hasPaymentFailure) score += 12;
    if (input.hasSecurityRisk) score += 15;
    if (input.message.toLowerCase().includes('urgent')) score += 8;

    if (score >= 90) return { priority: 'critical', score };
    if (score >= 74) return { priority: 'high', score };
    if (score >= 55) return { priority: 'medium', score };
    return { priority: 'low', score };
  }
}

export default AiSupportPriorityEngine;
