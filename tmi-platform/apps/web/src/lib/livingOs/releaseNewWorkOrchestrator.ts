/**
 * RELEASE_NEW_WORK orchestrator — resilient multi-step runner.
 *
 * One step failure → RETRYING/FAILED for that step; remaining steps continue.
 * Reuses livingOsCommandBus for Observatory telemetry. No second bus.
 *
 * Honest statuses only (Rule 20): no fake DistroKid API success, no fake rooms,
 * no fabricated follower fan-out when no notify path exists.
 */

import { emitEvent } from "@/lib/analytics/PersonaAnalyticsEngine";
import {
  getPerformerStorefrontLink,
  resolveArtistBuyUrl,
} from "@/lib/commerce/CommerceConnectorRegistry";
import { upsertCreatorProduct } from "@/lib/commerce/CreatorProductRegistry";
import { listPerformerDistributorLinks } from "@/lib/commerce/DistributorConnectorRegistry";
import {
  appendAssetEdge,
  emptyAssetGraph,
  enrichReleaseCrossLinks,
  type AssetRelationshipGraph,
} from "@/lib/livingOs/AssetRelationshipGraph";
import {
  RELEASE_NEW_WORK_STEPS,
  type ReleaseNewWorkStepId,
} from "@/lib/livingOs/AutomationRegistry";
import {
  getReleaseDraft,
  upsertReleaseDraft,
  type ReleaseDraft,
} from "@/lib/livingOs/releaseDraftStore";
import {
  saveWorkflowRun,
  type WorkflowRunRecord,
  type WorkflowStepResult,
  type WorkflowStepStatus,
} from "@/lib/livingOs/workflowRunStore";
import { livingOsCommandBus } from "@/lib/os/livingOsCommandBus";
import { publishYoPhoEdition } from "@/lib/yopho/YoPhoEditionEngine";

export interface RunReleaseNewWorkInput {
  performerId: string;
  releaseId: string;
  userId?: string;
  /** Force re-run even if status is Live. */
  force?: boolean;
  /** Live progress callback — fires after each step persist (no fake delays). */
  onProgress?: (run: WorkflowRunRecord) => void;
}

const STEP_LABELS: Record<ReleaseNewWorkStepId, string> = {
  validate_assets: "Validate assets",
  create_commerce_product: "Create/update commerce product",
  distributor_sync: "Distributor sync",
  magazine: "Magazine link",
  yopho: "YoPho edition",
  store_update: "Store update",
  listening_party: "Listening party",
  notify_followers: "Notify followers",
  analytics_init: "Analytics + Observatory",
};

