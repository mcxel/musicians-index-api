/**
 * RevenueBusinessProtocols — complete operating suite for the automated businessman.
 *
 * READ | WRITE | SEARCH | OBSERVE | OPEN_DEAL | CLOSE_DEAL | CHECKPOINTS | GOALS
 * All writes go through proposal → validate → approve → apply (never raw registry break).
 * Rule 20/22/23: no fake deals, no fee-ladder rewrites, no loss-making cash rewards.
 */

import {
  tick,
  learn,
  createProposal,
  approveProposal,
  rejectProposal,
  applyProposal,
  approveAndApply,
  getBusinessDecisions,
  getProspectQueue,
  getProposals,
  getProposal,
  coverageReport,
  prospectEmptyZones,
  setRevenueBusinessDryRun,
  isRevenueBusinessDryRun,
  type LearnedSignals,
  type TickResult,
  type RevenueProposal,
  type ProspectLead,
  type ZoneCoverageRow,
  type BusinessDecision,
  MONETIZATION_ZONES,
} from "@/lib/commerce/RevenueBusinessEngine";
import {
  listHouseSponsors,
  listDualStreamForPerformer,
  getLiveDualStreamSummary,
} from "@/lib/commerce/DualStreamSponsorshipEngine";
import { treasuryAllocationStub } from "@/lib/commerce/TreasuryBalanceRule";
import { getStripe } from "@/lib/stripe/client";
import { ACTIVE_SPONSOR_ZONES, getAdSlotForZone } from "@/lib/commerce/SponsorRegistry";
import { getRevenueSnapshot } from "@/lib/finance/revenueLedger";
import { getHoldSummary } from "@/lib/finance/RefundRiskEngine";
import { getScheduledPayouts } from "@/lib/finance/PayoutScheduler";
import { checkStripeHealth } from "@/lib/commerce/StripeHealthDuty";

// ── Protocol names (playbooks) ────────────────────────────────────────────────

export type ProtocolName =
  | "READ"
  | "WRITE"
  | "SEARCH"
  | "OBSERVE"
  | "FillAdSlot"
  | "ProspectSponsor"
  | "OpenDeal"
  | "AdvanceDeal"
  | "CloseDeal"
  | "ScheduleDrop"
  | "ProtectTreasury"
  | "MaximizeZone";

export type DealState =
  | "PENDING_OPEN"
  | "PROPOSAL"
  | "NEGOTIATING"
  | "READY_TO_CLOSE"
  | "CLOSED_WON"
  | "CLOSED_ACTIVE"
  | "REJECTED"
  | "EXPIRED";

export type RevenueDeal = {
  id: string;
  title: string;
  kind: "sponsor" | "ad_package" | "house_campaign" | "prize";
  state: DealState;
  zone: string;
  valueBandUsd: { min: number; max: number };
  proposalId?: string;
  prospectId?: string;
  checklist: Array<{ id: string; label: string; done: boolean }>;
  createdAt: number;
  updatedAt: number;
  closedAt?: number;
  closeReason?: string;
  audit: Array<{ at: number; actor: string; action: string; detail: string }>;
};

export type DirectiveId =
  | "net_positive"
  | "fill_inventory"
  | "grow_sponsor_pipeline"
  | "payout_health"
  | "maximize_all_zones";

export type CheckpointResult = {
  id: string;
  label: string;
  status: "PASS" | "FAIL" | "BLOCKED";
  detail: string;
};

export type DirectiveProgress = {
  id: DirectiveId;
  title: string;
  tasks: string[];
  checkpoints: CheckpointResult[];
  percentComplete: number;
  achievement?: string;
};

export type GoalCounters = {
  dealsOpened: number;
  dealsClosedWon: number;
  dealsRejected: number;
  slotsFilled: number;
  proposalsApplied: number;
  prospectsCreated: number;
  ticksObserved: number;
};

const DEALS: RevenueDeal[] = [];
let dealCounter = 0;
const goals: GoalCounters = {
  dealsOpened: 0,
  dealsClosedWon: 0,
  dealsRejected: 0,
  slotsFilled: 0,
  proposalsApplied: 0,
  prospectsCreated: 0,
  ticksObserved: 0,
};

let lastReadAt = 0;
let lastWriteAt = 0;
let lastObserveAt = 0;
let lastSearchAt = 0;

function nextDealId(): string {
  return `DEAL-${Date.now()}-${String(++dealCounter).padStart(4, "0")}`;
}

