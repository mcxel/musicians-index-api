/**
 * AutonomyEngine - Decision Chain Module
 * 
 * Defines decision chains and handoffs.
 */

export type DecisionStepType = 
  | 'evaluate'
  | 'guardrail_check'
  | 'action'
  | 'handoff'
  | 'fallback'
  | 'complete';

export interface DecisionChainStep {
  id: string;
  type: DecisionStepType;
  description: string;
  nextStepId?: string;
  fallbackStepId?: string;
  botFamily?: string;
}

export interface DecisionChain {
  id: string;
  name: string;
  description: string;
  steps: DecisionChainStep[];
  entryStepId: string;
}

export const DECISION_CHAINS: DecisionChain[] = [
  {
    id: 'dc_001',
    name: 'Content Moderation Chain',
    description: 'Handles content moderation decisions',
    entryStepId: 'step_001',
    steps: [
      { id: 'step_001', type: 'evaluate', description: 'Evaluate content safety score', nextStepId: 'step_002' },
      { id: 'step_002', type: 'guardrail_check', description: 'Check safety guardrails', nextStepId: 'step_003', fallbackStepId: 'step_004' },
      { id: 'step_003', type: 'complete', description: 'Approve content' },
      { id: 'step_004', type: 'handoff', description: 'Escalate to moderation bot', botFamily: 'moderation' },
    ]
  },
  {
    id: 'dc_002',
    name: 'Revenue Protection Chain',
    description: 'Protects revenue streams',
    entryStepId: 'step_001',
    steps: [
      { id: 'step_001', type: 'evaluate', description: 'Evaluate revenue metrics', nextStepId: 'step_002' },
      { id: 'step_002', type: 'guardrail_check', description: 'Check revenue guardrails', nextStepId: 'step_003', fallbackStepId: 'step_004' },
      { id: 'step_003', type: 'complete', description: 'Continue normal operation' },
      { id: 'step_004', type: 'handoff', description: 'Escalate to revenue protection', botFamily: 'revenue' },
    ]
  },
];

export function getDecisionChain(id: string): DecisionChain | undefined {
  return DECISION_CHAINS.find(chain => chain.id === id);
}

export function getDecisionChainByName(name: string): DecisionChain | undefined {
  return DECISION_CHAINS.find(chain => chain.name.toLowerCase() === name.toLowerCase());
}
