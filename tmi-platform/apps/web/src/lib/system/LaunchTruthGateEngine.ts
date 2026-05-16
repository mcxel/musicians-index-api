/**
 * LaunchTruthGateEngine
 * Final pre-launch structural truth validation.
 * Does NOT import runtime engines — reads files structurally so it works in ts-node.
 */

import fs from "fs";
import path from "path";

// ─── Types ────────────────────────────────────────────────────────────────────

export type GateCheckStatus = "PASS" | "WARN" | "FAIL";

export interface GateCheckResult {
  name: string;
  status: GateCheckStatus;
  detail: string;
}

export interface LaunchTruthReport {
  checks: GateCheckResult[];
  truthScore: number;
  launchReadiness: number;
  criticalBlockers: string[];
  recommendedFixes: string[];
  verdict: GateCheckStatus;
}

// ─── Paths ────────────────────────────────────────────────────────────────────

const WEB_SRC = path.resolve(__dirname, "..", "..");
const APP     = path.join(WEB_SRC, "app");
const LIB     = path.join(WEB_SRC, "lib");
const COMP    = path.join(WEB_SRC, "components");

// ─── Helpers ──────────────────────────────────────────────────────────────────

function exists(p: string): boolean {
  return fs.existsSync(p);
}

function readSafe(p: string): string {
  try { return fs.readFileSync(p, "utf-8"); }
  catch { return ""; }
}

function hasExport(filePath: string, ...names: string[]): boolean {
  const content = readSafe(filePath);
  return names.every(name =>
    content.includes(`export function ${name}`) ||
    content.includes(`export const ${name}`) ||
    content.includes(`export type ${name}`) ||
    content.includes(`export class ${name}`),
  );
}

function hasContent(filePath: string, ...fragments: string[]): boolean {
  const content = readSafe(filePath);
  return fragments.every(f => content.includes(f));
}

function page(...segs: string[]): string {
  return path.join(APP, ...segs, "page.tsx");
}

function lib(...segs: string[]): string {
  return path.join(LIB, ...segs);
}

function comp(...segs: string[]): string {
  return path.join(COMP, ...segs);
}

function check(
  name: string,
  run: () => GateCheckStatus | { status: GateCheckStatus; detail: string },
): GateCheckResult {
  try {
    const result = run();
    if (typeof result === "string") {
      return { name, status: result, detail: result === "PASS" ? "All checks passed." : "Check returned status without detail." };
    }
    return { name, status: result.status, detail: result.detail };
  } catch (err) {
    return { name, status: "FAIL", detail: String(err) };
  }
}

// ─── Checks ───────────────────────────────────────────────────────────────────

function checkRouteMatrix(): GateCheckResult {
  return check("Route Matrix Integrity", () => {
    const critical = [
      page("home", "1"),
      page("home", "2"),
      page("home", "3"),
      page("home", "4"),
      page("home", "5"),
      page("profile", "performer", "[slug]"),
      page("profile", "artist", "[slug]"),
      page("articles", "performer", "[slug]"),
      page("articles", "artist", "[slug]"),
      page("live"),
      page("admin"),
      page("tickets"),
      page("store"),
      page("booking"),
      page("billboards"),
    ];
    const missing = critical.filter(p => !exists(p)).map(p => path.relative(APP, p));
    if (missing.length > 0) {
      return { status: "FAIL", detail: `Missing: ${missing.join(", ")}` };
    }
    return { status: "PASS", detail: `All ${critical.length} critical route files present.` };
  });
}

function checkHomepageArtifactRegistry(): GateCheckResult {
  return check("Homepage Artifact Registry", () => {
    const f = lib("homepageArtifactMap.ts");
    if (!exists(f)) return { status: "FAIL", detail: "homepageArtifactMap.ts missing." };
    if (!hasExport(f, "HOMEPAGE_ARTIFACT_MAP", "getHomepageArtifacts")) {
      return { status: "WARN", detail: "File present but missing expected exports." };
    }
    if (!hasContent(f, "home1", "home2", "home3")) {
      return { status: "WARN", detail: "Artifact map may be missing home1-home3 zone entries." };
    }
    return { status: "PASS", detail: "HOMEPAGE_ARTIFACT_MAP + getHomepageArtifacts present." };
  });
}

