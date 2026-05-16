/**
 * MotionPortraitHydrator
 * Bridges the IdentityFragmentRegistry and MotionPortraitEngine to produce
 * fully animated portrait assets ready for runtime display.
 */

import { registerAsset, setHydrationStatus } from "@/lib/registry/RuntimeAssetRegistry";
import { recordLineage } from "@/lib/registry/AssetLineageTracker";
import { claimAuthority } from "@/lib/registry/AssetAuthorityLedger";
import { getFragment } from "@/lib/avatar/IdentityFragmentRegistry";

export type PortraitMotionPreset = "breathing" | "head_bob" | "eye_blink" | "lip_idle" | "hair_sway" | "full_idle";

export interface HydratedPortrait {
  portraitId: string;
  entityId: string;
  displayName: string;
  activePresets: PortraitMotionPreset[];
  assetId: string;
  faceFragmentId: string | null;
  expressionBaseFragmentId: string | null;
  hydrationComplete: boolean;
  hydratedAt: number;
  frameRate: 12 | 24 | 30 | 60;
  loopDurationMs: number;
}

export interface HydrationRequest {
  requestId: string;
  entityId: string;
  displayName: string;
  presets: PortraitMotionPreset[];
  priority: "critical" | "high" | "normal" | "deferred";
  requestedAt: number;
  status: "queued" | "hydrating" | "done" | "failed";
  result: HydratedPortrait | null;
}

const portraits = new Map<string, HydratedPortrait>();
const hydrationQueue = new Map<string, HydrationRequest>();
type HydrationListener = (portrait: HydratedPortrait) => void;
const hydrationListeners = new Set<HydrationListener>();

const PRESET_LOOPS: Record<PortraitMotionPreset, { frameRate: 12 | 24 | 30 | 60; loopMs: number }> = {
  breathing:  { frameRate: 12, loopMs: 3000 },
  head_bob:   { frameRate: 24, loopMs: 2000 },
  eye_blink:  { frameRate: 24, loopMs: 4000 },
  lip_idle:   { frameRate: 30, loopMs: 1500 },
  hair_sway:  { frameRate: 12, loopMs: 5000 },
  full_idle:  { frameRate: 30, loopMs: 4000 },
};

function pickFrameRate(presets: PortraitMotionPreset[]): 12 | 24 | 30 | 60 {
  const max = Math.max(...presets.map(p => PRESET_LOOPS[p].frameRate));
  return max as 12 | 24 | 30 | 60;
}

function pickLoopDuration(presets: PortraitMotionPreset[]): number {
  return Math.max(...presets.map(p => PRESET_LOOPS[p].loopMs));
}

export function requestPortraitHydration(
  entityId: string,
  displayName: string,
  presets: PortraitMotionPreset[] = ["breathing", "eye_blink"],
  priority: HydrationRequest["priority"] = "normal"
): HydrationRequest {
  const requestId = `phydr_${entityId}_${Date.now()}`;
  const request: HydrationRequest = {
    requestId, entityId, displayName, presets, priority,
    requestedAt: Date.now(), status: "queued", result: null,
  };
  hydrationQueue.set(requestId, request);
  void processHydration(requestId);
  return request;
}

async function processHydration(requestId: string): Promise<void> {
  const req = hydrationQueue.get(requestId);
  if (!req) return;

  hydrationQueue.set(requestId, { ...req, status: "hydrating" });

  const assetId = `portrait_hydrated_${req.entityId}`;

  registerAsset(assetId, "motion-layer", req.entityId, {
    generatorId: "MotionPortraitHydrator",
    motionCompatible: true,
    tags: ["portrait", "motion", req.entityId],
  });

  const claim = claimAuthority(assetId, "MotionPortraitHydrator", "hydrator", {
    exclusive: true, priority: 4, ttlMs: 20_000,
  });

  if (!claim.granted) {
    hydrationQueue.set(requestId, { ...req, status: "failed" });
    return;
  }

  setHydrationStatus(assetId, "hydrating");

  const faceFragment = getFragment(req.entityId, "face");
  const expressionFragment = getFragment(req.entityId, "expression-base");

  recordLineage(assetId, "motion-synthesis", "MotionPortraitHydrator", {
    parentAssetId: faceFragment?.fragmentId,
    ancestorIds: [faceFragment?.fragmentId, expressionFragment?.fragmentId].filter(Boolean) as string[],
    transforms: ["animate", "motion-overlay"],
    reconstructable: true,
    reconstructionInstructions: JSON.stringify({ entityId: req.entityId, presets: req.presets }),
  });

  const portrait: HydratedPortrait = {
    portraitId: requestId,
    entityId: req.entityId,
    displayName: req.displayName,
    activePresets: req.presets,
    assetId,
    faceFragmentId: faceFragment?.fragmentId ?? null,
    expressionBaseFragmentId: expressionFragment?.fragmentId ?? null,
    hydrationComplete: true,
    hydratedAt: Date.now(),
    frameRate: pickFrameRate(req.presets),
    loopDurationMs: pickLoopDuration(req.presets),
  };

  portraits.set(req.entityId, portrait);
  setHydrationStatus(assetId, "hydrated");
  hydrationQueue.set(requestId, { ...req, status: "done", result: portrait });
  hydrationListeners.forEach(l => l(portrait));
}

export function getHydratedPortrait(entityId: string): HydratedPortrait | null {
  return portraits.get(entityId) ?? null;
}

export function subscribeToPortraitHydration(listener: HydrationListener): () => void {
  hydrationListeners.add(listener);
  return () => hydrationListeners.delete(listener);
}

export function getHydrationQueue(): HydrationRequest[] {
  return [...hydrationQueue.values()];
}

export function getPortraitStats(): { hydrated: number; queued: number; failed: number } {
  let queued = 0, failed = 0;
  for (const r of hydrationQueue.values()) {
    if (r.status === "queued" || r.status === "hydrating") queued++;
    if (r.status === "failed") failed++;
  }
  return { hydrated: portraits.size, queued, failed };
}
