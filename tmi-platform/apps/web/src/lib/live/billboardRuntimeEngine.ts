// BillboardRuntimeEngine — sponsor bubbles, live preview windows, ad rotation

export type BillboardSlot = {
  id: string;
  venueSlug: string;
  sponsorId: string;
  sponsorName: string;
  message: string;
  imageUrl: string | null;
  ctaLabel: string;
  ctaUrl: string;
  displayDurationSec: number;
  activeSince: number | null;
  impressions: number;
  clicks: number;
  priority: number;
};

export type VenueBillboardState = {
  venueSlug: string;
  current: BillboardSlot | null;
  queue: BillboardSlot[];
  previewWindows: string[]; // preview iframe/embed urls
  rotationCount: number;
  totalImpressions: number;
};

const billboardRegistry = new Map<string, VenueBillboardState>();

function genBillId(): string {
  return `bill-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
}

export function getVenueBillboardState(venueSlug: string): VenueBillboardState {
  if (!billboardRegistry.has(venueSlug)) {
    billboardRegistry.set(venueSlug, {
      venueSlug,
      current: null,
      queue: [],
      previewWindows: [],
      rotationCount: 0,
      totalImpressions: 0,
    });
  }
  return billboardRegistry.get(venueSlug)!;
}

export function addSponsorSlot(
  venueSlug: string,
  params: Omit<BillboardSlot, "id" | "venueSlug" | "activeSince" | "impressions" | "clicks">,
): BillboardSlot {
  const state = getVenueBillboardState(venueSlug);
  const slot: BillboardSlot = {
    id: genBillId(),
    venueSlug,
    ...params,
    activeSince: null,
    impressions: 0,
    clicks: 0,
  };
  state.queue.push(slot);
  state.queue.sort((a, b) => a.priority - b.priority);
  // Auto-activate if nothing is current
  if (!state.current) rotateToNextBillboard(venueSlug);
  return slot;
}

export function rotateToNextBillboard(venueSlug: string): BillboardSlot | null {
  const state = getVenueBillboardState(venueSlug);
  if (state.current) {
    // Requeue at end
    state.current.activeSince = null;
    state.queue.push(state.current);
  }
  const next = state.queue.shift() ?? null;
  if (next) {
    next.activeSince = Date.now();
    next.impressions += 1;
    state.totalImpressions += 1;
    state.rotationCount += 1;
  }
  state.current = next;
  return next;
}

export function recordBillboardClick(venueSlug: string): void {
  const state = getVenueBillboardState(venueSlug);
  if (state.current) state.current.clicks += 1;
}

export function addPreviewWindow(venueSlug: string, embedUrl: string): void {
  const state = getVenueBillboardState(venueSlug);
  if (!state.previewWindows.includes(embedUrl)) {
    state.previewWindows.push(embedUrl);
  }
}

export function getBillboardSnapshot(venueSlug: string) {
  const state = getVenueBillboardState(venueSlug);
  return {
    venueSlug: state.venueSlug,
    current: state.current,
    queueLength: state.queue.length,
    rotationCount: state.rotationCount,
    totalImpressions: state.totalImpressions,
    previewWindows: state.previewWindows,
  };
}
