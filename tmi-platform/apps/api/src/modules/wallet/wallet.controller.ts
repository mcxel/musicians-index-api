import { Body, Controller, Get, HttpCode, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { WalletService } from './wallet.service';

const SESSION_COOKIE = 'phase11_session';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  getWallet(@Req() req: Request) {
    return this.walletService.getWallet(req.cookies?.[SESSION_COOKIE]);
  }

  @Get('transactions')
  getTransactions(
    @Req() req: Request,
    @Query('limit') limit = '20',
    @Query('cursor') cursor?: string,
  ) {
    return this.walletService.getTransactions(req.cookies?.[SESSION_COOKIE], parseInt(limit, 10) || 20, cursor);
  }

  @Post('payout-request')
  @HttpCode(200)
  payoutRequest(@Req() req: Request, @Body() body: { amount: number }) {
    return this.walletService.payoutRequest(req.cookies?.[SESSION_COOKIE], body.amount);
  }

  @Get('payout-status')
  payoutStatus(@Req() req: Request) {
    return this.walletService.payoutStatus(req.cookies?.[SESSION_COOKIE]);
  }

  @Post('payout-onboard')
  @HttpCode(200)
  payoutOnboard(@Req() req: Request) {
    return this.walletService.payoutOnboard(req.cookies?.[SESSION_COOKIE]);
  }
}
