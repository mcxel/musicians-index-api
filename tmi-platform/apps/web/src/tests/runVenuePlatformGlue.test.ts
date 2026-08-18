import { canonicalizeAccountTier, resolveBaseVenueSkin, getAllTierBaseVenueSkins } from "../lib/venues/TierBaseVenueSkin";
import {
  auditoriumMeshAddress,
  formatVenueMeshAddress,
  parseVenueMeshAddress,
} from "../lib/venues/VenueMeshAddress";
import { getVenueTemplate, getAllVenueTemplates } from "../lib/venues/VenueTemplateRegistry";
import { SEASON_PASS_INCLUDED_SKINS } from "../lib/venue/VenueSkinCommerce";
import { venueSkinSku, parseVenueSkinSku } from "../lib/commerce/CommerceCatalogContract";
import { ANCHOR_SLUG_TO_NETWORK_ROOM_ID } from "../lib/venues/VenueOverflowSystemMap";
import {
  AUDIENCE_MIGRATION_POLICY,
  BATTLE_ARENA_ELASTICITY_CERT_SEQUENCE,
  ELASTIC_SHARD_THRESHOLDS,
  MIGRATION_COMMIT_RULE,
  SEMANTIC_ANCHOR_CLASS_IDS,
  VENUE_AUTHORITIES,
  VENUE_PLATFORM_LAWS,
} from "../lib/venues/VenuePlatformContract";
import { DEFAULT_CAMPUS_PORTALS } from "../lib/venues/VenuePortalContract";
import {
  SCENE_FACTORY_AUDIT,
  requestVenueSceneInstance,
} from "../lib/venues/VenueSceneFactory";

function runVenuePlatformGlueTest() {
  const results: Record<string, boolean> = {};

  results["bronze_maps_to_ruby"] = canonicalizeAccountTier("BRONZE") === "RUBY";
  results["bronze_never_emitted"] = resolveBaseVenueSkin("BRONZE").id === "BASE_RUBY";
  results["seven_tier_bases"] = getAllTierBaseVenueSkins().length === 7;
  results["no_bronze_base_id"] = getAllTierBaseVenueSkins().every((s) => !s.id.includes("BRONZE"));

  const addr = auditoriumMeshAddress({
    eventId: "event-battle-thunder-dome",
    venueType: "battle",
    clusterId: "main-bowl",
    auditoriumIndex: 2,
  });
  const key = formatVenueMeshAddress(addr);
  const parsed = parseVenueMeshAddress(key);
  results["mesh_roundtrip"] = parsed?.auditoriumId === "A02" && parsed?.environmentId === "auditorium";
  results["mesh_not_bare_seat"] = key.includes("event-battle-thunder-dome") && !key.startsWith("Seat");

  const monday = getVenueTemplate("monday-night-stage");
  results["monday_conflict_preserved"] = Boolean(
    monday?.capacityConflicts.some((c) => c.includes("4,000") && c.includes("5,000")),
  );
  results["geometry_missing"] = getAllVenueTemplates().every((t) => t.geometry.status === "MISSING");
  results["capacities_not_feet"] = getAllVenueTemplates().every(
    (t) => t.geometry.width === null && t.geometry.depth === null,
  );

  results["season_pass_not_all_skins"] = SEASON_PASS_INCLUDED_SKINS.size === 2;
  results["sku_roundtrip"] = parseVenueSkinSku(venueSkinSku("neon-club")) === "neon-club";

  results["twelve_anchor_aliases"] = Object.keys(ANCHOR_SLUG_TO_NETWORK_ROOM_ID).length === 12;
  results["portals_preserve_show"] = DEFAULT_CAMPUS_PORTALS.every((p) => p.preservesShowAuthority);
  results["portals_geometry_missing"] = DEFAULT_CAMPUS_PORTALS.every((p) => p.geometryStatus === "MISSING");
  results["failed_migration_keeps_seat"] = AUDIENCE_MIGRATION_POLICY.failedMigrationKeepsOriginalSeat;
  results["geometry_law_present"] = Boolean(VENUE_PLATFORM_LAWS.geometry);
  results["factory_law_present"] = VENUE_PLATFORM_LAWS.existingSceneFactory.includes("No parallel generator");
  results["no_parallel_generator"] =
    SCENE_FACTORY_AUDIT.parallelGeneratorForbidden === true &&
    VENUE_AUTHORITIES.roomOrchestrator.includes("never builds PlaneGeometry");
  results["expand_cooldown_present"] = typeof ELASTIC_SHARD_THRESHOLDS.expandCooldownMs === "number";

  const lockedAnchors = [
    "STAGE_CENTER",
    "STAGE_LEFT",
    "STAGE_RIGHT",
    "CAMERA_MAIN_WIDE",
    "CAMERA_STAGE_LEFT",
    "CAMERA_AUDIENCE",
    "CAMERA_BALCONY",
    "SECTION_A",
    "SECTION_B",
    "SECTION_C",
    "VIP_LOUNGE_PORTAL",
    "MAIN_ENTRANCE",
    "BACKSTAGE_PORTAL",
    "SCREEN_MAIN",
    "SCREEN_LEFT",
    "SCREEN_RIGHT",
  ] as const;
  results["semantic_anchors_stable"] =
    SEMANTIC_ANCHOR_CLASS_IDS.length === lockedAnchors.length &&
    lockedAnchors.every((id, i) => SEMANTIC_ANCHOR_CLASS_IDS[i] === id);

  const scene = requestVenueSceneInstance({
    templateId: "tpl-battle",
    environmentVariant: "auditorium",
    shardAddress: addr,
    appearance: {
      baseTierSkinId: "BASE_FREE",
      purchasedSkinId: null,
      seasonalVariantId: null,
      structureUnchanged: true,
    },
    roomId: "battle-thunder-dome",
  });
  results["factory_geometry_missing"] = scene.geometryStatus === "MISSING" && scene.constructedGeometry === false;
  results["factory_anchors_unmeasured"] = scene.semanticAnchors.every((a) => a.position === null);
  results["factory_starts_warming"] = scene.lifecycle === "WARMING";

  results["commit_before_move_rule"] =
    MIGRATION_COMMIT_RULE.includes("NOT committed") &&
    MIGRATION_COMMIT_RULE.includes("destination seat/zone is reserved") &&
    VENUE_PLATFORM_LAWS.commitBeforeMove === MIGRATION_COMMIT_RULE &&
    AUDIENCE_MIGRATION_POLICY.failedMigrationKeepsOriginalSeat === true;

  results["nine_step_cert_sequence"] =
    BATTLE_ARENA_ELASTICITY_CERT_SEQUENCE.length === 9 &&
    BATTLE_ARENA_ELASTICITY_CERT_SEQUENCE.every((s, i) => s.step === i + 1 && s.certified === false);

  const allPassed = Object.values(results).every(Boolean);
  console.log("[VENUE_PLATFORM_GLUE_TEST_ASSERT]", { allPassed, results });
  if (!allPassed) {
    const failed = Object.entries(results).filter(([, ok]) => !ok).map(([k]) => k);
    throw new Error(`[VENUE_PLATFORM_GLUE_TEST] FAILED: ${failed.join(", ")}`);
  }
}

runVenuePlatformGlueTest();
