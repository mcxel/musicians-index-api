import { listOverlayInventory } from "@/lib/store/tmiOverlayInventoryEngine";

export function requestOverlayRefund(userId: string, overlayId: string) {
  const owned = listOverlayInventory(userId).some((row) => row.overlayId === overlayId);
  if (!owned) return { ok: false, reason: "NOT_OWNED" } as const;

  return {
    ok: true,
    status: "refund-pending",
    refundTicketId: `rfd_${userId}_${overlayId}_${Date.now()}`,
  } as const;
}
