/**
 * AutonomyEngine - Guardrails Module
 * 
 * Defines safety boundaries and hard limits.
 */

export type GuardrailCategory = 
  | 'safety'
  | 'revenue'
  | 'engagement'
  | 'performance'
  | 'compliance';

export interface Guardrail {
  id: string;
  name: string;
  category: GuardrailCategory;
  hardLimit: number;
  softLimit: number;
  action: 'block' | 'warn' | 'throttle' | 'escalate';
  enabled: boolean;
}

export const DEFAULT_GUARDRAILS: Guardrail[] = [
  { id: 'gr_001', name: 'Safety Score Floor', category: 'safety', hardLimit: 50, softLimit: 70, action: 'block', enabled: true },
  { id: 'gr_002', name: 'Revenue Floor', category: 'revenue', hardLimit: 20, softLimit: 40, action: 'escalate', enabled: true },
  { id: 'gr_003', name: 'Max Moderation Flags', category: 'safety', hardLimit: 100, softLimit: 50, action: 'throttle', enabled: true },
  { id: 'gr_004', name: 'Max User Reports', category: 'safety', hardLimit: 50, softLimit: 25, action: 'warn', enabled: true },
  { id: 'gr_005', name: 'Engagement Floor', category: 'engagement', hardLimit: 10, softLimit: 30, action: 'warn', enabled: true },
  { id: 'gr_006', name: 'Latency Ceiling', category: 'performance', hardLimit: 5000, softLimit: 2000, action: 'throttle', enabled: true },
  { id: 'gr_007', name: 'Error Rate Ceiling', category: 'performance', hardLimit: 0.1, softLimit: 0.05, action: 'block', enabled: true },
  { id: 'gr_008', name: 'Policy Violation Floor', category: 'compliance', hardLimit: 0, softLimit: 5, action: 'block', enabled: true },
];

export function getGuardrailById(id: string): Guardrail | undefined {
  return DEFAULT_GUARDRAILS.find(g => g.id === id);
}

export function getGuardrailsByCategory(category: GuardrailCategory): Guardrail[] {
  return DEFAULT_GUARDRAILS.filter(g => g.category === category && g.enabled);
}

export function isWithinHardLimit(guardrail: Guardrail, value: number): boolean {
  return value >= guardrail.hardLimit;
}

export function isWithinSoftLimit(guardrail: Guardrail, value: number): boolean {
  return value >= guardrail.softLimit;
}
