/**
 * AutonomyEngine - Actions Module
 * 
 * Defines actions the autonomy system can take.
 */

export type ActionType = 
  | 'throttle'
  | 'block'
  | 'escalate'
  | 'nudge'
  | 'promote'
  | 'recommend'
  | 'log'
  | 'notify';

export interface AutonomyAction {
  id: string;
  type: ActionType;
  target: string;
  parameters: Record<string, unknown>;
  timestamp: number;
}

export const ACTION_FACTORIES: Record<ActionType, (target: string, params?: Record<string, unknown>) => AutonomyAction> = {
  throttle: (target, params) => ({
    id: `action_${Date.now()}_throttle`,
    type: 'throttle',
    target,
    parameters: params || { duration: 300000 },
    timestamp: Date.now()
  }),
  block: (target, params) => ({
    id: `action_${Date.now()}_block`,
    type: 'block',
    target,
    parameters: params || { reason: 'Safety threshold exceeded' },
    timestamp: Date.now()
  }),
  escalate: (target, params) => ({
    id: `action_${Date.now()}_escalate`,
    type: 'escalate',
    target,
    parameters: params || { to: 'head-sentinel' },
    timestamp: Date.now()
  }),
  nudge: (target, params) => ({
    id: `action_${Date.now()}_nudge`,
    type: 'nudge',
    target,
    parameters: params || { message: 'Consider diversifying content' },
    timestamp: Date.now()
  }),
  promote: (target, params) => ({
    id: `action_${Date.now()}_promote`,
    type: 'promote',
    target,
    parameters: params || { boost: 1.5 },
    timestamp: Date.now()
  }),
  recommend: (target, params) => ({
    id: `action_${Date.now()}_recommend`,
    type: 'recommend',
    target,
    parameters: params || { items: [] },
    timestamp: Date.now()
  }),
  log: (target, params) => ({
    id: `action_${Date.now()}_log`,
    type: 'log',
    target,
    parameters: params || { level: 'info' },
    timestamp: Date.now()
  }),
  notify: (target, params) => ({
    id: `action_${Date.now()}_notify`,
    type: 'notify',
    target,
    parameters: params || { channels: ['dashboard'] },
    timestamp: Date.now()
  }),
};

export function createAction(type: ActionType, target: string, params?: Record<string, unknown>): AutonomyAction {
  const factory = ACTION_FACTORIES[type];
  if (!factory) {
    throw new Error(`Unknown action type: ${type}`);
  }
  return factory(target, params);
}
