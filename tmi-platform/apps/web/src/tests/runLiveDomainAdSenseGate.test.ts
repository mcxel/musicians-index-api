/**
 * LIVE-DOMAIN AdSense production-drift gate (Track B).
 * Honest PASS / FAIL / BLOCKED only. Never claims Google approval.
 * Do not request AdSense review until every row is GREEN (PASS) — BLOCKED ops ≠ GREEN.
 */

import fs from "fs";
import path from "path";
import {
  decideAdSenseLoad,
  detectNonHumanClientTraffic,
} from "../lib/ads/AdLoadDirector";
import { getAdSensePublisherId, hasAnyAdSenseSlotConfigured } from "../lib/ads/adConfig";
import { MAGAZINE_ISSUE_1 } from "../lib/magazine/magazineIssueData";
import { INDEXABLE_STATIC_ROUTES } from "../lib/seo/SeoIndexingRules";

export type GateStatus = "PASS" | "FAIL" | "BLOCKED" | "N/A";

export type LiveDomainGateRow = {
  id: string;
  status: GateStatus;
  evidence: string;
};

function webRoot(...parts: string[]): string {
  const candidates = [
    path.join(process.cwd(), "apps", "web", ...parts),
    path.join(process.cwd(), ...parts),
  ];
  return candidates.find((p) => fs.existsSync(p)) ?? candidates[0]!;
}

function readSrc(...parts: string[]): string {
  const p = webRoot("src", ...parts);
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
}

function readPublic(...parts: string[]): string {
  const p = webRoot("public", ...parts);
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
}

