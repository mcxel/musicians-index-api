import EmailQueueEngine, { type QueuedEmailJob } from '@/lib/email/EmailQueueEngine';

export class SecurityEmailEngine {
  static sendSecurityAlert(input: {
    userId: string;
    to: string;
    alertType: string;
    device: string;
    detailLink: string;
  }): QueuedEmailJob {
    return EmailQueueEngine.enqueue({
      userId: input.userId,
      to: input.to,
      channel: 'security',
      templateKey: 'security.alert',
      variables: {
        message: `Security alert (${input.alertType}) detected on ${input.device}. Details: ${input.detailLink}`,
        alertType: input.alertType,
        device: input.device,
        detailLink: input.detailLink,
      },
      required: true,
    });
  }
}

export default SecurityEmailEngine;
