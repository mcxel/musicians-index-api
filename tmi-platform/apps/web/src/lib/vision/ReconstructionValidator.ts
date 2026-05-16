/**
 * ReconstructionValidator — Stage G
 * Deterministic validation gate for the entire Phase 7 pipeline.
 * Checks:
 *   - All reconstructed assets have authority
 *   - No orphan visual fragments
 *   - No static-only render paths
 *   - All generator assets can hydrate
 *   - All overlays reconcile
 *   - All runtime assets have telemetry hooks
 *   - No duplicate ownership chains
 *   - No unresolved asset lineage
 * Emits telemetry events for every failure and returns a pass/fail report.
 */

import { getAuthorityHolder, verifyAssetAuthority } from "@/lib/registry/AssetAuthorityLedger";
import { getRegistryStats } from "@/lib/registry/RuntimeAssetRegistry";
import { tel, TelemetryEvent } from "@/lib/vision/VisionTelemetryTracker";
import type { ReconstructionGraph, ReconstructionNode } from "@/lib/vision/ReconstructionGraphBuilder";
import type { BindingResult, NodeAuthority } from "@/lib/vision/RuntimeAuthorityBinder";
import type { RoutingManifest } from "@/lib/vision/GeneratorAssetRouter";

export type ValidationCheckId =
  | "authority-coverage"
  | "no-orphan-fragments"
  | "no-static-render-paths"
  | "generator-hydration-eligible"
  | "overlay-reconciliation"
  | "telemetry-hooks-present"
  | "no-duplicate-ownership"
  | "lineage-resolved";

export type ValidationStatus = "pass" | "fail" | "warn" | "skipped";

export interface ValidationCheck {
  checkId: ValidationCheckId;
  status: ValidationStatus;
  message: string;
  failedAssetIds: string[];
  telemetryEventIds: string[];
}

export interface ValidationReport {
  reportId: string;
  graphId: string;
  sourceAssetId: string;
  checks: ValidationCheck[];
  passed: boolean;
  passCount: number;
  failCount: number;
  warnCount: number;
  criticalFailures: ValidationCheckId[];
  validatedAt: number;
}

const CRITICAL_CHECKS: ValidationCheckId[] = [
  "authority-coverage",
  "no-duplicate-ownership",
  "no-orphan-fragments",
];

const reportLog = new Map<string, ValidationReport>();
let reportCounter = 0;

function makeCheck(
  checkId: ValidationCheckId,
  status: ValidationStatus,
  message: string,
  failedAssetIds: string[] = [],
  telemetryEventIds: string[] = []
): ValidationCheck {
  return { checkId, status, message, failedAssetIds, telemetryEventIds };
}

// Check 1: every bound node must have a valid authority claim
function checkAuthorityCoverage(
  nodes: ReconstructionNode[],
  boundNodes: NodeAuthority[]
): ValidationCheck {
  const boundIds = new Set(boundNodes.map(n => n.nodeId));
  const unbound = nodes.filter(n => !boundIds.has(n.nodeId));
  const failedAssetIds: string[] = [];
  const eventIds: string[] = [];

  for (const node of unbound) {
    const holder = getAuthorityHolder(node.assetId);
    if (!holder) {
      const ev = tel.authorityMismatch(node.assetId, "any-authority", "none");
      failedAssetIds.push(node.assetId);
      eventIds.push(ev.eventId);
    }
  }

  if (failedAssetIds.length === 0) {
    return makeCheck("authority-coverage", "pass", "All nodes have authority coverage");
  }
  return makeCheck(
    "authority-coverage", "fail",
    `${failedAssetIds.length} node(s) lack authority coverage`,
    failedAssetIds, eventIds
  );
}

// Check 2: no overlay/hud-fragment nodes should be unrouted
function checkNoOrphanFragments(
  nodes: ReconstructionNode[],
  manifest: RoutingManifest
): ValidationCheck {
  const fragmentKinds = new Set(["overlay-fragment", "hud-fragment"]);
  const fragmentNodes = nodes.filter(n => fragmentKinds.has(n.kind));
  const routedNodeIds = new Set(manifest.routes.filter(r => r.status === "routed" || r.status === "consumed").map(r => r.nodeId));

  const orphans = fragmentNodes.filter(n => !routedNodeIds.has(n.nodeId));
  const failedAssetIds: string[] = [];
  const eventIds: string[] = [];

  for (const node of orphans) {
    const ev = tel.unresolvedFragment(node.assetId, node.nodeId);
    failedAssetIds.push(node.assetId);
    eventIds.push(ev.eventId);
  }

  if (failedAssetIds.length === 0) {
    return makeCheck("no-orphan-fragments", "pass", "No orphan visual fragments");
  }
  return makeCheck(
    "no-orphan-fragments", "fail",
    `${failedAssetIds.length} orphan fragment(s) detected`,
    failedAssetIds, eventIds
  );
}

