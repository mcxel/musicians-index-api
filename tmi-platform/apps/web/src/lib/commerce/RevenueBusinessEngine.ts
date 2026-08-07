/**
 * RevenueBusinessEngine — automated "businessman" (Rule 22/23/20).
 *
 * Learn → Act (maximize) → Prospect → Propose (safe ingest).
 * Never mutates canonical registries without validated proposal → review → apply.
 * Never invents brand deals, fake viewers, or rewrites the fee ladder.
 */

import {
  getAdSlotForZone,
  ACTIVE_SPONSOR_ZONES,
  SponsorSlotRegistry,
  type AdSlotDescriptor,
} from "@/lib/commerce/SponsorRegistry";
import {
  listHouseSponsors,
  syncLiveRoomSponsors,
  getLiveDualStreamSummary,
} from "@/lib/commerce/DualStreamSponsorshipEngine";
import { treasuryAllocationStub } from "@/lib/commerce/TreasuryBalanceRule";
import {
  revenueFirstRewardsGovernor,
  type RewardGovernorDecision,
} from "@/lib/economy/RevenueFirstRewardsGovernor";
import { getRevenueSnapshot } from "@/lib/finance/revenueLedger";
import { getHoldSummary } from "@/lib/finance/RefundRiskEngine";
import { getScheduledPayouts } from "@/lib/finance/PayoutScheduler";
import { listRecentFeatured } from "@/lib/beats/BeatPurchaseInterestEngine";
import { POINT_PACKS } from "@/lib/points/PointPackCatalog";
import {
  getActiveCampaigns,
  registerPrizeDonation,
} from "@/lib/sponsors/SponsorRewardPlacementEngine";
import { registerPrizeInInventory, type PrizeItem } from "@/lib/commerce/AudienceGiveawayEngine";
import { botReportToAdmin } from "@/lib/bots/permanentBotOperationsEngine";
import { CREATOR_COMMERCE_PLATFORM_FEE_BPS } from "@/lib/commerce/RevenueSplitEngine";

// ── Monetization zone coverage (100% checklist) ───────────────────────────────

export const MONETIZATION_ZONES = [
  "ads_house",
  "ads_paid",
  "advertise_cta",
  "performer_sponsors_hunted",
  "tips",
  "beats_marketplace",
  "points_packs",
  "season_pass",
  "subscriptions",
  "tickets",
  "store_merch",
  "sponsor_prizes",
  "instant_payouts",
  "live_discovery",
] as const;

export type MonetizationZone = (typeof MONETIZATION_ZONES)[number];

export type ZoneCoverageStatus = "optimized" | "active" | "idle" | "blocked";

export type ZoneCoverageRow = {
  zone: MonetizationZone;
  status: ZoneCoverageStatus;
  note: string;
  href?: string;
};

// ── Decisions / audit ─────────────────────────────────────────────────────────

export type BusinessDecisionKind =
  | "fill_ad_slot"
  | "prospect_lead"
  | "house_drop"
  | "points_prompt"
  | "season_pass_prompt"
  | "beat_interest_prompt"
  | "tip_cta_timing"
  | "sponsor_prize_drop"
  | "payout_health"
  | "live_discovery_fill"
  | "scale_down_cash"
  | "proposal_created"
  | "proposal_applied"
  | "proposal_rejected"
  | "observe";

export type BusinessDecision = {
  id: string;
  kind: BusinessDecisionKind;
  at: number;
  summary: string;
  zone?: MonetizationZone;
  /** Expected platform margin score 0–100 (fee ladder / digital preference). */
  marginScore: number;
  riskScore: number;
  executed: boolean;
  dryRun: boolean;
  meta?: Record<string, string | number | boolean | null>;
};

// ── Safe ingest proposals ─────────────────────────────────────────────────────

export type ProposalKind =
  | "sponsor_lead"
  | "ad_zone_package"
  | "prize_catalog_item"
  | "price_suggestion"
  | "platform_promo_fill";

export type ProposalStatus =
  | "PROPOSAL"
  | "APPROVED"
  | "REJECTED"
  | "APPLIED"
  | "FAILED"
  | "ROLLED_BACK";

export type RevenueProposal = {
  id: string;
  kind: ProposalKind;
  status: ProposalStatus;
  createdAt: number;
  updatedAt: number;
  title: string;
  rationale: string;
  zone: string;
  /** Estimated value band — honest ranges, not signed contracts. */
  valueBandUsd: { min: number; max: number };
  category: string;
  /** Low-risk fills may auto-apply (Advertise CTA / platform promo only). */
  lowRiskAutoApply: boolean;
  payload: Record<string, unknown>;
  validationErrors: string[];
  audit: Array<{
    at: number;
    actor: string;
    action: string;
    detail: string;
  }>;
  appliedRef?: string;
  monetizationMeta?: {
    classification: string;
    feePath: string;
    legalHold?: boolean;
  };
};

