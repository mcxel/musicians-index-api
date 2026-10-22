/**
 * CanonicalVenueRecipe.ts
 *
 * TMI Asset Foundry Canonical Venue Recipe Authority.
 * Connects the Asset Foundry, venue manufacturing specs, modular seating kits,
 * production gear, display surfaces, and avatar occupancy sockets into
 * ONE unified composition pipeline.
 *
 * Anti-Bloat & Certification Law:
 * - NO sporadic/random seat placement.
 *   Seats must generate deterministically: SECTION -> ROW -> SEAT -> TRANSFORM -> OCCUPANCY SOCKET.
 * - NO white/gray clay meshes. Every surface binds to an explicit PBR material definition.
 * - Single source of truth shared between /rooms discovery preview and exact live rooms.
 */

import { resolveCertifiedVenuePackage } from "@/lib/venues/CertifiedVenuePackage";
import { slugToVenueType, type VenueType } from "@/lib/venues/VenueAssetRegistry";
import type { CertifiedVenuePackage } from "@/lib/venues/CertifiedVenuePackage";

export type VenueStyle = 'THEATER' | 'ARENA' | 'CLUB' | 'LOUNGE' | 'VIP' | 'STANDING';

export type SeatingFamily =
  | 'THEATER_VELVET'
  | 'ARENA_SEAT'
  | 'CLUB_CHAIR'
  | 'LOUNGE_BOOTH'
  | 'VIP_SOFA'
  | 'STANDING_PAD';

export interface VenueOccupancySocket {
  socketId: string;
  section: string;
  row: number;
  seat: number;
  transform: {
    position: [number, number, number];
    rotation: [number, number, number];
  };
  tierElevation: number;
  isVip?: boolean;
}

export interface VenueShellEnclosure {
  dimensions: { width: number; depth: number; height: number };
  walls: {
    rearDepth: number;
    rearHeight: number;
    sideWidth: number;
    sideAngleRad: number;
    acousticPanelCount: number;
  };
  ceiling: {
    hasRoof: boolean;
    trussElevation: number;
  };
  stage: {
    width: number;
    depth: number;
    height: number;
    apronTrimColor: string;
    centerPosition: [number, number, number];
  };
  risers: {
    tierCount: number;
    elevationStep: number;
    depthStep: number;
    startZ: number;
  };
  aisles: {
    centerWidth: number;
    hasFloorBeacons: boolean;
    beaconColor: string;
  };
}

export interface VenueProductionRig {
  hasLightingTruss: boolean;
  trussElevation: number;
  spotlights: Array<{
    position: [number, number, number];
    color: string;
    intensity: number;
    target: [number, number, number];
  }>;
  hasLineArraySpeakers: boolean;
  speakerPositions: Array<[number, number, number]>;
}

export interface VenueDisplayKit {
  jumbotron: {
    enabled: boolean;
    architecture: 'CENTER_HUNG' | 'END_ZONE' | 'WALL_HANGING';
    dimensions: { width: number; height: number; depth: number };
    position: [number, number, number];
    brandColor: string;
  };
  dualSideScreens: {
    enabled: boolean;
    dimensions: { width: number; height: number };
    leftPosition: [number, number, number];
    rightPosition: [number, number, number];
  };
}

export interface PbrMaterialDef {
  color: string;
  roughness: number;
  metalness: number;
  emissive?: string;
  emissiveIntensity?: number;
}

export interface VenueMaterialPalette {
  wall: PbrMaterialDef;
  floor: PbrMaterialDef;
  stageDeck: PbrMaterialDef;
  seatCushion: PbrMaterialDef;
  seatFrame: PbrMaterialDef;
  riserStep: PbrMaterialDef;
  neonAccent: string;
  secondaryAccent: string;
}

