/**
 * RightsEvidenceVault — protect TMI-owned / declared material.
 * Stores original upload refs, hashes, ownership declarations — not secrets/API keys.
 * Complements TrustSafety EvidenceVault (different domain: IP vs safety reports).
 */

import { createHash } from "crypto";
import type { RightsEvidenceRecord } from "./types";
import { BEAT_REGISTRY_SEED } from "@/lib/competition/CompetitionMusicEngine";

type Store = { byId: Map<string, RightsEvidenceRecord>; seeded: boolean };

function store(): Store {
  const g = globalThis as typeof globalThis & { __tmiRightsEvidenceVault?: Store };
  if (!g.__tmiRightsEvidenceVault) {
    g.__tmiRightsEvidenceVault = { byId: new Map(), seeded: false };
  }
  return g.__tmiRightsEvidenceVault;
}

function hashRef(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

export function ensureRightsEvidenceSeeded(): void {
  const s = store();
  if (s.seeded) return;
  const now = new Date().toISOString();
  for (const beat of BEAT_REGISTRY_SEED.filter((b) => b.ownerId === "sys-tmi")) {
    const evidenceId = `REV-${beat.id}`;
    s.byId.set(evidenceId, {
      evidenceId,
      assetId: beat.id,
      originalUploadRef: beat.audioUrl,
      contentHash: hashRef(`${beat.id}|${beat.audioUrl}|sys-tmi`),
      uploader: "sys-tmi",
      ownershipDeclaration: "TMI-owned competition vault asset — platform declaration",
      contractOrLicenseRef: `TMI-OWNED-${beat.id}`,
      timestamps: { uploadedAt: now, declaredAt: now },
      isrc: null,
      authorizedUses: [
        "platform_playback",
        "livestream",
        "competition_recording",
        "clip_creation",
        "external_rebroadcast_with_attribution",
      ],
      createdAt: now,
    });
  }
  s.byId.set("REV-tmi-ambience-safe-01", {
    evidenceId: "REV-tmi-ambience-safe-01",
    assetId: "tmi-ambience-safe-01",
    originalUploadRef: "legal-vault://audio/tmi-ambience-safe-01",
    contentHash: hashRef("tmi-ambience-safe-01|sys-tmi"),
    uploader: "sys-tmi",
    ownershipDeclaration: "TMI creator-safe ambience — platform owned",
    contractOrLicenseRef: "TMI-OWNED-AMBIENCE-01",
    timestamps: { uploadedAt: now, declaredAt: now },
    isrc: null,
    authorizedUses: ["creator_safe_substitute", "recording_mix", "livestream"],
    createdAt: now,
  });
  s.seeded = true;
}

export function putRightsEvidence(
  input: Omit<RightsEvidenceRecord, "evidenceId" | "createdAt" | "contentHash"> & {
    contentHash?: string;
  },
): RightsEvidenceRecord | { error: string } {
  if (/api[_-]?key|secret|password|sk_live|whsec_/i.test(JSON.stringify(input))) {
    return { error: "Secrets and API keys are forbidden in RightsEvidenceVault" };
  }
  ensureRightsEvidenceSeeded();
  const evidenceId = `REV-${Date.now().toString(36).toUpperCase()}`;
  const record: RightsEvidenceRecord = {
    evidenceId,
    assetId: input.assetId,
    originalUploadRef: input.originalUploadRef,
    contentHash:
      input.contentHash ??
      hashRef(`${input.assetId}|${input.originalUploadRef}|${input.uploader}`),
    uploader: input.uploader,
    ownershipDeclaration: input.ownershipDeclaration,
    contractOrLicenseRef: input.contractOrLicenseRef,
    timestamps: input.timestamps,
    isrc: input.isrc,
    authorizedUses: [...input.authorizedUses],
    createdAt: new Date().toISOString(),
  };
  store().byId.set(evidenceId, record);
  return { ...record, authorizedUses: [...record.authorizedUses] };
}

export function getRightsEvidence(evidenceId: string): RightsEvidenceRecord | null {
  ensureRightsEvidenceSeeded();
  const hit = store().byId.get(evidenceId);
  return hit ? { ...hit, authorizedUses: [...hit.authorizedUses] } : null;
}

export function listRightsEvidenceForAsset(assetId: string): RightsEvidenceRecord[] {
  ensureRightsEvidenceSeeded();
  return Array.from(store().byId.values())
    .filter((e) => e.assetId === assetId)
    .map((e) => ({ ...e, authorizedUses: [...e.authorizedUses] }));
}

export function listRightsEvidence(limit = 50): RightsEvidenceRecord[] {
  ensureRightsEvidenceSeeded();
  return Array.from(store().byId.values())
    .slice(0, limit)
    .map((e) => ({ ...e, authorizedUses: [...e.authorizedUses] }));
}