export type ProspectLead = {
  id: string;
  zone: string;
  category: string;
  valueBandUsd: { min: number; max: number };
  status: "needed_fill" | "queued" | "pursuing" | "converted_paid" | "dismissed";
  advertiseHref: string;
  note: string;
  createdAt: number;
  proposalId?: string;
};

const DECISION_LOG: BusinessDecision[] = [];
const PROPOSALS: RevenueProposal[] = [];
const PROSPECT_QUEUE: ProspectLead[] = [];
const MAX_LOG = 200;

let dryRunMode = false;
let decisionCounter = 0;
let proposalCounter = 0;
let prospectCounter = 0;

const SCAN_ZONES = [
  "home-1-homepageBanner",
  "home-1-homepageMid",
  "home-2-homepageBanner",
  "home-3-liveLobbyBanner",
  "magazine-magazineLeaderboard",
  "performer-hub",
  "room-roomLeaderboard",
  "dashboard-dashboardBanner",
  "dashboard-performer-sponsors",
  "live-room-default",
] as const;

function nextDecisionId(): string {
  return `RBD-${Date.now()}-${String(++decisionCounter).padStart(4, "0")}`;
}

function nextProposalId(): string {
  return `RBP-${Date.now()}-${String(++proposalCounter).padStart(4, "0")}`;
}

function nextProspectId(): string {
  return `PROS-${Date.now()}-${String(++prospectCounter).padStart(4, "0")}`;
}

function pushDecision(d: Omit<BusinessDecision, "id" | "at" | "dryRun">): BusinessDecision {
  const row: BusinessDecision = {
    ...d,
    id: nextDecisionId(),
    at: Date.now(),
    dryRun: dryRunMode,
  };
  DECISION_LOG.unshift(row);
  if (DECISION_LOG.length > MAX_LOG) DECISION_LOG.length = MAX_LOG;
  return row;
}

function appendAudit(
  proposal: RevenueProposal,
  actor: string,
  action: string,
  detail: string,
): void {
  proposal.audit.push({ at: Date.now(), actor, action, detail });
  proposal.updatedAt = Date.now();
}

// ── Config ────────────────────────────────────────────────────────────────────

export function setRevenueBusinessDryRun(enabled: boolean): void {
  dryRunMode = enabled;
  pushDecision({
    kind: "observe",
    summary: enabled ? "Dry-run mode ON — proposals will not mutate registries." : "Dry-run mode OFF.",
    marginScore: 0,
    riskScore: 0,
    executed: true,
  });
}

export function isRevenueBusinessDryRun(): boolean {
  return dryRunMode;
}

// ── Learn phase ───────────────────────────────────────────────────────────────

export type LearnedSignals = {
  at: number;
  governor: RewardGovernorDecision;
  revenue: ReturnType<typeof getRevenueSnapshot>;
  holdSummary: ReturnType<typeof getHoldSummary>;
  payoutQueued: number;
  emptyAdZones: string[];
  paidAdZones: string[];
  platformPromoZones: string[];
  advertiseCtaZones: string[];
  featuredBeats: number;
  activeSponsorPrizeCampaigns: number;
  pointPackSkuCount: number;
  houseSponsorCount: number;
  treasury: ReturnType<typeof treasuryAllocationStub>;
  slotInventory: Array<{ zone: string; priceUsd: number; status: string }>;
};

export async function learn(): Promise<LearnedSignals> {
  const governor = revenueFirstRewardsGovernor.evaluate();
  const revenue = getRevenueSnapshot();
  const holdSummary = getHoldSummary();
  const payoutQueued = getScheduledPayouts("queued").length;

  const emptyAdZones: string[] = [];
  const paidAdZones: string[] = [];
  const platformPromoZones: string[] = [];
  const advertiseCtaZones: string[] = [];

  for (const zone of SCAN_ZONES) {
    const slot = getAdSlotForZone(zone);
    if (slot.type === "paid") paidAdZones.push(zone);
    else if (slot.type === "platform") {
      platformPromoZones.push(zone);
      emptyAdZones.push(zone);
    } else if (slot.type === "advertise-cta") {
      advertiseCtaZones.push(zone);
      emptyAdZones.push(zone);
    } else {
      emptyAdZones.push(zone);
    }
  }

  // Also count ACTIVE_SPONSOR_ZONES as paid
  for (const z of Object.keys(ACTIVE_SPONSOR_ZONES)) {
    if (!paidAdZones.includes(z)) paidAdZones.push(z);
  }

  const slots = await SponsorSlotRegistry.getAvailableSlots();

  const signals: LearnedSignals = {
    at: Date.now(),
    governor,
    revenue,
    holdSummary,
    payoutQueued,
    emptyAdZones,
    paidAdZones,
    platformPromoZones,
    advertiseCtaZones,
    featuredBeats: listRecentFeatured(12).length,
    activeSponsorPrizeCampaigns: getActiveCampaigns().length,
    pointPackSkuCount: POINT_PACKS.length,
    houseSponsorCount: listHouseSponsors().length,
    treasury: treasuryAllocationStub(),
    slotInventory: slots.map((s) => ({
      zone: s.zone,
      priceUsd: s.priceUsd,
      status: s.status,
    })),
  };

  pushDecision({
    kind: "observe",
    summary: `Learned: ${emptyAdZones.length} underfilled ad zones, ${paidAdZones.length} paid, ${signals.featuredBeats} featured beats, reward phase=${governor.phase}.`,
    marginScore: 0,
    riskScore: 0,
    executed: true,
    meta: {
      emptyZones: emptyAdZones.length,
      paidZones: paidAdZones.length,
      phase: governor.phase,
    },
  });

  return signals;
}

