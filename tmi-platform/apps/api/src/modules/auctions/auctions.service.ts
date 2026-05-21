import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CreateAuctionDto {
  title: string;
  description?: string;
  assetType: string;
  assetRef?: string;
  reservePrice: number;
  buyoutPrice?: number;
  endsAt: string;
}

@Injectable()
export class AuctionsService {
  constructor(private readonly prisma: PrismaService) {}

  async listAuctions(status?: string) {
    return this.prisma.auction.findMany({
      where: { status: status ?? { in: ['ACTIVE', 'ENDING_SOON', 'SCHEDULED'] } },
      include: { _count: { select: { bids: true } } },
      orderBy: { endsAt: 'asc' },
    });
  }

  async getAuction(id: string) {
    const auction = await this.prisma.auction.findUnique({
      where: { id },
      include: {
        bids: { orderBy: { amountCents: 'desc' }, take: 20 },
        _count: { select: { bids: true } },
      },
    });
    if (!auction) throw new NotFoundException('Auction not found');
    return auction;
  }

  async createAuction(sellerId: string, dto: CreateAuctionDto) {
    if (!dto.title?.trim()) throw new BadRequestException('Title required');
    if (dto.reservePrice < 0) throw new BadRequestException('Reserve price must be non-negative');

    return this.prisma.auction.create({
      data: {
        title: dto.title.trim(),
        description: dto.description,
        assetType: dto.assetType,
        assetRef: dto.assetRef,
        sellerId,
        reservePrice: Math.round(dto.reservePrice),
        buyoutPrice: dto.buyoutPrice ? Math.round(dto.buyoutPrice) : null,
        endsAt: new Date(dto.endsAt),
        status: 'SCHEDULED',
      },
    });
  }

  async placeBid(auctionId: string, bidderId: string, amountCents: number) {
    const auction = await this.prisma.auction.findUnique({ where: { id: auctionId } });
    if (!auction) throw new NotFoundException('Auction not found');

    if (auction.status === 'ENDED' || auction.status === 'CANCELLED') {
      throw new BadRequestException('Auction is no longer active');
    }
    if (auction.endsAt < new Date()) {
      throw new BadRequestException('Auction has ended');
    }
    if (auction.sellerId === bidderId) {
      throw new BadRequestException('Seller cannot bid on their own auction');
    }
    if (amountCents <= auction.currentBid) {
      throw new BadRequestException(`Bid must exceed current bid of ${auction.currentBid} cents`);
    }
    if (amountCents < auction.reservePrice) {
      throw new BadRequestException(`Bid must meet reserve price of ${auction.reservePrice} cents`);
    }

    const isBuyout = auction.buyoutPrice !== null && amountCents >= auction.buyoutPrice;

    const [bid, updatedAuction] = await this.prisma.$transaction(async (tx) => {
      await tx.auctionBid.updateMany({
        where: { auctionId, isWinning: true },
        data: { isWinning: false },
      });

      const newBid = await tx.auctionBid.create({
        data: {
          auctionId,
          bidderId,
          amountCents,
          isWinning: true,
        },
      });

      const updated = await tx.auction.update({
        where: { id: auctionId },
        data: {
          currentBid: amountCents,
          status: isBuyout ? 'ENDED' : auction.status,
        },
      });

      return [newBid, updated];
    });

    return {
      success: true,
      bidId: bid.id,
      auctionId,
      amountCents,
      currentBid: updatedAuction.currentBid,
      isBuyout,
      status: updatedAuction.status,
    };
  }

  async cancelAuction(auctionId: string, adminId: string) {
    const auction = await this.prisma.auction.findUnique({ where: { id: auctionId } });
    if (!auction) throw new NotFoundException('Auction not found');
    if (auction.status === 'ENDED') throw new ConflictException('Auction already ended');

    return this.prisma.auction.update({
      where: { id: auctionId },
      data: { status: 'CANCELLED' },
    });
  }
}