export interface CanonicalVenueRecipe {
  id: string;
  name: string;
  style: VenueStyle;
  seatingFamily: SeatingFamily;
  enclosure: VenueShellEnclosure;
  productionRig: VenueProductionRig;
  displayKit: VenueDisplayKit;
  materials: VenueMaterialPalette;
  cameraPresets: {
    discoveryPreview: { position: [number, number, number]; target: [number, number, number]; fov: number };
    audiencePerspective: { position: [number, number, number]; target: [number, number, number]; fov: number };
    stagePerspective: { position: [number, number, number]; target: [number, number, number]; fov: number };
  };
  seatingConfig: {
    rows: number;
    seatsPerRow: number;
    rowSpacingZ: number;
    seatSpacingX: number;
    aisleEvery: number;
    startZ: number;
    startElevation: number;
    elevationStep: number;
    curvedRake: boolean;
  };
  getSockets(): VenueOccupancySocket[];
}

export interface CanonicalRoomVenueInput {
  roomId: string;
  sessionId?: string | null;
  experienceType?: string | null;
  venueType?: string | null;
}

export interface CanonicalRoomVenueResolution {
  roomId: string;
  sessionId: string;
  venueType: VenueType;
  recipe: CanonicalVenueRecipe;
  worldId: string;
  cameraPreset: CanonicalVenueRecipe["cameraPresets"]["audiencePerspective"];
  assetSlot: {
    certifiedPackage: CertifiedVenuePackage;
    certifiedGeometryEligible: boolean;
  };
  activeGeometry: "PROCEDURAL";
  certifiedPackageEligible: boolean;
}

/** Resolve an exact room/session to the shared recipe and its spatial camera. */
export function resolveCanonicalRoomVenue(
  input: CanonicalRoomVenueInput,
): CanonicalRoomVenueResolution {
  const roomId = input.roomId.trim();
  const sessionId = input.sessionId?.trim() || `session:${roomId}`;
  const venueKey = input.venueType?.trim();
  const experienceType = input.experienceType?.trim();
  const genericExperienceTypes = new Set(["general", "concert", "live", "venue", "broadcast"]);
  const recipeKey =
    venueKey ||
    (experienceType && !genericExperienceTypes.has(experienceType.toLowerCase())
      ? experienceType
      : roomId);
  const venueType = slugToVenueType(venueKey || recipeKey);
  const recipe = getCanonicalVenueRecipe(recipeKey);
  const certifiedPackage = resolveCertifiedVenuePackage(venueType);
  const certifiedGeometryEligible = certifiedPackage.renderMode === "CERTIFIED_GEOMETRY";

  return {
    roomId,
    sessionId,
    venueType,
    recipe,
    worldId: `${roomId}::${sessionId}::${recipe.id}`,
    cameraPreset: recipe.cameraPresets.audiencePerspective,
    assetSlot: { certifiedPackage, certifiedGeometryEligible },
    activeGeometry: "PROCEDURAL",
    certifiedPackageEligible: certifiedGeometryEligible,
  };
}

/**
 * Deterministically generates seat occupancy sockets from row/section parameters.
 * Zero random XYZ placement. All transforms calculate from section -> row -> seat -> transform.
 */
export function generateRecipeSockets(config: CanonicalVenueRecipe['seatingConfig']): VenueOccupancySocket[] {
  const sockets: VenueOccupancySocket[] = [];
  const {
    rows,
    seatsPerRow,
    rowSpacingZ,
    seatSpacingX,
    aisleEvery,
    startZ,
    startElevation,
    elevationStep,
    curvedRake,
  } = config;

  for (let r = 0; r < rows; r++) {
    const rowZ = startZ + r * rowSpacingZ;
    const tierElevation = startElevation + r * elevationStep;
    const totalRowWidth = (seatsPerRow - 1) * seatSpacingX + (aisleEvery > 0 ? seatSpacingX * 0.8 : 0);

    for (let s = 0; s < seatsPerRow; s++) {
      let xOffset = -totalRowWidth / 2 + s * seatSpacingX;
      // Add aisle gap
      if (aisleEvery > 0 && s >= aisleEvery) {
        xOffset += seatSpacingX * 0.8;
      }

      // Slight curve toward stage center [0, 0, -4]
      let yaw = 0;
      let finalZ = rowZ;
      if (curvedRake && Math.abs(xOffset) > 0.5) {
        const dx = -xOffset;
        const dz = -4 - rowZ;
        yaw = Math.atan2(dx, -dz) * 0.45;
        finalZ += (Math.abs(xOffset) / totalRowWidth) * 0.25;
      }

      const socketId = 'sec-main-r' + (r + 1) + '-s' + (s + 1);
      sockets.push({
        socketId,
        section: 'MAIN_ORCHESTRA',
        row: r + 1,
        seat: s + 1,
        transform: {
          position: [Number(xOffset.toFixed(3)), Number(tierElevation.toFixed(3)), Number(finalZ.toFixed(3))],
          rotation: [0, Number(yaw.toFixed(4)), 0],
        },
        tierElevation: Number(tierElevation.toFixed(3)),
        isVip: r === 0,
      });
    }
  }

  return sockets;
}

