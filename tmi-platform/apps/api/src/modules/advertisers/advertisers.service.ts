import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdvertisersService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Creative management ──────────────────────────────────────────────────────

  async uploadCreative(data: {
    advertiserId: string;
    name: string;
    type: string;
    fileUrl: string;
    clickUrl: string;
    altText?: string;
    width?: number;
    height?: number;
  }) {
    return this.prisma.adCreative.create({
      data: {
        advertiserId: data.advertiserId,
        name: data.name,
        type: data.type,
        fileUrl: data.fileUrl,
        clickUrl: data.clickUrl,
        altText: data.altText ?? null,
        width: data.width ?? null,
        height: data.height ?? null,
        status: 'pending',
      },
    });
  }

  async getCreativeById(id: string) {
    const c = await this.prisma.adCreative.findUnique({ where: { id } });
    if (!c) throw new NotFoundException('Creative not found');
    return c;
  }

  async getCreativesForAdvertiser(advertiserId: string) {
    return this.prisma.adCreative.findMany({
      where: { advertiserId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveCreative(id: string) {
    return this.prisma.adCreative.update({ where: { id }, data: { status: 'approved' } });
  }

  async rejectCreative(id: string, reason: string) {
    return this.prisma.adCreative.update({ where: { id }, data: { status: 'rejected', reviewNote: reason } });
  }

  // ── Campaign management ──────────────────────────────────────────────────────

  async createCampaign(data: {
    advertiserId: string;
    name: string;
    creativeId: string;
    slot: string;
    budgetCents: number;
    startDate: string;
    endDate: string;
    targeting?: Record<string, unknown>;
    maxImpressions?: number;
    maxClicks?: number;
  }) {
    return this.prisma.adCampaign.create({
      data: {
        advertiserId: data.advertiserId,
        name: data.name,
        creativeId: data.creativeId,
        slot: data.slot,
        budgetCents: data.budgetCents,
        spentCents: 0,
        startDate: data.startDate,
        endDate: data.endDate,
        targeting: data.targeting ? (data.targeting as Prisma.InputJsonValue) : Prisma.JsonNull,
        maxImpressions: data.maxImpressions ?? null,
        maxClicks: data.maxClicks ?? null,
        status: 'draft',
      },
    });
  }

  async getCampaignById(id: string) {
    const c = await this.prisma.adCampaign.findUnique({ where: { id }, include: { creative: true } });
    if (!c) throw new NotFoundException('Ad campaign not found');
    return c;
  }

  async getCampaignsForAdvertiser(advertiserId: string, status?: string) {
    return this.prisma.adCampaign.findMany({
      where: { advertiserId, ...(status ? { status } : {}) },
      include: { creative: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async submitForReview(id: string) {
    const c = await this.getCampaignById(id);
    if (c.status !== 'draft') throw new BadRequestException('Only draft campaigns can be submitted');
    return this.prisma.adCampaign.update({ where: { id }, data: { status: 'pending_review' } });
  }

  async approveCampaign(id: string) {
    return this.prisma.adCampaign.update({ where: { id }, data: { status: 'approved' } });
  }

  async rejectCampaign(id: string) {
    return this.prisma.adCampaign.update({ where: { id }, data: { status: 'rejected' } });
  }

  async goLive(id: string) {
    const c = await this.getCampaignById(id);
    if (c.status !== 'approved') throw new BadRequestException('Only approved campaigns can go live');
    return this.prisma.adCampaign.update({ where: { id }, data: { status: 'live' } });
  }

  async pauseCampaign(id: string) {
    return this.prisma.adCampaign.update({ where: { id }, data: { status: 'paused' } });
  }

  // ── Targeting ────────────────────────────────────────────────────────────────

  getTargetingOptions() {
    return {
      genres: ['hip-hop', 'r&b', 'afrobeats', 'pop', 'trap', 'drill', 'edm', 'jazz', 'world', 'dancehall'],
      roles: ['fan', 'performer', 'venue', 'sponsor', 'advertiser', 'label'],
      ageRanges: ['13-17', '18-24', '25-34', '35-44', '45+'],
      behaviors: ['frequent-viewer', 'active-voter', 'ticket-buyer', 'beat-buyer', 'tipper'],
      interests: ['live-shows', 'cypher', 'magazine', 'beats', 'contests', 'merchandise'],
    };
  }

  // ── Impression & click tracking ─────────────────────────────────────────────

  async recordImpression(campaignId: string, userId?: string, ip?: string, userAgent?: string) {
    const campaign = await this.getCampaignById(campaignId);
    if (campaign.status !== 'live') return { skipped: true };

    await this.prisma.adImpression.create({
      data: { campaignId, userId: userId ?? null, ip: ip ?? null, userAgent: userAgent ?? null },
    });

    const impressionCount = await this.prisma.adImpression.count({ where: { campaignId } });
    const budgetExhausted = campaign.budgetCents > 0 && impressionCount * 1 >= campaign.budgetCents / 10;
    const maxHit = campaign.maxImpressions && impressionCount >= campaign.maxImpressions;

    if (budgetExhausted || maxHit) {
      await this.prisma.adCampaign.update({ where: { id: campaignId }, data: { status: 'completed' } });
    }

    return { recorded: true };
  }

  async recordClick(campaignId: string, userId?: string, ip?: string, userAgent?: string) {
    await this.prisma.adClick.create({
      data: { campaignId, userId: userId ?? null, ip: ip ?? null, userAgent: userAgent ?? null },
    });
    return { recorded: true };
  }

  // ── Analytics & payout ───────────────────────────────────────────────────────

  async getCampaignAnalytics(campaignId: string) {
    const campaign = await this.getCampaignById(campaignId);
    const impressions = await this.prisma.adImpression.count({ where: { campaignId } });
    const clicks = await this.prisma.adClick.count({ where: { campaignId } });
    const ctr = impressions > 0 ? +((clicks / impressions) * 100).toFixed(2) : 0;

    return {
      campaign,
      impressions,
      clicks,
      ctr,
      budgetCents: campaign.budgetCents,
      spentCents: campaign.spentCents,
      remainingBudgetCents: campaign.budgetCents - campaign.spentCents,
      budgetPct: campaign.budgetCents > 0 ? Math.round((campaign.spentCents / campaign.budgetCents) * 100) : 0,
    };
  }

  async getAdvertiserPayoutSummary(advertiserId: string) {
    const campaigns = await this.getCampaignsForAdvertiser(advertiserId);
    const totalSpent = campaigns.reduce((s, c) => s + c.spentCents, 0);
    const platformCut = Math.round(totalSpent * 0.15);
    const publisherPayout = totalSpent - platformCut;

    return {
      advertiserId,
      totalSpentCents: totalSpent,
      platformCutCents: platformCut,
      publisherPayoutCents: publisherPayout,
      activeCampaigns: campaigns.filter((c) => c.status === 'live').length,
      totalCampaigns: campaigns.length,
    };
  }

  async getAdminPendingReview() {
    const pendingCreatives = await this.prisma.adCreative.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'asc' },
    });
    const pendingCampaigns = await this.prisma.adCampaign.findMany({
      where: { status: 'pending_review' },
      orderBy: { createdAt: 'asc' },
    });
    return { pendingCreatives, pendingCampaigns };
  }

  async getPlatformAdRevenue() {
    const liveCampaigns = await this.prisma.adCampaign.count({ where: { status: 'live' } });
    const totalBudget = await this.prisma.adCampaign.aggregate({
      _sum: { spentCents: true },
      where: { status: { in: ['live', 'completed'] } },
    });
    return {
      totalRevenueCents: totalBudget._sum.spentCents ?? 0,
      liveCampaigns,
    };
  }
}
