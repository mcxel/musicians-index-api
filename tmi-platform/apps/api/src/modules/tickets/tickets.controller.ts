import { Body, Controller, ForbiddenException, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { TicketsService } from './tickets.service';
import { VerifyTicketDto } from './dto/verify.dto';
import { CheckInTicketDto } from './dto/checkin.dto';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly tickets: TicketsService) {}

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
}
