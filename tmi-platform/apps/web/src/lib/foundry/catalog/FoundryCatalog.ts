/**
 * Foundry Catalog — the ONE catalog record type connecting manufactured Foundry assets
 * to ownership, the venue/lobby editor and the live runtime (owner directive 2026-11-18).
 *
 *   FOUNDRY ASSET → VARIANT → CATALOG RECORD → ENTITLEMENT (store_item_ownerships)
 *     → EDITOR PLACEMENT (VenuePlacement.kitAssetId = variantId) → SAVED DESIGN → RUNTIME
 *
 * Commerce convergence (audit 2026-11-18): two skin purchase systems exist —
 * StoreItemEngine → store_item_ownerships, and VenueSkinCommerce → venue_skin_ownerships.
 * New Foundry items use ONLY store_item_ownerships (itemId = "foundry:<variantId>");
 * venue skins stay readable through the legacy adapter in FoundryCatalogOwnership. No migration.
 *
 * Purchase law: subscription tier NEVER gates buying/equipping ordinary customization.
 * Role decides which SPACE an item can go into (Rule 26). Silver still gates creating
 * additional rooms — not customizing an existing one.
 *
 * Paid items have no Stripe price yet (no Stripe mutation authorized): pricing.storeItemId
 * is null → PRICE_PENDING. They can only be owned through recorded fulfilment, never claimed.
 */
import type { VenueDesign } from "@/lib/venue/contracts/TmiVenueRuntimeContract";

export type CatalogSpace = "PERFORMER_VENUE" | "PERFORMER_LOBBY" | "FAN_LOBBY" | "LOUNGE";
export type CatalogEnvironment = "INDOOR" | "OUTDOOR" | "BOTH";
export type CatalogCertification = "CERTIFIED" | "NEEDS_CERTIFICATION" | "INCOMPLETE";
export type CatalogPricing = { kind: "FREE" } | { kind: "PAID"; storeItemId: string | null };

export type CatalogVariant = {
  variantId: string;
  familyId: string;
  label: string;
  glb: string;
  preview: string;
  spaces: CatalogSpace[];
  environment: CatalogEnvironment;
  collisionClass: "WALKABLE_SURFACE" | "SOLID" | "DECOR_NONBLOCKING";
  /** Mobile budget class; enforced by the certification test against the real GLB. */
  maxTris: number;
  certification: CatalogCertification;
  pricing: CatalogPricing;
};

const JOB = "packages/assets/generated/manufacturing/artifacts/JOB-CATALOG-VARIANTS-001";
const BOTH_SPACES: CatalogSpace[] = ["PERFORMER_VENUE", "PERFORMER_LOBBY", "FAN_LOBBY"];
const PAID_PENDING: CatalogPricing = { kind: "PAID", storeItemId: null };

function v(
  variantId: string, familyId: string, label: string, spaces: CatalogSpace[], environment: CatalogEnvironment,
  collisionClass: CatalogVariant["collisionClass"], maxTris: number, pricing: CatalogPricing,
): CatalogVariant {
  return { variantId, familyId, label, glb: `${JOB}/${variantId}.glb`, preview: `${JOB}/previews/${variantId}.png`,
    spaces, environment, collisionClass, maxTris, certification: "CERTIFIED", pricing };
}