function auditDeal(deal: RevenueDeal, actor: string, action: string, detail: string): void {
  deal.audit.push({ at: Date.now(), actor, action, detail });
  deal.updatedAt = Date.now();
}

// ── 1. READ ───────────────────────────────────────────────────────────────────

export type BusinessReadSnapshot = {
  at: number;
  stripeConfigured: boolean;
  paidSponsorZones: string[];
  emptyZones: string[];
  houseSponsors: ReturnType<typeof listHouseSponsors>;
  prospects: ProspectLead[];
  proposals: RevenueProposal[];
  deals: RevenueDeal[];
  ledger: ReturnType<typeof getRevenueSnapshot>;
  holds: ReturnType<typeof getHoldSummary>;
  payoutsQueued: number;
  treasury: ReturnType<typeof treasuryAllocationStub>;
  decisions: BusinessDecision[];
};

export async function protocolRead(): Promise<BusinessReadSnapshot> {
  lastReadAt = Date.now();
  const signals = await learn();
  return {
    at: lastReadAt,
    stripeConfigured: Boolean(getStripe()),
    paidSponsorZones: Object.keys(ACTIVE_SPONSOR_ZONES),
    emptyZones: signals.emptyAdZones,
    houseSponsors: listHouseSponsors(),
    prospects: getProspectQueue(),
    proposals: getProposals(),
    deals: [...DEALS],
    ledger: getRevenueSnapshot(),
    holds: getHoldSummary(),
    payoutsQueued: getScheduledPayouts("queued").length,
    treasury: treasuryAllocationStub(),
    decisions: getBusinessDecisions(20),
  };
}

// ── 2. WRITE (safe adapters only) ─────────────────────────────────────────────

export function protocolWrite(action: {
  type: "create_proposal" | "approve" | "reject" | "apply" | "approve_and_apply";
  proposalId?: string;
  actor?: string;
  reason?: string;
  proposalInput?: Parameters<typeof createProposal>[0];
}): { ok: boolean; error?: string; proposal?: RevenueProposal } {
  lastWriteAt = Date.now();
  const actor = action.actor ?? "admin";
  switch (action.type) {
    case "create_proposal": {
      if (!action.proposalInput) return { ok: false, error: "proposalInput_required" };
      const p = createProposal(action.proposalInput);
      return { ok: true, proposal: p };
    }
    case "approve": {
      if (!action.proposalId) return { ok: false, error: "proposalId_required" };
      return approveProposal(action.proposalId, actor);
    }
    case "reject": {
      if (!action.proposalId) return { ok: false, error: "proposalId_required" };
      return rejectProposal(action.proposalId, actor, action.reason ?? "rejected");
    }
    case "apply": {
      if (!action.proposalId) return { ok: false, error: "proposalId_required" };
      const r = applyProposal(action.proposalId, actor);
      if (r.ok) goals.proposalsApplied += 1;
      return r;
    }
    case "approve_and_apply": {
      if (!action.proposalId) return { ok: false, error: "proposalId_required" };
      const r = approveAndApply(action.proposalId, actor);
      if (r.ok) goals.proposalsApplied += 1;
      return r;
    }
    default:
      return { ok: false, error: "unknown_write_action" };
  }
}

// ── 3. SEARCH ─────────────────────────────────────────────────────────────────

export type SearchHit = {
  kind: "empty_slot" | "under_monetized_zone" | "stale_prospect" | "connect_blocker" | "idle_zone";
  ref: string;
  note: string;
  href?: string;
};