// ── Scoring ───────────────────────────────────────────────────────────────────

function scoreAction(
  kind: BusinessDecisionKind,
  governor: RewardGovernorDecision,
): { marginScore: number; riskScore: number } {
  // Prefer high-margin digital (points, ads, marketplace fees) over cash rewards
  const base: Record<BusinessDecisionKind, { marginScore: number; riskScore: number }> = {
    fill_ad_slot: { marginScore: 90, riskScore: 10 },
    prospect_lead: { marginScore: 85, riskScore: 15 },
    house_drop: { marginScore: 70, riskScore: 20 },
    points_prompt: { marginScore: 95, riskScore: 5 },
    season_pass_prompt: { marginScore: 88, riskScore: 10 },
    beat_interest_prompt: { marginScore: 82, riskScore: 18 },
    tip_cta_timing: { marginScore: 75, riskScore: 25 },
    sponsor_prize_drop: { marginScore: 60, riskScore: 20 },
    payout_health: { marginScore: 55, riskScore: 15 },
    live_discovery_fill: { marginScore: 50, riskScore: 30 },
    scale_down_cash: { marginScore: 40, riskScore: 5 },
    proposal_created: { marginScore: 70, riskScore: 10 },
    proposal_applied: { marginScore: 80, riskScore: 20 },
    proposal_rejected: { marginScore: 0, riskScore: 0 },
    observe: { marginScore: 0, riskScore: 0 },
  };
  const s = base[kind];
  if (!governor.allowCashRewards && kind === "sponsor_prize_drop") {
    return { marginScore: s.marginScore + 5, riskScore: Math.max(5, s.riskScore - 5) };
  }
  return s;
}

// ── Prospecting / Acquisition ─────────────────────────────────────────────────

function valueBandForSlot(priceUsd: number): { min: number; max: number } {
  return { min: Math.max(25, Math.floor(priceUsd * 0.5)), max: Math.ceil(priceUsd * 1.5) };
}

export function prospectEmptyZones(signals: LearnedSignals): ProspectLead[] {
  const created: ProspectLead[] = [];
  const priceByZone = new Map(signals.slotInventory.map((s) => [s.zone, s.priceUsd]));

  for (const zone of signals.emptyAdZones) {
    const existing = PROSPECT_QUEUE.find(
      (p) => p.zone === zone && (p.status === "needed_fill" || p.status === "queued"),
    );
    if (existing) continue;

    const price = priceByZone.get(zone) ?? 150;
    const lead: ProspectLead = {
      id: nextProspectId(),
      zone,
      category: zone.startsWith("live-") || zone.startsWith("room-")
        ? "live_room_ad"
        : zone.startsWith("home-")
          ? "homepage_ad"
          : zone.startsWith("magazine-")
            ? "magazine_ad"
            : "platform_ad",
      valueBandUsd: valueBandForSlot(price),
      status: "needed_fill",
      advertiseHref: "/sponsors/advertise",
      note: `Needed fill — no paid sponsor on ${zone}. Surface Advertise CTA; do not invent brand contracts.`,
      createdAt: Date.now(),
    };
    PROSPECT_QUEUE.unshift(lead);
    created.push(lead);

    const proposal = createProposal({
      kind: "sponsor_lead",
      title: `Sponsor lead: ${zone}`,
      rationale: lead.note,
      zone,
      valueBandUsd: lead.valueBandUsd,
      category: lead.category,
      lowRiskAutoApply: false,
      payload: {
        advertiseHref: "/sponsors/advertise",
        advertiserOnboardingHref: "/signup/sponsor",
        packagePriceUsd: price,
        status: "needed_fill",
      },
      monetizationMeta: {
        classification: "ad_inventory_lead",
        feePath: "SPLIT_PRESETS.ad",
        legalHold: false,
      },
    });
    lead.proposalId = proposal.id;
    lead.status = "queued";

    const scores = scoreAction("prospect_lead", signals.governor);
    pushDecision({
      kind: "prospect_lead",
      summary: `Prospect queued for ${zone} ($${lead.valueBandUsd.min}–$${lead.valueBandUsd.max} band).`,
      zone: "ads_house",
      ...scores,
      executed: true,
      meta: { zone, proposalId: proposal.id },
    });
  }

  return created;
}

