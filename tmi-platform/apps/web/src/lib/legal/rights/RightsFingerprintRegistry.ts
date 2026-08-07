/**
 * RightsFingerprintRegistry — lightweight content fingerprint index for claim matching.
 * Does not invent commercial Content ID catalogs. Hash of assetId+ref only for scaffold.
 */

import { createHash } from "crypto";
import type { RightsFingerprintRecord } from "./types";

type Store = { byId: Map<string, RightsFingerprintRecord>; byHash: Map<string, string[]> };

function store(): Store {
  const g = globalThis as typeof globalThis & { __tmiRightsFingerprintRegistry?: Store };
  if (!g.__tmiRightsFingerprintRegistry) {
    g.__tmiRightsFingerprintRegistry = { byId: new Map(), byHash: new Map() };
  }
  return g.__tmiRightsFingerprintRegistry;
}

export function computeRightsFingerprintHash(assetId: string, contentRef?: string | null): string {
  return createHash("sha256")
    .update(`${assetId}|${contentRef ?? "noref"}|tmi-rights-fp-v1`)
    .digest("hex");
}

export function registerFingerprint(input: {
  assetId: string;
  contentRef?: string | null;
  source: RightsFingerprintRecord["source"];
}): RightsFingerprintRecord {
  const s = store();
  const fingerprintHash = computeRightsFingerprintHash(input.assetId, input.contentRef);
  const existingIds = s.byHash.get(fingerprintHash) ?? [];
  const matchedAssetIds = existingIds.filter((id) => id !== input.assetId);

  const fingerprintId = `RFP-${Date.now().toString(36).toUpperCase()}`;
  const record: RightsFingerprintRecord = {
    fingerprintId,
    assetId: input.assetId,
    fingerprintHash,
    source: input.source,
    matchedAssetIds: [...matchedAssetIds],
    createdAt: new Date().toISOString(),
  };
  s.byId.set(fingerprintId, record);
  if (!existingIds.includes(input.assetId)) {
    s.byHash.set(fingerprintHash, [...existingIds, input.assetId]);
  }
  return { ...record, matchedAssetIds: [...record.matchedAssetIds] };
}

export function lookupFingerprints(assetId: string, contentRef?: string | null): {
  fingerprintHash: string;
  matchingAssetIds: string[];
  records: RightsFingerprintRecord[];
} {
  const s = store();
  const fingerprintHash = computeRightsFingerprintHash(assetId, contentRef);
  const matchingAssetIds = (s.byHash.get(fingerprintHash) ?? []).filter((id) => id !== assetId);
  const records = Array.from(s.byId.values())
    .filter((r) => r.fingerprintHash === fingerprintHash)
    .map((r) => ({ ...r, matchedAssetIds: [...r.matchedAssetIds] }));
  return { fingerprintHash, matchingAssetIds, records };
}

export function listFingerprints(limit = 50): RightsFingerprintRecord[] {
  return Array.from(store().byId.values())
    .slice(-limit)
    .map((r) => ({ ...r, matchedAssetIds: [...r.matchedAssetIds] }));
}
