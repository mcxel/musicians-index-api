/**
 * PortableArtifactBuilder — assembles, hashes, and seals YoArtifactManifests.
 *
 * This module runs server-side only (Next.js API routes / server components).
 * It uses Node.js built-in `crypto` — safe for server use, never imported
 * into client bundles.
 *
 * What this file does TODAY (Phase A / F):
 *   - hashManifest()         — SHA-256 of the canonical manifest JSON
 *   - buildPortableArtifact() — assembles a PortableArtifact from parts
 *   - verifyManifestIntegrity() — recomputes hash and compares
 *   - sealReleaseVersion()   — bumps version, stamps hash, freezes manifest
 *
 * What is NOT built here (Rule 20 — future multi-session work):
 *   - Binary .yo file packaging / container spec
 *   - Cross-platform player runtime
 *   - Device registration + offline license encryption / PKI
 *   - Full cryptographic signing with a cert authority
 */

import { createHash } from "crypto";
import type {
  YoArtifactManifest,
  YoArtifactOwnershipRecord,
  PortableArtifact,
} from "./YoArtifact";

// ── Hash helpers ───────────────────────────────────────────────────────────────

/**
 * Compute a deterministic SHA-256 over the manifest.
 * `manifestHash` is always excluded before hashing so the function is
 * idempotent — calling it twice on the same data returns the same hash.
 */
export function hashManifest(manifest: YoArtifactManifest): string {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { manifestHash: _drop, ...hashable } = manifest;
  const canonical = JSON.stringify(hashable, Object.keys(hashable).sort());
  return createHash("sha256").update(canonical, "utf8").digest("hex");
}

/**
 * Re-computes the hash and compares it to the stored `manifestHash`.
 * Returns `true` if the manifest is unmodified since it was sealed.
 */
export function verifyManifestIntegrity(artifact: PortableArtifact): boolean {
  const { manifest } = artifact;
  if (!manifest.manifestHash) return false;
  const expected = hashManifest(manifest);
  return expected === manifest.manifestHash;
}

// ── Sealing ────────────────────────────────────────────────────────────────────

/**
 * Produce an immutable sealed copy of a manifest.
 *
 * - Increments `releaseVersion` (so re-sealing after an amendment is safe)
 * - Stamps `manifestHash`
 *
 * The returned manifest is a new object — the original is not mutated.
 */
export function sealReleaseVersion(
  manifest: YoArtifactManifest,
): YoArtifactManifest {
  const bumped: YoArtifactManifest = {
    ...manifest,
    releaseVersion: manifest.releaseVersion + 1,
    manifestHash: undefined, // clear before hashing
  };
  const hash = hashManifest(bumped);
  return { ...bumped, manifestHash: hash };
}

// ── Assembly ───────────────────────────────────────────────────────────────────

export interface BuildPortableArtifactInput {
  manifest: YoArtifactManifest;
  ownership: YoArtifactOwnershipRecord;
  officialChassisId?: string;
  officialAccentColor?: string;
  coverArtUrl?: string;
  cardSnapshotUrl?: string;
  buyerAccentOverride?: string | null;
  buyerChassisOverride?: string | null;
  buyerCustomBackground?: string | null;
}

/**
 * Assemble a `PortableArtifact` from constituent parts.
 *
 * Automatically seals the manifest (bumps version + stamps hash) if it has
 * not already been sealed, so the caller does not need to call
 * `sealReleaseVersion` separately.
 */
export function buildPortableArtifact(
  input: BuildPortableArtifactInput,
): PortableArtifact {
  const {
    manifest: rawManifest,
    ownership,
    officialChassisId,
    officialAccentColor,
    coverArtUrl,
    cardSnapshotUrl,
    buyerAccentOverride = null,
    buyerChassisOverride = null,
    buyerCustomBackground = null,
  } = input;

  // Seal if the manifest doesn't have a hash yet (first build)
  const manifest: YoArtifactManifest = rawManifest.manifestHash
    ? rawManifest
    : sealReleaseVersion({ ...rawManifest, releaseVersion: rawManifest.releaseVersion - 1 });
  // Note: sealReleaseVersion bumps +1, so we pre-decrement to preserve the
  // caller's intended version number.

  return {
    manifest,
    ownership,
    officialPresentation: {
      chassisId: officialChassisId ?? manifest.officialChassisId ?? "standard",
      accentColor: officialAccentColor ?? manifest.officialAccentColor ?? "#00FFFF",
      coverArtUrl: coverArtUrl ?? manifest.coverArtUrl,
      cardSnapshotUrl,
    },
    buyerPersonalization: {
      accentOverride: buyerAccentOverride,
      chassisOverride: buyerChassisOverride,
      customBackground: buyerCustomBackground,
    },
    formatVersion: "yo/1.0",
  };
}