// ─────────────────────────────────────────────────────────────────────────────
// CANONICAL RECIPES
// ─────────────────────────────────────────────────────────────────────────────

export const MONDAY_NIGHT_STAGE_RECIPE: CanonicalVenueRecipe = {
  id: 'monday-night-stage',
  name: 'Monday Night Stage & Auditorium',
  style: 'THEATER',
  seatingFamily: 'THEATER_VELVET',
  enclosure: {
    dimensions: { width: 28, depth: 32, height: 12 },
    walls: {
      rearDepth: -9.5,
      rearHeight: 12,
      sideWidth: 26,
      sideAngleRad: 0,
      acousticPanelCount: 8,
    },
    ceiling: {
      hasRoof: true,
      trussElevation: 8.5,
    },
    stage: {
      width: 16,
      depth: 6.2,
      height: 0.8,
      apronTrimColor: '#00FFFF',
      centerPosition: [0, -0.1, -5.5],
    },
    risers: {
      tierCount: 4,
      elevationStep: 0.38,
      depthStep: 1.8,
      startZ: 0.2,
    },
    aisles: {
      centerWidth: 1.2,
      hasFloorBeacons: true,
      beaconColor: '#00FFFF',
    },
  },
  productionRig: {
    hasLightingTruss: true,
    trussElevation: 8.5,
    spotlights: [
      { position: [-7, 8.2, -1], color: '#00FFFF', intensity: 2.2, target: [0, 0.4, -5.5] },
      { position: [7, 8.2, -1], color: '#FF2DAA', intensity: 2.2, target: [0, 0.4, -5.5] },
      { position: [0, 8.5, 2], color: '#AA2DFF', intensity: 1.5, target: [0, 0.4, -5.5] },
    ],
    hasLineArraySpeakers: true,
    speakerPositions: [
      [-8.6, 5.2, -3.8],
      [8.6, 5.2, -3.8],
    ],
  },
  displayKit: {
    jumbotron: {
      enabled: true,
      architecture: 'WALL_HANGING',
      dimensions: { width: 13, height: 5.2, depth: 0.25 },
      position: [0, 5.2, -9.2],
      brandColor: '#00FFFF',
    },
    dualSideScreens: {
      enabled: true,
      dimensions: { width: 3.8, height: 2.4 },
      leftPosition: [-10.8, 3.8, -6.0],
      rightPosition: [10.8, 3.8, -6.0],
    },
  },
  materials: {
    wall: { color: '#06030c', roughness: 0.88, metalness: 0.12 },
    floor: { color: '#06040f', roughness: 0.16, metalness: 0.55 },
    stageDeck: { color: '#140a20', roughness: 0.22, metalness: 0.32 },
    seatCushion: { color: '#2d083e', roughness: 0.65, metalness: 0.18 },
    seatFrame: { color: '#1a1a24', roughness: 0.15, metalness: 0.92 },
    riserStep: { color: '#090714', roughness: 0.75, metalness: 0.2 },
    neonAccent: '#00FFFF',
    secondaryAccent: '#FF2DAA',
  },
  cameraPresets: {
    discoveryPreview: { position: [0, 3.2, 9.5], target: [0, 0.5, -2], fov: 42 },
    audiencePerspective: { position: [0, 1.4, 4.5], target: [0, 1.0, -5.5], fov: 50 },
    stagePerspective: { position: [0, 1.2, -5.0], target: [0, 1.0, 3.0], fov: 55 },
  },
  seatingConfig: {
    rows: 4,
    seatsPerRow: 10,
    rowSpacingZ: 1.8,
    seatSpacingX: 0.85,
    aisleEvery: 5,
    startZ: 0.6,
    startElevation: -0.1,
    elevationStep: 0.38,
    curvedRake: true,
  },
  getSockets() {
    return generateRecipeSockets(this.seatingConfig);
  },
};

