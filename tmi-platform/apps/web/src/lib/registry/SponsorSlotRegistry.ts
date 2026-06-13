export interface SponsorSlot {
  id: string;
  name: string;
  type: 'banner' | 'video' | 'overlay';
  available: boolean;
  price: number;
}

class SponsorSlotRegistry {
  private slots: Map<string, SponsorSlot> = new Map();

  register(slot: SponsorSlot) {
    this.slots.set(slot.id, slot);
  }

  getSlot(id: string) {
    return this.slots.get(id);
  }

  getAllSlots() {
    return Array.from(this.slots.values());
  }
}

export const sponsorSlotRegistry = new SponsorSlotRegistry();