// Sponsor Tracking Engine
// Tracks: views, clicks, conversions, reward_claims per sponsor
// Persists to localStorage; SSR-safe (no-ops on server)

export type SponsorTrackingEvent = "view" | "click" | "conversion" | "reward_claim";

export type SponsorMetrics = {
  sponsorId: string;
  views: number;
  clicks: number;
  conversions: number;
  rewardClaims: number;
  lastEventAt: number; // unix ms
};

const STORAGE_KEY = "tmi_sponsor_tracking_v1";

let _cache: Record<string, SponsorMetrics> | null = null;

function load(): Record<string, SponsorMetrics> {
  if (_cache) return _cache;
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    _cache = raw ? (JSON.parse(raw) as Record<string, SponsorMetrics>) : {};
  } catch {
    _cache = {};
  }
  return _cache;
}

function save(data: Record<string, SponsorMetrics>): void {
  _cache = data;
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage quota — fail silently
  }
}

function getOrInit(sponsorId: string, store: Record<string, SponsorMetrics>): SponsorMetrics {
  if (!store[sponsorId]) {
    store[sponsorId] = { sponsorId, views: 0, clicks: 0, conversions: 0, rewardClaims: 0, lastEventAt: 0 };
  }
  return store[sponsorId];
}

export function trackSponsorEvent(sponsorId: string, event: SponsorTrackingEvent): void {
  const store = load();
  const m = getOrInit(sponsorId, store);
  m.lastEventAt = Date.now();
  switch (event) {
    case "view":         m.views         += 1; break;
    case "click":        m.clicks        += 1; break;
    case "conversion":   m.conversions   += 1; break;
    case "reward_claim": m.rewardClaims  += 1; break;
  }
  store[sponsorId] = m;
  save(store);
}

export function getSponsorMetrics(sponsorId: string): SponsorMetrics {
  const store = load();
  return { ...getOrInit(sponsorId, store) };
}

export function getAllSponsorMetrics(): SponsorMetrics[] {
  return Object.values(load());
}

export function getTopSponsorsByClicks(limit = 5): SponsorMetrics[] {
  return getAllSponsorMetrics()
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, limit);
}

export function getConversionRate(sponsorId: string): number {
  const m = getSponsorMetrics(sponsorId);
  if (m.clicks === 0) return 0;
  return Math.round((m.conversions / m.clicks) * 1000) / 10; // percent, 1dp
}

export function resetSponsorMetrics(sponsorId: string): void {
  const store = load();
  delete store[sponsorId];
  save(store);
}
