/**
 * TieredAnalyticsEngine
 *
 * Governs analytics depth per subscription tier.
 * Free gets basic counts. Diamond gets predictive AI + full suite.
 *
 * Tiers: free → pro → RUBY → silver → gold → platinum → diamond
 */

export type SubscriptionTier = 'free' | 'pro' | 'ruby' | 'silver' | 'gold' | 'platinum' | 'diamond';

export type InsightEngine =
  | 'AudienceInsightEngine'
  | 'CreatorGrowthEngine'
  | 'SponsorPerformanceEngine'
  | 'FanRetentionEngine'
  | 'RevenuePredictionEngine'
  | 'TrendMomentumEngine'
  | 'EngagementHeatmapEngine';

export interface TierCapabilities {
  tier: SubscriptionTier;
  historyDays: number;
  enabledEngines: InsightEngine[];
  features: {
    basicStats: boolean;
    engagementCharts: boolean;
    audienceRetention: boolean;
    trendAlerts: boolean;
    sponsorAnalytics: boolean;
    predictiveInsights: boolean;
    audienceSegmentation: boolean;
    conversionAnalytics: boolean;
    heatmaps: boolean;
    exportDownload: boolean;
    realtimeInsights: boolean;
    aiRecommendations: boolean;
    rankingTrajectory: boolean;
    revenueForecasting: boolean;
  };
}

export const TIER_ORDER: SubscriptionTier[] = ['free', 'pro', 'ruby', 'silver', 'gold', 'platinum', 'diamond'];

export const TIER_CAPABILITIES: Record<SubscriptionTier, TierCapabilities> = {
  free: {
    tier: 'free',
    historyDays: 7,
    enabledEngines: [],
    features: {
      basicStats: true,
      engagementCharts: false,
      audienceRetention: false,
      trendAlerts: false,
      sponsorAnalytics: false,
      predictiveInsights: false,
      audienceSegmentation: false,
      conversionAnalytics: false,
      heatmaps: false,
      exportDownload: false,
      realtimeInsights: false,
      aiRecommendations: false,
      rankingTrajectory: false,
      revenueForecasting: false,
    },
  },
  pro: {
    tier: 'pro',
    historyDays: 14,
    enabledEngines: ['AudienceInsightEngine'],
    features: {
      basicStats: true,
      engagementCharts: true,
      audienceRetention: false,
      trendAlerts: false,
      sponsorAnalytics: false,
      predictiveInsights: false,
      audienceSegmentation: false,
      conversionAnalytics: false,
      heatmaps: false,
      exportDownload: false,
      realtimeInsights: false,
      aiRecommendations: false,
      rankingTrajectory: false,
      revenueForecasting: false,
    },
  },
  ruby: {
    tier: 'ruby',
    historyDays: 30,
    enabledEngines: ['AudienceInsightEngine', 'FanRetentionEngine'],
    features: {
      basicStats: true,
      engagementCharts: true,
      audienceRetention: true,
      trendAlerts: false,
      sponsorAnalytics: false,
      predictiveInsights: false,
      audienceSegmentation: false,
      conversionAnalytics: false,
      heatmaps: false,
      exportDownload: false,
      realtimeInsights: false,
      aiRecommendations: true,
      rankingTrajectory: false,
      revenueForecasting: false,
    },
  },
  silver: {
    tier: 'silver',
    historyDays: 60,
    enabledEngines: ['AudienceInsightEngine', 'FanRetentionEngine', 'SponsorPerformanceEngine', 'TrendMomentumEngine'],
    features: {
      basicStats: true,
      engagementCharts: true,
      audienceRetention: true,
      trendAlerts: true,
      sponsorAnalytics: true,
      predictiveInsights: false,
      audienceSegmentation: false,
      conversionAnalytics: false,
      heatmaps: false,
      exportDownload: false,
      realtimeInsights: false,
      aiRecommendations: true,
      rankingTrajectory: false,
      revenueForecasting: false,
    },
  },
  gold: {
    tier: 'gold',
    historyDays: 90,
    enabledEngines: ['AudienceInsightEngine', 'FanRetentionEngine', 'SponsorPerformanceEngine', 'TrendMomentumEngine', 'CreatorGrowthEngine'],
    features: {
      basicStats: true,
      engagementCharts: true,
      audienceRetention: true,
      trendAlerts: true,
      sponsorAnalytics: true,
      predictiveInsights: true,
      audienceSegmentation: false,
      conversionAnalytics: true,
      heatmaps: false,
      exportDownload: false,
      realtimeInsights: false,
      aiRecommendations: true,
      rankingTrajectory: true,
      revenueForecasting: false,
    },
  },
  platinum: {
    tier: 'platinum',
    historyDays: 180,
    enabledEngines: ['AudienceInsightEngine', 'FanRetentionEngine', 'SponsorPerformanceEngine', 'TrendMomentumEngine', 'CreatorGrowthEngine', 'RevenuePredictionEngine'],
    features: {
      basicStats: true,
      engagementCharts: true,
      audienceRetention: true,
      trendAlerts: true,
      sponsorAnalytics: true,
      predictiveInsights: true,
      audienceSegmentation: true,
      conversionAnalytics: true,
      heatmaps: false,
      exportDownload: true,
      realtimeInsights: false,
      aiRecommendations: true,
      rankingTrajectory: true,
      revenueForecasting: true,
    },
  },
  diamond: {
    tier: 'diamond',
    historyDays: 365,
    enabledEngines: [
      'AudienceInsightEngine',
      'FanRetentionEngine',
      'SponsorPerformanceEngine',
      'TrendMomentumEngine',
      'CreatorGrowthEngine',
      'RevenuePredictionEngine',
      'EngagementHeatmapEngine',
    ],
    features: {
      basicStats: true,
      engagementCharts: true,
      audienceRetention: true,
      trendAlerts: true,
      sponsorAnalytics: true,
      predictiveInsights: true,
      audienceSegmentation: true,
      conversionAnalytics: true,
      heatmaps: true,
      exportDownload: true,
      realtimeInsights: true,
      aiRecommendations: true,
      rankingTrajectory: true,
      revenueForecasting: true,
    },
  },
};

