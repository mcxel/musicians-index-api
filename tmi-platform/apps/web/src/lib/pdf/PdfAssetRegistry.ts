/**
 * PdfAssetRegistry
 * Central index for all PDF-derived runtime assets.
 * Coordinates decompile → layout → topology → surface pipeline.
 * Single entry point for consuming code to look up any PDF artifact.
 */

import { queryAssets } from "@/lib/registry/RuntimeAssetRegistry";
import type { PdfDecompileResult, PdfPageShard } from "@/lib/pdf/PdfVisualDecompiler";
import type { MagazineLayout, MagazineLayoutBlock } from "@/lib/pdf/MagazineLayoutExtractor";
import type { ShardTopology } from "@/lib/pdf/ShardTopologyAnalyzer";
import type { SurfaceGenerationResult, InteractiveSurface } from "@/lib/pdf/InteractiveSurfaceGenerator";

export interface PdfRegistryEntry {
  pdfId: string;
  sourceUri: string;
  title: string | null;
  issueNumber: number | null;
  publishedAt: number | null;
  decompileResult: PdfDecompileResult | null;
  layout: MagazineLayout | null;
  topology: ShardTopology | null;
  surfaces: SurfaceGenerationResult | null;
  registeredAt: number;
  pipelineComplete: boolean;
}

export type PdfRegistryListener = (entry: PdfRegistryEntry) => void;

const registry = new Map<string, PdfRegistryEntry>();
const listeners = new Set<PdfRegistryListener>();

function notify(entry: PdfRegistryEntry): void {
  listeners.forEach(l => l(entry));
}

export function registerPdf(
  pdfId: string,
  sourceUri: string,
  opts: {
    title?: string;
    issueNumber?: number;
    publishedAt?: number;
  } = {}
): PdfRegistryEntry {
  const entry: PdfRegistryEntry = {
    pdfId,
    sourceUri,
    title: opts.title ?? null,
    issueNumber: opts.issueNumber ?? null,
    publishedAt: opts.publishedAt ?? null,
    decompileResult: null,
    layout: null,
    topology: null,
    surfaces: null,
    registeredAt: Date.now(),
    pipelineComplete: false,
  };
  registry.set(pdfId, entry);
  notify(entry);
  return entry;
}

export function attachDecompileResult(pdfId: string, result: PdfDecompileResult): PdfRegistryEntry | null {
  const entry = registry.get(pdfId);
  if (!entry) return null;
  const updated = { ...entry, decompileResult: result };
  registry.set(pdfId, updated);
  notify(updated);
  return updated;
}

export function attachLayout(pdfId: string, layout: MagazineLayout): PdfRegistryEntry | null {
  const entry = registry.get(pdfId);
  if (!entry) return null;
  const updated = { ...entry, layout };
  registry.set(pdfId, updated);
  notify(updated);
  return updated;
}

export function attachTopology(pdfId: string, topology: ShardTopology): PdfRegistryEntry | null {
  const entry = registry.get(pdfId);
  if (!entry) return null;
  const updated = { ...entry, topology };
  registry.set(pdfId, updated);
  notify(updated);
  return updated;
}

export function attachSurfaces(pdfId: string, surfaces: SurfaceGenerationResult): PdfRegistryEntry | null {
  const entry = registry.get(pdfId);
  if (!entry) return null;
  const pipelineComplete = !!(entry.decompileResult && entry.layout && entry.topology);
  const updated = { ...entry, surfaces, pipelineComplete };
  registry.set(pdfId, updated);
  notify(updated);
  return updated;
}

export function getPdfEntry(pdfId: string): PdfRegistryEntry | null {
  return registry.get(pdfId) ?? null;
}

export function getAllPdfs(): PdfRegistryEntry[] {
  return [...registry.values()];
}

export function getCompletePdfs(): PdfRegistryEntry[] {
  return [...registry.values()].filter(e => e.pipelineComplete);
}

export function getAllShards(pdfId: string): PdfPageShard[] {
  return registry.get(pdfId)?.decompileResult?.shards ?? [];
}

export function getAllLayoutBlocks(pdfId: string): MagazineLayoutBlock[] {
  return registry.get(pdfId)?.layout?.blocks ?? [];
}

export function getAllSurfaces(pdfId: string): InteractiveSurface[] {
  return registry.get(pdfId)?.surfaces?.surfaces ?? [];
}

export function getLiveAdSurfaces(): InteractiveSurface[] {
  const out: InteractiveSurface[] = [];
  for (const entry of registry.values()) {
    out.push(...(entry.surfaces?.surfaces.filter(s => s.isLive) ?? []));
  }
  return out;
}

export function getPdfShardsFromRuntimeRegistry(pdfId: string): ReturnType<typeof queryAssets> {
  return queryAssets({ kind: "pdf-shard", ownerId: pdfId });
}

export function subscribeToPdfRegistry(listener: PdfRegistryListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getPdfRegistryStats(): {
  totalPdfs: number;
  completePipelines: number;
  totalShards: number;
  totalSurfaces: number;
  liveAds: number;
} {
  let totalShards = 0, totalSurfaces = 0, liveAds = 0, completePipelines = 0;
  for (const e of registry.values()) {
    totalShards += e.decompileResult?.shards.length ?? 0;
    totalSurfaces += e.surfaces?.surfaces.length ?? 0;
    liveAds += e.surfaces?.liveAdCount ?? 0;
    if (e.pipelineComplete) completePipelines++;
  }
  return {
    totalPdfs: registry.size,
    completePipelines,
    totalShards,
    totalSurfaces,
    liveAds,
  };
}
