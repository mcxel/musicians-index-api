import type { EmailIntent } from '@/lib/email/EmailIntentDetectionEngine';

export class EmailResponseDraftEngine {
  static buildDraft(input: { intent: EmailIntent; customerName?: string; ticketId?: string }): {
    subject: string;
    body: string;
    requiresHumanApproval: boolean;
  } {
    const name = input.customerName ?? 'there';

    if (input.intent === 'billing-issue') {
      return {
        subject: 'Billing Support Update',
        body: `Hi ${name},\n\nWe received your billing message and routed it to finance support. We will follow up with payment recovery options and account status details shortly.\n\n- TMI Billing Support`,
        requiresHumanApproval: true,
      };
    }

    if (input.intent === 'ticket-issue') {
      return {
        subject: 'Ticket Delivery Support',
        body: `Hi ${name},\n\nWe are reviewing your ticket delivery request${
          input.ticketId ? ` for ${input.ticketId}` : ''
        }. We will resend your QR and print links as needed.\n\n- TMI Ticket Support`,
        requiresHumanApproval: true,
      };
    }

    if (input.intent === 'login-issue') {
      return {
        subject: 'Account Access Help',
        body: `Hi ${name},\n\nWe can help restore access. Please confirm your latest successful login device and we will continue account recovery securely.\n\n- TMI Account Support`,
        requiresHumanApproval: true,
      };
    }

    if (input.intent === 'promo-issue') {
      return {
        subject: 'Promo Assistance',
        body: `Hi ${name},\n\nYour promo request is in review. We will verify eligibility and send the proper redemption path.\n\n- TMI Promo Support`,
        requiresHumanApproval: true,
      };
    }

    return {
      subject: 'Support Follow-up',
      body: `Hi ${name},\n\nThanks for reaching out. We are routing your request to the right team and will respond soon.\n\n- TMI Support`,
      requiresHumanApproval: true,
    };
  }
}

export default EmailResponseDraftEngine;
