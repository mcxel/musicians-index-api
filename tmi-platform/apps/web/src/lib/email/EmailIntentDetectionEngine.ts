export type EmailIntent =
  | 'billing-issue'
  | 'ticket-issue'
  | 'promo-issue'
  | 'login-issue'
  | 'support-request'
  | 'security-alert'
  | 'unknown';

export class EmailIntentDetectionEngine {
  static detectIntent(input: { subject: string; body: string }): EmailIntent {
    const text = `${input.subject} ${input.body}`.toLowerCase();
    if (text.includes('payment') || text.includes('card') || text.includes('invoice')) {
      return 'billing-issue';
    }
    if (text.includes('ticket') || text.includes('qr') || text.includes('seat')) {
      return 'ticket-issue';
    }
    if (text.includes('promo') || text.includes('invite code')) {
      return 'promo-issue';
    }
    if (text.includes('login') || text.includes('password') || text.includes('account recovery')) {
      return 'login-issue';
    }
    if (text.includes('security') || text.includes('unauthorized')) {
      return 'security-alert';
    }
    if (text.includes('help') || text.includes('support') || text.includes('issue')) {
      return 'support-request';
    }
    return 'unknown';
  }
}

export default EmailIntentDetectionEngine;
