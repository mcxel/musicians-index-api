/**
 * TMI Venue Runtime Contract — shared (Claude ↔ Anti-Gravity ↔ Cursor/Chris).
 * Version: TMI_VENUE_RUNTIME_CONTRACT_v1 (2026-11-18).
 *
 * Grounded in the real Foundry output (packages/assets/generated/manufacturing/artifacts),
 * audited by apps/web/scripts/auditFoundryArtifacts.ts → docs/convergence/TMI_FOUNDRY_ASSET_AUDIT.md.
 * Coordinate law (Foundry README): 1 unit = 1 m; glTF Y-up at runtime.
 *
 * A venue DESIGN only changes presentation (surfaces, lighting, decor placements).
 * It never touches room membership, seats, SFU subscriptions, backstage access,
 * or Voltron media routing.
 */

import { isCatalogVariantId } from "@/lib/foundry/catalog/FoundryCatalog";
export const TMI_VENUE_RUNTIME_CONTRACT_VERSION = "TMI_VENUE_RUNTIME_CONTRACT_v1" as const;

export type VenueDetailTier = "BLOCKOUT" | "LOW_DETAIL" | "PRODUCTION_CANDIDATE";

export type VenueBlueprint = {
  blueprintId: string;
  label: string;
  venueType: "AUDITORIUM" | "STAGE" | "LOBBY" | "LOUNGE" | "OUTDOOR" | "GAMESHOW" | "THEMED";
  /** Repo-relative path to the Foundry world GLB. */
  worldGlb: string;
  /** Detail tier measured by the audit (2026-11-18). Never "finished" until visually reviewed. */
  detailTier: VenueDetailTier;
  /** Half-extent (m) placements must stay within, measured from the rendered bounds (rounded up). */
  halfExtentM: number;
};

