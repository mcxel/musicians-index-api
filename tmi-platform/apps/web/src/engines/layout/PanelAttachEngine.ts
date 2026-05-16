import type { ReactNode } from "react";
import type { CanonShellRegion } from "./ShellRegionMap";

export type RegionPanelMap = Partial<Record<CanonShellRegion, ReactNode>>;

export function attachPanel(regionPanels: RegionPanelMap, region: CanonShellRegion, panel: ReactNode): RegionPanelMap {
  return {
    ...regionPanels,
    [region]: panel,
  };
}
