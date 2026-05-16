import EmailQueueEngine, { type QueuedEmailJob } from '@/lib/email/EmailQueueEngine';

type BillingTemplateKey =
  | 'billing.payment-failed'
  | 'billing.failed-card'
  | 'billing.refund-notice'
  | 'billing.cancellation-notice'
  | 'billing.receipt'
  | 'billing.lifetime-pass-confirmation';

function queueBillingEmail(input: {
  userId: string;
  to: string;
  templateKey: BillingTemplateKey;
  variables: Record<string, string | number | boolean>;
}): QueuedEmailJob {
  return EmailQueueEngine.enqueue({
    userId: input.userId,
    to: input.to,
    channel: 'billing',
    templateKey: input.templateKey,
    variables: input.variables,
    required: true,
  });
}

export class BillingEmailEngine {
  static sendPaymentFailedNotice(input: {
    userId: string;
    to: string;
    amount: string;
    recoveryLink: string;
  }): QueuedEmailJob {
    return queueBillingEmail({
      ...input,
      templateKey: 'billing.payment-failed',
      variables: {
        message: `Your payment of ${input.amount} failed. Recover access here: ${input.recoveryLink}`,
        amount: input.amount,
        recoveryLink: input.recoveryLink,
      },
    });
  }

  static sendFailedCardNotice(input: {
    userId: string;
    to: string;
    cardLast4: string;
    updateCardLink: string;
  }): QueuedEmailJob {
    return queueBillingEmail({
      ...input,
      templateKey: 'billing.failed-card',
      variables: {
        message: `Card ending ${input.cardLast4} failed. Update payment method: ${input.updateCardLink}`,
        cardLast4: input.cardLast4,
        updateCardLink: input.updateCardLink,
      },
    });
  }

  static sendRefundNotice(input: {
    userId: string;
    to: string;
    amount: string;
    reason: string;
  }): QueuedEmailJob {
    return queueBillingEmail({
      ...input,
      templateKey: 'billing.refund-notice',
      variables: {
        message: `A refund of ${input.amount} was issued. Reason: ${input.reason}`,
        amount: input.amount,
        reason: input.reason,
      },
    });
  }

  static sendCancellationNotice(input: {
    userId: string;
    to: string;
    tier: string;
    effectiveDate: string;
  }): QueuedEmailJob {
    return queueBillingEmail({
      ...input,
      templateKey: 'billing.cancellation-notice',
      variables: {
        message: `Your ${input.tier} subscription is scheduled to cancel on ${input.effectiveDate}.`,
        tier: input.tier,
        effectiveDate: input.effectiveDate,
      },
    });
  }

  static sendReceipt(input: {
    userId: string;
    to: string;
    invoiceId: string;
    amount: string;
  }): QueuedEmailJob {
    return queueBillingEmail({
      ...input,
      templateKey: 'billing.receipt',
      variables: {
        message: `Receipt ${input.invoiceId} paid: ${input.amount}.`,
        invoiceId: input.invoiceId,
        amount: input.amount,
      },
    });
  }

  static sendLifetimePassConfirmation(input: {
    userId: string;
    to: string;
    tier: string;
    activationLink: string;
  }): QueuedEmailJob {
    return queueBillingEmail({
      ...input,
      templateKey: 'billing.lifetime-pass-confirmation',
      variables: {
        message: `You were granted a Lifetime ${input.tier} pass. Activate: ${input.activationLink}`,
        tier: input.tier,
        activationLink: input.activationLink,
      },
    });
  }
}

export default BillingEmailEngine;
