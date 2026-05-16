/**
 * CountryChartEngine.ts
 *
 * Tracks top artists by country.
 * XP contributes to country chart via: performance, tips, votes, ticket sales, article reads, shares.
 * Purpose: Enable local competition and national pride while feeding global chart.
 */

export interface CountryChart {
  chartId: string;
  countryCode: string;
  countryName: string;
  rankings: Array<{
    rank: number;
    artistId: string;
    displayName: string;
    totalXP: number;
    xpSources: {
      performance: number;
      tips: number;
      votes: number;
      ticketSales: number;
      articleReads: number;
      shares: number;
      streakBonus: number;
    };
    previousRank?: number;
    movementSincePeriod: 'up' | 'down' | 'stable';
    lastUpdated: number;
  }>;
  periodStarted: number;
  periodEndedAt?: number;
  chartStatus: 'active' | 'archived';
}

export interface CountryChartXPEvent {
  eventId: string;
  artistId: string;
  countryCode: string;
  xpType:
    | 'performance'
    | 'tips'
    | 'votes'
    | 'ticket-sales'
    | 'article-reads'
    | 'shares'
    | 'streak-bonus';
  xpAmount: number;
  sourceId?: string; // e.g., performance ID, article ID
  recordedAt: number;
}

// In-memory registries
const countryCharts = new Map<string, CountryChart>();
const xpEvents = new Map<string, CountryChartXPEvent>();
let chartCounter = 0;
let eventCounter = 0;

/**
 * Creates new country chart for period.
 */
export function createCountryChart(input: { countryCode: string; countryName: string }): string {
  const chartId = `chart-country-${chartCounter++}-${input.countryCode}`;

  const chart: CountryChart = {
    chartId,
    countryCode: input.countryCode,
    countryName: input.countryName,
    rankings: [],
    periodStarted: Date.now(),
    chartStatus: 'active',
  };

  countryCharts.set(chartId, chart);
  return chartId;
}

/**
 * Records XP event for country chart.
 */
export function recordCountryChartXPEvent(input: {
  artistId: string;
  countryCode: string;
  xpType:
    | 'performance'
    | 'tips'
    | 'votes'
    | 'ticket-sales'
    | 'article-reads'
    | 'shares'
    | 'streak-bonus';
  xpAmount: number;
  sourceId?: string;
}): string {
  const eventId = `xp-event-${eventCounter++}`;

  const event: CountryChartXPEvent = {
    eventId,
    artistId: input.artistId,
    countryCode: input.countryCode,
    xpType: input.xpType,
    xpAmount: input.xpAmount,
    sourceId: input.sourceId,
    recordedAt: Date.now(),
  };

  xpEvents.set(eventId, event);
  return eventId;
}

/**
 * Updates country chart rankings (recalculates from events).
 * Pure calculation - no mutation except to chart rankings.
 */
export function updateCountryChartRankings(chartId: string): void {
  const chart = countryCharts.get(chartId);
  if (!chart) return;

  // Group XP events by artist
  const artistXP = new Map<
    string,
    {
      artistId: string;
      displayName: string;
      totalXP: number;
      xpSources: Record<string, number>;
    }
  >();

  const relevantEvents = Array.from(xpEvents.values()).filter(
    (e) => e.countryCode === chart.countryCode
  );

  relevantEvents.forEach((event) => {
    if (!artistXP.has(event.artistId)) {
      artistXP.set(event.artistId, {
        artistId: event.artistId,
        displayName: '', // Would be fetched from artist registry in real impl
        totalXP: 0,
        xpSources: {
          performance: 0,
          tips: 0,
          votes: 0,
          'ticket-sales': 0,
          'article-reads': 0,
          shares: 0,
          'streak-bonus': 0,
        },
      });
    }

    const artist = artistXP.get(event.artistId)!;
    artist.totalXP += event.xpAmount;
    artist.xpSources[event.xpType] = (artist.xpSources[event.xpType] ?? 0) + event.xpAmount;
  });

  // Sort by total XP
  const sorted = Array.from(artistXP.values()).sort((a, b) => b.totalXP - a.totalXP);

  // Build new rankings
  chart.rankings = sorted.map((artist, index) => ({
    rank: index + 1,
    artistId: artist.artistId,
    displayName: artist.displayName,
    totalXP: artist.totalXP,
    xpSources: artist.xpSources as any,
    previousRank: chart.rankings.find((r) => r.artistId === artist.artistId)?.rank,
    movementSincePeriod:
      chart.rankings.find((r) => r.artistId === artist.artistId)?.rank === index + 1
        ? 'stable'
        : chart.rankings.find((r) => r.artistId === artist.artistId)?.rank ?? 999 > index + 1
        ? 'up'
        : 'down',
    lastUpdated: Date.now(),
  }));
}

