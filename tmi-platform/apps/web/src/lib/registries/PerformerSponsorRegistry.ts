/**
 * PerformerSponsorRegistry
 *
 * Tracks sponsor-to-performer relationships: who is backing whom,
 * at what tier, for what period, with what deliverables.
 * Backed by prisma.feedItem (type='PERFORMER_SPONSOR').
 */

import prisma from '@/lib/prisma';

const FEED_TYPE = 'PERFORMER_SPONSOR';
const FAR_FUTURE = new Date('2040-01-01T00:00:00Z');

export type SponsorshipStatus = 'active' | 'pending' | 'expired' | 'cancelled';

export interface PerformerSponsorship {
  relationId:      string;
  performerId:     string;   // slug or user ID
  performerName:   string;
  sponsorId:       string;
  sponsorName:     string;
  tier:            string;
  monthlyAmountUsd: number;
  startDate:       string;   // ISO
  endDate?:        string;   // ISO
  status:          SponsorshipStatus;
  deliverables:    string[];
  createdAt:       number;
}

export const PerformerSponsorRegistry = {
  async create(
    params: Omit<PerformerSponsorship, 'relationId' | 'createdAt' | 'status'> & { userId?: string }
  ): Promise<PerformerSponsorship> {
    const relationId = `pspon-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const record: PerformerSponsorship = {
      relationId,
      performerId:      params.performerId,
      performerName:    params.performerName,
      sponsorId:        params.sponsorId,
      sponsorName:      params.sponsorName,
      tier:             params.tier,
      monthlyAmountUsd: params.monthlyAmountUsd,
      startDate:        params.startDate,
      endDate:          params.endDate,
      status:           'active',
      deliverables:     params.deliverables,
      createdAt:        Date.now(),
    };

    await prisma.feedItem.create({
      data: {
        userId:     params.userId ?? 'system',
        type:       FEED_TYPE,
        entityId:   params.performerId,
        entityType: 'performer',
        data:       record as object,
        expiresAt:  FAR_FUTURE,
      },
    });

    return record;
  },

  async listByPerformer(performerId: string): Promise<PerformerSponsorship[]> {
    const rows = await prisma.feedItem.findMany({
      where:   { type: FEED_TYPE, entityId: performerId, entityType: 'performer' },
      orderBy: { createdAt: 'desc' },
      take:    100,
    });
    return rows.map(r => r.data as unknown as PerformerSponsorship);
  },

  async listBySponsor(sponsorId: string): Promise<PerformerSponsorship[]> {
    const all = await prisma.feedItem.findMany({
      where:   { type: FEED_TYPE },
      orderBy: { createdAt: 'desc' },
      take:    500,
    });
    return all
      .map(r => r.data as unknown as PerformerSponsorship)
      .filter(r => r.sponsorId === sponsorId);
  },

  async getMonthlyRevenue(performerId: string): Promise<number> {
    const active = await PerformerSponsorRegistry.listByPerformer(performerId);
    return active
      .filter(r => r.status === 'active')
      .reduce((sum, r) => sum + r.monthlyAmountUsd, 0);
  },
};
