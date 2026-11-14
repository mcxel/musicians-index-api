/**
 * AdSenseObservatoryMonitor — Observatory / impression honesty facade.
 * Reuses JumbotronAdObservatoryControlRoom + VenueAdImpressionLedger.
 * ESTIMATED ≠ PAYABLE ≠ PAID — this monitor never invents payout states.
 */

import { VenueAdImpressionLedger } from "@/lib/ads/VenueAdImpressionLedger";
import type { ViewabilityFrustumSample } from "@/lib/jumbotron/JumbotronAdContracts";

export type AdRevenueTruthState = "ESTIMATED" | "PAYABLE" | "PAID" | "REJECTED" | "ASSIGNED_ONLY";

export type ObservatoryImpressionVerdict = {
  truth: AdRevenueTruthState;
  billableAds: boolean;
  viewabilityPassed: boolean;
  rejectReason?: string;
};

/**
 * Map ledger outcome → honest revenue truth.
 * Bots / QA / offscreen never become PAYABLE or PAID.
 */
export function classifyImpressionTruth(input: {
  viewabilityPassed: boolean;
  rejectReason?: string;
  payoutConfirmed?: boolean;
}): ObservatoryImpressionVerdict {
  if (!input.viewabilityPassed) {
    return {
      truth: input.rejectReason ? "REJECTED" : "ASSIGNED_ONLY",
      billableAds: false,
      viewabilityPassed: false,
      rejectReason: input.rejectReason,
    };
  }
  if (input.payoutConfirmed === true) {
    return { truth: "PAID", billableAds: true, viewabilityPassed: true };
  }
  // Viewable ≠ payable ≠ paid. Platform may estimate, never claim paid.
  return { truth: "ESTIMATED", billableAds: true, viewabilityPassed: true };
}

export function evaluateBotSafeViewability(
  ledger: VenueAdImpressionLedger,
  assignmentId: string,
  frustum: ViewabilityFrustumSample,
): ObservatoryImpressionVerdict {
  const entry = ledger.evaluateViewability(assignmentId, frustum);
  if (!entry) {
    return { truth: "ASSIGNED_ONLY", billableAds: false, viewabilityPassed: false, rejectReason: "MISSING" };
  }
  return classifyImpressionTruth({
    viewabilityPassed: entry.viewabilityPassed,
    rejectReason: entry.rejectReason,
    payoutConfirmed: false,
  });
}

export const AdSenseObservatoryMonitor = {
  classifyImpressionTruth,
  evaluateBotSafeViewability,
  createLedger: () => new VenueAdImpressionLedger(),
};