/**
 * Gets country chart (non-mutating).
 */
export function getCountryChart(chartId: string): CountryChart | null {
  return countryCharts.get(chartId) ?? null;
}

/**
 * Gets top N artists in country.
 */
export function getTopArtistsInCountryChart(
  countryCode: string,
  limit: number = 10
): CountryChart['rankings'] {
  const charts = Array.from(countryCharts.values()).filter(
    (c) => c.countryCode === countryCode && c.chartStatus === 'active'
  );

  if (charts.length === 0) return [];

  return charts[0].rankings.slice(0, limit);
}

/**
 * Gets XP breakdown for artist in country.
 */
export function getArtistXPBreakdownInCountry(
  artistId: string,
  countryCode: string
): { totalXP: number; byType: Record<string, number> } | null {
  const events = Array.from(xpEvents.values()).filter(
    (e) => e.artistId === artistId && e.countryCode === countryCode
  );

  if (events.length === 0) return null;

  const byType: Record<string, number> = {};
  let totalXP = 0;

  events.forEach((event) => {
    byType[event.xpType] = (byType[event.xpType] ?? 0) + event.xpAmount;
    totalXP += event.xpAmount;
  });

  return { totalXP, byType };
}

/**
 * Lists all active country charts (non-mutating).
 */
export function listActiveCountryCharts(): CountryChart[] {
  return Array.from(countryCharts.values()).filter((c) => c.chartStatus === 'active');
}

/**
 * Archives old country chart.
 */
export function archiveCountryChart(chartId: string): void {
  const chart = countryCharts.get(chartId);
  if (chart) {
    chart.chartStatus = 'archived';
    chart.periodEndedAt = Date.now();
  }
}

/**
 * Gets country chart report (admin).
 */
export function getCountryChartReport(): {
  activeCharts: number;
  totalXPRecorded: number;
  xpEventsByType: Record<string, number>;
  topCountries: Array<{ countryCode: string; countryName: string; totalXP: number }>;
} {
  const charts = listActiveCountryCharts();
  const allEvents = Array.from(xpEvents.values());

  const xpEventsByType: Record<string, number> = {};
  let totalXP = 0;

  allEvents.forEach((event) => {
    xpEventsByType[event.xpType] = (xpEventsByType[event.xpType] ?? 0) + event.xpAmount;
    totalXP += event.xpAmount;
  });

  // Get top countries by total XP
  const countryXP = new Map<string, { code: string; name: string; totalXP: number }>();

  allEvents.forEach((event) => {
    if (!countryXP.has(event.countryCode)) {
      const chart = charts.find((c) => c.countryCode === event.countryCode);
      countryXP.set(event.countryCode, {
        code: event.countryCode,
        name: chart?.countryName ?? event.countryCode,
        totalXP: 0,
      });
    }
    const entry = countryXP.get(event.countryCode)!;
    entry.totalXP += event.xpAmount;
  });

  const topCountries = Array.from(countryXP.values())
    .sort((a, b) => b.totalXP - a.totalXP)
    .slice(0, 20);

  return {
    activeCharts: charts.length,
    totalXPRecorded: totalXP,
    xpEventsByType,
    topCountries: topCountries.map((c) => ({
      countryCode: c.code,
      countryName: c.name,
      totalXP: c.totalXP,
    })),
  };
}
