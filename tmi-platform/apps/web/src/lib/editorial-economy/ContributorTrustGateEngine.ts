import { contributorAccountEngine } from "@/lib/editorial-economy/ContributorAccountEngine";

export interface TrustGateResult {
  allowed: boolean;
  reason?: string;
}

class ContributorTrustGateEngine {
  canSubmit(contributorId: string): TrustGateResult {
    const account = contributorAccountEngine.get(contributorId);
    if (!account) {
      return { allowed: false, reason: "contributor-not-found" };
    }

    if (account.level === "new-contributor" && account.trustScore < 20) {
      return { allowed: false, reason: "low-trust" };
    }

    return { allowed: true };
  }

  canApprove(contributorId: string): TrustGateResult {
    const account = contributorAccountEngine.get(contributorId);
    if (!account) {
      return { allowed: false, reason: "editor-not-found" };
    }

    if (account.level !== "trusted-editor" && account.level !== "staff-editor") {
      return { allowed: false, reason: "insufficient-role" };
    }

    return { allowed: true };
  }
}

export const contributorTrustGateEngine = new ContributorTrustGateEngine();
