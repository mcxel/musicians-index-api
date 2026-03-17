// State Engine - Minimal Types
export type StateValue = unknown;
export interface StateRecord { key: string; value: StateValue; }
export interface StateSnapshot { timestamp: number; states: StateRecord[]; }
