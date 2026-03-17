/**
 * AutonomyEngine - Objectives Module
 * 
 * Defines autonomy objectives and scoring targets.
 */

export type ObjectiveType = 
  | 'engagement'
  | 'revenue'
  | 'creator_satisfaction'
  | 'viewer_satisfaction'
  | 'fairness'
  | 'safety'
  | 'freshness'
  | 'performance'
  | 'sponsor_value'
  | 'retention';

export interface Objective {
  id: string;
  name: string;
  type: ObjectiveType;
  weight: number;
  minThreshold: number;
  maxThreshold: number;
  targetValue: number;
  enabled: boolean;
}

export interface ObjectiveScore {
  objectiveId: string;
  score: number;
  timestamp: number;
}

export const DEFAULT_OBJECTIVES: Objective[] = [
  { id: 'obj_engagement', name: 'Engagement Score', type: 'engagement', weight: 0.2, minThreshold: 0, maxThreshold: 100, targetValue: 75, enabled: true },
  { id: 'obj_revenue', name: 'Revenue Score', type: 'revenue', weight: 0.2, minThreshold: 0, maxThreshold: 100, targetValue: 70, enabled: true },
  { id: 'obj_safety', name: 'Safety Score', type: 'safety', weight: 0.25, minThreshold: 80, maxThreshold: 100, targetValue: 95, enabled: true },
  { id: 'obj_fairness', name: 'Fairness Score', type: 'fairness', weight: 0.15, minThreshold: 70, maxThreshold: 100, targetValue: 85, enabled: true },
  { id: 'obj_freshness', name: 'Freshness Score', type: 'freshness', weight: 0.1, minThreshold: 0, maxThreshold: 100, targetValue: 60, enabled: true },
  { id: 'obj_retention', name: 'Retention Score', type: 'retention', weight: 0.1, minThreshold: 0, maxThreshold: 100, targetValue: 65, enabled: true },
];

export function getObjectiveById(id: string): Objective | undefined {
  return DEFAULT_OBJECTIVES.find(obj => obj.id === id);
}

export function getEnabledObjectives(): Objective[] {
  return DEFAULT_OBJECTIVES.filter(obj => obj.enabled);
}
