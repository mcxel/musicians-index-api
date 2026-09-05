/**
 * VenueJumbotronPlacementResolver.ts — Canonical Real World-Space Jumbotron Placement Resolver
 *
 * Laws:
 * 1. Jumbotrons are real world-space venue objects with actual square footage, width, depth, height.
 * 2. Indoor arena/stadium rooms use a basketball-arena-style center-hung multi-face Jumbotron (N/S/E/W + bottom ring).
 * 3. Outdoor venues use end-zone / rear-stage / field-edge displays from venue geometry.
 * 4. Placement derives from venue width × depth × height, floor/stage center, tiers, ceiling.
 * 5. FOV/sphere comes from venue runtime config — never hardcodes 160° or 360×180.
 * 6. Never places Jumbotron as a fixed HUD overlay.
 */

import {
  type VenueSpatialDimensions,
  type PhysicalJumbotronDescriptor,
  type JumbotronDisplayFace,
  type SeatingTierZone,
  type VenuePhysicalEnvironmentType,
  type JumbotronCollisionEnvelope,
} from "./JumbotronContracts";
import { VENUE_CONTRACT_REGISTRY } from "../venues/VenueAssetContract";

/** Venue-runtime sphere FOV by environment — consumed dynamically; not a 160° hardcode. */
export const VENUE_RUNTIME_SPHERE_FOV: Record<VenuePhysicalEnvironmentType, number> = {
  INDOOR_ARENA: 120,
  OUTDOOR_STADIUM: 140,
  CLUB_SMALL_ROOM: 90,
  WORLD_DANCE_PARTY: 110,
  PROSCENIUM_THEATER: 100,
};

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function buildCollisionEnvelope(
  center: [number, number, number],
  dims: { widthMeters: number; heightMeters: number; depthMeters: number },
  bufferMeters: number
): JumbotronCollisionEnvelope {
  const halfW = dims.widthMeters / 2 + bufferMeters;
  const halfH = dims.heightMeters / 2 + bufferMeters;
  const halfD = dims.depthMeters / 2 + bufferMeters;
  return {
    min: [center[0] - halfW, center[1] - halfH, center[2] - halfD],
    max: [center[0] + halfW, center[1] + halfH, center[2] + halfD],
    clearanceBufferMeters: bufferMeters,
  };
}

export class VenueJumbotronPlacementResolver {
  public static readonly FEET_TO_METERS = 0.3048;

  /**
   * Resolves camera/environment sphere FOV from venue runtime config.
   * Priority: explicit override → VenueAssetContract camera anchors → environment profile.
   * Never returns a hardcoded 160° / 360×180 magic pair.
   */
  public static resolveVenueCameraSphereFovDegrees(params: {
    venueEnvironment: VenuePhysicalEnvironmentType;
    venueId?: string;
    overrideFovDegrees?: number;
  }): number {
    if (
      typeof params.overrideFovDegrees === "number" &&
      Number.isFinite(params.overrideFovDegrees) &&
      params.overrideFovDegrees > 20 &&
      params.overrideFovDegrees < 180
    ) {
      return params.overrideFovDegrees;
    }

    if (params.venueId) {
      for (const contract of VENUE_CONTRACT_REGISTRY.values()) {
        if (contract.venueId === params.venueId || params.venueId.includes(contract.venueId)) {
          const audienceCam = contract.cameraAnchors.find((c) => c.role === "audience-pov");
          if (audienceCam?.fovDeg && audienceCam.fovDeg > 20 && audienceCam.fovDeg < 180) {
            return audienceCam.fovDeg;
          }
          const anyCam = contract.cameraAnchors[0];
          if (anyCam?.fovDeg && anyCam.fovDeg > 20 && anyCam.fovDeg < 180) {
            return anyCam.fovDeg;
          }
        }
      }
    }

    return VENUE_RUNTIME_SPHERE_FOV[params.venueEnvironment];
  }

