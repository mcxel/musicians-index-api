import { listVisualSlots, isPlaceholderVisualRef, type VisualSlot } from "@/lib/visuals/TmiVisualSlotRegistry";

export type MissingVisualReason = "empty" | "placeholder";

export type MissingVisualRecord = {
  slotId: string;
  route: string;
  owner: string;
  reason: MissingVisualReason;
  currentRef: string | null;
};

function detect(slot: VisualSlot): MissingVisualRecord | null {
  const current = slot.images?.[0] ?? null;
  if (!current) {
    return {
      slotId: slot.slotId,
      route: slot.route,
      owner: slot.owner,
      reason: "empty",
      currentRef: null,
    };
  }

  if (isPlaceholderVisualRef(current)) {
    return {
      slotId: slot.slotId,
      route: slot.route,
      owner: slot.owner,
      reason: "placeholder",
      currentRef: current,
    };
  }

  return null;
}

export class VisualMissingAssetDetector {
  static listMissing(): MissingVisualRecord[] {
    return listVisualSlots()
      .map(detect)
      .filter((item): item is MissingVisualRecord => Boolean(item));
  }
}
