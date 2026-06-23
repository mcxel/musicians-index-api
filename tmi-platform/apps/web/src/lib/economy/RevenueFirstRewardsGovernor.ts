/**
 * RevenueFirstRewardsGovernor
 *
 * Rule: Rewards must never place the platform in a loss position.
 *
 * Phase 1 (launch): non-cash rewards only.
 * Phase 2 (growth): ecosystem credits only.
 * Phase 3 (cash): cash payouts allowed only when all financial gates pass.
 */

export type RewardPhase = "launch" | "growth" | "cash";

export type NonCashRewardKind =
  | "xp"
  | "badge"
  | "title"
  | "trophy"
  | "crown-points"
  | "ranking-points"
  | "profile-cosmetic"
  | "special-frame"
  | "exclusive-emote"
  | "playlist-placement"
  | "homepage-feature"
  | "billboard-placement"
  | "magazine-feature"
  | "frontpage-placement"
  | "season-pass-progress"
  | "founder-reward"
  | "digital-collectible"
  | "platform-credit"
  | "merch-credit"
  | "ticket-credit"
  | "vip-pass"
  | "backstage-access";

export interface FinancialHealthSnapshot {
  availableCashCents: number;
  emergencyReserveCents: number;
  minimumReserveCents: number;
  monthlyRevenueCents: number;
  monthlyOperatingCostCents: number;
  monthlyInfrastructureCostCents: number;
  monthlyTaxesReservedCents: number;
  infrastructureFunded: boolean;
  taxesFunded: boolean;
  reserveAccountFunded: boolean;
}

export interface RewardGovernorConfig {
  growthMonthlyRevenueCents: number;
  growthOperatingReserveMonths: number;
  cashMinEmergencyReserveCents: number;
  defaultPrizeAllocationRate: number;
  minPrizeAllocationRate: number;
  maxPrizeAllocationRate: number;
}

export interface RewardGovernorDecision {
  phase: RewardPhase;
  allowCashRewards: boolean;
  allowPlatformCredits: boolean;
  reasons: string[];
  fallbackRewards: NonCashRewardKind[];
  monthlyProfitCents: number;
  operatingReserveMonths: number;
}

export interface ContestBudgetAssessment {
  allowed: boolean;
  contestRevenueCents: number;
  allocationRate: number;
  maxPrizePoolCents: number;
  proposedPrizePoolCents: number;
  reasons: string[];
}

export interface EventEconomicsInput {
  expectedRevenueCents: number;
  expectedOperatingCostCents?: number;
  expectedInfrastructureCostCents?: number;
  expectedPrizePoolCents?: number;
  allocationRate?: number;
  snapshotOverride?: Partial<FinancialHealthSnapshot>;
}

export interface EventEconomicsAssessment {
  allowed: boolean;
  expectedRevenueCents: number;
  expectedCostCents: number;
  expectedPrizePoolCents: number;
  expectedMarginCents: number;
  reasons: string[];
  contestBudget: ContestBudgetAssessment;
  decision: RewardGovernorDecision;
}

export interface VenueContestBudgetInput {
  venueId: string;
  contestRevenueCents: number;
  proposedPrizePoolCents: number;
  allocationRate?: number;
  freeTicketCount: number;
  backstageCount: number;
  vipCount: number;
  ticketFaceValueCents: number;
}

const PHASE_1_FALLBACK: NonCashRewardKind[] = [
  "xp",
  "badge",
  "title",
  "trophy",
  "crown-points",
  "ranking-points",
  "profile-cosmetic",
  "special-frame",
  "exclusive-emote",
  "playlist-placement",
  "homepage-feature",
  "billboard-placement",
  "magazine-feature",
  "frontpage-placement",
  "season-pass-progress",
  "founder-reward",
  "digital-collectible",
];

const PHASE_2_FALLBACK: NonCashRewardKind[] = [
  "platform-credit",
  "merch-credit",
  "ticket-credit",
  "xp",
  "badge",
  "title",
  "trophy",
  "playlist-placement",
  "billboard-placement",
  "magazine-feature",
  "vip-pass",
  "backstage-access",
];

const PHASE_3_FALLBACK: NonCashRewardKind[] = [
  "platform-credit",
  "merch-credit",
  "ticket-credit",
  "xp",
  "badge",
  "title",
  "trophy",
];

