/**
 * TieredAnalyticsEngine
 *
 * Governs analytics depth per subscription tier.
 * Free gets basic counts. Diamond gets predictive AI + full suite.
 *
 * Tiers: free → pro → bronze → silver → gold → platinum → diamond
 */

export type SubscriptionTier = 'free' | 'pro' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

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

export const TIER_ORDER: SubscriptionTier[] = ['free', 'pro', 'bronze', 'silver', 'gold', 'platinum', 'diamond'];

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
  bronze: {
    tier: 'bronze',
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

  const metrics: AnalyticsMetric[] = [
    { label: 'Profile Views', value: '12.4K', delta: '+8%', color: '#00FFFF', locked: false, requiredTier: 'free' },
    { label: 'Beat Plays',    value: '89.2K', delta: '+22%', color: '#FF2DAA', locked: isLocked('pro', userTier), requiredTier: 'pro' },
    { label: 'Fan Messages',  value: '1,842', delta: '+5%',  color: '#FFD700', locked: isLocked('bronze', userTier), requiredTier: 'bronze' },
    { label: 'Avg Watch Time', value: '4m 12s', delta: '-1m', color: '#AA2DFF', locked: isLocked('bronze', userTier), requiredTier: 'bronze' },
    { label: 'Follower Growth', value: '+340', delta: '+12%', color: '#00FF88', locked: isLocked('silver', userTier), requiredTier: 'silver' },
    { label: 'Revenue This Month', value: '$12,680', delta: '+31%', color: '#FFD700', locked: isLocked('gold', userTier), requiredTier: 'gold' },
    { label: 'Sponsor Interactions', value: '5,910', delta: '+44%', color: '#FF9200', locked: isLocked('silver', userTier), requiredTier: 'silver' },
    { label: 'Conversion Rate', value: '7.3%', delta: '+1.2%', color: '#00FF88', locked: isLocked('gold', userTier), requiredTier: 'gold' },
    { label: 'Audience Score', value: '84/100', delta: '+3', color: '#AA2DFF', locked: isLocked('platinum', userTier), requiredTier: 'platinum' },
    { label: 'Revenue Forecast', value: '$18K', delta: '30-day', color: '#FFD700', locked: isLocked('platinum', userTier), requiredTier: 'platinum' },
    { label: 'Heatmap Sessions', value: '2,441', delta: 'live', color: '#FF2DAA', locked: isLocked('diamond', userTier), requiredTier: 'diamond' },
    { label: 'Ranking Trajectory', value: '#12 → #7', delta: '7-day', color: '#00FFFF', locked: isLocked('gold', userTier), requiredTier: 'gold' },
  ];

  const allInsights: AiInsight[] = [
    {
      engine: 'AudienceInsightEngine',
      headline: 'Peak audience window: 8–10 PM ET on Fridays',
      body: 'Your most engaged fans are active Fri nights. Schedule live drops during this window to maximize reach by ~34%.',
      urgency: 'opportunity',
      locked: isLocked('pro', userTier),
    },
    {
      engine: 'FanRetentionEngine',
      headline: 'Day-7 retention dropped 12% — post-show engagement gap',
      body: 'Fans who miss the first week after a show churn 3× faster. Consider an automated follow-up beat clip or behind-the-scenes drop on day 3.',
      urgency: 'warning',
      locked: isLocked('bronze', userTier),
    },
    {
      engine: 'TrendMomentumEngine',
      headline: '"Trap Soul" genre trending +61% in your audience this week',
      body: 'Three artists you compete with are posting Trap Soul content. A single release in this genre could capture 400+ new fans.',
      urgency: 'opportunity',
      locked: isLocked('silver', userTier),
    },
    {
      engine: 'SponsorPerformanceEngine',
      headline: 'Sponsor placement CTR below baseline by 2.1×',
      body: 'Your current sponsor slot at show minute 18 is underperforming. Moving it to minute 8 (pre-peak) typically improves CTR by 40%.',
      urgency: 'warning',
      locked: isLocked('silver', userTier),
    },
    {
      engine: 'CreatorGrowthEngine',
      headline: 'Upload cadence gap detected — 14 days since last drop',
      body: 'Creators with 7-day or less upload gaps grow 2.8× faster. Drop a short beat loop or freestyle to re-activate the algorithm.',
      urgency: 'warning',
      locked: isLocked('gold', userTier),
    },
    {
      engine: 'RevenuePredictionEngine',
      headline: 'Projected monthly revenue: $18,400 (+45% vs current)',
      body: 'Based on current beat sales velocity and ticket presales, you are on track for $18.4K this month if you launch a beat bundle drop this week.',
      urgency: 'opportunity',
      locked: isLocked('platinum', userTier),
    },
    {
      engine: 'EngagementHeatmapEngine',
      headline: 'Heatmap: audience exits spike at show minute 23',
      body: 'Live sessions show 30% of viewers exit at minute 23 consistently. This correlates with a 4-minute instrumental-only segment. Consider mixing in crowd interaction.',
      urgency: 'warning',
      locked: isLocked('diamond', userTier),
    },
  ];

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
