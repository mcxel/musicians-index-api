/**
 * SponsorSlotRegistry
 *
 * Typed persistence layer for sponsor slot attachments.
 * Backed by prisma.feedItem (type='SPONSOR_SLOT') — no schema migration required.
 * Replaces direct feedItem writes scattered across API routes.
 */

import prisma from '@/lib/prisma';

const FEED_TYPE = 'SPONSOR_SLOT';
const FAR_FUTURE = new Date('2040-01-01T00:00:00Z');

export type SponsorTier = 'STARTER' | 'FEATURED' | 'TITLE' | 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE';
export type SponsorEntityType = 'battle' | 'performer' | 'venue' | 'event' | 'platform';

export interface SponsorSlot {
  slotId:      string;
  sponsorId:   string;
  sponsorName: string;
  tier:        SponsorTier;
  entityId:    string;
  entityType:  SponsorEntityType;
  prizePool:   number;
  category:    'local' | 'major';
  status:      'active' | 'pending' | 'expired';
  attachedAt:  number;
  expiresAt?:  number;
}

export const SponsorSlotRegistry = {
  async attach(
    params: Omit<SponsorSlot, 'slotId' | 'attachedAt' | 'status'> & { userId?: string }
  ): Promise<SponsorSlot> {
    const slotId    = `sslot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const attachedAt = Date.now();
    const slot: SponsorSlot = {
      slotId,
      sponsorId:   params.sponsorId,
      sponsorName: params.sponsorName,
      tier:        params.tier,
      entityId:    params.entityId,
      entityType:  params.entityType,
      prizePool:   params.prizePool,
      category:    params.category,
      status:      'active',
      attachedAt,
      expiresAt:   params.expiresAt,
    };

    await prisma.feedItem.create({
      data: {
        userId:     params.userId ?? 'system',
        type:       FEED_TYPE,
        entityId:   params.entityId,
        entityType: params.entityType,
        data:       slot as object,
        expiresAt:  FAR_FUTURE,
      },
    });

    return slot;
  },

  async listByEntity(entityId: string, entityType?: SponsorEntityType): Promise<SponsorSlot[]> {
    const rows = await prisma.feedItem.findMany({
      where: {
        type:       FEED_TYPE,
        entityId,
        ...(entityType ? { entityType } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take:    100,
    });
    return rows.map(r => r.data as unknown as SponsorSlot);
  },

  async listAll(): Promise<SponsorSlot[]> {
    const rows = await prisma.feedItem.findMany({
      where:   { type: FEED_TYPE },
      orderBy: { createdAt: 'desc' },
      take:    500,
    });
    return rows.map(r => r.data as unknown as SponsorSlot);
  },

  async getSlot(slotId: string): Promise<SponsorSlot | null> {
    const all = await SponsorSlotRegistry.listAll();
    return all.find(s => s.slotId === slotId) ?? null;
  },

  async deactivate(slotId: string): Promise<void> {
    const rows = await prisma.feedItem.findMany({
      where: { type: FEED_TYPE },
    });
    for (const row of rows) {
      const slot = row.data as unknown as SponsorSlot;
      if (slot.slotId === slotId) {
        const updated = { ...slot, status: 'expired' as const };
        await prisma.feedItem.update({
          where: { id: row.id },
          data:  { data: updated as object },
        });
        break;
      }
    }
  },

  async totalPrizePool(entityId: string): Promise<number> {
    const slots = await SponsorSlotRegistry.listByEntity(entityId);
    return slots.filter(s => s.status === 'active').reduce((sum, s) => sum + s.prizePool, 0);
  },
};