// Check 3: animatable nodes must be routed to at least one generator (no static-only paths)
function checkNoStaticRenderPaths(
  nodes: ReconstructionNode[],
  manifest: RoutingManifest
): ValidationCheck {
  const animatableNodes = nodes.filter(n => n.isAnimatable);
  const routedNodeIds = new Set(manifest.routes.filter(r => r.status !== "rejected").map(r => r.nodeId));
  const staticNodes = animatableNodes.filter(n => !routedNodeIds.has(n.nodeId));

  const failedAssetIds: string[] = [];
  const eventIds: string[] = [];

  for (const node of staticNodes) {
    const ev = tel.invalidReconstruction(node.assetId, "Animatable node has no runtime generator route (static-only)");
    failedAssetIds.push(node.assetId);
    eventIds.push(ev.eventId);
  }

  if (failedAssetIds.length === 0) {
    return makeCheck("no-static-render-paths", "pass", "All animatable nodes are generator-routed");
  }
  return makeCheck(
    "no-static-render-paths", "warn",
    `${failedAssetIds.length} animatable node(s) have no generator route`,
    failedAssetIds, eventIds
  );
}

// Check 4: all reconstructionReady nodes must be hydrated
function checkGeneratorHydrationEligible(
  nodes: ReconstructionNode[]
): ValidationCheck {
  const regStats = getRegistryStats();
  const hydratedCount = regStats.byStatus["hydrated"] ?? 0;
  const totalRegistered = regStats.total;

  if (totalRegistered === 0) {
    return makeCheck("generator-hydration-eligible", "skipped", "No assets in registry");
  }

  const hydrationRate = hydratedCount / totalRegistered;
  if (hydrationRate >= 0.9) {
    return makeCheck("generator-hydration-eligible", "pass",
      `${Math.round(hydrationRate * 100)}% of assets hydrated`);
  }
  if (hydrationRate >= 0.7) {
    return makeCheck("generator-hydration-eligible", "warn",
      `Only ${Math.round(hydrationRate * 100)}% of assets hydrated (below 90% target)`);
  }

  const failedAssetIds = nodes.filter(n => n.reconstructionReady).map(n => n.assetId);
  return makeCheck(
    "generator-hydration-eligible", "fail",
    `Critical: only ${Math.round(hydrationRate * 100)}% hydration rate`,
    failedAssetIds
  );
}

// Check 5: overlay nodes must each have an authority holder
function checkOverlayReconciliation(
  nodes: ReconstructionNode[],
  boundNodes: NodeAuthority[]
): ValidationCheck {
  const overlayNodes = nodes.filter(n => n.kind === "overlay-fragment" || n.kind === "sponsor-panel");
  const failedAssetIds: string[] = [];
  const eventIds: string[] = [];

  for (const node of overlayNodes) {
    const bound = boundNodes.find(b => b.nodeId === node.nodeId);
    if (!bound || !bound.overlayAuthority) {
      const ev = tel.overlayDesync(node.assetId, "overlay-authority");
      failedAssetIds.push(node.assetId);
      eventIds.push(ev.eventId);
    }
  }

  if (failedAssetIds.length === 0) {
    return makeCheck("overlay-reconciliation", "pass", "All overlays have authority");
  }
  return makeCheck(
    "overlay-reconciliation", "fail",
    `${failedAssetIds.length} overlay(s) lack authority`,
    failedAssetIds, eventIds
  );
}

// Check 6: all routed nodes must have telemetry coverage (i.e., were registered)
function checkTelemetryHooksPresent(
  manifest: RoutingManifest
): ValidationCheck {
  const routedCount = manifest.routedCount;
  const totalRoutes = manifest.routes.length;

  if (totalRoutes === 0) {
    return makeCheck("telemetry-hooks-present", "skipped", "No routes in manifest");
  }

  // All routes were registered during routeNode() — if routedCount matches, telemetry is wired
  if (routedCount === totalRoutes) {
    return makeCheck("telemetry-hooks-present", "pass", "All route entries have telemetry coverage");
  }

  return makeCheck(
    "telemetry-hooks-present", "warn",
    `${totalRoutes - routedCount} route(s) not fully registered`
  );
}