function genRunId(): string {
  return `run_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function markStep(
  steps: WorkflowStepResult[],
  stepId: string,
  patch: Partial<WorkflowStepResult>,
): WorkflowStepResult[] {
  return steps.map((s) => (s.stepId === stepId ? { ...s, ...patch } : s));
}

type StepOutcome = {
  status: WorkflowStepStatus;
  message: string;
  assetIds?: string[];
  graph?: AssetRelationshipGraph;
};

async function withResilience(
  run: () => Promise<StepOutcome>,
): Promise<StepOutcome & { retryCount: number }> {
  try {
    const first = await run();
    if (first.status !== "FAILED") {
      return { ...first, retryCount: 0 };
    }
    // One automatic retry queue for transient failures
    const second = await run();
    return {
      ...second,
      retryCount: 1,
      message:
        second.status === "FAILED"
          ? `${second.message} (retried once)`
          : second.message,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    try {
      const second = await run();
      return { ...second, retryCount: 1 };
    } catch (err2) {
      const msg2 = err2 instanceof Error ? err2.message : String(err2);
      return {
        status: "FAILED",
        message: `${msg} → retry: ${msg2}`,
        retryCount: 1,
      };
    }
  }
}

type StepCtx = {
  draft: ReleaseDraft;
  performerId: string;
  userId?: string;
  graph: AssetRelationshipGraph;
};

async function runValidateAssets(
  ctx: StepCtx,
): Promise<{ status: WorkflowStepStatus; message: string; assetIds?: string[] }> {
  const title = ctx.draft.title?.trim();
  if (!title) {
    return { status: "FAILED", message: "Title is required." };
  }
  const hasAudio = Boolean(ctx.draft.audioUrl?.trim());
  const hasCover = Boolean(ctx.draft.coverUrl?.trim());
  const hasProduct = Boolean(ctx.draft.productBuyUrl?.trim());
  if (!hasAudio && !hasCover && !hasProduct) {
    return {
      status: "FAILED",
      message: "Need at least one of: audio URL, cover URL, or product/buy URL.",
    };
  }
  return {
    status: "COMPLETED",
    message: `Validated “${title}” (${[
      hasAudio && "audio",
      hasCover && "cover",
      hasProduct && "product",
    ]
      .filter(Boolean)
      .join(", ")}).`,
  };
}

async function runCreateCommerceProduct(
  ctx: StepCtx,
): Promise<{ status: WorkflowStepStatus; message: string; assetIds?: string[]; graph?: AssetRelationshipGraph }> {
  const store = getPerformerStorefrontLink(ctx.performerId);
  const buyUrl =
    ctx.draft.productBuyUrl?.trim() || resolveArtistBuyUrl(store) || undefined;
  const product = upsertCreatorProduct({
    ownerPerformerId: ctx.performerId,
    id: `prod_rel_${ctx.draft.releaseId}`,
    title: ctx.draft.title.trim(),
    type: "SINGLE",
    priceCents: ctx.draft.priceCents,
    currency: "USD",
    connectorId: store?.connectorId ?? "custom",
    visibility: "PUBLIC",
    buyUrl,
    imageUrl: ctx.draft.coverUrl?.trim() || undefined,
  });
  const graph = appendAssetEdge(ctx.graph, {
    assetId: product.id,
    kind: "commerce_product",
    stepId: "create_commerce_product",
  });
  return {
    status: "COMPLETED",
    message: `Commerce product ${product.id} upserted.`,
    assetIds: [product.id],
    graph,
  };
}

async function runDistributorSync(
  ctx: StepCtx,
): Promise<{ status: WorkflowStepStatus; message: string; assetIds?: string[]; graph?: AssetRelationshipGraph }> {
  const links = listPerformerDistributorLinks(ctx.performerId);
  if (links.length === 0) {
    return {
      status: "SKIPPED",
      message: "No distributor profile linked — nothing to sync.",
    };
  }
  // Phase 1: LINKED_URL only — never claim DistroKid API success
  const ids = links.map((l) => l.providerId);
  let graph = ctx.graph;
  for (const l of links) {
    graph = appendAssetEdge(graph, {
      assetId: `${l.providerId}:${l.profileUrl}`,
      kind: "distributor_link",
      stepId: "distributor_sync",
    });
  }
  return {
    status: "QUEUED",
    message: `Distributor sync QUEUED for ${ids.join(", ")} (LINKED_URL only — no DistroKid API).`,
    assetIds: ids,
    graph,
  };
}

async function runMagazine(
  ctx: StepCtx,
): Promise<{ status: WorkflowStepStatus; message: string }> {
  const opted = ctx.draft.wizard.find((w) => w.id === "magazine")?.optedIn;
  if (!opted) {
    return { status: "SKIPPED", message: "Magazine not opted in for this release." };
  }
  // No real article write path this pass
  return {
    status: "SKIPPED",
    message: "No magazine article write path available — link/update deferred (honest SKIPPED).",
  };
}

async function runYoPho(
  ctx: StepCtx,
): Promise<{ status: WorkflowStepStatus; message: string; assetIds?: string[]; graph?: AssetRelationshipGraph }> {
  const opted = ctx.draft.wizard.find((w) => w.id === "yopho_edition")?.optedIn;
  if (!opted) {
    return { status: "SKIPPED", message: "YoPho edition not opted in." };
  }
  try {
    const edition = publishYoPhoEdition({
      ownerKey: ctx.performerId,
      title: `${ctx.draft.title.trim()} — YoPho`,
      kind: "PROMOTIONAL_EDITION",
      createIfMissing: true,
    });
    livingOsCommandBus.executeAction("ACTION_PUBLISH_YOPHO", {
      userId: ctx.userId,
      role: "performer",
      payload: {
        editionId: edition.id,
        releaseId: ctx.draft.releaseId,
        panelId: "commerce_center",
      },
      idempotencyKey: `yopho_rel_${ctx.draft.releaseId}_${edition.id}`,
    });
    const graph = appendAssetEdge(ctx.graph, {
      assetId: edition.id,
      kind: "yopho_edition",
      stepId: "yopho",
    });
    return {
      status: "COMPLETED",
      message: `YoPho edition #${edition.editionNumber} published (${edition.id}).`,
      assetIds: [edition.id],
      graph,
    };
  } catch (err) {
    return {
      status: "FAILED",
      message: err instanceof Error ? err.message : String(err),
    };
  }
}

