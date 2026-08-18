/**
 * VenueTemplateRegistry — one template per venue family.
 * Reads displayCapacity from VenueAssetRegistry and maximumHumans from
 * AnchorRoomRegistry. Admin-list numbers stay labeled conflicts.
 * Geometry is always MISSING until a real GLB or measured bounds exist.
 */

import {
  getAllVenueTypes,
  getVenueAsset,
  type VenueType,
} from "@/lib/venues/VenueAssetRegistry";
import { getAllAnchors, type AnchorCategory } from "@/lib/live/AnchorRoomRegistry";
import {
  type VenueEnvironmentSlot,
  type VenueTemplateDefinition,
} from "@/lib/venues/VenuePlatformContract";
import { tierBaseSkinMap } from "@/lib/venues/TierBaseVenueSkin";

const ADMIN_LISTED_CAPACITY: Partial<Record<string, number>> = {
  "monday-night-stage": 4000,
  "world-concert": 18500,
  "world-dance-party": 2400,
  cypher: 600,
  battle: 800,
  "dirty-dozens": 200,
};

const MISSING_GEO = {
  status: "MISSING" as const,
  glbAssetUrl: null,
  width: null,
  depth: null,
  height: null,
  navMeshId: null,
  collisionAssetId: null,
  note: "No production GLB/GLTF or measured W×D×H. Capacity figures are not dimensions.",
};

function emptyCampusSlots(prefix: string): VenueEnvironmentSlot[] {
  const kinds: VenueEnvironmentSlot["kind"][] = [
    "exterior",
    "interior",
    "concourse",
    "lobby",
    "auditorium",
    "lounge",
    "backstage",
    "rehearsal",
    "outdoor",
  ];
  return kinds.map((kind) => ({
    id: `${prefix}-${kind}`,
    kind,
    status: "MISSING",
  }));
}

function categoryForVenueType(type: VenueType): AnchorCategory | null {
  switch (type) {
    case "battle":
      return "BATTLE";
    case "cypher":
      return "CYPHER";
    case "challenge":
      return "SONG_CHALLENGE";
    case "fan-lobby":
      return "FAN_LOBBY";
    case "lounge":
      return "LOUNGE";
    case "world-dance-party":
      return "WORLD_DANCE";
    case "deal-or-feud":
      return "GAME_SHOW";
    default:
      return null;
  }
}

const TYPE_ROUTES: Partial<Record<VenueType, string>> = {
  battle: "/rooms/battle-arena",
  cypher: "/rooms/cypher",
  challenge: "/rooms/challenge-arena",
  "fan-lobby": "/rooms/fan-lobby",
  lounge: "/rooms/vip-lounge",
  "monday-night-stage": "/rooms/monday-stage",
  "world-dance-party": "/rooms/world-dance-party",
  "deal-or-feud": "/rooms/deal-or-feud",
  concert: "/rooms/live-concert",
  "world-concert": "/rooms/world-concert",
  "mini-concert": "/rooms/live-concert",
};

function buildFromVenueType(type: VenueType): VenueTemplateDefinition {
  const asset = getVenueAsset(type);
  const cat = categoryForVenueType(type);
  const anchors = cat ? getAllAnchors().filter((a) => a.category === cat) : [];
  const primary = anchors[0];
  const maxHumansFromAnchors = anchors.length
    ? anchors.map((a) => a.maximumHumans)
    : [];
  const uniqueMax = Array.from(new Set(maxHumansFromAnchors));
  const admin = ADMIN_LISTED_CAPACITY[type] ?? null;
  const conflicts: string[] = [];
  if (admin != null && admin !== asset.geometry.displayCapacity) {
    conflicts.push(
      `adminListedCapacity ${admin} ≠ displayCapacity ${asset.geometry.displayCapacity}`,
    );
  }
  if (uniqueMax.length > 1) {
    conflicts.push(`anchor maximumHumans differ: ${uniqueMax.join(", ")}`);
  }
  if (type === "monday-night-stage") {
    conflicts.push("conversation/admin 4,000 vs registry displayCapacity 5,000 — preserved separately");
  }

  return {
    venueType: type,
    templateId: `tpl-${type}`,
    label: asset.label,
    canonicalLiveRoute: primary?.route ?? (type === "monday-night-stage" ? "/live/rooms/monday-night-stage" : null),
    canonicalTypeRoute: TYPE_ROUTES[type] ?? null,
    liveSlug: primary?.slug ?? (type === "monday-night-stage" ? "monday-night-stage" : null),
    capacities: {
      displayCapacity: asset.geometry.displayCapacity,
      maximumHumans: uniqueMax.length === 1 ? uniqueMax[0] : uniqueMax[0] ?? null,
      adminListedCapacity: admin,
      bookingVenueCapacity: null,
      templateCapacity: asset.geometry.displayCapacity,
    },
    capacityConflicts: conflicts,
    geometry: MISSING_GEO,
    environments: emptyCampusSlots(type),
    voltronCompatible: true,
    instantiable: Boolean(primary) || type === "monday-night-stage" || type.endsWith("concert"),
    permanentAnchor: Boolean(primary),
    baseTierSkinIds: tierBaseSkinMap(),
    purchasedSkinCatalog: "venueSkinEngine",
    blockers: [
      "geometry MISSING",
      "no GLB bounds",
      "seat identity not yet mesh-scoped on live stage",
      ...(primary ? [] : ["no live occupancy anchor"]),
    ],
  };
}

