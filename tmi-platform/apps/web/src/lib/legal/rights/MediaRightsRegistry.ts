/**
 * MediaRightsRegistry — indexes playable assets' rights state.
 * Registers known CompetitionMusicEngine / BeatLicense sources.
 * Does NOT invent fake cleared commercial catalogs.
 * Unknown rights default to restrictive playback (Yellow path).
 */

import { BEAT_REGISTRY_SEED } from "@/lib/competition/CompetitionMusicEngine";
import type { MediaRightsRecord, MediaSurface } from "./types";

type Store = { byId: Map<string, MediaRightsRecord>; seeded: boolean };

function store(): Store {
  const g = globalThis as typeof globalThis & { __tmiMediaRightsRegistry?: Store };
  if (!g.__tmiMediaRightsRegistry) {
    g.__tmiMediaRightsRegistry = { byId: new Map(), seeded: false };
  }
  return g.__tmiMediaRightsRegistry;
}

const COMPETITION_SURFACES: MediaSurface[] = [
  "LIVE",
  "BATTLE",
  "CYPHER",
  "CHALLENGE",
  "VENUE",
  "PLAYLIST",
];

function unknownRecord(assetId: string, uploader = "unknown"): MediaRightsRecord {
  const now = new Date().toISOString();
  return {
    assetId,
    ownerId: uploader,
    copyrightOwner: "UNKNOWN",
    masterOwner: "UNKNOWN",
    compositionOwner: "UNKNOWN",
    uploader,
    licenseSource: "UNKNOWN",
    licenseDocumentId: null,
    territories: ["UNKNOWN"],
    platformPlaybackAllowed: true,
    livestreamAllowed: true,
    recordingAllowed: false,
    externalRebroadcastAllowed: false,
    monetizedVideoAllowed: false,
    clipCreationAllowed: false,
    derivativeUseAllowed: false,
    attributionRequired: true,
    contentIdStatus: "UNKNOWN",
    licenseStart: null,
    licenseExpiration: null,
    disputeEvidenceId: null,
    allowedSurfaces: ["LIVE", "PLAYLIST", "MEDIA_LOCKER"],
    hasRightsEvidence: false,
    registeredAt: now,
  };
}

/** Seed TMI competition vault beats as TMI-owned — not third-party commercial clearance. */
export function ensureMediaRightsSeeded(): void {
  const s = store();
  if (s.seeded) return;
  for (const beat of BEAT_REGISTRY_SEED) {
    const isTmi = beat.ownerId === "sys-tmi";
    const record: MediaRightsRecord = {
      assetId: beat.id,
      ownerId: beat.ownerId,
      copyrightOwner: isTmi ? "TMI / BernoutGlobal LLC" : beat.ownerId,
      masterOwner: isTmi ? "TMI / BernoutGlobal LLC" : beat.ownerId,
      compositionOwner: isTmi ? "TMI / BernoutGlobal LLC" : beat.ownerId,
      uploader: beat.ownerId,
      licenseSource: isTmi ? "TMI_OWNED" : "COMPETITION_VAULT",
      licenseDocumentId: isTmi ? `TMI-OWNED-${beat.id}` : null,
      territories: ["GLOBAL-PLATFORM"],
      platformPlaybackAllowed: true,
      livestreamAllowed: true,
      // TMI-owned competition vault: recording OK inside TMI competition contexts with evidence.
      recordingAllowed: isTmi,
      externalRebroadcastAllowed: isTmi,
      monetizedVideoAllowed: isTmi,
      clipCreationAllowed: isTmi,
      derivativeUseAllowed: false,
      attributionRequired: true,
      contentIdStatus: isTmi ? "CLEARED" : "UNKNOWN",
      licenseStart: null,
      licenseExpiration: null,
      disputeEvidenceId: null,
      allowedSurfaces: COMPETITION_SURFACES,
      hasRightsEvidence: isTmi,
      title: beat.title,
      registeredAt: new Date().toISOString(),
    };
    s.byId.set(beat.id, record);
  }
  // Platform ambience placeholders — recording-safe substitutes (not commercial catalog).
  s.byId.set("tmi-ambience-safe-01", {
    ...unknownRecord("tmi-ambience-safe-01", "sys-tmi"),
    copyrightOwner: "TMI / BernoutGlobal LLC",
    masterOwner: "TMI / BernoutGlobal LLC",
    compositionOwner: "TMI / BernoutGlobal LLC",
    licenseSource: "TMI_OWNED",
    licenseDocumentId: "TMI-OWNED-AMBIENCE-01",
    territories: ["GLOBAL-PLATFORM"],
    recordingAllowed: true,
    externalRebroadcastAllowed: true,
    monetizedVideoAllowed: true,
    clipCreationAllowed: true,
    attributionRequired: true,
    contentIdStatus: "CLEARED",
    hasRightsEvidence: true,
    title: "TMI Creator-Safe Ambience",
    allowedSurfaces: ["LIVE", "BATTLE", "CYPHER", "CHALLENGE", "VENUE", "SNIP"],
  });
  s.seeded = true;
}

export function registerMediaRights(record: MediaRightsRecord): MediaRightsRecord {
  ensureMediaRightsSeeded();
  const copy = { ...record, territories: [...record.territories], allowedSurfaces: [...record.allowedSurfaces] };
  store().byId.set(copy.assetId, copy);
  return copy;
}

export function getMediaRights(assetId: string): MediaRightsRecord {
  ensureMediaRightsSeeded();
  const hit = store().byId.get(assetId);
  if (hit) {
    return {
      ...hit,
      territories: [...hit.territories],
      allowedSurfaces: [...hit.allowedSurfaces],
    };
  }
  // Unknown asset — never invent Green clearance
  return unknownRecord(assetId);
}

export function listMediaRights(limit = 100): MediaRightsRecord[] {
  ensureMediaRightsSeeded();
  return Array.from(store().byId.values())
    .slice(0, limit)
    .map((r) => ({
      ...r,
      territories: [...r.territories],
      allowedSurfaces: [...r.allowedSurfaces],
    }));
}

export function countMediaRightsByLight(): { greenEligible: number; yellowDefault: number; redRestricted: number; total: number } {
  ensureMediaRightsSeeded();
  let greenEligible = 0;
  let yellowDefault = 0;
  let redRestricted = 0;
  for (const r of store().byId.values()) {
    if (r.contentIdStatus === "TAKEDOWN" || r.contentIdStatus === "DISPUTED" || r.disputeEvidenceId) {
      redRestricted += 1;
    } else if (
      r.hasRightsEvidence &&
      r.recordingAllowed &&
      r.externalRebroadcastAllowed &&
      r.monetizedVideoAllowed
    ) {
      greenEligible += 1;
    } else {
      yellowDefault += 1;
    }
  }
  return { greenEligible, yellowDefault, redRestricted, total: store().byId.size };
}
