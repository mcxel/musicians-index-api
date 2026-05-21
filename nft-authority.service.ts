import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CommerceAuthorityService } from '../presence/commerce-authority.service';

@Injectable()
export class NftAuthorityService {
  private readonly logger = new Logger(NftAuthorityService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly commerce: CommerceAuthorityService,
  ) {}

  async mint(creatorId: string, collectionId: string, metadataUrl: string, assetType: string, originalAssetId?: string) {
    this.logger.log(`Minting new NFT in collection ${collectionId} by ${creatorId}`);
    // In a real implementation, this would interact with a blockchain service (e.g., Alchemy, Infura)
    // For now, we simulate the mint and record it in our database.

    const asset = await this.prisma.nFTAsset.create({
      data: {
        collectionId,
        tokenId: await this.getNextTokenId(collectionId),
        metadataUrl,
        assetType,
        originalAssetId,
        owner: { create: { userId: creatorId } },
        transactions: {
          create: {
            transactionType: 'MINT',
            toUserId: creatorId,
            txHash: `simulated_mint_${Date.now()}`,
          },
        },
      },
    });

    return asset;
  }

  async transfer(fromUserId: string, toUserId: string, assetId: string) {
    const ownership = await this.prisma.nFTOwnership.findUnique({ where: { assetId } });
    if (!ownership || ownership.userId !== fromUserId) {
      throw new ForbiddenException('User does not own this asset.');
    }

    await this.prisma.nFTOwnership.update({
      where: { assetId },
      data: { userId: toUserId },
    });

    await this.prisma.nFTTransaction.create({
      data: {
        assetId,
        transactionType: 'TRANSFER',
        fromUserId,
        toUserId,
        txHash: `simulated_transfer_${Date.now()}`,
      },
    });

    this.logger.log(`Transferred NFT ${assetId} from ${fromUserId} to ${toUserId}`);
    return { status: 'SUCCESS' };
  }

  private async getNextTokenId(collectionId: string): Promise<number> {
    const lastAsset = await this.prisma.nFTAsset.findFirst({
      where: { collectionId },
      orderBy: { tokenId: 'desc' },
    });
    return (lastAsset?.tokenId || 0) + 1;
  }
}