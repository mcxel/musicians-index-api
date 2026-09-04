/**
 * FamilyRelationshipPolicy — verified Family Account links only.
 *
 * Canonical graph is Prisma FamilyAccount + ChildAccount (resolved server-side).
 * This module never infers "this is my uncle" self-claims. Empty ids deny.
 * FamilyTreeEngine in-memory trees are not authority.
 *
 * Age bands live in YouthSocialGuard (protected teens = 16–17, adults = 18+).
 * A matching FamilyAccount id is the only private 1:1 exception for adult ↔ 16/17.
 */

export const FAMILY_RELATIONSHIP_KINDS = ["parent", "guardian", "approved_family"] as const;
export type FamilyRelationshipKind = (typeof FAMILY_RELATIONSHIP_KINDS)[number];

export type FamilyRelationshipSubject = {
  userId: string;
  /** Real FamilyAccount.id. Null/empty = no family exception. */
  familyAccountId?: string | null;
};

export function canonicalFamilyAccountId(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const id = value.trim();
  return id.length > 0 ? id : null;
}

/** Deny-by-default: both sides must share the same non-empty FamilyAccount id. */
export function hasVerifiedFamilyRelationship(
  a: FamilyRelationshipSubject | string | null | undefined,
  b: FamilyRelationshipSubject | string | null | undefined,
): boolean {
  const left = canonicalFamilyAccountId(typeof a === "object" && a ? a.familyAccountId : a);
  const right = canonicalFamilyAccountId(typeof b === "object" && b ? b.familyAccountId : b);
  if (!left || !right) return false;
  return left === right;
}
