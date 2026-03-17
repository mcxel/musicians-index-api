/**
 * AutonomyEngine Types
 */

export interface AutonomySignal {
  type: string;
  source: string;
  timestamp: number;
  data: Record<string, any>;
}

export interface AutonomyDecision {
  action: string;
  target: string;
  priority: number;
  reason: string;
  approved: boolean;
}

export interface AutonomyAction {
  type: string;
  payload: any;
  executedAt?: number;
}

export interface AutonomyObjective {
  name: string;
  weight: number;
  current: number;
  target: number;
}

export interface AutonomyScore {
  engagement: number;
  revenue: number;
  creator_satisfaction: number;
  viewer_satisfaction: number;
  fairness: number;
  safety: number;
  freshness: number;
  performance: number;
  sponsor_value: number;
  retention: number;
}

export interface GuardrailRule {
  id: string;
  name: string;
  description: string;
  category: 'safety' | 'brand' | 'fairness' | 'revenue' | 'privacy';
  autoChange: boolean;
  threshold?: number;
}

export interface BotConfig {
  id: string;
  name: string;
  family: string;
  priority: number;
  active: boolean;
  permissions: string[];
}

export interface DecisionChainStep {
  order: number;
  name: string;
  required: boolean;
  handler?: string;
}
