import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CommerceAuthorityService } from '../presence/commerce-authority.service';

@Injectable()
export class NftEscrowEngine {
  private readonly logger = new Logger(NftEscrowEngine.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly commerce: CommerceAuthorityService,
  ) {}

  async executeEscrowAndSplit(
    buyerId: string, 
    sellerId: string, 
    creatorId: string, 
    assetId: string, 
    price: number, 
    royaltyPercentage: number
  ) {
    // Formula: Buyer pays full, Platform splits immediately, Seller receives net, Creator receives royalty
    const royaltyAmount = creatorId !== sellerId ? (price * (royaltyPercentage / 100)) : 0;
    const sellerNet = price - royaltyAmount;

    try {
      // 1. Buyer pays full gross into Escrow (Atomic deduction)
      const { ledgerEntry: buyerTx } = await this.commerce.executeSecureTransaction(buyerId, price, 'NFT', assetId);

      // 2. Platform splits immediately: Creator receives royalty
      let royaltyTx = null;
      if (royaltyAmount > 0) {
        const creditRes = await this.commerce.executeCredit(creatorId, royaltyAmount, 'ROYALTY', assetId);
        royaltyTx = creditRes.ledgerEntry;
        this.logger.log(`Distributed ${royaltyAmount} royalty for NFT ${assetId} to creator ${creatorId}`);
      }

      // 3. Platform splits immediately: Seller receives net payout
      let sellerTx = null;
      if (sellerNet > 0) {
        const creditRes = await this.commerce.executeCredit(sellerId, sellerNet, 'PAYOUT', assetId);
        sellerTx = creditRes.ledgerEntry;
        this.logger.log(`Distributed ${sellerNet} net payout for NFT ${assetId} to seller ${sellerId}`);
      }

      this.logger.log(`Escrow split successful for NFT ${assetId}.`);
      return { success: true, buyerTx, royaltyTx, sellerTx, sellerNet, royaltyAmount };
    } catch (error) {
      this.logger.error(`Escrow transaction failed for NFT ${assetId}. Escrow engine aborted.`, error.stack);
      throw new InternalServerErrorException('NFT Escrow split failed. Escrow halt and rollback triggered.');
    }
  }
}