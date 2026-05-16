import EmailIntentDetectionEngine from '@/lib/email/EmailIntentDetectionEngine';
import EmailResponseDraftEngine from '@/lib/email/EmailResponseDraftEngine';

export interface BotEmailSuggestion {
  intent:
    | 'billing-issue'
    | 'ticket-issue'
    | 'promo-issue'
    | 'login-issue'
    | 'support-request'
    | 'security-alert'
    | 'unknown';
  nextAction:
    | 'route-billing'
    | 'route-ticketing'
    | 'route-promos'
    | 'route-security'
    | 'route-support'
    | 'route-auth';
  draftSubject: string;
  draftBody: string;
  requiresApproval: boolean;
}

export class EmailBotAssistantEngine {
  static analyzeIncomingEmail(input: {
    subject: string;
    body: string;
    customerName?: string;
    ticketId?: string;
  }): BotEmailSuggestion {
    const intent = EmailIntentDetectionEngine.detectIntent({
      subject: input.subject,
      body: input.body,
    });

    const draft = EmailResponseDraftEngine.buildDraft({
      intent,
      customerName: input.customerName,
      ticketId: input.ticketId,
    });

    const nextAction: BotEmailSuggestion['nextAction'] =
      intent === 'billing-issue'
        ? 'route-billing'
        : intent === 'ticket-issue'
        ? 'route-ticketing'
        : intent === 'promo-issue'
        ? 'route-promos'
        : intent === 'security-alert'
        ? 'route-security'
        : intent === 'login-issue'
        ? 'route-auth'
        : 'route-support';

    return {
      intent,
      nextAction,
      draftSubject: draft.subject,
      draftBody: draft.body,
      requiresApproval: draft.requiresHumanApproval,
    };
  }
}

export default EmailBotAssistantEngine;
