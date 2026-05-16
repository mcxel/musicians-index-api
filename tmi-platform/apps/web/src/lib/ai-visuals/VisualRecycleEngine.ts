export type RecycledVisualRecord = {
  assetId: string;
  fromSlot: string;
  toSlot: string;
  recycledAt: number;
  note: string;
};

const recycledMap = new Map<string, RecycledVisualRecord>();

export function recycleVisualAsset(input: {
  assetId: string;
  fromSlot: string;
  toSlot: string;
  note: string;
}): RecycledVisualRecord {
  const next: RecycledVisualRecord = {
    assetId: input.assetId,
    fromSlot: input.fromSlot,
    toSlot: input.toSlot,
    note: input.note,
    recycledAt: Date.now(),
  };
  recycledMap.set(input.assetId, next);
  return next;
}

export function listRecycledVisualAssets(): RecycledVisualRecord[] {
  return [...recycledMap.values()];
}