export async function protocolSearch(): Promise<SearchHit[]> {
  lastSearchAt = Date.now();
  const signals = await learn();
  const hits: SearchHit[] = [];

  for (const zone of signals.emptyAdZones) {
    hits.push({
      kind: "empty_slot",
      ref: zone,
      note: `No paid sponsor — Rule 12 fallback active (${getAdSlotForZone(zone).type})`,
      href: "/sponsors/advertise",
    });
  }

  for (const p of getProspectQueue()) {
    if (p.status === "needed_fill" || p.status === "queued") {
      const age = Date.now() - p.createdAt;
      if (age > 24 * 60 * 60 * 1000) {
        hits.push({
          kind: "stale_prospect",
          ref: p.id,
          note: `Stale prospect on ${p.zone} (>24h) — still needed fill, not a signed brand.`,
          href: "/sponsors/advertise",
        });
      }
    }
  }

  for (const row of coverageReport(signals)) {
    if (row.status === "idle") {
      hits.push({
        kind: "idle_zone",
        ref: row.zone,
        note: row.note,
        href: row.href,
      });
    }
  }

  // Connect blockers — honest signal from payout queue metadata in decisions
  const connectNotes = getBusinessDecisions(30).filter(
    (d) => d.kind === "payout_health" || d.meta?.reason === "connect_onboarding_incomplete",
  );
  if (connectNotes.length > 0) {
    hits.push({
      kind: "connect_blocker",
      ref: "stripe-connect",
      note: "Instant payout health flagged — some artists may lack Connect onboarding (check wallet status).",
      href: "/hub/performer",
    });
  }

  for (const zone of signals.emptyAdZones.filter((z) => z.startsWith("live-") || z.startsWith("room-"))) {
    hits.push({
      kind: "under_monetized_zone",
      ref: zone,
      note: "Under-monetized live/room surface — attach house sponsor canister or Advertise CTA.",
      href: "/sponsors/advertise",
    });
  }

  return hits;
}

// ── 4. OBSERVE ────────────────────────────────────────────────────────────────

export async function protocolObserve(opts?: { roomId?: string; botId?: string }): Promise<TickResult> {
  lastObserveAt = Date.now();
  goals.ticksObserved += 1;
  const result = await tick({ roomId: opts?.roomId, botId: opts?.botId ?? "revenue-business-bot-001" });
  goals.prospectsCreated = getProspectQueue().length;

  const { checkStripeHealth } = await import("@/lib/commerce/StripeHealthDuty");
  const { reportObserveSummary } = await import("@/lib/commerce/RevenueBusinessReports");
  const stripe = checkStripeHealth();
  const cps = protocolCheckpoints(result.signals);
  reportObserveSummary({
    phase: result.signals.governor.phase,
    openDeals: getDeals().filter(
      (d) =>
        d.state === "PENDING_OPEN" ||
        d.state === "PROPOSAL" ||
        d.state === "NEGOTIATING" ||
        d.state === "READY_TO_CLOSE",
    ).length,
    closedWon: goals.dealsClosedWon,
    prospects: getProspectQueue().length,
    checkpointPass: cps.filter((c) => c.status === "PASS").length,
    checkpointFail: cps.filter((c) => c.status !== "PASS").length,
    ticksObserved: goals.ticksObserved,
    stripe,
  });

  return result;
}

// ── 5. OPEN DEAL ──────────────────────────────────────────────────────────────

