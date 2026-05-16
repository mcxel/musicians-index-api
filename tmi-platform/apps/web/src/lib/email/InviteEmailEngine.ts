import EmailQueueEngine from '@/lib/email/EmailQueueEngine';
import type {
  GiftAccountRole,
  GiftSource,
  GiftTier,
} from '@/lib/subscriptions/GiftMembershipEngine';

export type InviteEmailTemplate = 'friend' | 'family' | 'admin';

export interface InviteEmailMessage {
  to: string;
  subject: string;
  bodyText: string;
  inviteLink: string;
  template: InviteEmailTemplate;
  sentAt: number;
}

const sentInviteEmailLog: InviteEmailMessage[] = [];

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function templateFromSource(source: GiftSource): InviteEmailTemplate {
  if (source === 'friend') return 'friend';
  if (source === 'family') return 'family';
  return 'admin';
}

export class InviteEmailEngine {
  static buildInviteEmail(input: {
    to: string;
    inviteLink: string;
    role: GiftAccountRole;
    tier: GiftTier;
    source: GiftSource;
    inviterName?: string;
  }): InviteEmailMessage {
    const template = templateFromSource(input.source);
    const subject =
      template === 'family'
        ? `Family Gift Invite: ${input.tier.toUpperCase()} ${input.role} membership`
        : template === 'friend'
        ? `Friend Invite: Your gifted ${input.tier.toUpperCase()} membership is ready`
        : `You received a gifted ${input.tier.toUpperCase()} membership invite`;

    const bodyText = [
      `Hello,`,
      '',
      `${input.inviterName ?? 'A platform admin'} gifted you a ${input.tier.toUpperCase()} ${
        input.role
      } membership.`,
      'Use your secure invite link to activate your account:',
      input.inviteLink,
      '',
      'If your link expired, you can request a reissue from account/invites.',
      '',
      "- The Musician's Index",
    ].join('\n');

    return {
      to: normalizeEmail(input.to),
      subject,
      bodyText,
      inviteLink: input.inviteLink,
      template,
      sentAt: Date.now(),
    };
  }

  static sendInviteEmail(input: {
    to: string;
    inviteLink: string;
    role: GiftAccountRole;
    tier: GiftTier;
    source: GiftSource;
    inviterName?: string;
  }): InviteEmailMessage {
    const message = this.buildInviteEmail(input);
    sentInviteEmailLog.unshift(message);
    if (sentInviteEmailLog.length > 500) sentInviteEmailLog.pop();

    EmailQueueEngine.enqueue({
      userId: `invite-${message.to}`,
      to: message.to,
      channel: 'invites',
      templateKey: 'invite.membership',
      variables: {
        message: message.bodyText,
        inviteLink: message.inviteLink,
        template: message.template,
      },
      required: false,
      metadata: {
        source: input.source,
        role: input.role,
        tier: input.tier,
      },
    });

    return message;
  }

  static listSentInviteEmails(email?: string): InviteEmailMessage[] {
    if (!email) return [...sentInviteEmailLog];
    const normalized = normalizeEmail(email);
    return sentInviteEmailLog.filter((item) => item.to === normalized);
  }
}

export default InviteEmailEngine;
