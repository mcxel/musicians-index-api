// packages/events/src/event-bus.ts
// Domain event system. Every major platform action emits an event.
// Systems subscribe to events they care about.

export type DomainEventType =
  // Auth
  | "user.signup.completed" | "auth.login.success" | "auth.login.failed" | "auth.logout"
  | "user.profile.updated" | "user.onboarding.completed" | "user.tier.changed"
  // Rooms
  | "room.created" | "room.started" | "room.ended" | "room.joined" | "room.left"
  | "room.host.changed" | "room.overflow.created" | "room.lighting.changed"
  | "room.dj_bpm.updated"
  // Video/Stream
  | "video.play.started" | "video.paused" | "video.ended" | "video.layout.changed"
  | "stream.started" | "stream.failed" | "stream.recovered" | "stream.ended"
  // Points / Prestige
  | "points.awarded" | "points.spent" | "prestige.level.up" | "achievement.unlocked"
  | "streak.updated" | "crown.awarded" | "crown.removed"
  // Sponsors / Economy
  | "sponsor.created" | "sponsor.activated" | "sponsor.expired" | "sponsor.slot.filled"
  | "sponsor.deal.closed" | "campaign.created" | "campaign.started" | "campaign.ended"
  | "ad.impression" | "ad.click" | "ad.conversion"
  // Commerce
  | "payment.initiated" | "payment.succeeded" | "payment.failed"
  | "payout.sent" | "payout.failed" | "payout.requested"
  | "ticket.created" | "ticket.purchased" | "ticket.scanned" | "ticket.refunded"
  | "wallet.credited" | "wallet.debited" | "tip.sent"
  // Bookings
  | "booking.request.created" | "booking.offer.sent" | "booking.accepted"
  | "booking.declined" | "booking.completed" | "booking.deposit.paid"
  // Social
  | "friend.request.sent" | "friend.request.accepted" | "message.sent" | "message.read"
  // Games
  | "game.session.created" | "game.round.started" | "game.round.ended"
  | "game.winner.declared" | "game.question.asked" | "game.answer.submitted"
  // Rewards
  | "reward.drop.triggered" | "reward.claim.submitted" | "reward.fulfilled"
  | "audience.prompt.fired" | "audience.prompt.answered"
  // Content
  | "article.published" | "article.archived" | "playlist.updated"
  // System
  | "system.error" | "system.degraded" | "queue.failed" | "bot.action.completed"
  | "feature.flag.changed";

export interface DomainEvent {
  id: string;
  type: DomainEventType;
  timestamp: string;       // ISO string
  source: string;          // service that emitted
  userId?: string;
  entityType?: string;
  entityId?: string;
  payload: Record<string, unknown>;
  correlationId?: string;  // trace linked events
}

export type EventHandler = (event: DomainEvent) => Promise<void>;

// Blackbox: implement with Redis pub/sub + BullMQ
export const eventBus = {
  emit: async (event: Omit<DomainEvent, "id" | "timestamp">): Promise<void> => {
    const full: DomainEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...event,
    };
    console.log(`[EventBus] ${full.type} from ${full.source}`);
    // Dispatch to Redis pub/sub and BullMQ queue
  },
  subscribe: (type: DomainEventType, handler: EventHandler): void => {
    console.log(`[EventBus] Subscribed to ${type}`);
    // Register handler for event type
  },
  subscribePattern: (pattern: string, handler: EventHandler): void => {
    // Subscribe to all events matching pattern (e.g. "room.*")
  },
};
