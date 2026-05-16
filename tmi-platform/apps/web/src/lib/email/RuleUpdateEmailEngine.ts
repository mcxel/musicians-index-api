import AnnouncementEngine from '@/lib/email/AnnouncementEngine';
import type { QueuedEmailJob } from '@/lib/email/EmailQueueEngine';

export class RuleUpdateEmailEngine {
  static sendRuleUpdate(input: {
    userId: string;
    to: string;
    ruleName: string;
    effectiveDate: string;
    detailLink: string;
  }): QueuedEmailJob {
    return AnnouncementEngine.queueAnnouncement({
      userId: input.userId,
      to: input.to,
      title: `Rule Update: ${input.ruleName}`,
      summary: `This update becomes effective on ${input.effectiveDate}.`,
      link: input.detailLink,
      channel: 'news',
    });
  }
}

export default RuleUpdateEmailEngine;
