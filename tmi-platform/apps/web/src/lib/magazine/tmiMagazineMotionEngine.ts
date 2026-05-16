import { mergeOverlayOffset, syncOverlayToParent, type TmiOverlayTransform } from "@/lib/overlays/tmiOverlayMotionSync";

export type TmiMagazinePose = TmiOverlayTransform & {
  openRatio: number;
  pageIndex: number;
};

export type TmiMagazineTransition =
  | "idle"
  | "opening"
  | "closing"
  | "page-flip-forward"
  | "page-flip-backward"
  | "section-jump";

export type TmiMagazineMotionState = {
  pose: TmiMagazinePose;
  transition: TmiMagazineTransition;
  overlaySynced: boolean;
};

export function createDefaultMagazinePose(): TmiMagazinePose {
  return {
    x: 0,
    y: 0,
    scale: 1,
    rotationDeg: 0,
    openRatio: 0.85,
    pageIndex: 0,
  };
}

export function applyMagazineTransform(
  pose: TmiMagazinePose,
  patch: Partial<TmiMagazinePose>,
): TmiMagazinePose {
  return {
    ...pose,
    ...patch,
  };
}

export function getSyncedOverlayForMagazine(pose: TmiMagazinePose, overlayOffset?: Partial<TmiOverlayTransform>) {
  return overlayOffset ? mergeOverlayOffset(pose, overlayOffset) : syncOverlayToParent(pose);
}

export function buildMagazineMotionState(
  pose: TmiMagazinePose,
  transition: TmiMagazineTransition,
): TmiMagazineMotionState {
  return {
    pose,
    transition,
    overlaySynced: true,
  };
}
