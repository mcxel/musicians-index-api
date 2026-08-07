/**
 * DisclosurePackageBuilder — builds package *manifest* drafts only.
 * Never auto-releases user records. approvalRequired is always true.
 */

import { resolveCatalogRefs } from "./LegalDataCatalog";
import type {
  ApprovalDecision,
  DisclosurePackageManifest,
  LegalDataCategory,
} from "./types";

type PackageStore = { packages: DisclosurePackageManifest[] };

function store(): PackageStore {
  const g = globalThis as typeof globalThis & { __tmiLegalPackageStore?: PackageStore };
  if (!g.__tmiLegalPackageStore) g.__tmiLegalPackageStore = { packages: [] };
  return g.__tmiLegalPackageStore;
}

function nextPackageId(): string {
  return `PKG-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function buildDisclosurePackageDraft(input: {
  caseId: string;
  policyVersionIds: string[];
  requestedCategories: LegalDataCategory[];
  includedCategories: LegalDataCategory[];
  excludedCategories: LegalDataCategory[];
  minimizationNotes: string[];
}): DisclosurePackageManifest {
  const catalogRefs = resolveCatalogRefs(input.includedCategories).map((ref) => ({
    ...ref,
    // Force AUTH blocked even if somehow included
    accessMode:
      ref.category === "AUTH" ? ("BLOCKED" as const) : ref.accessMode,
  }));

  const manifest: DisclosurePackageManifest = {
    packageId: nextPackageId(),
    caseId: input.caseId,
    createdAt: new Date().toISOString(),
    policyVersionIds: [...input.policyVersionIds],
    requestedCategories: [...input.requestedCategories],
    includedCategories: [...input.includedCategories],
    excludedCategories: [...input.excludedCategories],
    minimizationNotes: [...input.minimizationNotes],
    catalogRefs,
    approvalRequired: true,
    approvalDecision: "PENDING",
    humanGateMessage:
      "Package draft prepared. Human/counsel approval required before any delivery. " +
      "Automation prepares — it does not disclose.",
  };

  store().packages.push(manifest);
  return cloneManifest(manifest);
}

export function getDisclosurePackage(packageId: string): DisclosurePackageManifest | null {
  const hit = store().packages.find((p) => p.packageId === packageId);
  return hit ? cloneManifest(hit) : null;
}

export function getPackageForCase(caseId: string): DisclosurePackageManifest | null {
  const hits = store().packages.filter((p) => p.caseId === caseId);
  if (hits.length === 0) return null;
  return cloneManifest(hits[hits.length - 1]!);
}

export function markPackageApproval(
  packageId: string,
  decision: Exclude<ApprovalDecision, "PENDING">,
): DisclosurePackageManifest | null {
  const hit = store().packages.find((p) => p.packageId === packageId);
  if (!hit) return null;
  hit.approvalDecision = decision;
  return cloneManifest(hit);
}

function cloneManifest(m: DisclosurePackageManifest): DisclosurePackageManifest {
  return {
    ...m,
    policyVersionIds: [...m.policyVersionIds],
    requestedCategories: [...m.requestedCategories],
    includedCategories: [...m.includedCategories],
    excludedCategories: [...m.excludedCategories],
    minimizationNotes: [...m.minimizationNotes],
    catalogRefs: m.catalogRefs.map((r) => ({
      ...r,
      prismaModels: [...r.prismaModels],
      filePaths: [...r.filePaths],
    })),
    approvalRequired: true,
  };
}

export function __resetDisclosurePackages(): void {
  store().packages.length = 0;
}
