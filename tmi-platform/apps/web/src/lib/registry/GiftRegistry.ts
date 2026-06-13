export interface Gift {
  id: string;
  name: string;
  cost: number; // XP or credits
  animationUrl: string;
}

class GiftRegistry {
  private gifts: Map<string, Gift> = new Map();

  register(gift: Gift) {
    this.gifts.set(gift.id, gift);
  }

  getGift(id: string) {
    return this.gifts.get(id);
  }

  getAllGifts() {
    return Array.from(this.gifts.values());
  }
}

export const giftRegistry = new GiftRegistry();