export function runLiveDomainAdSenseGates(): {
  rows: LiveDomainGateRow[];
  summary: Record<GateStatus, number>;
  reviewReady: boolean;
} {
  const rows: LiveDomainGateRow[] = [];

  // 1. Privacy — no contradictory no-ad-cookies; AdSense disclosed
  const privacy = readSrc("app", "privacy", "page.tsx");
  const privacyOk =
    /Advertising Partners|Google AdSense/i.test(privacy) &&
    !/We do not use third-party advertising cookies/i.test(privacy);
  rows.push({
    id: "LIVE-DOMAIN-01_privacy_adsense_truth",
    status: privacyOk ? "PASS" : "FAIL",
    evidence: privacyOk
      ? "Privacy discloses AdSense; no false no-ad-cookie claim"
      : "Privacy still denies ad cookies or missing AdSense disclosure",
  });

  // 2. /disclosures exists with substantive content
  const disclosures = readSrc("app", "disclosures", "page.tsx");
  const disclosuresOk =
    disclosures.includes("Google AdSense") &&
    disclosures.includes("billable") &&
    disclosures.length > 800;
  rows.push({
    id: "LIVE-DOMAIN-02_disclosures_route",
    status: disclosuresOk ? "PASS" : "FAIL",
    evidence: disclosuresOk
      ? "disclosures/page.tsx present with AdSense + bot disclosure"
      : "Missing or thin /disclosures page",
  });

  // 3. Unsupported cash/prize claims softened on public magazine Issue 1
  const magText = JSON.stringify(MAGAZINE_ISSUE_1);
  const fakeRevenue =
    /\$2M streaming|\$400,000 in license|\$38,000 per month|\$250,000 across|\$22,000 per month from the platform/i.test(
      magText,
    );
  rows.push({
    id: "LIVE-DOMAIN-03_unsupported_revenue_claims",
    status: fakeRevenue ? "FAIL" : "PASS",
    evidence: fakeRevenue
      ? "Magazine Issue 1 still contains unverifiable revenue/prize dollar claims"
      : "Issue 1 dollar fabrications removed or reframed as illustrative/Launch Mode",
  });

  // 4. Closed Magazine Shell gone from public home loading
  const homeLoading = readSrc("app", "home", "loading.tsx");
  const shellGone =
    !homeLoading.includes("ClosedMagazineShell") &&
    !/Initializing magazine shell/i.test(homeLoading);
  rows.push({
    id: "LIVE-DOMAIN-04_no_closed_magazine_shell",
    status: shellGone ? "PASS" : "FAIL",
    evidence: shellGone
      ? "home/loading.tsx uses quiet Loading home state"
      : "Closed Magazine Shell / Initializing still on public home loading",
  });

  // 5. Performer public profile defensive params + registry redirect
  const performerPublic = readSrc("app", "profile", "performer", "[slug]", "page.tsx");
  const performerAlias = readSrc("app", "performers", "[slug]", "page.tsx");
  const performerOk =
    performerPublic.includes("maybePromise") &&
    (performerAlias.includes("redirect(`/profile/performer/") ||
      (performerAlias.includes("canonicalPublicPath") &&
        performerAlias.includes("redirect(")));
  rows.push({
    id: "LIVE-DOMAIN-05_performer_profile_runtime",
    status: performerOk ? "PASS" : "FAIL",
    evidence: performerOk
      ? "Public performer slug resolves via redirect + defensive params handling"
      : "Performer public runtime still missing defensive wiring",
  });

  // 6. Substantive public content (magazine Issue 1 has 5+ articles)
  rows.push({
    id: "LIVE-DOMAIN-06_substantive_public_content",
    status: MAGAZINE_ISSUE_1.length >= 5 ? "PASS" : "FAIL",
    evidence: `MAGAZINE_ISSUE_1 articles=${MAGAZINE_ISSUE_1.length}`,
  });

  // 7. Mobile/desktop ad placement safety chrome
  const adSlot = readSrc("components", "ads", "AdSenseSlot.tsx");
  const adUnit = readSrc("components", "ads", "TMIAdSenseUnit.tsx");
  const safePlacement =
    adSlot.includes('data-ad-safe="true"') &&
    adSlot.includes("minHeight: 90") &&
    adUnit.includes("decideAdSenseLoad") &&
    adUnit.includes('data-ad-safe="true"');
  rows.push({
    id: "LIVE-DOMAIN-07_ad_placement_safe",
    status: safePlacement ? "PASS" : "FAIL",
    evidence: safePlacement
      ? "Labeled AdSense units with padding + minHeight via AdLoadDirector"
      : "Ad placement safety chrome missing",
  });

  // 8. Bot/QA/cert excluded from billable ads
  const qaBlocked = decideAdSenseLoad({
    pathname: "/magazine",
    hasConsent: true,
    nonHuman: true,
    billableAds: false,
  });
  const detectOk =
    detectNonHumanClientTraffic({ userAgent: "HeadlessChrome" }) === true &&
    detectNonHumanClientTraffic({ userAgent: "Mozilla/5.0", search: "?tmi_cert=1" }) === true &&
    detectNonHumanClientTraffic({ userAgent: "Mozilla/5.0 Chrome/120" }) === false;
  rows.push({
    id: "LIVE-DOMAIN-08_bot_qa_excluded",
    status: !qaBlocked.allowed && detectOk ? "PASS" : "FAIL",
    evidence: `decide=${qaBlocked.reason}; detectNonHumanClientTraffic wired`,
  });

  // 9. Crawl readiness — robots + sitemap + canonicals + legal indexables
  const robots = readSrc("app", "robots.ts");
  const sitemap = readSrc("app", "sitemap.ts");
  const layout = readSrc("app", "layout.tsx");
  const crawlOk =
    robots.includes("AdsBot-Google") &&
    robots.includes("/disclosures") &&
    sitemap.includes("SitemapAuthorityEngine") &&
    layout.includes('canonical: "https://themusiciansindex.com"') &&
    (INDEXABLE_STATIC_ROUTES as readonly string[]).includes("/disclosures") &&
    (INDEXABLE_STATIC_ROUTES as readonly string[]).includes("/privacy");
  rows.push({
    id: "LIVE-DOMAIN-09_crawl_readiness",
    status: crawlOk ? "PASS" : "FAIL",
    evidence: crawlOk
      ? "robots AdsBot allow + sitemap engine + canonical + /privacy+/disclosures indexable"
      : "Crawl assets incomplete",
  });

  // 10. Publisher ID, singleton script, ads.txt — slots honest
  const adsTxt = readPublic("ads.txt");
  const appAds = readPublic("app-ads.txt");
  const consent = readSrc("components", "ads", "AdConsentBanner.tsx");
  const pub = getAdSensePublisherId();
  const infraOk =
    adsTxt.includes("google.com, pub-4088577529436039, DIRECT, f08c47fec0942fa0") &&
    appAds.includes("pub-4088577529436039") &&
    pub === "ca-pub-4088577529436039" &&
    consent.includes("tmi-adsense-loader") &&
    consent.includes("if (document.getElementById('tmi-adsense-loader')) return") &&
    layout.includes("google-adsense-account");
  const slotsConfigured = hasAnyAdSenseSlotConfigured();
  rows.push({
    id: "LIVE-DOMAIN-10_publisher_singleton_ads_txt",
    status: infraOk ? (slotsConfigured ? "PASS" : "BLOCKED") : "FAIL",
    evidence: infraOk
      ? slotsConfigured
        ? "Publisher + singleton loader + ads.txt OK; slots configured in ENV"
        : "Publisher + singleton + ads.txt OK — SLOT IDs not in ENV (ops BLOCKED, not code FAIL). Populating slots ≠ review readiness."
      : "Publisher / ads.txt / singleton script failure",
  });

  const summary: Record<GateStatus, number> = { PASS: 0, FAIL: 0, BLOCKED: 0, "N/A": 0 };
  for (const row of rows) summary[row.status] += 1;
  const reviewReady = summary.FAIL === 0 && summary.BLOCKED === 0;
  console.log(
    "[LIVE_DOMAIN_ADSENSE_GATE]",
    JSON.stringify(
      {
        reviewReady,
        doNotRequestReviewUntilGreen: !reviewReady,
        summary,
        rows,
      },
      null,
      2,
    ),
  );
  return { rows, summary, reviewReady };
}

if (typeof require !== "undefined" && require.main === module) {
  const { reviewReady, summary } = runLiveDomainAdSenseGates();
  if (!reviewReady) {
    console.log("Do not request AdSense review until LIVE-DOMAIN is GREEN.");
  }
  process.exit(summary.FAIL > 0 ? 1 : 0);
}