export interface AnalyticsMetric {
  label: string;
  value: string | number;
  delta?: string;
  color: string;
  locked: boolean;
  requiredTier: SubscriptionTier;
}

export interface AiInsight {
  engine: InsightEngine;
  headline: string;
  body: string;
  urgency: 'info' | 'warning' | 'opportunity';
  locked: boolean;
}

export interface TieredAnalyticsSnapshot {
  tier: SubscriptionTier;
  capabilities: TierCapabilities;
  metrics: AnalyticsMetric[];
  insights: AiInsight[];
  upgradePrompt: string | null;
}

function isLocked(requiredTier: SubscriptionTier, userTier: SubscriptionTier): boolean {
  return TIER_ORDER.indexOf(userTier) < TIER_ORDER.indexOf(requiredTier);
}

export function getAnalyticsSnapshot(
  userTier: SubscriptionTier,
  context: 'artist' | 'fan' | 'sponsor' | 'advertiser' | 'venue' = 'artist',
): TieredAnalyticsSnapshot {
  const capabilities = TIER_CAPABILITIES[userTier];

  // Rule 20 Real-Stat Law: never fabricate views/earnings/rank.
  // Until a real analytics registry feed is wired, unlocked metrics are honest zeros.
  const empty = '0';
  const metrics: AnalyticsMetric[] = [
    { label: 'Profile Views', value: empty, color: '#00FFFF', locked: false, requiredTier: 'free' },
    { label: 'Beat Plays', value: empty, color: '#FF2DAA', locked: isLocked('pro', userTier), requiredTier: 'pro' },
    { label: 'Fan Messages', value: empty, color: '#FFD700', locked: isLocked('ruby', userTier), requiredTier: 'ruby' },
    { label: 'Avg Watch Time', value: '—', color: '#AA2DFF', locked: isLocked('ruby', userTier), requiredTier: 'ruby' },
    { label: 'Follower Growth', value: empty, color: '#00FF88', locked: isLocked('silver', userTier), requiredTier: 'silver' },
    { label: 'Revenue This Month', value: '$0', color: '#FFD700', locked: isLocked('gold', userTier), requiredTier: 'gold' },
    { label: 'Sponsor Interactions', value: empty, color: '#FF9200', locked: isLocked('silver', userTier), requiredTier: 'silver' },
    { label: 'Conversion Rate', value: '—', color: '#00FF88', locked: isLocked('gold', userTier), requiredTier: 'gold' },
    { label: 'Audience Score', value: '—', color: '#AA2DFF', locked: isLocked('platinum', userTier), requiredTier: 'platinum' },
    { label: 'Revenue Forecast', value: '—', color: '#FFD700', locked: isLocked('platinum', userTier), requiredTier: 'platinum' },
    { label: 'Heatmap Sessions', value: empty, color: '#FF2DAA', locked: isLocked('diamond', userTier), requiredTier: 'diamond' },
    { label: 'Ranking Trajectory', value: '—', color: '#00FFFF', locked: isLocked('gold', userTier), requiredTier: 'gold' },
  ];

  // No fabricated AI insights. Engines stay capability-gated; bodies stay empty until real data exists.
  const allInsights: AiInsight[] = capabilities.enabledEngines.map((engine) => ({
    engine,
    headline: 'No activity yet',
    body: 'Insights appear after real campaign, stream, or engagement data is recorded.',
    urgency: 'info' as const,
    locked: false,
  }));

  const nextTier = TIER_ORDER[TIER_ORDER.indexOf(userTier) + 1];
  const upgradePrompt = nextTier
    ? `Upgrade to ${nextTier.toUpperCase()} to unlock ${TIER_CAPABILITIES[nextTier].enabledEngines.length - capabilities.enabledEngines.length} more AI engines and ${TIER_CAPABILITIES[nextTier].historyDays - capabilities.historyDays} additional days of history.`
    : null;

  return {
    tier: userTier,
    capabilities,
    metrics,
    insights: allInsights,
    upgradePrompt,
  };
}

export const ENGINE_META: Record<InsightEngine, { label: string; color: string; description: string }> = {
  AudienceInsightEngine:    { label: 'Audience Insight',     color: '#00FFFF', description: 'Who your fans are, when they engage, where they come from' },
  CreatorGrowthEngine:      { label: 'Creator Growth',       color: '#FF2DAA', description: 'Upload cadence, follower trajectory, content performance patterns' },
  SponsorPerformanceEngine: { label: 'Sponsor Performance',  color: '#FF9200', description: 'Placement CTR, sponsor ROI, ad interaction heatmaps' },
  FanRetentionEngine:       { label: 'Fan Retention',        color: '#AA2DFF', description: 'Day-1/7/30 retention curves, churn signals, re-engagement windows' },
  RevenuePredictionEngine:  { label: 'Revenue Prediction',   color: '#FFD700', description: '30-day revenue forecasts, beat sales velocity, subscription momentum' },
  TrendMomentumEngine:      { label: 'Trend Momentum',       color: '#00FF88', description: 'Genre trend velocity, competitor gap analysis, viral signal detection' },
  EngagementHeatmapEngine:  { label: 'Engagement Heatmap',   color: '#FF2DAA', description: 'Second-by-second engagement mapping, exit spike detection, attention scoring' },
};
