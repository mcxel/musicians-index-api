import { contributorAccountEngine } from "@/lib/editorial-economy/ContributorAccountEngine";
import { editorialPerformanceEngine } from "@/lib/editorial-economy/EditorialPerformanceEngine";

export interface ContributorPayoutResult {
  contributorId: string;
  submissionId: string;
  approved: boolean;
  reason?: string;
  amountUsd: number;
}

class ContributorPayoutEngine {
  calculate(input: {
    contributorId: string;
    submissionId: string;
    approved: boolean;
    sponsorRevenueUsd: number;
  }): ContributorPayoutResult {
    if (!input.approved) {
      return {
        contributorId: input.contributorId,
        submissionId: input.submissionId,
        approved: false,
        reason: "submission-not-approved",
        amountUsd: 0,
      };
    }

    const account = contributorAccountEngine.get(input.contributorId);
    if (!account) {
      return {
        contributorId: input.contributorId,
        submissionId: input.submissionId,
        approved: false,
        reason: "contributor-not-found",
        amountUsd: 0,
      };
    }

    const engagement = editorialPerformanceEngine.verifiedEngagementScore(input.submissionId);
    const base = account.level === "new-contributor" ? 6 : account.level === "verified-contributor" ? 12 : 18;
    const engagementBonus = Math.min(220, engagement * 0.08);
    const sponsorShare = Math.max(0, input.sponsorRevenueUsd * 0.2);
    const gross = base + engagementBonus + sponsorShare;

    const capped = Math.min(gross, account.payoutCapUsd);

    return {
      contributorId: input.contributorId,
      submissionId: input.submissionId,
      approved: true,
      amountUsd: Number(capped.toFixed(2)),
      reason: capped < gross ? "cap-applied" : undefined,
    };
  }
}

export const contributorPayoutEngine = new ContributorPayoutEngine();
