import { getEventLog, getEventSummary, type AnalyticsDomain } from "@/lib/analytics/PersonaAnalyticsEngine";

export type UniversalAnalyticsSnapshot = {
  generatedAt: string;
  totalEvents: number;
  lastEventAt: number | null;
  domains: Record<string, number>;
  personas: Record<string, number>;
  commerceEvidence: {
    purchasesTracked: number;
    advertiserEvents: number;
    sponsorEvents: number;
    nftEvents: number;
    beatEvents: number;
    ticketEvents: number;
    bookingEvents: number;
  };
  coverage: {
    requiredSignalsObserved: number;
    requiredSignalsTotal: number;
    coveragePct: number;
    missingSignals: string[];
  };
};

const REQUIRED_SIGNALS = [
  "revenue.received",
  "advertiser.impression",
  "advertiser.click",
  "contest.entry",
  "livestream.join",
  "livestream.start",
  "xp.earned",
] as const;

function countByNamePrefix(prefix: string): number {
  return getEventLog({ limit: 2000 }).filter((event) => event.eventName.startsWith(prefix)).length;
}

function countByDomain(domain: AnalyticsDomain): number {
  return getEventLog({ domain, limit: 2000 }).length;
}

export function getUniversalAnalyticsSnapshot(): UniversalAnalyticsSnapshot {
  const summary = getEventSummary();
  const events = getEventLog({ limit: 2000 });

  const observed = new Set(events.map((event) => event.eventName));
  const missingSignals = REQUIRED_SIGNALS.filter((name) => !observed.has(name));
  const requiredSignalsObserved = REQUIRED_SIGNALS.length - missingSignals.length;
  const coveragePct = Number(((requiredSignalsObserved / REQUIRED_SIGNALS.length) * 100).toFixed(1));

  return {
    generatedAt: new Date().toISOString(),
    totalEvents: summary.totalEvents,
    lastEventAt: summary.lastEventAt,
    domains: summary.byDomain,
    personas: summary.byPersona,
    commerceEvidence: {
      purchasesTracked: countByDomain("revenue"),
      advertiserEvents: countByDomain("advertiser"),
      sponsorEvents: countByDomain("sponsor"),
      nftEvents: countByNamePrefix("nft."),
      beatEvents: countByNamePrefix("beat."),
      ticketEvents: countByNamePrefix("ticket."),
      bookingEvents: countByNamePrefix("booking."),
    },
    coverage: {
      requiredSignalsObserved,
      requiredSignalsTotal: REQUIRED_SIGNALS.length,
      coveragePct,
      missingSignals,
    },
  };
}
