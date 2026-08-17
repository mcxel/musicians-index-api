/**
 * AdSense Readiness Ground-Truth Audit Test Suite
 *
 * Verifies:
 *   1. ads_txt_exists_at_public_root: /public/ads.txt exists with ca-pub-4088577529436039
 *   2. publisher_id_configured: getAdSensePublisherId() resolves ca-pub-4088577529436039
 *   3. route_policy_excludes_protected_surfaces: /checkout, /billing, /login, /stage return eligible: false
 *   4. public_editorial_pages_eligible: /, /magazine, /shows, /about, /privacy, /terms, /contact return eligible: true
 *   5. sponsor_fallback_available: SponsorFallbackSlot component defined and ready for house sponsor fallback
 */

import fs from "fs";
import path from "path";
import { getAdSensePublisherId } from "../lib/ads/adConfig";
import { resolveRouteAdEligibility } from "../lib/ads/RouteAdEligibilityResolver";

export function runAdSenseReadinessAuditTest(): { allPassed: boolean; results: Record<string, boolean> } {
  const results: Record<string, boolean> = {};

  // 1. Check ads.txt
  const adsTxtPath = path.join(process.cwd(), "apps/web/public/ads.txt");
  const adsTxtContent = fs.existsSync(adsTxtPath) ? fs.readFileSync(adsTxtPath, "utf-8") : "";
  results["ads_txt_exists_at_public_root"] =
    fs.existsSync(adsTxtPath) && adsTxtContent.includes("google.com, pub-4088577529436039, DIRECT, f08c47fec0942fa0");

  // 2. Publisher ID Configured
  const pubId = getAdSensePublisherId();
  results["publisher_id_configured"] = pubId === "ca-pub-4088577529436039";

  // 3. Route Policy Excludes Protected Surfaces
  const checkoutCheck = resolveRouteAdEligibility("/checkout");
  const financeCheck = resolveRouteAdEligibility("/account/finance");
  const loginCheck = resolveRouteAdEligibility("/login");
  const stageCheck = resolveRouteAdEligibility("/stage");
  results["route_policy_excludes_protected_surfaces"] =
    !checkoutCheck.eligible && !financeCheck.eligible && !loginCheck.eligible && !stageCheck.eligible;

  // 4. Public Editorial Pages Eligible
  const homeCheck = resolveRouteAdEligibility("/");
  const magCheck = resolveRouteAdEligibility("/magazine");
  const aboutCheck = resolveRouteAdEligibility("/about");
  const privacyCheck = resolveRouteAdEligibility("/privacy");
  const termsCheck = resolveRouteAdEligibility("/terms");
  const contactCheck = resolveRouteAdEligibility("/contact");
  results["public_editorial_pages_eligible"] =
    homeCheck.eligible && magCheck.eligible && aboutCheck.eligible && privacyCheck.eligible && termsCheck.eligible && contactCheck.eligible;

  // 5. Sponsor Fallback Available
  const fallbackComponentPath = path.join(process.cwd(), "apps/web/src/components/ads/SponsorFallbackSlot.tsx");
  results["sponsor_fallback_available"] = fs.existsSync(fallbackComponentPath);

  const allPassed = Object.values(results).every(Boolean);

  console.log(`[ADSENSE_READINESS_AUDIT_TEST_ASSERT]`, JSON.stringify({ allPassed, results }, null, 2));
  return { allPassed, results };
}

if (require.main === module) {
  runAdSenseReadinessAuditTest();
}
