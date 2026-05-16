import type { ChatRoomId } from "@/lib/chat/RoomChatEngine";

// ─── Types ────────────────────────────────────────────────────────────────────

export type BillboardSlotId = string;

export type BillboardPreviewType =
  | "sponsor_ad"
  | "artist_promo"
  | "event_card"
  | "prize_reveal"
  | "live_stats";

export type BillboardPreviewContent = {
  slotId: BillboardSlotId;
  type: BillboardPreviewType;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  videoUrl?: string;
  href: string;
  sponsorName?: string;
  accentColor?: string;
  badgeText?: string;
  liveStats?: {
    viewers: number;
    heatLevel: number;
  };
};

export type BillboardHoverState = {
  slotId: BillboardSlotId;
  roomId?: ChatRoomId;
  isHovered: boolean;
  previewVisible: boolean;
  previewContent: BillboardPreviewContent | null;
  hoverStartMs: number;
  previewDelayMs: number;
};

// ─── Registry ─────────────────────────────────────────────────────────────────

const slotRegistry = new Map<BillboardSlotId, BillboardPreviewContent>();
const hoverRegistry = new Map<BillboardSlotId, BillboardHoverState>();

const DEFAULT_PREVIEW_DELAY_MS = 350;

// ─── Public API ───────────────────────────────────────────────────────────────

export function registerBillboardSlot(content: BillboardPreviewContent): void {
  slotRegistry.set(content.slotId, content);
}

export function getBillboardSlot(slotId: BillboardSlotId): BillboardPreviewContent | undefined {
  return slotRegistry.get(slotId);
}

export function updateBillboardLiveStats(
  slotId: BillboardSlotId,
  viewers: number,
  heatLevel: number,
): void {
  const slot = slotRegistry.get(slotId);
  if (!slot) return;
  slot.liveStats = { viewers, heatLevel };
}

export function onBillboardHoverStart(
  slotId: BillboardSlotId,
  roomId?: ChatRoomId,
  previewDelayMs: number = DEFAULT_PREVIEW_DELAY_MS,
): BillboardHoverState {
  const state: BillboardHoverState = {
    slotId,
    roomId,
    isHovered: true,
    previewVisible: false,
    previewContent: slotRegistry.get(slotId) ?? null,
    hoverStartMs: Date.now(),
    previewDelayMs,
  };
  hoverRegistry.set(slotId, state);
  return state;
}

export function onBillboardHoverEnd(slotId: BillboardSlotId): void {
  const state = hoverRegistry.get(slotId);
  if (state) {
    state.isHovered = false;
    state.previewVisible = false;
  }
}

export function tickBillboardHover(slotId: BillboardSlotId): BillboardHoverState | null {
  const state = hoverRegistry.get(slotId);
  if (!state || !state.isHovered) return state ?? null;

  const elapsed = Date.now() - state.hoverStartMs;
  if (elapsed >= state.previewDelayMs) {
    state.previewVisible = true;
    state.previewContent = slotRegistry.get(slotId) ?? null;
  }

  return { ...state };
}

export function getActivePreviews(): BillboardHoverState[] {
  return Array.from(hoverRegistry.values()).filter(s => s.previewVisible);
}

export function getAllBillboardSlots(): BillboardPreviewContent[] {
  return Array.from(slotRegistry.values());
}
