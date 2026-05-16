/**
 * Tracks expression variants for lip-sync and emotional states.
 */
export interface ExpressionVariant {
  expressionId: string;
  morphTargets: Record<string, number>;
}

export const expressionRegistry = new Map<string, ExpressionVariant>();