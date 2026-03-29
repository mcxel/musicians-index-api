import { Body, Controller, ForbiddenException, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { TicketsService } from './tickets.service';
import { VerifyTicketDto } from './dto/verify.dto';
import { CheckInTicketDto } from './dto/checkin.dto';
import { PrismaService } from '../prisma/prisma.service';

@Controller('tickets')
export class TicketsController {
  constructor(
    private readonly tickets: TicketsService,
    private readonly prisma: PrismaService,
  ) {}

  private async requireSessionUserId(req: Request): Promise<string> {
    const sessionToken = req.cookies?.phase11_session as string | undefined;
    if (!sessionToken) {
      throw new ForbiddenException('Authentication required');
    }
    const session = await this.prisma.session.findUnique({
      where: { sessionToken },
      select: { userId: true, expires: true },
    });
    if (!session || session.expires < new Date()) {
      throw new ForbiddenException('Authentication required');
    }
    return session.userId;
  }

  private requireOperatorAccess(req: Request) {
    const configuredKey = process.env.TICKETS_OPERATOR_KEY?.trim();
    const isProd = process.env.NODE_ENV === 'production';

    if (!configuredKey) {
      if (isProd) {
        throw new ForbiddenException('Tickets endpoints are disabled in production without TICKETS_OPERATOR_KEY');
      }
      return;
    }

    const providedKey = req.header('x-operator-key');
    if (!providedKey || providedKey !== configuredKey) {
      throw new ForbiddenException('Invalid operator key');
    }
  }

  @Post('verify')
  async verify(@Req() req: Request, @Body() dto: VerifyTicketDto) {
    this.requireOperatorAccess(req);
    return this.tickets.verify(dto.token);
  }

  @Post('checkin')
  async checkin(@Req() req: Request, @Body() dto: CheckInTicketDto) {
    this.requireOperatorAccess(req);
    return this.tickets.checkIn(dto.token);
  }

  @Post('purchase-check')
  async purchaseCheck(
    @Req() req: Request,
    @Body() dto: { eventId: string; quantity: number; turnstileToken: string },
  ) {
    const userId = await this.requireSessionUserId(req);
    return this.tickets.purchaseCheck(userId, dto.eventId, dto.quantity, dto.turnstileToken);
  }
}
