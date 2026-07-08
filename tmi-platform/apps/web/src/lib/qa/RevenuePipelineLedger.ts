// ─────────────────────────────────────────────────────────────────────────────
// Revenue Pipeline Ledger
//
// Every money path in the platform must pass a 14-step pipeline certification.
// Real evidence (artifacts) must be stored at the path listed in evidenceFile
// before a step may be marked PASS.
//
// Rule 20: No step is PASS without authenticated runtime evidence.
// Rule 23: Revenue paths are P0 — this ledger gates production deployment.
// ─────────────────────────────────────────────────────────────────────────────

export type PipelineStepStatus = "PASS" | "FAIL" | "PENDING" | "SKIPPED";

export type PipelineStep = {
  stepId: string;
  stepNumber: number;
  label: string;
  description: string;
  blocking: boolean;
  evidenceFile: string;
  status: PipelineStepStatus;
  lastVerifiedAt: string | null;
  verifiedBy: string | null;
  durationMs: number | null;
  notes: string | null;
};

export type RevenuePipelineType =
  | "membership_upgrade"
  | "membership_new"
  | "ticket_purchase"
  | "tip"
  | "advertiser_ad"
  | "sponsor_placement";

export type RevenuePipelineCertRecord = {
  pipelineId: string;
  type: RevenuePipelineType;
  label: string;
  stripeProductId: string | null;
  stripePriceId: string | null;
  steps: PipelineStep[];
  overallStatus: PipelineStepStatus;
  lastFullPassAt: string | null;
};

// ─────────────────────────────────────────────────────────────────────────────
// The 14 canonical pipeline steps
// ─────────────────────────────────────────────────────────────────────────────

const STEP_TEMPLATES: Omit<PipelineStep, "evidenceFile" | "status" | "lastVerifiedAt" | "verifiedBy" | "durationMs" | "notes">[] = [
  {
    stepId:      "01_purchase_started",
    stepNumber:  1,
    label:       "Purchase Started",
    description: "User clicks buy/upgrade/tip CTA. Checkout session creation request fires.",
    blocking:    true,
  },
  {
    stepId:      "02_stripe_session_created",
    stepNumber:  2,
    label:       "Stripe Checkout Session Created",
    description: "POST /api/stripe/checkout returns a Stripe session URL with correct price and metadata.",
    blocking:    true,
  },
  {
    stepId:      "03_user_redirected",
    stepNumber:  3,
    label:       "User Redirected to Stripe",
    description: "Browser navigates to checkout.stripe.com with the correct session URL.",
    blocking:    true,
  },
  {
    stepId:      "04_payment_completed",
    stepNumber:  4,
    label:       "Payment Completed",
    description: "Stripe test card accepted. Stripe marks session as paid. Success redirect fires.",
    blocking:    true,
  },
  {
    stepId:      "05_webhook_received",
    stepNumber:  5,
    label:       "Stripe Webhook Received",
    description: "checkout.session.completed event arrives at /api/stripe/webhook within 10s.",
    blocking:    true,
  },
  {
    stepId:      "06_idempotency_guard",
    stepNumber:  6,
    label:       "Idempotency Guard (duplicate rejected)",
    description: "Replaying the same webhook event returns 200 without creating a second order.",
    blocking:    true,
  },
  {
    stepId:      "07_order_created",
    stepNumber:  7,
    label:       "Order Created in DB",
    description: "Order record exists in DB with correct userId, amount, stripeSessionId, status=completed.",
    blocking:    true,
  },
  {
    stepId:      "08_ticket_or_entitlement",
    stepNumber:  8,
    label:       "Ticket Created + Owner Set  (or Membership Tier Updated)",
    description: "For ticket: TicketRecord.ownerId = buyer, status=active. For membership: user.tier updated.",
    blocking:    true,
  },
  {
    stepId:      "09_email_sent",
    stepNumber:  9,
    label:       "Confirmation Email Sent",
    description: "Transactional email delivered to buyer's address. Subject, links, and personalization verified.",
    blocking:    true,
  },
  {
    stepId:      "10_inventory_updated",
    stepNumber:  10,
    label:       "Inventory Updated",
    description: "Ticket: remaining capacity decremented. Membership: seat count updated.",
    blocking:    true,
  },
  {
    stepId:      "11_analytics_logged",
    stepNumber:  11,
    label:       "Analytics Event Logged",
    description: "purchase event recorded in EngagementRegistry / Observatory with correct amount and type.",
    blocking:    false,
  },
  {
    stepId:      "12_revenue_dashboard",
    stepNumber:  12,
    label:       "Revenue Dashboard Updated",
    description: "Observatory /admin/observatory shows the purchase in revenue panel without page refresh.",
    blocking:    true,
  },
  {
    stepId:      "13_advertiser_stats",
    stepNumber:  13,
    label:       "Advertiser / Sponsor Stats Notified",
    description: "For ad/sponsor purchases: impression/campaign start logged. For other types: step is SKIPPED.",
    blocking:    false,
  },
  {
    stepId:      "14_customer_receipt",
    stepNumber:  14,
    label:       "Customer Receipt Verified",
    description: "Buyer can view their owned ticket/tier on /fan/[slug]/tickets or /account/subscription.",
    blocking:    true,
  },
];

