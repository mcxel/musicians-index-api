/**
 * LaunchReadinessEngine
 * PASS 24 soft-launch audit matrix.
 * Audit-only: verifies structural readiness without mutating production systems.
 */

import fs from "fs";
import path from "path";

export type LaunchCheckStatus = "pass" | "warn" | "fail";

export type LaunchDomain =
  | "acquisition"
  | "monetization"
  | "finance"
  | "retention"
  | "magazine";

export type LaunchCheck = {
  id: string;
  label: string;
  domain: LaunchDomain;
  required: boolean;
  status: LaunchCheckStatus;
  detail: string;
  evidence: string[];
};

export type LaunchReadinessReport = {
  generatedAtMs: number;
  checks: LaunchCheck[];
  launchBlockers: LaunchCheck[];
  launchReadyList: LaunchCheck[];
  domainScores: Record<LaunchDomain, number>;
  softLaunchScore: number;
};

const LIB_ROOT = path.resolve(__dirname, "..");

function libPath(...segments: string[]): string {
  return path.join(LIB_ROOT, ...segments);
}

function exists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

function read(filePath: string): string {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return "";
  }
}

function hasExports(filePath: string, names: string[]): boolean {
  const content = read(filePath);
  return names.every((name) =>
    content.includes(`export function ${name}`) ||
    content.includes(`export class ${name}`) ||
    content.includes(`export const ${name}`),
  );
}

function verifyFileExports(input: {
  id: string;
  label: string;
  domain: LaunchDomain;
  file: string;
  exports: string[];
  required?: boolean;
}): LaunchCheck {
  const required = input.required ?? true;
  const foundFile = exists(input.file);

  if (!foundFile) {
    return {
      id: input.id,
      label: input.label,
      domain: input.domain,
      required,
      status: "fail",
      detail: "Missing required audit target file",
      evidence: [path.relative(LIB_ROOT, input.file)],
    };
  }

  const ok = hasExports(input.file, input.exports);
  if (!ok) {
    return {
      id: input.id,
      label: input.label,
      domain: input.domain,
      required,
      status: "warn",
      detail: "File present but expected exports not all found",
      evidence: [path.relative(LIB_ROOT, input.file), ...input.exports],
    };
  }

  return {
    id: input.id,
    label: input.label,
    domain: input.domain,
    required,
    status: "pass",
    detail: "Verified",
    evidence: [path.relative(LIB_ROOT, input.file), ...input.exports],
  };
}

