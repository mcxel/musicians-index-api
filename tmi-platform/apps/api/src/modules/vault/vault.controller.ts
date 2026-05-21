import { Controller, ForbiddenException, Get, Param, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { VaultService } from './vault.service';

const SESSION_COOKIE = 'phase11_session';

@Controller('vault')
export class VaultController {
  constructor(
    private readonly vaultService: VaultService,
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

  @Get()
  async getMyVault(@Req() req: Request) {
    const userId = await this.requireSessionUserId(req);
    return this.vaultService.getUserVault(userId);
  }

  @Get(':id')
  async getVaultItem(@Req() req: Request, @Param('id') id: string) {
    const userId = await this.requireSessionUserId(req);
    return this.vaultService.getVaultItem(userId, id);
  }

  @Post(':id/download')
  async requestDownload(@Req() req: Request, @Param('id') id: string) {
    const userId = await this.requireSessionUserId(req);
    return this.vaultService.requestDownload(userId, id);
  }
}
