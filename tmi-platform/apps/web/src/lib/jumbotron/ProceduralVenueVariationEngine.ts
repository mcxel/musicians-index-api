/**
 * ProceduralVenueVariationEngine.ts — Certified Procedural Display & Jumbotron Generator
 *
 * Laws:
 * 1. Do only what the current runtime can deterministically build now.
 * 2. If no dedicated Jumbotron mesh exists: resolve valid existing display or generate certified procedural display target.
 * 3. Dedicated World Dance Party Disco Orb generator from supported primitives/materials.
 * 4. Zero fabricated nonexistent 3D model assets.
 */

import type { DisplayTargetClass } from "./JumbotronContracts";

export interface ProceduralDisplayTargetDescriptor {
  targetId: string;
  targetClass: DisplayTargetClass;
  shape: "RECTANGLE" | "CURVED_PANEL" | "LED_RIBBON" | "CUBE_CLUSTER" | "DISCO_ORB";
  dimensions: { width: number; height: number; depth?: number; radius?: number };
  position: [number, number, number];
  rotation: [number, number, number];
  materialProfile: {
    baseColor: string;
    emissiveColor: string;
    emissiveIntensity: number;
    roughness: number;
    metalness: number;
    mirroredFacets?: number; // Used for Disco Orb
  };
  isProceduralGenerated: boolean;
}

export class ProceduralVenueVariationEngine {
  /**
   * Generates a certified procedural Jumbotron target if the venue lacks a physical modeled mesh.
   */
  public static resolveOrGenerateJumbotronTarget(
    venueId: string,
    venueClass: string,
    existingMeshes?: string[]
  ): ProceduralDisplayTargetDescriptor {
    // 1. Check if venue already carries a dedicated modeled Jumbotron mesh
    const hasExistingMesh = existingMeshes?.some((m) =>
      m.toLowerCase().includes("jumbotron")
    );

    if (hasExistingMesh) {
      return {
        targetId: `jumbotron-${venueId}-modeled`,
        targetClass: "JUMBOTRON",
        shape: "CURVED_PANEL",
        dimensions: { width: 14.0, height: 7.0, depth: 0.5 },
        position: [0, 7.5, -8.0],
        rotation: [0, 0, 0],
        materialProfile: {
          baseColor: "#050512",
          emissiveColor: "#00FFFF",
          emissiveIntensity: 1.2,
          roughness: 0.15,
          metalness: 0.85,
        },
        isProceduralGenerated: false,
      };
    }

    // 2. Otherwise, procedurally generate a certified LED Jumbotron display plane
    return {
      targetId: `jumbotron-${venueId}-procedural`,
      targetClass: "JUMBOTRON",
      shape: "RECTANGLE",
      dimensions: { width: 12.0, height: 6.0, depth: 0.2 },
      position: [0, 7.0, -7.5],
      rotation: [0, 0, 0],
      materialProfile: {
        baseColor: "#04040c",
        emissiveColor: "#00E5FF",
        emissiveIntensity: 1.5,
        roughness: 0.2,
        metalness: 0.8,
      },
      isProceduralGenerated: true,
    };
  }

  /**
   * Generates the dedicated World Dance Party Disco Orb Jumbotron.
   */
  public static generateDiscoOrbTarget(venueId: string): ProceduralDisplayTargetDescriptor {
    return {
      targetId: `disco-orb-${venueId}`,
      targetClass: "JUMBOTRON",
      shape: "DISCO_ORB",
      dimensions: { width: 4.5, height: 4.5, radius: 2.25 },
      position: [0, 8.5, 0], // Center-hung above dance floor
      rotation: [0, 0, 0],
      materialProfile: {
        baseColor: "#111122",
        emissiveColor: "#FF2DAA",
        emissiveIntensity: 2.5,
        roughness: 0.05,
        metalness: 0.98,
        mirroredFacets: 256, // 256 mirrored reflective facets
      },
      isProceduralGenerated: true,
    };
  }

  /**
   * Generates perimeter LED ribbons and rails (Curtain Rail and Stage Rail).
   */
  public static generateVenueRailTargets(venueId: string): {
    curtainRail: ProceduralDisplayTargetDescriptor;
    stageRail: ProceduralDisplayTargetDescriptor;
    venueWall: ProceduralDisplayTargetDescriptor;
  } {
    return {
      curtainRail: {
        targetId: `curtain-rail-${venueId}`,
        targetClass: "CURTAIN_RAIL",
        shape: "LED_RIBBON",
        dimensions: { width: 16.0, height: 0.8, depth: 0.1 },
        position: [0, 5.8, -4.8],
        rotation: [0, 0, 0],
        materialProfile: {
          baseColor: "#080010",
          emissiveColor: "#FFD700",
          emissiveIntensity: 2.0,
          roughness: 0.3,
          metalness: 0.7,
        },
        isProceduralGenerated: true,
      },
      stageRail: {
        targetId: `stage-rail-${venueId}`,
        targetClass: "STAGE_RAIL",
        shape: "LED_RIBBON",
        dimensions: { width: 14.0, height: 0.4, depth: 0.1 },
        position: [0, 0.2, 4.0],
        rotation: [0, 0, 0],
        materialProfile: {
          baseColor: "#020208",
          emissiveColor: "#00FFFF",
          emissiveIntensity: 1.8,
          roughness: 0.25,
          metalness: 0.75,
        },
        isProceduralGenerated: true,
      },
      venueWall: {
        targetId: `venue-wall-${venueId}`,
        targetClass: "VENUE_WALL",
        shape: "RECTANGLE",
        dimensions: { width: 22.0, height: 8.0, depth: 0.2 },
        position: [0, 4.0, -12.0],
        rotation: [0, 0, 0],
        materialProfile: {
          baseColor: "#030309",
          emissiveColor: "#AA2DFF",
          emissiveIntensity: 1.0,
          roughness: 0.4,
          metalness: 0.6,
        },
        isProceduralGenerated: true,
      },
    };
  }
}