const EXTRA_TEMPLATES: VenueTemplateDefinition[] = [
  {
    venueType: "name-that-tune",
    templateId: "tpl-name-that-tune",
    label: "Name That Tune",
    canonicalLiveRoute: "/live/rooms/name-that-tune",
    canonicalTypeRoute: "/rooms/name-that-tune",
    liveSlug: "name-that-tune",
    capacities: {
      displayCapacity: null,
      maximumHumans: null,
      adminListedCapacity: null,
      bookingVenueCapacity: null,
      templateCapacity: null,
    },
    capacityConflicts: [],
    geometry: MISSING_GEO,
    environments: emptyCampusSlots("name-that-tune"),
    voltronCompatible: true,
    instantiable: false,
    permanentAnchor: false,
    baseTierSkinIds: tierBaseSkinMap(),
    purchasedSkinCatalog: "venueSkinEngine",
    blockers: ["displayCapacity MISSING", "maximumHumans MISSING", "geometry MISSING"],
  },
  {
    venueType: "circle-squares",
    templateId: "tpl-circle-squares",
    label: "Circle or Squares",
    canonicalLiveRoute: null,
    canonicalTypeRoute: "/shows/circle-and-squares",
    liveSlug: "circle-squares",
    capacities: {
      displayCapacity: null,
      maximumHumans: null,
      adminListedCapacity: null,
      bookingVenueCapacity: null,
      templateCapacity: null,
    },
    capacityConflicts: [],
    geometry: MISSING_GEO,
    environments: emptyCampusSlots("circle-squares"),
    voltronCompatible: true,
    instantiable: false,
    permanentAnchor: false,
    baseTierSkinIds: tierBaseSkinMap(),
    purchasedSkinCatalog: "venueSkinEngine",
    blockers: ["displayCapacity MISSING", "maximumHumans MISSING", "geometry MISSING"],
  },
  {
    venueType: "dirty-dozens",
    templateId: "tpl-dirty-dozens",
    label: "Dirty Dozens",
    canonicalLiveRoute: null,
    canonicalTypeRoute: "/rooms/dirty-dozens",
    liveSlug: "dirty-dozens",
    capacities: {
      displayCapacity: null,
      maximumHumans: null,
      adminListedCapacity: 200,
      bookingVenueCapacity: null,
      templateCapacity: null,
    },
    capacityConflicts: ["adminListedCapacity 200 is not VenueAssetRegistry displayCapacity"],
    geometry: MISSING_GEO,
    environments: emptyCampusSlots("dirty-dozens"),
    voltronCompatible: true,
    instantiable: false,
    permanentAnchor: false,
    baseTierSkinIds: tierBaseSkinMap(),
    purchasedSkinCatalog: "venueSkinEngine",
    blockers: ["not in VenueAssetRegistry", "geometry MISSING"],
  },
  {
    venueType: "gauntlet",
    templateId: "tpl-gauntlet",
    label: "Gauntlet Arena",
    canonicalLiveRoute: null,
    canonicalTypeRoute: "/rooms/battle/gauntlet/[roomId]",
    liveSlug: null,
    capacities: {
      displayCapacity: null,
      maximumHumans: null,
      adminListedCapacity: null,
      bookingVenueCapacity: null,
      templateCapacity: null,
    },
    capacityConflicts: [],
    geometry: MISSING_GEO,
    environments: emptyCampusSlots("gauntlet"),
    voltronCompatible: true,
    instantiable: false,
    permanentAnchor: false,
    baseTierSkinIds: tierBaseSkinMap(),
    purchasedSkinCatalog: "venueSkinEngine",
    blockers: ["skins only in GauntletVenueManifest", "geometry MISSING"],
  },
  {
    venueType: "rehearsal",
    templateId: "tpl-rehearsal",
    label: "Rehearsal Room",
    canonicalLiveRoute: null,
    canonicalTypeRoute: "/rooms/rehearsal",
    liveSlug: null,
    capacities: {
      displayCapacity: null,
      maximumHumans: null,
      adminListedCapacity: null,
      bookingVenueCapacity: null,
      templateCapacity: null,
    },
    capacityConflicts: [],
    geometry: MISSING_GEO,
    environments: emptyCampusSlots("rehearsal"),
    voltronCompatible: true,
    instantiable: false,
    permanentAnchor: false,
    baseTierSkinIds: tierBaseSkinMap(),
    purchasedSkinCatalog: "venueSkinEngine",
    blockers: ["geometry MISSING"],
  },
  {
    venueType: "backstage",
    templateId: "tpl-backstage",
    label: "Backstage",
    canonicalLiveRoute: "/live/backstage",
    canonicalTypeRoute: "/rooms/backstage",
    liveSlug: null,
    capacities: {
      displayCapacity: null,
      maximumHumans: null,
      adminListedCapacity: 20,
      bookingVenueCapacity: null,
      templateCapacity: null,
    },
    capacityConflicts: ["ticket BACKSTAGE slot 20 is not venue geometry"],
    geometry: MISSING_GEO,
    environments: emptyCampusSlots("backstage"),
    voltronCompatible: true,
    instantiable: false,
    permanentAnchor: false,
    baseTierSkinIds: tierBaseSkinMap(),
    purchasedSkinCatalog: "venueSkinEngine",
    blockers: ["geometry MISSING"],
  },
];

let cache: VenueTemplateDefinition[] | null = null;

export function getAllVenueTemplates(): VenueTemplateDefinition[] {
  if (cache) return cache;
  cache = [...getAllVenueTypes().map(buildFromVenueType), ...EXTRA_TEMPLATES];
  return cache;
}

export function getVenueTemplate(templateId: string): VenueTemplateDefinition | undefined {
  return getAllVenueTemplates().find((t) => t.templateId === templateId || t.venueType === templateId);
}
