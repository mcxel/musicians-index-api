import { contributorAccountEngine } from "@/lib/editorial-economy/ContributorAccountEngine";
import { isSystemSourceContributorId } from "@/lib/newsroom/NewsroomSystemSource";

export interface TrustGateResult {
  allowed: boolean;
  reason?: string;
}

class ContributorTrustGateEngine {
  /**
   * §20982 — a SYSTEM_SOURCE submission (id prefix "system:newsroom:") never
   * has (and must never get) a ContributorAccount row — that model carries
   * payoutCapUsd, a human-payable-contributor concept. Trust for a system
   * source was already established upstream by the connector's own
   * trustTier/rightsMode (NewsSourceConnectorRegistry), not by human account
   * history, so submission is allowed here without a human lookup.
   */
  async canSubmit(contributorId: string): Promise<TrustGateResult> {
    if (isSystemSourceContributorId(contributorId)) {
      return { allowed: true };
    }

    const account = await contributorAccountEngine.get(contributorId);
    if (!account) {
      return { allowed: false, reason: "contributor-not-found" };
    }

    if (account.level === "new-contributor" && account.trustScore < 20) {
      return { allowed: false, reason: "low-trust" };
    }

    return { allowed: true };
  }

  /**
   * A system source may submit but must NEVER approve/publish itself —
   * bots run the ingestion operation, a human editor still makes the
   * editorial decision. This is the same "bots never fabricate the result"
   * boundary applied to the newsroom.
   */
  async canApprove(contributorId: string): Promise<TrustGateResult> {
    if (isSystemSourceContributorId(contributorId)) {
      return { allowed: false, reason: "system-source-cannot-self-approve" };
    }

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
