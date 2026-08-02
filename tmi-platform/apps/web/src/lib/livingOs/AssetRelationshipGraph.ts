/**
 * AssetRelationshipGraph — thin link from a release workflow to assets
 * created or touched by successful RELEASE_NEW_WORK steps.
 *
 * Not a full graph engine — just typed edges for Observatory / Release Manager.
 * Career-history helpers list related album/magazine/beat ids when present —
 * never invent collector counts (Rule 20).
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
  /** Sibling album product ids from the same RELEASE_NEW_WORK run (when set). */
  relatedAlbumIds?: string[];
  /** Sibling magazine article ids from the same run (when set). */
  relatedMagazineIds?: string[];
  /** Sibling beat listing ids from the same run (when set). */
  relatedBeatIds?: string[];
}

export interface AssetRelationshipGraph {
  releaseId: string;
  performerId: string;
  edges: AssetRelationshipEdge[];
  updatedAt: string;
}

/** Honest related-id bundle for a release or YoPho edition — empty arrays when unset. */
export interface RelatedReleaseAssetIds {
  albumIds: string[];
  magazineIds: string[];
  beatIds: string[];
  yophoEditionIds: string[];
  commerceProductIds: string[];
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

/** Collect related ids present on a release graph (no fabricated counts). */
export function listRelatedReleaseAssets(
  graph: AssetRelationshipGraph,
): RelatedReleaseAssetIds {
  const albumIds: string[] = [];
  const magazineIds: string[] = [];
  const beatIds: string[] = [];
  const yophoEditionIds: string[] = [];
  const commerceProductIds: string[] = [];

  for (const e of graph.edges) {
    if (e.kind === "commerce_product") {
      commerceProductIds.push(e.assetId);
      // Commerce product from RELEASE_NEW_WORK is the album/single catalog id
      albumIds.push(e.assetId);
    }
    if (e.kind === "magazine_article") magazineIds.push(e.assetId);
    if (e.kind === "beat_listing") beatIds.push(e.assetId);
    if (e.kind === "yopho_edition") yophoEditionIds.push(e.assetId);
  }

  return {
    albumIds: uniq(albumIds),
    magazineIds: uniq(magazineIds),
    beatIds: uniq(beatIds),
    yophoEditionIds: uniq(yophoEditionIds),
    commerceProductIds: uniq(commerceProductIds),
  };
}

/**
 * Related album/magazine/beat ids for a YoPho edition (or any asset) when
 * RELEASE_NEW_WORK recorded sibling edges on the same graph.
 */
export function listRelatedForAsset(
  graph: AssetRelationshipGraph,
  assetId: string,
): RelatedReleaseAssetIds {
  const edge = graph.edges.find((e) => e.assetId === assetId);
  const fromRelease = listRelatedReleaseAssets(graph);
  if (!edge) {
    return {
      albumIds: [],
      magazineIds: [],
      beatIds: [],
      yophoEditionIds: [],
      commerceProductIds: [],
    };
  }
  return {
    albumIds: uniq([...(edge.relatedAlbumIds ?? []), ...fromRelease.albumIds]).filter(
      (id) => id !== assetId,
    ),
    magazineIds: uniq([
      ...(edge.relatedMagazineIds ?? []),
      ...fromRelease.magazineIds,
    ]).filter((id) => id !== assetId),
    beatIds: uniq([...(edge.relatedBeatIds ?? []), ...fromRelease.beatIds]).filter(
      (id) => id !== assetId,
    ),
    yophoEditionIds: fromRelease.yophoEditionIds.filter((id) => id !== assetId),
    commerceProductIds: fromRelease.commerceProductIds.filter((id) => id !== assetId),
  };
}

/**
 * Stamp cross-links on YoPho / commerce / beat edges after a run so editions
 * can list related album/magazine/beat ids. Idempotent.
 */
export function enrichReleaseCrossLinks(
  graph: AssetRelationshipGraph,
): AssetRelationshipGraph {
  const related = listRelatedReleaseAssets(graph);
  const edges = graph.edges.map((e) => {
    if (
      e.kind !== "yopho_edition" &&
      e.kind !== "commerce_product" &&
      e.kind !== "beat_listing" &&
      e.kind !== "magazine_article"
    ) {
      return e;
    }
    return {
      ...e,
      relatedAlbumIds: uniq(
        (e.relatedAlbumIds ?? []).concat(
          related.albumIds.filter((id) => id !== e.assetId),
        ),
      ),
      relatedMagazineIds: uniq(
        (e.relatedMagazineIds ?? []).concat(
          related.magazineIds.filter((id) => id !== e.assetId),
        ),
      ),
      relatedBeatIds: uniq(
        (e.relatedBeatIds ?? []).concat(
          related.beatIds.filter((id) => id !== e.assetId),
        ),
      ),
    };
  });
  return { ...graph, edges, updatedAt: new Date().toISOString() };
}

function uniq(ids: string[]): string[] {
  return Array.from(new Set(ids.filter(Boolean)));
}
