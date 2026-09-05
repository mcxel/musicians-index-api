/**
 * JumbotronSightlineCertifier.ts — Canonical 3D Venue Sightline Certification Engine
 *
 * Laws:
 * 1. Hard Venue Law: Every occupied certified seating zone must have at least one usable Jumbotron/display sightline.
 * 2. Samples representative eye positions across tiers: Lower, Mid, Upper, Floor/GA, VIP, Side, Rear.
 * 3. Evaluates unobstructed ray, ergonomic pitch, incident angle, projected screen size.
 * 4. Auto-adjusts hang height / cant or activates auxiliary displays on failure (bounded retries).
 */

import {
  type VenueSpatialDimensions,
  type PhysicalJumbotronDescriptor,
  type SeatingTierZone,
  type JumbotronDisplayFace,
  type SightlineVerificationResult,
  type PhysicalSightlineAuditReport,
} from "./JumbotronContracts";
import { VenueJumbotronPlacementResolver } from "./VenueJumbotronPlacementResolver";

export class JumbotronSightlineCertifier {
  public static evaluateSightline(
    eyePos: [number, number, number],
    face: JumbotronDisplayFace,
    ceilingElevationMeters: number
  ): {
    pitchAngleDegrees: number;
    incidentAngleDegrees: number;
    projectedScreenRatio: number;
    isUnobstructed: boolean;
    passed: boolean;
    reason?: string;
  } {
    const dx = face.centerPosition[0] - eyePos[0];
    const dy = face.centerPosition[1] - eyePos[1];
    const dz = face.centerPosition[2] - eyePos[2];
    const horizontalDist = Math.sqrt(dx * dx + dz * dz);
    const rayDist = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (rayDist <= 0.1) {
      return {
        pitchAngleDegrees: 0,
        incidentAngleDegrees: 0,
        projectedScreenRatio: 1.0,
        isUnobstructed: true,
        passed: true,
      };
    }

    const pitchAngleRad = Math.atan2(dy, Math.max(0.1, horizontalDist));
    const pitchAngleDegrees = (pitchAngleRad * 180) / Math.PI;

    const rayToEye = [-dx / rayDist, -dy / rayDist, -dz / rayDist];
    const [nx, ny, nz] = face.normalVector;
    const normalLen = Math.sqrt(nx * nx + ny * ny + nz * nz);
    let dot = 0;
    if (normalLen > 0) {
      dot = (rayToEye[0] * nx + rayToEye[1] * ny + rayToEye[2] * nz) / normalLen;
    }
    const clampedDot = Math.max(-1.0, Math.min(1.0, dot));
    const incidentAngleRad = Math.acos(Math.max(0, clampedDot));
    const incidentAngleDegrees = (incidentAngleRad * 180) / Math.PI;

    const angularWidthRad = 2 * Math.atan2(face.widthMeters / 2, rayDist);
    const projectedScreenRatio = (angularWidthRad * 180) / Math.PI / 30.0;

    const midRayY = eyePos[1] + dy * 0.5;
    const isUnobstructed = midRayY < ceilingElevationMeters - 0.5;

    const isFacingFace = dot > 0.05 && incidentAngleDegrees <= 85;
    const isErgonomicPitch = pitchAngleDegrees >= -25.0 && pitchAngleDegrees <= 70.0;
    const isLegible = projectedScreenRatio >= 0.08;

    const passed = isFacingFace && isErgonomicPitch && isLegible && isUnobstructed;

    let reason: string | undefined;
    if (!isFacingFace) reason = `Face oriented away (incident angle: ${incidentAngleDegrees.toFixed(1)}°)`;
    else if (!isErgonomicPitch) reason = `Pitch angle outside comfortable range (${pitchAngleDegrees.toFixed(1)}°)`;
    else if (!isLegible) reason = `Screen too distant (ratio: ${projectedScreenRatio.toFixed(2)})`;
    else if (!isUnobstructed) reason = "Occluded by ceiling/rigging envelope";

    return {
      pitchAngleDegrees,
      incidentAngleDegrees,
      projectedScreenRatio,
      isUnobstructed,
      passed,
      reason,
    };
  }

  public static findBestVisibleFace(
    eyePos: [number, number, number],
    jumbotron: PhysicalJumbotronDescriptor,
    ceilingElevationMeters: number
  ): SightlineVerificationResult {
    let bestResult: SightlineVerificationResult | null = null;
    let bestScore = -Infinity;

    for (const face of jumbotron.faces) {
      const evalResult = JumbotronSightlineCertifier.evaluateSightline(
        eyePos,
        face,
        ceilingElevationMeters
      );

      let score = 0;
      if (evalResult.passed) {
        score = 100 - evalResult.incidentAngleDegrees + evalResult.projectedScreenRatio * 20;
      } else if (evalResult.isUnobstructed && evalResult.pitchAngleDegrees > 0) {
        score = -evalResult.incidentAngleDegrees;
      } else {
        score = -1000;
      }

      if (score > bestScore) {
        bestScore = score;
        bestResult = {
          tierId: "",
          tierClass: "FLOOR_GA",
          eyePosition: eyePos,
          bestVisibleFace: face,
          isUnobstructed: evalResult.isUnobstructed,
          pitchAngleDegrees: evalResult.pitchAngleDegrees,
          incidentAngleDegrees: evalResult.incidentAngleDegrees,
          projectedScreenRatio: evalResult.projectedScreenRatio,
          passed: evalResult.passed,
          failureReason: evalResult.reason,
        };
      }
    }

    return bestResult!;
  }