export const TMI_ARENA_RECIPE: CanonicalVenueRecipe = {
  id: 'battle-arena',
  name: 'TMI Battle Arena',
  style: 'ARENA',
  seatingFamily: 'ARENA_SEAT',
  enclosure: {
    dimensions: { width: 34, depth: 36, height: 16 },
    walls: {
      rearDepth: -12,
      rearHeight: 16,
      sideWidth: 32,
      sideAngleRad: 0,
      acousticPanelCount: 12,
    },
    ceiling: {
      hasRoof: true,
      trussElevation: 12.5,
    },
    stage: {
      width: 18,
      depth: 7.5,
      height: 1.0,
      apronTrimColor: '#FF2DAA',
      centerPosition: [0, -0.05, -7.0],
    },
    risers: {
      tierCount: 5,
      elevationStep: 0.5,
      depthStep: 1.9,
      startZ: 0.0,
    },
    aisles: {
      centerWidth: 1.4,
      hasFloorBeacons: true,
      beaconColor: '#FF2DAA',
    },
  },
  productionRig: {
    hasLightingTruss: true,
    trussElevation: 12.5,
    spotlights: [
      { position: [-9, 12, -2], color: '#FF2DAA', intensity: 2.8, target: [0, 0.5, -7.0] },
      { position: [9, 12, -2], color: '#FFD700', intensity: 2.8, target: [0, 0.5, -7.0] },
      { position: [0, 12, 3], color: '#00FFFF', intensity: 2.0, target: [0, 0.5, -7.0] },
    ],
    hasLineArraySpeakers: true,
    speakerPositions: [
      [-10.5, 7.5, -5.0],
      [10.5, 7.5, -5.0],
    ],
  },
  displayKit: {
    jumbotron: {
      enabled: true,
      architecture: 'CENTER_HUNG',
      dimensions: { width: 8.0, height: 4.6, depth: 8.0 },
      position: [0, 7.8, -1.0],
      brandColor: '#FF2DAA',
    },
    dualSideScreens: {
      enabled: true,
      dimensions: { width: 4.5, height: 2.8 },
      leftPosition: [-12.5, 5.0, -7.0],
      rightPosition: [12.5, 5.0, -7.0],
    },
  },
  materials: {
    wall: { color: '#080814', roughness: 0.85, metalness: 0.2 },
    floor: { color: '#070710', roughness: 0.2, metalness: 0.4 },
    stageDeck: { color: '#160820', roughness: 0.25, metalness: 0.35 },
    seatCushion: { color: '#1e1028', roughness: 0.45, metalness: 0.25 },
    seatFrame: { color: '#2a2a38', roughness: 0.18, metalness: 0.9 },
    riserStep: { color: '#0c0a18', roughness: 0.7, metalness: 0.25 },
    neonAccent: '#FF2DAA',
    secondaryAccent: '#FFD700',
  },
  cameraPresets: {
    discoveryPreview: { position: [0, 4.0, 11.5], target: [0, 0.8, -3], fov: 44 },
    audiencePerspective: { position: [0, 1.8, 5.5], target: [0, 1.0, -7.0], fov: 52 },
    stagePerspective: { position: [0, 1.4, -6.5], target: [0, 1.2, 4.0], fov: 58 },
  },
  seatingConfig: {
    rows: 4,
    seatsPerRow: 12,
    rowSpacingZ: 1.9,
    seatSpacingX: 0.85,
    aisleEvery: 6,
    startZ: 0.8,
    startElevation: 0.0,
    elevationStep: 0.5,
    curvedRake: true,
  },
  getSockets() {
    return generateRecipeSockets(this.seatingConfig);
  },
};

