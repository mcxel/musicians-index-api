/**
 * CountryTrendEngine.ts
 *
 * Trend tracking for countries:
 * - Genre trends by country
 * - Artist trends
 * - Battle trends
 * - Regional momentum
 */

export interface TrendPoint {
  timestamp: number;
  value: number;
  trend: 'up' | 'down' | 'stable';
}

export interface CountryTrend {
  subject: string;
  type: 'genre' | 'artist' | 'battle' | 'room';
  countryCode: string;
  score: number;
  momentum: number; // -100 to +100
  points: TrendPoint[];
}

const trendsByCountry = new Map<string, Map<string, CountryTrend>>();
const trackingIntervals = new Map<string, NodeJS.Timeout>();

export class CountryTrendEngine {
  /**
   * Start tracking trends
   */
  static startTracking(): void {
    if (trackingIntervals.size === 0) {
      const interval = setInterval(() => {
        this.updateAllTrends();
      }, 300000); // Update every 5 minutes
      trackingIntervals.set('global', interval);
    }
  }

  /**
   * Stop tracking
   */
  static stopTracking(): void {
    for (const interval of trackingIntervals.values()) {
      clearInterval(interval);
    }
    trackingIntervals.clear();
  }

  /**
   * Record a trend event
   */
  static recordTrend(
    countryCode: string,
    subject: string,
    type: 'genre' | 'artist' | 'battle' | 'room',
    score: number
  ): void {
    const country = countryCode.toUpperCase();
    if (!trendsByCountry.has(country)) {
      trendsByCountry.set(country, new Map());
    }

    const trends = trendsByCountry.get(country)!;
    const key = `${type}:${subject}`;

    let trend = trends.get(key);
    if (!trend) {
      trend = {
        subject,
        type,
        countryCode: country,
        score: 0,
        momentum: 0,
        points: [],
      };
      trends.set(key, trend);
    }

    trend.score = score;
    trend.points.push({
      timestamp: Date.now(),
      value: score,
      trend: score > (trend.score * 1.1) ? 'up' : score < (trend.score * 0.9) ? 'down' : 'stable',
    });

    // Keep only last 100 points
    if (trend.points.length > 100) {
      trend.points.shift();
    }

    this.calculateMomentum(trend);
  }

  /**
   * Get top trends for country
   */
  static getTrends(countryCode: string, limit = 10): string[] {
    const country = countryCode.toUpperCase();
    const trends = trendsByCountry.get(country);
    if (!trends) return [];

    return Array.from(trends.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((t) => t.subject);
  }

  /**
   * Get trending genres in country
   */
  static getTrendingGenres(countryCode: string, limit = 5): string[] {
    const country = countryCode.toUpperCase();
    const trends = trendsByCountry.get(country);
    if (!trends) return [];

    return Array.from(trends.values())
      .filter((t) => t.type === 'genre')
      .sort((a, b) => b.momentum - a.momentum)
      .slice(0, limit)
      .map((t) => t.subject);
  }

  /**
   * Get trending artists in country
   */
  static getTrendingArtists(countryCode: string, limit = 5): string[] {
    const country = countryCode.toUpperCase();
    const trends = trendsByCountry.get(country);
    if (!trends) return [];

    return Array.from(trends.values())
      .filter((t) => t.type === 'artist')
      .sort((a, b) => b.momentum - a.momentum)
      .slice(0, limit)
      .map((t) => t.subject);
  }

  /**
   * Get trending battles in country
   */
  static getTrendingBattles(countryCode: string, limit = 5): string[] {
    const country = countryCode.toUpperCase();
    const trends = trendsByCountry.get(country);
    if (!trends) return [];

    return Array.from(trends.values())
      .filter((t) => t.type === 'battle')
      .sort((a, b) => b.momentum - a.momentum)
      .slice(0, limit)
      .map((t) => t.subject);
  }

  /**
   * Get trend momentum
   */
  static getTrendMomentum(
    countryCode: string,
    subject: string,
    type: 'genre' | 'artist' | 'battle' | 'room'
  ): number {
    const country = countryCode.toUpperCase();
    const trends = trendsByCountry.get(country);
    if (!trends) return 0;

    const trend = trends.get(`${type}:${subject}`);
    return trend?.momentum || 0;
  }

  /**
   * Calculate momentum for a trend
   */
  private static calculateMomentum(trend: CountryTrend): void {
    if (trend.points.length < 2) {
      trend.momentum = 0;
      return;
    }

    const recent = trend.points.slice(-10);
    const upCount = recent.filter((p) => p.trend === 'up').length;
    const downCount = recent.filter((p) => p.trend === 'down').length;

    trend.momentum = Math.round(((upCount - downCount) / recent.length) * 100);
  }

  /**
   * Update all trends
   */
  private static updateAllTrends(): void {
    for (const trends of trendsByCountry.values()) {
      for (const trend of trends.values()) {
        this.calculateMomentum(trend);
      }
    }
  }

  /**
   * Get all trends for country
   */
  static getAllTrends(countryCode: string): CountryTrend[] {
    const country = countryCode.toUpperCase();
    const trends = trendsByCountry.get(country);
    if (!trends) return [];
    return Array.from(trends.values()).sort((a, b) => b.score - a.score);
  }

  /**
   * Clear trends (for testing)
   */
  static clearTrends(): void {
    trendsByCountry.clear();
  }
}

export default CountryTrendEngine;
