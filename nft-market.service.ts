import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NftPurchaseEngine } from './nft-purchase.engine';

@Injectable()
export class NftMarketService {
  private readonly logger = new Logger(NftMarketService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly purchaseEngine: NftPurchaseEngine,
  ) {}

  async listForSale(sellerId: string, assetId: string, price: number, expiresAt: Date) {
    const ownership = await this.prisma.nFTOwnership.findUnique({ where: { assetId } });
    if (!ownership || ownership.userId !== sellerId) {
      throw new ForbiddenException('Only the owner can list this asset for sale.');
    }

    const listing = await this.prisma.nFTListing.create({
      data: {
        assetId,
        sellerId,
        price,
        expiresAt,
      },
    });

    this.logger.log(`NFT ${assetId} listed for sale by ${sellerId} for ${price}`);
    return listing;
  }

  async buy(buyerId: string, listingId: string) {
    // Delegate all complex purchase logic to the dedicated engine
    return this.purchaseEngine.executePurchase(buyerId, listingId);
  }
}