  /**
   * Constructs canonical venue spatial dimensions from feet or meters.
   */
  public static createVenueDimensions(params: {
    venueId: string;
    venueEnvironment: VenuePhysicalEnvironmentType;
    widthFeet: number;
    depthFeet: number;
    heightFeet: number;
    floorElevationMeters?: number;
    stageCourtCenter?: [number, number, number];
    cameraSphereFovDegrees?: number;
  }): VenueSpatialDimensions {
    const widthMeters = params.widthFeet * VenueJumbotronPlacementResolver.FEET_TO_METERS;
    const depthMeters = params.depthFeet * VenueJumbotronPlacementResolver.FEET_TO_METERS;
    const heightMeters = params.heightFeet * VenueJumbotronPlacementResolver.FEET_TO_METERS;
    const floorElevationMeters = params.floorElevationMeters ?? 0.0;
    const ceilingElevationMeters = floorElevationMeters + heightMeters;
    const stageCourtCenter = params.stageCourtCenter ?? [0, floorElevationMeters, 0];

    const cameraSphereFovDegrees =
      VenueJumbotronPlacementResolver.resolveVenueCameraSphereFovDegrees({
        venueEnvironment: params.venueEnvironment,
        venueId: params.venueId,
        overrideFovDegrees: params.cameraSphereFovDegrees,
      });

    return {
      venueId: params.venueId,
      venueEnvironment: params.venueEnvironment,
      widthFeet: params.widthFeet,
      depthFeet: params.depthFeet,
      heightFeet: params.heightFeet,
      widthMeters,
      depthMeters,
      heightMeters,
      floorElevationMeters,
      ceilingElevationMeters,
      stageCourtCenter,
      cameraSphereFovDegrees,
    };
  }

