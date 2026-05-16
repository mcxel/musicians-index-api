import type { ChatRoomId } from '@/lib/chat/RoomChatEngine';

export type LineageNodeType =
  | 'pdf-source'
  | 'performer-render'
  | 'motion-portrait'
  | 'orbit-face'
  | 'billboard-variant'
  | 'overlay-fragment'
  | 'reconstruction-output'
  | 'ticket-render'
  | 'nft-derivative';

export interface AssetLineageNode {
  nodeId: string;
  roomId?: ChatRoomId;
  type: LineageNodeType;
  assetId: string;
  sourceAssetId?: string;
  ownerId?: string;
  createdAtMs: number;
  updatedAtMs: number;
  metadata?: Record<string, string | number | boolean>;
}

export interface AssetLineageEdge {
  edgeId: string;
  fromNodeId: string;
  toNodeId: string;
  relation: 'derived-from' | 'consumed-by' | 'ownership-inherits' | 'fragment-of';
  createdAtMs: number;
}

const nodes = new Map<string, AssetLineageNode>();
const edges = new Map<string, AssetLineageEdge>();
const consumersByNode = new Map<string, Set<string>>();

export function upsertLineageNode(input: {
  nodeId: string;
  assetId: string;
  type: LineageNodeType;
  roomId?: ChatRoomId;
  sourceAssetId?: string;
  ownerId?: string;
  metadata?: Record<string, string | number | boolean>;
}): AssetLineageNode {
  const now = Date.now();
  const existing = nodes.get(input.nodeId);
  const node: AssetLineageNode = {
    nodeId: input.nodeId,
    roomId: input.roomId,
    type: input.type,
    assetId: input.assetId,
    sourceAssetId: input.sourceAssetId,
    ownerId: input.ownerId,
    createdAtMs: existing?.createdAtMs ?? now,
    updatedAtMs: now,
    metadata: input.metadata,
  };
  nodes.set(node.nodeId, node);
  return node;
}

export function addLineageEdge(input: {
  fromNodeId: string;
  toNodeId: string;
  relation: AssetLineageEdge['relation'];
}): AssetLineageEdge {
  const edgeId = `${input.fromNodeId}->${input.toNodeId}:${input.relation}`;
  const edge: AssetLineageEdge = {
    edgeId,
    fromNodeId: input.fromNodeId,
    toNodeId: input.toNodeId,
    relation: input.relation,
    createdAtMs: Date.now(),
  };
  edges.set(edge.edgeId, edge);

  const consumers = consumersByNode.get(input.fromNodeId) ?? new Set<string>();
  consumers.add(input.toNodeId);
  consumersByNode.set(input.fromNodeId, consumers);

  return edge;
}

export function registerRuntimeConsumer(input: {
  nodeId: string;
  consumerId: string;
}): void {
  const consumers = consumersByNode.get(input.nodeId) ?? new Set<string>();
  consumers.add(input.consumerId);
  consumersByNode.set(input.nodeId, consumers);
}

export function listLineageChain(startNodeId: string): {
  nodes: AssetLineageNode[];
  edges: AssetLineageEdge[];
} {
  const visited = new Set<string>();
  const queue = [startNodeId];
  const chainNodes: AssetLineageNode[] = [];
  const chainEdges: AssetLineageEdge[] = [];

  while (queue.length > 0) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);

    const node = nodes.get(id);
    if (node) chainNodes.push(node);

    for (const edge of edges.values()) {
      if (edge.fromNodeId === id) {
        chainEdges.push(edge);
        queue.push(edge.toNodeId);
      }
    }
  }

  return { nodes: chainNodes, edges: chainEdges };
}

export function findOrphanLineageNodes(): AssetLineageNode[] {
  const incoming = new Set<string>();
  const outgoing = new Set<string>();

  for (const edge of edges.values()) {
    outgoing.add(edge.fromNodeId);
    incoming.add(edge.toNodeId);
  }

  return [...nodes.values()].filter((node) => !incoming.has(node.nodeId) && !outgoing.has(node.nodeId));
}

export function removeStaleLineageNodes(maxIdleMs = 24 * 60 * 60 * 1000): number {
  const now = Date.now();
  let removed = 0;

  for (const [nodeId, node] of nodes.entries()) {
    const idle = now - node.updatedAtMs > maxIdleMs;
    const activeConsumers = (consumersByNode.get(nodeId)?.size ?? 0) > 0;
    if (idle && !activeConsumers) {
      nodes.delete(nodeId);
      consumersByNode.delete(nodeId);
      removed += 1;
    }
  }

  for (const [edgeId, edge] of edges.entries()) {
    if (!nodes.has(edge.fromNodeId) || !nodes.has(edge.toNodeId)) {
      edges.delete(edgeId);
    }
  }

  return removed;
}

export function getAssetLineageDiagnostics() {
  return {
    nodeCount: nodes.size,
    edgeCount: edges.size,
    orphanCount: findOrphanLineageNodes().length,
    activeConsumerLinks: [...consumersByNode.values()].reduce((sum, set) => sum + set.size, 0),
    recentNodes: [...nodes.values()].sort((a, b) => b.updatedAtMs - a.updatedAtMs).slice(0, 20),
  };
}