async function runStoreUpdate(
  ctx: StepCtx,
): Promise<{ status: WorkflowStepStatus; message: string; assetIds?: string[]; graph?: AssetRelationshipGraph }> {
  const store = getPerformerStorefrontLink(ctx.performerId);
  if (!store) {
    return {
      status: "SKIPPED",
      message: "No storefront linked — store display refresh skipped.",
    };
  }
  // Refresh = re-touch linked product visibility via upsert already done;
  // stamp storefront edge so Release Manager can deep-link.
  const buy = resolveArtistBuyUrl(store);
  const graph = appendAssetEdge(ctx.graph, {
    assetId: store.storefrontUrl,
    kind: "storefront_link",
    stepId: "store_update",
  });
  return {
    status: "COMPLETED",
    message: buy
      ? `Storefront display refreshed → ${buy}`
      : "Storefront link recorded; no checkout URL yet.",
    assetIds: [store.storefrontUrl],
    graph,
  };
}

async function runListeningParty(
  ctx: StepCtx,
): Promise<{ status: WorkflowStepStatus; message: string }> {
  const opted = ctx.draft.wizard.find((w) => w.id === "listening_party")?.optedIn;
  if (!opted) {
    return { status: "SKIPPED", message: "Listening party not opted in." };
  }
  // No fake room — queue schedule intent + point to live destinations
  return {
    status: "QUEUED",
    message:
      "Listening party QUEUED — open /live/lobby or Home 3 when ready. No fake room created.",
  };
}

async function runNotifyFollowers(
  ctx: StepCtx,
): Promise<{ status: WorkflowStepStatus; message: string; assetIds?: string[] }> {
  const opted = ctx.draft.wizard.find((w) => w.id === "notify")?.optedIn;
  if (!opted) {
    return { status: "SKIPPED", message: "Notify followers not opted in." };
  }
  if (typeof window === "undefined") {
    return { status: "SKIPPED", message: "Notify requires browser session." };
  }
  try {
    const res = await fetch("/api/notifications", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "push",
        type: "system",
        title: "Release publishing",
        body: `“${ctx.draft.title.trim()}” is going live on your storefront.`,
        priority: "medium",
        href: `/performers/${encodeURIComponent(ctx.performerId)}`,
        emoji: "🚀",
      }),
    });
    if (!res.ok) {
      return {
        status: "SKIPPED",
        message: `Notification API returned ${res.status} — follower fan-out not available (honest SKIPPED).`,
      };
    }
    const data = (await res.json().catch(() => ({}))) as { notification?: { id?: string } };
    const notifId = data.notification?.id;
    // API only notifies current session user — not a real follower blast
    return {
      status: "COMPLETED",
      message:
        "Session notification recorded. Platform-wide follower fan-out not wired yet — no fake blast.",
      assetIds: notifId ? [notifId] : undefined,
    };
  } catch {
    return {
      status: "SKIPPED",
      message: "Notification API unreachable — SKIPPED (no fake follower notify).",
    };
  }
}

