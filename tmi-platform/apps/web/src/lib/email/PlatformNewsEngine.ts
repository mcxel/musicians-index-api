import AnnouncementEngine from '@/lib/email/AnnouncementEngine';
import NewsSubscriptionEngine from '@/lib/email/NewsSubscriptionEngine';

export interface PlatformNewsItem {
  id: string;
  title: string;
  summary: string;
  link: string;
  createdAt: number;
}

const newsFeed: PlatformNewsItem[] = [];

function nextNewsId(): string {
  return `news-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export class PlatformNewsEngine {
  static publishNews(input: { title: string; summary: string; link: string }): PlatformNewsItem {
    const item: PlatformNewsItem = {
      id: nextNewsId(),
      title: input.title,
      summary: input.summary,
      link: input.link,
      createdAt: Date.now(),
    };

    newsFeed.unshift(item);
    if (newsFeed.length > 500) newsFeed.pop();

    NewsSubscriptionEngine.listSubscribers().forEach((subscriber) => {
      AnnouncementEngine.queueAnnouncement({
        userId: subscriber.userId,
        to: subscriber.email,
        title: item.title,
        summary: item.summary,
        link: item.link,
      });
    });

    return item;
  }

  static listNews(): PlatformNewsItem[] {
    return [...newsFeed];
  }
}

export default PlatformNewsEngine;