/** Certified by runFoundryCatalog.test.ts against the real GLBs (tris, bounds, walkable top). */
export const FOUNDRY_CATALOG: readonly CatalogVariant[] = [
  v("floor_marble_white_v1", "floor_tile", "Marble Floor · White", BOTH_SPACES, "INDOOR", "WALKABLE_SURFACE", 4000, PAID_PENDING),
  v("floor_marble_black_gold_v1", "floor_tile", "Marble Floor · Black & Gold", BOTH_SPACES, "INDOOR", "WALKABLE_SURFACE", 4000, PAID_PENDING),
  v("floor_carpet_crimson_v1", "floor_tile", "Carpet Floor · Crimson", BOTH_SPACES, "INDOOR", "WALKABLE_SURFACE", 4000, { kind: "FREE" }),
  v("floor_concrete_polished_v1", "floor_tile", "Polished Concrete Floor", BOTH_SPACES, "INDOOR", "WALKABLE_SURFACE", 4000, PAID_PENDING),
  v("floor_starlight_cyan_v1", "floor_starlight", "Starlight Floor · Cyan", BOTH_SPACES, "INDOOR", "WALKABLE_SURFACE", 4000, PAID_PENDING),
  v("floor_starlight_magenta_v1", "floor_starlight", "Starlight Floor · Magenta", BOTH_SPACES, "INDOOR", "WALKABLE_SURFACE", 4000, PAID_PENDING),
  v("floor_starlight_gold_v1", "floor_starlight", "Starlight Floor · Gold", BOTH_SPACES, "INDOOR", "WALKABLE_SURFACE", 4000, PAID_PENDING),
  v("wall_slat_walnut_v1", "wall_slat", "Slat Wall · Walnut", BOTH_SPACES, "INDOOR", "SOLID", 2000, { kind: "FREE" }),
  v("wall_slat_white_oak_v1", "wall_slat", "Slat Wall · White Oak", BOTH_SPACES, "INDOOR", "SOLID", 2000, PAID_PENDING),
  v("wall_slat_matte_black_v1", "wall_slat", "Slat Wall · Matte Black", BOTH_SPACES, "INDOOR", "SOLID", 2000, PAID_PENDING),
  v("wall_slat_gold_v1", "wall_slat", "Slat Wall · Gold", BOTH_SPACES, "INDOOR", "SOLID", 2000, PAID_PENDING),
  v("turf_lush_green_v1", "turf_tile", "Turf · Lush Green", ["PERFORMER_VENUE"], "OUTDOOR", "WALKABLE_SURFACE", 1500, { kind: "FREE" }),
  v("turf_dry_summer_v1", "turf_tile", "Turf · Dry Summer", ["PERFORMER_VENUE"], "OUTDOOR", "WALKABLE_SURFACE", 1500, PAID_PENDING),
  v("turf_synthetic_field_v1", "turf_tile", "Turf · Synthetic Field", ["PERFORMER_VENUE"], "OUTDOOR", "WALKABLE_SURFACE", 1500, PAID_PENDING),
  v("terrain_pad_dirt_v1", "terrain_pad", "Terrain Pad · Dirt", ["PERFORMER_VENUE"], "OUTDOOR", "WALKABLE_SURFACE", 500, { kind: "FREE" }),
  v("terrain_pad_gravel_v1", "terrain_pad", "Terrain Pad · Gravel", ["PERFORMER_VENUE"], "OUTDOOR", "WALKABLE_SURFACE", 500, PAID_PENDING),
  v("terrain_perimeter_curb_stone_v1", "perimeter_curb", "Perimeter Curb · Stone", ["PERFORMER_VENUE"], "OUTDOOR", "WALKABLE_SURFACE", 500, PAID_PENDING),
];

const BY_ID = new Map(FOUNDRY_CATALOG.map((x) => [x.variantId, x]));
export const getCatalogVariant = (id: string) => BY_ID.get(id);
export const isCatalogVariantId = (id: string) => BY_ID.has(id);
export const catalogOwnershipItemId = (variantId: string) => `foundry:${variantId}`;

/** Which space a blueprint is (explicit — never inferred from a label). */
const FAN_LOBBY_BLUEPRINTS = new Set(["fan-lobby-cineplex-v1", "cineplex-concourse-v1"]);
const PERFORMER_LOBBY_BLUEPRINTS = new Set(["performer-lobby-v1"]);
const LOUNGE_BLUEPRINTS = new Set(["purpose-lounge-v1"]);
const OUTDOOR_BLUEPRINTS = new Set(["outdoor-courtyard-v1", "stone-fireplace-lounge-v1", "skin-outdoor-pool-v1"]);

export function blueprintSpace(blueprintId: string): CatalogSpace {
  if (FAN_LOBBY_BLUEPRINTS.has(blueprintId)) return "FAN_LOBBY";
  if (PERFORMER_LOBBY_BLUEPRINTS.has(blueprintId)) return "PERFORMER_LOBBY";
  if (LOUNGE_BLUEPRINTS.has(blueprintId)) return "LOUNGE";
  return "PERFORMER_VENUE";
}
export const blueprintEnvironment = (blueprintId: string): "INDOOR" | "OUTDOOR" => (OUTDOOR_BLUEPRINTS.has(blueprintId) ? "OUTDOOR" : "INDOOR");

const PERFORMER_ROLES = new Set(["PERFORMER", "BAND", "ARTIST", "VENUE", "PRODUCER"]);
const OPERATOR_ROLES = new Set(["ADMIN", "STAFF"]);