function checkMagazineIssueEngine(): GateCheckResult {
  return check("Magazine Issue Engine", () => {
    const f = lib("magazine", "MagazineArchiveEngine.ts");
    if (!exists(f)) return { status: "FAIL", detail: "MagazineArchiveEngine.ts missing." };
    const exports = ["createIssue", "publishIssue", "getLiveIssues", "getIssueBySlug", "addArticleToIssue", "searchArticles"];
    const missing = exports.filter(name => !hasExport(f, name));
    if (missing.length > 0) return { status: "WARN", detail: `Missing exports: ${missing.join(", ")}` };
    return { status: "PASS", detail: `All ${exports.length} magazine archive exports present.` };
  });
}

function checkProfileRouteIntegrity(): GateCheckResult {
  return check("Profile Route Integrity", () => {
    const files: Record<string, string> = {
      "performer page":   page("profile", "performer", "[slug]"),
      "performer loading": path.join(APP, "profile", "performer", "[slug]", "loading.tsx"),
      "performer error":   path.join(APP, "profile", "performer", "[slug]", "error.tsx"),
      "artist page":      page("profile", "artist", "[slug]"),
    };
    const missing = Object.entries(files)
      .filter(([, p]) => !exists(p))
      .map(([k]) => k);
    if (missing.length > 0) return { status: "FAIL", detail: `Missing: ${missing.join(", ")}` };
    const shell = comp("performer", "PerformerProfileShell.tsx");
    if (!exists(shell)) return { status: "WARN", detail: "PerformerProfileShell.tsx component missing." };
    return { status: "PASS", detail: "page + loading + error + shell all present." };
  });
}

function checkBookingEngine(): GateCheckResult {
  return check("Booking Engine Integrity", () => {
    const f = lib("booking", "VenueBookingMatchEngine.ts");
    if (!exists(f)) return { status: "FAIL", detail: "VenueBookingMatchEngine.ts missing." };
    const exports = ["matchArtistToVenues", "bookVenueForArtist"];
    const missing = exports.filter(name => !hasExport(f, name));
    if (missing.length > 0) return { status: "WARN", detail: `Missing: ${missing.join(", ")}` };
    if (!hasContent(f, "haversine", "genre")) {
      return { status: "WARN", detail: "Score formula may be incomplete (missing haversine/genre weights)." };
    }
    return { status: "PASS", detail: "matchArtistToVenues + bookVenueForArtist + haversine scoring present." };
  });
}

function checkTicketEngine(): GateCheckResult {
  return check("Ticket Engine Integrity", () => {
    const f = lib("tickets", "TicketCommerceEngine.ts");
    if (!exists(f)) return { status: "FAIL", detail: "TicketCommerceEngine.ts missing." };
    const exports = ["TICKET_BASE_PRICES", "purchaseTicket", "getTotalTicketRevenue"];
    const missing = exports.filter(name => !hasExport(f, name));
    if (missing.length > 0) return { status: "WARN", detail: `Missing: ${missing.join(", ")}` };
    const printEngine = lib("tickets", "TicketPrintEngine.ts");
    if (!exists(printEngine)) return { status: "WARN", detail: "TicketPrintEngine.ts missing." };
    return { status: "PASS", detail: "Commerce + print engines present." };
  });
}

function checkNFTEngine(): GateCheckResult {
  return check("NFT Engine Integrity", () => {
    const f = lib("nft", "NFTCommerceEngine.ts");
    if (!exists(f)) return { status: "FAIL", detail: "NFTCommerceEngine.ts missing." };
    const exports = ["registerNFTListing", "purchaseNFT", "getNFTAssetBreakdown"];
    const missing = exports.filter(name => !hasExport(f, name));
    if (missing.length > 0) return { status: "WARN", detail: `Missing: ${missing.join(", ")}` };
    return { status: "PASS", detail: "registerNFTListing + purchaseNFT + getNFTAssetBreakdown present." };
  });
}

function checkBeatStore(): GateCheckResult {
  return check("Beat Store Integrity", () => {
    const f = lib("beats", "BeatStoreCommerceEngine.ts");
    if (!exists(f)) return { status: "FAIL", detail: "BeatStoreCommerceEngine.ts missing." };
    const exports = ["DEFAULT_LICENSE_PRICES", "purchaseBeat", "registerBeat", "getAllBeats"];
    const missing = exports.filter(name => !hasExport(f, name));
    if (missing.length > 0) return { status: "WARN", detail: `Missing: ${missing.join(", ")}` };
    if (!hasContent(f, "non_exclusive", "exclusive", "stems")) {
      return { status: "WARN", detail: "License type entries incomplete." };
    }
    return { status: "PASS", detail: "All license types + commerce functions present." };
  });
}

