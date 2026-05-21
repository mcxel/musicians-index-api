import { Controller, ForbiddenException, Get, Param, Req } from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { ProducerService } from './producer.service';

const SESSION_COOKIE = 'phase11_session';

@Controller('producer')
export class ProducerController {
  constructor(
    private readonly producerService: ProducerService,
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

  @Get('stats')
  async getMyStats(@Req() req: Request) {
    const userId = await this.requireSessionUserId(req);
    return this.producerService.getStats(userId);
  }

  @Get('stats/:producerId')
  async getProducerStats(@Param('producerId') producerId: string) {
    return this.producerService.getStats(producerId);
  }
}
