/**
 * ReconstructionGraphBuilder — Stage C
 * Builds runtime-ready reconstruction assets from decomposition artifacts and isolated layers.
 * Produces: avatar parts, host segments, facial layers, motion portrait layers,
 * clothing pieces, sponsor panel assets, environment chunks, stage geometry,
 * billboard surfaces, venue components, HUD fragments, overlay fragments.
 * Every node is registered, authority-claimed, and lineage-tracked.
 */

import { registerAsset, setHydrationStatus } from "@/lib/registry/RuntimeAssetRegistry";
import { claimAuthority } from "@/lib/registry/AssetAuthorityLedger";
import { recordLineage } from "@/lib/registry/AssetLineageTracker";
import type { IsolatedLayer, IsolationCategory } from "@/lib/vision/LayerIsolationEngine";
import type { DecompositionResult } from "@/lib/vision/VisionDecompositionEngine";

export type ReconstructionNodeKind =
  | "avatar-part"
  | "host-segment"
  | "facial-layer"
  | "motion-portrait-layer"
  | "clothing-piece"
  | "sponsor-panel"
  | "environment-chunk"
  | "stage-geometry"
  | "billboard-surface"
  | "venue-component"
  | "hud-fragment"
  | "overlay-fragment"
  | "crowd-segment"
  | "prop-asset"
  | "seating-asset";

export interface ReconstructionNode {
  nodeId: string;
  assetId: string;
  sourceAssetId: string;
  kind: ReconstructionNodeKind;
  parentLayerIds: string[];
  parentArtifactIds: string[];
  depthOrder: number;
  isAnimatable: boolean;
  hasTransparency: boolean;
  reconstructionReady: boolean;
  authorityBound: boolean;
  generatorTargets: string[];   // which generators can consume this node
  registeredAt: number;
}

export interface ReconstructionEdge {
  fromNodeId: string;
  toNodeId: string;
  relationship: "contains" | "occludes" | "anchors" | "drives" | "overlaps";
  weight: number;
}

export interface ReconstructionGraph {
  graphId: string;
  sourceAssetId: string;
  decompositionId: string;
  nodes: ReconstructionNode[];
  edges: ReconstructionEdge[];
  rootNodeIds: string[];
  avatarPartCount: number;
  overlayFragmentCount: number;
  environmentChunkCount: number;
  errors: string[];
  builtAt: number;
}

const GRAPH_PRIORITY = 3;
const GRAPH_TTL_MS = 60_000;

const graphLog = new Map<string, ReconstructionGraph>();
type GraphListener = (graph: ReconstructionGraph) => void;
const graphListeners = new Set<GraphListener>();

function notify(graph: ReconstructionGraph): void {
  graphListeners.forEach(l => l(graph));
}

const CATEGORY_TO_NODE_KIND: Record<IsolationCategory, ReconstructionNodeKind> = {
  "foreground-subject":      "avatar-part",
  "face-region":             "facial-layer",
  "clothing":                "clothing-piece",
  "accessory":               "avatar-part",
  "motion-candidate":        "motion-portrait-layer",
  "lighting-zone":           "overlay-fragment",
  "prop":                    "prop-asset",
  "environmental-geometry":  "environment-chunk",
  "seating":                 "seating-asset",
  "display-panel":           "billboard-surface",
  "ui-overlay":              "hud-fragment",
  "background-layer":        "environment-chunk",
  "crowd-segment":           "crowd-segment",
  "stage-geometry":          "stage-geometry",
  "sponsor-surface":         "sponsor-panel",
};

const NODE_KIND_GENERATOR_TARGETS: Record<ReconstructionNodeKind, string[]> = {
  "avatar-part":             ["avatar-runtime", "performer-card", "motion-portrait"],
  "host-segment":            ["host-generator", "motion-portrait"],
  "facial-layer":            ["avatar-runtime", "performer-card", "host-generator"],
  "motion-portrait-layer":   ["motion-portrait", "performer-card"],
  "clothing-piece":          ["avatar-runtime", "nft-generator"],
  "sponsor-panel":           ["sponsor-generator", "ad-generator", "billboard-system"],
  "environment-chunk":       ["venue-generator", "lobby-generator"],
  "stage-geometry":          ["venue-generator", "home-1", "home-2"],
  "billboard-surface":       ["billboard-system", "venue-generator", "home-3"],
  "venue-component":         ["venue-generator", "lobby-generator"],
  "hud-fragment":            ["hud-system", "orbit-generator"],
  "overlay-fragment":        ["home-1", "home-2", "home-3", "home-4", "home-5"],
  "crowd-segment":           ["venue-generator", "crowd-density"],
  "prop-asset":              ["venue-generator", "home-3"],
  "seating-asset":           ["venue-generator", "seat-population"],
};

