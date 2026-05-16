/**
 * EventSubscriptionEngine
 * Subscription registry, unsubscription, route subscriptions, and event preferences.
 */

import type { PlatformEventCategory } from "./EventBusEngine";

export type SubscriptionRecipientType =
  | "fan"
  | "artist"
  | "venue"
  | "sponsor"
  | "merchant"
  | "promoter";

export type EventPreferenceLevel = "all" | "important-only" | "none";

export type EventSubscription = {
  subscriptionId: string;
  recipientType: SubscriptionRecipientType;
  recipientId: string;
  categories: PlatformEventCategory[];
  eventTypes?: string[];
  routes: string[];
  preferenceLevel: EventPreferenceLevel;
  enabled: boolean;
  createdAtMs: number;
  updatedAtMs: number;
};

const subscriptions: EventSubscription[] = [];
let subCounter = 0;

function normalizeCategories(categories: PlatformEventCategory[]): PlatformEventCategory[] {
  return [...new Set(categories)];
}

function normalizeRoutes(routes: string[]): string[] {
  return [...new Set(routes.map((r) => r.trim()).filter(Boolean))];
}

export function subscribe(input: {
  recipientType: SubscriptionRecipientType;
  recipientId: string;
  categories: PlatformEventCategory[];
  eventTypes?: string[];
  routes?: string[];
  preferenceLevel?: EventPreferenceLevel;
}): EventSubscription {
  const existing = subscriptions.find(
    (s) =>
      s.recipientType === input.recipientType &&
      s.recipientId === input.recipientId &&
      JSON.stringify(s.categories) === JSON.stringify(normalizeCategories(input.categories)) &&
      JSON.stringify(s.eventTypes ?? []) === JSON.stringify(input.eventTypes ?? []),
  );

  if (existing) {
    existing.enabled = true;
    existing.preferenceLevel = input.preferenceLevel ?? existing.preferenceLevel;
    existing.routes = normalizeRoutes(input.routes ?? existing.routes);
    existing.updatedAtMs = Date.now();
    return existing;
  }

  const sub: EventSubscription = {
    subscriptionId: `evt-sub-${++subCounter}`,
    recipientType: input.recipientType,
    recipientId: input.recipientId,
    categories: normalizeCategories(input.categories),
    eventTypes: input.eventTypes ? [...new Set(input.eventTypes)] : undefined,
    routes: normalizeRoutes(input.routes ?? []),
    preferenceLevel: input.preferenceLevel ?? "all",
    enabled: true,
    createdAtMs: Date.now(),
    updatedAtMs: Date.now(),
  };

  subscriptions.push(sub);
  return sub;
}

export function unsubscribe(subscriptionId: string): void {
  const sub = subscriptions.find((s) => s.subscriptionId === subscriptionId);
  if (sub) {
    sub.enabled = false;
    sub.updatedAtMs = Date.now();
  }
}

export function updateEventPreferences(
  subscriptionId: string,
  preferenceLevel: EventPreferenceLevel,
): EventSubscription | undefined {
  const sub = subscriptions.find((s) => s.subscriptionId === subscriptionId);
  if (!sub) return undefined;
  sub.preferenceLevel = preferenceLevel;
  sub.updatedAtMs = Date.now();
  return sub;
}

export function setRouteSubscriptions(
  subscriptionId: string,
  routes: string[],
): EventSubscription | undefined {
  const sub = subscriptions.find((s) => s.subscriptionId === subscriptionId);
  if (!sub) return undefined;
  sub.routes = normalizeRoutes(routes);
  sub.updatedAtMs = Date.now();
  return sub;
}

export function listSubscriptionsByRecipient(
  recipientType: SubscriptionRecipientType,
  recipientId: string,
): EventSubscription[] {
  return subscriptions.filter(
    (s) => s.enabled && s.recipientType === recipientType && s.recipientId === recipientId,
  );
}

export function listRouteSubscriptions(route: string): EventSubscription[] {
  return subscriptions.filter((s) => s.enabled && s.routes.includes(route));
}

export function findMatchingSubscriptions(input: {
  category: PlatformEventCategory;
  eventType: string;
  route?: string;
}): EventSubscription[] {
  return subscriptions.filter((s) => {
    if (!s.enabled) return false;
    if (s.preferenceLevel === "none") return false;
    if (!s.categories.includes(input.category)) return false;
    if (s.eventTypes && s.eventTypes.length > 0 && !s.eventTypes.includes(input.eventType)) {
      return false;
    }
    if (input.route && s.routes.length > 0 && !s.routes.includes(input.route)) {
      return false;
    }
    return true;
  });
}

export function getSubscriptionStats(): {
  total: number;
  enabled: number;
  disabled: number;
} {
  return {
    total: subscriptions.length,
    enabled: subscriptions.filter((s) => s.enabled).length,
    disabled: subscriptions.filter((s) => !s.enabled).length,
  };
}
