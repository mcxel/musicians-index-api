// lib/mail/MailPreferenceEngine.ts — User opt-in/opt-out + Diamond auto-subscribe

export type MailCategory = "system" | "engagement" | "growth" | "revenue";

export interface MailPreferences {
  userId: string;
  email: string;
  system: boolean;       // always true — cannot be turned off
  engagement: boolean;   // challenges, live rooms, tips
  growth: boolean;       // weekly recap, re-engagement
  revenue: boolean;      // payout notifications
  diamondSubscribed: boolean;
  unsubscribedAll: boolean;
  updatedAt: number;
}

// In-memory store — replace with DB in production
const store = new Map<string, MailPreferences>();

function defaults(userId: string, email: string): MailPreferences {
  return {
    userId,
    email,
    system: true,
    engagement: true,
    growth: true,
    revenue: true,
    diamondSubscribed: false,
    unsubscribedAll: false,
    updatedAt: Date.now(),
  };
}

export function getPreferences(userId: string, email?: string): MailPreferences {
  const existing = store.get(userId);
  if (existing) return existing;
  const prefs = defaults(userId, email ?? "");
  store.set(userId, prefs);
  return prefs;
}

export function updatePreferences(
  userId: string,
  updates: Partial<Omit<MailPreferences, "userId" | "system" | "updatedAt">>
): MailPreferences {
  const prefs = getPreferences(userId);
  const merged: MailPreferences = {
    ...prefs,
    ...updates,
    system: true, // system emails always on
    updatedAt: Date.now(),
  };
  store.set(userId, merged);
  return merged;
}

export function unsubscribeAll(userId: string): void {
  const prefs = getPreferences(userId);
  store.set(userId, {
    ...prefs,
    engagement: false,
    growth: false,
    revenue: false,
    unsubscribedAll: true,
    updatedAt: Date.now(),
  });
}

export function resubscribe(userId: string): void {
  const prefs = getPreferences(userId);
  store.set(userId, {
    ...prefs,
    engagement: true,
    growth: true,
    revenue: true,
    unsubscribedAll: false,
    updatedAt: Date.now(),
  });
}

export function activateDiamondMail(userId: string): void {
  const prefs = getPreferences(userId);
  store.set(userId, {
    ...prefs,
    diamondSubscribed: true,
    engagement: true,
    growth: true,
    revenue: true,
    unsubscribedAll: false,
    updatedAt: Date.now(),
  });
}

export function canReceive(userId: string, category: MailCategory): boolean {
  const prefs = getPreferences(userId);
  if (prefs.unsubscribedAll && category !== "system") return false;
  if (category === "system") return true;
  return prefs[category];
}

export function getAllPreferences(): MailPreferences[] {
  return Array.from(store.values());
}

export function getOptInCount(): Record<MailCategory, number> {
  const all = getAllPreferences();
  return {
    system: all.length,
    engagement: all.filter(p => p.engagement && !p.unsubscribedAll).length,
    growth: all.filter(p => p.growth && !p.unsubscribedAll).length,
    revenue: all.filter(p => p.revenue && !p.unsubscribedAll).length,
  };
}