// ── Proposal pipeline (safe ingest) ───────────────────────────────────────────

export function createProposal(input: {
  kind: ProposalKind;
  title: string;
  rationale: string;
  zone: string;
  valueBandUsd: { min: number; max: number };
  category: string;
  lowRiskAutoApply: boolean;
  payload: Record<string, unknown>;
  monetizationMeta?: RevenueProposal["monetizationMeta"];
  actor?: string;
}): RevenueProposal {
  const validationErrors = validateProposalPayload(input.kind, input.payload, input.zone);
  const proposal: RevenueProposal = {
    id: nextProposalId(),
    kind: input.kind,
    status: "PROPOSAL",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    title: input.title,
    rationale: input.rationale,
    zone: input.zone,
    valueBandUsd: input.valueBandUsd,
    category: input.category,
    lowRiskAutoApply: input.lowRiskAutoApply,
    payload: input.payload,
    validationErrors,
    audit: [],
    monetizationMeta: input.monetizationMeta ?? {
      classification: input.kind,
      feePath: "creator_commerce_or_ad",
      legalHold: false,
    },
  };
  appendAudit(proposal, input.actor ?? "revenue-business-engine", "created", input.rationale);
  PROPOSALS.unshift(proposal);
  if (PROPOSALS.length > MAX_LOG) PROPOSALS.length = MAX_LOG;

  pushDecision({
    kind: "proposal_created",
    summary: `Proposal ${proposal.id}: ${proposal.title}`,
    marginScore: 70,
    riskScore: input.lowRiskAutoApply ? 10 : 25,
    executed: true,
    meta: { proposalId: proposal.id, kind: proposal.kind },
  });

  return proposal;
}

function validateProposalPayload(
  kind: ProposalKind,
  payload: Record<string, unknown>,
  zone: string,
): string[] {
  const errors: string[] = [];
  if (!zone?.trim()) errors.push("zone_required");

  // Never allow inventing a "paid" sponsor without human approval path
  if (payload.autoSignPaidSponsor === true) {
    errors.push("auto_sign_paid_sponsor_forbidden");
  }
  if (typeof payload.sponsorName === "string") {
    const name = payload.sponsorName.toLowerCase();
    // Soft honesty check — block obvious fake mega-brand auto claims in payload
    if (payload.claimSignedContract === true) {
      errors.push("claim_signed_contract_requires_human_approve");
    }
    void name;
  }

  if (kind === "ad_zone_package" || kind === "sponsor_lead") {
    if (payload.packagePriceUsd != null && Number(payload.packagePriceUsd) < 0) {
      errors.push("package_price_negative");
    }
  }

  if (kind === "prize_catalog_item") {
    if (!payload.title || !payload.sponsorName) {
      errors.push("prize_requires_title_and_sponsor");
    }
    if (payload.fundingSource === "tmi_cash") {
      errors.push("prize_must_be_sponsor_funded_in_launch_mode");
    }
  }

  if (kind === "platform_promo_fill") {
    if (!payload.ctaHref || typeof payload.ctaHref !== "string") {
      errors.push("platform_promo_requires_cta");
    }
  }

  // Soft monetization metadata registration check
  if (payload.skipMonetizationMeta === true) {
    errors.push("monetization_metadata_required_before_live");
  }

  return errors;
}

export function approveProposal(
  proposalId: string,
  actor = "admin",
): { ok: boolean; proposal?: RevenueProposal; error?: string } {
  const p = PROPOSALS.find((x) => x.id === proposalId);
  if (!p) return { ok: false, error: "proposal_not_found" };
  if (p.status !== "PROPOSAL") return { ok: false, error: `invalid_status_${p.status}` };
  if (p.validationErrors.length > 0) {
    return { ok: false, error: `validation_failed:${p.validationErrors.join(",")}` };
  }
  p.status = "APPROVED";
  appendAudit(p, actor, "approved", "Human admin approved proposal.");
  return { ok: true, proposal: p };
}

export function rejectProposal(
  proposalId: string,
  actor = "admin",
  reason = "rejected",
): { ok: boolean; proposal?: RevenueProposal; error?: string } {
  const p = PROPOSALS.find((x) => x.id === proposalId);
  if (!p) return { ok: false, error: "proposal_not_found" };
  if (p.status !== "PROPOSAL" && p.status !== "APPROVED") {
    return { ok: false, error: `invalid_status_${p.status}` };
  }
  p.status = "REJECTED";
  appendAudit(p, actor, "rejected", reason);
  pushDecision({
    kind: "proposal_rejected",
    summary: `Rejected ${p.id}: ${reason}`,
    marginScore: 0,
    riskScore: 0,
    executed: true,
    meta: { proposalId: p.id },
  });
  return { ok: true, proposal: p };
}