function buildNode(
  layer: IsolatedLayer,
  sourceAssetId: string,
  decompositionId: string,
  index: number
): ReconstructionNode | null {
  const kind = CATEGORY_TO_NODE_KIND[layer.category];
  const nodeId = `rnode_${decompositionId}_${kind}_${index}`;
  const assetId = `recon_node_${nodeId}`;

  registerAsset(assetId, "overlay", sourceAssetId, {
    generatorId: "ReconstructionGraphBuilder",
    motionCompatible: layer.isAnimatable,
    recoveryEligible: layer.reconstructable,
    metadata: {
      kind,
      decompositionId,
      layerId: layer.layerId,
      category: layer.category,
      depthOrder: layer.depthOrder,
    },
    tags: ["recon-node", kind, sourceAssetId],
  });

  const claim = claimAuthority(assetId, "ReconstructionGraphBuilder", "generator", {
    exclusive: false,
    priority: GRAPH_PRIORITY,
    ttlMs: GRAPH_TTL_MS,
  });

  if (!claim.granted) return null;

  setHydrationStatus(assetId, "hydrating");
  recordLineage(assetId, "vision-scan", "ReconstructionGraphBuilder", {
    parentAssetId: layer.assetId,
    transforms: ["reconstruct", "segment"],
    reconstructable: layer.reconstructable,
    metadata: { kind, decompositionId, category: layer.category },
  });
  setHydrationStatus(assetId, "hydrated");

  return {
    nodeId,
    assetId,
    sourceAssetId,
    kind,
    parentLayerIds: [layer.layerId],
    parentArtifactIds: layer.parentArtifactIds,
    depthOrder: layer.depthOrder,
    isAnimatable: layer.isAnimatable,
    hasTransparency: layer.hasTransparency,
    reconstructionReady: true,
    authorityBound: false,   // set by RuntimeAuthorityBinder (Stage D)
    generatorTargets: NODE_KIND_GENERATOR_TARGETS[kind],
    registeredAt: Date.now(),
  };
}

function buildEdges(nodes: ReconstructionNode[]): ReconstructionEdge[] {
  const edges: ReconstructionEdge[] = [];

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      const depthDiff = Math.abs(a.depthOrder - b.depthOrder);

      if (depthDiff === 1) {
        // Adjacent depth layers — occlusion relationship
        const front = a.depthOrder < b.depthOrder ? a : b;
        const back = front === a ? b : a;
        edges.push({ fromNodeId: front.nodeId, toNodeId: back.nodeId, relationship: "occludes", weight: 0.8 });
      }

      // Face anchors clothing
      if (a.kind === "facial-layer" && b.kind === "clothing-piece") {
        edges.push({ fromNodeId: a.nodeId, toNodeId: b.nodeId, relationship: "anchors", weight: 0.6 });
      }

      // Motion portrait drives avatar parts
      if (a.kind === "motion-portrait-layer" && b.kind === "avatar-part") {
        edges.push({ fromNodeId: a.nodeId, toNodeId: b.nodeId, relationship: "drives", weight: 0.9 });
      }

      // Overlay fragments overlap environment
      if (a.kind === "overlay-fragment" && b.kind === "environment-chunk") {
        edges.push({ fromNodeId: a.nodeId, toNodeId: b.nodeId, relationship: "overlaps", weight: 0.5 });
      }

      // Billboard contains sponsor panel
      if (a.kind === "billboard-surface" && b.kind === "sponsor-panel") {
        edges.push({ fromNodeId: a.nodeId, toNodeId: b.nodeId, relationship: "contains", weight: 0.7 });
      }
    }
  }

  return edges;
}

