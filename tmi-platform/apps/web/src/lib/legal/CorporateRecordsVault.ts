/**
 * Corporate Records Vault — metadata model only.
 * Encrypted, logically isolated Legal Vault locators — never secrets/API keys.
 */

import type { CorporateRecordKind, CorporateRecordMeta } from "./types";

const SEED: CorporateRecordMeta[] = [
  {
    recordId: "CRV-ARTICLES-001",
    kind: "FORMATION_ARTICLES",
    title: "BernoutGlobal LLC — Articles of Organization (metadata)",
    description: "Corporate formation record index entry. Binary document stored offline/vault.",
    version: "1.0",
    storedAt: "2026-01-15T00:00:00.000Z",
    vaultLocator: "legal-vault://corporate/articles/bernoutglobal-llc",
    containsSecrets: false,
    counselReviewed: true,
    tags: ["corporate", "formation"],
  },
  {
    recordId: "CRV-POLICY-TOS-001",
    kind: "POLICY_DOCUMENT",
    title: "TMI Terms of Service (registry pointer)",
    description: "Public policy document pointer — see /terms and /legal.",
    version: "stub",
    storedAt: "2026-06-01T00:00:00.000Z",
    vaultLocator: "legal-vault://policies/terms",
    containsSecrets: false,
    counselReviewed: false,
    tags: ["policy", "terms"],
  },
  {
    recordId: "CRV-POLICY-PRIVACY-001",
    kind: "POLICY_DOCUMENT",
    title: "TMI Privacy Policy (registry pointer)",
    description: "Privacy policy pointer — see /legal/privacy intake for rights requests.",
    version: "stub",
    storedAt: "2026-06-01T00:00:00.000Z",
    vaultLocator: "legal-vault://policies/privacy",
    containsSecrets: false,
    counselReviewed: false,
    tags: ["policy", "privacy"],
  },
];

type VaultStore = { records: CorporateRecordMeta[] };

function store(): VaultStore {
  const g = globalThis as typeof globalThis & { __tmiCorporateVault?: VaultStore };
  if (!g.__tmiCorporateVault) {
    g.__tmiCorporateVault = {
      records: SEED.map((r) => ({ ...r, tags: [...r.tags], containsSecrets: false as const })),
    };
  }
  return g.__tmiCorporateVault;
}

export function listCorporateRecords(): CorporateRecordMeta[] {
  return store().records.map((r) => ({
    ...r,
    tags: [...r.tags],
    containsSecrets: false,
  }));
}

export function registerCorporateRecordMeta(input: {
  kind: CorporateRecordKind;
  title: string;
  description: string;
  version: string;
  vaultLocator: string;
  counselReviewed?: boolean;
  tags?: string[];
}): CorporateRecordMeta | { error: string } {
  // Forbid secret-looking locators / titles
  const blob = `${input.title} ${input.description} ${input.vaultLocator}`.toLowerCase();
  if (
    /api[_-]?key|secret|password|private[_-]?key|sk_live|sk_test|whsec_|bearer\s/i.test(blob)
  ) {
    return { error: "Secrets and API keys are forbidden in the Corporate Records Vault." };
  }

  const record: CorporateRecordMeta = {
    recordId: `CRV-${Date.now().toString(36).toUpperCase()}`,
    kind: input.kind,
    title: input.title.trim(),
    description: input.description.trim(),
    version: input.version.trim() || "1.0",
    storedAt: new Date().toISOString(),
    vaultLocator: input.vaultLocator.trim(),
    containsSecrets: false,
    counselReviewed: Boolean(input.counselReviewed),
    tags: input.tags ?? [],
  };
  store().records.push(record);
  return { ...record, tags: [...record.tags], containsSecrets: false };
}

export function documentRegistryTypes(): CorporateRecordKind[] {
  return [
    "FORMATION_ARTICLES",
    "OPERATING_AGREEMENT",
    "POLICY_DOCUMENT",
    "COUNSEL_MEMO",
    "INSURANCE_CERTIFICATE",
    "TAX_REGISTRATION",
    "VENDOR_AGREEMENT",
    "OTHER",
  ];
}
