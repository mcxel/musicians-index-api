import type { EmailChannel } from '@/lib/email/EmailAuditEngine';

export interface NotificationPreferences {
  userId: string;
  email: string;
  channels: Record<EmailChannel, boolean>;
  unsubscribedAt?: number;
  updatedAt: number;
}

export const REQUIRED_CHANNELS: ReadonlySet<EmailChannel> = new Set([
  'billing',
  'security',
  'ticketing',
  'account',
]);

const preferenceStore = new Map<string, NotificationPreferences>();

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function defaultChannels(): Record<EmailChannel, boolean> {
  return {
    billing: true,
    security: true,
    ticketing: true,
    account: true,
    news: true,
    promos: true,
    'artist-alerts': true,
    'venue-alerts': true,
    'event-alerts': true,
    'support-replies': true,
    invites: true,
    'admin-alerts': true,
  };
}

export class NewsSubscriptionEngine {
  static upsertSubscription(input: {
    userId: string;
    email: string;
    updates?: Partial<Record<EmailChannel, boolean>>;
  }): NotificationPreferences {
    const existing = preferenceStore.get(input.userId);
    const mergedChannels = {
      ...(existing?.channels ?? defaultChannels()),
      ...(input.updates ?? {}),
    };

    REQUIRED_CHANNELS.forEach((channel) => {
      mergedChannels[channel] = true;
    });

    const record: NotificationPreferences = {
      userId: input.userId,
      email: normalizeEmail(input.email),
      channels: mergedChannels,
      updatedAt: Date.now(),
      unsubscribedAt: existing?.unsubscribedAt,
    };

    preferenceStore.set(input.userId, record);
    return record;
  }

  static unsubscribe(input: {
    userId: string;
    email?: string;
    channels?: EmailChannel[];
  }): NotificationPreferences {
    const current = this.upsertSubscription({
      userId: input.userId,
      email: input.email ?? `${input.userId}@example.tmi`,
    });

    const channels = { ...current.channels };
    if (input.channels && input.channels.length > 0) {
      input.channels.forEach((channel) => {
        if (!REQUIRED_CHANNELS.has(channel)) channels[channel] = false;
      });
    } else {
      (Object.keys(channels) as EmailChannel[]).forEach((channel) => {
        if (!REQUIRED_CHANNELS.has(channel)) channels[channel] = false;
      });
    }

    const next: NotificationPreferences = {
      ...current,
      channels,
      unsubscribedAt: Date.now(),
      updatedAt: Date.now(),
    };
    preferenceStore.set(current.userId, next);
    return next;
  }

  static canReceive(userId: string | undefined, channel: EmailChannel, required: boolean): boolean {
    if (required || REQUIRED_CHANNELS.has(channel)) return true;
    if (!userId) return true;
    const existing = preferenceStore.get(userId);
    if (!existing) return true;
    return existing.channels[channel] !== false;
  }

  static listSubscribers(): NotificationPreferences[] {
    return Array.from(preferenceStore.values());
  }

  static getPreferences(userId: string): NotificationPreferences | null {
    return preferenceStore.get(userId) ?? null;
  }
}

export default NewsSubscriptionEngine;
