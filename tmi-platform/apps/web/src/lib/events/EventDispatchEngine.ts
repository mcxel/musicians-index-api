/**
 * EventDispatchEngine
 * Dispatches platform events to recipient roles and channels.
 */

import type { PlatformEvent } from "./EventBusEngine";
import { resolveNotificationRoutes } from "./NotificationRoutingEngine";
import {
  createPlatformNotification,
  type PlatformNotification,
} from "./PlatformNotificationEngine";

function toText(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function buildNotificationContent(event: PlatformEvent): { title: string; body: string } {
  const title = toText(event.payload.title, `${event.category.toUpperCase()} event`);
  const body = toText(event.payload.body, `Event ${event.eventType} from ${event.source}`);
  return { title, body };
}

function dispatchToRole(
  role: "fan" | "artist" | "venue" | "sponsor" | "merchant" | "promoter",
  recipientId: string,
  event: PlatformEvent,
): PlatformNotification[] {
  const routes = resolveNotificationRoutes(event).filter(
    (r) => r.recipientType === role && r.recipientId === recipientId,
  );

  const content = buildNotificationContent(event);
  return routes.map((route) =>
    createPlatformNotification({
      recipientType: route.recipientType,
      recipientId: route.recipientId,
      channel: route.channel,
      title: content.title,
      body: content.body,
      eventId: event.eventId,
      eventType: event.eventType,
      category: event.category,
      metadata: {
        source: event.source,
        reason: route.reason,
      },
    }),
  );
}

export function dispatchToFan(recipientId: string, event: PlatformEvent): PlatformNotification[] {
  return dispatchToRole("fan", recipientId, event);
}

export function dispatchToArtist(recipientId: string, event: PlatformEvent): PlatformNotification[] {
  return dispatchToRole("artist", recipientId, event);
}

export function dispatchToVenue(recipientId: string, event: PlatformEvent): PlatformNotification[] {
  return dispatchToRole("venue", recipientId, event);
}

export function dispatchToSponsor(recipientId: string, event: PlatformEvent): PlatformNotification[] {
  return dispatchToRole("sponsor", recipientId, event);
}

export function dispatchToMerchant(recipientId: string, event: PlatformEvent): PlatformNotification[] {
  return dispatchToRole("merchant", recipientId, event);
}

export function dispatchToPromoter(recipientId: string, event: PlatformEvent): PlatformNotification[] {
  return dispatchToRole("promoter", recipientId, event);
}

export function dispatchPlatformEvent(event: PlatformEvent): PlatformNotification[] {
  const routes = resolveNotificationRoutes(event);
  const grouped = new Map<string, { role: typeof routes[number]["recipientType"]; id: string }>();

  for (const route of routes) {
    grouped.set(`${route.recipientType}:${route.recipientId}`, {
      role: route.recipientType,
      id: route.recipientId,
    });
  }

  const out: PlatformNotification[] = [];
  for (const target of grouped.values()) {
    if (target.role === "fan") out.push(...dispatchToFan(target.id, event));
    else if (target.role === "artist") out.push(...dispatchToArtist(target.id, event));
    else if (target.role === "venue") out.push(...dispatchToVenue(target.id, event));
    else if (target.role === "sponsor") out.push(...dispatchToSponsor(target.id, event));
    else if (target.role === "merchant") out.push(...dispatchToMerchant(target.id, event));
    else if (target.role === "promoter") out.push(...dispatchToPromoter(target.id, event));
  }

  return out;
}