/**
 * Apply via adapters only — never silent registry mutation for paid sponsors.
 * Low-risk: platform promo / Advertise CTA attach (no fake paid brand).
 */
export function applyProposal(
  proposalId: string,
  actor = "admin",
): { ok: boolean; proposal?: RevenueProposal; error?: string } {
  const p = PROPOSALS.find((x) => x.id === proposalId);
  if (!p) return { ok: false, error: "proposal_not_found" };
  if (p.status !== "APPROVED" && !(p.status === "PROPOSAL" && p.lowRiskAutoApply)) {
    return { ok: false, error: "must_approve_before_apply" };
  }
  if (p.validationErrors.length > 0) {
    return { ok: false, error: `validation_failed:${p.validationErrors.join(",")}` };
  }
  if (!p.monetizationMeta?.classification || !p.monetizationMeta?.feePath) {
    p.validationErrors.push("monetization_metadata_required_before_live");
    return { ok: false, error: "monetization_metadata_required_before_live" };
  }

  if (dryRunMode) {
    appendAudit(p, actor, "dry_run_apply", "Dry-run: apply skipped (no registry mutation).");
    pushDecision({
      kind: "proposal_applied",
      summary: `Dry-run apply ${p.id} — no mutation.`,
      marginScore: 0,
      riskScore: 0,
      executed: false,
      meta: { proposalId: p.id, dryRun: true },
    });
    return { ok: true, proposal: p };
  }

  try {
    const ref = applyProposalAdapter(p);
    p.status = "APPLIED";
    p.appliedRef = ref;
    appendAudit(p, actor, "applied", `Applied via adapter → ${ref}`);

    // Mark matching prospect converted only for real paid path (human-approved package)
    if (p.kind === "sponsor_lead") {
      const lead = PROSPECT_QUEUE.find((l) => l.proposalId === p.id);
      if (lead) {
        lead.status = "pursuing";
        lead.note = `${lead.note} · Admin applied package recommendation — still needs real paid contract.`;
      }
    }

    pushDecision({
      kind: "proposal_applied",
      summary: `Applied ${p.id}: ${p.title}`,
      marginScore: 80,
      riskScore: 20,
      executed: true,
      meta: { proposalId: p.id, ref },
    });
    return { ok: true, proposal: p };
  } catch (err) {
    const message = err instanceof Error ? err.message : "apply_failed";
    p.status = "FAILED";
    appendAudit(p, actor, "failed", message);
    // Rollback = leave registries untouched (we never partially wrote paid zones)
    p.status = "ROLLED_BACK";
    appendAudit(p, actor, "rolled_back", "No canonical paid-sponsor mutation; safe rollback.");
    return { ok: false, error: message, proposal: p };
  }
}

function applyProposalAdapter(p: RevenueProposal): string {
  switch (p.kind) {
    case "platform_promo_fill": {
      // Rule 12 already fills via getAdSlotForZone — record attach intent only
      const slot: AdSlotDescriptor = getAdSlotForZone(p.zone);
      return `rule12:${p.zone}:${slot.type}`;
    }
    case "sponsor_lead":
    case "ad_zone_package": {
      // Do NOT write ACTIVE_SPONSOR_ZONES — that would invent paid brands.
      // Persist recommendation as audit ref for humans/bots to pursue.
      return `lead:${p.zone}:advertise=/sponsors/advertise`;
    }
    case "prize_catalog_item": {
      const funding = String(p.payload.fundingSource ?? "sponsor_inventory");
      if (funding !== "sponsor_inventory" && funding !== "sponsor_product") {
        throw new Error("prize_must_be_sponsor_funded");
      }
      const prize: PrizeItem = {
        prizeId: `prize-${p.id}`,
        sponsorName: String(p.payload.sponsorName),
        title: String(p.payload.title),
        prizeType: (p.payload.prizeType as PrizeItem["prizeType"]) ?? "DIGITAL_CODE",
        retailValue: Number(p.payload.retailValue ?? 0),
        countriesAvailable: (p.payload.countriesAvailable as string[]) ?? ["US"],
        fulfillmentType: "INSTANT_VAULT",
        quantityAvailable: Number(p.payload.quantityAvailable ?? 1),
      };
      registerPrizeInInventory(prize);
      registerPrizeDonation(
        String(p.payload.sponsorId ?? p.id),
        prize.sponsorName,
        "fan_giveaway",
        String(p.payload.eventId ?? "platform"),
        prize.retailValue,
        "product",
      );
      return `prize:${prize.prizeId}`;
    }
    case "price_suggestion": {
      return `price_suggestion:${p.zone}:${String(p.payload.packagePriceUsd ?? "")}`;
    }
    default:
      throw new Error(`unsupported_proposal_kind`);
  }
}

