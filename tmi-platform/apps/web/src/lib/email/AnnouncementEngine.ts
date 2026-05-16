import EmailQueueEngine, { type QueuedEmailJob } from '@/lib/email/EmailQueueEngine';

export class AnnouncementEngine {
  static queueAnnouncement(input: {
    userId: string;
    to: string;
    title: string;
    summary: string;
    link: string;
    channel?: 'news' | 'event-alerts' | 'artist-alerts' | 'venue-alerts';
  }): QueuedEmailJob {
    return EmailQueueEngine.enqueue({
      userId: input.userId,
      to: input.to,
      channel: input.channel ?? 'news',
      templateKey: 'announcements.platform',
      variables: {
        message: `${input.title}\n${input.summary}\nRead more: ${input.link}`,
        title: input.title,
        summary: input.summary,
        link: input.link,
      },
      required: false,
    });
  }
}

export default AnnouncementEngine;