/** Real manufactured venue scenes. All are BLOCKOUT today (≤ ~1.3k triangles, untextured). */
export const VENUE_BLUEPRINTS: readonly VenueBlueprint[] = [
  { blueprintId: "monday-night-stage-v1", label: "Monday Night Stage", venueType: "STAGE", worldGlb: "packages/assets/generated/manufacturing/artifacts/JOB-VENUE-PROOF001/monday-night-stage-world.glb", detailTier: "BLOCKOUT", halfExtentM: 25 },
  // Architecture pass 2026-11-18 (composeVenueArchitecture.py): full enclosure, ceiling + truss,
  // acoustic panels, 8 raked rows, 96 real theatre seats, all 221 anchors preserved. Untextured.
  { blueprintId: "monday-night-stage-arch-v2", label: "Monday Night Stage (architecture v2)", venueType: "STAGE", worldGlb: "packages/assets/generated/manufacturing/artifacts/JOB-VENUE-MNS-ARCH-V2/monday-night-stage-arch-v2-world.glb", detailTier: "LOW_DETAIL", halfExtentM: 25 },
  // Integration-lane v3 (FX sockets + seat triples). LIVE_ASSET_SWITCHES=NO — blueprintRuntimeUrl
  // still maps basename to /models only after owner promotion; worldGlb stays packages path.
  { blueprintId: "monday-night-stage-arch-v3-fx", label: "Monday Night Stage (architecture v3 + FX)", venueType: "STAGE", worldGlb: "packages/assets/generated/manufacturing/artifacts/JOB-VENUE-MNS-ARCH-V2/monday-night-stage-arch-v3-fx-world.glb", detailTier: "LOW_DETAIL", halfExtentM: 25 },
  { blueprintId: "reference-auditorium-v1", label: "Reference Auditorium", venueType: "AUDITORIUM", worldGlb: "packages/assets/generated/manufacturing/artifacts/JOB-VENUE-REF-AUDITORIUM-001/reference-auditorium-v1-world.glb", detailTier: "BLOCKOUT", halfExtentM: 35 },
  { blueprintId: "reference-auditorium-v3", label: "Reference Auditorium v3", venueType: "AUDITORIUM", worldGlb: "packages/assets/generated/manufacturing/artifacts/JOB-VENUE-REF-AUDITORIUM-V3/reference-auditorium-v3-world.glb", detailTier: "LOW_DETAIL", halfExtentM: 35 },
  { blueprintId: "auditorium-classic-v1", label: "Auditorium · Classic", venueType: "AUDITORIUM", worldGlb: "packages/assets/generated/manufacturing/artifacts/JOB-SCENE-AUDITORIUM-CLASSIC-001/reference-auditorium-v1-classic-decorated-decorated-world.glb", detailTier: "BLOCKOUT", halfExtentM: 35 },
  { blueprintId: "auditorium-luxury-v1", label: "Auditorium · Luxury", venueType: "AUDITORIUM", worldGlb: "packages/assets/generated/manufacturing/artifacts/JOB-SCENE-AUDITORIUM-LUXURY-001/reference-auditorium-v1-luxury-decorated-decorated-world.glb", detailTier: "BLOCKOUT", halfExtentM: 35 },
  { blueprintId: "fan-lobby-cineplex-v1", label: "Fan Lobby · Cineplex", venueType: "LOBBY", worldGlb: "packages/assets/generated/manufacturing/artifacts/JOB-SCENE-FAN-LOBBY-CINEPLEX-001/fan-lobby-cineplex-v1-decorated-decorated-world.glb", detailTier: "BLOCKOUT", halfExtentM: 30 },
  { blueprintId: "cineplex-concourse-v1", label: "Cineplex Concourse", venueType: "LOBBY", worldGlb: "packages/assets/generated/manufacturing/artifacts/JOB-VENUE-CINEPLEX-LOBBY-001/cineplex-concourse-lobby-v1-world.glb", detailTier: "LOW_DETAIL", halfExtentM: 40 },
  { blueprintId: "performer-lobby-v1", label: "Performer Lobby", venueType: "LOBBY", worldGlb: "packages/assets/generated/manufacturing/artifacts/JOB-SCENE-PERFORMER-LOBBY-001/performer-lobby-v1-decorated-decorated-world.glb", detailTier: "BLOCKOUT", halfExtentM: 25 },
  { blueprintId: "purpose-lounge-v1", label: "Purpose Lounge", venueType: "LOUNGE", worldGlb: "packages/assets/generated/manufacturing/artifacts/JOB-SCENE-PURPOSE-LOUNGE-001/purpose-lounge-v1-decorated-decorated-world.glb", detailTier: "BLOCKOUT", halfExtentM: 25 },
  { blueprintId: "outdoor-courtyard-v1", label: "Outdoor Concert Courtyard", venueType: "OUTDOOR", worldGlb: "packages/assets/generated/manufacturing/artifacts/JOB-SCENE-OUTDOOR-COURTYARD-001/outdoor-concert-courtyard-v1-decorated-decorated-world.glb", detailTier: "BLOCKOUT", halfExtentM: 45 },
  { blueprintId: "stone-fireplace-lounge-v1", label: "Stone Fireplace Lounge", venueType: "OUTDOOR", worldGlb: "packages/assets/generated/manufacturing/artifacts/JOB-VENUE-STONE-FIREPLACE-LOUNGE-001/outdoor-stone-fireplace-lounge-v1-world.glb", detailTier: "LOW_DETAIL", halfExtentM: 35 },
  { blueprintId: "skin-blue-auditorium-v1", label: "Blue Auditorium", venueType: "THEMED", worldGlb: "packages/assets/generated/manufacturing/artifacts/JOB-SCENE-SKIN-BLUE-AUDITORIUM-001/skin-blue-auditorium-v1-decorated-world.glb", detailTier: "BLOCKOUT", halfExtentM: 35 },
  { blueprintId: "skin-cosmic-realm-v1", label: "Cosmic Realm", venueType: "THEMED", worldGlb: "packages/assets/generated/manufacturing/artifacts/JOB-SCENE-SKIN-COSMIC-REALM-001/skin-cosmic-realm-v1-decorated-world.glb", detailTier: "BLOCKOUT", halfExtentM: 35 },
  { blueprintId: "skin-futuristic-lounge-v1", label: "Futuristic Lounge", venueType: "THEMED", worldGlb: "packages/assets/generated/manufacturing/artifacts/JOB-SCENE-SKIN-FUTURISTIC-LOUNGE-001/skin-futuristic-lounge-v1-decorated-world.glb", detailTier: "BLOCKOUT", halfExtentM: 30 },
  { blueprintId: "skin-gameshow-grid-v1", label: "Game Show Grid", venueType: "GAMESHOW", worldGlb: "packages/assets/generated/manufacturing/artifacts/JOB-SCENE-SKIN-GAMESHOW-GRID-001/skin-gameshow-grid-v1-decorated-world.glb", detailTier: "BLOCKOUT", halfExtentM: 30 },
  { blueprintId: "skin-outdoor-pool-v1", label: "Outdoor Pool Lounge", venueType: "THEMED", worldGlb: "packages/assets/generated/manufacturing/artifacts/JOB-SCENE-SKIN-OUTDOOR-POOL-001/skin-outdoor-pool-lounge-v1-decorated-world.glb", detailTier: "BLOCKOUT", halfExtentM: 40 },
];

