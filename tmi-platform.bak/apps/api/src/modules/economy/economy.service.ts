import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// ─── Currency Conversion Rates (static fallback — replace with live API in prod) ─
const CURRENCY_RATES: Record<string, number> = {
  USD: 1,
  NGN: 1550,   // Nigerian Naira
  IDR: 15900,  // Indonesian Rupiah
  ZAR: 18.5,   // South African Rand
  EUR: 0.92,
  GBP: 0.79,
  KES: 130,    // Kenyan Shilling
  GHS: 15.5,   // Ghanaian Cedi
};

// ─── Subscription Tiers ────────────────────────────────────────────────────────
export const SUBSCRIPTION_TIERS = {
  FREE: {
    name: 'Free',
    monthlyPoints: 0,
    bookingBoost: 0,
    storeDiscount: 0,
    maxRooms: 1,
    maxPartySize: 4,
    features: ['basic_access', 'public_rooms'],
  },
  SUPPORTER: {
    name: 'Supporter',
    monthlyPoints: 500,
    bookingBoost: 5,
    storeDiscount: 5,
    maxRooms: 3,
    maxPartySize: 8,
    features: ['basic_access', 'public_rooms', 'private_rooms', 'julius_basic'],
  },
  PRO: {
    name: 'Pro',
    monthlyPoints: 1500,
    bookingBoost: 10,
    storeDiscount: 10,
    maxRooms: 10,
    maxPartySize: 20,
    features: ['basic_access', 'public_rooms', 'private_rooms', 'julius_full', 'analytics', 'priority_booking'],
  },
  ELITE: {
    name: 'Elite',
    monthlyPoints: 5000,
    bookingBoost: 20,
    storeDiscount: 20,
    maxRooms: -1, // unlimited
    maxPartySize: 100,
    features: ['all_access', 'julius_full', 'analytics', 'priority_booking', 'vip_rooms', 'custom_avatar', 'ad_free'],
  },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

// ─── Point Rules ───────────────────────────────────────────────────────────────
export const POINT_RULES = {
  DAILY_LOGIN: 10,
  ROOM_JOIN: 5,
  ROOM_HOST: 25,
  ARTICLE_READ: 2,
  ARTICLE_SHARE: 10,
  COMMENT_POST: 5,
  FRIEND_ADD: 15,
  EVENT_ATTEND: 50,
  EVENT_HOST: 100,
  PURCHASE: 1,          // 1 point per $1 spent (in cents: per 100 cents)
  TIP_SENT: 5,
  CONTEST_ENTER: 20,
  CONTEST_WIN: 500,
  ACHIEVEMENT_UNLOCK: 50,
  REFERRAL: 200,
  JULIUS_INTERACT: 3,
  POLL_VOTE: 2,
  REACTION_SEND: 1,
} as const;

export type PointAction = keyof typeof POINT_RULES;

export interface EconomyBalanceDto {
  userId: string;
  points: number;
  walletBalanceCents: number;
  currency: string;
  subscriptionTier: SubscriptionTier;
  tierBenefits: typeof SUBSCRIPTION_TIERS[SubscriptionTier];
}

export interface PointTransactionDto {
  userId: string;
  action: PointAction;
  metadata?: Record<string, unknown>;
}

export interface CurrencyConvertDto {
  amountCents: number;
  fromCurrency: string;
  toCurrency: string;
}

export interface EconomyStatsDto {
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  activeSubscribers: number;
  tierBreakdown: Record<SubscriptionTier, number>;
  topEarners: Array<{ userId: string; points: number }>;
  revenueByTier: Record<SubscriptionTier, number>;
}

@Injectable()
export class EconomyService {
  private readonly logger = new Logger(EconomyService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Get Economy Balance ─────────────────────────────────────────────────────

  async getBalance(userId: string): Promise<EconomyBalanceDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const tier = this.getUserTier(user);
    const points = await this.getUserPoints(userId);

    return {
      userId,
      points,
      walletBalanceCents: (user.wallet as any)?.availableBalance ?? 0,
      currency: 'USD',
      subscriptionTier: tier,
      tierBenefits: SUBSCRIPTION_TIERS[tier],
    };
  }

  // ─── Award Points ────────────────────────────────────────────────────────────

  async awardPoints(dto: PointTransactionDto): Promise<{ points: number; awarded: number; newTotal: number }> {
    const { userId, action } = dto;
    const awarded = POINT_RULES[action] ?? 0;

    if (awarded === 0) {
      this.logger.warn(`Unknown point action: ${action}`);
      return { points: 0, awarded: 0, newTotal: await this.getUserPoints(userId) };
    }

    // Record as a CREDIT ledger entry
    await this.prisma.ledgerEntry.create({
      data: {
        userId,
        type: 'CREDIT',
        amount: awarded,
        description: `POINTS:${action}`,
      },
    });

    const newTotal = await this.getUserPoints(userId);
    this.logger.log(`Awarded ${awarded} points to user ${userId} for action ${action}`);

    return { points: awarded, awarded, newTotal };
  }

  // ─── Redeem Points ───────────────────────────────────────────────────────────

  async redeemPoints(userId: string, points: number, reason: string): Promise<{ success: boolean; remaining: number }> {
    const current = await this.getUserPoints(userId);

    if (current < points) {
      throw new BadRequestException(`Insufficient points. Have ${current}, need ${points}`);
    }

    // Record as a DEBIT ledger entry
    await this.prisma.ledgerEntry.create({
      data: {
        userId,
        type: 'DEBIT',
        amount: points,
        description: `REDEEM:${reason}`,
      },
    });

    const remaining = current - points;
    this.logger.log(`Redeemed ${points} points from user ${userId} for: ${reason}`);

    return { success: true, remaining };
  }

  // ─── Get User Points (aggregate via LedgerEntry) ──────────────────────────

  async getUserPoints(userId: string): Promise<number> {
    const [credits, debits] = await Promise.all([
      this.prisma.ledgerEntry.aggregate({
        where: { userId, type: 'CREDIT', description: { startsWith: 'POINTS:' } },
        _sum: { amount: true },
      }),
      this.prisma.ledgerEntry.aggregate({
        where: { userId, type: 'DEBIT', description: { startsWith: 'REDEEM:' } },
        _sum: { amount: true },
      }),
    ]);
    return Math.max(0, (credits._sum.amount ?? 0) - (debits._sum.amount ?? 0));
  }

  // ─── Get User Tier ───────────────────────────────────────────────────────────

  private getUserTier(user: any): SubscriptionTier {
    const subId = user.stripeSubscriptionId;
    if (!subId) return 'FREE';

    // In production: look up subscription tier from Stripe metadata or DB
    // For now: derive from subscription status field if present
    const tierMap: Record<string, SubscriptionTier> = {
      supporter: 'SUPPORTER',
      pro: 'PRO',
      elite: 'ELITE',
    };

    const planName = (user.subscriptionPlan ?? '').toLowerCase();
    return tierMap[planName] ?? 'FREE';
  }

  // ─── Currency Conversion ─────────────────────────────────────────────────────

  convertCurrency(dto: CurrencyConvertDto): { amount: number; formatted: string } {
    const { amountCents, fromCurrency, toCurrency } = dto;
    const fromRate = CURRENCY_RATES[fromCurrency.toUpperCase()] ?? 1;
    const toRate = CURRENCY_RATES[toCurrency.toUpperCase()] ?? 1;

    const amountUSD = amountCents / 100 / fromRate;
    const converted = amountUSD * toRate;
    const formatted = this.formatCurrency(converted, toCurrency.toUpperCase());

    return { amount: Math.round(converted * 100), formatted };
  }

  private formatCurrency(amount: number, currency: string): string {
    const symbols: Record<string, string> = {
      USD: '$', EUR: '€', GBP: '£', NGN: '₦', IDR: 'Rp', ZAR: 'R', KES: 'KSh', GHS: 'GH₵',
    };
    const symbol = symbols[currency] ?? currency + ' ';
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // ─── Get Supported Currencies ────────────────────────────────────────────────

  getSupportedCurrencies(): Array<{ code: string; rate: number; symbol: string }> {
    const symbols: Record<string, string> = {
      USD: '$', EUR: '€', GBP: '£', NGN: '₦', IDR: 'Rp', ZAR: 'R', KES: 'KSh', GHS: 'GH₵',
    };
    return Object.entries(CURRENCY_RATES).map(([code, rate]) => ({
      code,
      rate,
      symbol: symbols[code] ?? code,
    }));
  }

  // ─── Get Subscription Tiers ──────────────────────────────────────────────────

  getSubscriptionTiers() {
    return Object.entries(SUBSCRIPTION_TIERS).map(([key, value]) => ({
      tier: key as SubscriptionTier,
      ...value,
    }));
  }

  // ─── Get Point Rules ─────────────────────────────────────────────────────────

  getPointRules() {
    return Object.entries(POINT_RULES).map(([action, points]) => ({
      action,
      points,
    }));
  }

  // ─── Economy Stats (Admin) ───────────────────────────────────────────────────

  async getEconomyStats(): Promise<EconomyStatsDto> {
    const [totalIssued, totalRedeemed, topEarners, userCount] = await Promise.all([
      this.prisma.ledgerEntry.aggregate({
        where: { type: 'CREDIT', description: { startsWith: 'POINTS:' } },
        _sum: { amount: true },
      }),
      this.prisma.ledgerEntry.aggregate({
        where: { type: 'DEBIT', description: { startsWith: 'REDEEM:' } },
        _sum: { amount: true },
      }),
      this.prisma.ledgerEntry.groupBy({
        by: ['userId'],
        where: { type: 'CREDIT', description: { startsWith: 'POINTS:' } },
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: 10,
      }),
      this.prisma.user.count(),
    ]);

    return {
      totalPointsIssued: totalIssued._sum.amount ?? 0,
      totalPointsRedeemed: totalRedeemed._sum.amount ?? 0,
      activeSubscribers: 0, // TODO: integrate with Stripe subscription count
      tierBreakdown: { FREE: userCount, SUPPORTER: 0, PRO: 0, ELITE: 0 },
      topEarners: topEarners.map((e) => ({
        userId: e.userId,
        points: e._sum.amount ?? 0,
      })),
      revenueByTier: { FREE: 0, SUPPORTER: 0, PRO: 0, ELITE: 0 },
    };
  }

  // ─── Leaderboard ─────────────────────────────────────────────────────────────

  async getPointsLeaderboard(limit = 20): Promise<Array<{ userId: string; points: number; rank: number }>> {
    const rows = await this.prisma.ledgerEntry.groupBy({
      by: ['userId'],
      where: { type: 'CREDIT', description: { startsWith: 'POINTS:' } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: limit,
    });

    return rows.map((row, idx) => ({
      userId: row.userId,
      points: row._sum.amount ?? 0,
      rank: idx + 1,
    }));
  }

  // ─── Boost Calculation ───────────────────────────────────────────────────────

  calculateBoost(tier: SubscriptionTier, baseValue: number): number {
    const boostPercent = SUBSCRIPTION_TIERS[tier].bookingBoost;
    return Math.round(baseValue * (1 + boostPercent / 100));
  }
}
