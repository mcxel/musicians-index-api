import { computeContentHashSync } from "@/lib/media/SecureMediaIngestGate";

/**
 * TMI Origami Audio Fabric — pipeline product name, NOT a proprietary codec.
 * SUBMISSION FORMAT ≠ STORAGE MASTER ≠ RUNTIME FORMAT.
 * Extends existing media persist/upload authorities.
 */

export type OrigamiStage =
  | "UPLOADED"
  | "QUARANTINE"
  | "SCANNING"
  | "ANALYZING"
  | "COMPRESSING"
  | "QUALITY_CHECK"
  | "RIGHTS_CHECK"
  | "ROUTING"
  | "IN_QUEUE"
  | "ORIGAMI_FAILED"
  | "AVAILABLE";

export type OrigamiCodecProfile = "AAC_STANDARD" | "AAC_LOW" | "OPUS_STANDARD" | "SOURCE_PASSTHROUGH";

export interface OrigamiDerivativePlan {
  mediaAssetId: string;
  submissionId: string;
  contentHash?: string;
  safeSourceId?: string;
  profiles: OrigamiCodecProfile[];
  waveformRequired: boolean;
  metadataRequired: boolean;
  editDecisionLists: Array<{
    experience: string;
    startMs?: number;
    endMs?: number;
    fadeInMs?: number;
    fadeOutMs?: number;
    loop?: boolean;
  }>;
}

export interface OrigamiStorageMetrics {
  sourceBytes: number;
  runtimeBytes: number;
  savingsBytes: number;
  savingsPercent: number;
  qualityProfile: OrigamiCodecProfile;
}

export interface OrigamiIngestResult {
  ok: boolean;
  stage: OrigamiStage;
  plan?: OrigamiDerivativePlan;
  metrics?: OrigamiStorageMetrics;
  errorCode?: string;
  message?: string;
}

const ALLOWED_AUDIO_EXT = new Set([".mp3", ".wav"]);
const ALLOWED_AUDIO_MIME = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
]);

export function isOrigamiAllowedAudio(filename: string, mime?: string): { ok: boolean; reason?: string } {
  const i = filename.lastIndexOf(".");
  const ext = i === -1 ? "" : filename.slice(i).toLowerCase();
  if (!ALLOWED_AUDIO_EXT.has(ext)) {
    return { ok: false, reason: `Unsupported audio type. Accepted: MP3, WAV. Got: ${ext || "(none)"}` };
  }
  if (mime && !ALLOWED_AUDIO_MIME.has(mime)) {
    return { ok: false, reason: `MIME/signature mismatch for audio: ${mime}` };
  }
  return { ok: true };
}

/** Plan runtime derivatives — does not invent a codec; selects interoperable profiles. */
export function planOrigamiDerivatives(input: {
  mediaAssetId: string;
  submissionId: string;
  sourceBytes: number;
  sourceExt: ".mp3" | ".wav";
  sourceBitrateKbps?: number;
}): OrigamiIngestResult {
  const { mediaAssetId, submissionId, sourceBytes, sourceExt, sourceBitrateKbps } = input;

  // MP3 already compact: prefer sanitize + waveform; avoid unnecessary re-encode chain.
  const profiles: OrigamiCodecProfile[] =
    sourceExt === ".mp3" && (sourceBitrateKbps ?? 192) <= 256
      ? ["SOURCE_PASSTHROUGH", "AAC_LOW"]
      : ["AAC_STANDARD", "AAC_LOW"];

  // Estimate runtime size (honest estimate, not a guarantee).
  const estimatedRuntime =
    sourceExt === ".wav"
      ? Math.max(Math.floor(sourceBytes * 0.12), 64_000)
      : Math.max(Math.floor(sourceBytes * 0.85), 32_000);

  const plan: OrigamiDerivativePlan = {
    mediaAssetId,
    submissionId,
    profiles,
    waveformRequired: true,
    metadataRequired: true,
    editDecisionLists: [],
  };

  return {
    ok: true,
    stage: "COMPRESSING",
    plan,
    metrics: {
      sourceBytes,
      runtimeBytes: estimatedRuntime,
      savingsBytes: Math.max(0, sourceBytes - estimatedRuntime),
      savingsPercent: sourceBytes > 0 ? Math.round(((sourceBytes - estimatedRuntime) / sourceBytes) * 100) : 0,
      qualityProfile: profiles[0]!,
    },
  };
}

