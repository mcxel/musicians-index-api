export type TmiMonitorRole =
  | "fan"
  | "artist"
  | "performer"
  | "venue"
  | "sponsor"
  | "advertiser"
  | "admin"
  | "bot";

export type TmiMonitorPermission = {
  role: TmiMonitorRole;
  capabilities: string[];
};

export const TMI_MONITOR_PERMISSIONS: TmiMonitorPermission[] = [
  { role: "fan", capabilities: ["xp", "rewards", "messages", "public-feed", "safe-route-jump"] },
  { role: "artist", capabilities: ["profile", "rankings", "articles", "sponsor-interest", "booking"] },
  { role: "performer", capabilities: ["live-stats", "bookings", "fan-activity", "sponsor-interest", "wallet"] },
  { role: "venue", capabilities: ["show-schedule", "bookings", "audience-analytics", "sponsor-slots", "tickets"] },
  { role: "sponsor", capabilities: ["campaigns", "placements", "artist-discovery", "giveaways", "analytics"] },
  { role: "advertiser", capabilities: ["campaign-builder", "inventory", "placements", "targeting", "analytics"] },
  { role: "admin", capabilities: ["all-systems", "route-health", "bot-health", "launch-readiness", "blockers"] },
  { role: "bot", capabilities: ["test-telemetry"] },
];

export function getCapabilitiesForRole(role: TmiMonitorRole): string[] {
  const entry = TMI_MONITOR_PERMISSIONS.find((item) => item.role === role);
  return entry ? entry.capabilities : [];
}
