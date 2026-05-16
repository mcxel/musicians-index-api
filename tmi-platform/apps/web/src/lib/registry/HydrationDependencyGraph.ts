/**
 * HydrationDependencyGraph
 * Tracks dependency relationships between assets so hydration happens in the right order.
 * An avatar requires a pose library; a venue requires its seat map; a magazine panel requires its shard.
 */

export type DependencyEdge = {
  fromAssetId: string;    // dependent (needs the other to hydrate first)
  toAssetId: string;      // dependency (must hydrate before 'from')
  required: boolean;      // false = soft dependency (degrades gracefully if missing)
  weight: number;         // 1-10 priority weight
};

const edges = new Map<string, Set<string>>();        // assetId → set of dependency assetIds
const reverseEdges = new Map<string, Set<string>>(); // assetId → set of dependents
const edgeMetadata = new Map<string, DependencyEdge>();

function edgeKey(from: string, to: string): string { return `${from}→${to}`; }

export function addDependency(from: string, to: string, required = true, weight = 5): void {
  if (!edges.has(from)) edges.set(from, new Set());
  if (!reverseEdges.has(to)) reverseEdges.set(to, new Set());

  edges.get(from)!.add(to);
  reverseEdges.get(to)!.add(from);
  edgeMetadata.set(edgeKey(from, to), { fromAssetId: from, toAssetId: to, required, weight });
}

export function removeDependency(from: string, to: string): void {
  edges.get(from)?.delete(to);
  reverseEdges.get(to)?.delete(from);
  edgeMetadata.delete(edgeKey(from, to));
}

export function getDependencies(assetId: string): DependencyEdge[] {
  const deps = edges.get(assetId) ?? new Set();
  return [...deps].map(to => edgeMetadata.get(edgeKey(assetId, to))!).filter(Boolean);
}

export function getDependents(assetId: string): string[] {
  return [...(reverseEdges.get(assetId) ?? new Set())];
}

export function getRequiredDependencies(assetId: string): string[] {
  return getDependencies(assetId).filter(e => e.required).map(e => e.toAssetId);
}

export function canHydrate(assetId: string, hydratedSet: Set<string>): boolean {
  const required = getRequiredDependencies(assetId);
  return required.every(dep => hydratedSet.has(dep));
}

export function topologicalOrder(assetIds: string[]): string[] {
  const visited = new Set<string>();
  const result: string[] = [];

  function visit(id: string, stack = new Set<string>()): void {
    if (visited.has(id)) return;
    if (stack.has(id)) return;  // cycle guard
    stack.add(id);
    for (const dep of (edges.get(id) ?? new Set())) {
      if (assetIds.includes(dep)) visit(dep, stack);
    }
    visited.add(id);
    result.push(id);
  }

  assetIds.forEach(id => visit(id));
  return result;
}

export function detectCycles(assetId: string): string[] {
  const cycle: string[] = [];
  const visited = new Set<string>();

  function dfs(current: string, path: string[]): boolean {
    if (visited.has(current)) return false;
    if (path.includes(current)) { cycle.push(...path.slice(path.indexOf(current)), current); return true; }
    visited.add(current);
    for (const dep of (edges.get(current) ?? new Set())) {
      if (dfs(dep, [...path, current])) return true;
    }
    return false;
  }

  dfs(assetId, []);
  return cycle;
}

export function getGraphStats(): { nodes: number; edges: number; maxDepth: number } {
  let maxDepth = 0;
  function depth(id: string, seen: Set<string>): number {
    if (seen.has(id)) return 0;
    seen.add(id);
    const deps = [...(edges.get(id) ?? [])];
    return deps.length > 0 ? 1 + Math.max(...deps.map(d => depth(d, seen))) : 0;
  }
  for (const id of edges.keys()) maxDepth = Math.max(maxDepth, depth(id, new Set()));
  let totalEdges = 0;
  for (const s of edges.values()) totalEdges += s.size;
  return { nodes: edges.size, edges: totalEdges, maxDepth };
}
