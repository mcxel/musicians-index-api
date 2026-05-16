/**
 * RuntimeAssetRegistry
 * Single source of truth for all runtime assets in the TMI world.
 * Every asset — avatar, venue piece, magazine surface, PDF shard, motion portrait,
 * billboard, sponsor panel, NFT — registers here before it can be hydrated or rendered.
 */

export type AssetKind =
  | "avatar" | "host" | "performer-portrait" | "venue-surface" | "venue-prop"
  | "magazine-panel" | "pdf-shard" | "billboard" | "sponsor-slot"
  | "nft" | "collectible" | "stage-element" | "hud-module" | "motion-layer"
  | "sound-cue" | "chat-bubble" | "reaction-particle" | "ui-card" | "overlay";

export type HydrationStatus = "unregistered" | "pending" | "hydrating" | "hydrated" | "degraded" | "failed" | "evicted";

export interface RuntimeAsset {
  assetId: string;
  kind: AssetKind;
  ownerId: string;                     // system or user that owns this asset
  generatorId: string | null;          // which engine generated it
  hydrationStatus: HydrationStatus;
  registeredAt: number;
  hydratedAt: number | null;
  lastAccessedAt: number | null;
  degradationPath: string | null;      // fallback asset id if this fails
  recoveryEligible: boolean;
  motionCompatible: boolean;
  metadata: Record<string, unknown>;
  tags: string[];
  version: number;
}

export interface RegistryStats {
  total: number;
  byKind: Record<AssetKind, number>;
  byStatus: Record<HydrationStatus, number>;
  hydrationRate: number;               // 0-1
  failureRate: number;
}

const MAX_REGISTRY = 10_000;

const registry = new Map<string, RuntimeAsset>();
type RegistryListener = (asset: RuntimeAsset) => void;
const listeners = new Set<RegistryListener>();
let registryVersion = 0;

function notify(asset: RuntimeAsset): void {
  listeners.forEach(l => l(asset));
}

export function registerAsset(
  assetId: string,
  kind: AssetKind,
  ownerId: string,
  opts: {
    generatorId?: string;
    degradationPath?: string;
    recoveryEligible?: boolean;
    motionCompatible?: boolean;
    metadata?: Record<string, unknown>;
    tags?: string[];
  } = {}
): RuntimeAsset {
  if (registry.size >= MAX_REGISTRY) {
    evictStale();
  }

  const existing = registry.get(assetId);
  const asset: RuntimeAsset = {
    assetId, kind, ownerId,
    generatorId: opts.generatorId ?? null,
    hydrationStatus: existing?.hydrationStatus ?? "pending",
    registeredAt: existing?.registeredAt ?? Date.now(),
    hydratedAt: existing?.hydratedAt ?? null,
    lastAccessedAt: null,
    degradationPath: opts.degradationPath ?? null,
    recoveryEligible: opts.recoveryEligible ?? true,
    motionCompatible: opts.motionCompatible ?? false,
    metadata: { ...(existing?.metadata ?? {}), ...(opts.metadata ?? {}) },
    tags: opts.tags ?? existing?.tags ?? [],
    version: (existing?.version ?? 0) + 1,
  };
  registry.set(assetId, asset);
  registryVersion++;
  notify(asset);
  return asset;
}

export function setHydrationStatus(assetId: string, status: HydrationStatus): RuntimeAsset | null {
  const asset = registry.get(assetId);
  if (!asset) return null;
  const updated: RuntimeAsset = {
    ...asset,
    hydrationStatus: status,
    hydratedAt: status === "hydrated" ? Date.now() : asset.hydratedAt,
    version: asset.version + 1,
  };
  registry.set(assetId, updated);
  registryVersion++;
  notify(updated);
  return updated;
}

export function touchAsset(assetId: string): void {
  const asset = registry.get(assetId);
  if (!asset) return;
  registry.set(assetId, { ...asset, lastAccessedAt: Date.now() });
}

export function getAsset(assetId: string): RuntimeAsset | null {
  const asset = registry.get(assetId) ?? null;
  if (asset) touchAsset(assetId);
  return asset;
}

export function queryAssets(filter: { kind?: AssetKind; status?: HydrationStatus; ownerId?: string; tag?: string }): RuntimeAsset[] {
  const results: RuntimeAsset[] = [];
  for (const asset of registry.values()) {
    if (filter.kind && asset.kind !== filter.kind) continue;
    if (filter.status && asset.hydrationStatus !== filter.status) continue;
    if (filter.ownerId && asset.ownerId !== filter.ownerId) continue;
    if (filter.tag && !asset.tags.includes(filter.tag)) continue;
    results.push(asset);
  }
  return results;
}

export function evictAsset(assetId: string): boolean {
  const asset = registry.get(assetId);
  if (!asset) return false;
  setHydrationStatus(assetId, "evicted");
  return registry.delete(assetId);
}

function evictStale(): void {
  const now = Date.now();
  const STALE_MS = 30 * 60 * 1000;
  for (const [id, asset] of registry) {
    if (asset.lastAccessedAt && now - asset.lastAccessedAt > STALE_MS) {
      registry.delete(id);
    }
  }
}

export function getRegistryStats(): RegistryStats {
  const byKind: Partial<Record<AssetKind, number>> = {};
  const byStatus: Partial<Record<HydrationStatus, number>> = {};
  let hydrated = 0, failed = 0;

  for (const asset of registry.values()) {
    byKind[asset.kind] = (byKind[asset.kind] ?? 0) + 1;
    byStatus[asset.hydrationStatus] = (byStatus[asset.hydrationStatus] ?? 0) + 1;
    if (asset.hydrationStatus === "hydrated") hydrated++;
    if (asset.hydrationStatus === "failed") failed++;
  }

  const total = registry.size;
  return {
    total,
    byKind: byKind as Record<AssetKind, number>,
    byStatus: byStatus as Record<HydrationStatus, number>,
    hydrationRate: total > 0 ? hydrated / total : 0,
    failureRate: total > 0 ? failed / total : 0,
  };
}

export function getRegistryVersion(): number { return registryVersion; }

export function subscribeToRegistry(listener: RegistryListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