export function approveAndApply(
  proposalId: string,
  actor = "admin",
): { ok: boolean; proposal?: RevenueProposal; error?: string } {
  const approved = approveProposal(proposalId, actor);
  if (!approved.ok) return approved;
  return applyProposal(proposalId, actor);
}

// ── Act / maximize ────────────────────────────────────────────────────────────

function actFillAds(signals: LearnedSignals): void {
  for (const zone of signals.advertiseCtaZones.slice(0, 5)) {
    const proposal = createProposal({
      kind: "platform_promo_fill",
      title: `Rule 12 fill: ${zone}`,
      rationale: "Empty inventory → Advertise CTA / platform promo (never fake paid sponsor).",
      zone,
      valueBandUsd: { min: 25, max: 100 },
      category: "rule12_fill",
      lowRiskAutoApply: true,
      payload: {
        ctaHref: "/sponsors/advertise",
        ctaLabel: "ADVERTISE ON TMI",
      },
      monetizationMeta: {
        classification: "platform_promo",
        feePath: "SPLIT_PRESETS.ad",
        legalHold: false,
      },
    });
    if (!dryRunMode) applyProposal(proposal.id, "revenue-business-engine");
    const scores = scoreAction("fill_ad_slot", signals.governor);
    pushDecision({
      kind: "fill_ad_slot",
      summary: `Rule 12 fill queued for ${zone} → /sponsors/advertise`,
      zone: "advertise_cta",
      ...scores,
      executed: true,
      meta: { zone, proposalId: proposal.id },
    });
  }

  // Package pricing recommendations from SponsorSlotRegistry
  for (const slot of signals.slotInventory.filter((s) => s.status === "AVAILABLE").slice(0, 4)) {
    createProposal({
      kind: "ad_zone_package",
      title: `Zone package: ${slot.zone}`,
      rationale: `Recommend house/sponsor package at $${slot.priceUsd} (registry list price).`,
      zone: slot.zone,
      valueBandUsd: valueBandForSlot(slot.priceUsd),
      category: "zone_package",
      lowRiskAutoApply: false,
      payload: {
        packagePriceUsd: slot.priceUsd,
        advertiseHref: "/sponsors/advertise",
        onboardingHref: "/signup/sponsor",
      },
      monetizationMeta: {
        classification: "ad_zone_package",
        feePath: "SPLIT_PRESETS.ad",
        legalHold: false,
      },
    });
  }
}

function actDigitalPrompts(signals: LearnedSignals): void {
  if (signals.pointPackSkuCount > 0) {
    const scores = scoreAction("points_prompt", signals.governor);
    pushDecision({
      kind: "points_prompt",
      summary: `Surface points store (${signals.pointPackSkuCount} SKUs) — high-margin digital.`,
      zone: "points_packs",
      ...scores,
      executed: true,
      meta: { href: "/api/points/checkout", packs: signals.pointPackSkuCount },
    });
  }

  const scoresSp = scoreAction("season_pass_prompt", signals.governor);
  pushDecision({
    kind: "season_pass_prompt",
    summary: "Contextual season-pass prompt recommended (not spam) — /season-pass.",
    zone: "season_pass",
    ...scoresSp,
    executed: true,
    meta: { href: "/season-pass" },
  });

  if (signals.featuredBeats > 0) {
    const scores = scoreAction("beat_interest_prompt", signals.governor);
    pushDecision({
      kind: "beat_interest_prompt",
      summary: `${signals.featuredBeats} featured beat(s) — surface purchase interest / auction CTA.`,
      zone: "beats_marketplace",
      ...scores,
      executed: true,
      meta: {
        feeFloorBps: CREATOR_COMMERCE_PLATFORM_FEE_BPS.FREE,
        feeCeilBps: CREATOR_COMMERCE_PLATFORM_FEE_BPS.DIAMOND,
      },
    });
  }

  const tipScores = scoreAction("tip_cta_timing", signals.governor);
  pushDecision({
    kind: "tip_cta_timing",
    summary: "Recommend tip CTA at peak live engagement windows (real traffic only).",
    zone: "tips",
    ...tipScores,
    executed: true,
  });
}