export const NEON_CLUB_RECIPE: CanonicalVenueRecipe = {
  id: 'neon-club',
  name: 'Neon Cypher Underground',
  style: 'CLUB',
  seatingFamily: 'CLUB_CHAIR',
  enclosure: {
    dimensions: { width: 22, depth: 24, height: 9 },
    walls: {
      rearDepth: -7.5,
      rearHeight: 9,
      sideWidth: 20,
      sideAngleRad: 0,
      acousticPanelCount: 6,
    },
    ceiling: {
      hasRoof: true,
      trussElevation: 7.2,
    },
    stage: {
      width: 12,
      depth: 4.8,
      height: 0.45,
      apronTrimColor: '#AA2DFF',
      centerPosition: [0, -0.2, -4.5],
    },
    risers: {
      tierCount: 3,
      elevationStep: 0.28,
      depthStep: 1.6,
      startZ: 0.2,
    },
    aisles: {
      centerWidth: 1.0,
      hasFloorBeacons: true,
      beaconColor: '#AA2DFF',
    },
  },
  productionRig: {
    hasLightingTruss: true,
    trussElevation: 7.2,
    spotlights: [
      { position: [-5, 6.8, -1], color: '#AA2DFF', intensity: 2.0, target: [0, 0.3, -4.5] },
      { position: [5, 6.8, -1], color: '#00FFFF', intensity: 2.0, target: [0, 0.3, -4.5] },
    ],
    hasLineArraySpeakers: true,
    speakerPositions: [
      [-6.5, 4.5, -3.5],
      [6.5, 4.5, -3.5],
    ],
  },
  displayKit: {
    jumbotron: {
      enabled: true,
      architecture: 'WALL_HANGING',
      dimensions: { width: 8.5, height: 3.8, depth: 0.2 },
      position: [0, 4.2, -7.3],
      brandColor: '#AA2DFF',
    },
    dualSideScreens: {
      enabled: false,
      dimensions: { width: 2.5, height: 1.8 },
      leftPosition: [-8, 3, -4],
      rightPosition: [8, 3, -4],
    },
  },
  materials: {
    wall: { color: '#05020a', roughness: 0.9, metalness: 0.1 },
    floor: { color: '#05010c', roughness: 0.12, metalness: 0.6 },
    stageDeck: { color: '#10051a', roughness: 0.18, metalness: 0.4 },
    seatCushion: { color: '#120520', roughness: 0.35, metalness: 0.1 },
    seatFrame: { color: '#333344', roughness: 0.1, metalness: 0.95 },
    riserStep: { color: '#080210', roughness: 0.8, metalness: 0.15 },
    neonAccent: '#AA2DFF',
    secondaryAccent: '#00FFFF',
  },
  cameraPresets: {
    discoveryPreview: { position: [0, 2.8, 8.0], target: [0, 0.4, -1.8], fov: 45 },
    audiencePerspective: { position: [0, 1.2, 3.8], target: [0, 0.8, -4.5], fov: 52 },
    stagePerspective: { position: [0, 1.0, -4.0], target: [0, 0.8, 2.5], fov: 55 },
  },
  seatingConfig: {
    rows: 3,
    seatsPerRow: 8,
    rowSpacingZ: 1.6,
    seatSpacingX: 1.1,
    aisleEvery: 4,
    startZ: 0.4,
    startElevation: -0.15,
    elevationStep: 0.28,
    curvedRake: false,
  },
  getSockets() {
    return generateRecipeSockets(this.seatingConfig);
  },
};