async function runAnalyticsInit(
  ctx: StepCtx,
): Promise<{ status: WorkflowStepStatus; message: string; assetIds?: string[] }> {
  const event = emitEvent({
    eventName: "WORKFLOW_RELEASE_NEW_WORK",
    domain: "storefront",
    userId: ctx.userId ?? ctx.performerId,
    assetId: ctx.draft.releaseId,
    activePersonaOverride: "performer",
    meta: {
      workflowId: "RELEASE_NEW_WORK",
      releaseId: ctx.draft.releaseId,
      performerId: ctx.performerId,
      title: ctx.draft.title.slice(0, 80),
    },
  });
  return {
    status: "COMPLETED",
    message: `Analytics event ${event.eventId} logged to PersonaAnalyticsEngine / Observatory path.`,
    assetIds: [event.eventId],
  };
}

async function executeStep(
  stepId: ReleaseNewWorkStepId,
  ctx: StepCtx,
): Promise<StepOutcome> {
  switch (stepId) {
    case "validate_assets":
      return runValidateAssets(ctx);
    case "create_commerce_product":
      return runCreateCommerceProduct(ctx);
    case "distributor_sync":
      return runDistributorSync(ctx);
    case "magazine":
      return runMagazine(ctx);
    case "yopho":
      return runYoPho(ctx);
    case "store_update":
      return runStoreUpdate(ctx);
    case "listening_party":
      return runListeningParty(ctx);
    case "notify_followers":
      return runNotifyFollowers(ctx);
    case "analytics_init":
      return runAnalyticsInit(ctx);
    default:
      return { status: "SKIPPED", message: "Unknown step." };
  }
}

/**
 * Run RELEASE_NEW_WORK for a persisted release draft.
 * Resilient: failed steps mark FAILED after one retry; others continue.
 */
