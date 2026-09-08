import prisma from "@/lib/prisma";
import type { ContributorAccount as DbContributorAccount, Prisma } from "@prisma/client";
import type { ContributorAccount, ContributorLevel } from "@/lib/editorial-economy/types";

const TO_DB_LEVEL: Record<ContributorLevel, DbContributorAccount["level"]> = {
  "new-contributor": "NEW_CONTRIBUTOR",
  "verified-contributor": "VERIFIED_CONTRIBUTOR",
  "trusted-editor": "TRUSTED_EDITOR",
  "staff-editor": "STAFF_EDITOR",
};

const FROM_DB_LEVEL: Record<DbContributorAccount["level"], ContributorLevel> = {
  NEW_CONTRIBUTOR: "new-contributor",
  VERIFIED_CONTRIBUTOR: "verified-contributor",
  TRUSTED_EDITOR: "trusted-editor",
  STAFF_EDITOR: "staff-editor",
};

function payoutCapFor(level: ContributorLevel): number {
  return level === "staff-editor" ? 3000 : level === "trusted-editor" ? 2000 : level === "verified-contributor" ? 1200 : 1000;
}

function fromDb(row: DbContributorAccount): ContributorAccount {
  return {
    contributorId: row.contributorId,
    displayName: row.displayName,
    level: FROM_DB_LEVEL[row.level],
    trustScore: row.trustScore,
    payoutCapUsd: row.payoutCapUsd,
    verifiedAt: row.verifiedAt?.toISOString(),
  };
}

class ContributorAccountEngine {
  async create(input: { contributorId: string; displayName: string; level?: ContributorLevel }): Promise<ContributorAccount> {
    const level = input.level ?? "new-contributor";
    const row = await prisma.contributorAccount.create({
      data: {
        contributorId: input.contributorId,
        displayName: input.displayName,
        level: TO_DB_LEVEL[level],
        trustScore: level === "new-contributor" ? 25 : 60,
        payoutCapUsd: payoutCapFor(level),
        verifiedAt: level === "new-contributor" ? null : new Date(),
      },
    });
    return fromDb(row);
  }

  async get(contributorId: string): Promise<ContributorAccount | undefined> {
    const row = await prisma.contributorAccount.findUnique({ where: { contributorId } });
    return row ? fromDb(row) : undefined;
  }

  /** Idempotent — preserves an existing account's trust/level/payout progression. `create()` always resets to defaults, so real session-backed callers must use this instead. */
  async getOrCreate(input: { contributorId: string; displayName: string; level?: ContributorLevel }): Promise<ContributorAccount> {
    const existing = await this.get(input.contributorId);
    if (existing) return existing;
    return this.create(input);
  }

  async list(): Promise<ContributorAccount[]> {
    const rows = await prisma.contributorAccount.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map(fromDb);
  }

  async updateLevel(contributorId: string, level: ContributorLevel): Promise<ContributorAccount | null> {
    const current = await this.get(contributorId);
    if (!current) return null;

    const data: Prisma.ContributorAccountUpdateInput = {
      level: TO_DB_LEVEL[level],
      payoutCapUsd: payoutCapFor(level),
      trustScore: Math.max(current.trustScore, level === "new-contributor" ? 25 : 60),
    };
    if (level !== "new-contributor" && !current.verifiedAt) {
      data.verifiedAt = new Date();
    } else if (level === "new-contributor") {
      data.verifiedAt = null;
    }

    const row = await prisma.contributorAccount.update({ where: { contributorId }, data });
    return fromDb(row);
  }
}

export const contributorAccountEngine = new ContributorAccountEngine();
