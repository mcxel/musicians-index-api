export type ServerLatencyTier = "good" | "fair" | "slow";

const GOOD_LIMIT_MS = 100;
const SLOW_LIMIT_MS = 200;
const HYSTERESIS_MS = 12;

export function classifyServerLatency(ms: number, previous: ServerLatencyTier | null): ServerLatencyTier | null {
  if (!Number.isFinite(ms) || ms < 0) return null;
  if (previous === "good" && ms < GOOD_LIMIT_MS + HYSTERESIS_MS) return "good";
  if (previous === "slow" && ms >= SLOW_LIMIT_MS - HYSTERESIS_MS) return "slow";
  if (previous === "fair") {
    if (ms >= GOOD_LIMIT_MS - HYSTERESIS_MS && ms < SLOW_LIMIT_MS + HYSTERESIS_MS) return "fair";
  }
  return ms < GOOD_LIMIT_MS ? "good" : ms < SLOW_LIMIT_MS ? "fair" : "slow";
}