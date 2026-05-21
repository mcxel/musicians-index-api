import { Body, Controller, ForbiddenException, Get, Param, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { FulfillmentService } from './fulfillment.service';

const SESSION_COOKIE = 'phase11_session';

@Controller('orders')
export class FulfillmentController {
  constructor(
    private readonly fulfillmentService: FulfillmentService,
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
    return { status: 'ok', module: 'fulfillment' };
  }

  @Get()
  async getMyOrders(@Req() req: Request) {
    const userId = await this.requireSessionUserId(req);
    return this.fulfillmentService.getOrders(userId);
  }

  @Get(':id')
  async getOrder(@Req() req: Request, @Param('id') id: string) {
    await this.requireSessionUserId(req);
    return this.fulfillmentService.getOrderById(id);
  }

  @Post(':id/ship')
  async markShipped(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: { trackingNumber: string; carrier: string },
  ) {
    await this.requireSessionUserId(req);
    return this.fulfillmentService.markShipped(id, body.trackingNumber, body.carrier);
  }

  @Post(':id/tracking')
  async updateTracking(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: { trackingNumber: string; carrier: string },
  ) {
    await this.requireSessionUserId(req);
    return this.fulfillmentService.updateTracking(id, body.trackingNumber, body.carrier);
  }

  @Post(':id/deliver')
  async markDelivered(@Req() req: Request, @Param('id') id: string) {
    await this.requireSessionUserId(req);
    return this.fulfillmentService.markDelivered(id);
  }
}
