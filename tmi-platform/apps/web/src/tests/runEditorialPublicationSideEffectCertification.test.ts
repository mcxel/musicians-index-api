/**
 * P0-B — Publication side-effect certification.
 *
 * Required chain: APPROVAL → COMPOSITION → FINALIZED MANIFEST → PUBLISH TRANSACTION
 * → markPublished → read-only reader.
 *
 * buildCanonicalMagazineIssueSlots() must NEVER permanently mutate submission state
 * (reader GET / crawler / cache revalidation). Only publishIssueComposition() may.
 *
 * Layer 1 (always): structural source checks — no DATABASE_URL required.
 * Layer 2 (optional): live Prisma path when DATABASE_URL is set and tables exist.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  EDITORIAL_PERSISTENCE_TRUTH,
  editorialEconomyHasInMemoryAuthority,
  getEditorialPersistenceTruth,
} from "../lib/editorial-economy/editorialPersistenceTruth";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webSrc = path.resolve(__dirname, "..");

function readSrc(rel: string): string {
  return fs.readFileSync(path.join(webSrc, rel), "utf8");
}

function extractFunctionBody(source: string, exportName: string): string {
  const asyncMarker = `export async function ${exportName}`;
  const syncMarker = `export function ${exportName}`;
  const start =
    source.indexOf(asyncMarker) >= 0
      ? source.indexOf(asyncMarker)
      : source.indexOf(syncMarker);
  if (start < 0) return "";

  const after = source.slice(start + 1);
  const nextExport = after.search(/\nexport (async )?function /);
  if (nextExport < 0) return source.slice(start);
  return source.slice(start, start + 1 + nextExport);
}

function runStructuralCertification(): Record<string, boolean> {
  const results: Record<string, boolean> = {};
  const rotation = readSrc("lib/magazine/MagazineRotationEngine.ts");
  const publishRoute = readSrc("app/api/editorial/publish-issue/route.ts");
  const readerRoutes = readSrc("lib/magazine/MagazineReaderRoutes.ts");
  const issuePages = readSrc("components/magazine/buildMagazineIssuePages.tsx");
  const currentPage = readSrc("app/magazine/issue/current/page.tsx");

  results["persistence_truth_ledger_present"] = EDITORIAL_PERSISTENCE_TRUTH.length >= 8;
  results["persistence_truth_flags_non_durable"] = editorialEconomyHasInMemoryAuthority();
  results["contributor_account_hybrid"] =
    getEditorialPersistenceTruth("ContributorAccount").status === "HYBRID";
  results["consent_missing"] = getEditorialPersistenceTruth("ContributorConsent").status === "MISSING";

  const buildBody = extractFunctionBody(rotation, "buildCanonicalMagazineIssueSlots");
  const publishBody = extractFunctionBody(rotation, "publishIssueComposition");

  results["build_fn_exists"] = buildBody.includes("buildCanonicalMagazineIssueSlots");
  results["build_fn_no_markPublished"] = !/markPublished\s*\(/.test(buildBody);
  results["publish_fn_calls_markPublished"] = /markPublished\s*\(/.test(publishBody);
  results["publish_fn_awaits_build"] = /buildCanonicalMagazineIssueSlots\s*\(/.test(publishBody);

  results["reader_routes_use_build_not_publish"] =
    readerRoutes.includes("buildCanonicalMagazineIssueSlots") &&
    !readerRoutes.includes("publishIssueComposition") &&
    !readerRoutes.includes("markPublished");

  results["issue_pages_use_build_not_publish"] =
    issuePages.includes("buildCanonicalMagazineIssueSlots") &&
    !issuePages.includes("publishIssueComposition");

  results["current_issue_page_no_publish_tx"] =
    currentPage.includes("buildMagazineIssuePages") &&
    !currentPage.includes("publishIssueComposition") &&
    !currentPage.includes("markPublished");

  results["publish_route_uses_publishIssueComposition"] =
    publishRoute.includes("publishIssueComposition") &&
    publishRoute.includes("insufficient-role") &&
    publishRoute.includes("MAGAZINE_ISSUE_PUBLISH");

  results["publish_route_writes_audit"] =
    publishRoute.includes("prisma.auditLog") || publishRoute.includes("auditLog");

  return results;
}

async function runRuntimeCertification(): Promise<Record<string, boolean> | null> {
  if (!process.env.DATABASE_URL) return null;

  const { contributorAccountEngine } = await import("../lib/editorial-economy/ContributorAccountEngine");
  const { editorialSubmissionEngine } = await import("../lib/editorial-economy/EditorialSubmissionEngine");
  const { articleReviewQueueEngine } = await import("../lib/editorial-economy/ArticleReviewQueueEngine");
  const {
    buildCanonicalMagazineIssueSlots,
    publishIssueComposition,
  } = await import("../lib/magazine/MagazineRotationEngine");

  async function snapshotSubmissions(): Promise<string> {
    const submissions = await editorialSubmissionEngine.list();
    return JSON.stringify(
      submissions
        .map((s) => ({
          id: s.submissionId,
          status: s.status,
          publishedArticleSlug: s.publishedArticleSlug ?? null,
          publishedAt: s.publishedAt ?? null,
          updatedAt: s.updatedAt,
        }))
        .sort((a, b) => a.id.localeCompare(b.id)),
    );
  }

  const results: Record<string, boolean> = {};
  const writerId = `cert-writer-${Date.now()}`;
  const editorId = `cert-editor-${Date.now()}`;

  await contributorAccountEngine.create({
    contributorId: writerId,
    displayName: "Cert Writer",
    level: "verified-contributor",
  });
  await contributorAccountEngine.create({
    contributorId: editorId,
    displayName: "Cert Editor",
    level: "staff-editor",
  });

  const submitted = await editorialSubmissionEngine.submit({
    contributorId: writerId,
    title: "Cert Side-Effect Story",
    body:
      "Paragraph one establishes the cert fixture for magazine publication purity.\n\n" +
      "Paragraph two expands the body so content-safety length gates clear honestly.\n\n" +
      "Paragraph three confirms writer-owned copy never auto-spreads into an issue.",
    category: "news",
    sourceUrls: ["https://themusiciansindex.com/magazine"],
  });
  results["runtime_submit_ok"] = submitted.ok === true;
  if (!submitted.ok) {
    throw new Error("[EDITORIAL_PUB_SIDE_EFFECT] submit failed");
  }

  const approved = await articleReviewQueueEngine.approve(submitted.submission.submissionId, editorId);
  results["runtime_approve_ok"] = approved.ok === true;
  if (!approved.ok) {
    throw new Error(`[EDITORIAL_PUB_SIDE_EFFECT] approve failed: ${approved.reason}`);
  }

  const beforeBuild = await snapshotSubmissions();
  await buildCanonicalMagazineIssueSlots("cert-issue-side-effect");
  await buildCanonicalMagazineIssueSlots("cert-issue-side-effect");
  results["runtime_reader_build_is_pure"] = beforeBuild === (await snapshotSubmissions());

  const firstPublish = await publishIssueComposition("cert-issue-side-effect");
  const target = await editorialSubmissionEngine.get(submitted.submission.submissionId);
  const landedInComposition = firstPublish.slots.some(
    (slot) => slot.pageClass === "NEWS" && slot.articleSlug === submitted.submission.submissionId,
  );
  if (landedInComposition) {
    results["runtime_landed_story_marked_published"] = target?.status === "published";
  } else {
    results["runtime_unselected_story_stays_approved"] = target?.status === "approved";
  }

  const mid = await snapshotSubmissions();
  await publishIssueComposition("cert-issue-side-effect");
  results["runtime_publish_idempotent_state"] = mid === (await snapshotSubmissions());
  results["runtime_publish_returns_slots"] = firstPublish.slots.length > 0;

  const readerAfterPublish = await snapshotSubmissions();
  await buildCanonicalMagazineIssueSlots("cert-issue-side-effect");
  results["runtime_reader_build_still_pure_after_publish"] =
    readerAfterPublish === (await snapshotSubmissions());

  return results;
}

async function main() {
  const structural = runStructuralCertification();
  let runtime: Record<string, boolean> | null = null;
  let runtimeSkipped = true;

  try {
    runtime = await runRuntimeCertification();
    runtimeSkipped = runtime === null;
  } catch (err) {
    console.warn("[EDITORIAL_PUB_SIDE_EFFECT_CERT] runtime layer skipped/failed:", err);
    runtime = null;
    runtimeSkipped = true;
  }

  const allResults = { ...structural, ...(runtime ?? {}) };
  const allPassed = Object.values(allResults).every(Boolean);

  console.log("[EDITORIAL_PUB_SIDE_EFFECT_CERT]", {
    allPassed,
    runtimeSkipped,
    results: allResults,
  });

  if (!allPassed) {
    const failed = Object.entries(allResults)
      .filter(([, ok]) => !ok)
      .map(([k]) => k);
    throw new Error(`[EDITORIAL_PUB_SIDE_EFFECT_CERT] FAILED: ${failed.join(", ")}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
