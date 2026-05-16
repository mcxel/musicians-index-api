/**
 * UniversalFileDecomposer — Phase 8
 * Handles decomposition of every visual file type entering the TMI ecosystem.
 * ANY visual asset becomes: decomposed / reconstructed / reusable / animated /
 * runtime-aware / authority-bound / generator-compatible.
 *
 * Supported: PNG, JPG, WEBP, PSD exports, SVG, PDF pages, layered renders,
 * sprite sheets, texture atlases, UI captures, motion stills, host renders,
 * performer renders, environment screenshots.
 *
 * Pipeline: ingest → decompose → isolate layers → build graph → bind authority
 *           → route to generators → validate
 */

import { ingestAsset } from "@/lib/vision/AssetIngestionGateway";
import { decomposeAsset } from "@/lib/vision/VisionDecompositionEngine";
import { isolateLayers } from "@/lib/vision/LayerIsolationEngine";
import { buildReconstructionGraph } from "@/lib/vision/ReconstructionGraphBuilder";
import { bindGraph } from "@/lib/vision/RuntimeAuthorityBinder";
import { routeGraph } from "@/lib/vision/GeneratorAssetRouter";
import { validateGraph } from "@/lib/vision/ReconstructionValidator";
import { tel } from "@/lib/vision/VisionTelemetryTracker";
import type { AssetFileType, AssetOwnerClass } from "@/lib/vision/AssetIngestionGateway";
import type { ValidationReport } from "@/lib/vision/ReconstructionValidator";
import type { RoutingManifest } from "@/lib/vision/GeneratorAssetRouter";
import type { BindingResult } from "@/lib/vision/RuntimeAuthorityBinder";

export type DecompositionProfile =
  | "portrait"          // avatars, performers, hosts — prioritizes face/skeletal
  | "environment"       // backgrounds, stages, venues — prioritizes geometry/lighting
  | "billboard"         // display panels, sponsor surfaces — prioritizes text/UI
  | "magazine"          // PDF pages, spreads — prioritizes layout/text/image blocks
  | "sprite"            // sprite sheets, texture atlases — prioritizes layers/regions
  | "ui"                // HUD captures, overlays — prioritizes UI elements
  | "motion"            // motion stills, captures — prioritizes motion candidates
  | "generic";          // all other types

export interface UniversalDecompositionInput {
  sourcePath: string;
  sourceUri: string;
  fileType: AssetFileType;
  ownerId: string;
  ownerClass: AssetOwnerClass;
  profile?: DecompositionProfile;
  displayName?: string;
  fileSize?: number;
  mimeType?: string;
  priority?: "critical" | "high" | "normal" | "deferred";
  metadata?: Record<string, unknown>;
}

export interface UniversalDecompositionResult {
  decompositionRunId: string;
  ingestId: string;
  assetId: string;
  fileType: AssetFileType;
  profile: DecompositionProfile;
  decompositionId: string | null;
  isolationId: string | null;
  graphId: string | null;
  bindingId: string | null;
  manifestId: string | null;
  validationReport: ValidationReport | null;
  bindingResult: BindingResult | null;
  manifest: RoutingManifest | null;
  pipelineComplete: boolean;
  errors: string[];
  startedAt: number;
  completedAt: number;
}

const FILE_TYPE_PROFILE: Record<AssetFileType, DecompositionProfile> = {
  "png":                    "generic",
  "jpg":                    "generic",
  "webp":                   "generic",
  "psd":                    "environment",
  "svg":                    "ui",
  "pdf":                    "magazine",
  "sprite-sheet":           "sprite",
  "texture-atlas":          "sprite",
  "layered-render":         "environment",
  "motion-still":           "motion",
  "host-render":            "portrait",
  "performer-render":       "portrait",
  "environment-screenshot": "environment",
  "nft-preview":            "generic",
  "ui-capture":             "ui",
  "ticket-graphic":         "billboard",
  "billboard-image":        "billboard",
  "sponsor-graphic":        "billboard",
  "fan-upload":             "generic",
  "avatar-sheet":           "portrait",
  "magazine-spread":        "magazine",
  "unknown":                "generic",
};

