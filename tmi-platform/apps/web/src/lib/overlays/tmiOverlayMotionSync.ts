export type TmiOverlayTransform = {
  x: number;
  y: number;
  scale: number;
  rotationDeg: number;
};

export type TmiMotionSyncState = {
  parentTransform: TmiOverlayTransform;
  overlayTransform: TmiOverlayTransform;
  synced: boolean;
};

export function syncOverlayToParent(parent: TmiOverlayTransform): TmiMotionSyncState {
  return {
    parentTransform: parent,
    overlayTransform: { ...parent },
    synced: true,
  };
}

export function mergeOverlayOffset(
  parent: TmiOverlayTransform,
  offset: Partial<TmiOverlayTransform>,
): TmiMotionSyncState {
  return {
    parentTransform: parent,
    overlayTransform: {
      x: parent.x + (offset.x ?? 0),
      y: parent.y + (offset.y ?? 0),
      scale: parent.scale * (offset.scale ?? 1),
      rotationDeg: parent.rotationDeg + (offset.rotationDeg ?? 0),
    },
    synced: true,
  };
}
