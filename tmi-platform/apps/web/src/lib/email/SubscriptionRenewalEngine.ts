import EmailQueueEngine, { type QueuedEmailJob } from '@/lib/email/EmailQueueEngine';

export class SubscriptionRenewalEngine {
  static sendRenewalNotice(input: {
    userId: string;
    to: string;
    tier: string;
    renewsOn: string;
  }): QueuedEmailJob {
    return EmailQueueEngine.enqueue({
      userId: input.userId,
      to: input.to,
      channel: 'billing',
      templateKey: 'subscription.renewal-notice',
      variables: {
        message: `Your ${input.tier} plan renews on ${input.renewsOn}.`,
        tier: input.tier,
        renewsOn: input.renewsOn,
      },
      required: true,
    });
  }
}

export default SubscriptionRenewalEngine;