const PROFILE_RAW_DATA: Record<DecompositionProfile, {
  hasForegroundSubject: boolean;
  hasBackground: boolean;
  hasMotion: boolean;
  materialHints: string[];
}> = {
  "portrait":    { hasForegroundSubject: true,  hasBackground: false, hasMotion: false, materialHints: ["face", "body", "skin", "clothing", "fabric"] },
  "environment": { hasForegroundSubject: false, hasBackground: true,  hasMotion: false, materialHints: ["backdrop", "wood", "metal", "organic"] },
  "billboard":   { hasForegroundSubject: false, hasBackground: false, hasMotion: false, materialHints: ["text", "billboard", "ui"] },
  "magazine":    { hasForegroundSubject: false, hasBackground: true,  hasMotion: false, materialHints: ["text", "billboard"] },
  "sprite":      { hasForegroundSubject: true,  hasBackground: false, hasMotion: true,  materialHints: ["fabric", "skin"] },
  "ui":          { hasForegroundSubject: false, hasBackground: false, hasMotion: false, materialHints: ["ui", "hud"] },
  "motion":      { hasForegroundSubject: true,  hasBackground: true,  hasMotion: true,  materialHints: ["body", "motion", "fabric"] },
  "generic":     { hasForegroundSubject: false, hasBackground: true,  hasMotion: false, materialHints: [] },
};

let runCounter = 0;

