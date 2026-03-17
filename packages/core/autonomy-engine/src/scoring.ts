/**
 * AutonomyEngine - Scoring Module
 * 
 * Handles composite scoring and weighting.
 */

import type { ObjectiveScore } from './objectives';

export interface CompositeScore {
  total: number;
  breakdown: ObjectiveScore[];
  timestamp: number;
  confidence: number;
}

export interface WeightedScore {
  objectiveId: string;
  rawScore: number;
  weight: number;
  weightedValue: number;
}

export function calculateCompositeScore(scores: WeightedScore[]): CompositeScore {
  const total = scores.reduce((sum, s) => sum + s.weightedValue, 0);
  const breakdown = scores.map(s => ({
    objectiveId: s.objectiveId,
    score: s.rawScore,
    timestamp: Date.now()
  }));
  
  return {
    total,
    breakdown,
    timestamp: Date.now(),
    confidence: calculateConfidence(scores)
  };
}

function calculateConfidence(scores: WeightedScore[]): number {
  if (scores.length === 0) return 0;
  const dataPoints = scores.filter(s => s.rawScore > 0).length;
  return Math.min(dataPoints / scores.length, 1);
}

export function getScoreGrade(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'fair';
  return 'poor';
}