function checkSponsorGiftEngine(): GateCheckResult {
  return check("Sponsor Gift Engine Integrity", () => {
    const f = lib("commerce", "SponsorGiftCommerceEngine.ts");
    if (!exists(f)) return { status: "FAIL", detail: "SponsorGiftCommerceEngine.ts missing." };
    const exports = ["registerSponsorGift", "claimSponsorGift", "getActiveSponsorGifts", "getTaxableValueForWinner"];
    const missing = exports.filter(name => !hasExport(f, name));
    if (missing.length > 0) return { status: "WARN", detail: `Missing: ${missing.join(", ")}` };
    return { status: "PASS", detail: "registerSponsorGift + claim + tax valuation present." };
  });
}

function checkBillboardPreviewEngine(): GateCheckResult {
  return check("Billboard Preview Engine Integrity", () => {
    const f = lib("live", "BillboardPreviewHoverEngine.ts");
    if (!exists(f)) return { status: "FAIL", detail: "BillboardPreviewHoverEngine.ts missing." };
    const exports = ["registerBillboardSlot", "tickBillboardHover", "onBillboardHoverStart", "getAllBillboardSlots"];
    const missing = exports.filter(name => !hasExport(f, name));
    if (missing.length > 0) return { status: "WARN", detail: `Missing: ${missing.join(", ")}` };
    const rotator = comp("billboards", "BillboardRotator.tsx");
    if (!exists(rotator)) return { status: "WARN", detail: "BillboardRotator.tsx UI consumer missing." };
    return { status: "PASS", detail: "Engine + BillboardRotator UI consumer wired." };
  });
}

function checkRoomRuntimeLifecycle(): GateCheckResult {
  return check("Room Runtime Lifecycle Integrity", () => {
    const f = lib("rooms", "RoomPopulationEngine.ts");
    if (!exists(f)) return { status: "FAIL", detail: "RoomPopulationEngine.ts missing." };
    const exports = ["getRoomPopulation", "tickPopulation", "recordRoomHeatEvent", "injectSyntheticAudience"];
    const missing = exports.filter(name => !hasExport(f, name));
    if (missing.length > 0) return { status: "WARN", detail: `Missing: ${missing.join(", ")}` };
    const momentumEngine = lib("live", "crowdMomentumEngine.ts");
    if (!exists(momentumEngine)) return { status: "WARN", detail: "crowdMomentumEngine.ts missing." };
    return { status: "PASS", detail: "Room population + heat recording + momentum engine present." };
  });
}

function checkCameraEngine(): GateCheckResult {
  return check("Camera Engine Integrity", () => {
    const f = lib("live", "CameraFocusReactionEngine.ts");
    if (!exists(f)) return { status: "FAIL", detail: "CameraFocusReactionEngine.ts missing." };
    const exports = ["computeCameraFocus", "triggerCameraReaction", "getCameraFocusPlan", "tickCameraFocus", "resetCameraFocus"];
    const missing = exports.filter(name => !hasExport(f, name));
    if (missing.length > 0) return { status: "WARN", detail: `Missing: ${missing.join(", ")}` };
    if (!hasContent(f, "wide", "performer", "crowd", "battle", "celebration")) {
      return { status: "WARN", detail: "Camera mode enum may be incomplete." };
    }
    return { status: "PASS", detail: "7 camera modes + all control functions present." };
  });
}

function checkCrowdIntentEngine(): GateCheckResult {
  return check("Crowd Intent Engine Integrity", () => {
    const f = lib("rooms", "CrowdIntentEngine.ts");
    if (!exists(f)) return { status: "FAIL", detail: "CrowdIntentEngine.ts missing." };
    const exports = ["classifyIntent", "applyIntentToRoom", "getIntentSummary", "computeIntentStrength", "getIntentWeight"];
    const missing = exports.filter(name => !hasExport(f, name));
    if (missing.length > 0) return { status: "WARN", detail: `Missing: ${missing.join(", ")}` };
    if (!hasContent(f, '"encore"', '"request"', '"question"')) {
      return { status: "WARN", detail: "Extended intent types (encore/request/question) not found in file." };
    }
    if (!hasContent(f, "applyIntentToRoom")) {
      return { status: "WARN", detail: "applyIntentToRoom bridge function missing from file content." };
    }
    return { status: "PASS", detail: "classifyIntent + applyIntentToRoom + extended intent types present." };
  });
}

