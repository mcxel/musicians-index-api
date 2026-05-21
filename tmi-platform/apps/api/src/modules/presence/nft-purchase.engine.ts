import { Injectable, Logger, NotImplementedException } from '@nestjs/common';

/**
 * NFT purchase stub — NftListing / NftAsset models are not yet in the Prisma schema.
 * Full engine activates once the NFT schema migration is applied.
 */
@Injectable()
export class NftPurchaseEngine {
  private readonly logger = new Logger(NftPurchaseEngine.name);

  async executePurchase(buyerId: string, listingId: string): Promise<never> {
    this.logger.warn(`executePurchase by ${buyerId} for listing ${listingId} — NFT schema not yet live`);
    throw new NotImplementedException('NFT purchases require NFT schema migration');
  }
}
