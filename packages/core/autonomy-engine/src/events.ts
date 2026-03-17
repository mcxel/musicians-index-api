/**
 * AutonomyEngine Events
 */

export const AutonomyEvents = {
  // Signal events
  SIGNAL_RECEIVED: 'autonomy:signal:received',
  SIGNAL_PROCESSED: 'autonomy:signal:processed',
  
  // Decision events
  DECISION_MADE: 'autonomy:decision:made',
  DECISION_APPROVED: 'autonomy:decision:approved',
  DECISION_REJECTED: 'autonomy:decision:rejected',
  DECISION_EXECUTED: 'autonomy:decision:executed',
  
  // Guardrail events
  GUARDRAIL_CHECK: 'autonomy:guardrail:check',
  GUARDRAIL_PASSED: 'autonomy:guardrail:passed',
  GUARDRAIL_FAILED: 'autonomy:guardrail:failed',
  
  // Objective events
  OBJECTIVE_UPDATED: 'autonomy:objective:updated',
  OBJECTIVE_THRESHOLD_REACHED: 'autonomy:objective:threshold',
  
  // Bot events
  BOT_ACTIVATED: 'autonomy:bot:activated',
  BOT_DEACTIVATED: 'autonomy:bot:deactivated',
  BOT_ACTION: 'autonomy:bot:action',
  
  // System events
  ENGINE_INITIALIZED: 'autonomy:engine:initialized',
  ENGINE_ERROR: 'autonomy:engine:error',
} as const;

export type AutonomyEventType = typeof AutonomyEvents[keyof typeof AutonomyEvents];
