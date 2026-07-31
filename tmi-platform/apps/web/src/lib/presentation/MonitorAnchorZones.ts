/**
 * MonitorAnchorZones — named zones on the canonical 16:9 monitor.
 *
 * Consumers attach overlays/surfaces by zone id. Layout tokens are relative
 * (percent / inset), never hardcoded pixel coordinates for new overlays.
 */

export type MonitorAnchorZoneId =
  | "TOP"
  | "TOP_LEFT"
  | "TOP_RIGHT"
  | "CENTER"
  | "BOTTOM"
  | "BOTTOM_LEFT"
  | "BOTTOM_RIGHT"
  | "SAFE_AREA"
  | "LEFT_PANEL"
  | "RIGHT_PANEL";

/** Relative layout token — CSS inset % style, not absolute pixels. */
export interface MonitorAnchorLayoutToken {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  width?: string;
  height?: string;
  /** Flex/grid alignment hint for hosts */
  justify?: "start" | "center" | "end";
  align?: "start" | "center" | "end";
}

export interface MonitorAnchorZoneDefinition {
  id: MonitorAnchorZoneId;
  label: string;
  layout: MonitorAnchorLayoutToken;
}

export const MONITOR_ANCHOR_ZONES: Record<MonitorAnchorZoneId, MonitorAnchorZoneDefinition> = {
  TOP: {
    id: "TOP",
    label: "Top band",
    layout: { top: "0%", left: "8%", right: "8%", height: "14%", justify: "center", align: "start" },
  },
  TOP_LEFT: {
    id: "TOP_LEFT",
    label: "Top left",
    layout: { top: "2%", left: "2%", width: "28%", height: "16%", justify: "start", align: "start" },
  },
  TOP_RIGHT: {
    id: "TOP_RIGHT",
    label: "Top right",
    layout: { top: "2%", right: "2%", width: "28%", height: "16%", justify: "end", align: "start" },
  },
  CENTER: {
    id: "CENTER",
    label: "Center stage",
    layout: { top: "22%", left: "18%", right: "18%", bottom: "28%", justify: "center", align: "center" },
  },
  BOTTOM: {
    id: "BOTTOM",
    label: "Lower third band",
    layout: { bottom: "0%", left: "6%", right: "6%", height: "18%", justify: "center", align: "end" },
  },
  BOTTOM_LEFT: {
    id: "BOTTOM_LEFT",
    label: "Bottom left",
    layout: { bottom: "3%", left: "3%", width: "30%", height: "16%", justify: "start", align: "end" },
  },
  BOTTOM_RIGHT: {
    id: "BOTTOM_RIGHT",
    label: "Bottom right",
    layout: { bottom: "3%", right: "3%", width: "30%", height: "16%", justify: "end", align: "end" },
  },
  SAFE_AREA: {
    id: "SAFE_AREA",
    label: "Title-safe area",
    layout: { top: "8%", right: "8%", bottom: "8%", left: "8%", justify: "center", align: "center" },
  },
  LEFT_PANEL: {
    id: "LEFT_PANEL",
    label: "Left side panel",
    layout: { top: "16%", left: "0%", width: "18%", bottom: "16%", justify: "start", align: "center" },
  },
  RIGHT_PANEL: {
    id: "RIGHT_PANEL",
    label: "Right side panel",
    layout: { top: "16%", right: "0%", width: "18%", bottom: "16%", justify: "end", align: "center" },
  },
};

export function getMonitorAnchorZone(id: MonitorAnchorZoneId): MonitorAnchorZoneDefinition {
  return MONITOR_ANCHOR_ZONES[id];
}

export function listMonitorAnchorZones(): MonitorAnchorZoneDefinition[] {
  return Object.values(MONITOR_ANCHOR_ZONES);
}

/** Convert a zone layout token into absolute CSS positioning styles. */
export function monitorAnchorZoneToCss(
  id: MonitorAnchorZoneId
): Record<string, string | number> {
  const { layout } = getMonitorAnchorZone(id);
  const style: Record<string, string | number> = {
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    justifyContent:
      layout.justify === "start" ? "flex-start" : layout.justify === "end" ? "flex-end" : "center",
    alignItems:
      layout.align === "start" ? "flex-start" : layout.align === "end" ? "flex-end" : "center",
  };
  if (layout.top !== undefined) style.top = layout.top;
  if (layout.right !== undefined) style.right = layout.right;
  if (layout.bottom !== undefined) style.bottom = layout.bottom;
  if (layout.left !== undefined) style.left = layout.left;
  if (layout.width !== undefined) style.width = layout.width;
  if (layout.height !== undefined) style.height = layout.height;
  return style;
}
