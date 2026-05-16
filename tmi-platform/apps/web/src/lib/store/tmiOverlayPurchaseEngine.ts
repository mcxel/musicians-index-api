import { purchaseOverlay } from "@/lib/store/tmiOverlayOwnershipEngine";

export function purchaseOverlayWithReceipt(userId: string, overlayId: string) {
  const result = purchaseOverlay(userId, overlayId);
  if (!result.ok) return result;
  return {
    ...result,
    receiptId: `rcpt_${userId}_${overlayId}_${Date.now()}`,
    purchasedAt: Date.now(),
  } as const;
}
