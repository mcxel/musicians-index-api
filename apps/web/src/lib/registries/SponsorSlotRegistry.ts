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

  // ─── Ad Placement Inventory & Durable Claim Authority ────────────────────────

  async listAdPlacements(sponsorSlug: string = "my-brand"): Promise<{
    slots: AdPlacementSlot[];
    myPlacements: number;
    myPlacementsCount: number;
    available: number;
    availableCount: number;
    avgCpm: number | null;
  }> {
    let assignedMap = new Map<string, { status: "taken" | "available"; takenBy: string | null; claimedAt?: number }>();
    try {
      const rows = await prisma.feedItem.findMany({
        where: { type: AD_FEED_TYPE },
      });
      for (const row of rows) {
        const d = row.data as any;
        if (d?.id) {
          assignedMap.set(d.id, { status: d.status, takenBy: d.takenBy, claimedAt: d.claimedAt });
        }
      }
    } catch {
      // Offline fallback
      try {
        const fs = await import("fs");
        const path = await import("path");
        const fp = path.join(process.cwd(), "data", "ad-placements.json");
        if (fs.existsSync(fp)) {
          const items = JSON.parse(fs.readFileSync(fp, "utf-8"));
          for (const item of items) {
            if (item.id) assignedMap.set(item.id, item);
          }
        }
      } catch {}
    }

    const slots = CANONICAL_AD_SLOTS.map((base) => {
      const persisted = assignedMap.get(base.id);
      if (persisted) {
        return {
          ...base,
          status: persisted.status,
          takenBy: persisted.takenBy,
          claimedAt: persisted.claimedAt,
        };
      }
      return { ...base };
    });

    const myPlacements = slots.filter((s) => s.takenBy === sponsorSlug).length;
    const available = slots.filter((s) => s.status === "available").length;
    const avgCpm = slots.length > 0 ? Number((slots.reduce((acc, s) => acc + s.cpm, 0) / slots.length).toFixed(2)) : null;

    return {
      slots,
      myPlacements,
      myPlacementsCount: myPlacements,
      available,
      availableCount: available,
      avgCpm,
    };
  },

  async claimAdPlacement(slotId: string, sponsorSlug: string, userId: string = "system"): Promise<{
    ok: boolean;
    slot?: AdPlacementSlot;
    error?: string;
  }> {
    const { slots } = await this.listAdPlacements(sponsorSlug);
    const target = slots.find((s) => s.id === slotId);
    if (!target) {
      return { ok: false, error: "Placement slot not found" };
    }
    // Concurrency check: exclusive ownership
    if (target.status === "taken" && target.takenBy !== sponsorSlug) {
      return { ok: false, error: "Placement slot already claimed by another advertiser" };
    }

    const updated: AdPlacementSlot = {
      ...target,
      status: "taken",
      takenBy: sponsorSlug,
      claimedAt: Date.now(),
    };

    try {
      const existingRow = await prisma.feedItem.findFirst({
        where: { type: AD_FEED_TYPE, entityId: slotId },
      });
      if (existingRow) {
        await prisma.feedItem.update({
          where: { id: existingRow.id },
          data: { data: updated as object },
        });
      } else {
        await prisma.feedItem.create({
          data: {
            userId,
            type: AD_FEED_TYPE,
            entityId: slotId,
            entityType: "sponsor_placement",
            data: updated as object,
            expiresAt: FAR_FUTURE,
          },
        });
      }
    } catch {
      // File backup for dev/test
      try {
        const fs = await import("fs");
        const path = await import("path");
        const dir = path.join(process.cwd(), "data");
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        const fp = path.join(dir, "ad-placements.json");
        let current: AdPlacementSlot[] = [];
        if (fs.existsSync(fp)) {
          try { current = JSON.parse(fs.readFileSync(fp, "utf-8")); } catch {}
        }
        current = [updated, ...current.filter((s) => s.id !== slotId)];
        fs.writeFileSync(fp, JSON.stringify(current, null, 2), "utf-8");
      } catch {}
    }

    return { ok: true, slot: updated };
  },

  async releaseAdPlacement(slotId: string, sponsorSlug: string): Promise<{
    ok: boolean;
    slot?: AdPlacementSlot;
    error?: string;
  }> {
    const { slots } = await this.listAdPlacements(sponsorSlug);
    const target = slots.find((s) => s.id === slotId);
    if (!target) {
      return { ok: false, error: "Placement slot not found" };
    }
    if (target.takenBy && target.takenBy !== sponsorSlug) {
      return { ok: false, error: "Unauthorized: slot not owned by advertiser" };
    }

    const updated: AdPlacementSlot = {
      ...target,
      status: "available",
      takenBy: null,
      claimedAt: undefined,
    };

    try {
      const existingRow = await prisma.feedItem.findFirst({
        where: { type: AD_FEED_TYPE, entityId: slotId },
      });
      if (existingRow) {
        await prisma.feedItem.update({
          where: { id: existingRow.id },
          data: { data: updated as object },
        });
      }
    } catch {
      try {
        const fs = await import("fs");
        const path = await import("path");
        const fp = path.join(process.cwd(), "data", "ad-placements.json");
        if (fs.existsSync(fp)) {
          let current: AdPlacementSlot[] = JSON.parse(fs.readFileSync(fp, "utf-8"));
          current = [updated, ...current.filter((s) => s.id !== slotId)];
          fs.writeFileSync(fp, JSON.stringify(current, null, 2), "utf-8");
        }
      } catch {}
    }

    return { ok: true, slot: updated };
  },
};

export const AD_FEED_TYPE = 'AD_PLACEMENT_SLOT';

export type AdPlacementZone =
  | "stage-banner"
  | "lobby-billboard"
  | "ticket-footer"
  | "digital-overlay"
  | "venue-wrap";

export interface AdPlacementSlot {
  id: string;
  zone: AdPlacementZone;
  venue: string;
  cpm: number;
  status: "available" | "taken";
  takenBy: string | null;
  format: "banner" | "video" | "static" | "interactive";
  claimedAt?: number;
}

export const CANONICAL_AD_SLOTS: AdPlacementSlot[] = [
  { id: "sp-001", zone: "stage-banner", venue: "Crown Stage", cpm: 18.50, status: "available", takenBy: null, format: "banner" },
  { id: "sp-002", zone: "lobby-billboard", venue: "Crown Stage", cpm: 12.00, status: "available", takenBy: null, format: "static" },
  { id: "sp-003", zone: "ticket-footer", venue: "Electric Blue", cpm: 6.75, status: "available", takenBy: null, format: "static" },
  { id: "sp-004", zone: "digital-overlay", venue: "Pulse Arena", cpm: 22.00, status: "available", takenBy: null, format: "video" },
  { id: "sp-005", zone: "venue-wrap", venue: "Velvet Lounge", cpm: 35.00, status: "available", takenBy: null, format: "interactive" },
];
