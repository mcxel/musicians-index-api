import type { CanonShellRegion } from "./ShellRegionMap";
import { FAN_CANON_MOUNT_MAP, type CanonMountMap } from "./CanonMountMap";

export type ArtifactSlotAssignment = {
  region: CanonShellRegion;
  panelKey: string;
};

export function resolveArtifactSlots(map: CanonMountMap = FAN_CANON_MOUNT_MAP): ArtifactSlotAssignment[] {
  return Object.entries(map).flatMap(([region, keys]) =>
    keys.map((panelKey) => ({
      region: region as CanonShellRegion,
      panelKey,
    })),
  );
}
