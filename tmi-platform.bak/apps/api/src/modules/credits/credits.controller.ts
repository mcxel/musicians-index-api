import { Body, Controller, Get, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { CreditsService } from './credits.service';

const SESSION_COOKIE = 'phase11_session';

@Controller('credits')
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Get('balance')
  balance(@Req() req: Request) {
    return this.creditsService.balance(req.cookies?.[SESSION_COOKIE]);
  }

  @Post('purchase')
  @HttpCode(200)
  purchase(@Req() req: Request, @Body() body: { bundleId: '100' | '500' | '1500' }) {
    return this.creditsService.purchase(req.cookies?.[SESSION_COOKIE], body.bundleId);
  }

  @Post('spend')
  @HttpCode(200)
  spend(@Req() req: Request, @Body() body: { amount: number; purpose: string }) {
    return this.creditsService.spend(req.cookies?.[SESSION_COOKIE], body.amount, body.purpose);
  }
}