export function runLaunchReadinessAudit(): LaunchReadinessReport {
  const checks: LaunchCheck[] = [
    // --- User Acquisition & Onboarding ---
    verifyFileExports({
      id: "acq-artists",
      label: "Artist Acquisition",
      domain: "acquisition",
      file: libPath("bots", "MagazineArtistAcquisitionBotEngine.ts"),
      exports: ["MagazineArtistAcquisitionBotEngine"],
    }),
    verifyFileExports({
      id: "acq-fans",
      label: "Fan Acquisition",
      domain: "acquisition",
      file: libPath("fans", "FanOnboardingEngine.ts"),
      exports: ["discoverFanLeads"],
    }),
    verifyFileExports({
      id: "acq-venues",
      label: "Venue Acquisition",
      domain: "acquisition",
      file: libPath("tickets", "EventVenueSignupEngine.ts"),
      exports: ["createEventVenueAccount"],
    }),
    verifyFileExports({
      id: "acq-promoters",
      label: "Promoter Acquisition",
      domain: "acquisition",
      file: libPath("tickets", "EventHostAccountEngine.ts"),
      exports: ["createEventHostAccount"],
    }),
    verifyFileExports({
      id: "acq-merchants",
      label: "Merchant Acquisition",
      domain: "acquisition",
      file: libPath("merchants", "MerchantAccountEngine.ts"),
      exports: ["createMerchantAccount"],
    }),
    verifyFileExports({
      id: "acq-sponsors",
      label: "Sponsor Acquisition",
      domain: "acquisition",
      file: libPath("sponsors", "SponsorHubEngine.ts"),
      exports: ["SponsorHubEngine"],
    }),
    verifyFileExports({
      id: "acq-advertisers",
      label: "Advertiser Acquisition",
      domain: "acquisition",
      file: libPath("advertisers", "AdvertiserHubIntelligenceEngine.ts"),
      exports: ["buildAdvertiserHubIntelligence"],
    }),

    // --- Money Systems ---
    verifyFileExports({
      id: "mon-subscriptions",
      label: "Subscriptions",
      domain: "monetization",
      file: libPath("subscriptions", "SubscriptionCheckoutEngine.ts"),
      exports: ["createSubscriptionCheckout"],
    }),
    verifyFileExports({
      id: "mon-tickets",
      label: "Tickets",
      domain: "monetization",
      file: libPath("tickets", "UniversalEventTicketingEngine.ts"),
      exports: ["checkoutUniversalTicket"],
    }),
    verifyFileExports({
      id: "mon-beats",
      label: "Beats",
      domain: "monetization",
      file: libPath("beats", "BeatPurchaseEngine.ts"),
      exports: ["purchaseBeat"],
    }),
    verifyFileExports({
      id: "mon-booking",
      label: "Booking",
      domain: "monetization",
      file: libPath("venues", "VenueBookingMatchEngine.ts"),
      exports: ["buildVenueBookingMatches"],
    }),
    verifyFileExports({
      id: "mon-sponsors",
      label: "Sponsors",
      domain: "monetization",
      file: libPath("sponsors", "SponsorCheckoutEngine.ts"),
      exports: ["createSponsorCheckout"],
    }),
    verifyFileExports({
      id: "mon-article-ads",
      label: "Article Ads",
      domain: "monetization",
      file: libPath("articles", "ArticleAdvertisingEngine.ts"),
      exports: ["createArticleAdCampaign"],
    }),
    verifyFileExports({
      id: "mon-venue-boosts",
      label: "Venue Boosts",
      domain: "monetization",
      file: libPath("venues", "VenuePromotionEngine.ts"),
      exports: ["createVenuePromotion"],
    }),
    verifyFileExports({
      id: "mon-merchant-promotions",
      label: "Merchant Promotions",
      domain: "monetization",
      file: libPath("merchants", "MerchantPromotionEngine.ts"),
      exports: ["createMerchantPromotion"],
    }),
    verifyFileExports({
      id: "mon-live-tips",
      label: "Live Tips",
      domain: "monetization",
      file: libPath("live", "LiveTipEngine.ts"),
      exports: ["sendLiveTip"],
    }),

    // --- Financial Truth ---
    verifyFileExports({
      id: "fin-ledger",
      label: "Ledger",
      domain: "finance",
      file: libPath("revenue", "RevenueLedgerEngine.ts"),
      exports: ["recordRevenueLedgerEntry"],
    }),
    verifyFileExports({
      id: "fin-payouts",
      label: "Payouts",
      domain: "finance",
      file: libPath("revenue", "PayoutEngine.ts"),
      exports: ["createPayout"],
    }),
    verifyFileExports({
      id: "fin-refunds",
      label: "Refunds",
      domain: "finance",
      file: libPath("revenue", "RefundEngine.ts"),
      exports: ["requestRefund"],
    }),
    verifyFileExports({
      id: "fin-taxes",
      label: "Taxes",
      domain: "finance",
      file: libPath("revenue", "TaxSettlementEngine.ts"),
      exports: ["recordTaxSettlement"],
    }),

    // --- Retention Systems ---
    verifyFileExports({
      id: "ret-social",
      label: "Social",
      domain: "retention",
      file: libPath("social", "SocialLoopEngine.ts"),
      exports: ["getSocialLoopSummary"],
    }),
    verifyFileExports({
      id: "ret-messages",
      label: "Messages",
      domain: "retention",
      file: libPath("messages", "DirectMessageEngine.ts"),
      exports: ["sendDirectMessage"],
    }),
    verifyFileExports({
      id: "ret-notifications",
      label: "Notifications",
      domain: "retention",
      file: libPath("events", "PlatformNotificationEngine.ts"),
      exports: ["createPlatformNotification"],
    }),
    verifyFileExports({
      id: "ret-live-rooms",
      label: "Live Rooms",
      domain: "retention",
      file: libPath("live", "LiveRoomEngine.ts"),
      exports: ["createLiveRoom"],
    }),
    verifyFileExports({
      id: "ret-tips",
      label: "Tips",
      domain: "retention",
      file: libPath("live", "LiveTipEngine.ts"),
      exports: ["sendLiveTip"],
    }),
    verifyFileExports({
      id: "ret-rewards",
      label: "Rewards",
      domain: "retention",
      file: libPath("live", "LiveRewardEngine.ts"),
      exports: ["grantAttendanceReward"],
    }),

    // --- Magazine Systems ---
    verifyFileExports({
      id: "mag-issue-rotation",
      label: "Issue Rotation",
      domain: "magazine",
      file: libPath("magazine", "MagazineIssueEngine.ts"),
      exports: ["createMonthlyMagazineIssue"],
    }),
    verifyFileExports({
      id: "mag-article-rotation",
      label: "Article rotation",
      domain: "magazine",
      file: libPath("magazine", "MagazineRotationEngine.ts"),
      exports: ["rotateArticles"],
    }),
    verifyFileExports({
      id: "mag-ad-rotation",
      label: "Ad rotation",
      domain: "magazine",
      file: libPath("magazine", "MagazineRotationEngine.ts"),
      exports: ["rotateAdsForIssue"],
    }),
    verifyFileExports({
      id: "mag-sponsor-rotation",
      label: "Sponsor rotation",
      domain: "magazine",
      file: libPath("magazine", "MagazineRotationEngine.ts"),
      exports: ["rotateSponsorsForIssue"],
    }),
    verifyFileExports({
      id: "mag-feature-rotation",
      label: "Feature rotation",
      domain: "magazine",
      file: libPath("magazine", "MagazineFeatureRotationEngine.ts"),
      exports: ["rotateFeaturedArtists"],
    }),
  ];

  const launchBlockers = checks.filter((c) => c.required && c.status === "fail");
  const launchReadyList = checks.filter((c) => c.status === "pass");

  const domains: LaunchDomain[] = [
    "acquisition",
    "monetization",
    "finance",
    "retention",
    "magazine",
  ];

  const domainScores = domains.reduce((acc, domain) => {
    const domainChecks = checks.filter((c) => c.domain === domain);
    const max = domainChecks.length || 1;
    const points = domainChecks.reduce((sum, c) => {
      if (c.status === "pass") return sum + 1;
      if (c.status === "warn") return sum + 0.5;
      return sum;
    }, 0);
    acc[domain] = Math.round((points / max) * 100);
    return acc;
  }, {} as Record<LaunchDomain, number>);

  const totalPoints = checks.reduce((sum, c) => {
    if (c.status === "pass") return sum + 1;
    if (c.status === "warn") return sum + 0.5;
    return sum;
  }, 0);

  const softLaunchScore = Math.round((totalPoints / checks.length) * 100);

  return {
    generatedAtMs: Date.now(),
    checks,
    launchBlockers,
    launchReadyList,
    domainScores,
    softLaunchScore,
  };
}