  /**
   * Resolves canonical seating tier zones with representative 3D eye positions.
   * Mandatory samples: LOWER, MID, UPPER, FLOOR, VIP, SIDE, REAR.
   */
  public static resolveSeatingTiers(dimensions: VenueSpatialDimensions): SeatingTierZone[] {
    const [cx, cy, cz] = dimensions.stageCourtCenter;
    const env = dimensions.venueEnvironment;
    const halfW = dimensions.widthMeters / 2;
    const halfD = dimensions.depthMeters / 2;

    if (env === "INDOOR_ARENA") {
      const lowerR = clamp(halfD * 0.45, 18, 28);
      const midR = clamp(halfD * 0.65, 28, 42);
      const upperR = clamp(halfD * 0.9, 42, 60);
      const sideR = clamp(halfW * 0.7, 22, 40);
      const rearR = clamp(halfD * 0.85, 40, 58);

      return [
        {
          tierId: "floor-ga",
          tierName: "Floor / General Admission",
          tierClass: "FLOOR_GA",
          quadrant: "CENTER",
          elevationMeters: cy + 1.65,
          radialDistanceMeters: clamp(halfD * 0.2, 8, 14),
          representativeEyePositions: [
            [cx + 8, cy + 1.65, cz + 6],
            [cx - 8, cy + 1.65, cz - 6],
          ],
        },
        {
          tierId: "vip-courtside",
          tierName: "VIP Courtside Front Row",
          tierClass: "VIP",
          quadrant: "CENTER",
          elevationMeters: cy + 1.2,
          radialDistanceMeters: clamp(halfD * 0.28, 12, 18),
          representativeEyePositions: [
            [cx, cy + 1.2, cz + 14],
            [cx, cy + 1.2, cz - 14],
          ],
        },
        {
          tierId: "lower-bowl-north",
          tierName: "Lower Bowl North",
          tierClass: "LOWER_BOWL",
          quadrant: "NORTH",
          elevationMeters: cy + 4.5,
          radialDistanceMeters: lowerR,
          representativeEyePositions: [[cx, cy + 4.5, cz - lowerR]],
        },
        {
          tierId: "lower-bowl-south",
          tierName: "Lower Bowl South",
          tierClass: "LOWER_BOWL",
          quadrant: "SOUTH",
          elevationMeters: cy + 4.5,
          radialDistanceMeters: lowerR,
          representativeEyePositions: [[cx, cy + 4.5, cz + lowerR]],
        },
        {
          tierId: "mid-bowl-ring",
          tierName: "Club Tier / Mid Bowl",
          tierClass: "MID_BOWL",
          quadrant: "NORTH",
          elevationMeters: cy + 8.5,
          radialDistanceMeters: midR,
          representativeEyePositions: [
            [cx, cy + 8.5, cz - midR],
            [cx + midR * 0.85, cy + 8.5, cz],
          ],
        },
        {
          tierId: "upper-bowl-nosebleeds",
          tierName: "Upper Deck / Nosebleeds",
          tierClass: "UPPER_BOWL",
          quadrant: "SOUTH",
          elevationMeters: cy + 14.0,
          radialDistanceMeters: upperR,
          representativeEyePositions: [
            [cx, cy + 14.0, cz + upperR],
            [cx - upperR * 0.85, cy + 14.0, cz],
          ],
        },
        {
          tierId: "side-sections-east-west",
          tierName: "Side Sections",
          tierClass: "SIDE_SECTIONS",
          quadrant: "EAST",
          elevationMeters: cy + 6.0,
          radialDistanceMeters: sideR,
          representativeEyePositions: [
            [cx + sideR, cy + 6.0, cz],
            [cx - sideR, cy + 6.0, cz],
          ],
        },
        {
          tierId: "rear-sections",
          tierName: "Rear Sections",
          tierClass: "REAR_SECTIONS",
          quadrant: "SOUTH",
          elevationMeters: cy + 10.0,
          radialDistanceMeters: rearR,
          representativeEyePositions: [[cx, cy + 10.0, cz + rearR]],
        },
      ];
    }

    if (env === "OUTDOOR_STADIUM") {
      return [
        {
          tierId: "field-ga",
          tierName: "Field Level Standing",
          tierClass: "FLOOR_GA",
          quadrant: "CENTER",
          elevationMeters: cy + 1.65,
          radialDistanceMeters: 25.0,
          representativeEyePositions: [[cx, cy + 1.65, cz + 25]],
        },
        {
          tierId: "grandstand-lower",
          tierName: "Grandstand Lower",
          tierClass: "LOWER_BOWL",
          quadrant: "SOUTH",
          elevationMeters: cy + 5.0,
          radialDistanceMeters: 45.0,
          representativeEyePositions: [[cx, cy + 5.0, cz + 45]],
        },
        {
          tierId: "grandstand-mid",
          tierName: "Grandstand Mid",
          tierClass: "MID_BOWL",
          quadrant: "SOUTH",
          elevationMeters: cy + 10.0,
          radialDistanceMeters: 60.0,
          representativeEyePositions: [[cx, cy + 10.0, cz + 60]],
        },
        {
          tierId: "grandstand-upper",
          tierName: "Grandstand Upper",
          tierClass: "UPPER_BOWL",
          quadrant: "SOUTH",
          elevationMeters: cy + 15.0,
          radialDistanceMeters: 75.0,
          representativeEyePositions: [[cx, cy + 15.0, cz + 75]],
        },
        {
          tierId: "vip-box",
          tierName: "VIP Boxes",
          tierClass: "VIP",
          quadrant: "SOUTH",
          elevationMeters: cy + 8.0,
          radialDistanceMeters: 50.0,
          representativeEyePositions: [[cx + 12, cy + 8.0, cz + 50]],
        },
        {
          tierId: "side-field",
          tierName: "Sideline Sections",
          tierClass: "SIDE_SECTIONS",
          quadrant: "EAST",
          elevationMeters: cy + 4.0,
          radialDistanceMeters: 40.0,
          representativeEyePositions: [[cx + 40, cy + 4.0, cz + 20]],
        },
        {
          tierId: "rear-grandstand",
          tierName: "Rear Grandstand",
          tierClass: "REAR_SECTIONS",
          quadrant: "SOUTH",
          elevationMeters: cy + 18.0,
          radialDistanceMeters: 90.0,
          representativeEyePositions: [[cx, cy + 18.0, cz + 90]],
        },
      ];
    }

    // Club / Small Room / Dance Floor / Proscenium
    // House is +Z (audience). Wall/disco primary faces the house — never seat VIP
    // behind the upstage wall LED (prior cz-16 NORTH sat behind WALL_HANGING_LED).
    return [
      {
        tierId: "dance-floor-center",
        tierName: "Dance Floor Main",
        tierClass: "FLOOR_GA",
        quadrant: "CENTER",
        elevationMeters: cy + 1.65,
        radialDistanceMeters: 8.0,
        representativeEyePositions: [[cx, cy + 1.65, cz + 8]],
      },
      {
        tierId: "vip-mezzanine",
        tierName: "VIP Mezzanine Lounge",
        tierClass: "VIP",
        quadrant: "SOUTH",
        elevationMeters: cy + 3.5,
        radialDistanceMeters: 14.0,
        representativeEyePositions: [[cx, cy + 3.5, cz + 14]],
      },
      {
        tierId: "lower-rail",
        tierName: "Lower Rail",
        tierClass: "LOWER_BOWL",
        quadrant: "SOUTH",
        elevationMeters: cy + 1.4,
        radialDistanceMeters: 12.0,
        representativeEyePositions: [[cx, cy + 1.4, cz + 12]],
      },
      {
        tierId: "mid-balcony",
        tierName: "Mid Balcony",
        tierClass: "MID_BOWL",
        quadrant: "SOUTH",
        elevationMeters: cy + 5.0,
        radialDistanceMeters: 18.0,
        representativeEyePositions: [[cx, cy + 5.0, cz + 18]],
      },
      {
        tierId: "upper-rail",
        tierName: "Upper Rail",
        tierClass: "UPPER_BOWL",
        quadrant: "SOUTH",
        elevationMeters: cy + 7.5,
        radialDistanceMeters: 22.0,
        representativeEyePositions: [[cx, cy + 7.5, cz + 22]],
      },
      {
        tierId: "side-booths",
        tierName: "Side Booths",
        tierClass: "SIDE_SECTIONS",
        quadrant: "EAST",
        elevationMeters: cy + 1.5,
        radialDistanceMeters: 10.0,
        representativeEyePositions: [
          [cx + 10, cy + 1.5, cz + 6],
          [cx - 10, cy + 1.5, cz + 6],
        ],
      },
      {
        tierId: "rear-bar",
        tierName: "Rear Bar Rail",
        tierClass: "REAR_SECTIONS",
        quadrant: "SOUTH",
        elevationMeters: cy + 1.7,
        radialDistanceMeters: 20.0,
        representativeEyePositions: [[cx, cy + 1.7, cz + 20]],
      },
    ];
  }

