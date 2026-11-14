import { contributorAccountEngine } from "@/lib/editorial-economy/ContributorAccountEngine";

export interface TrustGateResult {
  allowed: boolean;
  reason?: string;
}

class ContributorTrustGateEngine {
  async canSubmit(contributorId: string): Promise<TrustGateResult> {
    const account = await contributorAccountEngine.get(contributorId);
    if (!account) {
      return { allowed: false, reason: "contributor-not-found" };
    }

    if (account.level === "new-contributor" && account.trustScore < 20) {
      return { allowed: false, reason: "low-trust" };
    }

    return { allowed: true };
  }

  async canApprove(contributorId: string): Promise<TrustGateResult> {
    const account = await contributorAccountEngine.get(contributorId);
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
