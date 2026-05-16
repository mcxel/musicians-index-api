import EmailQueueEngine, { type QueuedEmailJob } from '@/lib/email/EmailQueueEngine';

export class TransactionalEmailEngine {
  static sendSignupVerification(input: {
    userId: string;
    to: string;
    verificationLink: string;
  }): QueuedEmailJob {
    return EmailQueueEngine.enqueue({
      userId: input.userId,
      to: input.to,
      channel: 'account',
      templateKey: 'account.signup-verification',
      variables: {
        message: `Verify your account here: ${input.verificationLink}`,
        verificationLink: input.verificationLink,
      },
      required: true,
    });
  }

  static sendPasswordReset(input: {
    userId: string;
    to: string;
    resetLink: string;
  }): QueuedEmailJob {
    return EmailQueueEngine.enqueue({
      userId: input.userId,
      to: input.to,
      channel: 'security',
      templateKey: 'account.password-reset',
      variables: {
        message: `Reset your password: ${input.resetLink}`,
        resetLink: input.resetLink,
      },
      required: true,
    });
  }

  static sendAccountRecovery(input: {
    userId: string;
    to: string;
    recoveryLink: string;
  }): QueuedEmailJob {
    return EmailQueueEngine.enqueue({
      userId: input.userId,
      to: input.to,
      channel: 'account',
      templateKey: 'account.recovery',
      variables: {
        message: `Recover your account access: ${input.recoveryLink}`,
        recoveryLink: input.recoveryLink,
      },
      required: true,
    });
  }

  static sendSupportReply(input: {
    userId: string;
    to: string;
    ticketId: string;
    replyText: string;
  }): QueuedEmailJob {
    return EmailQueueEngine.enqueue({
      userId: input.userId,
      to: input.to,
      channel: 'support-replies',
      templateKey: 'support.reply',
      variables: {
        message: `Support reply for ${input.ticketId}: ${input.replyText}`,
        ticketId: input.ticketId,
        replyText: input.replyText,
      },
      required: false,
    });
  }
}

export default TransactionalEmailEngine;
