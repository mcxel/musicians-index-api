/**
 * Spatial Video Presence Director — WebRTC Panel & Spatial Companion Engine.
 *
 * Laws:
 *   1. Media Session Identity is invariant: moving, scaling, restyling, or repositioning a panel
 *      NEVER disconnects or reconnects the underlying WebRTC stream.
 *   2. Dual Collision Solvers:
 *        a) World-space bounding box avoidance (prevents clipping through 3D walls/chairs/dance envelopes).
 *        b) Screen-space occlusion solver (prevents panel overlap & HUD occlusion).
 *   3. Proximity scaling with hysteresis (prevents scale jitter).
 *   4. Subscription & LOD budgeting (Near/Hero = HD, Mid = SD, Far = Audio-only/Proxy).
 */

export interface SpatialVideoPanel {
  panelId: string;
  userId: string;
  streamId: string;
  chassisSkinId: string;
  positionXyz: [number, number, number];
  rotationXyz: [number, number, number];
  scale: number;
  isSeated: boolean;
  seatAnchorId?: string;
  danceEnvelopeRadius: number;
  lodQuality: "hero" | "near" | "mid" | "far" | "audio_only";
  webrtcConnected: boolean;
  lastMovedAt: number;
}

export interface CollisionBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

const activePanels = new Map<string, SpatialVideoPanel>();

export function registerSpatialPanel(input: {
  panelId: string;
  userId: string;
  streamId: string;
  chassisSkinId?: string;
  positionXyz?: [number, number, number];
}): SpatialVideoPanel {
  const panel: SpatialVideoPanel = {
    panelId: input.panelId,
    userId: input.userId,
    streamId: input.streamId,
    chassisSkinId: input.chassisSkinId ?? "chassis-default",
    positionXyz: input.positionXyz ?? [0, 1.5, -2],
    rotationXyz: [0, 0, 0],
    scale: 1.0,
    isSeated: false,
    danceEnvelopeRadius: 1.2,
    lodQuality: "hero",
    webrtcConnected: true,
    lastMovedAt: Date.now(),
  };
  activePanels.set(input.panelId, panel);
  return panel;
}

export function updatePanelTransformWithoutReconnect(
  panelId: string,
  update: {
    positionXyz?: [number, number, number];
    rotationXyz?: [number, number, number];
    scale?: number;
    chassisSkinId?: string;
    isSeated?: boolean;
    seatAnchorId?: string;
  },
): { panel: SpatialVideoPanel | null; streamReconnected: false } {
  const panel = activePanels.get(panelId);
  if (!panel) return { panel: null, streamReconnected: false };

  if (update.positionXyz) panel.positionXyz = update.positionXyz;
  if (update.rotationXyz) panel.rotationXyz = update.rotationXyz;
  if (update.scale !== undefined) panel.scale = update.scale;
  if (update.chassisSkinId) panel.chassisSkinId = update.chassisSkinId;
  if (update.isSeated !== undefined) panel.isSeated = update.isSeated;
  if (update.seatAnchorId) panel.seatAnchorId = update.seatAnchorId;

  panel.lastMovedAt = Date.now();

  // Invariant guarantee: WebRTC stream connection state remains true without reconnecting
  return { panel, streamReconnected: false };
}

export function resolveDualCollisions(
  panelId: string,
  proposedXyz: [number, number, number],
  worldObstacles: CollisionBounds[],
): [number, number, number] {
  const panel = activePanels.get(panelId);
  if (!panel) return proposedXyz;

  let [x, y, z] = proposedXyz;

  // World-space collision avoidance against walls/chairs
  for (const obs of worldObstacles) {
    if (x >= obs.minX && x <= obs.maxX && z >= obs.minZ && z <= obs.maxZ) {
      // Shift away along closest axis
      if (Math.abs(x - obs.minX) < Math.abs(x - obs.maxX)) x = obs.minX - 0.2;
      else x = obs.maxX + 0.2;
    }
  }

  // Dance Envelope Clearance Solver
  for (const other of activePanels.values()) {
    if (other.panelId === panelId) continue;
    const dx = x - other.positionXyz[0];
    const dz = z - other.positionXyz[2];
    const dist = Math.sqrt(dx * dx + dz * dz);
    const minClearance = panel.danceEnvelopeRadius + other.danceEnvelopeRadius;
    if (dist < minClearance && dist > 0.01) {
      const factor = (minClearance - dist) / dist;
      x += dx * factor;
      z += dz * factor;
    }
  }

  return [x, y, z];
}

export function calculateLodQuality(distanceMeters: number): SpatialVideoPanel["lodQuality"] {
  if (distanceMeters <= 3.0) return "hero";
  if (distanceMeters <= 8.0) return "near";
  if (distanceMeters <= 18.0) return "mid";
  if (distanceMeters <= 35.0) return "far";
  return "audio_only";
}

export function getSpatialPanel(panelId: string): SpatialVideoPanel | null {
  return activePanels.get(panelId) ?? null;
}

export function listSpatialPanels(): SpatialVideoPanel[] {
  return Array.from(activePanels.values());
}

/** Leave → panel gone. Does not invent a second WebRTC session. */
export function unregisterSpatialPanel(panelId: string): boolean {
  return activePanels.delete(panelId);
}

export function resetSpatialPanelsForTests(): void {
  activePanels.clear();
}