function buildPipeline(
  pipelineId: string,
  type: RevenuePipelineType,
  label: string,
  opts: {
    stripeProductId?: string;
    stripePriceId?: string;
    skipSteps?: string[];
  } = {}
): RevenuePipelineCertRecord {
  const steps: PipelineStep[] = STEP_TEMPLATES.map((t) => ({
    ...t,
    evidenceFile: `artifacts/revenue/${pipelineId}/${t.stepId}.json`,
    status: opts.skipSteps?.includes(t.stepId) ? ("SKIPPED" as const) : ("PENDING" as const),
    lastVerifiedAt: null,
    verifiedBy: null,
    durationMs: null,
    notes: null,
  }));

  return {
    pipelineId,
    type,
    label,
    stripeProductId: opts.stripeProductId ?? null,
    stripePriceId:   opts.stripePriceId   ?? null,
    steps,
    overallStatus: "PENDING",
    lastFullPassAt: null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Canonical pipeline registry — one entry per purchasable product
// ─────────────────────────────────────────────────────────────────────────────

export const REVENUE_PIPELINE_LEDGER: RevenuePipelineCertRecord[] = [
  buildPipeline("membership-free-to-pro", "membership_upgrade",
    "Fan: FREE → PRO ($1.99/mo)", {
      skipSteps: ["13_advertiser_stats"],
    }),
  buildPipeline("membership-pro-to-ruby", "membership_upgrade",
    "Fan: PRO → RUBY ($4.99/mo)", {
      skipSteps: ["13_advertiser_stats"],
    }),
  buildPipeline("membership-new-fan-pro", "membership_new",
    "New Fan: sign up directly to PRO", {
      skipSteps: ["13_advertiser_stats"],
    }),
  buildPipeline("ticket-general-admission", "ticket_purchase",
    "Ticket: General Admission", {
      skipSteps: ["13_advertiser_stats"],
    }),
  buildPipeline("ticket-vip", "ticket_purchase",
    "Ticket: VIP", {
      skipSteps: ["13_advertiser_stats"],
    }),
  buildPipeline("tip-performer", "tip",
    "Tip: Fan → Performer", {
      skipSteps: ["08_ticket_or_entitlement", "13_advertiser_stats"],
    }),
  buildPipeline("advertiser-banner-30day", "advertiser_ad",
    "Advertiser: Banner Ad 30-day placement", {
    }),
  buildPipeline("sponsor-homepage-feature", "sponsor_placement",
    "Sponsor: Homepage Feature Slot", {
    }),
];

// ─────────────────────────────────────────────────────────────────────────────
// Runtime mutators — called via PATCH /api/admin/certification-fleet
// ─────────────────────────────────────────────────────────────────────────────

const _pipelineResults = new Map<string, Map<string, Partial<PipelineStep>>>();

export function recordPipelineStepResult(
  pipelineId: string,
  stepId: string,
  result: {
    status: PipelineStepStatus;
    lastVerifiedAt: string;
    verifiedBy: string;
    durationMs?: number;
    notes?: string;
  }
): void {
  if (!_pipelineResults.has(pipelineId)) {
    _pipelineResults.set(pipelineId, new Map());
  }
  _pipelineResults.get(pipelineId)!.set(stepId, result);
}

export function getPipelineSummary(): {
  total: number;
  greenPipelines: number;
  holdPipelines: number;
  pendingPipelines: number;
  blockingFailures: { pipelineId: string; stepId: string; label: string }[];
  overallRevenueCertification: "GREEN" | "HOLD" | "PENDING";
} {
  const total = REVENUE_PIPELINE_LEDGER.length;
  let greenPipelines = 0;
  let holdPipelines = 0;
  let pendingPipelines = 0;
  const blockingFailures: { pipelineId: string; stepId: string; label: string }[] = [];

  for (const pipeline of REVENUE_PIPELINE_LEDGER) {
    const stepMap = _pipelineResults.get(pipeline.pipelineId);
    let pipelineGreen = true;
    let pipelinePending = false;

    for (const step of pipeline.steps) {
      if (step.status === "SKIPPED") continue;
      const result = stepMap?.get(step.stepId);
      const status = result?.status ?? "PENDING";

      if (status === "PENDING") {
        pipelinePending = true;
        pipelineGreen = false;
      } else if (status === "FAIL") {
        pipelineGreen = false;
        if (step.blocking) {
          blockingFailures.push({ pipelineId: pipeline.pipelineId, stepId: step.stepId, label: step.label });
        }
      }
    }

    if (pipelineGreen) greenPipelines++;
    else if (pipelinePending) pendingPipelines++;
    else holdPipelines++;
  }

  let overallRevenueCertification: "GREEN" | "HOLD" | "PENDING" = "PENDING";
  if (pendingPipelines === 0 && holdPipelines === 0) {
    overallRevenueCertification = "GREEN";
  } else if (pendingPipelines === 0 && greenPipelines > 0) {
    overallRevenueCertification = "HOLD";
  }

  return { total, greenPipelines, holdPipelines, pendingPipelines, blockingFailures, overallRevenueCertification };
}

export function getPipelineById(pipelineId: string): RevenuePipelineCertRecord | null {
  return REVENUE_PIPELINE_LEDGER.find((p) => p.pipelineId === pipelineId) ?? null;
}

export function getEvidenceRequirements(): { pipelineId: string; stepId: string; evidenceFile: string; blocking: boolean }[] {
  return REVENUE_PIPELINE_LEDGER.flatMap((p) =>
    p.steps
      .filter((s) => s.status !== "SKIPPED")
      .map((s) => ({ pipelineId: p.pipelineId, stepId: s.stepId, evidenceFile: s.evidenceFile, blocking: s.blocking }))
  );
}
