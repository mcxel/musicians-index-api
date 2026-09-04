/**
 * BudgetContracts.ts — MediaBudget backpressure
 */

export type BudgetResource =
  | "CPU"
  | "GPU"
  | "MEMORY"
  | "BANDWIDTH_UP"
  | "BANDWIDTH_DOWN"
  | "DECODE_SLOTS"
  | "ENCODE_SLOTS";

export interface MediaBudgetLimits {
  maxCpuPct: number;
  maxGpuPct: number;
  maxMemoryMb: number;
  maxBandwidthUpKbps: number;
  maxBandwidthDownKbps: number;
  maxDecodeSlots: number;
  maxEncodeSlots: number;
  maxConcurrentSources: number;
  maxVoltronParticipants: number;
}

export interface MediaBudgetUsage {
  cpuPct: number;
  gpuPct: number;
  memoryMb: number;
  bandwidthUpKbps: number;
  bandwidthDownKbps: number;
  decodeSlots: number;
  encodeSlots: number;
  concurrentSources: number;
}

export type BackpressureAction =
  | "NONE"
  | "REDUCE_QUALITY"
  | "DROP_SECONDARY"
  | "DISABLE_VOLTRON"
  | "PARK_NON_PRIMARY"
  | "REJECT_NEW_SOURCE";

export interface BackpressureDecision {
  action: BackpressureAction;
  resource: BudgetResource | null;
  reason: string;
  usage: MediaBudgetUsage;
  limits: MediaBudgetLimits;
}
