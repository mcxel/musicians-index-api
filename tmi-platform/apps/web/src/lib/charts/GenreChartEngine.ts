/**
 * GenreChartEngine.ts
 *
 * Tracks top artists by music/performance genre.
 * Examples: hip-hop, trap, pop, rock, classical, comedy, beat-making, etc.
 * Purpose: Genre-specific discovery and competition.
 */

export interface GenreChart {
  chartId: string;
  genre: string;
  rankings: Array<{
    genreRank: number;
    artistId: string;
    displayName: string;
    genreXP: number;
    genreEngagementScore: number;
    previousRank?: number;
    movementSincePeriod: 'up' | 'down' | 'stable';
    lastUpdated: number;
  }>;
  periodStarted: number;
  periodEndedAt?: number;
  chartStatus: 'active' | 'archived';
}

export interface GenreXPEvent {
  eventId: string;
  artistId: string;
  genre: string;
  xpAmount: number;
  sourceId?: string;
  recordedAt: number;
}

// In-memory registries
const genreCharts = new Map<string, GenreChart>();
const genreXPEvents = new Map<string, GenreXPEvent>();
let chartCounter = 0;
let eventCounter = 0;

// Common genres
const supportedGenres = [
  'hip-hop',
  'trap',
  'boom-bap',
  'pop',
  'rock',
  'r-and-b',
  'funk',
  'soul',
  'jazz',
  'classical',
  'electronic',
  'beat-making',
  'comedy',
  'spoken-word',
  'indie',
  'alternative',
  'reggae',
  'afrobeat',
  'latin',
  'country',
];

/**
 * Creates genre chart for new genre.
 */
export function createGenreChart(genre: string): string {
  const chartId = `chart-genre-${chartCounter++}-${genre}`;

  const chart: GenreChart = {
    chartId,
    genre,
    rankings: [],
    periodStarted: Date.now(),
    chartStatus: 'active',
  };

  genreCharts.set(chartId, chart);
  return chartId;
}

/**
 * Records XP event for genre.
 */
export function recordGenreXPEvent(input: {
  artistId: string;
  genre: string;
  xpAmount: number;
  sourceId?: string;
}): string {
  const eventId = `genre-xp-${eventCounter++}`;

  const event: GenreXPEvent = {
    eventId,
    artistId: input.artistId,
    genre: input.genre,
    xpAmount: input.xpAmount,
    sourceId: input.sourceId,
    recordedAt: Date.now(),
  };

  genreXPEvents.set(eventId, event);

  // Create chart if doesn't exist
  if (!Array.from(genreCharts.values()).find((c) => c.genre === input.genre)) {
    createGenreChart(input.genre);
  }

  return eventId;
}

/**
 * Updates genre chart rankings.
 */
export function updateGenreChartRankings(genre: string): void {
  const charts = Array.from(genreCharts.values()).filter(
    (c) => c.genre === genre && c.chartStatus === 'active'
  );
  if (charts.length === 0) return;

  const chart = charts[0];

  // Aggregate XP by artist
  const artistXP = new Map<
    string,
    {
      artistId: string;
      displayName: string;
      genreXP: number;
      genreEngagementScore: number;
    }
  >();

  const relevantEvents = Array.from(genreXPEvents.values()).filter((e) => e.genre === genre);

  relevantEvents.forEach((event) => {
    if (!artistXP.has(event.artistId)) {
      artistXP.set(event.artistId, {
        artistId: event.artistId,
        displayName: '',
        genreXP: 0,
        genreEngagementScore: 0,
      });
    }

    const artist = artistXP.get(event.artistId)!;
    artist.genreXP += event.xpAmount;
    artist.genreEngagementScore += event.xpAmount; // In real impl, could have weighted scoring
  });

  // Sort by engagement
  const sorted = Array.from(artistXP.values()).sort(
    (a, b) => b.genreEngagementScore - a.genreEngagementScore
  );

  // Build rankings
  chart.rankings = sorted.map((artist, index) => ({
    genreRank: index + 1,
    artistId: artist.artistId,
    displayName: artist.displayName,
    genreXP: artist.genreXP,
    genreEngagementScore: artist.genreEngagementScore,
    previousRank: chart.rankings.find((r) => r.artistId === artist.artistId)?.genreRank,
    movementSincePeriod:
      chart.rankings.find((r) => r.artistId === artist.artistId)?.genreRank === index + 1
        ? 'stable'
        : chart.rankings.find((r) => r.artistId === artist.artistId)?.genreRank ?? 999 > index + 1
        ? 'up'
        : 'down',
    lastUpdated: Date.now(),
  }));
}

/**
 * Gets genre chart (non-mutating).
 */
export function getGenreChart(genre: string): GenreChart | null {
  const charts = Array.from(genreCharts.values()).filter(
    (c) => c.genre === genre && c.chartStatus === 'active'
  );
  return charts.length > 0 ? charts[0] : null;
}

/**
 * Gets top artists in genre.
 */
export function getTopArtistsInGenre(genre: string, limit: number = 10): GenreChart['rankings'] {
  const chart = getGenreChart(genre);
  if (!chart) return [];
  return chart.rankings.slice(0, limit);
}

/**
 * Lists all active genre charts (non-mutating).
 */
export function listActiveGenreCharts(): GenreChart[] {
  return Array.from(genreCharts.values()).filter((c) => c.chartStatus === 'active');
}

/**
 * Gets supported genres (reference).
 */
export function getSupportedGenres(): string[] {
  return supportedGenres;
}

/**
 * Archives genre chart.
 */
export function archiveGenreChart(genre: string): void {
  const charts = Array.from(genreCharts.values()).filter((c) => c.genre === genre);
  charts.forEach((chart) => {
    chart.chartStatus = 'archived';
    chart.periodEndedAt = Date.now();
  });
}

/**
 * Gets genre chart report (admin).
 */
export function getGenreChartReport(): {
  activeGenreCharts: number;
  genresWithArtists: Array<{ genre: string; artistCount: number; totalXP: number }>;
  mostCompetitiveGenre: { genre: string; artistCount: number } | null;
} {
  const active = listActiveGenreCharts();

  const genresWithArtists = active
    .map((chart) => ({
      genre: chart.genre,
      artistCount: chart.rankings.length,
      totalXP: chart.rankings.reduce((sum, r) => sum + r.genreXP, 0),
    }))
    .sort((a, b) => b.artistCount - a.artistCount);

  return {
    activeGenreCharts: active.length,
    genresWithArtists,
    mostCompetitiveGenre:
      genresWithArtists.length > 0
        ? { genre: genresWithArtists[0].genre, artistCount: genresWithArtists[0].artistCount }
        : null,
  };
}