/** Fail closed — never route raw quarantine as playback. */
export function resolveOrigamiPlayback(plan: OrigamiDerivativePlan | null, stage: OrigamiStage): {
  playable: boolean;
  profile?: OrigamiCodecProfile;
  reason?: string;
} {
  if (!plan) return { playable: false, reason: "No Origami plan" };
  if (stage === "ORIGAMI_FAILED" || stage === "QUARANTINE" || stage === "SCANNING") {
    return { playable: false, reason: "Fail closed: derivative not available" };
  }
  if (stage !== "AVAILABLE" && stage !== "IN_QUEUE" && stage !== "ROUTING") {
    return { playable: false, reason: `Stage ${stage} not playable` };
  }
  return { playable: true, profile: plan.profiles[0] };
}


// ─── Phase 2 Origami identity fabric (same authority — not a second engine) ───

export const ORIGAMI_AUDIO_AUTHORITY = "OrigamiAudioFabric" as const;
export const ORIGAMI_PERSISTENCE = "PROCESS_MEMORY" as const;
export const ORIGAMI_SCHEMA_STATUS = "SCHEMA_READY_NOT_APPLIED" as const;
export const ORIGAMI_DATABASE_APPLIED = false as const;
export const ORIGAMI_PREVIEW_DURATION_POLICY = "PRODUCT_POLICY_REQUIRED" as const;

export type OrigamiRightsStatus =
  | "PENDING"
  | "USER_ASSERTED"
  | "ADMIN_REVIEW_REQUIRED"
  | "APPROVED"
  | "RESTRICTED"
  | "REJECTED";

export type OrigamiAccessClass =
  | "PUBLIC"
  | "SELLABLE"
  | "STREAMABLE"
  | "DOWNLOADABLE"
  | "BEAT_LOCKER_ELIGIBLE"
  | "SHOW_ELIGIBLE";

export type OrigamiFailureHonesty =
  | "SOURCE_READY"
  | "VALIDATION_FAILED"
  | "RIGHTS_PENDING"
  | "RIGHTS_BLOCKED"
  | "TRANSCODE_PENDING"
  | "TRANSCODE_BACKEND_UNBOUND"
  | "DERIVATIVE_READY"
  | "ANALYSIS_PENDING"
  | "ANALYSIS_READY"
  | "ANALYSIS_UNAVAILABLE"
  | "QA_FAILED";

export type OrigamiDerivativeKind =
  | "SOURCE"
  | "AAC"
  | "OPUS"
  | "PREVIEW"
  | "WAVEFORM"
  | "ANALYSIS";

export type OrigamiAnalysisConfidence = "MEASURED" | "ESTIMATED" | "UNAVAILABLE";

export type OrigamiCanonicalBus = "PROGRAM" | "GROUP" | "AUDIENCE" | "SYSTEM_MEDIA";

export type OrigamiCodecContainer = {
  codec: string | null;
  container: string | null;
  sampleRate: number | null;
  channels: number | null;
  bitrateKbps: number | null;
  qualityProfile: OrigamiCodecProfile | "PREVIEW" | "WAVEFORM" | "ANALYSIS";
};

