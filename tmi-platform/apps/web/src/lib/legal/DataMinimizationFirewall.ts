/**
 * Data Minimization Firewall — intersection of requested × policy-allowed × hold-scoped.
 * Never expands scope beyond the intersection.
 */

import type { LegalDataCategory } from "./types";

export type MinimizationResult = {
  included: LegalDataCategory[];
  excluded: LegalDataCategory[];
  notes: string[];
};

export function applyDataMinimization(input: {
  requested: LegalDataCategory[];
  policyAllowed: LegalDataCategory[];
  holdCategories?: LegalDataCategory[];
}): MinimizationResult {
  const requested = new Set(input.requested);
  const policy = new Set(input.policyAllowed);
  const hold =
    input.holdCategories && input.holdCategories.length > 0
      ? new Set(input.holdCategories)
      : null;

  const notes: string[] = [
    "Minimization = intersection of requested ∩ policy-allowed" +
      (hold ? " ∩ active-hold categories" : ""),
    "AUTH secrets/tokens remain BLOCKED regardless of intersection",
  ];

  const included: LegalDataCategory[] = [];
  const excluded: LegalDataCategory[] = [];

  for (const cat of requested) {
    const inPolicy = policy.has(cat);
    const inHold = hold ? hold.has(cat) : true;
    // AUTH never included in automated package drafts as SCOPED_EXPORT
    if (cat === "AUTH") {
      excluded.push(cat);
      notes.push("AUTH excluded from automated package — secrets never leave vault");
      continue;
    }
    if (inPolicy && inHold) {
      included.push(cat);
    } else {
      excluded.push(cat);
      if (!inPolicy) notes.push(`${cat} denied by jurisdiction policy scope`);
      if (hold && !inHold) notes.push(`${cat} outside active legal hold scope`);
    }
  }

  // Also mark policy-only extras as not auto-included (never expand)
  for (const cat of policy) {
    if (!requested.has(cat)) {
      notes.push(`${cat} available under policy but not requested — not expanded`);
    }
  }

  return { included, excluded, notes };
}
