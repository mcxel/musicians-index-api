import AnnouncementEngine from '@/lib/email/AnnouncementEngine';
import type { QueuedEmailJob } from '@/lib/email/EmailQueueEngine';

export class FeatureLaunchEmailEngine {
  static sendLaunchAnnouncement(input: {
    userId: string;
    to: string;
    featureName: string;
    launchLink: string;
  }): QueuedEmailJob {
    return AnnouncementEngine.queueAnnouncement({
      userId: input.userId,
      to: input.to,
      title: `Feature Launch: ${input.featureName}`,
      summary: `${input.featureName} is now live on The Musician's Index.`,
      link: input.launchLink,
      channel: 'news',
    });
  }
}

export default FeatureLaunchEmailEngine;