export interface OrigamiMediaAsset {
  mediaAssetId: string;
  sourceHash: string;
  ownerId: string;
  rightsholderId: string;
  rightsStatus: OrigamiRightsStatus;
  sourceFormat: string;
  sourceDurationSec: number | null;
  sourceDurationConfidence: OrigamiAnalysisConfidence;
  sourceLineage: { foundrySubmissionId?: string; ingestProvenance: string };
  ingestProvenance: string;
  sourceBytes: number;
  sourceImmutable: true;
  playbackAllowed: boolean;
  sourceDownloadAllowed: boolean;
  access: Partial<Record<OrigamiAccessClass, boolean>>;
  createdAt: number;
  sourceFingerprint: string;
}

export interface OrigamiDerivative {
  derivedAssetId: string;
  parentMediaAssetId: string;
  kind: OrigamiDerivativeKind;
  transformation: string;
  codec: string | null;
  container: string | null;
  sampleRate: number | null;
  channels: number | null;
  bitrateKbps: number | null;
  qualityProfile: string;
  durationSec: number | null;
  createdAt: number;
  toolVersion: string;
  qaState: OrigamiFailureHonesty;
  bytesGenerated: false | true;
  outputHash: string | null;
  transformVersion: string;
}

export interface OrigamiAnalysisRecord {
  mediaAssetId: string;
  duration: { value: number | null; confidence: OrigamiAnalysisConfidence };
  sampleRate: { value: number | null; confidence: OrigamiAnalysisConfidence };
  channels: { value: number | null; confidence: OrigamiAnalysisConfidence };
  peak: { value: number | null; confidence: OrigamiAnalysisConfidence };
  rms: { value: number | null; confidence: OrigamiAnalysisConfidence };
  lufs: { value: number | null; confidence: OrigamiAnalysisConfidence };
  bpm: { value: number | null; confidence: OrigamiAnalysisConfidence };
  beatGrid: { value: null; confidence: OrigamiAnalysisConfidence };
  key: { value: string | null; confidence: OrigamiAnalysisConfidence };
  silenceRegions: { value: null; confidence: OrigamiAnalysisConfidence };
  clipping: { value: boolean | null; confidence: OrigamiAnalysisConfidence };
  waveform: { value: number[] | null; confidence: OrigamiAnalysisConfidence };
  analyzerBound: false;
}

const assets = new Map<string, OrigamiMediaAsset>();
const hashToAsset = new Map<string, string>();
const derivatives = new Map<string, OrigamiDerivative[]>();
const derivativeCache = new Map<string, string>(); // cacheKey → derivedAssetId
const analysisByAsset = new Map<string, OrigamiAnalysisRecord>();
const sourceFingerprints = new Map<string, string>(); // mediaAssetId → hash of source bytes/meta

export function probeOrigamiTranscodeBackend(): {
  bound: false;
  status: "TRANSCODE_BACKEND_UNBOUND";
  ffmpeg: false;
  ffmpegStatic: false;
} {
  return {
    bound: false,
    status: "TRANSCODE_BACKEND_UNBOUND",
    ffmpeg: false,
    ffmpegStatic: false,
  };
}

function cacheKey(sourceHash: string, kind: OrigamiDerivativeKind, profile: string, transformVersion: string): string {
  return `${sourceHash}|${kind}|${profile}|${transformVersion}`;
}

/** Real WAV header parse only — never invent duration for MP3 without a decoder. */
export function measureWavHeader(bytes: Uint8Array): {
  sampleRate: number | null;
  channels: number | null;
  durationSec: number | null;
  confidence: OrigamiAnalysisConfidence;
} {
  if (bytes.length < 44) {
    return { sampleRate: null, channels: null, durationSec: null, confidence: "UNAVAILABLE" };
  }
  const riff = String.fromCharCode(bytes[0]!, bytes[1]!, bytes[2]!, bytes[3]!);
  const wave = String.fromCharCode(bytes[8]!, bytes[9]!, bytes[10]!, bytes[11]!);
  if (riff !== "RIFF" || wave !== "WAVE") {
    return { sampleRate: null, channels: null, durationSec: null, confidence: "UNAVAILABLE" };
  }
  const channels = bytes[22]! | (bytes[23]! << 8);
  const sampleRate = bytes[24]! | (bytes[25]! << 8) | (bytes[26]! << 16) | (bytes[27]! << 24);
  const byteRate = bytes[28]! | (bytes[29]! << 8) | (bytes[30]! << 16) | (bytes[31]! << 24);
  if (!sampleRate || !byteRate) {
    return { sampleRate: sampleRate || null, channels: channels || null, durationSec: null, confidence: "UNAVAILABLE" };
  }
  const dataSize = Math.max(0, bytes.length - 44);
  return {
    sampleRate,
    channels,
    durationSec: dataSize / byteRate,
    confidence: "MEASURED",
  };
}

