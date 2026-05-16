export type SupportCategory =
  | 'billing'
  | 'login'
  | 'tickets'
  | 'promo'
  | 'artist'
  | 'fan'
  | 'venue'
  | 'technical'
  | 'appeals'
  | 'reports'
  | 'refund';

export class AiSupportClassificationEngine {
  static classify(input: { subject: string; message: string }): SupportCategory {
    const text = `${input.subject} ${input.message}`.toLowerCase();
    if (text.includes('billing') || text.includes('invoice') || text.includes('card'))
      return 'billing';
    if (text.includes('password') || text.includes('login') || text.includes('account recovery'))
      return 'login';
    if (text.includes('ticket') || text.includes('qr') || text.includes('seat')) return 'tickets';
    if (text.includes('promo') || text.includes('code') || text.includes('invite')) return 'promo';
    if (text.includes('artist')) return 'artist';
    if (text.includes('fan')) return 'fan';
    if (text.includes('venue')) return 'venue';
    if (text.includes('ban') || text.includes('appeal')) return 'appeals';
    if (text.includes('report') || text.includes('harass') || text.includes('abuse'))
      return 'reports';
    if (text.includes('refund')) return 'refund';
    return 'technical';
  }
}

export default AiSupportClassificationEngine;