/**
 * Who may customize a blueprint's design. Tier is deliberately NOT an input:
 * Free accounts customize their own spaces. Fans: Fan Avatar Lobbies only.
 * Performers: venues/performer lobbies/lounges, never fan lobbies. Operators: all.
 */
export function mayCustomizeBlueprint(role: string, blueprintId: string): boolean {
  const r = role.toUpperCase();
  if (OPERATOR_ROLES.has(r)) return true;
  const space = blueprintSpace(blueprintId);
  if (r === "FAN") return space === "FAN_LOBBY";
  if (PERFORMER_ROLES.has(r)) return space !== "FAN_LOBBY";
  return false;
}

export type AssetIssue = { path: string; code: "ASSET_NOT_CERTIFIED" | "SPACE_NOT_ALLOWED" | "ENVIRONMENT_MISMATCH" | "ITEM_NOT_OWNED" };

/**
 * Entitlement gate for a design. Catalog variants must be certified, allowed in this
 * space/environment, and FREE or owned. Legacy VENUE_KIT_ASSETS (never priced or sold)
 * stay placeable as before. Operators may stage any certified asset.
 */
export function authorizeDesignAssets(input: { design: VenueDesign; role: string; owned: ReadonlySet<string> }): { ok: true } | { ok: false; issues: AssetIssue[] } {
  const issues: AssetIssue[] = [];
  const space = blueprintSpace(input.design.blueprintId);
  const env = blueprintEnvironment(input.design.blueprintId);
  const operator = OPERATOR_ROLES.has(input.role.toUpperCase());
  input.design.placements.forEach((p, i) => {
    const c = getCatalogVariant(p.kitAssetId);
    if (!c) return; // legacy kit asset (validated by validateVenueDesign)
    const at = `placements[${i}]`;
    if (c.certification !== "CERTIFIED") issues.push({ path: at, code: "ASSET_NOT_CERTIFIED" });
    if (!c.spaces.includes(space)) issues.push({ path: at, code: "SPACE_NOT_ALLOWED" });
    if (c.environment !== "BOTH" && c.environment !== env) issues.push({ path: at, code: "ENVIRONMENT_MISMATCH" });
    if (!operator && c.pricing.kind === "PAID" && !input.owned.has(catalogOwnershipItemId(c.variantId))) issues.push({ path: at, code: "ITEM_NOT_OWNED" });
  });
  return issues.length ? { ok: false, issues } : { ok: true };
}

export type RenderMode = "LIVE" | "PREVIEW";
export type RenderableDesign = {
  design: VenueDesign;
  /** Paid catalog items the owner does not own. LIVE: removed. PREVIEW: kept, flagged. */
  unownedPlacementIds: string[];
  /** PREVIEW with unowned items = try-before-buy: never publishable, never shown to an audience. */
  publishable: boolean;
};

/**
 * The load/render path. Ownership can change after a design was saved (refund, revocation,
 * a legacy record), so every render re-checks it: an audience never sees an unowned paid
 * item; the owner may preview it (Rule 27 try-before-buy) but cannot publish it.
 */
export function resolveDesignForRender(design: VenueDesign, owned: ReadonlySet<string>, mode: RenderMode): RenderableDesign {
  const unowned = design.placements
    .filter((p) => {
      const c = getCatalogVariant(p.kitAssetId);
      return c?.pricing.kind === "PAID" && !owned.has(catalogOwnershipItemId(c.variantId));
    })
    .map((p) => p.placementId);
  if (mode === "PREVIEW") return { design, unownedPlacementIds: unowned, publishable: unowned.length === 0 };
  const keep = new Set(unowned);
  return { design: { ...design, placements: design.placements.filter((p) => !keep.has(p.placementId)) }, unownedPlacementIds: unowned, publishable: unowned.length === 0 };
}

/** Storefront state for a viewer (no fabricated prices: paid without Stripe price = PRICE_PENDING). */
export function storefrontState(c: CatalogVariant, owned: ReadonlySet<string>): "OWNED" | "FREE" | "PURCHASABLE" | "PRICE_PENDING" {
  if (owned.has(catalogOwnershipItemId(c.variantId))) return "OWNED";
  if (c.pricing.kind === "FREE") return "FREE";
  return c.pricing.storeItemId ? "PURCHASABLE" : "PRICE_PENDING";
}
