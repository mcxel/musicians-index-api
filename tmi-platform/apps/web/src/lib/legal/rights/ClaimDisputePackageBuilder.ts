/**
 * ClaimDisputePackageBuilder — packages evidence for incorrect copyright claims.
 * Human review required — never auto-resolves disputes.
 */

import { listRightsEvidenceForAsset } from "./RightsEvidenceVault";
import type { ClaimDisputePackage } from "./types";

type Store = { packages: ClaimDisputePackage[] };

function store(): Store {
  const g = globalThis as typeof globalThis & { __tmiClaimDisputeStore?: Store };
  if (!g.__tmiClaimDisputeStore) g.__tmiClaimDisputeStore = { packages: [] };
  return g.__tmiClaimDisputeStore;
}

export function buildClaimDisputePackage(input: {
  assetId: string;
  claimSummary: string;
}): ClaimDisputePackage {
  const evidence = listRightsEvidenceForAsset(input.assetId);
  const pkg: ClaimDisputePackage = {
    packageId: `CDP-${Date.now().toString(36).toUpperCase()}`,
    assetId: input.assetId,
    claimSummary: input.claimSummary.trim(),
    evidenceIds: evidence.map((e) => e.evidenceId),
    createdAt: new Date().toISOString(),
    status: "DRAFT",
    humanReviewRequired: true,
  };
  store().packages.push(pkg);
  return { ...pkg, evidenceIds: [...pkg.evidenceIds] };
}

export function listClaimDisputePackages(limit = 50): ClaimDisputePackage[] {
  return store()
    .packages.slice(-limit)
    .map((p) => ({ ...p, evidenceIds: [...p.evidenceIds], humanReviewRequired: true as const }));
}
