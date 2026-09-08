/**
 * AdSenseComplianceCrawler — approval-readiness crawl facade.
 * Reuses MonetizationPreflightCrawler + RouteAdEligibilityResolver.
 * Status vocabulary: READY_FOR_EXTERNAL_REVIEW | BLOCKED | WARNINGS — never "GOOGLE APPROVED".
 */

import {
  runMonetizationPreflight,
  type MonetizationPreflightReport,
} from "@/lib/certification/MonetizationPreflightCrawler";
import {
  resolveRouteAdEligibility,
  type RouteAdEligibilityStatus,
} from "@/lib/ads/RouteAdEligibilityResolver";
import fs from "fs";
import path from "path";
import { getAdSensePublisherId } from "@/lib/ads/adConfig";

export type ComplianceCrawlFinding = {
  id: string;
  status: "PASS" | "FAIL" | "BLOCKED" | "N/A";
  evidence: string;
};

function publicRoot(...parts: string[]): string {
  // Prefer apps/web/public relative to cwd (repo or apps/web)
  const candidates = [
    path.join(process.cwd(), "apps", "web", "public", ...parts),
    path.join(process.cwd(), "public", ...parts),
  ];
  return candidates.find((p) => fs.existsSync(p)) ?? candidates[0]!;
}

export function crawlAdSenseCompliance(): {
  preflight: MonetizationPreflightReport;
  findings: ComplianceCrawlFinding[];
} {
  const preflight = runMonetizationPreflight();
  const findings: ComplianceCrawlFinding[] = [];

  const adsTxt = publicRoot("ads.txt");
  const adsTxtBody = fs.existsSync(adsTxt) ? fs.readFileSync(adsTxt, "utf8") : "";
  findings.push({
    id: "ads_txt",
    status:
      adsTxtBody.includes("google.com, pub-4088577529436039, DIRECT, f08c47fec0942fa0")
        ? "PASS"
        : "FAIL",
    evidence: adsTxtBody.slice(0, 120) || "ads.txt missing",
  });

  const appAds = publicRoot("app-ads.txt");
  findings.push({
    id: "app_ads_txt",
    status: fs.existsSync(appAds) && fs.readFileSync(appAds, "utf8").includes("pub-4088577529436039")
      ? "PASS"
      : "FAIL",
    evidence: fs.existsSync(appAds) ? "app-ads.txt present" : "app-ads.txt missing at public root",
  });

  const pub = getAdSensePublisherId();
  findings.push({
    id: "publisher_id",
    status: pub === "ca-pub-4088577529436039" ? "PASS" : "FAIL",
    evidence: pub,
  });

  const protectedRoutes = ["/checkout", "/billing", "/login", "/dashboard", "/live/rooms/x"];
  const protectedOk = protectedRoutes.every((r) => !resolveRouteAdEligibility(r).eligible);
  findings.push({
    id: "protected_routes_blocked",
    status: protectedOk ? "PASS" : "FAIL",
    evidence: protectedRoutes
      .map((r) => `${r}=${resolveRouteAdEligibility(r).eligible ? "ELIGIBLE" : "blocked"}`)
      .join("; "),
  });

  const publicRoutes = ["/", "/magazine", "/privacy", "/terms", "/contact", "/about"];
  const publicOk = publicRoutes.every((r) => resolveRouteAdEligibility(r).eligible);
  findings.push({
    id: "public_editorial_eligible",
    status: publicOk ? "PASS" : "FAIL",
    evidence: publicRoutes
      .map((r) => `${r}=${resolveRouteAdEligibility(r).eligible}`)
      .join("; "),
  });

  findings.push({
    id: "preflight_status",
    status:
      preflight.status === "BLOCKED"
        ? "BLOCKED"
        : preflight.status === "READY_FOR_EXTERNAL_REVIEW"
          ? "PASS"
          : "PASS",
    evidence: `${preflight.status}; errors=${preflight.errors.length}; warnings=${preflight.warnings.length}`,
  });

  return { preflight, findings };
}

export function checkRoute(pathname: string): RouteAdEligibilityStatus {
  return resolveRouteAdEligibility(pathname);
}

export const AdSenseComplianceCrawler = {
  crawlAdSenseCompliance,
  checkRoute,
  runMonetizationPreflight,
};
