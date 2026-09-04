/**
 * Versioned policy acceptance for messaging eligibility.
 */

import prisma from "@/lib/prisma";
import {
  CURRENT_POLICY_VERSION,
  REQUIRED_MESSAGING_POLICIES,
  type PolicyId,
  type PolicyDefinition,
} from "./policyCatalog";

export {
  CURRENT_POLICY_VERSION,
  REQUIRED_MESSAGING_POLICIES,
  type PolicyId,
  type PolicyDefinition,
};

export type PolicyAcceptanceRecord = {
  userId: string;
  policyId: PolicyId;
  version: string;
  acceptedAt: Date;
};

const SCHEMA_ENSURED = { done: false };

export async function ensurePolicyAcceptanceSchema(): Promise<void> {
  if (SCHEMA_ENSURED.done) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "PolicyAcceptanceRecord" (
        "id" TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "policyId" TEXT NOT NULL,
        "version" TEXT NOT NULL,
        "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "PolicyAcceptanceRecord_user_policy_version_key"
      ON "PolicyAcceptanceRecord"("userId", "policyId", "version");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "PolicyAcceptanceRecord_userId_idx"
      ON "PolicyAcceptanceRecord"("userId");
    `);
    SCHEMA_ENSURED.done = true;
  } catch (err) {
    console.error("[PolicyAcceptance] schema ensure failed", err);
  }
}

function newId(): string {
  return `par_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function listAcceptedPolicies(userId: string): Promise<PolicyAcceptanceRecord[]> {
  await ensurePolicyAcceptanceSchema();
  try {
    const rows = await prisma.$queryRawUnsafe<
      { userId: string; policyId: string; version: string; acceptedAt: Date }[]
    >(
      `SELECT "userId", "policyId", "version", "acceptedAt" FROM "PolicyAcceptanceRecord" WHERE "userId" = $1`,
      userId,
    );
    return rows.map((r) => ({
      userId: r.userId,
      policyId: r.policyId as PolicyId,
      version: r.version,
      acceptedAt: r.acceptedAt,
    }));
  } catch {
    return [];
  }
}

export async function hasRequiredPolicyAcceptances(userId: string): Promise<{
  complete: boolean;
  missing: PolicyDefinition[];
}> {
  const accepted = await listAcceptedPolicies(userId);
  const missing = REQUIRED_MESSAGING_POLICIES.filter((p) => {
    if (!p.required) return false;
    return !accepted.some((a) => a.policyId === p.policyId && a.version === p.version);
  });
  return { complete: missing.length === 0, missing };
}

export async function recordPolicyAcceptances(
  userId: string,
  policyIds: PolicyId[],
  version: string = CURRENT_POLICY_VERSION,
): Promise<PolicyAcceptanceRecord[]> {
  await ensurePolicyAcceptanceSchema();
  const out: PolicyAcceptanceRecord[] = [];
  const unique = [...new Set(policyIds)];
  for (const policyId of unique) {
    const def = REQUIRED_MESSAGING_POLICIES.find((p) => p.policyId === policyId);
    if (!def) continue;
    const ver = version || def.version;
    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "PolicyAcceptanceRecord" ("id", "userId", "policyId", "version", "acceptedAt")
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
         ON CONFLICT ("userId", "policyId", "version") DO UPDATE SET "acceptedAt" = CURRENT_TIMESTAMP`,
        newId(),
        userId,
        policyId,
        ver,
      );
      out.push({ userId, policyId, version: ver, acceptedAt: new Date() });
    } catch (err) {
      console.error("[PolicyAcceptance] record failed", policyId, err);
    }
  }
  return out;
}

export async function acceptAllRequiredPolicies(userId: string): Promise<PolicyAcceptanceRecord[]> {
  return recordPolicyAcceptances(
    userId,
    REQUIRED_MESSAGING_POLICIES.map((p) => p.policyId),
  );
}
