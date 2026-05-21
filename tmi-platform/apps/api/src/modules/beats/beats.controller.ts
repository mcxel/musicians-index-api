import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { BeatsService } from './beats.service';

const SESSION_COOKIE = 'phase11_session';

@Controller('beats')
export class BeatsController {
  constructor(
    private readonly beatsService: BeatsService,
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
    return { status: 'ok', module: 'beats' };
  }

  @Get()
  listBeats(@Query('genre') genre?: string, @Query('status') status?: string) {
    return this.beatsService.listBeats({ genre, status });
  }

  @Get('my')
  async getMyBeats(@Req() req: Request) {
    const userId = await this.requireSessionUserId(req);
    return this.beatsService.getProducerBeats(userId);
  }

  @Get(':id')
  getBeat(@Param('id') id: string) {
    return this.beatsService.getBeat(id);
  }

  @Post('submit')
  async submitBeat(
    @Req() req: Request,
    @Body() body: {
      title: string;
      genre: string;
      bpm: number;
      key?: string;
      tags?: string[];
      basicPrice: number;
      premiumPrice: number;
      exclusivePrice?: number;
      previewUrl?: string;
      taggedUrl?: string;
    },
  ) {
    const userId = await this.requireSessionUserId(req);
    return this.beatsService.submitBeat(userId, body);
  }

  @Patch(':id/approve')
  async approveBeat(@Req() req: Request, @Param('id') id: string) {
    await this.requireSessionUserId(req);
    return this.beatsService.approveBeat(id);
  }

  @Post(':id/play')
  incrementPlay(@Param('id') id: string) {
    return this.beatsService.incrementPlayCount(id);
  }
}
