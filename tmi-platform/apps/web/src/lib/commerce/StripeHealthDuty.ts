/**
 * StripeHealthDuty — continuous money-path health for Revenue Businessman.
 * Never reports "100%" when keys are missing — honest not_configured / FAIL.
 */

import { getStripe } from "@/lib/stripe/client";
import { getRecentEvents, getSummary } from "@/lib/stripe/stripe-telemetry-store";
import { getStripeIncidentStatus } from "@/lib/stripe/stripe-incident-engine";
import { getScheduledPayouts } from "@/lib/finance/PayoutScheduler";
import { getHoldSummary } from "@/lib/finance/RefundRiskEngine";

export type StripeHealthStatus = "PASS" | "FAIL" | "not_configured";

export type StripeHealthReport = {
  at: number;
  status: StripeHealthStatus;
  stripeMode: "test" | "live" | "not_configured" | "unknown";
  secretKeyPresent: boolean;
  webhookSecretPresent: boolean;
  checkoutPath: "ok" | "unknown" | "fail";
  webhookPath: "ok" | "unknown" | "fail";
  recentErrorCount: number;
  connectPayoutBlockers: string[];
  repairRecommendations: string[];
  summaryLines: string[];
  /** Honest speech string for Observatory voice panel. */
  voiceText: string;
};

function modeFromKey(key: string | undefined): StripeHealthReport["stripeMode"] {
  if (!key?.trim()) return "not_configured";
  if (key.startsWith("sk_test_")) return "test";
  if (key.startsWith("sk_live_")) return "live";
  return "unknown";
}

/**
 * Pure check — no fabricated success. Uses env + telemetry store only.
 */
export function checkStripeHealth(): StripeHealthReport {
  const at = Date.now();
  const secret = process.env.STRIPE_SECRET_KEY?.trim();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const stripeMode = modeFromKey(secret);
  const secretKeyPresent = Boolean(secret) && getStripe() !== null;
  const webhookSecretPresent = Boolean(webhookSecret);

  const recent = getRecentEvents(80);
  const summary = getSummary();
  const incidents = getStripeIncidentStatus();

  const verified = recent.filter((e) => e.kind === "webhook_verified");
  const failedCount =
    (summary.byCategory.verification ?? 0) +
    (summary.byCategory.malformed ?? 0) +
    (summary.byCategory.upstream ?? 0) +
    (summary.byCategory.timeout ?? 0);

  const seenTypes = new Set(
    verified.map((e) => String(e.meta.eventType ?? "")).filter(Boolean),
  );
  const checkoutPath: StripeHealthReport["checkoutPath"] = !secretKeyPresent
    ? "fail"
    : seenTypes.has("checkout.session.completed")
      ? "ok"
      : "unknown";
  const webhookPath: StripeHealthReport["webhookPath"] = !webhookSecretPresent
    ? "fail"
    : verified.length > 0
      ? "ok"
      : "unknown";

  const connectPayoutBlockers: string[] = [];
  const holds = getHoldSummary();
  const queued = getScheduledPayouts("queued");
  if (queued.length > 0 && !secretKeyPresent) {
    connectPayoutBlockers.push(`${queued.length} payout(s) queued but Stripe secret not configured`);
  }
  if (holds.releasable > 0 && !secretKeyPresent) {
    connectPayoutBlockers.push(`${holds.releasable} releasable hold(s) cannot transfer without Stripe`);
  }

  const repairRecommendations: string[] = [];
  if (!secretKeyPresent) {
    repairRecommendations.push("Set STRIPE_SECRET_KEY (real sk_test_/sk_live_ — not placeholder).");
  }
  if (!webhookSecretPresent) {
    repairRecommendations.push("Set STRIPE_WEBHOOK_SECRET and point Stripe webhooks at /api/stripe/webhook.");
  }
  if (checkoutPath === "unknown" && secretKeyPresent) {
    repairRecommendations.push("Run a test checkout to confirm checkout.session.completed delivery.");
  }
  if (failedCount > 0) {
    repairRecommendations.push(`Review ${failedCount} webhook failure(s) in Stripe Observatory / telemetry.`);
  }
  const incidentCount = incidents.recentIncidents?.length ?? 0;
  if (incidentCount > 0) {
    repairRecommendations.push(`${incidentCount} recent Stripe incident(s) — triage in admin Stripe panel.`);
  }
  if (incidents.payoutQueuePaused) {
    repairRecommendations.push(
      `Payout queue paused: ${incidents.payoutQueuePauseReason || "see Stripe incident engine"}`,
    );
    connectPayoutBlockers.push("payout_queue_paused");
  }

  let status: StripeHealthStatus = "PASS";
  if (!secretKeyPresent || !webhookSecretPresent) {
    status = "not_configured";
  } else if (failedCount > 5 || incidentCount > 0 || incidents.payoutQueuePaused) {
    status = "FAIL";
  }

  const summaryLines = [
    `Stripe health: ${status}`,
    `Mode: ${stripeMode}`,
    `Secret key: ${secretKeyPresent ? "present" : "missing"}`,
    `Webhook secret: ${webhookSecretPresent ? "present" : "missing"}`,
    `Checkout path: ${checkoutPath}`,
    `Webhook path: ${webhookPath}`,
    `Recent failures (telemetry): ${failedCount}`,
    `Recent incidents: ${incidentCount}`,
    connectPayoutBlockers.length
      ? `Connect/payout blockers: ${connectPayoutBlockers.join("; ")}`
      : "Connect/payout blockers: none detected from queue/holds",
  ];

  const voiceText =
    status === "not_configured"
      ? "Stripe is not configured. Money paths cannot run until secret and webhook keys are set. Do not claim one hundred percent health."
      : status === "FAIL"
        ? `Stripe health failed. ${failedCount} recent failures. ${repairRecommendations[0] ?? "Check Stripe Observatory."}`
        : `Stripe health pass. Mode ${stripeMode}. Checkout ${checkoutPath}. Webhook ${webhookPath}.`;

  return {
    at,
    status,
    stripeMode,
    secretKeyPresent,
    webhookSecretPresent,
    checkoutPath,
    webhookPath,
    recentErrorCount: failedCount,
    connectPayoutBlockers,
    repairRecommendations,
    summaryLines,
    voiceText,
  };
}