  private static evaluateAllTiers(
    dimensions: VenueSpatialDimensions,
    jumbotron: PhysicalJumbotronDescriptor,
    seatingTiers: SeatingTierZone[]
  ): {
    tierResults: SightlineVerificationResult[];
    failedCount: number;
    passedCount: number;
    failedQuadrants: Array<"NORTH" | "SOUTH" | "EAST" | "WEST">;
  } {
    const tierResults: SightlineVerificationResult[] = [];
    let failedCount = 0;
    let passedCount = 0;
    const failedQuadrants = new Set<"NORTH" | "SOUTH" | "EAST" | "WEST">();

    for (const tier of seatingTiers) {
      let tierPassed = false;
      let representativeResult: SightlineVerificationResult | null = null;

      for (const eyePos of tier.representativeEyePositions) {
        const res = JumbotronSightlineCertifier.findBestVisibleFace(
          eyePos,
          jumbotron,
          dimensions.ceilingElevationMeters
        );
        res.tierId = tier.tierId;
        res.tierClass = tier.tierClass;

        if (res.passed) {
          tierPassed = true;
          representativeResult = res;
          break;
        } else if (!representativeResult) {
          representativeResult = res;
        }
      }

      if (tierPassed && representativeResult) {
        tierResults.push(representativeResult);
        passedCount++;
      } else if (representativeResult) {
        tierResults.push(representativeResult);
        failedCount++;
        if (tier.quadrant !== "CENTER") {
          failedQuadrants.add(tier.quadrant);
        } else {
          failedQuadrants.add("SOUTH");
        }
      }
    }

    return {
      tierResults,
      failedCount,
      passedCount,
      failedQuadrants: Array.from(failedQuadrants),
    };
  }

  /**
   * Certifies every occupied seating tier has ≥1 valid sightline.
   * Bounded auto-tune (hang height / cant) then auxiliary displays — no infinite recursion.
   */
  public static certifyVenueSightlines(
    dimensions: VenueSpatialDimensions,
    jumbotron: PhysicalJumbotronDescriptor,
    seatingTiers: SeatingTierZone[],
    attempt = 0
  ): PhysicalSightlineAuditReport {
    const MAX_ATTEMPTS = 2;
    const evaluation = JumbotronSightlineCertifier.evaluateAllTiers(
      dimensions,
      jumbotron,
      seatingTiers
    );

    if (evaluation.failedCount > 0 && attempt < MAX_ATTEMPTS) {
      if (dimensions.venueEnvironment === "INDOOR_ARENA" && attempt === 0) {
        const adjustedCenterY = Math.max(
          dimensions.floorElevationMeters + jumbotron.dimensions.heightMeters / 2 + 6.5,
          jumbotron.centerPosition[1] - 0.8
        );
        jumbotron.centerPosition[1] = adjustedCenterY;
        for (const face of jumbotron.faces) {
          // Keep relative face offsets on Y for bottom ring / ribbon; primary faces share center Y.
          if (
            face.orientation === "NORTH" ||
            face.orientation === "SOUTH" ||
            face.orientation === "EAST" ||
            face.orientation === "WEST"
          ) {
            face.centerPosition[1] = adjustedCenterY;
            face.cantAngleDegrees = 10.0;
          } else if (face.orientation === "BOTTOM_RING") {
            face.centerPosition[1] = adjustedCenterY - jumbotron.dimensions.heightMeters / 2;
          } else if (face.orientation === "UPPER_RIBBON") {
            face.centerPosition[1] = adjustedCenterY + jumbotron.dimensions.heightMeters / 2;
          }
        }
        jumbotron.safeRiggingElevationMeters =
          adjustedCenterY + jumbotron.dimensions.heightMeters / 2;
        jumbotron.bottomClearanceMeters =
          adjustedCenterY - jumbotron.dimensions.heightMeters / 2 - dimensions.floorElevationMeters;

        return JumbotronSightlineCertifier.certifyVenueSightlines(
          dimensions,
          jumbotron,
          seatingTiers,
          attempt + 1
        );
      }

      // Second pass / non-arena: activate auxiliary wall displays for failed quadrants
      const withAux = VenueJumbotronPlacementResolver.activateAuxiliaryDisplays(
        dimensions,
        jumbotron,
        evaluation.failedQuadrants
      );
      Object.assign(jumbotron, withAux);

      return JumbotronSightlineCertifier.certifyVenueSightlines(
        dimensions,
        jumbotron,
        seatingTiers,
        attempt + 1
      );
    }

    return {
      venueId: dimensions.venueId,
      environment: dimensions.venueEnvironment,
      jumbotronArchitecture: jumbotron.architecture,
      totalSampledZones: seatingTiers.length,
      passedZones: evaluation.passedCount,
      failedZones: evaluation.failedCount,
      tierResults: evaluation.tierResults,
      certifiedSightlinesAllOccupiedZones: evaluation.failedCount === 0,
    };
  }
}
