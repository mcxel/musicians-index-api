/**
 * GlobalChartEngine.ts
 *
 * Tracks top artists worldwide.
 * Aggregates XP from all countries, takes country winners, global engagement.
 * Purpose: Global leaderboard showing the most engaged artists.
 */

export interface GlobalChart {
  chartId: string;
  rankings: Array<{
    globalRank: number;
    artistId: string;
    displayName: string;
    countryCode: string;
    totalGlobalXP: number;
    countryXP: number;
    globalEngagementScore: number; // weighted scoring
    previousRank?: number;
    movementSincePeriod: 'up' | 'down' | 'stable';
    lastUpdated: number;
  }>;
  periodStarted: number;
  periodEndedAt?: number;
  chartStatus: 'active' | 'archived';
}

export interface GlobalXPContribution {
  artistId: string;
  countryCode: string;
  countryRank: number;
  contributionXP: number;
  weight: number; // 0-1, higher if top-ranked in country
  recordedAt: number;
}

// In-memory registries
const globalCharts = new Map<string, GlobalChart>();
const globalXPContributions = new Map<string, GlobalXPContribution>();
let chartCounter = 0;

/**
 * Creates new global chart.
 */
export function createGlobalChart(): string {
  const chartId = `chart-global-${chartCounter++}`;

  const chart: GlobalChart = {
    chartId,
    rankings: [],
    periodStarted: Date.now(),
    chartStatus: 'active',
  };

  globalCharts.set(chartId, chart);
  return chartId;
}

/**
 * Records country rank contribution to global chart.
 */
export function recordGlobalXPContribution(input: {
  artistId: string;
  countryCode: string;
  countryRank: number;
  contributionXP: number;
}): void {
  const contributionId = `contribution-${input.artistId}-${input.countryCode}`;

  // Weight based on country rank (top 10 in country = higher weight)
  const weight = input.countryRank <= 10 ? 1.0 - (input.countryRank - 1) * 0.08 : 0.2;

  const contribution: GlobalXPContribution = {
    artistId: input.artistId,
    countryCode: input.countryCode,
    countryRank: input.countryRank,
    contributionXP: input.contributionXP,
    weight,
    recordedAt: Date.now(),
  };

  globalXPContributions.set(contributionId, contribution);
}

/**
 * Updates global chart rankings (recalculates from contributions).
 */
export function updateGlobalChartRankings(chartId: string): void {
  const chart = globalCharts.get(chartId);
  if (!chart) return;

  // Aggregate contributions by artist
  const artistScores = new Map<
    string,
    {
      artistId: string;
      displayName: string;
      countryCode: string;
      totalGlobalXP: number;
      countryXP: number;
      globalEngagementScore: number;
    }
  >();

  const contributions = Array.from(globalXPContributions.values());

  contributions.forEach((contrib) => {
    if (!artistScores.has(contrib.artistId)) {
      artistScores.set(contrib.artistId, {
        artistId: contrib.artistId,
        displayName: '', // Would be fetched from artist registry
        countryCode: contrib.countryCode,
        totalGlobalXP: 0,
        countryXP: 0,
        globalEngagementScore: 0,
      });
    }

    const artist = artistScores.get(contrib.artistId)!;
    artist.totalGlobalXP += contrib.contributionXP;
    artist.countryXP += contrib.contributionXP;
    artist.globalEngagementScore += contrib.contributionXP * contrib.weight;
  });

  // Sort by engagement score
  const sorted = Array.from(artistScores.values()).sort(
    (a, b) => b.globalEngagementScore - a.globalEngagementScore
  );

  // Build rankings
  chart.rankings = sorted.map((artist, index) => ({
    globalRank: index + 1,
    artistId: artist.artistId,
    displayName: artist.displayName,
    countryCode: artist.countryCode,
    totalGlobalXP: artist.totalGlobalXP,
    countryXP: artist.countryXP,
    globalEngagementScore: artist.globalEngagementScore,
    previousRank: chart.rankings.find((r) => r.artistId === artist.artistId)?.globalRank,
    movementSincePeriod:
      chart.rankings.find((r) => r.artistId === artist.artistId)?.globalRank === index + 1
        ? 'stable'
        : chart.rankings.find((r) => r.artistId === artist.artistId)?.globalRank ?? 999 > index + 1
        ? 'up'
        : 'down',
    lastUpdated: Date.now(),
  }));
}

/**
 * Gets global chart (non-mutating).
 */
export function getGlobalChart(chartId: string): GlobalChart | null {
  return globalCharts.get(chartId) ?? null;
}

/**
 * Gets active global chart.
 */
export function getActiveGlobalChart(): GlobalChart | null {
  const charts = Array.from(globalCharts.values()).filter((c) => c.chartStatus === 'active');
  return charts.length > 0 ? charts[0] : null;
}

/**
 * Gets top N artists globally.
 */
export function getGlobalTopArtists(limit: number = 10): GlobalChart['rankings'] {
  const chart = getActiveGlobalChart();
  if (!chart) return [];
  return chart.rankings.slice(0, limit);
}

/**
 * Checks if artist is in top N globally.
 */
export function isArtistInGlobalTop(artistId: string, topN: number = 100): boolean {
  const chart = getActiveGlobalChart();
  if (!chart) return false;
  return chart.rankings.slice(0, topN).some((r) => r.artistId === artistId);
}

/**
 * Archives old global chart.
 */
export function archiveGlobalChart(chartId: string): void {
  const chart = globalCharts.get(chartId);
  if (chart) {
    chart.chartStatus = 'archived';
    chart.periodEndedAt = Date.now();
  }
}

/**
 * Gets global chart report (admin).
 */
export function getGlobalChartReport(): {
  activeChart: GlobalChart | null;
  totalArtistsTracked: number;
  totalGlobalXP: number;
  topCountriesRepresented: Array<{ countryCode: string; count: number }>;
} {
  const chart = getActiveGlobalChart();

  if (!chart)
    return {
      activeChart: null,
      totalArtistsTracked: 0,
      totalGlobalXP: 0,
      topCountriesRepresented: [],
    };

  let totalXP = 0;
  const countryCounts: Record<string, number> = {};

  chart.rankings.forEach((ranking) => {
    totalXP += ranking.totalGlobalXP;
    countryCounts[ranking.countryCode] = (countryCounts[ranking.countryCode] ?? 0) + 1;
  });

  const topCountriesRepresented = Object.entries(countryCounts)
    .map(([code, count]) => ({ countryCode: code, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    activeChart: chart,
    totalArtistsTracked: chart.rankings.length,
    totalGlobalXP: totalXP,
    topCountriesRepresented,
  };
}
