export type ChatWidgetId = "bubble-rail" | "overflow-panel" | "performer-rail";

export type DockZone = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "freeform";

export type Point = {
  x: number;
  y: number;
};

export type WidgetSize = {
  width: number;
  height: number;
};

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type SafeZone = {
  id: "video-panels" | "hosts" | "scoreboards" | "seat-overlays" | string;
  rect: Rect;
};

export type WidgetDockState = {
  widgetId: ChatWidgetId;
  zone: DockZone;
  position: Point;
  snapped: boolean;
  lastUpdatedAtMs: number;
};

const EDGE_PADDING = 12;

function intersects(a: Rect, b: Rect): boolean {
  return !(a.x + a.width < b.x || b.x + b.width < a.x || a.y + a.height < b.y || b.y + b.height < a.y);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function clampPosition(position: Point, size: WidgetSize, container: WidgetSize): Point {
  return {
    x: clamp(position.x, EDGE_PADDING, Math.max(EDGE_PADDING, container.width - size.width - EDGE_PADDING)),
    y: clamp(position.y, EDGE_PADDING, Math.max(EDGE_PADDING, container.height - size.height - EDGE_PADDING)),
  };
}

function toRect(position: Point, size: WidgetSize): Rect {
  return { x: position.x, y: position.y, width: size.width, height: size.height };
}

function zonePosition(zone: Exclude<DockZone, "freeform">, size: WidgetSize, container: WidgetSize): Point {
  if (zone === "top-left") return { x: EDGE_PADDING, y: EDGE_PADDING };
  if (zone === "top-right") return { x: Math.max(EDGE_PADDING, container.width - size.width - EDGE_PADDING), y: EDGE_PADDING };
  if (zone === "bottom-left") return { x: EDGE_PADDING, y: Math.max(EDGE_PADDING, container.height - size.height - EDGE_PADDING) };
  return {
    x: Math.max(EDGE_PADDING, container.width - size.width - EDGE_PADDING),
    y: Math.max(EDGE_PADDING, container.height - size.height - EDGE_PADDING),
  };
}

function nearestSafeCandidate(
  desired: Point,
  size: WidgetSize,
  container: WidgetSize,
  safeZones: SafeZone[],
): { position: Point; snapped: boolean } {
  const candidates: Point[] = [
    desired,
    zonePosition("top-left", size, container),
    zonePosition("top-right", size, container),
    zonePosition("bottom-left", size, container),
    zonePosition("bottom-right", size, container),
  ];

  for (const candidate of candidates) {
    const clamped = clampPosition(candidate, size, container);
    const rect = toRect(clamped, size);
    const blocked = safeZones.some((zone) => intersects(rect, zone.rect));
    if (!blocked) {
      return { position: clamped, snapped: candidate !== desired };
    }
  }

  return { position: clampPosition(desired, size, container), snapped: false };
}

export class ChatWidgetDockingEngine {
  getDefaultDock(widgetId: ChatWidgetId, container: WidgetSize, size: WidgetSize): WidgetDockState {
    const zone: Exclude<DockZone, "freeform"> =
      widgetId === "performer-rail" ? "bottom-right" : widgetId === "overflow-panel" ? "top-right" : "bottom-left";
    const position = zonePosition(zone, size, container);

    return {
      widgetId,
      zone,
      position,
      snapped: true,
      lastUpdatedAtMs: Date.now(),
    };
  }

  resolveDock(
    widgetId: ChatWidgetId,
    zone: DockZone,
    container: WidgetSize,
    size: WidgetSize,
    safeZones: SafeZone[],
    freeformPosition?: Point,
  ): WidgetDockState {
    const desired = zone === "freeform" ? freeformPosition ?? { x: EDGE_PADDING, y: EDGE_PADDING } : zonePosition(zone, size, container);
    const resolved = nearestSafeCandidate(desired, size, container, safeZones);

    return {
      widgetId,
      zone,
      position: resolved.position,
      snapped: resolved.snapped,
      lastUpdatedAtMs: Date.now(),
    };
  }

  applyDrag(
    widgetId: ChatWidgetId,
    current: WidgetDockState,
    dragDelta: Point,
    container: WidgetSize,
    size: WidgetSize,
    safeZones: SafeZone[],
  ): WidgetDockState {
    const desired = {
      x: current.position.x + dragDelta.x,
      y: current.position.y + dragDelta.y,
    };

    const resolved = nearestSafeCandidate(desired, size, container, safeZones);
    return {
      widgetId,
      zone: "freeform",
      position: resolved.position,
      snapped: resolved.snapped,
      lastUpdatedAtMs: Date.now(),
    };
  }

  snapToNearestZone(currentPosition: Point, container: WidgetSize, size: WidgetSize): DockZone {
    const zones: Exclude<DockZone, "freeform">[] = ["top-left", "top-right", "bottom-left", "bottom-right"];
    let bestZone: DockZone = "freeform";
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const zone of zones) {
      const anchor = zonePosition(zone, size, container);
      const dx = currentPosition.x - anchor.x;
      const dy = currentPosition.y - anchor.y;
      const distance = dx * dx + dy * dy;
      if (distance < bestDistance) {
        bestDistance = distance;
        bestZone = zone;
      }
    }

    return bestDistance <= 28000 ? bestZone : "freeform";
  }
}

export const chatWidgetDockingEngine = new ChatWidgetDockingEngine();
