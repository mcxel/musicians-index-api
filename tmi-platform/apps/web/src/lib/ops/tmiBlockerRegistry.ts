export type TmiBlockerSeverity = "warning" | "error" | "critical";
export type TmiBlockerStatus = "open" | "in-progress" | "resolved";

export type TmiBlocker = {
  id: string;
  title: string;
  details: string;
  severity: TmiBlockerSeverity;
  status: TmiBlockerStatus;
  area: "env" | "routes" | "payments" | "uploads" | "messaging" | "launch";
};

export const DEFAULT_BLOCKERS: TmiBlocker[] = [
  {
    id: "blk-env-001",
    title: "Missing production Stripe keys",
    details: "Stripe secret and webhook key not configured for production profile.",
    severity: "critical",
    status: "open",
    area: "payments",
  },
  {
    id: "blk-route-004",
    title: "Soft-launch shells still placeholders",
    details: "Several launch routes still run in shell mode and need full runtime wiring.",
    severity: "warning",
    status: "in-progress",
    area: "routes",
  },
  {
    id: "blk-launch-002",
    title: "Observatory baseline incomplete",
    details: "Launch observatory needs live data feed integration.",
    severity: "error",
    status: "open",
    area: "launch",
  },
];

export function summarizeBlockers(blockers: TmiBlocker[]): Record<TmiBlockerSeverity, number> {
  return blockers.reduce(
    (acc, blocker) => {
      acc[blocker.severity] += 1;
      return acc;
    },
    { warning: 0, error: 0, critical: 0 },
  );
}