export const VIP_LOUNGE_RECIPE: CanonicalVenueRecipe = {
  id: 'vip-lounge',
  name: 'Gold Horizon VIP Lounge',
  style: 'VIP',
  seatingFamily: 'VIP_SOFA',
  enclosure: {
    dimensions: { width: 24, depth: 26, height: 9.5 },
    walls: {
      rearDepth: -8.0,
      rearHeight: 9.5,
      sideWidth: 22,
      sideAngleRad: 0,
      acousticPanelCount: 6,
    },
    ceiling: {
      hasRoof: true,
      trussElevation: 7.5,
    },
    stage: {
      width: 12,
      depth: 5.0,
      height: 0.5,
      apronTrimColor: '#FFD700',
      centerPosition: [0, -0.15, -5.0],
    },
    risers: {
      tierCount: 3,
      elevationStep: 0.32,
      depthStep: 1.9,
      startZ: 0.2,
    },
    aisles: {
      centerWidth: 1.2,
      hasFloorBeacons: true,
      beaconColor: '#FFD700',
    },
  },
  productionRig: {
    hasLightingTruss: true,
    trussElevation: 7.5,
    spotlights: [
      { position: [-6, 7.0, -1], color: '#FFD700', intensity: 2.2, target: [0, 0.4, -5.0] },
      { position: [6, 7.0, -1], color: '#FF8800', intensity: 2.2, target: [0, 0.4, -5.0] },
    ],
    hasLineArraySpeakers: true,
    speakerPositions: [
      [-7.2, 4.8, -4.0],
      [7.2, 4.8, -4.0],
    ],
  },
  displayKit: {
    jumbotron: {
      enabled: true,
      architecture: 'WALL_HANGING',
      dimensions: { width: 9.2, height: 4.2, depth: 0.2 },
      position: [0, 4.5, -7.8],
      brandColor: '#FFD700',
    },
    dualSideScreens: {
      enabled: false,
      dimensions: { width: 2.8, height: 1.9 },
      leftPosition: [-9, 3.2, -4.5],
      rightPosition: [9, 3.2, -4.5],
    },
  },
  materials: {
    wall: { color: '#0d0702', roughness: 0.85, metalness: 0.15 },
    floor: { color: '#080401', roughness: 0.14, metalness: 0.5 },
    stageDeck: { color: '#1c0f05', roughness: 0.2, metalness: 0.2 },
    seatCushion: { color: '#2a1405', roughness: 0.5, metalness: 0.15 },
    seatFrame: { color: '#FFD700', roughness: 0.15, metalness: 0.95 },
    riserStep: { color: '#0f0802', roughness: 0.7, metalness: 0.2 },
    neonAccent: '#FFD700',
    secondaryAccent: '#FF8800',
  },
  cameraPresets: {
    discoveryPreview: { position: [0, 3.0, 8.5], target: [0, 0.5, -2.0], fov: 44 },
    audiencePerspective: { position: [0, 1.4, 4.2], target: [0, 0.9, -5.0], fov: 50 },
    stagePerspective: { position: [0, 1.1, -4.5], target: [0, 0.9, 2.8], fov: 54 },
  },
  seatingConfig: {
    rows: 3,
    seatsPerRow: 6,
    rowSpacingZ: 1.9,
    seatSpacingX: 1.4,
    aisleEvery: 3,
    startZ: 0.5,
    startElevation: -0.1,
    elevationStep: 0.32,
    curvedRake: true,
  },
  getSockets() {
    return generateRecipeSockets(this.seatingConfig);
  },
};

/**
 * Resolves canonical venue recipe by identifier, type, or slug.
 */
export function getCanonicalVenueRecipe(venueTypeOrId?: string | null): CanonicalVenueRecipe {
  if (!venueTypeOrId) return MONDAY_NIGHT_STAGE_RECIPE;
  const key = venueTypeOrId.toLowerCase().trim();

  if (key.includes('battle') || key.includes('arena') || key.includes('stadium')) {
    return TMI_ARENA_RECIPE;
  }
  if (key.includes('club') || key.includes('cypher') || key.includes('dance')) {
    return NEON_CLUB_RECIPE;
  }
  if (key.includes('vip') || key.includes('lounge') || key.includes('gold')) {
    return VIP_LOUNGE_RECIPE;
  }
  return MONDAY_NIGHT_STAGE_RECIPE;
}
