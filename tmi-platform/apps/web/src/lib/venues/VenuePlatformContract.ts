/**
 * Canonical TMI Venue Platform contract.
 * Composes existing registries — does not invent square footage or GLB bounds.
 *
 * Capacity fields are NEVER mixed. Geometry stays MISSING until measured.
 */

import type { VenueType } from "@/lib/venues/VenueAssetRegistry";
import type { UserTier } from "@/lib/auth/UserStore";

export const VENUE_PLATFORM_LAWS = {
  voltron:
    "No venue local capacity defines maximum event size. Templates instantiate as auditorium shards of one event.",
  compaction:
    "Expand when demand rises. Drain then collapse empty overflow shards. Never migrate unless necessary. Never compact permanent anchors.",
  skins:
    "Runtime is not a skin. Skins never silently change seat IDs, collision, capacity, portals, tickets, or show state.",
  commerce:
    "Stripe confirms money; TMI confirms ownership. Client never sets price or grants entitlement.",
  geometry:
    "Do not convert displayCapacity or maximumHumans into feet or square footage.",
  sync:
    "Design for high availability, bounded drift, and graceful recovery — not literal zero lag.",
  existingSceneFactory:
    "The existing TMI 3D/360 scene-generation stack is the canonical factory. No parallel generator.",
  rightSizedCapacity:
    "Fill healthy compatible shards first. Drain and collapse only when the audience migration law permits.",
  threeAuthorities:
    "SCENE GENERATOR creates/presents the world. ROOM ORCHESTRATOR decides shard count and assignment. GLOBAL SHOW AUTHORITY keeps every shard on the same show. The orchestrator never constructs geometry.",
  commitBeforeMove:
    "Orchestrator may recommend compaction. A migration transaction is NOT committed until destination seat/zone is reserved successfully AND durable placement state is updated. Old placement remains authoritative until commit succeeds. Failed migration → original shard/seat stays.",
  sceneFactoryNeverGeometry:
    "Room Orchestrator requests a scene instance from the existing factory adapter. It never constructs PlaneGeometry, GLBs, or navmesh.",
  collapseOnlyWhenEmpty:
    "Never collapse an overflow shard until occupancy === 0.",
} as const;

export const VENUE_AUTHORITIES = {
  sceneGenerator:
    "Existing TMI stack: VenueAssetRegistry → resolveRoomVenueRuntime → UniversalVenueRenderer → AudienceScene (canvas crowd) + ambient video. SpatialVenueRuntime / VenueRuntimeShell are adapters over that stack, not a second generator.",
  roomOrchestrator:
    "ElasticRoomOrchestrator decides how many auditorium shards exist and where people belong. It requests a scene instance; it never builds PlaneGeometry, GLBs, or navmesh.",
  globalShowAuthority:
    "One show clock per event. Portals and overflow shards must not restart media.",
} as const;

export type SceneInstanceLifecycle =
  | "WARMING"
  | "ACTIVE"
  | "DRAINING"
  | "COLLAPSED"
  | "CACHED"
  | "RELEASED";

/** Locked Class IDs only. Positions stay null until a measured source exists. */
export type SemanticAnchorClassId =
  | "STAGE_CENTER"
  | "STAGE_LEFT"
  | "STAGE_RIGHT"
  | "CAMERA_MAIN_WIDE"
  | "CAMERA_STAGE_LEFT"
  | "CAMERA_AUDIENCE"
  | "CAMERA_BALCONY"
  | "SECTION_A"
  | "SECTION_B"
  | "SECTION_C"
  | "VIP_LOUNGE_PORTAL"
  | "MAIN_ENTRANCE"
  | "BACKSTAGE_PORTAL"
  | "SCREEN_MAIN"
  | "SCREEN_LEFT"
  | "SCREEN_RIGHT";

export type SemanticAnchorContract = {
  classId: SemanticAnchorClassId;
  position: null;
  rotation: null;
  geometryStatus: "MISSING";
};

