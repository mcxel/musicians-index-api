export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getAllVenueTemplates } from "@/lib/venues/VenueTemplateRegistry";
import {
  BATTLE_ARENA_ELASTICITY_CERT_SEQUENCE,
  BATTLE_ARENA_ELASTICITY_CERT_STATUS,
  ELASTIC_SHARD_THRESHOLDS,
  PERSISTENCE_SPLIT,
  SCENE_CACHE_LIFECYCLE,
  SEMANTIC_ANCHOR_CLASS_IDS,
  VENUE_PLATFORM_LAWS,
} from "@/lib/venues/VenuePlatformContract";
import { getAllTierBaseVenueSkins } from "@/lib/venues/TierBaseVenueSkin";
import { listCatalogProducts } from "@/lib/venue/VenueSkinCommerce";
import { getAudienceMigrationPolicy, getMigrationCommitRule } from "@/lib/live/ElasticRoomOrchestrator";
import { OVERFLOW_SYSTEMS } from "@/lib/venues/VenueOverflowSystemMap";
import { GLOBAL_SHOW_AUTHORITY_LAWS } from "@/lib/venues/GlobalShowAuthority";
import { VENUE_PORTAL_LAWS, DEFAULT_CAMPUS_PORTALS } from "@/lib/venues/VenuePortalContract";
import { getSceneFactorySnapshot } from "@/lib/venues/VenueSceneFactory";

/**
 * Canonical venue platform snapshot — templates, capacities kept separate,
 * geometry explicitly MISSING. Not a GLB mill. Cert sequence is locked, not passed.
 */
export async function GET() {
  const sceneFactory = getSceneFactorySnapshot();
  return NextResponse.json({
    ok: true,
    laws: VENUE_PLATFORM_LAWS,
    showAuthorityLaws: GLOBAL_SHOW_AUTHORITY_LAWS,
    portalLaws: VENUE_PORTAL_LAWS,
    portals: DEFAULT_CAMPUS_PORTALS,
    overflowSystems: OVERFLOW_SYSTEMS,
    migrationPolicy: getAudienceMigrationPolicy(),
    commitBeforeMove: getMigrationCommitRule(),
    persistenceSplit: PERSISTENCE_SPLIT,
    elasticThresholds: ELASTIC_SHARD_THRESHOLDS,
    tierBaseSkins: getAllTierBaseVenueSkins(),
    purchasedSkinCatalog: listCatalogProducts(),
    templates: getAllVenueTemplates(),
    sceneFactory,
    factoryLaws: sceneFactory.laws,
    factoryAudit: sceneFactory.audit,
    semanticAnchors: sceneFactory.semanticAnchors,
    semanticAnchorClassIds: SEMANTIC_ANCHOR_CLASS_IDS,
    sceneRuntimeBudget: sceneFactory.budget,
    cacheLifecycle: SCENE_CACHE_LIFECYCLE,
    battleArenaElasticityCertSequence: BATTLE_ARENA_ELASTICITY_CERT_SEQUENCE,
    battleArenaElasticityCertStatus: BATTLE_ARENA_ELASTICITY_CERT_STATUS,
  });
}
