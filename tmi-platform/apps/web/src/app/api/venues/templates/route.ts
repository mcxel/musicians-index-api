export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getAllVenueTemplates, getVenueTemplate } from "@/lib/venues/VenueTemplateRegistry";
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
import {
  activateVenueSceneInstance,
  controlRequestVenueScene,
  getSceneFactorySnapshot,
} from "@/lib/venues/VenueSceneFactory";
import { auditoriumMeshAddress } from "@/lib/venues/VenueMeshAddress";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";

/**
 * Canonical venue platform snapshot — templates, capacities kept separate,
 * geometry explicitly MISSING. Not a GLB mill.
 * POST unlocks Scene Factory Controller instantiate against existing factory only.
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

export async function POST(req: NextRequest) {
  const auth = await getTmiAuth();
  const role = (auth?.user.role ?? "").toUpperCase();
  if (!auth || (role !== "ADMIN" && role !== "SUPERADMIN" && role !== "STAFF")) {
    return NextResponse.json(
      { ok: false, reason: "Admin session required for Scene Factory Controller." },
      { status: 403 },
    );
  }

  let body: { action?: string; templateId?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "Invalid JSON body." }, { status: 400 });
  }

  if (body.action !== "instantiate" || !body.templateId) {
    return NextResponse.json(
      { ok: false, reason: "action=instantiate and templateId are required." },
      { status: 400 },
    );
  }

  const template = getVenueTemplate(body.templateId);
  if (!template) {
    return NextResponse.json({ ok: false, reason: "Unknown templateId." }, { status: 404 });
  }

  const mesh = auditoriumMeshAddress({
    eventId: `admin-scene-${body.templateId}`,
    venueType: String(template.venueType),
    clusterId: "controller",
    auditoriumIndex: 1,
  });

  const result = controlRequestVenueScene({
    templateId: body.templateId,
    environmentVariant: "auditorium",
    shardAddress: mesh,
    roomId: template.liveSlug ?? body.templateId,
    canonicalVenueDefinition: {
      templateId: body.templateId,
      liveSlug: template.liveSlug,
    },
    appearance: {
      baseTierSkinId: "BASE_FREE",
      purchasedSkinId: null,
      seasonalVariantId: null,
      structureUnchanged: true,
    },
  });

  if (!result.ok) {
    return NextResponse.json(result, { status: 409 });
  }

  activateVenueSceneInstance(result.instance.id);
  return NextResponse.json({
    ok: true,
    instance: result.instance,
    controller: result.controller,
  });
}
