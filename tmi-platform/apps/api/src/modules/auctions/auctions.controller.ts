import { Body, Controller, ForbiddenException, Get, Param, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { AuctionsService } from './auctions.service';

const SESSION_COOKIE = 'phase11_session';

@Controller('auctions')
export class AuctionsController {
  constructor(
    private readonly auctionsService: AuctionsService,
    private readonly prisma: PrismaService,
  ) {}

  private async requireSessionUserId(req: Request): Promise<string> {
    const sessionToken = req.cookies?.[SESSION_COOKIE] as string | undefined;
    if (!sessionToken) throw new ForbiddenException('Authentication required');
    const session = await this.prisma.session.findUnique({
      where: { sessionToken },
      select: { userId: true, expires: true },
    });
    if (!session || session.expires < new Date()) throw new ForbiddenException('Authentication required');
    return session.userId;
  }

  @Get('health')
  health() {
    return { status: 'ok', module: 'auctions' };
  }

  @Get()
  listAuctions(@Query('status') status?: string) {
    return this.auctionsService.listAuctions(status);
  }

  @Get(':id')
  getAuction(@Param('id') id: string) {
    return this.auctionsService.getAuction(id);
  }

  @Post()
  async createAuction(
    @Req() req: Request,
    @Body() body: {
      title: string;
      description?: string;
      assetType: string;
      assetRef?: string;
      reservePrice: number;
      buyoutPrice?: number;
      endsAt: string;
    },
  ) {
    const userId = await this.requireSessionUserId(req);
    return this.auctionsService.createAuction(userId, body);
  }

  @Post(':id/bid')
  async placeBid(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() body: { amountCents: number },
  ) {
    const userId = await this.requireSessionUserId(req);
    return this.auctionsService.placeBid(id, userId, body.amountCents);
  }

  @Post(':id/cancel')
  async cancelAuction(@Param('id') id: string, @Req() req: Request) {
    const userId = await this.requireSessionUserId(req);
    return this.auctionsService.cancelAuction(id, userId);
  }
}