/** Decor/kit pieces that passed the physical audit (placeable by socket or free transform). */
export const VENUE_KIT_ASSETS: readonly string[] = [
  "floor_checkerboard_modular_v1", "floor_luxury_gold_acrylic_v1", "floor_rgb_led_matrix_tile_v1",
  "floor_starlight_infinity_led_v1", "floor_wood_parquet_and_marley_v1",
  "kit_ceiling_disco_truss_and_mirrorball_v1", "kit_comedy_stage_riser_mic_stool_v1",
  "kit_dj_booth_turntables_mixer_v1", "kit_multi_sphere_jumbotron_truss_rig_v1",
  "wall_architectural_slat_acoustic_kit_v1", "wall_comedy_club_brick_curtain_kit_v1", "wall_led_videowall_panel_v1",
  "seat_auditorium_contoured_red_black_v1", "TMI_ARENA_JUMBOTRON_001", "jumbotron_spherical_mirror_ball_v1",
  "arcade-cabinet-001", "balcony-rail-001", "drum-table-001", "exit-sign-001", "lobby-bench-001", "lounge-sofa-001",
  "marquee-sign-001", "media-screen-panel-001", "poster-lightbox-001", "theater-seat-001-black-leather",
  "theater-seat-001-classic-burgundy", "theater-seat-001-cobalt-wood", "theater-seat-001-gold-trim-luxury",
  "tufted-booth-001", "wall-sconce-001",
];

export const VENUE_SURFACE_MATERIALS = {
  walls: ["acoustic", "marble", "led", "wood", "brick", "metal", "concrete", "velvet"],
  floor: ["wood", "concrete", "carpet", "marble", "led_tile", "dance_floor", "gold_acrylic", "checkerboard"],
  ceiling: ["open_truss", "acoustic_tile", "coffered", "black_void", "led_grid", "beams"],
} as const;

export const VENUE_LIGHTING_PRESETS = ["house", "concert", "battle", "cypher", "lounge", "spotlight", "blackout"] as const;

/**
 * Same shape as the canonical Admin World Edit editor's placed instance
 * (lib/foundry/imageToWorld/WorldEditDraftSceneEngine.ts WorldEditPlacedInstance):
 * placementId = instanceId, kitAssetId = masterAssetId, rotation in euler DEGREES,
 * per-axis scale. One placement model for Admin, creators and bot rooms.
 */
export type VenuePlacement = {
  placementId: string;
  kitAssetId: string;
  /** Optional named anchor/socket in the blueprint world (e.g. a wall/stage socket). */
  socketId?: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  visible?: boolean;
};

