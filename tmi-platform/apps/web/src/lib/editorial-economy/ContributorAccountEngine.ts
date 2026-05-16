import type { ContributorAccount, ContributorLevel } from "@/lib/editorial-economy/types";

class ContributorAccountEngine {
  private readonly accounts = new Map<string, ContributorAccount>();

  create(input: { contributorId: string; displayName: string; level?: ContributorLevel }): ContributorAccount {
    const level = input.level ?? "new-contributor";
    const account: ContributorAccount = {
      contributorId: input.contributorId,
      displayName: input.displayName,
      level,
      trustScore: level === "new-contributor" ? 25 : 60,
      payoutCapUsd: level === "staff-editor" ? 3000 : level === "trusted-editor" ? 2000 : 1000,
      verifiedAt: level === "new-contributor" ? undefined : new Date().toISOString(),
    };

    this.accounts.set(input.contributorId, account);
    return account;
  }

  get(contributorId: string): ContributorAccount | undefined {
    return this.accounts.get(contributorId);
  }

  list(): ContributorAccount[] {
    return Array.from(this.accounts.values());
  }

  updateLevel(contributorId: string, level: ContributorLevel): ContributorAccount | null {
    const current = this.accounts.get(contributorId);
    if (!current) return null;

    const next: ContributorAccount = {
      ...current,
      level,
      verifiedAt: level === "new-contributor" ? undefined : current.verifiedAt ?? new Date().toISOString(),
      payoutCapUsd: level === "staff-editor" ? 3000 : level === "trusted-editor" ? 2000 : level === "verified-contributor" ? 1200 : 500,
      trustScore: Math.max(current.trustScore, level === "new-contributor" ? 25 : 60),
    };

    this.accounts.set(contributorId, next);
    return next;
  }
}

export const contributorAccountEngine = new ContributorAccountEngine();
