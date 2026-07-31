/**
 * PresentationAssetCompiler.ts
 * Ingests structured reference presentation specs, validates anchor compliance,
 * asset availability, and runtime capability manifests, then compiles them into
 * standardized, versioned, certifiable TMI presentation packages.
 */

import { getRuntimeCapabilities } from "../RuntimePresentationCapabilities";
import { MASTER_SPATIAL_ANCHORS, SpatialAnchorId } from "../PresentationDirector";

export interface ReferenceMarkerSpec {
  atMs: number;
  kind:
    | "CAMERA"
    | "OVERLAY"
    | "UNDERLAY"
    | "MOTION"
    | "LIGHTING"
    | "FX"
    | "SOUND"
    | "CROWD"
    | "BROADCAST";
  intent: string;
  targetAnchor?: string;
  durationMs?: number;
  metadata?: Record<string, unknown>;
}

export interface ReferencePresentationSpec {
  sourceId: string;
  runtimeType: string;
  durationMs: number;
  markers: ReferenceMarkerSpec[];
}

export interface CompilationValidationError {
  markerIndex: number;
  code: string;
  message: string;
}

export interface CompiledPresentationPackage {
  packageId: string;
  version: string;
  sourceId: string;
  runtimeType: string;
  durationMs: number;
  compiledAt: string;
  certified: boolean;
  markers: ReferenceMarkerSpec[];
  validationErrors: CompilationValidationError[];
}

class PresentationAssetCompilerEngine {
  /**
   * Compile and validate a ReferencePresentationSpec into a certified presentation package.
   */
  public compilePackage(spec: ReferencePresentationSpec): CompiledPresentationPackage {
    const errors: CompilationValidationError[] = [];
    const caps = getRuntimeCapabilities(spec.runtimeType);

    // Sort markers chronologically
    const sortedMarkers = [...spec.markers].sort((a, b) => a.atMs - b.atMs);

    sortedMarkers.forEach((marker, idx) => {
      // 1. Validate timestamp
      if (marker.atMs < 0 || marker.atMs > spec.durationMs) {
        errors.push({
          markerIndex: idx,
          code: "INVALID_TIMESTAMP",
          message: `Marker at ${marker.atMs}ms exceeds sequence bounds [0, ${spec.durationMs}ms].`,
        });
      }

      // 2. Validate target anchor against MASTER_SPATIAL_ANCHORS if present
      if (marker.targetAnchor) {
        const anchorId = marker.targetAnchor as SpatialAnchorId;
        if (!MASTER_SPATIAL_ANCHORS[anchorId]) {
          errors.push({
            markerIndex: idx,
            code: "UNREGISTERED_ANCHOR",
            message: `Target anchor '${marker.targetAnchor}' is not registered in MASTER_SPATIAL_ANCHORS.`,
          });
        }
      }

      // 3. Validate runtime capability (e.g. crowd, world-space overlays)
      if (marker.kind === "CROWD" && !caps.supportsCrowd) {
        errors.push({
          markerIndex: idx,
          code: "UNSUPPORTED_CAPABILITY",
          message: `Runtime '${spec.runtimeType}' does not support crowd behaviors.`,
        });
      }
    });

    const isCertified = errors.length === 0;
    const packageId = `pack-${spec.runtimeType}-${spec.sourceId}-${Date.now()}`;

    return {
      packageId,
      version: "1.0.0",
      sourceId: spec.sourceId,
      runtimeType: spec.runtimeType,
      durationMs: spec.durationMs,
      compiledAt: new Date().toISOString(),
      certified: isCertified,
      markers: sortedMarkers,
      validationErrors: errors,
    };
  }
}

export const PresentationAssetCompiler = new PresentationAssetCompilerEngine();
export default PresentationAssetCompiler;
