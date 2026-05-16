/**
 * AssetAuthorityLedger
 * Records who owns what asset and which system has authority over it.
 * Prevents authority conflicts, double-generation, and ghost assets.
 */

import { getAsset } from "@/lib/registry/RuntimeAssetRegistry";

export type AuthorityClaim = {
  assetId: string;
  claimantId: string;      // engine/system claiming authority
  claimantType: "generator" | "hydrator" | "recovery" | "observer" | "consumer";
  claimedAt: number;
  expiresAt: number | null;
  exclusive: boolean;      // exclusive claims block other claimants
  priority: 1 | 2 | 3 | 4 | 5;
};

export type ConflictRecord = {
  assetId: string;
  challenger: string;
  incumbent: string;
  resolvedAt: number;
  resolution: "challenger_wins" | "incumbent_wins" | "escalated";
};

const ledger = new Map<string, AuthorityClaim[]>();   // assetId → claims
const conflicts: ConflictRecord[] = [];
const MAX_CONFLICTS = 500;

function activeClaims(assetId: string): AuthorityClaim[] {
  const now = Date.now();
  return (ledger.get(assetId) ?? []).filter(c => c.expiresAt === null || c.expiresAt > now);
}

export function claimAuthority(
  assetId: string,
  claimantId: string,
  claimantType: AuthorityClaim["claimantType"],
  opts: { exclusive?: boolean; priority?: AuthorityClaim["priority"]; ttlMs?: number } = {}
): { granted: boolean; conflict: boolean; reason?: string } {
  const existing = activeClaims(assetId);
  const exclusiveClaim = existing.find(c => c.exclusive && c.claimantId !== claimantId);

  if (exclusiveClaim) {
    if ((opts.priority ?? 3) <= exclusiveClaim.priority) {
      conflicts.push({
        assetId, challenger: claimantId, incumbent: exclusiveClaim.claimantId,
        resolvedAt: Date.now(), resolution: "incumbent_wins",
      });
      if (conflicts.length > MAX_CONFLICTS) conflicts.splice(0, 100);
      return { granted: false, conflict: true, reason: `Blocked by exclusive claim from ${exclusiveClaim.claimantId}` };
    }
    // Higher priority wins — revoke incumbent
    revokeAuthority(assetId, exclusiveClaim.claimantId);
    conflicts.push({
      assetId, challenger: claimantId, incumbent: exclusiveClaim.claimantId,
      resolvedAt: Date.now(), resolution: "challenger_wins",
    });
    if (conflicts.length > MAX_CONFLICTS) conflicts.splice(0, 100);
  }

  const claim: AuthorityClaim = {
    assetId, claimantId, claimantType,
    claimedAt: Date.now(),
    expiresAt: opts.ttlMs ? Date.now() + opts.ttlMs : null,
    exclusive: opts.exclusive ?? false,
    priority: opts.priority ?? 3,
  };

  const claims = [...existing.filter(c => c.claimantId !== claimantId), claim];
  ledger.set(assetId, claims);
  return { granted: true, conflict: false };
}

export function revokeAuthority(assetId: string, claimantId: string): boolean {
  const claims = ledger.get(assetId);
  if (!claims) return false;
  const filtered = claims.filter(c => c.claimantId !== claimantId);
  ledger.set(assetId, filtered);
  return filtered.length < claims.length;
}

export function hasAuthority(assetId: string, claimantId: string): boolean {
  return activeClaims(assetId).some(c => c.claimantId === claimantId);
}

export function getAuthorityHolder(assetId: string): AuthorityClaim | null {
  const claims = activeClaims(assetId);
  if (!claims.length) return null;
  return claims.sort((a, b) => b.priority - a.priority)[0];
}

export function getClaimsForAsset(assetId: string): AuthorityClaim[] {
  return activeClaims(assetId);
}

export function getClaimsForClaimant(claimantId: string): AuthorityClaim[] {
  const result: AuthorityClaim[] = [];
  for (const claims of ledger.values()) {
    result.push(...claims.filter(c => c.claimantId === claimantId));
  }
  return result;
}

export function getConflictLog(limit = 50): ConflictRecord[] {
  return conflicts.slice(0, limit);
}

export function verifyAssetAuthority(assetId: string, claimantId: string): {
  authorized: boolean; reason: string; asset: ReturnType<typeof getAsset>
} {
  const asset = getAsset(assetId);
  if (!asset) return { authorized: false, reason: "Asset not in registry", asset: null };
  const authorized = hasAuthority(assetId, claimantId);
  return {
    authorized,
    reason: authorized ? "Authority confirmed" : `No claim held by ${claimantId}`,
    asset,
  };
}

export function getLedgerSummary(): { totalAssets: number; totalClaims: number; conflicts: number } {
  let totalClaims = 0;
  for (const claims of ledger.values()) totalClaims += claims.length;
  return { totalAssets: ledger.size, totalClaims, conflicts: conflicts.length };
}