export type VenueDesign = {
  contract: typeof TMI_VENUE_RUNTIME_CONTRACT_VERSION;
  blueprintId: string;
  surfaces: {
    walls?: (typeof VENUE_SURFACE_MATERIALS.walls)[number];
    floor?: (typeof VENUE_SURFACE_MATERIALS.floor)[number];
    ceiling?: (typeof VENUE_SURFACE_MATERIALS.ceiling)[number];
  };
  lighting: { presetId: (typeof VENUE_LIGHTING_PRESETS)[number]; accentColor: string; intensity: number };
  placements: VenuePlacement[];
};

export const VENUE_DESIGN_LIMITS = { maxPlacements: 200, maxBytes: 64_000, minScale: 0.1, maxScale: 10 } as const;

export type VenueDesignIssue = { path: string; code: string };

/** Pure validation. Rejects anything not in the real blueprint / kit / material registries. */
export function validateVenueDesign(input: unknown): { ok: true; design: VenueDesign } | { ok: false; issues: VenueDesignIssue[] } {
  const issues: VenueDesignIssue[] = [];
  const bad = (path: string, code: string) => issues.push({ path, code });
  if (!input || typeof input !== "object") return { ok: false, issues: [{ path: "$", code: "NOT_OBJECT" }] };
  const d = input as Partial<VenueDesign>;
  if (JSON.stringify(d).length > VENUE_DESIGN_LIMITS.maxBytes) bad("$", "TOO_LARGE");
  const bp = VENUE_BLUEPRINTS.find((b) => b.blueprintId === d.blueprintId);
  if (!bp) bad("blueprintId", "UNKNOWN_BLUEPRINT");

  const s = (d.surfaces ?? {}) as Record<string, unknown>;
  for (const key of ["walls", "floor", "ceiling"] as const) {
    if (s[key] !== undefined && !(VENUE_SURFACE_MATERIALS[key] as readonly string[]).includes(String(s[key]))) {
      bad(`surfaces.${key}`, "UNKNOWN_MATERIAL");
    }
  }
  const l = d.lighting as VenueDesign["lighting"] | undefined;
  if (!l) bad("lighting", "REQUIRED");
  else {
    if (!(VENUE_LIGHTING_PRESETS as readonly string[]).includes(l.presetId)) bad("lighting.presetId", "UNKNOWN_PRESET");
    if (!/^#[0-9a-fA-F]{6}$/.test(String(l.accentColor))) bad("lighting.accentColor", "BAD_COLOR");
    if (!(typeof l.intensity === "number" && l.intensity >= 0 && l.intensity <= 1)) bad("lighting.intensity", "OUT_OF_RANGE");
  }
  const placements = Array.isArray(d.placements) ? d.placements : [];
  if (!Array.isArray(d.placements)) bad("placements", "REQUIRED");
  if (placements.length > VENUE_DESIGN_LIMITS.maxPlacements) bad("placements", "TOO_MANY");
  const ids = new Set<string>();
  placements.forEach((p, i) => {
    const at = `placements[${i}]`;
    if (!p || typeof p.placementId !== "string" || !p.placementId) bad(at, "NO_ID");
    else if (ids.has(p.placementId)) bad(at, "DUPLICATE_ID");
    else ids.add(p.placementId);
    // Legacy kit pieces OR a Foundry catalog variant (entitlement is checked separately at save).
    if (!VENUE_KIT_ASSETS.includes(p?.kitAssetId) && !isCatalogVariantId(String(p?.kitAssetId))) bad(`${at}.kitAssetId`, "UNKNOWN_KIT_ASSET");
    const pos = p?.position;
    if (!Array.isArray(pos) || pos.length !== 3 || !pos.every((v) => typeof v === "number" && Number.isFinite(v))) {
      bad(`${at}.position`, "BAD_POSITION");
    } else if (bp && pos.some((v) => Math.abs(v) > bp.halfExtentM)) {
      bad(`${at}.position`, "OUT_OF_BOUNDS");
    }
    const rot = p?.rotation;
    if (!Array.isArray(rot) || rot.length !== 3 || !rot.every((v) => typeof v === "number" && Number.isFinite(v))) {
      bad(`${at}.rotation`, "BAD_ROTATION");
    }
    const sc = p?.scale;
    if (
      !Array.isArray(sc) ||
      sc.length !== 3 ||
      !sc.every((v) => typeof v === "number" && v >= VENUE_DESIGN_LIMITS.minScale && v <= VENUE_DESIGN_LIMITS.maxScale)
    ) {
      bad(`${at}.scale`, "BAD_SCALE");
    }
  });
  if (issues.length) return { ok: false, issues };
  return { ok: true, design: { ...(d as VenueDesign), contract: TMI_VENUE_RUNTIME_CONTRACT_VERSION } };
}

/** Who may author venue designs: ADMIN/STAFF, VENUE accounts, or SILVER+ (first room-creation tier). */
const CREATOR_TIERS = new Set(["SILVER", "GOLD", "PLATINUM", "DIAMOND"]);
export function mayDesignVenues(role: string, tier: string): boolean {
  const r = role.toUpperCase();
  return r === "ADMIN" || r === "STAFF" || r === "VENUE" || CREATOR_TIERS.has(tier.toUpperCase());
}

/** Minimal structural view of a World Edit draft (avoids importing the client engine). */
export type WorldEditDraftLike = {
  roomId: string;
  instances: Array<{
    instanceId: string;
    masterAssetId: string;
    position: { x: number; y: number; z: number } | [number, number, number];
    rotation: { x: number; y: number; z: number } | [number, number, number];
    scale: { x: number; y: number; z: number } | [number, number, number];
    visible?: boolean;
  }>;
};

const v3 = (v: { x: number; y: number; z: number } | [number, number, number]): [number, number, number] =>
  Array.isArray(v) ? [v[0], v[1], v[2]] : [v.x, v.y, v.z];

/** Convert the Admin World Edit draft into a saveable VenueDesign (then validate it). */
export function venueDesignFromWorldEditDraft(
  draft: WorldEditDraftLike,
  blueprintId: string,
  base: Pick<VenueDesign, "surfaces" | "lighting">,
): VenueDesign {
  return {
    contract: TMI_VENUE_RUNTIME_CONTRACT_VERSION,
    blueprintId,
    surfaces: base.surfaces,
    lighting: base.lighting,
    placements: draft.instances.map((i) => ({
      placementId: i.instanceId,
      kitAssetId: i.masterAssetId,
      position: v3(i.position),
      rotation: v3(i.rotation),
      scale: v3(i.scale),
      visible: i.visible ?? true,
    })),
  };
}

// ── Canonical anchor resolution (non-destructive) ────────────────────────────
/**
 * Three node-naming schemas exist in the Foundry output (2026-11-18 scan):
 *  - MNS:                  Seat_Anchor_###, Camera_*, Spawn_*, Audience_Entry, Stage_Center…
 *  - Reference Auditorium: SeatAnchor_<C|L|R|B#>_R#S#, cam_*, Spawn_*, ExitSign_*
 *  - Decorated scenes:     SeatAnchor / SeatAnchor.001 (Blender dup suffix), Place_*, MediaAnchor
 * This maps every recognised node to ONE canonical id WITHOUT renaming anything:
 * GLB node names, seat registries and existing references stay valid.
 */
export type CanonicalAnchorKind = "seat" | "spawn" | "camera" | "screen" | "stage" | "door" | "media" | "host" | "socket";

export type CanonicalAnchorMap = {
  /** canonicalId → original GLB node name */
  byCanonical: Record<string, string>;
  /** original node name → canonicalId */
  byNode: Record<string, string>;
  counts: Partial<Record<CanonicalAnchorKind, number>>;
  /** Two nodes resolving to the same canonical id (must be fixed in the Foundry). */
  collisions: Array<{ canonicalId: string; nodes: string[] }>;
};

const snake = (s: string) => s.replace(/([a-z])([A-Z])/g, "$1_$2").replace(/[^A-Za-z0-9]+/g, "_").toLowerCase().replace(/^_|_$/g, "");

function canonicalFor(name: string, seq: { seat: number; media: number }): string | null {
  let m: RegExpMatchArray | null;
  if ((m = name.match(/^Seat_Anchor_(\d+)$/i))) return `seat:main:${Number(m[1])}`;
  if ((m = name.match(/^SeatAnchor_([A-Z]\d*)_R(\d+)S(\d+)$/))) return `seat:${m[1]}:r${Number(m[2])}:s${Number(m[3])}`;
  if (/^SeatAnchor(\.\d+)?$/.test(name)) return `seat:main:${++seq.seat}`;
  if ((m = name.match(/^Spawn_(\w+)$/))) return `spawn:${snake(m[1])}`;
  if ((m = name.match(/^Camera_(\w+)$/))) return `camera:${snake(m[1])}`;
  if ((m = name.match(/^cam_(\w+)$/))) return `camera:${snake(m[1])}`;
  if ((m = name.match(/^Screen_(Main|Left|Right|North|South|East|West)$/))) return `screen:${m[1].toLowerCase()}`;
  if (name === "Stage") return "stage:main";
  if ((m = name.match(/^Stage_(Center|Left|Right)$/))) return `stage:${m[1].toLowerCase()}`;
  if ((m = name.match(/^(Audience|Backstage)_(Entry|Exit)$/))) return `door:${m[1].toLowerCase()}_${m[2].toLowerCase()}`;
  if (name === "Host_Anchor") return "host:main";
  if (/^MediaAnchor(\.\d+)?$/.test(name)) return `media:${++seq.media}`;
  if ((m = name.match(/^Place_([\w-]+)$/))) return `socket:${snake(m[1])}`;
  return null;
}

export function resolveCanonicalAnchors(nodeNames: string[]): CanonicalAnchorMap {
  const seq = { seat: 0, media: 0 };
  const byCanonical: Record<string, string> = {};
  const byNode: Record<string, string> = {};
  const all = new Map<string, string[]>();
  // Stable order so Blender-suffixed duplicates number deterministically.
  for (const name of [...nodeNames].sort()) {
    const id = canonicalFor(name, seq);
    if (!id) continue;
    all.set(id, [...(all.get(id) ?? []), name]);
    byNode[name] = id;
    byCanonical[id] ??= name;
  }
  const counts: CanonicalAnchorMap["counts"] = {};
  for (const id of all.keys()) {
    const kind = id.split(":")[0] as CanonicalAnchorKind;
    counts[kind] = (counts[kind] ?? 0) + 1;
  }
  const collisions = [...all.entries()].filter(([, v]) => v.length > 1).map(([canonicalId, nodes]) => ({ canonicalId, nodes }));
  return { byCanonical, byNode, counts, collisions };
}

/**
 * Explicit, reviewed anchor overrides (owner 2026-11-18: correct misplaced spawns
 * WITHOUT renaming handles). The GLB keeps its original node; the canonical id is
 * re-pointed to another EXISTING node. If the replacement node is absent in a
 * given world (e.g. older build), the override is reported as unapplied, never faked.
 */
export const ANCHOR_OVERRIDES: Record<string, Array<{ canonicalId: string; useNode: string; reason: string }>> = {
  "reference-auditorium-v2": [
    {
      canonicalId: "spawn:fan",
      useNode: "Audience_Entry",
      reason: "Spawn_Fan (glTF 0,0.1,7) sits inside the main seat block; Audience_Entry is on the rear landing (nav-certified door).",
    },
  ],
};

export function applyAnchorOverrides(
  map: CanonicalAnchorMap,
  blueprintId: string,
): CanonicalAnchorMap & { overrides: Array<{ canonicalId: string; from: string | null; to: string; applied: boolean }> } {
  const byCanonical = { ...map.byCanonical };
  const overrides = (ANCHOR_OVERRIDES[blueprintId] ?? []).map((o) => {
    const applied = o.useNode in map.byNode;
    const from = byCanonical[o.canonicalId] ?? null;
    if (applied) byCanonical[o.canonicalId] = o.useNode;
    return { canonicalId: o.canonicalId, from, to: o.useNode, applied };
  });
  return { ...map, byCanonical, overrides };
}

/**
 * URL the web app serves a blueprint's world from (apps/web/public/models/venues).
 * Foundry decorated scenes are written as `*-decorated-decorated-world.glb` but
 * published as `*-decorated-world.glb`; this normalises that difference.
 */
export function blueprintRuntimeUrl(bp: Pick<VenueBlueprint, "worldGlb">): string {
  const file = bp.worldGlb.split("/").pop() ?? "";
  return `/models/venues/${file.replace(/-decorated-decorated-world\.glb$/, "-decorated-world.glb")}`;
}

// ── Admin editor: editable-node manifest contract ───────────────────────────
/**
 * Produced by scripts/blender/composeVenueArchitecture.py as
 * `<name>.editable-nodes.json`. `nodeId` is the stable glTF node name — the
 * Admin editor maps a viewport click (`e.object.name`) to it and persists edits
 * as VenueDesign placements keyed by `socketId = nodeId`.
 */
export type EditableNodeKind =
  | "seat" | "riser" | "landing" | "floor" | "wall" | "ceiling" | "door" | "trim" | "decor" | "light";

export type EditableVenueNode = {
  nodeId: string;
  kind: EditableNodeKind;
  position: [number, number, number];
  rotationEulerDeg: [number, number, number];
  scale: [number, number, number];
  material: string | null;
  collider: boolean;
};

export type NodeEditPolicy = "LOCKED_STRUCTURAL" | "MATERIAL_ONLY" | "FREE_TRANSFORM";

/**
 * Moving structural geometry would silently invalidate the seating/navigation
 * certification, so those nodes accept material swaps only. Re-certify after
 * any structural change (composer → certifyVenueSeating → certifyVenueNavigation).
 */
export const NODE_EDIT_POLICY: Record<EditableNodeKind, NodeEditPolicy> = {
  seat: "LOCKED_STRUCTURAL",
  riser: "LOCKED_STRUCTURAL",
  landing: "LOCKED_STRUCTURAL",
  floor: "LOCKED_STRUCTURAL",
  door: "LOCKED_STRUCTURAL",
  wall: "MATERIAL_ONLY",
  ceiling: "MATERIAL_ONLY",
  trim: "FREE_TRANSFORM",
  decor: "FREE_TRANSFORM",
  light: "FREE_TRANSFORM",
};

export type NodeEdit = { nodeId: string; transform?: Pick<VenuePlacement, "position" | "rotation" | "scale">; material?: string };

export function validateNodeEdit(
  node: EditableVenueNode,
  edit: NodeEdit,
  halfExtentM: number,
): { ok: true } | { ok: false; code: "NODE_MISMATCH" | "STRUCTURAL_LOCKED" | "TRANSFORM_NOT_ALLOWED" | "OUT_OF_BOUNDS" } {
  if (edit.nodeId !== node.nodeId) return { ok: false, code: "NODE_MISMATCH" };
  const policy = NODE_EDIT_POLICY[node.kind];
  if (edit.transform) {
    if (policy === "LOCKED_STRUCTURAL") return { ok: false, code: "STRUCTURAL_LOCKED" };
    if (policy === "MATERIAL_ONLY") return { ok: false, code: "TRANSFORM_NOT_ALLOWED" };
    if (edit.transform.position.some((v) => !Number.isFinite(v) || Math.abs(v) > halfExtentM)) return { ok: false, code: "OUT_OF_BOUNDS" };
  }
  return { ok: true };
}
