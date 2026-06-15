export interface SponsorSlot {
  id: string;
  zone: string;
  priceUsd: number;
  status: 'AVAILABLE' | 'SOLD' | 'PENDING';
}

export class SponsorSlotRegistry {
  static async getAvailableSlots(): Promise<SponsorSlot[]> {
    // TODO: Wire to prisma.adSlot when schema migration add_sponsor_ad_models completes
    return [
      { id: 'slot-1', zone: 'home-1-top', priceUsd: 500, status: 'AVAILABLE' },
      { id: 'slot-2', zone: 'performer-hub', priceUsd: 150, status: 'AVAILABLE' },
      { id: 'slot-3', zone: 'magazine-sidebar', priceUsd: 250, status: 'AVAILABLE' }
    ];
  }
}

export class PerformerSponsorRegistry {
  static async getSponsorsForPerformer(performerId: string) {
    return [
      { id: 'sp-1', name: 'BeatLab Studios', targetId: performerId, amountUsd: 200, status: 'ACTIVE' },
      { id: 'sp-2', name: 'Velocity Audio', targetId: performerId, amountUsd: 500, status: 'ACTIVE' }
    ];
  }
}