export function buildReconstructionGraph(
  sourceAssetId: string,
  decompositionId: string,
  layers: IsolatedLayer[],
  decompositionResult: DecompositionResult
): ReconstructionGraph {
  const graphId = `graph_${sourceAssetId}_${Date.now()}`;
  const nodes: ReconstructionNode[] = [];
  const errors: string[] = [];

  const sorted = [...layers].sort((a, b) => a.depthOrder - b.depthOrder);

  sorted.forEach((layer, i) => {
    try {
      const node = buildNode(layer, sourceAssetId, decompositionId, i);
      if (node) nodes.push(node);
    } catch (err) {
      errors.push(`layer[${layer.layerId}]: ${err instanceof Error ? err.message : "unknown"}`);
    }
  });

  // Add host-segment node if decomposition has skeletal hints
  if (decompositionResult.skeletalHintCount > 0) {
    const hostNodeId = `rnode_${decompositionId}_host-segment_root`;
    const hostAssetId = `recon_node_${hostNodeId}`;

    registerAsset(hostAssetId, "overlay", sourceAssetId, {
      generatorId: "ReconstructionGraphBuilder",
      motionCompatible: true,
      recoveryEligible: true,
      metadata: { kind: "host-segment", decompositionId, skeletalHintCount: decompositionResult.skeletalHintCount },
      tags: ["recon-node", "host-segment", sourceAssetId],
    });

    const hostClaim = claimAuthority(hostAssetId, "ReconstructionGraphBuilder", "generator", {
      exclusive: false, priority: GRAPH_PRIORITY, ttlMs: GRAPH_TTL_MS,
    });

    if (hostClaim.granted) {
      setHydrationStatus(hostAssetId, "hydrating");
      recordLineage(hostAssetId, "vision-scan", "ReconstructionGraphBuilder", {
        parentAssetId: sourceAssetId,
        transforms: ["reconstruct", "animate"],
        reconstructable: true,
        metadata: { kind: "host-segment", decompositionId },
      });
      setHydrationStatus(hostAssetId, "hydrated");

      nodes.unshift({
        nodeId: hostNodeId,
        assetId: hostAssetId,
        sourceAssetId,
        kind: "host-segment",
        parentLayerIds: [],
        parentArtifactIds: decompositionResult.artifacts.filter(a => a.kind === "skeletal-hint").map(a => a.artifactId),
        depthOrder: 0,
        isAnimatable: true,
        hasTransparency: true,
        reconstructionReady: true,
        authorityBound: false,
        generatorTargets: NODE_KIND_GENERATOR_TARGETS["host-segment"],
        registeredAt: Date.now(),
      });
    }
  }

  const edges = buildEdges(nodes);
  const rootNodeIds = nodes.filter(n => !edges.some(e => e.toNodeId === n.nodeId)).map(n => n.nodeId);

  const graph: ReconstructionGraph = {
    graphId,
    sourceAssetId,
    decompositionId,
    nodes,
    edges,
    rootNodeIds,
    avatarPartCount: nodes.filter(n => n.kind === "avatar-part" || n.kind === "facial-layer" || n.kind === "clothing-piece").length,
    overlayFragmentCount: nodes.filter(n => n.kind === "overlay-fragment" || n.kind === "hud-fragment").length,
    environmentChunkCount: nodes.filter(n => n.kind === "environment-chunk" || n.kind === "stage-geometry").length,
    errors,
    builtAt: Date.now(),
  };

  graphLog.set(graphId, graph);
  notify(graph);
  return graph;
}

export function getReconstructionGraph(graphId: string): ReconstructionGraph | null {
  return graphLog.get(graphId) ?? null;
}

export function getGraphsByAsset(sourceAssetId: string): ReconstructionGraph[] {
  return [...graphLog.values()].filter(g => g.sourceAssetId === sourceAssetId);
}

export function getNodesByKind(kind: ReconstructionNodeKind): ReconstructionNode[] {
  const out: ReconstructionNode[] = [];
  for (const g of graphLog.values()) {
    out.push(...g.nodes.filter(n => n.kind === kind));
  }
  return out;
}

export function subscribeToGraphBuilder(listener: GraphListener): () => void {
  graphListeners.add(listener);
  return () => graphListeners.delete(listener);
}

export function getGraphBuilderStats(): {
  totalGraphs: number;
  totalNodes: number;
  totalEdges: number;
  totalAvatarParts: number;
  totalOverlayFragments: number;
  totalErrors: number;
} {
  let totalNodes = 0, totalEdges = 0, totalAvatarParts = 0, totalOverlayFragments = 0, totalErrors = 0;
  for (const g of graphLog.values()) {
    totalNodes += g.nodes.length;
    totalEdges += g.edges.length;
    totalAvatarParts += g.avatarPartCount;
    totalOverlayFragments += g.overlayFragmentCount;
    totalErrors += g.errors.length;
  }
  return { totalGraphs: graphLog.size, totalNodes, totalEdges, totalAvatarParts, totalOverlayFragments, totalErrors };
}