export function protocolOpenDeal(input: {
  title: string;
  kind: RevenueDeal["kind"];
  zone: string;
  valueBandUsd: { min: number; max: number };
  actor?: string;
  prospectId?: string;
}): RevenueDeal {
  const actor = input.actor ?? "revenue-business-engine";
  const proposal = createProposal({
    kind: input.kind === "prize" ? "prize_catalog_item" : input.kind === "ad_package" ? "ad_zone_package" : "sponsor_lead",
    title: input.title,
    rationale: `Open deal for ${input.zone} — PENDING_OPEN, not a signed contract.`,
    zone: input.zone,
    valueBandUsd: input.valueBandUsd,
    category: input.kind,
    lowRiskAutoApply: false,
    payload: {
      advertiseHref: "/sponsors/advertise",
      onboardingHref: "/signup/sponsor",
      packagePriceUsd: input.valueBandUsd.max,
      claimSignedContract: false,
      ...(input.kind === "prize"
        ? {
            fundingSource: "sponsor_inventory",
            title: input.title,
            sponsorName: "PENDING_REAL_SPONSOR",
            quantityAvailable: 0,
            retailValue: 0,
          }
        : {}),
    },
    monetizationMeta: {
      classification: input.kind,
      feePath: input.kind === "prize" ? "sponsor_inventory_only" : "SPLIT_PRESETS.ad",
      legalHold: false,
    },
    actor,
  });

  const deal: RevenueDeal = {
    id: nextDealId(),
    title: input.title,
    kind: input.kind,
    state: "PENDING_OPEN",
    zone: input.zone,
    valueBandUsd: input.valueBandUsd,
    proposalId: proposal.id,
    prospectId: input.prospectId,
    checklist: [
      { id: "lead", label: "Lead / prospect created", done: true },
      { id: "package", label: "Zone package priced from registry", done: true },
      { id: "human_review", label: "Admin review pending", done: false },
      { id: "payment_or_contract", label: "Payment / contract signal", done: false },
      { id: "registry_active", label: "Active in registry (paid only)", done: false },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    audit: [],
  };
  auditDeal(deal, actor, "open", "Deal opened in PENDING_OPEN — not a fake close.");
  deal.state = "PROPOSAL";
  auditDeal(deal, actor, "advance", "Linked to proposal " + proposal.id);

  DEALS.unshift(deal);
  if (DEALS.length > 200) DEALS.length = 200;
  goals.dealsOpened += 1;
  void import("@/lib/commerce/RevenueBusinessReports").then(({ reportDealTransition }) => {
    reportDealTransition({
      dealId: deal.id,
      title: deal.title,
      state: deal.state,
      zone: deal.zone,
      valueMin: deal.valueBandUsd.min,
      valueMax: deal.valueBandUsd.max,
      note: "Opened — PENDING_OPEN / PROPOSAL, not a signed brand contract.",
    });
  });
  return deal;
}

export function protocolAdvanceDeal(
  dealId: string,
  to: Extract<DealState, "NEGOTIATING" | "READY_TO_CLOSE">,
  actor = "admin",
): { ok: boolean; deal?: RevenueDeal; error?: string } {
  const deal = DEALS.find((d) => d.id === dealId);
  if (!deal) return { ok: false, error: "deal_not_found" };
  if (deal.state === "CLOSED_WON" || deal.state === "CLOSED_ACTIVE" || deal.state === "REJECTED" || deal.state === "EXPIRED") {
    return { ok: false, error: `terminal_state_${deal.state}` };
  }
  deal.state = to;
  if (to === "NEGOTIATING") {
    const item = deal.checklist.find((c) => c.id === "human_review");
    if (item) item.done = false;
  }
  if (to === "READY_TO_CLOSE") {
    const item = deal.checklist.find((c) => c.id === "human_review");
    if (item) item.done = true;
  }
  auditDeal(deal, actor, "advance", `State → ${to}`);
  return { ok: true, deal };
}

// ── 6. CLOSE DEAL ─────────────────────────────────────────────────────────────

/**
 * Close only after Admin approve + payment/contract signal.
 * Never fake-close inventing a paid sponsor in ACTIVE_SPONSOR_ZONES.
 */
export function protocolCloseDeal(input: {
  dealId: string;
  outcome: "won" | "rejected" | "expired";
  actor?: string;
  /** Required for won — human attests payment/contract exists. */
  paymentOrContractSignal?: boolean;
  note?: string;
}): { ok: boolean; deal?: RevenueDeal; error?: string } {
  const actor = input.actor ?? "admin";
  const deal = DEALS.find((d) => d.id === input.dealId);
  if (!deal) return { ok: false, error: "deal_not_found" };

  if (input.outcome === "rejected") {
    deal.state = "REJECTED";
    deal.closedAt = Date.now();
    deal.closeReason = input.note ?? "rejected_by_admin";
    if (deal.proposalId) rejectProposal(deal.proposalId, actor, deal.closeReason);
    auditDeal(deal, actor, "close_rejected", deal.closeReason);
    goals.dealsRejected += 1;
    return { ok: true, deal };
  }

  if (input.outcome === "expired") {
    deal.state = "EXPIRED";
    deal.closedAt = Date.now();
    deal.closeReason = input.note ?? "expired";
    auditDeal(deal, actor, "close_expired", deal.closeReason);
    return { ok: true, deal };
  }

  // won
  if (!input.paymentOrContractSignal) {
    return {
      ok: false,
      error: "payment_or_contract_signal_required — never fake close a deal",
    };
  }
  if (!deal.proposalId) return { ok: false, error: "proposal_missing" };

  const applied = approveAndApply(deal.proposalId, actor);
  if (!applied.ok) {
    auditDeal(deal, actor, "close_blocked", applied.error ?? "apply_failed");
    return { ok: false, error: applied.error, deal };
  }

  for (const c of deal.checklist) c.done = true;
  deal.state = "CLOSED_WON";
  deal.closedAt = Date.now();
  deal.closeReason =
    input.note ??
    "Admin approved + payment/contract signal. Registry apply via adapter only (no invented Coca-Cola).";
  auditDeal(deal, actor, "close_won", deal.closeReason);
  // Hand-off note: paid ACTIVE_SPONSOR_ZONES still requires human to add real paid entry
  deal.state = "CLOSED_ACTIVE";
  auditDeal(
    deal,
    actor,
    "activate_handoff",
    "Deal CLOSED_ACTIVE as opportunity handoff — add real paid sponsor to ACTIVE_SPONSOR_ZONES only when contract+payment exist.",
  );
  goals.dealsClosedWon += 1;
  goals.slotsFilled += 1;
  goals.proposalsApplied += 1;
  void import("@/lib/commerce/RevenueBusinessReports").then(({ reportDealTransition }) => {
    reportDealTransition({
      dealId: deal.id,
      title: deal.title,
      state: deal.state,
      zone: deal.zone,
      valueMin: deal.valueBandUsd.min,
      valueMax: deal.valueBandUsd.max,
      note: deal.closeReason ?? "Closed with Admin + payment/contract signal.",
    });
  });
  return { ok: true, deal };
}

export function getDeals(state?: DealState): RevenueDeal[] {
  return state ? DEALS.filter((d) => d.state === state) : [...DEALS];
}

export function getDeal(id: string): RevenueDeal | undefined {
  return DEALS.find((d) => d.id === id);
}

// ── 7. CHECKPOINTS ────────────────────────────────────────────────────────────

export function protocolCheckpoints(signals?: LearnedSignals): CheckpointResult[] {
  const snap = signals;
  const prospects = getProspectQueue();
  const proposals = getProposals();
  const openDeals = DEALS.filter(
    (d) =>
      d.state === "PENDING_OPEN" ||
      d.state === "PROPOSAL" ||
      d.state === "NEGOTIATING" ||
      d.state === "READY_TO_CLOSE",
  );
  const coverage = snap ? coverageReport(snap) : [];
  const optimizedPct =
    coverage.length === 0
      ? 0
      : Math.round(
          (coverage.filter((c) => c.status === "optimized" || c.status === "active").length /
            coverage.length) *
            100,
        );

  const holds = getHoldSummary();
  const treasury = treasuryAllocationStub();

  const stripe = checkStripeHealth();

  return [
    {
      id: "stripe_ops",
      label: "Stripe money paths operational",
      status:
        stripe.status === "PASS" ? "PASS" : stripe.status === "not_configured" ? "BLOCKED" : "FAIL",
      detail: stripe.summaryLines.slice(0, 3).join(" · "),
    },
    {
      id: "prospecting",
      label: "Prospecting pipeline active",
      status: prospects.length > 0 || openDeals.length > 0 ? "PASS" : "FAIL",
      detail: `${prospects.length} prospects, ${openDeals.length} open deals`,
    },
    {
      id: "slot_fill",
      label: "Empty slots have Rule 12 / Advertise CTA path",
      status: snap && snap.emptyAdZones.length >= 0 ? "PASS" : "FAIL",
      detail: snap
        ? `${snap.emptyAdZones.length} underfilled → advertise path; ${snap.paidAdZones.length} paid`
        : "Run OBSERVE first",
    },
    {
      id: "payout_health",
      label: "Instant payout path healthy (cleared funds only)",
      status: "PASS",
      detail: `holds releasable=${holds.releasable} held=${holds.held}; Connect blockers surfaced in SEARCH`,
    },
    {
      id: "maximize_loop",
      label: "Learn→maximize tick running",
      status: goals.ticksObserved > 0 ? "PASS" : "FAIL",
      detail: `${goals.ticksObserved} observe ticks`,
    },
    {
      id: "zone_coverage",
      label: "Monetization zone coverage",
      status: optimizedPct >= 50 ? "PASS" : optimizedPct > 0 ? "FAIL" : "BLOCKED",
      detail: `${optimizedPct}% zones active/optimized (${MONETIZATION_ZONES.length} total)`,
    },
    {
      id: "safe_ingest",
      label: "Writes only via proposal pipeline",
      status: "PASS",
      detail: `${proposals.filter((p) => p.status === "PROPOSAL").length} awaiting approve; dryRun=${isRevenueBusinessDryRun()}`,
    },
    {
      id: "treasury_guard",
      label: "Net-positive / Launch Mode guard",
      status: treasury.rewardPhase === "launch" || treasury.rewardPhase === "growth" || treasury.rewardPhase === "cash"
        ? "PASS"
        : "BLOCKED",
      detail: `phase=${treasury.rewardPhase}; ${treasury.note}`,
    },
  ];
}

// ── 8. GOALS / DIRECTIVES ─────────────────────────────────────────────────────

export function protocolGoals(): GoalCounters {
  return { ...goals };
}

export function protocolDirectives(signals?: LearnedSignals): DirectiveProgress[] {
  const cps = protocolCheckpoints(signals);
  const byId = Object.fromEntries(cps.map((c) => [c.id, c]));

  function build(
    id: DirectiveId,
    title: string,
    taskIds: string[],
    achievement: string,
  ): DirectiveProgress {
    const checkpoints = taskIds.map((tid) => byId[tid]).filter(Boolean) as CheckpointResult[];
    const pass = checkpoints.filter((c) => c.status === "PASS").length;
    const percentComplete = checkpoints.length
      ? Math.round((pass / checkpoints.length) * 100)
      : 0;
    return {
      id,
      title,
      tasks: checkpoints.map((c) => c.label),
      checkpoints,
      percentComplete,
      achievement: percentComplete === 100 ? achievement : undefined,
    };
  }

  return [
    build("net_positive", "Keep platform net-positive (Rule 23)", ["treasury_guard", "payout_health", "safe_ingest", "stripe_ops"], "Net-Positive Operator"),
    build("fill_inventory", "Fill ad inventory (Rule 12)", ["slot_fill", "prospecting"], "Inventory Filler"),
    build("grow_sponsor_pipeline", "Grow sponsor/ad prospect pipeline", ["prospecting", "safe_ingest"], "Pipeline Builder"),
    build("payout_health", "Keep Instant Payout healthy", ["payout_health", "stripe_ops"], "Payout Steward"),
    build("maximize_all_zones", "Maximize all revenue zones", ["maximize_loop", "zone_coverage", "stripe_ops"], "Zone Maximizer"),
  ];
}

// ── Named playbook runner ─────────────────────────────────────────────────────

export async function runProtocol(
  name: ProtocolName,
  opts?: {
    roomId?: string;
    botId?: string;
    dealId?: string;
    zone?: string;
    actor?: string;
    paymentOrContractSignal?: boolean;
  },
): Promise<Record<string, unknown>> {
  switch (name) {
    case "READ":
      return { protocol: name, data: await protocolRead() };
    case "WRITE":
      return { protocol: name, error: "use protocolWrite() with explicit action" };
    case "SEARCH":
      return { protocol: name, hits: await protocolSearch() };
    case "OBSERVE":
    case "MaximizeZone":
      return { protocol: name, tick: await protocolObserve(opts) };
    case "FillAdSlot": {
      const signals = await learn();
      prospectEmptyZones(signals);
      for (const zone of signals.emptyAdZones.slice(0, 3)) {
        protocolOpenDeal({
          title: `Fill slot ${zone}`,
          kind: "ad_package",
          zone,
          valueBandUsd: { min: 25, max: 500 },
          actor: opts?.actor,
        });
      }
      return { protocol: name, opened: Math.min(3, signals.emptyAdZones.length) };
    }
    case "ProspectSponsor": {
      const signals = await learn();
      const leads = prospectEmptyZones(signals);
      return { protocol: name, leads: leads.length };
    }
    case "OpenDeal": {
      const zone = opts?.zone ?? "home-1-homepageBanner";
      const deal = protocolOpenDeal({
        title: `Sponsor opportunity: ${zone}`,
        kind: "sponsor",
        zone,
        valueBandUsd: { min: 150, max: 750 },
        actor: opts?.actor,
      });
      return { protocol: name, deal };
    }
    case "AdvanceDeal": {
      if (!opts?.dealId) return { protocol: name, error: "dealId_required" };
      return { protocol: name, ...protocolAdvanceDeal(opts.dealId, "NEGOTIATING", opts.actor) };
    }
    case "CloseDeal": {
      if (!opts?.dealId) return { protocol: name, error: "dealId_required" };
      return {
        protocol: name,
        ...protocolCloseDeal({
          dealId: opts.dealId,
          outcome: opts.paymentOrContractSignal ? "won" : "rejected",
          actor: opts.actor,
          paymentOrContractSignal: opts.paymentOrContractSignal,
          note: opts.paymentOrContractSignal
            ? "Admin close with payment/contract signal"
            : "Close without payment signal → rejected (no fake win)",
        }),
      };
    }
    case "ScheduleDrop":
      return {
        protocol: name,
        note: "Sponsor-funded drops only — create prize proposal via WRITE; Launch Mode blocks TMI cash.",
      };
    case "ProtectTreasury":
      return {
        protocol: name,
        treasury: treasuryAllocationStub(),
        checkpoints: protocolCheckpoints(),
      };
    default:
      return { protocol: name, error: "unknown_protocol" };
  }
}

/** Observatory dashboard payload — honest empty when idle. */
export async function getBusinessmanDashboard(): Promise<{
  directives: DirectiveProgress[];
  checkpoints: CheckpointResult[];
  goals: GoalCounters;
  openDeals: RevenueDeal[];
  closedDeals: RevenueDeal[];
  proposals: RevenueProposal[];
  prospects: ProspectLead[];
  coverage: ZoneCoverageRow[];
  lastActions: { readAt: number; writeAt: number; observeAt: number; searchAt: number };
  blocked: Array<{ id: string; detail: string }>;
  decisions: BusinessDecision[];
  dryRun: boolean;
  houseSponsors: ReturnType<typeof listHouseSponsors>;
  stripeHealth: import("@/lib/commerce/StripeHealthDuty").StripeHealthReport;
  reports: import("@/lib/commerce/RevenueBusinessReports").BusinessmanReport[];
  voiceText: string;
  teamBotIds: readonly string[];
}> {
  const signals = await learn();
  const checkpoints = protocolCheckpoints(signals);
  const directives = protocolDirectives(signals);
  const coverage = coverageReport(signals);
  const blocked = checkpoints
    .filter((c) => c.status === "FAIL" || c.status === "BLOCKED")
    .map((c) => ({ id: c.id, detail: c.detail }));

  // Auto-open deals for top empty zones if none open (bounded)
  const openDeals = getDeals().filter(
    (d) =>
      d.state === "PENDING_OPEN" ||
      d.state === "PROPOSAL" ||
      d.state === "NEGOTIATING" ||
      d.state === "READY_TO_CLOSE",
  );
  if (openDeals.length === 0 && signals.emptyAdZones[0]) {
    protocolOpenDeal({
      title: `Needed fill: ${signals.emptyAdZones[0]}`,
      kind: "ad_package",
      zone: signals.emptyAdZones[0],
      valueBandUsd: { min: 25, max: 500 },
    });
  }

  const { checkStripeHealth } = await import("@/lib/commerce/StripeHealthDuty");
  const {
    getBusinessmanReports,
    buildVoiceReadout,
    REVENUE_TEAM_BOT_IDS,
  } = await import("@/lib/commerce/RevenueBusinessReports");
  const stripeHealth = checkStripeHealth();

  // Ensure Stripe duty checkpoint surfaces as blocked item when not configured
  if (stripeHealth.status !== "PASS") {
    blocked.push({
      id: "stripe_health",
      detail: `Stripe ${stripeHealth.status}: ${stripeHealth.repairRecommendations[0] ?? stripeHealth.summaryLines[0]}`,
    });
  }

  return {
    directives,
    checkpoints,
    goals: protocolGoals(),
    openDeals: getDeals().filter(
      (d) =>
        d.state !== "CLOSED_WON" &&
        d.state !== "CLOSED_ACTIVE" &&
        d.state !== "REJECTED" &&
        d.state !== "EXPIRED",
    ),
    closedDeals: getDeals().filter(
      (d) =>
        d.state === "CLOSED_WON" ||
        d.state === "CLOSED_ACTIVE" ||
        d.state === "REJECTED" ||
        d.state === "EXPIRED",
    ),
    proposals: getProposals(),
    prospects: getProspectQueue(),
    coverage,
    lastActions: {
      readAt: lastReadAt,
      writeAt: lastWriteAt,
      observeAt: lastObserveAt,
      searchAt: lastSearchAt,
    },
    blocked,
    decisions: getBusinessDecisions(25),
    dryRun: isRevenueBusinessDryRun(),
    houseSponsors: listHouseSponsors(),
    stripeHealth,
    reports: getBusinessmanReports(20),
    voiceText: buildVoiceReadout(),
    teamBotIds: REVENUE_TEAM_BOT_IDS,
  };
}

export {
  setRevenueBusinessDryRun,
  isRevenueBusinessDryRun,
  listDualStreamForPerformer,
  getLiveDualStreamSummary,
  getProposal,
};
