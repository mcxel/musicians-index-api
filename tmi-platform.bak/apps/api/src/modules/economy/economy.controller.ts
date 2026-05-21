import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import {
  EconomyService,
  PointTransactionDto,
  CurrencyConvertDto,
} from './economy.service';

@Controller('economy')
export class EconomyController {
  constructor(private readonly economyService: EconomyService) {}

  // ─── GET /economy/balance — current user's balance ───────────────────────────
  @Get('balance')
  @UseGuards(AuthGuard)
  getBalance(@Request() req: any) {
    return this.economyService.getBalance(req.user.id);
  }

  // ─── GET /economy/balance/:userId — any user's balance (admin) ───────────────
  @Get('balance/:userId')
  @UseGuards(AuthGuard, AdminGuard)
  getBalanceById(@Param('userId') userId: string) {
    return this.economyService.getBalance(userId);
  }

  // ─── GET /economy/points — current user's points ─────────────────────────────
  @Get('points')
  @UseGuards(AuthGuard)
  getPoints(@Request() req: any) {
    return this.economyService.getUserPoints(req.user.id).then((points) => ({ points }));
  }

  // ─── POST /economy/points/award — award points to current user ───────────────
  @Post('points/award')
  @UseGuards(AuthGuard)
  awardPoints(@Request() req: any, @Body() body: { action: PointTransactionDto['action'] }) {
    const dto: PointTransactionDto = { userId: req.user.id, action: body.action };
    return this.economyService.awardPoints(dto);
  }

  // ─── POST /economy/points/award/:userId — admin award points to any user ─────
  @Post('points/award/:userId')
  @UseGuards(AuthGuard, AdminGuard)
  awardPointsToUser(
    @Param('userId') userId: string,
    @Body() body: { action: PointTransactionDto['action'] },
  ) {
    const dto: PointTransactionDto = { userId, action: body.action };
    return this.economyService.awardPoints(dto);
  }

  // ─── POST /economy/points/redeem — redeem points for current user ─────────────
  @Post('points/redeem')
  @UseGuards(AuthGuard)
  redeemPoints(
    @Request() req: any,
    @Body() body: { points: number; reason: string },
  ) {
    return this.economyService.redeemPoints(req.user.id, body.points, body.reason);
  }

  // ─── GET /economy/leaderboard — points leaderboard ───────────────────────────
  @Get('leaderboard')
  getLeaderboard(@Query('limit') limit?: string) {
    return this.economyService.getPointsLeaderboard(limit ? parseInt(limit, 10) : 20);
  }

  // ─── GET /economy/tiers — subscription tier definitions ──────────────────────
  @Get('tiers')
  getSubscriptionTiers() {
    return this.economyService.getSubscriptionTiers();
  }

  // ─── GET /economy/rules — point action rules ──────────────────────────────────
  @Get('rules')
  getPointRules() {
    return this.economyService.getPointRules();
  }

  // ─── GET /economy/currencies — supported currencies ───────────────────────────
  @Get('currencies')
  getSupportedCurrencies() {
    return this.economyService.getSupportedCurrencies();
  }

  // ─── POST /economy/convert — currency conversion ──────────────────────────────
  @Post('convert')
  convertCurrency(@Body() dto: CurrencyConvertDto) {
    return this.economyService.convertCurrency(dto);
  }

  // ─── GET /economy/stats — admin economy stats ─────────────────────────────────
  @Get('stats')
  @UseGuards(AuthGuard, AdminGuard)
  getEconomyStats() {
    return this.economyService.getEconomyStats();
  }
}
