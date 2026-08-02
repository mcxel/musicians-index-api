/**
 * AssetRelationshipGraph — thin link from a release workflow to assets
 * created or touched by successful RELEASE_NEW_WORK steps.
 *
 * Not a full graph engine — just typed edges for Observatory / Release Manager.
 */

export type RelatedAssetKind =
  | "commerce_product"
  | "yopho_edition"
  | "magazine_article"
  | "distributor_link"
  | "storefront_link"
  | "listening_party"
  | "notification"
  | "analytics_session"
  | "beat_listing"
  | "other";

export interface AssetRelationshipEdge {
  assetId: string;
  kind: RelatedAssetKind;
  /** Workflow step that created/linked this asset. */
  stepId: string;
  createdAt: string;
}

export interface AssetRelationshipGraph {
  releaseId: string;
  performerId: string;
  edges: AssetRelationshipEdge[];
  updatedAt: string;
}

export function emptyAssetGraph(
  releaseId: string,
  performerId: string,
): AssetRelationshipGraph {
  return {
    releaseId,
    performerId,
    edges: [],
    updatedAt: new Date().toISOString(),
  };
}

export function appendAssetEdge(
  graph: AssetRelationshipGraph,
  edge: Omit<AssetRelationshipEdge, "createdAt"> & { createdAt?: string },
): AssetRelationshipGraph {
  const next: AssetRelationshipEdge = {
    ...edge,
    createdAt: edge.createdAt ?? new Date().toISOString(),
  };
  const withoutDup = graph.edges.filter(
    (e) => !(e.assetId === next.assetId && e.kind === next.kind),
  );
  return {
    ...graph,
    edges: [...withoutDup, next],
    updatedAt: new Date().toISOString(),
  };
}