function actSponsorPrizes(signals: LearnedSignals): void {
  if (!signals.governor.allowCashRewards) {
    const scores = scoreAction("scale_down_cash", signals.governor);
    pushDecision({
      kind: "scale_down_cash",
      summary: `Cash rewards locked (${signals.governor.phase}) — prefer sponsor-funded inventory.`,
      zone: "sponsor_prizes",
      ...scores,
      executed: true,
    });
  }

  if (signals.activeSponsorPrizeCampaigns === 0) {
    // Create a proposal template — no fake sponsor name as signed deal
    createProposal({
      kind: "prize_catalog_item",
      title: "Sponsor-funded giveaway slot needed",
      rationale: "No active sponsor prize campaigns — solicit sponsor inventory (not TMI cash).",
      zone: "sponsor-prizes",
      valueBandUsd: { min: 0, max: 500 },
      category: "sponsor_prize",
      lowRiskAutoApply: false,
      payload: {
        fundingSource: "sponsor_inventory",
        title: "Sponsor product drop (pending real sponsor)",
        sponsorName: "PENDING_REAL_SPONSOR",
        sponsorId: "pending",
        retailValue: 0,
        quantityAvailable: 0,
      },
      monetizationMeta: {
        classification: "sponsor_prize",
        feePath: "sponsor_inventory_only",
        legalHold: false,
      },
    });
  } else {
    const scores = scoreAction("sponsor_prize_drop", signals.governor);
    pushDecision({
      kind: "sponsor_prize_drop",
      summary: `${signals.activeSponsorPrizeCampaigns} sponsor prize campaign(s) eligible for timed drops.`,
      zone: "sponsor_prizes",
      ...scores,
      executed: true,
    });
  }
}

function actPayoutHealth(signals: LearnedSignals): void {
  const scores = scoreAction("payout_health", signals.governor);
  pushDecision({
    kind: "payout_health",
    summary: `Payout health: ${signals.payoutQueued} queued, holds held=${signals.holdSummary.held} releasable=${signals.holdSummary.releasable}. Keep Instant Payout flowing on cleared funds.`,
    zone: "instant_payouts",
    ...scores,
    executed: true,
    meta: {
      queued: signals.payoutQueued,
      held: signals.holdSummary.held,
      releasable: signals.holdSummary.releasable,
    },
  });
}

function actHouseDrops(signals: LearnedSignals, roomId?: string): void {
  if (!roomId) {
    pushDecision({
      kind: "house_drop",
      summary: `${signals.houseSponsorCount} house sponsors ready — sync on next go-live room.`,
      zone: "ads_house",
      ...scoreAction("house_drop", signals.governor),
      executed: false,
    });
    return;
  }
  if (dryRunMode) {
    pushDecision({
      kind: "house_drop",
      summary: `Dry-run: would sync house sponsors to room ${roomId}.`,
      zone: "ads_house",
      ...scoreAction("house_drop", signals.governor),
      executed: false,
    });
    return;
  }
  void syncLiveRoomSponsors({ roomId }).then(() => {
    const summary = getLiveDualStreamSummary(roomId);
    pushDecision({
      kind: "house_drop",
      summary: `Synced house overlays to ${roomId} (house=${summary.houseCount}, other=${summary.huntedCount}).`,
      zone: "ads_house",
      ...scoreAction("house_drop", signals.governor),
      executed: true,
      meta: { roomId, houseCount: summary.houseCount },
    });
  });
}

function actLiveDiscovery(signals: LearnedSignals): void {
  pushDecision({
    kind: "live_discovery_fill",
    summary:
      "Flag under-monetized live surfaces for sponsor canister / Advertise CTA attach — honest empty rooms, no fake viewers.",
    zone: "live_discovery",
    ...scoreAction("live_discovery_fill", signals.governor),
    executed: true,
    meta: { emptyAdZones: signals.emptyAdZones.length },
  });
}

export function coverageReport(signals: LearnedSignals): ZoneCoverageRow[] {
  return MONETIZATION_ZONES.map((zone) => {
    switch (zone) {
      case "ads_house":
        return {
          zone,
          status: signals.houseSponsorCount > 0 ? "optimized" : "idle",
          note: `${signals.houseSponsorCount} TMI house sponsors`,
        };
      case "ads_paid":
        return {
          zone,
          status: signals.paidAdZones.length > 0 ? "active" : "idle",
          note: `${signals.paidAdZones.length} paid zones (real ACTIVE_SPONSOR_ZONES only)`,
        };
      case "advertise_cta":
        return {
          zone,
          status: signals.advertiseCtaZones.length > 0 || signals.emptyAdZones.length > 0 ? "active" : "optimized",
          note: `${signals.emptyAdZones.length} zones need fill → /sponsors/advertise`,
          href: "/sponsors/advertise",
        };
      case "performer_sponsors_hunted":
        return {
          zone,
          status: "active",
          note: "Hunted campaigns via PerformerSponsorRegistry + toggles (empty until real relations)",
        };
      case "tips":
        return {
          zone,
          status: (signals.revenue.byType.tip ?? 0) > 0 ? "active" : "idle",
          note: "Cleared tips → InstantPayoutEngine (tier fee ladder)",
        };
      case "beats_marketplace":
        return {
          zone,
          status: signals.featuredBeats > 0 ? "active" : "idle",
          note: `${signals.featuredBeats} featured beat interest signals`,
        };
      case "points_packs":
        return {
          zone,
          status: signals.pointPackSkuCount > 0 ? "optimized" : "idle",
          note: `${signals.pointPackSkuCount} point pack SKUs`,
          href: "/api/points/checkout",
        };
      case "season_pass":
        return { zone, status: "active", note: "Contextual /season-pass prompts", href: "/season-pass" };
      case "subscriptions":
        return {
          zone,
          status: (signals.revenue.byType.subscription ?? 0) > 0 ? "active" : "idle",
          note: "Subscription volume from ledger (real only)",
        };
      case "tickets":
        return {
          zone,
          status: (signals.revenue.byType.ticket ?? 0) > 0 ? "active" : "idle",
          note: "Venue/Promoter ticket authority (Rule 17)",
        };
      case "store_merch":
        return { zone, status: "idle", note: "Creator store fees via tier ladder when sales clear" };
      case "sponsor_prizes":
        return {
          zone,
          status: signals.activeSponsorPrizeCampaigns > 0 ? "active" : "idle",
          note: `${signals.activeSponsorPrizeCampaigns} sponsor-funded campaigns (not TMI cash)`,
        };
      case "instant_payouts":
        return {
          zone,
          status: signals.payoutQueued > 0 || signals.holdSummary.releasable > 0 ? "active" : "idle",
          note: `queued=${signals.payoutQueued} releasable_holds=${signals.holdSummary.releasable}`,
        };
      case "live_discovery":
        return {
          zone,
          status: "active",
          note: "Honest discovery fill — no fake viewer counts",
        };
      default:
        return { zone, status: "idle", note: "untracked" };
    }
  });
}

