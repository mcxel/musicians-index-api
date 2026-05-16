import type { TmiHomepageBeltKey } from "@/lib/homepage/tmiHomepageBeltEngine";

export type TmiHomepageOverlaySyncState = {
  page: TmiHomepageBeltKey;
  overlayId: string;
  motionKey: string;
  enabled: boolean;
};

const OVERLAY_SYNC = new Map<string, TmiHomepageOverlaySyncState>();

export function syncHomepageOverlay(state: TmiHomepageOverlaySyncState): void {
  OVERLAY_SYNC.set(state.overlayId, state);
}

export function listHomepageOverlaySyncStates(page?: TmiHomepageBeltKey): TmiHomepageOverlaySyncState[] {
  const all = [...OVERLAY_SYNC.values()];
  if (!page) return all;
  return all.filter((item) => item.page === page);
}
