import { queueAssetRequest } from "./AiVisualQueueEngine";
import { listSlots, updateSlotStatus, type VisualSlotRecord } from "./VisualSlotRegistry";

export type StubDetectionKind =
  | "empty-slot"
  | "placeholder-asset"
  | "dead-url"
  | "stock-image-leak"
  | "temporary-asset";

export type StubDetectionResult = {
  slotId: string;
  detection: StubDetectionKind;
  reason: string;
  queuedRequestId?: string;
};

const STUB_PATTERNS = [/placeholder/i, /stub/i, /temp/i, /stock/i, /dummy/i, /example\.com/i];

function detectSlotStub(slot: VisualSlotRecord): StubDetectionResult | null {
  if (!slot.currentAssetId && !slot.pendingAssetId) {
    return { slotId: slot.slotId, detection: "empty-slot", reason: "slot has no current or pending asset" };
  }

  const ref = slot.currentAssetId ?? slot.pendingAssetId ?? "";
  const matchedPattern = STUB_PATTERNS.find((p) => p.test(ref));
  if (matchedPattern) {
    return { slotId: slot.slotId, detection: "placeholder-asset", reason: `matched pattern ${matchedPattern}` };
  }

  if (ref.startsWith("http://") || ref.startsWith("https://")) {
    if (ref.includes("404") || ref.includes("dead") || ref.includes("missing")) {
      return { slotId: slot.slotId, detection: "dead-url", reason: "asset reference appears dead or missing" };
    }
  }

  return null;
}

export function scanForStubAssets(): StubDetectionResult[] {
  const slots = listSlots();
  return slots
    .map(detectSlotStub)
    .filter((r): r is StubDetectionResult => Boolean(r));
}

export function autoQueueStubReplacements(): StubDetectionResult[] {
  const detections = scanForStubAssets();

  return detections.map((detection) => {
    const slot = listSlots().find((s) => s.slotId === detection.slotId);
    if (!slot) return detection;

    const queued = queueAssetRequest({
      assetKind: slot.assetType,
      aiAssetType:
        slot.assetType === "venue-skin"
          ? "venue-skin"
          : slot.assetType === "ticket-art"
          ? "ticket-design"
          : slot.assetType === "nft-art"
          ? "nft-artwork"
          : slot.assetType === "billboard-art"
          ? "billboard-scene"
          : "image",
      subject: `${slot.page}:${slot.component}:${slot.assetType}`,
      ownerSystem: slot.owner,
      route: slot.page,
      component: slot.component,
      slotId: slot.slotId,
      priority: "critical",
    });

    updateSlotStatus(slot.slotId, "queued");

    return {
      ...detection,
      queuedRequestId: queued.requestId,
    };
  });
}
