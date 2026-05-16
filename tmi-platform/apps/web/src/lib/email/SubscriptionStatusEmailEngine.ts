import BillingEmailEngine from '@/lib/email/BillingEmailEngine';
import EmailQueueEngine, { type QueuedEmailJob } from '@/lib/email/EmailQueueEngine';

export class SubscriptionStatusEmailEngine {
  static sendUpgradeConfirmation(input: {
    userId: string;
    to: string;
    fromTier: string;
    toTier: string;
  }): QueuedEmailJob {
    return EmailQueueEngine.enqueue({
      userId: input.userId,
      to: input.to,
      channel: 'billing',
      templateKey: 'subscription.upgrade-confirmation',
      variables: {
        message: `Your plan upgraded from ${input.fromTier} to ${input.toTier}.`,
        fromTier: input.fromTier,
        toTier: input.toTier,
      },
      required: true,
    });
  }

  static sendDowngradeWarning(input: {
    userId: string;
    to: string;
    currentTier: string;
    downgradeTier: string;
    effectiveDate: string;
  }): QueuedEmailJob {
    return EmailQueueEngine.enqueue({
      userId: input.userId,
      to: input.to,
      channel: 'billing',
      templateKey: 'subscription.downgrade-warning',
      variables: {
        message: `Your ${input.currentTier} plan will downgrade to ${input.downgradeTier} on ${input.effectiveDate}.`,
        currentTier: input.currentTier,
        downgradeTier: input.downgradeTier,
        effectiveDate: input.effectiveDate,
      },
      required: true,
    });
  }

  static sendLifetimePassConfirmation(input: {
    userId: string;
    to: string;
    tier: string;
    activationLink: string;
  }): QueuedEmailJob {
    return BillingEmailEngine.sendLifetimePassConfirmation(input);
  }
}

export default SubscriptionStatusEmailEngine;