export async function decomposeFile(
  input: UniversalDecompositionInput
): Promise<UniversalDecompositionResult> {
  const runId = `ufd_run_${++runCounter}_${Date.now()}`;
  const startedAt = Date.now();
  const errors: string[] = [];

  const profile = input.profile ?? FILE_TYPE_PROFILE[input.fileType] ?? "generic";

  // Stage A — Ingestion
  let ingestedAsset;
  try {
    ingestedAsset = ingestAsset(
      input.sourcePath,
      input.sourceUri,
      input.fileType,
      input.ownerId,
      input.ownerClass,
      {
        displayName: input.displayName,
        fileSize: input.fileSize,
        mimeType: input.mimeType,
        priority: input.priority ?? "normal",
        metadata: input.metadata,
      }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Ingestion failed";
    errors.push(`Stage A: ${msg}`);
    tel.decompositionFailed("unknown", msg);
    return {
      decompositionRunId: runId, ingestId: "failed", assetId: "failed",
      fileType: input.fileType, profile, decompositionId: null, isolationId: null,
      graphId: null, bindingId: null, manifestId: null,
      validationReport: null, bindingResult: null, manifest: null,
      pipelineComplete: false, errors, startedAt, completedAt: Date.now(),
    };
  }

  if (!ingestedAsset.authorityGranted) {
    const msg = "Authority denied at ingestion";
    errors.push(`Stage A: ${msg}`);
    tel.decompositionFailed(ingestedAsset.assetId, msg);
    return {
      decompositionRunId: runId, ingestId: ingestedAsset.ingestId, assetId: ingestedAsset.assetId,
      fileType: input.fileType, profile, decompositionId: null, isolationId: null,
      graphId: null, bindingId: null, manifestId: null,
      validationReport: null, bindingResult: null, manifest: null,
      pipelineComplete: false, errors, startedAt, completedAt: Date.now(),
    };
  }

  // Stage B — Decomposition
  const profileData = PROFILE_RAW_DATA[profile];
  let decompositionResult;
  try {
    decompositionResult = decomposeAsset(
      ingestedAsset.assetId,
      ingestedAsset.visionJobId ?? runId,
      {
        ...profileData,
        dominantColors: [],
        estimatedLayers: profile === "sprite" ? 8 : profile === "portrait" ? 5 : 3,
        boundingBoxes: [],
        depthMap: [],
        motionVectors: profileData.hasMotion ? [{ dx: 1, dy: 0, region: "foreground" }] : undefined,
      }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Decomposition failed";
    errors.push(`Stage B: ${msg}`);
    tel.decompositionFailed(ingestedAsset.assetId, msg);
    return {
      decompositionRunId: runId, ingestId: ingestedAsset.ingestId, assetId: ingestedAsset.assetId,
      fileType: input.fileType, profile, decompositionId: null, isolationId: null,
      graphId: null, bindingId: null, manifestId: null,
      validationReport: null, bindingResult: null, manifest: null,
      pipelineComplete: false, errors, startedAt, completedAt: Date.now(),
    };
  }

  // Stage B — Layer Isolation
  let isolationResult;
  try {
    isolationResult = isolateLayers(
      ingestedAsset.assetId,
      decompositionResult.decompositionId,
      decompositionResult.artifacts
    );
    errors.push(...isolationResult.errors);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Layer isolation failed";
    errors.push(`Stage B (isolation): ${msg}`);
    tel.layerGap(ingestedAsset.assetId, "all");
  }

  // Stage C — Reconstruction Graph
  let graph;
  try {
    if (isolationResult) {
      graph = buildReconstructionGraph(
        ingestedAsset.assetId,
        decompositionResult.decompositionId,
        isolationResult.layers,
        decompositionResult
      );
      errors.push(...graph.errors);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Graph build failed";
    errors.push(`Stage C: ${msg}`);
    tel.invalidReconstruction(ingestedAsset.assetId, msg);
  }

  if (!graph || !isolationResult) {
    return {
      decompositionRunId: runId, ingestId: ingestedAsset.ingestId, assetId: ingestedAsset.assetId,
      fileType: input.fileType, profile,
      decompositionId: decompositionResult.decompositionId,
      isolationId: isolationResult?.isolationId ?? null,
      graphId: null, bindingId: null, manifestId: null,
      validationReport: null, bindingResult: null, manifest: null,
      pipelineComplete: false, errors, startedAt, completedAt: Date.now(),
    };
  }

  // Stage D — Authority Binding
  let bindingResult: BindingResult;
  try {
    bindingResult = bindGraph(graph, input.ownerId, `runtime_authority_${input.ownerId}`);
    errors.push(...bindingResult.errors);
    for (const nodeId of bindingResult.failedNodeIds) {
      tel.bindingFailed(nodeId, "Authority claim denied during binding");
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Binding failed";
    errors.push(`Stage D: ${msg}`);
    tel.bindingFailed(graph.graphId, msg);
    return {
      decompositionRunId: runId, ingestId: ingestedAsset.ingestId, assetId: ingestedAsset.assetId,
      fileType: input.fileType, profile,
      decompositionId: decompositionResult.decompositionId,
      isolationId: isolationResult.isolationId,
      graphId: graph.graphId,
      bindingId: null, manifestId: null,
      validationReport: null, bindingResult: null, manifest: null,
      pipelineComplete: false, errors, startedAt, completedAt: Date.now(),
    };
  }

  // Stage E — Generator Routing
  let manifest: RoutingManifest;
  try {
    manifest = routeGraph(graph.nodes, bindingResult);
    errors.push(...manifest.errors);
    for (const route of manifest.routes.filter(r => r.status === "rejected")) {
      tel.routingRejected(route.nodeId, route.target, route.rejectionReason ?? "unknown");
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Routing failed";
    errors.push(`Stage E: ${msg}`);
    return {
      decompositionRunId: runId, ingestId: ingestedAsset.ingestId, assetId: ingestedAsset.assetId,
      fileType: input.fileType, profile,
      decompositionId: decompositionResult.decompositionId,
      isolationId: isolationResult.isolationId,
      graphId: graph.graphId, bindingId: bindingResult.bindingId,
      manifestId: null, validationReport: null, bindingResult, manifest: null,
      pipelineComplete: false, errors, startedAt, completedAt: Date.now(),
    };
  }

  // Stage G — Validation
  const validationReport = validateGraph(graph, bindingResult, manifest);

  return {
    decompositionRunId: runId,
    ingestId: ingestedAsset.ingestId,
    assetId: ingestedAsset.assetId,
    fileType: input.fileType,
    profile,
    decompositionId: decompositionResult.decompositionId,
    isolationId: isolationResult.isolationId,
    graphId: graph.graphId,
    bindingId: bindingResult.bindingId,
    manifestId: manifest.manifestId,
    validationReport,
    bindingResult,
    manifest,
    pipelineComplete: validationReport.passed && errors.filter(e => e.startsWith("Stage A") || e.startsWith("Stage B") || e.startsWith("Stage C") || e.startsWith("Stage D")).length === 0,
    errors,
    startedAt,
    completedAt: Date.now(),
  };
}

// Batch entry point for multiple files
export async function decomposeFiles(
  inputs: UniversalDecompositionInput[]
): Promise<UniversalDecompositionResult[]> {
  return Promise.all(inputs.map(decomposeFile));
}

export function getProfileForFileType(fileType: AssetFileType): DecompositionProfile {
  return FILE_TYPE_PROFILE[fileType] ?? "generic";
}
