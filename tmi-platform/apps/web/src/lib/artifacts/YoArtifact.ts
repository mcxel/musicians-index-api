/**
 * YoArtifact — canonical TypeScript contract for the portable Yo media artifact.
 *
 * A YoArtifact is the "bought once, own forever" digital release object.
 * It carries audio/video, artwork, playlist structure, player skin,
 * ownership provenance, and playback rules as one portable unit.
 *
 * STATUS: ARCHITECTURE LOCKED — FUTURE FEATURE (not yet implemented at runtime).
 * Rule 20: no code may claim this system is live until the full runtime,
 * storage, and signing pipeline exist.
 *
 * The .yo file format spec, cross-platform player runtime, encryption layer,
 * and device-registration system are separate multi-session builds.
 * This file locks the TypeScript contract so all future work aligns.
 *
 * Ref: CLAUDE.md Rule 18 (Asset Realization Directive), Rule 20 (Reality Rule),
 *      Rule 23 (Revenue-First Rewards Governor — sale settlement).
 */

// ── Portability policy ─────────────────────────────────────────────────────────

/** What the buyer can do with their artifact outside TMI */
export type YoArtifactPortabilityTier =
  | "FULL"         // portable .yo + optional raw MP3/MP4
  | "PORTABLE_ONLY" // .yo player only, no raw file export
  | "STREAMING_ONLY"; // online playback only, no detach

/** Creator's choice for raw-file export on purchase */
export type YoRawExportPolicy =
  | "NONE"                 // protected .yo only
  | "MP3_AAC"              // lossy audio export included
  | "WAV_FLAC"             // lossless export included
  | "MP4_VIDEO"            // video export included
  | "FULL_MEDIA";          // all formats buyer can legally receive

// ── Media entries (generalized — AUDIO and VIDEO in one release) ──────────────

/** Discriminated media type — one release can mix songs and music videos */
export type YoMediaType = "AUDIO" | "VIDEO" | "AUDIO_VIDEO" | "VISUAL_ONLY";

/** @deprecated Use YoMediaType */
export type YoArtifactTrackKind = YoMediaType;

export interface YoMediaEntry {
  id: string;
  /** Position in release sequence (1-based) */
  sequencePosition: number;
  title: string;
  artistDisplay: string;
  /** Discriminated media type */
  mediaType: YoMediaType;
  durationMs: number;
  /** Internal asset pointer — resolved by PortableArtifactBuilder at download time */
  assetReference: string;
  /** Codec/profile hint for the player runtime */
  codecProfile?: string;
  /** Per-entry artwork (e.g. music video thumbnail distinct from album cover) */
  artworkUrl?: string;
  isExplicit?: boolean;
  /** Producer credit */
  producedBy?: string;
  /** Feat. artists */
  features?: string[];
}

/** @deprecated Use YoMediaEntry */
export type YoArtifactTrack = Omit<YoMediaEntry, "sequencePosition" | "assetReference" | "mediaType"> & {
  position: number;
  assetRef: string;
  kind: YoMediaType;
};

// ── Release manifest ───────────────────────────────────────────────────────────

export interface YoArtifactManifest {
  /** Unique artifact ID — stable across platform redesigns */
  artifactId: string;
  /** Version of this manifest — increments on content amendments */
  releaseVersion: number;
  /** Kind of release */
  releaseKind: "ALBUM" | "EP" | "SINGLE" | "MIXTAPE" | "VIDEO_RELEASE" | "COMEDY" | "VISUAL";
  title: string;
  artistDisplay: string;
  /** TMI artist slug for back-link to platform profile */
  artistSlug?: string;
  releaseDate: string;
  /** Ordered media entries — mix of AUDIO and VIDEO allowed in one release */
  entries: YoMediaEntry[];
  /** Primary cover art URL (must be accessible offline if bundled) */
  coverArtUrl: string;
  /** YoPho card document ID linked to this release for artwork/triptych/skin */
  linkedCardId?: string;
  /** Chassis id for the official player skin on this release */
  officialChassisId?: string;
  /** Accent colour for official presentation */
  officialAccentColor?: string;
  portabilityTier: YoArtifactPortabilityTier;
  rawExportPolicy: YoRawExportPolicy;
  /** SHA-256 hash of the canonical manifest JSON — for integrity verification */
  manifestHash?: string;
}

// ── Ownership record ───────────────────────────────────────────────────────────

export type YoArtifactOwnershipType = "PURCHASED" | "GIFTED" | "PROMO" | "CREATOR_COPY";

export interface YoArtifactOwnershipRecord {
  ownershipId: string;
  artifactId: string;
  releaseVersion: number;
  ownerId: string;
  ownerEmail: string;
  ownershipType: YoArtifactOwnershipType;
  purchaseId?: string;
  /** Stripe payment intent ID — present for PURCHASED type */
  stripePaymentIntentId?: string;
  purchasedAt: string;
  /** Buyer's preferred accent override (Rule 19 OwnerPlayerProfile) */
  buyerAccentOverride?: string;
  /** Offline license expiry — null = never expires */
  offlineLicenseExpiresAt: string | null;
  /** Devices authorized for offline playback (populated by device-registration system) */
  authorizedDeviceIds: string[];
}

// ── Portable artifact builder contract ────────────────────────────────────────

/**
 * When built, a PortableArtifact is the self-contained .yo package that
 * travels to the buyer's device.
 *
 * PortableArtifactBuilder does NOT exist yet. This interface locks the
 * shape it must produce when built.
 */
export interface PortableArtifact {
  manifest: YoArtifactManifest;
  ownership: YoArtifactOwnershipRecord;
  /** Creator's locked presentation — artist cannot be overridden by buyer */
  officialPresentation: {
    chassisId: string;
    accentColor: string;
    coverArtUrl: string;
    cardSnapshotUrl?: string;
  };
  /** Buyer's personalisation layer — separate from officialPresentation */
  buyerPersonalization: {
    accentOverride: string | null;
    chassisOverride: string | null;
    customBackground: string | null;
  };
  /** Runtime format version */
  formatVersion: "yo/1.0";
}

// ── Status marker (Rule 20 honesty) ───────────────────────────────────────────

export const YO_ARTIFACT_SYSTEM_STATUS = {
  status: "ARCHITECTURE_LOCKED_NOT_IMPLEMENTED" as const,
  label: "Yo Artifact System",
  readyForBuild: false,
  note: [
    "Contract and types are locked.",
    "PortableArtifactBuilder, .yo packaging, cross-platform player runtime,",
    "encryption layer, and device-registration are NOT yet built.",
    "Do not display 'Download your .yo file' UI until this system is complete.",
    "Estimated scope: multi-session, specialist work (Rule 18 Asset Realization Directive).",
  ].join(" "),
} as const;
