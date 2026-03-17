/**
 * AutonomyEngine - Signals Module
 * 
 * Defines signals for the autonomy system.
 */

export type SignalCategory = 
  | 'engagement'
  | 'revenue'
  | 'safety'
  | 'fatigue'
  | 'performance'
  | 'moderation';

export interface Signal {
  id: string;
  name: string;
  category: SignalCategory;
  value: number;
  timestamp: number;
  source: string;
  metadata?: Record<string, unknown>;
}

export const SIGNAL_DEFINITIONS = {
  // Engagement signals
  join_rate: { category: 'engagement', name: 'Join Rate', weight: 0.15 },
  chat_rate: { category: 'engagement', name: 'Chat Rate', weight: 0.12 },
  tip_rate: { category: 'engagement', name: 'Tip Rate', weight: 0.1 },
  share_rate: { category: 'engagement', name: 'Share Rate', weight: 0.08 },
  return_rate: { category: 'engagement', name: 'Return Rate', weight: 0.1 },
  
  // Revenue signals
  revenue_per_viewer: { category: 'revenue', name: 'Revenue Per Viewer', weight: 0.15 },
  sponsor_engagement: { category: 'revenue', name: 'Sponsor Engagement', weight: 0.1 },
  conversion_rate: { category: 'revenue', name: 'Conversion Rate', weight: 0.1 },
  
  // Safety signals
  moderation_flags: { category: 'safety', name: 'Moderation Flags', weight: 0.2 },
  user_reports: { category: 'safety', name: 'User Reports', weight: 0.15 },
  policy_violations: { category: 'safety', name: 'Policy Violations', weight: 0.2 },
  
  // Fatigue signals
  viewer_dropoff: { category: 'fatigue', name: 'Viewer Dropoff', weight: 0.12 },
  burnout_score: { category: 'fatigue', name: 'Burnout Score', weight: 0.1 },
  repeat_exposure: { category: 'fatigue', name: 'Repeat Exposure', weight: 0.08 },
  
  // Performance signals
  latency: { category: 'performance', name: 'Latency', weight: 0.1 },
  error_rate: { category: 'performance', name: 'Error Rate', weight: 0.15 },
  load_time: { category: 'performance', name: 'Load Time', weight: 0.08 },
};

export type SignalKey = keyof typeof SIGNAL_DEFINITIONS;

export function getSignalDefinition(key: SignalKey) {
  return SIGNAL_DEFINITIONS[key];
}

export function getSignalsByCategory(category: SignalCategory): SignalKey[] {
  return (Object.keys(SIGNAL_DEFINITIONS) as SignalKey[]).filter(
    key => SIGNAL_DEFINITIONS[key].category === category
  );
}