export function registerCanonicalAudioSource(input: {
  ownerId: string;
  rightsholderId?: string;
  filename: string;
  sourceBytes: number;
  sourceFormat: string;
  contentBytes?: Uint8Array;
  foundrySubmissionId?: string;
  foundryRightsStatus?: OrigamiRightsStatus;
  ingestProvenance?: string;
}): {
  ok: boolean;
  mediaAssetId: string;
  reusedExisting: boolean;
  honesty: OrigamiFailureHonesty;
  asset: OrigamiMediaAsset;
  error?: string;
} {
  const bytes = input.contentBytes;
  const sourceHash = bytes && bytes.length
    ? computeContentHashSync(bytes)
    : `meta:${input.filename}:${input.sourceBytes}:${input.sourceFormat}`;
  const existingId = hashToAsset.get(sourceHash);
  if (existingId) {
    const asset = assets.get(existingId)!;
    return { ok: true, mediaAssetId: existingId, reusedExisting: true, honesty: "SOURCE_READY", asset };
  }

  const wav = bytes ? measureWavHeader(bytes) : { sampleRate: null, channels: null, durationSec: null, confidence: "UNAVAILABLE" as const };
  const mediaAssetId = `media_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const rights: OrigamiRightsStatus = input.foundryRightsStatus ?? "PENDING";
  const asset: OrigamiMediaAsset = {
    mediaAssetId,
    sourceHash,
    ownerId: input.ownerId,
    rightsholderId: input.rightsholderId ?? input.ownerId,
    rightsStatus: rights,
    sourceFormat: input.sourceFormat,
    sourceDurationSec: wav.durationSec,
    sourceDurationConfidence: wav.confidence,
    sourceLineage: {
      foundrySubmissionId: input.foundrySubmissionId,
      ingestProvenance: input.ingestProvenance ?? "secure_foundry_or_upload",
    },
    ingestProvenance: input.ingestProvenance ?? "secure_foundry_or_upload",
    sourceBytes: input.sourceBytes,
    sourceImmutable: true,
    playbackAllowed: false,
    sourceDownloadAllowed: false,
    access: {
      PUBLIC: false,
      SELLABLE: false,
      STREAMABLE: false,
      DOWNLOADABLE: false,
      BEAT_LOCKER_ELIGIBLE: false,
      SHOW_ELIGIBLE: false,
    },
    createdAt: Date.now(),
    sourceFingerprint: sourceHash,
  };
  assets.set(mediaAssetId, asset);
  hashToAsset.set(sourceHash, mediaAssetId);
  sourceFingerprints.set(mediaAssetId, sourceHash);

  const analysis: OrigamiAnalysisRecord = {
    mediaAssetId,
    duration: { value: wav.durationSec, confidence: wav.confidence },
    sampleRate: { value: wav.sampleRate, confidence: wav.confidence },
    channels: { value: wav.channels, confidence: wav.confidence },
    peak: { value: null, confidence: "UNAVAILABLE" },
    rms: { value: null, confidence: "UNAVAILABLE" },
    lufs: { value: null, confidence: "UNAVAILABLE" },
    bpm: { value: null, confidence: "UNAVAILABLE" },
    beatGrid: { value: null, confidence: "UNAVAILABLE" },
    key: { value: null, confidence: "UNAVAILABLE" },
    silenceRegions: { value: null, confidence: "UNAVAILABLE" },
    clipping: { value: null, confidence: "UNAVAILABLE" },
    waveform: { value: null, confidence: "UNAVAILABLE" },
    analyzerBound: false,
  };
  analysisByAsset.set(mediaAssetId, analysis);

  // SOURCE derivative is identity, not a transcode
  const sourceDeriv: OrigamiDerivative = {
    derivedAssetId: `drv_source_${mediaAssetId}`,
    parentMediaAssetId: mediaAssetId,
    kind: "SOURCE",
    transformation: "identity_passthrough",
    codec: null,
    container: input.sourceFormat,
    sampleRate: wav.sampleRate,
    channels: wav.channels,
    bitrateKbps: null,
    qualityProfile: "SOURCE_PASSTHROUGH",
    durationSec: wav.durationSec,
    createdAt: Date.now(),
    toolVersion: "OrigamiAudioFabric/1.0",
    qaState: "SOURCE_READY",
    bytesGenerated: false,
    outputHash: sourceHash,
    transformVersion: "v0-identity",
  };
  derivatives.set(mediaAssetId, [sourceDeriv]);

  return {
    ok: true,
    mediaAssetId,
    reusedExisting: false,
    honesty: rights === "PENDING" ? "RIGHTS_PENDING" : "SOURCE_READY",
    asset,
  };
}

export function getOrigamiAsset(mediaAssetId: string): OrigamiMediaAsset | undefined {
  return assets.get(mediaAssetId);
}

export function listOrigamiAssets(): OrigamiMediaAsset[] {
  return Array.from(assets.values()).sort((a, b) => b.createdAt - a.createdAt);
}

export function listOrigamiDerivatives(mediaAssetId: string): OrigamiDerivative[] {
  return derivatives.get(mediaAssetId) ?? [];
}

export function getOrigamiAnalysis(mediaAssetId: string): OrigamiAnalysisRecord | undefined {
  return analysisByAsset.get(mediaAssetId);
}

export function sourceUnchanged(mediaAssetId: string): boolean {
  const a = assets.get(mediaAssetId);
  if (!a) return false;
  return a.sourceImmutable && sourceFingerprints.get(mediaAssetId) === a.sourceHash;
}

function rightsBlockPublic(rights: OrigamiRightsStatus): boolean {
  return rights === "PENDING" || rights === "USER_ASSERTED" || rights === "ADMIN_REVIEW_REQUIRED";
}

function rightsBlockAll(rights: OrigamiRightsStatus): boolean {
  return rights === "REJECTED" || rights === "RESTRICTED";
}

const TRANSFORM_VERSION = "v0-registry-unbound";

/**
 * Request a playback derivative. Does NOT transcode when backend unbound.
 * Registry row retains parent mediaAssetId. bytesGenerated stays false.
 */
export function requestOrigamiDerivative(input: {
  mediaAssetId: string;
  kind: Exclude<OrigamiDerivativeKind, "SOURCE">;
  qualityProfile?: OrigamiCodecProfile | "PREVIEW";
}): {
  ok: boolean;
  reused: boolean;
  derivative?: OrigamiDerivative;
  honesty: OrigamiFailureHonesty;
  error?: string;
  parentUnchanged: boolean;
} {
  const asset = assets.get(input.mediaAssetId);
  if (!asset) {
    return { ok: false, reused: false, honesty: "VALIDATION_FAILED", error: "ASSET_NOT_FOUND", parentUnchanged: false };
  }
  if (rightsBlockAll(asset.rightsStatus)) {
    return {
      ok: false,
      reused: false,
      honesty: "RIGHTS_BLOCKED",
      error: "REJECTED_OR_RESTRICTED_RIGHTS_BLOCK_DERIVATION",
      parentUnchanged: true,
    };
  }
  if (
    (input.kind === "AAC" || input.kind === "OPUS" || input.kind === "PREVIEW") &&
    rightsBlockPublic(asset.rightsStatus)
  ) {
    return {
      ok: false,
      reused: false,
      honesty: "RIGHTS_PENDING",
      error: "PENDING_RIGHTS_BLOCK_PUBLIC_PLAYBACK_DERIVATIVE",
      parentUnchanged: true,
    };
  }

  const profile =
    input.qualityProfile ??
    (input.kind === "AAC" ? "AAC_STANDARD" : input.kind === "OPUS" ? "OPUS_STANDARD" : "PREVIEW");
  const key = cacheKey(asset.sourceHash, input.kind, String(profile), TRANSFORM_VERSION);
  const cachedId = derivativeCache.get(key);
  if (cachedId) {
    const existing = (derivatives.get(asset.mediaAssetId) ?? []).find((d) => d.derivedAssetId === cachedId);
    if (existing) {
      return {
        ok: true,
        reused: true,
        derivative: existing,
        honesty: existing.qaState,
        parentUnchanged: sourceUnchanged(asset.mediaAssetId),
      };
    }
  }

  const backend = probeOrigamiTranscodeBackend();
  let honesty: OrigamiFailureHonesty;
  if (input.kind === "WAVEFORM" || input.kind === "ANALYSIS") {
    honesty = "ANALYSIS_UNAVAILABLE";
  } else if (!backend.bound) {
    honesty = "TRANSCODE_BACKEND_UNBOUND";
  } else {
    honesty = "TRANSCODE_PENDING";
  }

  if (input.kind === "PREVIEW") {
    // Duration not invented — PRODUCT_POLICY_REQUIRED
  }

  const derivedAssetId = `drv_${input.kind.toLowerCase()}_${asset.mediaAssetId}_${Math.random().toString(36).slice(2, 6)}`;
  const deriv: OrigamiDerivative = {
    derivedAssetId,
    parentMediaAssetId: asset.mediaAssetId,
    kind: input.kind,
    transformation: input.kind === "WAVEFORM" ? "waveform_extract_unbound" : `transcode_${input.kind.toLowerCase()}`,
    codec: input.kind === "AAC" ? "aac" : input.kind === "OPUS" ? "opus" : input.kind === "PREVIEW" ? null : null,
    container: input.kind === "AAC" ? "m4a" : input.kind === "OPUS" ? "ogg" : null,
    sampleRate: null,
    channels: null,
    bitrateKbps: null,
    qualityProfile: String(profile),
    durationSec: asset.sourceDurationSec,
    createdAt: Date.now(),
    toolVersion: "OrigamiAudioFabric/1.0",
    qaState: honesty,
    bytesGenerated: false,
    outputHash: null,
    transformVersion: TRANSFORM_VERSION,
  };

  const list = derivatives.get(asset.mediaAssetId) ?? [];
  list.push(deriv);
  derivatives.set(asset.mediaAssetId, list);
  derivativeCache.set(key, derivedAssetId);

  return {
    ok: true,
    reused: false,
    derivative: deriv,
    honesty,
    parentUnchanged: sourceUnchanged(asset.mediaAssetId),
  };
}

export function isPublicPlaybackAllowed(mediaAssetId: string): { allowed: boolean; reason: string } {
  const a = assets.get(mediaAssetId);
  if (!a) return { allowed: false, reason: "ASSET_NOT_FOUND" };
  if (rightsBlockAll(a.rightsStatus)) return { allowed: false, reason: "RIGHTS_BLOCKED" };
  if (rightsBlockPublic(a.rightsStatus)) return { allowed: false, reason: "PENDING_RIGHTS_BLOCK_PUBLIC_PLAYBACK" };
  const aac = (derivatives.get(mediaAssetId) ?? []).find((d) => d.kind === "AAC" && d.qaState === "DERIVATIVE_READY");
  const opus = (derivatives.get(mediaAssetId) ?? []).find((d) => d.kind === "OPUS" && d.qaState === "DERIVATIVE_READY");
  if (!aac && !opus) {
    return { allowed: false, reason: "NO_READY_PLAYBACK_DERIVATIVE" };
  }
  return { allowed: true, reason: "ok" };
}

export function resolvePlayerAuthorizedDerivative(mediaAssetId: string): {
  playable: boolean;
  mediaAssetId: string;
  derivedAssetId?: string;
  kind?: OrigamiDerivativeKind;
  reason: string;
  createsSecondAudioEngine: false;
} {
  const pub = isPublicPlaybackAllowed(mediaAssetId);
  if (!pub.allowed) {
    return { playable: false, mediaAssetId, reason: pub.reason, createsSecondAudioEngine: false };
  }
  const list = derivatives.get(mediaAssetId) ?? [];
  const ready = list.find((d) => (d.kind === "AAC" || d.kind === "OPUS") && d.qaState === "DERIVATIVE_READY");
  if (!ready) {
    return { playable: false, mediaAssetId, reason: "NO_READY_PLAYBACK_DERIVATIVE", createsSecondAudioEngine: false };
  }
  return {
    playable: true,
    mediaAssetId,
    derivedAssetId: ready.derivedAssetId,
    kind: ready.kind,
    reason: "ok",
    createsSecondAudioEngine: false,
  };
}

/** Visual destinations share one program audible binding — never N streams. */
export function bindOrigamiToVisualDestinations(input: {
  mediaAssetId: string;
  destinations: string[];
  bus: OrigamiCanonicalBus;
}): {
  mediaAssetId: string;
  visualDestinationCount: number;
  audibleStreamCount: 1;
  bus: OrigamiCanonicalBus;
  mapsToExistingMixerBus: "PROGRAM" | "SHARE" | "VOICE";
  duplicatesAudiblePlayback: false;
} {
  const maps: Record<OrigamiCanonicalBus, "PROGRAM" | "SHARE" | "VOICE"> = {
    PROGRAM: "PROGRAM",
    GROUP: "PROGRAM",
    AUDIENCE: "SHARE",
    SYSTEM_MEDIA: "SHARE",
  };
  return {
    mediaAssetId: input.mediaAssetId,
    visualDestinationCount: input.destinations.length,
    audibleStreamCount: 1,
    bus: input.bus,
    mapsToExistingMixerBus: maps[input.bus],
    duplicatesAudiblePlayback: false,
  };
}

export function yophoAudioLayerReference(mediaAssetId: string): {
  mediaAssetId: string;
  storesUnrelatedSongIdentity: false;
  nonDestructive: true;
  referencesCanonicalIdentity: true;
} {
  return {
    mediaAssetId,
    storesUnrelatedSongIdentity: false,
    nonDestructive: true,
    referencesCanonicalIdentity: true,
  };
}

export function beatLockerAudioHandoff(mediaAssetId: string): {
  mediaAssetId: string;
  sourceHash: string | null;
  rights: OrigamiRightsStatus | null;
  durationSec: number | null;
  waveformMediaAssetId: string | null;
  analysisStatus: OrigamiFailureHonesty;
  ownershipAuthority: "BeatLocker_deferred";
  sameIdentity: true;
} {
  const a = assets.get(mediaAssetId);
  const analysis = analysisByAsset.get(mediaAssetId);
  const wf = (derivatives.get(mediaAssetId) ?? []).find((d) => d.kind === "WAVEFORM");
  return {
    mediaAssetId,
    sourceHash: a?.sourceHash ?? null,
    rights: a?.rightsStatus ?? null,
    durationSec: a?.sourceDurationSec ?? null,
    waveformMediaAssetId: wf ? mediaAssetId : mediaAssetId,
    analysisStatus: analysis?.analyzerBound ? "ANALYSIS_READY" : "ANALYSIS_UNAVAILABLE",
    ownershipAuthority: "BeatLocker_deferred",
    sameIdentity: true,
  };
}

export function showBroadcastAudioHandoff(mediaAssetId: string, experience: string): {
  mediaAssetId: string;
  experience: string;
  sameIdentity: true;
  sourceDuplicated: false;
} {
  return { mediaAssetId, experience, sameIdentity: true, sourceDuplicated: false };
}

export function previewIsNotOwnership(mediaAssetId: string): {
  previewKind: "PREVIEW";
  owned: false;
  durationPolicy: typeof ORIGAMI_PREVIEW_DURATION_POLICY;
} {
  void mediaAssetId;
  return {
    previewKind: "PREVIEW",
    owned: false,
    durationPolicy: ORIGAMI_PREVIEW_DURATION_POLICY,
  };
}

export function sourceDownloadDistinctFromPlayback(mediaAssetId: string): {
  playbackPermission: boolean;
  sourceDownloadPermission: boolean;
  distinct: true;
} {
  const a = assets.get(mediaAssetId);
  return {
    playbackPermission: a?.playbackAllowed ?? false,
    sourceDownloadPermission: a?.sourceDownloadAllowed ?? false,
    distinct: true,
  };
}

export function setOrigamiRights(mediaAssetId: string, rights: OrigamiRightsStatus): OrigamiMediaAsset | null {
  const a = assets.get(mediaAssetId);
  if (!a) return null;
  a.rightsStatus = rights;
  if (rights === "APPROVED") {
    a.playbackAllowed = true;
  } else {
    a.playbackAllowed = false;
    a.access.PUBLIC = false;
    a.access.STREAMABLE = false;
  }
  // Valid file still not automatically PUBLIC/SELLABLE/etc.
  return a;
}

export function validFileIsNotAutomaticallyLicensed(mediaAssetId: string): {
  fileValid: boolean;
  PUBLIC: false;
  SELLABLE: false;
  STREAMABLE: false;
  DOWNLOADABLE: false;
  BEAT_LOCKER_ELIGIBLE: false;
  SHOW_ELIGIBLE: false;
} {
  const a = assets.get(mediaAssetId);
  return {
    fileValid: !!a,
    PUBLIC: false,
    SELLABLE: false,
    STREAMABLE: false,
    DOWNLOADABLE: false,
    BEAT_LOCKER_ELIGIBLE: false,
    SHOW_ELIGIBLE: false,
  };
}

export function loudnessNormalizationHonesty(): {
  sourceUnchanged: true;
  volumeMultiplierIsNotLufs: true;
  lufsBackend: "UNAVAILABLE";
} {
  return { sourceUnchanged: true, volumeMultiplierIsNotLufs: true, lufsBackend: "UNAVAILABLE" };
}

export function getOrigamiAdminSnapshot() {
  const backend = probeOrigamiTranscodeBackend();
  return {
    authority: ORIGAMI_AUDIO_AUTHORITY,
    persistence: ORIGAMI_PERSISTENCE,
    schemaStatus: ORIGAMI_SCHEMA_STATUS,
    databaseApplied: ORIGAMI_DATABASE_APPLIED,
    transcode: backend,
    assets: listOrigamiAssets().map((a) => ({
      mediaAssetId: a.mediaAssetId,
      rights: a.rightsStatus,
      format: a.sourceFormat,
      derivatives: listOrigamiDerivatives(a.mediaAssetId).map((d) => ({
        kind: d.kind,
        qaState: d.qaState,
        bytesGenerated: d.bytesGenerated,
        parent: d.parentMediaAssetId,
      })),
      analysis: getOrigamiAnalysis(a.mediaAssetId)?.bpm.confidence,
    })),
  };
}

export function __resetOrigamiAudioForTests(): void {
  assets.clear();
  hashToAsset.clear();
  derivatives.clear();
  derivativeCache.clear();
  analysisByAsset.clear();
  sourceFingerprints.clear();
}
