/**
 * NotificationRoutingEngine
 * Resolves notification recipients for platform events by role/category.
 * Supports fan/artist/venue/sponsor/merchant plus article/live/payout channels.
 */

import type { PlatformEvent } from "./EventBusEngine";
import {
  findMatchingSubscriptions,
  type SubscriptionRecipientType,
} from "./EventSubscriptionEngine";

export type NotificationChannel = "inbox" | "push" | "badge" | "activity";

export type NotificationRoute = {
  recipientType: SubscriptionRecipientType;
  recipientId: string;
  channel: NotificationChannel;
  reason: string;
};

function payloadUserIds(event: PlatformEvent): Array<{ type: SubscriptionRecipientType; id: string }> {
  const pairs: Array<{ key: string; type: SubscriptionRecipientType }> = [
    { key: "fanId", type: "fan" },
    { key: "artistId", type: "artist" },
    { key: "venueId", type: "venue" },
    { key: "sponsorId", type: "sponsor" },
    { key: "merchantId", type: "merchant" },
    { key: "promoterId", type: "promoter" },
  ];

  const result: Array<{ type: SubscriptionRecipientType; id: string }> = [];
  for (const pair of pairs) {
    const value = event.payload[pair.key];
    if (typeof value === "string" && value.trim()) {
      result.push({ type: pair.type, id: value });
    }
  }
  return result;
}

function channelsForCategory(category: PlatformEvent["category"]): NotificationChannel[] {
  switch (category) {
    case "live":
      return ["push", "badge", "activity"];
    case "ticket":
    case "payout":
      return ["inbox", "push", "badge"];
    case "article":
      return ["inbox", "activity", "badge"];
    default:
      return ["inbox", "badge"];
  }
}

export function resolveNotificationRoutes(event: PlatformEvent): NotificationRoute[] {
  const directRecipients = payloadUserIds(event);
  const routeHint = typeof event.payload.route === "string" ? event.payload.route : undefined;
  const subMatches = findMatchingSubscriptions({
    category: event.category,
    eventType: event.eventType,
    route: routeHint,
  });

  const routes: NotificationRoute[] = [];

  // Direct payload recipients
  for (const rec of directRecipients) {
    for (const channel of channelsForCategory(event.category)) {
      routes.push({
        recipientType: rec.type,
        recipientId: rec.id,
        channel,
        reason: "payload-recipient",
      });
    }
  }

  // Subscription-driven recipients
  for (const sub of subMatches) {
    const channels = sub.preferenceLevel === "important-only"
      ? (["inbox", "badge"] as NotificationChannel[])
      : channelsForCategory(event.category);

    for (const channel of channels) {
      routes.push({
        recipientType: sub.recipientType,
        recipientId: sub.recipientId,
        channel,
        reason: "subscription-match",
      });
    }
  }

  // Deduplicate by recipient + channel
  const deduped = new Map<string, NotificationRoute>();
  for (const route of routes) {
    deduped.set(`${route.recipientType}:${route.recipientId}:${route.channel}`, route);
  }

  return [...deduped.values()];
}

export function classifyEventNotificationDomain(event: PlatformEvent):
  | "fan-notifications"
  | "artist-notifications"
  | "venue-notifications"
  | "sponsor-notifications"
  | "merchant-notifications"
  | "article-notifications"
  | "live-notifications"
  | "payout-notifications"
  | "ticket-notifications"
  | "system-notifications" {
  if (event.category === "article") return "article-notifications";
  if (event.category === "live") return "live-notifications";
  if (event.category === "payout") return "payout-notifications";
  if (event.category === "ticket") return "ticket-notifications";

  if (typeof event.payload.fanId === "string") return "fan-notifications";
  if (typeof event.payload.artistId === "string") return "artist-notifications";
  if (typeof event.payload.venueId === "string") return "venue-notifications";
  if (typeof event.payload.sponsorId === "string") return "sponsor-notifications";
  if (typeof event.payload.merchantId === "string") return "merchant-notifications";

  return "system-notifications";
}
