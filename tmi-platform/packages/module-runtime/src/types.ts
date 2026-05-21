// ─── Module IDs ───────────────────────────────────────────────────────────────
export type ModuleId =
  | "web"            // TMI – The Musicians Index
  | "bernoutglobal-llc" // BerntoutGlobal LLC corporate core
  | "law"            // Danika's Law
  | "xxl"            // BerntoutGlobal XXL
  | "mini-ace"       // Mini Ace
  | "thunderworld"   // Thunder World
  | "usa-stream-team"
  | "willdoit"       // WillDoIt
  | "hot-screens"    // HotScreens
  | "need-a-charge"  // Need-A-Charge / Rent-A-Charge
  | "transistor-hut"; // Transistor Hut

// ─── Runtime State ────────────────────────────────────────────────────────────
export type ModuleState =
  | "STOPPED"
  | "BOOTING"
  | "RUNNING"
  | "FROZEN"       // Processing paused, state preserved
  | "ISOLATED"     // External calls blocked, internal running
  | "EMERGENCY_LOCK"; // Immediate halt, logs preserved

// ─── Stimulation ──────────────────────────────────────────────────────────────
export type StimulationMode = "QUIET" | "NORMAL" | "STRESS" | "CHAOS";

export interface StimulationConfig {
  mode: StimulationMode;
  intensity: number;  // 0.0 – 1.0
  traffic: boolean;
  logic: boolean;
  failures: boolean;
  bots: boolean;
  security: boolean;
}

// ─── Module Config ────────────────────────────────────────────────────────────
export interface ModuleConfig {
  id: ModuleId;
  name: string;
  version: string;
  domain: string;
  port: number;
  runtime: {
    maxMemoryMb: number;
    maxQueueDepth: number;
    healthCheckIntervalMs: number;
    checkpointIntervalMs: number;
  };
  stimulation: {
    enabled: boolean;
    defaultMode: StimulationMode;
    defaultIntensity: number; // 0.0 – 1.0
  };
  isolation: {
    allowedOrigins: string[];
    requireAuthFor: string[]; // route glob patterns
  };
  contracts: {
    emits: string[];   // event types this module emits
    consumes: string[]; // event types this module handles
  };
}

// ─── Snapshots & Metrics ──────────────────────────────────────────────────────
export interface RuntimeSnapshot {
  moduleId: ModuleId;
  state: ModuleState;
  uptimeMs: number;
  memoryRssMb: number;
  memoryHeapUsedMb: number;
  queueDepth: number;
  stimulationMode: StimulationMode;
  healthScore: number; // 0–100
  lastCheckpointId: string | null;
  timestamp: number;
}

export interface HealthMetrics {
  cpuPercent: number;
  memoryMb: number;
  queueDepth: number;
  activeConnections: number;
  errorRatePerMin: number;
  p95ResponseMs: number;
  score: number; // 0–100 computed
}

// ─── Events ───────────────────────────────────────────────────────────────────
export interface ModuleEvent<T = unknown> {
  id: string;
  source: ModuleId;
  type: string;
  payload: T;
  timestamp: number;
  correlationId?: string;
  ttlMs?: number;
}

// ─── Recovery ─────────────────────────────────────────────────────────────────
export interface CheckpointData {
  id: string;
  moduleId: ModuleId;
  state: Record<string, unknown>;
  timestamp: number;
  reason: string;
}
