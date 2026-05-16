export type TmiWorldCapability =
  | "seated-audience"
  | "performer-monitor"
  | "profile-bridge"
  | "sponsor-slots"
  | "advertiser-campaigns"
  | "booking-actions"
  | "game-hooks"
  | "magazine-links"
  | "reward-xp-hooks"
  | "admin-observable"
  | "bot-telemetry";

export type TmiWorldCapabilityState = {
  worldId: string;
  capability: TmiWorldCapability;
  enabled: boolean;
  status: "active" | "locked" | "needs-setup";
  note?: string;
};

const CAPABILITIES = new Map<string, TmiWorldCapabilityState>();

function key(worldId: string, capability: TmiWorldCapability): string {
  return `${worldId}:${capability}`;
}

export function upsertWorldCapability(state: TmiWorldCapabilityState): void {
  CAPABILITIES.set(key(state.worldId, state.capability), state);
}

export function listWorldCapabilities(worldId?: string): TmiWorldCapabilityState[] {
  const all = [...CAPABILITIES.values()];
  if (!worldId) return all;
  return all.filter((item) => item.worldId === worldId);
}
