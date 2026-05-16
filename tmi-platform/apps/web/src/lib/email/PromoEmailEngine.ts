import EmailQueueEngine, { type QueuedEmailJob } from '@/lib/email/EmailQueueEngine';

export class PromoEmailEngine {
  static sendPromoInvite(input: {
    userId: string;
    to: string;
    promoCode: string;
    inviteLink: string;
  }): QueuedEmailJob {
    return EmailQueueEngine.enqueue({
      userId: input.userId,
      to: input.to,
      channel: 'promos',
      templateKey: 'promo.invite',
      variables: {
        message: `Promo ${input.promoCode} is ready. Redeem: ${input.inviteLink}`,
        promoCode: input.promoCode,
        inviteLink: input.inviteLink,
      },
      required: false,
    });
  }

  static sendPromoRedemptionConfirmation(input: {
    userId: string;
    to: string;
    promoCode: string;
    benefitSummary: string;
  }): QueuedEmailJob {
    return EmailQueueEngine.enqueue({
      userId: input.userId,
      to: input.to,
      channel: 'account',
      templateKey: 'promo.redemption-confirmation',
      variables: {
        message: `Promo ${input.promoCode} redeemed. Benefit: ${input.benefitSummary}`,
        promoCode: input.promoCode,
        benefitSummary: input.benefitSummary,
      },
      required: true,
    });
  }
}

export default PromoEmailEngine;
