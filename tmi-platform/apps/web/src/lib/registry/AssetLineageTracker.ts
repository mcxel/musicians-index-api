/**
 * AssetLineageTracker
 * Records how every asset came to exist — source, generator, transforms, and version history.
 * Enables reconstruction, audit, and rollback for any runtime asset.
 */

export type LineageSource =
  | "pdf-extraction" | "vision-scan" | "ai-generation" | "manual-upload"
  | "python-pipeline" | "live-capture" | "nft-mint" | "user-upload"
  | "seed-data" | "runtime-reconstruction" | "motion-synthesis";

export type LineageTransform =
  | "resize" | "colorize" | "segment" | "animate" | "compress"
  | "fragment" | "reconstruct" | "blend" | "motion-overlay" | "skin-apply";

export interface LineageRecord {
  assetId: string;
  source: LineageSource;
  parentAssetId: string | null;      // direct parent (e.g., PDF shard from PDF doc)
  ancestorIds: string[];             // full lineage chain
  generatorEngine: string;
  generatedAt: number;
  transforms: LineageTransform[];
  version: number;
  checksum: string | null;           // content hash for integrity
  reconstructable: boolean;
  reconstructionInstructions: string | null;
  metadata: Record<string, unknown>;
}

const lineageMap = new Map<string, LineageRecord[]>();  // assetId → version history
const MAX_VERSIONS = 10;

export function recordLineage(
  assetId: string,
  source: LineageSource,
  generatorEngine: string,
  opts: {
    parentAssetId?: string;
    ancestorIds?: string[];
    transforms?: LineageTransform[];
    checksum?: string;
    reconstructable?: boolean;
    reconstructionInstructions?: string;
    metadata?: Record<string, unknown>;
  } = {}
): LineageRecord {
  const existing = lineageMap.get(assetId) ?? [];
  const version = existing.length + 1;

  const record: LineageRecord = {
    assetId, source, generatorEngine,
    parentAssetId: opts.parentAssetId ?? null,
    ancestorIds: opts.ancestorIds ?? [],
    generatedAt: Date.now(),
    transforms: opts.transforms ?? [],
    version,
    checksum: opts.checksum ?? null,
    reconstructable: opts.reconstructable ?? true,
    reconstructionInstructions: opts.reconstructionInstructions ?? null,
    metadata: opts.metadata ?? {},
  };

  lineageMap.set(assetId, [...existing, record].slice(-MAX_VERSIONS));
  return record;
}

export function addTransform(assetId: string, transform: LineageTransform): void {
  const records = lineageMap.get(assetId);
  if (!records?.length) return;
  const latest = records[records.length - 1];
  records[records.length - 1] = { ...latest, transforms: [...latest.transforms, transform] };
}

export function getLineage(assetId: string): LineageRecord[] {
  return lineageMap.get(assetId) ?? [];
}

export function getLatestRecord(assetId: string): LineageRecord | null {
  const records = lineageMap.get(assetId) ?? [];
  return records[records.length - 1] ?? null;
}

export function getFullAncestors(assetId: string): string[] {
  const record = getLatestRecord(assetId);
  if (!record) return [];
  const ancestors = new Set([...record.ancestorIds]);
  if (record.parentAssetId) ancestors.add(record.parentAssetId);
  return [...ancestors];
}

export function isReconstructable(assetId: string): boolean {
  return getLatestRecord(assetId)?.reconstructable ?? false;
}

export function getReconstructionInstructions(assetId: string): string | null {
  return getLatestRecord(assetId)?.reconstructionInstructions ?? null;
}

export function getDescendants(parentId: string): string[] {
  const descendants: string[] = [];
  for (const [assetId, records] of lineageMap) {
    const latest = records[records.length - 1];
    if (latest?.parentAssetId === parentId || latest?.ancestorIds.includes(parentId)) {
      descendants.push(assetId);
    }
  }
  return descendants;
}

export function getLineageStats(): { tracked: number; reconstructable: number; avgVersion: number } {
  let reconstructable = 0, totalVersion = 0;
  for (const records of lineageMap.values()) {
    const latest = records[records.length - 1];
    if (latest?.reconstructable) reconstructable++;
    totalVersion += latest?.version ?? 0;
  }
  const tracked = lineageMap.size;
  return { tracked, reconstructable, avgVersion: tracked > 0 ? totalVersion / tracked : 0 };
}

export function exportLineageReport(assetId: string): string {
  const records = getLineage(assetId);
  if (!records.length) return `No lineage for asset ${assetId}`;
  const latest = records[records.length - 1];
  return [
    `Asset: ${assetId}`,
    `Source: ${latest.source}`,
    `Generator: ${latest.generatorEngine}`,
    `Version: ${latest.version}`,
    `Parent: ${latest.parentAssetId ?? "none"}`,
    `Ancestors: ${latest.ancestorIds.join(", ") || "none"}`,
    `Transforms: ${latest.transforms.join(" → ") || "none"}`,
    `Reconstructable: ${latest.reconstructable}`,
  ].join("\n");
}