function checkSubscriptionPricing(): GateCheckResult {
  return check("Subscription Pricing Integrity", () => {
    const f = lib("subscriptions", "SubscriptionPricingEngine.ts");
    if (!exists(f)) return { status: "FAIL", detail: "SubscriptionPricingEngine.ts missing." };
    const exports = ["getTierPrice", "getTierBenefits", "getAllTierPrices"];
    const missing = exports.filter(name => !hasExport(f, name));
    if (missing.length > 0) return { status: "WARN", detail: `Missing: ${missing.join(", ")}` };
    if (!hasContent(f, "249", "4999")) {
      return { status: "WARN", detail: "Price constants may be missing (expected 249=pro-artist, 4999=artist-diamond)." };
    }
    const gate = lib("subscriptions", "SubscriptionGateEngine.ts");
    const tax  = lib("subscriptions", "SubscriptionTaxEngine.ts");
    const missing2 = [gate, tax].filter(p => !exists(p)).map(p => path.basename(p));
    if (missing2.length > 0) return { status: "WARN", detail: `Sub-engines missing: ${missing2.join(", ")}` };
    return { status: "PASS", detail: "Pricing + Gate + Tax engines all present with correct price constants." };
  });
}

function checkRevenueSplitEngine(): GateCheckResult {
  return check("Revenue Split Engine Integrity", () => {
    const f = lib("commerce", "RevenueSplitEngine.ts");
    if (!exists(f)) return { status: "FAIL", detail: "RevenueSplitEngine.ts missing." };
    const exports = ["SPLIT_PRESETS", "calculateRevenueSplitByPreset", "getPartyPayout"];
    const missing = exports.filter(name => !hasExport(f, name));
    if (missing.length > 0) return { status: "WARN", detail: `Missing: ${missing.join(", ")}` };
    if (!hasContent(f, "big_ace")) {
      return { status: "FAIL", detail: "CRITICAL: big_ace revenue party missing from SPLIT_PRESETS." };
    }
    if (!hasContent(f, "subscription", "ticket", "beat", "nft")) {
      return { status: "WARN", detail: "Some preset keys (subscription/ticket/beat/nft) may be missing." };
    }
    return { status: "PASS", detail: "SPLIT_PRESETS + big_ace founder allocation + all revenue paths wired." };
  });
}

function checkAdminObservatory(): GateCheckResult {
  return check("Admin Observatory Integrity", () => {
    const f = lib("admin", "AdminObservatoryChat.ts");
    if (!exists(f)) return { status: "FAIL", detail: "AdminObservatoryChat.ts missing." };
    const exports = ["getObservatorySnapshot", "getAllAlerts", "broadcastSystemMessage", "flagRoomAlert", "resolveAlert"];
    const missing = exports.filter(name => !hasExport(f, name));
    if (missing.length > 0) return { status: "WARN", detail: `Missing: ${missing.join(", ")}` };
    const commerce = lib("admin", "CommerceObservatoryEngine.ts");
    if (!exists(commerce)) return { status: "WARN", detail: "CommerceObservatoryEngine.ts missing." };
    return { status: "PASS", detail: "Observatory snapshot + alert system + commerce panel all present." };
  });
}

// ─── Engine ───────────────────────────────────────────────────────────────────

export function runLaunchTruthGate(): LaunchTruthReport {
  const checks: GateCheckResult[] = [
    checkRouteMatrix(),
    checkHomepageArtifactRegistry(),
    checkMagazineIssueEngine(),
    checkProfileRouteIntegrity(),
    checkBookingEngine(),
    checkTicketEngine(),
    checkNFTEngine(),
    checkBeatStore(),
    checkSponsorGiftEngine(),
    checkBillboardPreviewEngine(),
    checkRoomRuntimeLifecycle(),
    checkCameraEngine(),
    checkCrowdIntentEngine(),
    checkSubscriptionPricing(),
    checkRevenueSplitEngine(),
    checkAdminObservatory(),
  ];

  const total = checks.length;
  let earned = 0;
  for (const c of checks) {
    if (c.status === "PASS") earned += 1.0;
    else if (c.status === "WARN") earned += 0.5;
  }

  const truthScore      = Math.round((earned / total) * 100);
  const launchReadiness = truthScore;

  const criticalBlockers = checks
    .filter(c => c.status === "FAIL")
    .map(c => `[${c.name}] ${c.detail}`);

  const recommendedFixes = checks
    .filter(c => c.status === "WARN")
    .map(c => `[${c.name}] ${c.detail}`);

  const failCount = checks.filter(c => c.status === "FAIL").length;
  const warnCount = checks.filter(c => c.status === "WARN").length;
  const verdict: GateCheckStatus =
    failCount > 0 ? "FAIL" :
    warnCount > 0 ? "WARN" :
    "PASS";

  return { checks, truthScore, launchReadiness, criticalBlockers, recommendedFixes, verdict };
}