export const SEMANTIC_ANCHOR_CLASS_IDS: readonly SemanticAnchorClassId[] = [
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

export type SceneBudgetValue = number | null | "UNKNOWN";

export type SceneRuntimeBudget = {
  gpu: SceneBudgetValue;
  memory: SceneBudgetValue;
  network: SceneBudgetValue;
  avatar: SceneBudgetValue;
  rtc: SceneBudgetValue;
  recommendedHumanOccupancy: SceneBudgetValue;
};

export type GeometryProvenance =
  | "MISSING"
  | "AUTHORED_METADATA"
  | "DERIVED_FROM_MODEL_BOUNDS"
  | "MEASURED_FROM_SOURCE"
  | "LEGACY_UNVERIFIED";

export type ShardLifecycle = "WARMING" | "ACTIVE" | "DRAINING" | "COLLAPSED";

export const SCENE_CACHE_LIFECYCLE = [
  "WARMING",
  "ACTIVE",
  "DRAINING",
  "COLLAPSED",
  "CACHED",
  "RELEASED",
] as const;

export type OccupancyZoneType =
  | "SEAT_ANCHOR"
  | "STANDING_ZONE"
  | "DANCE_FLOOR_ZONE"
  | "LAWN_ZONE"
  | "PIT_ZONE"
  | "VIP_CABANA"
  | "TABLE_ZONE"
  | "QUEUE_ZONE"
  | "BOOTH"
  | "BAR_STOOL";

export type VenueMeshAddress = {
  eventId: string;
  meshId: string;
  environmentId: string;
  clusterId?: string;
  auditoriumId?: string;
  sectionId?: string;
  rowId?: string;
  seatId?: string;
  occupancyZoneId?: string;
};

export type SeparatedCapacities = {
  displayCapacity: number | null;
  maximumHumans: number | null;
  adminListedCapacity: number | null;
  bookingVenueCapacity: number | null;
  templateCapacity: number | null;
};

export type VenueGeometryRecord = {
  status: GeometryProvenance;
  glbAssetUrl: string | null;
  width: null;
  depth: null;
  height: null;
  navMeshId: null;
  collisionAssetId: null;
  note: string;
};

export type VenueEnvironmentSlot = {
  id: string;
  kind:
    | "exterior"
    | "interior"
    | "concourse"
    | "lobby"
    | "auditorium"
    | "lounge"
    | "backstage"
    | "rehearsal"
    | "outdoor";
  status: GeometryProvenance;
};

export type AudienceMigrationPolicy = {
  migrateOnlyWhenNecessary: true;
  preserveTicketTier: true;
  preserveAccessibility: true;
  preserveGroups: true;
  preserveEquivalentOrBetterSeat: true;
  preventVipDowngrade: true;
  preserveEnvironmentEntitlements: true;
  preserveShowState: true;
  requireDestinationCapacity: true;
  failedMigrationKeepsOriginalSeat: true;
};

export const AUDIENCE_MIGRATION_POLICY: AudienceMigrationPolicy = {
  migrateOnlyWhenNecessary: true,
  preserveTicketTier: true,
  preserveAccessibility: true,
  preserveGroups: true,
  preserveEquivalentOrBetterSeat: true,
  preventVipDowngrade: true,
  preserveEnvironmentEntitlements: true,
  preserveShowState: true,
  requireDestinationCapacity: true,
  failedMigrationKeepsOriginalSeat: true,
};

/**
 * Ratios are config — not mixed with displayCapacity artwork numbers.
 * Hysteresis + dwell + cooldown prevent expand/contract flapping.
 * Hard-capacity expand is allowed during cooldown so humans are never stranded.
 */
export const ELASTIC_SHARD_THRESHOLDS = {
  collapseBelowRatio: 0.25,
  collapseDwellMs: 60_000,
  expandAboveRatio: 0.75,
  expandDwellMs: 30_000,
  expandCooldownMs: 90_000,
  hardCapacityRatio: 1,
  neverCompactPermanentAnchors: true,
} as const;

export const PERSISTENCE_SPLIT = {
  persist: ["ticket", "identity", "entitlement", "show"] as const,
  ephemeral: ["localAvatar", "rtc", "collision", "environment"] as const,
  note: "Tickets/identity/entitlements/show clock persist. Local avatars, RTC, collision, and environment instances are shard-ephemeral.",
} as const;

/** Every attendee occupies one fully-qualified mesh identity. Positions may be null. */
export type AttendeeMeshIdentity = {
  eventId: string;
  meshId: string;
  environmentId: string;
  clusterId: string;
  auditoriumId: string;
  sectionOrZone: string;
  seatId: string;
};

export const MIGRATION_COMMIT_RULE = VENUE_PLATFORM_LAWS.commitBeforeMove;

export type MigrationCommitState = "RECOMMENDED" | "RESERVED" | "COMMITTED" | "FAILED_ORIGINAL_KEPT";

/**
 * Battle Arena elasticity cert — CONTRACT ONLY.
 * certified:false means Anti-Gravity has not run it. Do not treat presence as PASS.
 */
export const BATTLE_ARENA_ELASTICITY_CERT_SEQUENCE = [
  {
    step: 1,
    id: "JOIN_EXISTING_CAPACITY",
    targetSlug: "battle-thunder-dome",
    description:
      "Join Battle Arena via resolveJoinTarget → assign seat on assigned slug → joinAudience. Return assignedSlug, meshKey, meshSeatId, isOverflow, parentAnchorSlug. Fill existing compatible capacity first.",
    certified: false,
  },
  {
    step: 2,
    id: "NO_UNNECESSARY_SHARD",
    targetSlug: "battle-thunder-dome",
    description:
      "While healthy compatible shards have spare maximumHumans, no new overflow is created. Placement law: fill existing capacity first.",
    certified: false,
  },
  {
    step: 3,
    id: "EXPAND_WITH_HYSTERESIS",
    targetSlug: "battle-thunder-dome",
    description:
      "After expandAboveRatio + expandDwellMs, and not inside expandCooldownMs (unless all shards at hardCapacityRatio), create overflow. Factory adapter requested; orchestrator never constructs geometry. Shard starts WARMING then ACTIVE.",
    certified: false,
  },
  {
    step: 4,
    id: "IDENTITY_ON_OVERFLOW",
    targetSlug: "battle-thunder-dome",
    description:
      "Overflow joiners receive eventId + meshId + environmentId + clusterId + auditoriumId + section/zone + seat. meshSeatId is globally unique, never a bare Seat N.",
    certified: false,
  },
  {
    step: 5,
    id: "LEAVE_AND_REBALANCE",
    targetSlug: "battle-thunder-dome",
    description:
      "Leave uses findOccupancySlugForUser → leaveAudience → rebalanceParticipants. Occupancy source is real humans; bots never count.",
    certified: false,
  },
  {
    step: 6,
    id: "DRAIN_AFTER_DWELL",
    targetSlug: "battle-thunder-dome",
    description:
      "Underfilled overflow becomes DRAINING only after collapseDwellMs. DRAINING takes no new arrivals. Occupants stay; no teleport.",
    certified: false,
  },
  {
    step: 7,
    id: "COMMIT_BEFORE_MOVE",
    targetSlug: "battle-thunder-dome",
    description:
      "Orchestrator may recommend compaction. Destination seat/zone must be reserved AND durable placement updated before commit. Failure keeps the original shard/seat authoritative.",
    certified: false,
  },
  {
    step: 8,
    id: "COLLAPSE_ONLY_AT_ZERO",
    targetSlug: "battle-thunder-dome",
    description:
      "Collapse only when occupancy === 0. Scene factory cache/release types only — do not claim GPU teardown. Permanent anchors never collapse.",
    certified: false,
  },
  {
    step: 9,
    id: "SHOW_AND_PERSISTENCE_SPLIT",
    targetSlug: "battle-thunder-dome",
    description:
      "GlobalShowAuthority keeps every shard on one show clock; portals must not restart media. Persist ticket/identity/entitlement/show. Local avatar/RTC/collision/environment are ephemeral.",
    certified: false,
  },
] as const;

export const BATTLE_ARENA_ELASTICITY_CERT_STATUS = {
  sequenceId: "BATTLE_ARENA_ELASTICITY_CERT_SEQUENCE",
  stepCount: 9,
  certified: false,
  note: "CONTROLLER_UNLOCKED — Scene Factory Controller may request instances via controlRequestVenueScene. Full elasticity runtime cert (placement/expansion/compaction/migration/teardown/media) remains not claimed.",
} as const;

export type VenueTemplateDefinition = {
  venueType: VenueType | "name-that-tune" | "circle-squares" | "dirty-dozens" | "gauntlet" | "rehearsal" | "backstage";
  templateId: string;
  label: string;
  canonicalLiveRoute: string | null;
  canonicalTypeRoute: string | null;
  liveSlug: string | null;
  capacities: SeparatedCapacities;
  capacityConflicts: string[];
  geometry: VenueGeometryRecord;
  environments: VenueEnvironmentSlot[];
  voltronCompatible: true;
  instantiable: boolean;
  permanentAnchor: boolean;
  baseTierSkinIds: Record<UserTier, string>;
  purchasedSkinCatalog: "venueSkinEngine";
  blockers: string[];
};

export type MeshSeatAnchor = {
  id: string;
  eventId: string;
  meshId: string;
  environmentId: string;
  clusterId: string;
  auditoriumId: string;
  section: string;
  row: string;
  seatNumber: string;
  position: [number, number, number] | null;
  rotation: [number, number, number] | null;
  poseType: OccupancyZoneType;
  geometryStatus: GeometryProvenance;
};