  /**
   * Resolves physical Jumbotron placement using venue dimensions and environmental architecture.
   * Indoor size scales from venue width × depth × height (not fixed HUD pixels).
   */
  public static resolvePlacement(
    dimensions: VenueSpatialDimensions,
    _occupiedTiers?: SeatingTierZone[]
  ): PhysicalJumbotronDescriptor {
    const [cx, cy, cz] = dimensions.stageCourtCenter;
    const env = dimensions.venueEnvironment;

    // ─────────────────────────────────────────────────────────────────────────
    // 1. INDOOR BASKETBALL/HOCKEY-ARENA CENTER-HUNG JUMBOTRON
    // ─────────────────────────────────────────────────────────────────────────
    if (env === "INDOOR_ARENA") {
      // Scale from venue footprint / volume — not a fixed HUD size.
      const jumbotronWidth = clamp(dimensions.widthMeters * 0.22, 8.0, 18.0);
      const jumbotronHeight = clamp(dimensions.heightMeters * 0.27, 5.0, 10.0);
      const jumbotronDepth = jumbotronWidth; // multi-sided cube

      const minBottomClearance = clamp(dimensions.heightMeters * 0.28, 6.5, 9.5);
      const hoistHeadroom = clamp(dimensions.heightMeters * 0.08, 2.0, 3.5);

      const maxCenterY = dimensions.ceilingElevationMeters - hoistHeadroom - jumbotronHeight / 2;
      const minCenterY = dimensions.floorElevationMeters + minBottomClearance + jumbotronHeight / 2;
      const centerPosY = Math.max(minCenterY, Math.min(maxCenterY, minCenterY + 2.0));
      const bottomClearance = centerPosY - jumbotronHeight / 2 - dimensions.floorElevationMeters;

      const halfW = jumbotronWidth / 2;
      const halfD = jumbotronDepth / 2;
      const cantAngle = 8.0;
      const mountRiggingAnchor: [number, number, number] = [
        cx,
        dimensions.ceilingElevationMeters - hoistHeadroom * 0.35,
        cz,
      ];

      const faces: JumbotronDisplayFace[] = [
        {
          faceId: "jumbo-face-north",
          orientation: "NORTH",
          targetClass: "JUMBOTRON_NORTH",
          centerPosition: [cx, centerPosY, cz - halfD],
          normalVector: [0, -Math.sin((cantAngle * Math.PI) / 180), -Math.cos((cantAngle * Math.PI) / 180)],
          widthMeters: jumbotronWidth,
          heightMeters: jumbotronHeight,
          cantAngleDegrees: cantAngle,
        },
        {
          faceId: "jumbo-face-south",
          orientation: "SOUTH",
          targetClass: "JUMBOTRON_SOUTH",
          centerPosition: [cx, centerPosY, cz + halfD],
          normalVector: [0, -Math.sin((cantAngle * Math.PI) / 180), Math.cos((cantAngle * Math.PI) / 180)],
          widthMeters: jumbotronWidth,
          heightMeters: jumbotronHeight,
          cantAngleDegrees: cantAngle,
        },
        {
          faceId: "jumbo-face-east",
          orientation: "EAST",
          targetClass: "JUMBOTRON_EAST",
          centerPosition: [cx + halfW, centerPosY, cz],
          normalVector: [Math.cos((cantAngle * Math.PI) / 180), -Math.sin((cantAngle * Math.PI) / 180), 0],
          widthMeters: jumbotronDepth,
          heightMeters: jumbotronHeight,
          cantAngleDegrees: cantAngle,
        },
        {
          faceId: "jumbo-face-west",
          orientation: "WEST",
          targetClass: "JUMBOTRON_WEST",
          centerPosition: [cx - halfW, centerPosY, cz],
          normalVector: [-Math.cos((cantAngle * Math.PI) / 180), -Math.sin((cantAngle * Math.PI) / 180), 0],
          widthMeters: jumbotronDepth,
          heightMeters: jumbotronHeight,
          cantAngleDegrees: cantAngle,
        },
        {
          faceId: "jumbo-bottom-ring",
          orientation: "BOTTOM_RING",
          targetClass: "JUMBOTRON_BOTTOM_RING",
          centerPosition: [cx, centerPosY - jumbotronHeight / 2, cz],
          normalVector: [0, -1, 0],
          widthMeters: jumbotronWidth * 0.8,
          heightMeters: 1.5,
          cantAngleDegrees: 0,
        },
        {
          faceId: "jumbo-upper-ribbon",
          orientation: "UPPER_RIBBON",
          targetClass: "JUMBOTRON_UPPER_RIBBON",
          centerPosition: [cx, centerPosY + jumbotronHeight / 2, cz],
          normalVector: [0, 0, 0],
          widthMeters: jumbotronWidth * 1.05,
          heightMeters: 0.9,
          cantAngleDegrees: 0,
        },
      ];

      const dims = {
        widthMeters: jumbotronWidth,
        heightMeters: jumbotronHeight,
        depthMeters: jumbotronDepth,
      };
      const centerPosition: [number, number, number] = [cx, centerPosY, cz];

      return {
        targetId: `jumbotron-${dimensions.venueId}-centerhung`,
        architecture: "CENTER_HUNG_ARENA_JUMBOTRON",
        centerPosition,
        dimensions: dims,
        bottomClearanceMeters: bottomClearance,
        safeRiggingElevationMeters: centerPosY + jumbotronHeight / 2,
        mountRiggingAnchor,
        collisionEnvelope: buildCollisionEnvelope(centerPosition, dims, 1.2),
        viewingOrientationYawDegrees: 0,
        faces,
        hasBottomRing: true,
        hasUpperRibbon: true,
        isProceduralGenerated: false,
        auxiliaryDisplaysActivated: false,
      };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. OUTDOOR STADIUM (END-ZONE / REAR-STAGE / FIELD-EDGE)
    // ─────────────────────────────────────────────────────────────────────────
    if (env === "OUTDOOR_STADIUM") {
      const screenWidth = clamp(dimensions.widthMeters * 0.35, 16.0, 32.0);
      const screenHeight = clamp(dimensions.heightMeters * 0.35, 8.0, 16.0);
      const centerPosY = cy + clamp(dimensions.heightMeters * 0.35, 10.0, 18.0);
      const centerPosZ = cz - dimensions.depthMeters / 2 + 10.0;
      const centerPosition: [number, number, number] = [cx, centerPosY, centerPosZ];
      const dims = { widthMeters: screenWidth, heightMeters: screenHeight, depthMeters: 1.5 };

      return {
        targetId: `jumbotron-${dimensions.venueId}-endzone`,
        architecture: "END_ZONE_DISPLAY",
        centerPosition,
        dimensions: dims,
        bottomClearanceMeters: centerPosY - screenHeight / 2 - cy,
        safeRiggingElevationMeters: centerPosY + screenHeight / 2,
        mountRiggingAnchor: [cx, centerPosY + screenHeight / 2 + 1.0, centerPosZ],
        collisionEnvelope: buildCollisionEnvelope(centerPosition, dims, 0.8),
        viewingOrientationYawDegrees: 180,
        faces: [
          {
            faceId: "jumbo-outdoor-main",
            orientation: "OUTDOOR_ENDZONE",
            targetClass: "JUMBOTRON",
            centerPosition,
            normalVector: [0, 0, 1],
            widthMeters: screenWidth,
            heightMeters: screenHeight,
            cantAngleDegrees: 3.0,
          },
        ],
        hasBottomRing: false,
        hasUpperRibbon: false,
        isProceduralGenerated: true,
        auxiliaryDisplaysActivated: false,
      };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. WORLD DANCE PARTY (CENTER-HUNG MIRRORED DISCO ORB)
    // ─────────────────────────────────────────────────────────────────────────
    if (env === "WORLD_DANCE_PARTY") {
      const radius = clamp(Math.min(dimensions.widthMeters, dimensions.depthMeters) * 0.06, 1.8, 3.5);
      const centerPosY = cy + clamp(dimensions.heightMeters * 0.45, 6.0, 12.0);
      const centerPosition: [number, number, number] = [cx, centerPosY, cz];
      const dims = {
        widthMeters: radius * 2,
        heightMeters: radius * 2,
        depthMeters: radius * 2,
      };

      return {
        targetId: `disco-orb-${dimensions.venueId}`,
        architecture: "CENTER_HUNG_DISCO_ORB",
        centerPosition,
        dimensions: dims,
        bottomClearanceMeters: centerPosY - radius - cy,
        safeRiggingElevationMeters: centerPosY + radius,
        mountRiggingAnchor: [cx, dimensions.ceilingElevationMeters - 1.0, cz],
        collisionEnvelope: buildCollisionEnvelope(centerPosition, dims, 0.6),
        viewingOrientationYawDegrees: 0,
        faces: [
          {
            faceId: "disco-orb-surface",
            orientation: "DISCO_SPHERE",
            targetClass: "JUMBOTRON",
            centerPosition,
            normalVector: [0, 0, 1],
            widthMeters: radius * 2,
            heightMeters: radius * 2,
            cantAngleDegrees: 0,
          },
        ],
        hasBottomRing: false,
        hasUpperRibbon: false,
        isProceduralGenerated: true,
        auxiliaryDisplaysActivated: false,
      };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. CLUB / SMALL ROOM / PROSCENIUM (WALL / HANGING LED)
    // ─────────────────────────────────────────────────────────────────────────
    const wallWidth = clamp(dimensions.widthMeters * 0.45, 6.0, 14.0);
    const wallHeight = clamp(dimensions.heightMeters * 0.4, 3.5, 7.0);
    const wallCenterY = cy + clamp(dimensions.heightMeters * 0.35, 3.5, 7.0);
    const wallCenterZ = cz - clamp(dimensions.depthMeters * 0.35, 6.0, 14.0);
    const centerPosition: [number, number, number] = [cx, wallCenterY, wallCenterZ];
    const dims = { widthMeters: wallWidth, heightMeters: wallHeight, depthMeters: 0.4 };

    return {
      targetId: `jumbotron-${dimensions.venueId}-wall`,
      architecture: "WALL_HANGING_LED",
      centerPosition,
      dimensions: dims,
      bottomClearanceMeters: wallCenterY - wallHeight / 2 - cy,
      safeRiggingElevationMeters: wallCenterY + wallHeight / 2,
      mountRiggingAnchor: [cx, wallCenterY + wallHeight / 2 + 0.5, wallCenterZ],
      collisionEnvelope: buildCollisionEnvelope(centerPosition, dims, 0.4),
      viewingOrientationYawDegrees: 0,
      faces: [
        {
          faceId: "jumbo-club-wall",
          orientation: "NORTH",
          targetClass: "JUMBOTRON",
          centerPosition,
          normalVector: [0, 0, 1],
          widthMeters: wallWidth,
          heightMeters: wallHeight,
          cantAngleDegrees: 5.0,
        },
      ],
      hasBottomRing: false,
      hasUpperRibbon: false,
      isProceduralGenerated: true,
      auxiliaryDisplaysActivated: false,
    };
  }

  /**
   * Activates auxiliary wall / rail displays for zones that failed primary sightline.
   */
  public static activateAuxiliaryDisplays(
    dimensions: VenueSpatialDimensions,
    jumbotron: PhysicalJumbotronDescriptor,
    failedQuadrants: Array<"NORTH" | "SOUTH" | "EAST" | "WEST">
  ): PhysicalJumbotronDescriptor {
    if (failedQuadrants.length === 0) return jumbotron;

    const [cx, cy, cz] = dimensions.stageCourtCenter;
    const wallY = cy + clamp(dimensions.heightMeters * 0.35, 4.0, 8.0);
    const wallW = clamp(dimensions.widthMeters * 0.18, 4.0, 8.0);
    const wallH = clamp(dimensions.heightMeters * 0.2, 2.5, 4.5);
    const auxFaces: JumbotronDisplayFace[] = [];

    for (const q of failedQuadrants) {
      if (q === "NORTH") {
        auxFaces.push({
          faceId: "aux-wall-north",
          orientation: "NORTH",
          targetClass: "VENUE_WALL",
          centerPosition: [cx, wallY, cz - dimensions.depthMeters * 0.42],
          normalVector: [0, 0, 1],
          widthMeters: wallW,
          heightMeters: wallH,
          cantAngleDegrees: 4,
        });
      } else if (q === "SOUTH") {
        auxFaces.push({
          faceId: "aux-wall-south",
          orientation: "SOUTH",
          targetClass: "VENUE_WALL",
          centerPosition: [cx, wallY, cz + dimensions.depthMeters * 0.42],
          normalVector: [0, 0, -1],
          widthMeters: wallW,
          heightMeters: wallH,
          cantAngleDegrees: 4,
        });
      } else if (q === "EAST") {
        auxFaces.push({
          faceId: "aux-wall-east",
          orientation: "EAST",
          targetClass: "VENUE_WALL",
          centerPosition: [cx + dimensions.widthMeters * 0.42, wallY, cz],
          normalVector: [-1, 0, 0],
          widthMeters: wallW,
          heightMeters: wallH,
          cantAngleDegrees: 4,
        });
      } else {
        auxFaces.push({
          faceId: "aux-wall-west",
          orientation: "WEST",
          targetClass: "VENUE_WALL",
          centerPosition: [cx - dimensions.widthMeters * 0.42, wallY, cz],
          normalVector: [1, 0, 0],
          widthMeters: wallW,
          heightMeters: wallH,
          cantAngleDegrees: 4,
        });
      }
    }

    return {
      ...jumbotron,
      faces: [...jumbotron.faces, ...auxFaces],
      auxiliaryDisplaysActivated: true,
    };
  }
}
