import type { TmiMagazineMotionState } from "@/lib/magazine/tmiMagazineMotionEngine";
import type { TmiMagazineSectionId } from "@/lib/magazine/tmiMagazineSectionJumpEngine";

export type TmiMagazineObservationSnapshot = {
  magazineId: string;
  motion: TmiMagazineMotionState;
  activeSection: TmiMagazineSectionId;
  activePageId: string;
  overlaySynced: boolean;
  spinWheelReady: boolean;
  feedMode: "live" | "simulated";
  updatedAt: number;
};

const OBS_STATE = new Map<string, TmiMagazineObservationSnapshot>();

export function publishMagazineObservation(snapshot: TmiMagazineObservationSnapshot): void {
  OBS_STATE.set(snapshot.magazineId, snapshot);
}

export function getMagazineObservation(magazineId: string): TmiMagazineObservationSnapshot | undefined {
  return OBS_STATE.get(magazineId);
}

export function listMagazineObservations(): TmiMagazineObservationSnapshot[] {
  return [...OBS_STATE.values()];
}
