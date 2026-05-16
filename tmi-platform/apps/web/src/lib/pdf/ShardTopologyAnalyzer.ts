/**
 * ShardTopologyAnalyzer
 * Builds spatial and semantic relationships between PDF shards.
 * Produces a topology graph enabling navigation, cross-linking, and smart surface mapping.
 */

import { addDependency } from "@/lib/registry/HydrationDependencyGraph";
import { recordLineage } from "@/lib/registry/AssetLineageTracker";
import { registerAsset, setHydrationStatus } from "@/lib/registry/RuntimeAssetRegistry";
import type { PdfPageShard } from "@/lib/pdf/PdfVisualDecompiler";

export type ShardRelationType =
  | "adjacent-above"
  | "adjacent-below"
  | "adjacent-left"
  | "adjacent-right"
  | "same-page"
  | "same-article"
  | "caption-of"
  | "heading-of"
  | "continues-on-next-page"
  | "ad-companion";

export interface ShardEdge {
  fromShardId: string;
  toShardId: string;
  relation: ShardRelationType;
  weight: number;
}

export interface ShardTopologyNode {
  shardId: string;
  assetId: string;
  pageNumber: number;
  kind: string;
  edges: ShardEdge[];
  neighborCount: number;
  isSpatiallyIsolated: boolean;
}

export interface ShardTopology {
  topologyId: string;
  pdfId: string;
  nodes: ShardTopologyNode[];
  edges: ShardEdge[];
  pageCount: number;
  assetId: string;
  analyzedAt: number;
}

const ADJACENCY_THRESHOLD_PX = 40;
const topologyLog = new Map<string, ShardTopology>();

function overlap(a: PdfPageShard, b: PdfPageShard): boolean {
  return !(
    a.boundingBox.x + a.boundingBox.w < b.boundingBox.x ||
    b.boundingBox.x + b.boundingBox.w < a.boundingBox.x ||
    a.boundingBox.y + a.boundingBox.h < b.boundingBox.y ||
    b.boundingBox.y + b.boundingBox.h < a.boundingBox.y
  );
}

function proximity(a: PdfPageShard, b: PdfPageShard): ShardRelationType | null {
  if (a.pageNumber !== b.pageNumber) {
    if (a.pageNumber + 1 === b.pageNumber && a.kind === "text-column" && b.kind === "text-column") {
      return "continues-on-next-page";
    }
    return null;
  }

  const aBox = a.boundingBox;
  const bBox = b.boundingBox;

  const above = aBox.y + aBox.h <= bBox.y + ADJACENCY_THRESHOLD_PX && aBox.y + aBox.h >= bBox.y - ADJACENCY_THRESHOLD_PX;
  const below = bBox.y + bBox.h <= aBox.y + ADJACENCY_THRESHOLD_PX && bBox.y + bBox.h >= aBox.y - ADJACENCY_THRESHOLD_PX;
  const left  = aBox.x + aBox.w <= bBox.x + ADJACENCY_THRESHOLD_PX && aBox.x + aBox.w >= bBox.x - ADJACENCY_THRESHOLD_PX;
  const right = bBox.x + bBox.w <= aBox.x + ADJACENCY_THRESHOLD_PX && bBox.x + bBox.w >= aBox.x - ADJACENCY_THRESHOLD_PX;

  if (a.imageUri && b.kind === "text-column" && overlap(a, b)) return "caption-of";
  if (a.kind === "header-zone" && (b.kind === "text-column" || b.kind === "article-panel") && above) return "heading-of";
  if (a.kind === "ad-panel" && b.kind === "article-panel") return "ad-companion";
  if (above) return "adjacent-below";
  if (below) return "adjacent-above";
  if (left)  return "adjacent-right";
  if (right) return "adjacent-left";

  return "same-page";
}

export function analyzeShardTopology(pdfId: string, shards: PdfPageShard[]): ShardTopology {
  const topologyId = `topology_${pdfId}`;
  const assetId = `shard_topology_${pdfId}`;

  registerAsset(assetId, "pdf-shard", pdfId, {
    generatorId: "ShardTopologyAnalyzer",
    metadata: { shardCount: shards.length, pdfId },
    tags: ["shard-topology", pdfId],
  });

  setHydrationStatus(assetId, "hydrating");

  recordLineage(assetId, "pdf-extraction", "ShardTopologyAnalyzer", {
    ancestorIds: shards.map(s => s.assetId),
    transforms: ["segment", "reconstruct"],
    reconstructable: true,
    metadata: { pdfId, shardCount: shards.length },
  });

  const edges: ShardEdge[] = [];
  const edgesByShardId = new Map<string, ShardEdge[]>();

  for (let i = 0; i < shards.length; i++) {
    edgesByShardId.set(shards[i].shardId, []);
    for (let j = i + 1; j < shards.length; j++) {
      const rel = proximity(shards[i], shards[j]);
      if (!rel) continue;

      const weight = rel === "heading-of" || rel === "caption-of" ? 2 : 1;

      const fwd: ShardEdge = { fromShardId: shards[i].shardId, toShardId: shards[j].shardId, relation: rel, weight };
      edges.push(fwd);
      edgesByShardId.get(shards[i].shardId)!.push(fwd);

      addDependency(shards[i].assetId, shards[j].assetId, false, weight);
    }
  }

  const pages = new Set(shards.map(s => s.pageNumber));

  const nodes: ShardTopologyNode[] = shards.map(shard => {
    const shardEdges = edgesByShardId.get(shard.shardId) ?? [];
    return {
      shardId: shard.shardId,
      assetId: shard.assetId,
      pageNumber: shard.pageNumber,
      kind: shard.kind,
      edges: shardEdges,
      neighborCount: shardEdges.length,
      isSpatiallyIsolated: shardEdges.length === 0,
    };
  });

  setHydrationStatus(assetId, "hydrated");

  const topology: ShardTopology = {
    topologyId, pdfId, nodes, edges,
    pageCount: pages.size, assetId,
    analyzedAt: Date.now(),
  };

  topologyLog.set(pdfId, topology);
  return topology;
}

export function getTopology(pdfId: string): ShardTopology | null {
  return topologyLog.get(pdfId) ?? null;
}

export function getShardNeighbors(pdfId: string, shardId: string): ShardTopologyNode[] {
  const topology = topologyLog.get(pdfId);
  if (!topology) return [];
  const nodeMap = new Map(topology.nodes.map(n => [n.shardId, n]));
  const node = nodeMap.get(shardId);
  if (!node) return [];
  return node.edges.map(e => nodeMap.get(e.toShardId)).filter(Boolean) as ShardTopologyNode[];
}

export function getTopologyStats(): { totalPdfs: number; totalEdges: number; isolatedShards: number } {
  let totalEdges = 0, isolatedShards = 0;
  for (const t of topologyLog.values()) {
    totalEdges += t.edges.length;
    isolatedShards += t.nodes.filter(n => n.isSpatiallyIsolated).length;
  }
  return { totalPdfs: topologyLog.size, totalEdges, isolatedShards };
}