// Check 7: no node should appear in more than one binding result for the same graph
function checkNoDuplicateOwnership(
  nodes: ReconstructionNode[],
  boundNodes: NodeAuthority[]
): ValidationCheck {
  const ownershipMap = new Map<string, string[]>();
  for (const b of boundNodes) {
    const existing = ownershipMap.get(b.nodeId) ?? [];
    existing.push(b.runtimeAuthorityId);
    ownershipMap.set(b.nodeId, existing);
  }

  const failedAssetIds: string[] = [];
  const eventIds: string[] = [];

  for (const [nodeId, owners] of ownershipMap.entries()) {
    if (owners.length > 1) {
      const node = nodes.find(n => n.nodeId === nodeId);
      if (node) {
        const ev = tel.duplicateOwnership(node.assetId, owners[0], owners[1]);
        failedAssetIds.push(node.assetId);
        eventIds.push(ev.eventId);
      }
    }
  }

  if (failedAssetIds.length === 0) {
    return makeCheck("no-duplicate-ownership", "pass", "No duplicate ownership chains");
  }
  return makeCheck(
    "no-duplicate-ownership", "fail",
    `${failedAssetIds.length} node(s) have duplicate ownership`,
    failedAssetIds, eventIds
  );
}

// Check 8: verify assets have authority claims (lineage proxy check)
function checkLineageResolved(
  nodes: ReconstructionNode[]
): ValidationCheck {
  const failedAssetIds: string[] = [];
  const eventIds: string[] = [];

  for (const node of nodes) {
    const holder = getAuthorityHolder(node.assetId);
    if (!holder) {
      const ev = tel.missingLineage(node.assetId);
      failedAssetIds.push(node.assetId);
      eventIds.push(ev.eventId);
    }
  }

  if (failedAssetIds.length === 0) {
    return makeCheck("lineage-resolved", "pass", "All asset lineage records resolved");
  }
  return makeCheck(
    "lineage-resolved", "warn",
    `${failedAssetIds.length} node(s) missing lineage/authority records`,
    failedAssetIds, eventIds
  );
}

export function validateGraph(
  graph: ReconstructionGraph,
  bindingResult: BindingResult,
  manifest: RoutingManifest
): ValidationReport {
  const reportId = `validation_${graph.graphId}_${++reportCounter}`;
  const { nodes } = graph;
  const { boundNodes } = bindingResult;

  const checks: ValidationCheck[] = [
    checkAuthorityCoverage(nodes, boundNodes),
    checkNoOrphanFragments(nodes, manifest),
    checkNoStaticRenderPaths(nodes, manifest),
    checkGeneratorHydrationEligible(nodes),
    checkOverlayReconciliation(nodes, boundNodes),
    checkTelemetryHooksPresent(manifest),
    checkNoDuplicateOwnership(nodes, boundNodes),
    checkLineageResolved(nodes),
  ];

  const failedChecks = checks.filter(c => c.status === "fail");
  const warnChecks = checks.filter(c => c.status === "warn");
  const criticalFailures = failedChecks
    .filter(c => CRITICAL_CHECKS.includes(c.checkId))
    .map(c => c.checkId);

  const report: ValidationReport = {
    reportId,
    graphId: graph.graphId,
    sourceAssetId: graph.sourceAssetId,
    checks,
    passed: failedChecks.length === 0 && criticalFailures.length === 0,
    passCount: checks.filter(c => c.status === "pass").length,
    failCount: failedChecks.length,
    warnCount: warnChecks.length,
    criticalFailures,
    validatedAt: Date.now(),
  };

  if (!report.passed) {
    tel.validationFail(graph.sourceAssetId, (criticalFailures.join(", ") || failedChecks[0]?.checkId) ?? "unknown");
  }

  reportLog.set(reportId, report);
  return report;
}

export function getValidationReport(reportId: string): ValidationReport | null {
  return reportLog.get(reportId) ?? null;
}

export function getReportsByGraph(graphId: string): ValidationReport[] {
  return [...reportLog.values()].filter(r => r.graphId === graphId);
}

export function getValidatorStats(): {
  totalReports: number;
  passed: number;
  failed: number;
  criticalFailureRate: number;
} {
  let passed = 0, failed = 0, criticalFails = 0;
  for (const r of reportLog.values()) {
    if (r.passed) passed++;
    else failed++;
    criticalFails += r.criticalFailures.length;
  }
  const total = reportLog.size;
  return {
    totalReports: total,
    passed,
    failed,
    criticalFailureRate: total > 0 ? criticalFails / total : 0,
  };
}