export type TickResult = {
  signals: LearnedSignals;
  decisions: BusinessDecision[];
  prospects: ProspectLead[];
  proposals: RevenueProposal[];
  coverage: ZoneCoverageRow[];
  dryRun: boolean;
};

/**
 * Primary bot/admin entry — observe, prospect, maximize within policy.
 */
export async function tick(opts?: { roomId?: string; botId?: string }): Promise<TickResult> {
  const signals = await learn();
  const before = DECISION_LOG.length;

  prospectEmptyZones(signals);
  actFillAds(signals);
  actDigitalPrompts(signals);
  actSponsorPrizes(signals);
  actPayoutHealth(signals);
  actHouseDrops(signals, opts?.roomId);
  actLiveDiscovery(signals);

  const decisions = DECISION_LOG.slice(0, Math.max(0, DECISION_LOG.length - before + 8));
  const coverage = coverageReport(signals);

  if (opts?.botId) {
    const idle = coverage.filter((c) => c.status === "idle").length;
    botReportToAdmin(
      opts.botId,
      `RevenueBusiness tick: phase=${signals.governor.phase} prospects=${PROSPECT_QUEUE.length} proposals=${PROPOSALS.filter((p) => p.status === "PROPOSAL").length} idleZones=${idle}`,
      ["admin", "big-ace", "mc"],
    );
  }

  return {
    signals,
    decisions,
    prospects: [...PROSPECT_QUEUE],
    proposals: [...PROPOSALS],
    coverage,
    dryRun: dryRunMode,
  };
}

// ── Read API ──────────────────────────────────────────────────────────────────

export function getBusinessDecisions(limit = 40): BusinessDecision[] {
  return DECISION_LOG.slice(0, limit);
}

export function getProspectQueue(status?: ProspectLead["status"]): ProspectLead[] {
  return status ? PROSPECT_QUEUE.filter((p) => p.status === status) : [...PROSPECT_QUEUE];
}

export function getProposals(status?: ProposalStatus): RevenueProposal[] {
  return status ? PROPOSALS.filter((p) => p.status === status) : [...PROPOSALS];
}

export function getProposal(id: string): RevenueProposal | undefined {
  return PROPOSALS.find((p) => p.id === id);
}

export function getOpportunityPrompts(): Array<{
  id: string;
  title: string;
  href: string;
  kind: string;
}> {
  const out: Array<{ id: string; title: string; href: string; kind: string }> = [];
  for (const d of DECISION_LOG.slice(0, 20)) {
    if (d.kind === "points_prompt") {
      out.push({ id: d.id, title: "Buy points — high-margin digital", href: "/api/points/checkout", kind: d.kind });
    } else if (d.kind === "season_pass_prompt") {
      out.push({ id: d.id, title: "Season Pass opportunity", href: "/season-pass", kind: d.kind });
    } else if (d.kind === "beat_interest_prompt") {
      out.push({ id: d.id, title: "Featured beat — express purchase interest", href: "/beats", kind: d.kind });
    } else if (d.kind === "prospect_lead" || d.kind === "fill_ad_slot") {
      out.push({ id: d.id, title: "Advertise on TMI — empty inventory", href: "/sponsors/advertise", kind: d.kind });
    }
  }
  // Always include advertise path when prospects exist
  if (PROSPECT_QUEUE.some((p) => p.status === "needed_fill" || p.status === "queued")) {
    out.push({
      id: "always-advertise",
      title: "Sponsor / advertiser onboarding",
      href: "/sponsors/advertise",
      kind: "prospect_lead",
    });
  }
  return out;
}