export async function runReleaseNewWork(
  input: RunReleaseNewWorkInput,
): Promise<WorkflowRunRecord> {
  const draft = getReleaseDraft(input.performerId, input.releaseId);
  if (!draft) {
    const failed: WorkflowRunRecord = {
      runId: genRunId(),
      workflowId: "RELEASE_NEW_WORK",
      releaseId: input.releaseId,
      performerId: input.performerId,
      status: "Failed",
      steps: [],
      graph: emptyAssetGraph(input.releaseId, input.performerId),
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      errorSummary: "Release draft not found.",
    };
    return saveWorkflowRun(failed);
  }

  const runId = genRunId();
  const startedAt = new Date().toISOString();
  let graph = emptyAssetGraph(draft.releaseId, input.performerId);
  let steps: WorkflowStepResult[] = RELEASE_NEW_WORK_STEPS.map((stepId) => ({
    stepId,
    label: STEP_LABELS[stepId],
    status: "PENDING" as const,
  }));

  const notify = (next: WorkflowRunRecord) => {
    saveWorkflowRun(next);
    input.onProgress?.(next);
  };

  let run: WorkflowRunRecord = {
    runId,
    workflowId: "RELEASE_NEW_WORK",
    releaseId: draft.releaseId,
    performerId: input.performerId,
    status: "Running",
    steps,
    graph,
    startedAt,
  };
  notify(run);

  livingOsCommandBus.executeAction("ACTION_RUN_RELEASE_NEW_WORK", {
    userId: input.userId,
    role: "performer",
    payload: {
      releaseId: draft.releaseId,
      runId,
      panelId: "commerce_center",
    },
    idempotencyKey: `wf_start_${runId}`,
  });

  upsertReleaseDraft({ ...draft, status: "Publishing", lastRunId: runId });

  let hardFailValidate = false;
  let anyFailed = false;
  let anyRetrying = false;

  for (const stepId of RELEASE_NEW_WORK_STEPS) {
    const now = new Date().toISOString();
    steps = markStep(steps, stepId, { status: "RUNNING", startedAt: now });
    run = { ...run, steps, status: anyRetrying ? "Retrying" : "Running", graph };
    notify(run);

    // If validate failed hard, skip mutating steps but still record analytics
    if (hardFailValidate && stepId !== "analytics_init") {
      steps = markStep(steps, stepId, {
        status: "SKIPPED",
        message: "Skipped — asset validation failed.",
        finishedAt: new Date().toISOString(),
      });
      run = { ...run, steps, graph };
      notify(run);
      continue;
    }

    const ctx: StepCtx = {
      draft: getReleaseDraft(input.performerId, input.releaseId) ?? draft,
      performerId: input.performerId,
      userId: input.userId,
      graph,
    };

    const outcome = await withResilience(async () => executeStep(stepId, ctx));
    if (outcome.status === "FAILED" && (outcome.retryCount ?? 0) > 0) {
      anyRetrying = true;
    }
    if (outcome.graph) graph = outcome.graph;
    // Merge graph from outcome when steps mutate via return
    if (outcome.assetIds?.length && !outcome.graph) {
      // edges already applied inside step when graph returned
    }

    steps = markStep(steps, stepId, {
      status: outcome.status,
      message: outcome.message,
      assetIds: outcome.assetIds,
      finishedAt: new Date().toISOString(),
      retryCount: outcome.retryCount,
    });

    if (outcome.status === "FAILED") {
      anyFailed = true;
      if (stepId === "validate_assets") hardFailValidate = true;
    }

    livingOsCommandBus.dispatch({
      type: "WORKFLOW_STEP_UPDATED",
      category: "automation",
      userId: input.userId,
      role: "performer",
      payload: {
        workflowId: "RELEASE_NEW_WORK",
        runId,
        stepId,
        stepStatus: outcome.status,
        releaseId: draft.releaseId,
      },
    });

    run = {
      ...run,
      steps,
      graph,
      status: anyFailed && anyRetrying ? "Retrying" : "Running",
    };
    notify(run);
  }

  const finishedAt = new Date().toISOString();
  const finalStatus = anyFailed ? "Failed" : "Completed";
  graph = enrichReleaseCrossLinks(graph);
  run = {
    ...run,
    steps,
    graph,
    status: finalStatus,
    finishedAt,
    errorSummary: anyFailed
      ? steps
          .filter((s) => s.status === "FAILED")
          .map((s) => `${s.stepId}: ${s.message ?? "failed"}`)
          .join("; ")
      : undefined,
  };
  notify(run);

  const latest = getReleaseDraft(input.performerId, input.releaseId) ?? draft;
  upsertReleaseDraft({
    ...latest,
    status: anyFailed ? "Draft" : "Live",
    lastRunId: runId,
    wizard: latest.wizard.map((w) =>
      w.id === "publish" && !anyFailed ? { ...w, checked: true } : w,
    ),
  });

  if (anyFailed) {
    livingOsCommandBus.dispatch({
      type: "WORKFLOW_FAILED",
      category: "automation",
      userId: input.userId,
      role: "performer",
      payload: {
        workflowId: "RELEASE_NEW_WORK",
        runId,
        releaseId: draft.releaseId,
        errorSummary: run.errorSummary ?? "failed",
      },
    });
  } else {
    livingOsCommandBus.dispatch({
      type: "WORKFLOW_COMPLETED",
      category: "automation",
      userId: input.userId,
      role: "performer",
      payload: {
        workflowId: "RELEASE_NEW_WORK",
        runId,
        releaseId: draft.releaseId,
        actionId: "ACTION_RUN_RELEASE_NEW_WORK",
      },
      idempotencyKey: `wf_complete_${runId}`,
    });
  }

  return run;
}