const DEFAULT_SNAPSHOT: FinancialHealthSnapshot = {
  availableCashCents: 0,
  emergencyReserveCents: 0,
  minimumReserveCents: 0,
  monthlyRevenueCents: 0,
  monthlyOperatingCostCents: 1,
  monthlyInfrastructureCostCents: 0,
  monthlyTaxesReservedCents: 0,
  infrastructureFunded: false,
  taxesFunded: false,
  reserveAccountFunded: false,
};

const DEFAULT_CONFIG: RewardGovernorConfig = {
  growthMonthlyRevenueCents: 5000 * 100,
  growthOperatingReserveMonths: 6,
  cashMinEmergencyReserveCents: 2500 * 100,
  defaultPrizeAllocationRate: 0.2,
  minPrizeAllocationRate: 0,
  maxPrizeAllocationRate: 0.4,
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export class RevenueFirstRewardsGovernor {
  private static instance: RevenueFirstRewardsGovernor | null = null;

  private snapshot: FinancialHealthSnapshot = { ...DEFAULT_SNAPSHOT };
  private config: RewardGovernorConfig = { ...DEFAULT_CONFIG };

  static getInstance(): RevenueFirstRewardsGovernor {
    if (!RevenueFirstRewardsGovernor.instance) {
      RevenueFirstRewardsGovernor.instance = new RevenueFirstRewardsGovernor();
    }
    return RevenueFirstRewardsGovernor.instance;
  }

  setFinancialSnapshot(next: Partial<FinancialHealthSnapshot>): FinancialHealthSnapshot {
    this.snapshot = { ...this.snapshot, ...next };
    return this.snapshot;
  }

  getFinancialSnapshot(): FinancialHealthSnapshot {
    return { ...this.snapshot };
  }

  setConfig(next: Partial<RewardGovernorConfig>): RewardGovernorConfig {
    this.config = { ...this.config, ...next };
    this.config.defaultPrizeAllocationRate = clamp(
      this.config.defaultPrizeAllocationRate,
      this.config.minPrizeAllocationRate,
      this.config.maxPrizeAllocationRate
    );
    return this.config;
  }

  getConfig(): RewardGovernorConfig {
    return { ...this.config };
  }

  evaluate(snapshotOverride?: Partial<FinancialHealthSnapshot>): RewardGovernorDecision {
    const snapshot = { ...this.snapshot, ...snapshotOverride };

    const monthlyBurnCents =
      Math.max(0, snapshot.monthlyOperatingCostCents) +
      Math.max(0, snapshot.monthlyInfrastructureCostCents) +
      Math.max(0, snapshot.monthlyTaxesReservedCents);

    const monthlyProfitCents = Math.max(0, snapshot.monthlyRevenueCents) - monthlyBurnCents;
    const operatingReserveMonths = monthlyBurnCents <= 0
      ? Number.POSITIVE_INFINITY
      : snapshot.availableCashCents / monthlyBurnCents;

    const reasons: string[] = [];

    const growthRevenueGate = snapshot.monthlyRevenueCents >= this.config.growthMonthlyRevenueCents;
    const growthReserveGate = operatingReserveMonths >= this.config.growthOperatingReserveMonths;

    if (!growthRevenueGate) reasons.push("monthly_revenue_below_growth_threshold");
    if (!growthReserveGate) reasons.push("operating_reserve_below_growth_threshold");

    const cashEmergencyGate = snapshot.emergencyReserveCents >= this.config.cashMinEmergencyReserveCents;
    const cashReserveGate = snapshot.availableCashCents >= snapshot.minimumReserveCents;
    const cashProfitGate = monthlyProfitCents > 0;
    const cashInfraGate = snapshot.infrastructureFunded;
    const cashTaxGate = snapshot.taxesFunded;
    const cashReserveFundedGate = snapshot.reserveAccountFunded;

    const growthReady = growthRevenueGate && growthReserveGate;
    const cashReady =
      growthReady &&
      cashEmergencyGate &&
      cashReserveGate &&
      cashProfitGate &&
      cashInfraGate &&
      cashTaxGate &&
      cashReserveFundedGate;

    let phase: RewardPhase = "launch";
    if (cashReady) {
      phase = "cash";
    } else if (growthReady) {
      phase = "growth";
      if (!cashEmergencyGate) reasons.push("emergency_reserve_below_cash_threshold");
      if (!cashReserveGate) reasons.push("available_cash_below_minimum_reserve");
      if (!cashProfitGate) reasons.push("monthly_profit_not_positive");
      if (!cashInfraGate) reasons.push("infrastructure_not_funded");
      if (!cashTaxGate) reasons.push("taxes_not_reserved");
      if (!cashReserveFundedGate) reasons.push("reserve_account_not_funded");
    }

    return {
      phase,
      allowCashRewards: phase === "cash",
      allowPlatformCredits: phase === "growth" || phase === "cash",
      reasons,
      fallbackRewards:
        phase === "launch"
          ? [...PHASE_1_FALLBACK]
          : phase === "growth"
            ? [...PHASE_2_FALLBACK]
            : [...PHASE_3_FALLBACK],
      monthlyProfitCents,
      operatingReserveMonths,
    };
  }

  assessContestBudget(input: {
    contestRevenueCents: number;
    proposedPrizePoolCents: number;
    allocationRate?: number;
    snapshotOverride?: Partial<FinancialHealthSnapshot>;
  }): ContestBudgetAssessment {
    const decision = this.evaluate(input.snapshotOverride);
    const allocationRate = clamp(
      input.allocationRate ?? this.config.defaultPrizeAllocationRate,
      this.config.minPrizeAllocationRate,
      this.config.maxPrizeAllocationRate
    );

    const contestRevenueCents = Math.max(0, Math.floor(input.contestRevenueCents));
    const maxPrizePoolCents = Math.floor(contestRevenueCents * allocationRate);
    const proposedPrizePoolCents = Math.max(0, Math.floor(input.proposedPrizePoolCents));
    const reasons: string[] = [];

    if (proposedPrizePoolCents > maxPrizePoolCents) {
      reasons.push("proposed_prize_pool_exceeds_allocation_cap");
    }

    if (!decision.allowCashRewards && proposedPrizePoolCents > 0) {
      reasons.push("cash_rewards_currently_locked_by_governor");
    }

    if (decision.monthlyProfitCents < 0) {
      reasons.push("monthly_profit_negative");
    }

    return {
      allowed: reasons.length === 0,
      contestRevenueCents,
      allocationRate,
      maxPrizePoolCents,
      proposedPrizePoolCents,
      reasons,
    };
  }

  validateVenueContestBudget(input: VenueContestBudgetInput): ContestBudgetAssessment {
    const hardCostCents =
      Math.max(0, input.freeTicketCount) * Math.max(0, input.ticketFaceValueCents) +
      Math.max(0, input.backstageCount) * Math.floor(Math.max(0, input.ticketFaceValueCents) * 0.6) +
      Math.max(0, input.vipCount) * Math.floor(Math.max(0, input.ticketFaceValueCents) * 0.8);

    const assessment = this.assessContestBudget({
      contestRevenueCents: input.contestRevenueCents,
      proposedPrizePoolCents: input.proposedPrizePoolCents + hardCostCents,
      allocationRate: input.allocationRate,
    });

    if (!assessment.allowed) {
      assessment.reasons.push(`venue_${input.venueId}_budget_rejected`);
    }

    return assessment;
  }

  assessEventEconomics(input: EventEconomicsInput): EventEconomicsAssessment {
    const decision = this.evaluate(input.snapshotOverride);
    const expectedRevenueCents = Math.max(0, Math.floor(input.expectedRevenueCents));
    const expectedOperatingCostCents = Math.max(0, Math.floor(input.expectedOperatingCostCents ?? 0));
    const expectedInfrastructureCostCents = Math.max(0, Math.floor(input.expectedInfrastructureCostCents ?? 0));
    const expectedPrizePoolCents = Math.max(0, Math.floor(input.expectedPrizePoolCents ?? 0));
    const expectedCostCents = expectedOperatingCostCents + expectedInfrastructureCostCents + expectedPrizePoolCents;
    const expectedMarginCents = expectedRevenueCents - expectedCostCents;

    const contestBudget = this.assessContestBudget({
      contestRevenueCents: expectedRevenueCents,
      proposedPrizePoolCents: expectedPrizePoolCents,
      allocationRate: input.allocationRate,
      snapshotOverride: input.snapshotOverride,
    });

    const reasons: string[] = [];

    if (expectedMarginCents < 0) {
      reasons.push('negative_expected_margin');
    }

    if (!contestBudget.allowed) {
      reasons.push(...contestBudget.reasons);
    }

    if (!decision.allowCashRewards && expectedPrizePoolCents > 0) {
      reasons.push('cash_rewards_locked_by_governor');
    }

    return {
      allowed: reasons.length === 0,
      expectedRevenueCents,
      expectedCostCents,
      expectedPrizePoolCents,
      expectedMarginCents,
      reasons,
      contestBudget,
      decision,
    };
  }
}

export const revenueFirstRewardsGovernor = RevenueFirstRewardsGovernor.getInstance();
